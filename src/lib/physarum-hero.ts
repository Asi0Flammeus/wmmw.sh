/**
 * Physarum hero simulation (Jones model, CPU).
 *
 * Ported verbatim from the validated mockup D sim: a Float32Array trail field
 * at low internal resolution, CSS-upscaled by the canvas; ~6-12k agents; a
 * single-pass 3x3 blur folded into evaporation; a warm umber-to-gold LUT for
 * the render. The per-frame `step()` allocates nothing (trail buffers are
 * swapped, never reallocated; the image buffer is reused).
 *
 * Public seam is deliberately narrow: `mountHeroSim(canvas)` returns a handle
 * with `destroy()`. No CPU internals leak, so a later WebGL2 transform-feedback
 * port can swap the module body behind the same interface (spec 2.1, 6).
 *
 * Lifecycle: boots after first paint (requestIdleCallback, setTimeout fallback);
 * pauses when the document is hidden and when the canvas is offscreen
 * (IntersectionObserver). Under reduced motion (no `html.anim`) it runs 300
 * steps synchronously, draws once, and freezes (spec 2.1, 4).
 */

export interface HeroSim {
  destroy(): void;
}

interface IdleWindow {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
}

export function mountHeroSim(canvas: HTMLCanvasElement): HeroSim {
  const ctx = canvas.getContext("2d", { alpha: true });
  const hero = canvas.parentElement;
  if (!ctx || !hero) return { destroy() {} };

  const anim = document.documentElement.classList.contains("anim");

  /* --- Jones-model parameters (validated in mockup D) --- */
  const SD = 7.5; /* sensor distance, cells */
  const SA = 0.4; /* sensor angle, rad */
  const TA = 0.45; /* turn angle, rad */
  const SPEED = 1.0; /* cells per step */
  const DEPOSIT = 0.15;
  const EVAP = 0.94;
  const JIT = 0.12; /* heading jitter keeps the network alive long-run */
  const CAP = 6; /* trail ceiling, prevents runaway trunks */
  const KNEE = 0.8; /* soft-knee tone mapping: n = v / (v + KNEE) */
  const cosSA = Math.cos(SA);
  const sinSA = Math.sin(SA);
  const cosTA = Math.cos(TA);
  const sinTA = Math.sin(TA);
  const TAU = Math.PI * 2;

  /* warm umber-to-gold colormap, packed 0xAABBGGRR for the Uint32 buffer */
  const LUT = buildLut();

  let W = 0;
  let H = 0;
  let CELLS = 0;
  let N = 0;
  let RESPAWN = 0;
  let trail = new Float32Array(0);
  let tmp = new Float32Array(0);
  let ag = new Float32Array(0);
  let img: ImageData | null = null;
  let buf32 = new Uint32Array(0);

  function init(): void {
    const vw = hero!.clientWidth || window.innerWidth;
    const vh = hero!.clientHeight || window.innerHeight;
    const aspect = vw / Math.max(1, vh);
    if (aspect >= 1) {
      W = 320;
      H = Math.max(110, Math.round(320 / aspect));
    } else {
      H = 300;
      W = Math.max(120, Math.round(300 * aspect));
    }
    canvas.width = W;
    canvas.height = H;
    CELLS = W * H;
    trail = new Float32Array(CELLS);
    tmp = new Float32Array(CELLS);
    img = ctx!.createImageData(W, H);
    buf32 = new Uint32Array(img.data.buffer);
    N = Math.min(12000, Math.max(6000, Math.round(CELLS * 0.18)));
    RESPAWN = Math.max(1, (N * 0.002) | 0);
    ag = new Float32Array(N * 3);
    seed();
  }

  /* seed a dominant ring plus two small colonies so a network forms within ~5s */
  function seed(): void {
    const cx = W * 0.62;
    const cy = H * 0.46;
    const R = Math.min(W, H) * 0.32;
    const nRing = Math.floor(N * 0.6);
    let k = 0;
    let i: number;
    let a: number;
    let rr: number;
    for (i = 0; i < nRing; i++) {
      a = Math.random() * TAU;
      rr = R * (0.92 + Math.random() * 0.16);
      ag[k++] = (cx + Math.cos(a) * rr + W) % W;
      ag[k++] = (cy + Math.sin(a) * rr + H) % H;
      ag[k++] = a + Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    }
    const c1x = W * 0.25;
    const c1y = H * 0.72;
    const c2x = W * 0.86;
    const c2y = H * 0.24;
    const cr = Math.min(W, H) * 0.08;
    for (i = nRing; i < N; i++) {
      const even = (i & 1) === 0;
      a = Math.random() * TAU;
      rr = cr * Math.sqrt(Math.random());
      ag[k++] = ((even ? c1x : c2x) + Math.cos(a) * rr + W) % W;
      ag[k++] = ((even ? c1y : c2y) + Math.sin(a) * rr + H) % H;
      ag[k++] = Math.random() * TAU;
    }
  }

  function sense(sx: number, sy: number): number {
    let xi = sx | 0;
    let yi = sy | 0;
    if (xi < 0) xi += W;
    else if (xi >= W) xi -= W;
    if (yi < 0) yi += H;
    else if (yi >= H) yi -= H;
    return trail[yi * W + xi]!;
  }

  /* one simulation tick: sense, turn, move, deposit, then blur+evaporate.
     zero allocations here: agent + trail buffers are reused, trail/tmp swap. */
  function step(): void {
    let i: number;
    let j: number;
    let x: number;
    let y: number;
    let h: number;
    let ch: number;
    let sh: number;
    let f: number;
    let l: number;
    let r: number;
    let d: number;
    let s: number;
    let c2: number;
    let s2: number;
    let ti: number;
    let nv: number;
    for (i = 0; i < N; i++) {
      j = i * 3;
      x = ag[j]!;
      y = ag[j + 1]!;
      h = ag[j + 2]! + (Math.random() - 0.5) * JIT;
      ch = Math.cos(h);
      sh = Math.sin(h);
      f = sense(x + ch * SD, y + sh * SD);
      l = sense(x + (ch * cosSA + sh * sinSA) * SD, y + (sh * cosSA - ch * sinSA) * SD);
      r = sense(x + (ch * cosSA - sh * sinSA) * SD, y + (sh * cosSA + ch * sinSA) * SD);
      if (f >= l && f >= r) d = 0;
      else if (l > f && r > f) d = Math.random() < 0.5 ? -TA : TA;
      else if (l > r) d = -TA;
      else d = TA;
      if (d !== 0) {
        s = d > 0 ? sinTA : -sinTA;
        c2 = ch * cosTA - sh * s;
        s2 = sh * cosTA + ch * s;
        ch = c2;
        sh = s2;
        h += d;
      }
      x += ch * SPEED;
      y += sh * SPEED;
      if (x < 0) x += W;
      else if (x >= W) x -= W;
      if (y < 0) y += H;
      else if (y >= H) y -= H;
      ag[j] = x;
      ag[j + 1] = y;
      ag[j + 2] = h;
      ti = (y | 0) * W + (x | 0);
      nv = trail[ti]! + DEPOSIT;
      trail[ti] = nv > CAP ? CAP : nv;
    }
    for (i = 0; i < RESPAWN; i++) {
      j = ((Math.random() * N) | 0) * 3;
      ag[j] = Math.random() * W;
      ag[j + 1] = Math.random() * H;
      ag[j + 2] = Math.random() * TAU;
    }
    const E9 = EVAP / 9;
    let yy: number;
    let xx: number;
    let y0: number;
    let y1: number;
    let y2: number;
    let x0: number;
    let x2: number;
    for (yy = 0; yy < H; yy++) {
      y0 = ((yy - 1 + H) % H) * W;
      y1 = yy * W;
      y2 = ((yy + 1) % H) * W;
      for (xx = 0; xx < W; xx++) {
        x0 = xx === 0 ? W - 1 : xx - 1;
        x2 = xx === W - 1 ? 0 : xx + 1;
        tmp[y1 + xx] =
          (trail[y0 + x0]! +
            trail[y0 + xx]! +
            trail[y0 + x2]! +
            trail[y1 + x0]! +
            trail[y1 + xx]! +
            trail[y1 + x2]! +
            trail[y2 + x0]! +
            trail[y2 + xx]! +
            trail[y2 + x2]!) *
          E9;
      }
    }
    const swap = trail;
    trail = tmp;
    tmp = swap;
  }

  function render(): void {
    for (let i = 0; i < CELLS; i++) {
      const v = trail[i]!;
      buf32[i] = LUT[((v / (v + KNEE)) * 255) | 0]!;
    }
    ctx!.putImageData(img!, 0, 0);
  }

  /* --- animation loop, gated on visibility --- */
  let rafId = 0;
  let last = 0;
  let running = false;
  let heroVisible = true;

  function frame(ts: number): void {
    rafId = requestAnimationFrame(frame);
    if (ts - last < 29) return; /* cap ~34fps; step measured ~3ms */
    last = ts;
    step();
    render();
  }
  function start(): void {
    if (running || !anim) return;
    running = true;
    last = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stop(): void {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
  }
  function update(): void {
    if (!document.hidden && heroVisible) start();
    else stop();
  }
  function freezeFrame(): void {
    for (let s = 0; s < 300; s++) step();
    render();
  }

  /* --- boot after first paint; keep sim work off the LCP critical path --- */
  let io: IntersectionObserver | null = null;
  let resizeTimer = 0;
  let bootHandle = 0;
  let bootIsIdle = false;
  const idleWin = window as unknown as IdleWindow;

  function onVisibility(): void {
    update();
  }
  function onResize(): void {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const vw = hero!.clientWidth || window.innerWidth;
      const vh = hero!.clientHeight || window.innerHeight;
      const a = vw / Math.max(1, vh);
      const cur = W / H;
      if (Math.abs(a - cur) / cur > 0.25) {
        init();
        if (!anim) freezeFrame();
      }
    }, 300);
  }

  function boot(): void {
    init();
    if (!anim) {
      /* reduced motion: settle to a designed static frame, then freeze */
      freezeFrame();
    } else {
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(
          (entries) => {
            heroVisible = entries[0]!.isIntersecting;
            update();
          },
          { threshold: 0, rootMargin: "120px 0px" },
        );
        io.observe(canvas);
      }
      document.addEventListener("visibilitychange", onVisibility);
      update();
    }
    window.addEventListener("resize", onResize);
  }

  if (typeof idleWin.requestIdleCallback === "function") {
    bootIsIdle = true;
    bootHandle = idleWin.requestIdleCallback(boot, { timeout: 1000 });
  } else {
    bootHandle = window.setTimeout(boot, 60);
  }

  return {
    destroy(): void {
      if (bootHandle) {
        if (bootIsIdle && typeof idleWin.cancelIdleCallback === "function") {
          idleWin.cancelIdleCallback(bootHandle);
        } else if (!bootIsIdle) {
          clearTimeout(bootHandle);
        }
        bootHandle = 0;
      }
      stop();
      clearTimeout(resizeTimer);
      if (io) {
        io.disconnect();
        io = null;
      }
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    },
  };
}

