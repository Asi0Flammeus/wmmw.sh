/**
 * W1 · « é source » (spec §5.1, ported from docs/moire/explore/moire/w1-hero.html).
 * Two ring gratings. A sits on the acute accent of the final é. B has pitch
 * p1 * r and its centre follows the smoothed pointer C through the magnifier
 * coupling B = A - (C - A) * (r - 1), so every fringe keeps the radial period
 * P = p1 * r / (r - 1): 260 px from 768 px, 206 px below.
 * Renders on demand: rAF only while unsettled; stops on settle, when hidden,
 * when the hero leaves the viewport. Never live with reduced motion.
 */

interface Rect4 extends Array<number> {
  0: number;
  1: number;
  2: number;
  3: number;
}

const CFG = {
  lerp: 0.18,
  period: 260,
  periodNarrow: 206,
  pitch: 6,
  reach: 720,
  rest: { x: 90, y: 140 },
  pad: 16,
  feather: 64,
  vig: [600, 950] as const,
  /** the field fades in below the name top: nothing above it, nothing in the dock band */
  topEm: 0.15,
  topFeather: 64,
};

const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uDpr;
uniform vec2 uA, uB; uniform float uP1, uP2;
uniform vec3 uInk; uniform float uAlpha;
uniform vec4 uR[12]; uniform int uN;
uniform vec2 uVig; uniform vec2 uClear; uniform vec2 uTop;
out vec4 o;
float ring(vec2 p, vec2 c, float pitch){
  vec2 q = p - c; float l = length(q);
  float v = l / pitch;
  vec2 n = l > 1e-3 ? abs(q) / l : vec2(.7071);
  float fw = (n.x + n.y) / (pitch * uDpr);
  float t = abs(fract(v + .5) - .5);
  float e = max(fw * .75, .07);
  float g = 1. - smoothstep(.25 - e, .25 + e, t);
  return mix(g, .5, smoothstep(.25, .45, fw));
}
float sdBox(vec2 p, vec4 r){ vec2 h = r.zw * .5; vec2 d = abs(p - r.xy - h) - h; return length(max(d, 0.)) + min(max(d.x, d.y), 0.); }
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  float a = 1. - smoothstep(uVig.x, uVig.y, length(p - uA));
  a *= smoothstep(uTop.x, uTop.x + uTop.y, p.y);
  if (a <= 0.) { o = vec4(0.); return; }
  float d = 1e5;
  for (int i = 0; i < 12; i++){
    if (i >= uN) break;
    float b = sdBox(p, uR[i]);
    float h = max(48. - abs(d - b), 0.) / 48.;
    d = min(d, b) - h * h * 12.;
  }
  a *= smoothstep(uClear.x, uClear.y, d);
  if (a <= 0.) { o = vec4(0.); return; }
  a *= ring(p, uA, uP1) * ring(p, uB, uP2);
  a *= uAlpha;
  o = vec4(uInk * a, a);
}`;

const UNIFORMS = ["uRes", "uDpr", "uA", "uB", "uP1", "uP2", "uInk", "uAlpha", "uR", "uN", "uVig", "uClear", "uTop"] as const;
type Uniform = (typeof UNIFORMS)[number];

export interface W1Handle {
  destroy(): void;
  state(): { live: boolean; settled: boolean; frames: number };
  checkClearZones(): number | "static";
}

/** Accent centre of the é from rendered ink: draw é and e, diff, centroid (em from the glyph box top). */
function measureAccent(src: HTMLElement): { x: number; y: number } | null {
  const cs = getComputedStyle(src);
  const size = 160;
  const c = document.createElement("canvas");
  c.width = c.height = 320;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return null;
  x.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  x.textBaseline = "alphabetic";
  const ox = 60;
  const base = 240;
  x.fillText("é", ox, base);
  const a = x.getImageData(0, 0, 320, 320).data;
  x.clearRect(0, 0, 320, 320);
  x.fillText("e", ox, base);
  const b = x.getImageData(0, 0, 320, 320).data;
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let i = 3; i < a.length; i += 4) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d > 40) {
      const p = (i - 3) / 4;
      sx += (p % 320) * d;
      sy += Math.floor(p / 320) * d;
      n += d;
    }
  }
  if (!n) return null;
  const asc = x.measureText("é").fontBoundingBoxAscent;
  return { x: (sx / n - ox) / size, y: (sy / n - (base - asc)) / size };
}

export function mountW1(hero: HTMLElement): W1Handle {
  const root = document.documentElement;
  const canvas0 = hero.querySelector<HTMLCanvasElement>("[data-w1-canvas]");
  const srcEl = hero.querySelector<HTMLElement>(".w1-src");
  const ac = new AbortController();
  const opt = { signal: ac.signal, passive: true } as const;
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mqNarrow = matchMedia("(max-width: 767px)");
  const coarse = matchMedia("(pointer: coarse)").matches;

  let canvas = canvas0;
  let gl: WebGL2RenderingContext | null = null;
  const U = {} as Record<Uniform, WebGLUniformLocation | null>;
  let raf = 0;
  let inView = true;
  let settled = true;
  let lastT = 0;
  let dead = false;
  let live = false;
  let frames = 0;
  let tap: { id: number; x: number; y: number; t: number } | null = null;
  let io: IntersectionObserver | undefined;
  let ro: ResizeObserver | undefined;
  let mo: MutationObserver | undefined;
  const S = {
    A: { x: 0, y: 0 },
    C: { x: 0, y: 0 },
    T: { x: 0, y: 0 },
    rects: [] as Rect4[],
    w: 0,
    h: 0,
    dpr: 1,
    p1: 6,
    r: 1.0236,
    top: 0,
    ink: [0, 0, 0] as [number, number, number],
    alpha: 0.07,
    accent: null as { x: number; y: number } | null,
  };
  const flat = new Float32Array(48);

  function layout(): void {
    if (!srcEl) return;
    const hr = hero.getBoundingClientRect();
    S.w = hr.width;
    S.h = hr.height;
    S.dpr = Math.min(window.devicePixelRatio || 1, 2);
    S.p1 = Math.round(CFG.pitch * S.dpr) / S.dpr;
    const P = mqNarrow.matches ? CFG.periodNarrow : CFG.period;
    S.r = P / (P - S.p1);
    const fs = parseFloat(getComputedStyle(srcEl).fontSize);
    const rg = document.createRange();
    rg.selectNodeContents(srcEl);
    const gr = rg.getBoundingClientRect();
    const acc = S.accent ?? { x: 0.313, y: 0.057 };
    const prev = { ...S.A };
    S.A = { x: gr.left - hr.left + acc.x * fs, y: gr.top - hr.top + acc.y * fs };
    S.top = S.A.y - CFG.topEm * fs;
    const dx = S.A.x - prev.x;
    const dy = S.A.y - prev.y;
    S.C.x += dx;
    S.C.y += dy;
    S.T.x += dx;
    S.T.y += dy;
    /* clear zones: one rect per rendered line of every masked text in the hero (dock pills are glass already) */
    S.rects = [];
    hero.querySelectorAll("[data-w1-mask]").forEach((el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      const lines: { l: number; r: number; t: number; b: number }[] = [];
      for (const b of r.getClientRects()) {
        if (b.width < 1 || b.height < 1) continue;
        const line = lines.find((L) => Math.abs(L.t - b.top) < b.height * 0.5);
        if (line) {
          line.l = Math.min(line.l, b.left);
          line.r = Math.max(line.r, b.right);
          line.b = Math.max(line.b, b.bottom);
        } else lines.push({ l: b.left, r: b.right, t: b.top, b: b.bottom });
      }
      for (const L of lines) S.rects.push([L.l - hr.left, L.t - hr.top, L.r - L.l, L.b - L.t] as Rect4);
    });
    S.rects = S.rects.slice(0, 12);
  }

  function readTokens(): void {
    const cs = getComputedStyle(root);
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const x = c.getContext("2d", { willReadFrequently: true });
    if (!x) return;
    x.fillStyle = cs.getPropertyValue("--fringe").trim() || "#000";
    x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    S.ink = [(d[0] ?? 0) / 255, (d[1] ?? 0) / 255, (d[2] ?? 0) / 255];
    const a = parseFloat(cs.getPropertyValue("--fringe-a"));
    S.alpha = Number.isNaN(a) ? 0.07 : a;
  }

  function initGL(): boolean {
    if (gl) return true;
    if (!canvas) return false;
    gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) return false;
    const g = gl;
    const sh = (type: number, src: string): WebGLShader => {
      const o = g.createShader(type) as WebGLShader;
      g.shaderSource(o, src);
      g.compileShader(o);
      if (!g.getShaderParameter(o, g.COMPILE_STATUS)) throw new Error(g.getShaderInfoLog(o) ?? "shader");
      return o;
    };
    const prog = g.createProgram() as WebGLProgram;
    g.attachShader(prog, sh(g.VERTEX_SHADER, VS));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FS));
    g.bindAttribLocation(prog, 0, "p");
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) throw new Error(g.getProgramInfoLog(prog) ?? "link");
    g.useProgram(prog);
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    g.enableVertexAttribArray(0);
    g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);
    for (const n of UNIFORMS) U[n] = g.getUniformLocation(prog, n);
    return true;
  }

  function draw(): void {
    if (!gl || !canvas) return;
    const w = Math.max(1, Math.round(S.w * S.dpr));
    const h = Math.max(1, Math.round(S.h * S.dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const bx = S.A.x - (S.C.x - S.A.x) * (S.r - 1);
    const by = S.A.y - (S.C.y - S.A.y) * (S.r - 1);
    gl.uniform2f(U.uRes, w, h);
    gl.uniform1f(U.uDpr, S.dpr);
    gl.uniform2f(U.uA, S.A.x, S.A.y);
    gl.uniform2f(U.uB, bx, by);
    gl.uniform1f(U.uP1, S.p1);
    gl.uniform1f(U.uP2, S.p1 * S.r);
    gl.uniform3fv(U.uInk, S.ink);
    gl.uniform1f(U.uAlpha, S.alpha);
    flat.fill(0);
    S.rects.forEach((r, i) => flat.set(r, i * 4));
    gl.uniform4fv(U.uR, flat);
    gl.uniform1i(U.uN, S.rects.length);
    gl.uniform2f(U.uVig, CFG.vig[0], CFG.vig[1]);
    gl.uniform2f(U.uClear, CFG.pad + 1, CFG.pad + CFG.feather);
    gl.uniform2f(U.uTop, S.top, CFG.topFeather);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frames++;
  }

  function frame(now: number): void {
    raf = 0;
    const dt = lastT ? Math.min(64, now - lastT) : 16.7;
    lastT = now;
    const k = 1 - Math.pow(1 - CFG.lerp, dt / 16.667);
    S.C.x += (S.T.x - S.C.x) * k;
    S.C.y += (S.T.y - S.C.y) * k;
    if (Math.hypot(S.T.x - S.C.x, S.T.y - S.C.y) < 0.75) {
      S.C.x = S.T.x;
      S.C.y = S.T.y;
      settled = true;
    }
    draw();
    if (!settled) schedule();
    else lastT = 0;
  }

  function schedule(): void {
    if (raf || !gl || !inView || document.hidden || dead) return;
    raf = requestAnimationFrame(frame);
  }

  function stop(): void {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastT = 0;
  }

  function setTarget(x: number, y: number): void {
    let dx = x - S.A.x;
    let dy = y - S.A.y;
    const d = Math.hypot(dx, dy);
    if (d > CFG.reach) {
      dx *= CFG.reach / d;
      dy *= CFG.reach / d;
    }
    S.T.x = S.A.x + dx;
    S.T.y = S.A.y + dy;
    settled = false;
    schedule();
  }

  function goStatic(): void {
    stop();
    delete hero.dataset.live;
    live = false;
    settled = true;
  }

  function goLive(): void {
    if (live || dead || mqReduce.matches || !srcEl) return;
    try {
      if (!initGL()) return;
    } catch (e) {
      console.warn("[w1] static frame kept:", (e as Error).message);
      gl = null;
      return;
    }
    S.accent = measureAccent(srcEl);
    readTokens();
    layout();
    S.C = { x: S.A.x + CFG.rest.x, y: S.A.y + CFG.rest.y };
    S.T = { ...S.C };
    draw();
    hero.dataset.live = "";
    live = true;
    observe();
  }

  /* observers exist only once live: the static and reduced-motion frames schedule nothing */
  function observe(): void {
    if (io) return;
    io = new IntersectionObserver(([en]) => {
      inView = en?.isIntersecting ?? true;
      if (!inView) stop();
      else if (!settled) schedule();
    });
    io.observe(hero);
    ro = new ResizeObserver(() => {
      if (!live) return;
      layout();
      draw();
    });
    ro.observe(hero);
    mo = new MutationObserver(() => {
      if (!live) return;
      readTokens();
      draw();
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  function follow(e: PointerEvent): void {
    if (!live) goLive();
    if (!live) return;
    const r = hero.getBoundingClientRect();
    setTarget(e.clientX - r.left, e.clientY - r.top);
  }

  const fine = (e: PointerEvent): boolean => e.pointerType === "mouse" || e.pointerType === "pen";
  hero.addEventListener("pointermove", (e) => fine(e) && follow(e), opt);
  hero.addEventListener(
    "pointerdown",
    (e) => {
      if (fine(e)) follow(e);
      else tap = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
    },
    opt,
  );
  hero.addEventListener(
    "pointerup",
    (e) => {
      if (!tap || e.pointerId !== tap.id) return;
      const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
      const held = e.timeStamp - tap.t;
      tap = null;
      if (moved < 10 && held < 600) follow(e);
    },
    opt,
  );
  hero.addEventListener("pointercancel", () => (tap = null), opt);
  canvas?.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      goStatic();
      gl = null;
    },
    { signal: ac.signal },
  );
  canvas?.addEventListener("webglcontextrestored", () => goLive(), opt);
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) stop();
      else if (!settled) schedule();
    },
    opt,
  );
  mqReduce.addEventListener("change", (m) => m.matches && goStatic(), opt);

  /* GL after load, fonts and idle on fine pointers; on coarse pointers, the first tap in the hero */
  if (!coarse && !mqReduce.matches) {
    const boot = (): void => {
      if (dead) return;
      if ("requestIdleCallback" in window) requestIdleCallback(() => goLive(), { timeout: 1500 });
      else setTimeout(goLive, 200);
    };
    void document.fonts.ready.then(() =>
      document.readyState === "complete" ? boot() : window.addEventListener("load", boot, { once: true, signal: ac.signal }),
    );
  }

  return {
    destroy(): void {
      dead = true;
      ac.abort();
      io?.disconnect();
      ro?.disconnect();
      mo?.disconnect();
      stop();
      if (gl && canvas) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        const fresh = canvas.cloneNode(false) as HTMLCanvasElement;
        canvas.replaceWith(fresh);
        canvas = fresh;
      }
      gl = null;
      goStatic();
    },
    state: () => ({ live, settled, frames }),
    /** max alpha drawn inside every text rect grown by 16 px; must be 0 (P3) */
    checkClearZones(): number | "static" {
      if (!gl || !canvas) return "static";
      draw();
      let max = 0;
      for (const r of S.rects) {
        const x0 = Math.max(0, Math.floor((r[0] - CFG.pad) * S.dpr));
        const x1 = Math.min(canvas.width, Math.ceil((r[0] + r[2] + CFG.pad) * S.dpr));
        const y0 = Math.max(0, Math.floor((r[1] - CFG.pad) * S.dpr));
        const y1 = Math.min(canvas.height, Math.ceil((r[1] + r[3] + CFG.pad) * S.dpr));
        const w = x1 - x0;
        const h = y1 - y0;
        if (w <= 0 || h <= 0) continue;
        const px = new Uint8Array(w * h * 4);
        gl.readPixels(x0, canvas.height - y1, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
        for (let i = 3; i < px.length; i += 4) max = Math.max(max, px[i] ?? 0);
      }
      return max / 255;
    },
  };
}