/** Build the 256-entry warm umber-to-gold colormap (0xAABBGGRR). */
function buildLut(): Uint32Array {
  const stops: [number, number, number, number, number][] = [
    [0.0, 18, 16, 13, 0],
    [0.05, 31, 23, 14, 0],
    [0.16, 47, 33, 18, 110],
    [0.35, 107, 74, 30, 185],
    [0.55, 168, 120, 48, 235],
    [0.78, 217, 162, 74, 255],
    [1.0, 236, 203, 127, 255],
  ];
  const lut = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let s0 = stops[0]!;
    let s1 = stops[stops.length - 1]!;
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s]![0] && t <= stops[s + 1]![0]) {
        s0 = stops[s]!;
        s1 = stops[s + 1]!;
        break;
      }
    }
    const f = s1[0] === s0[0] ? 0 : (t - s0[0]) / (s1[0] - s0[0]);
    const rr = (s0[1] + (s1[1] - s0[1]) * f) | 0;
    const gg = (s0[2] + (s1[2] - s0[2]) * f) | 0;
    const bb = (s0[3] + (s1[3] - s0[3]) * f) | 0;
    const aa = (s0[4] + (s1[4] - s0[4]) * f) | 0;
    lut[i] = ((aa << 24) | (bb << 16) | (gg << 8) | rr) >>> 0;
  }
  return lut;
}
