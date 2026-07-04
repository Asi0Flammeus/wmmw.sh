/**
 * Mycelium: ONE physarum simulation over the whole document (spec 2.1 + 2.3,
 * unified; 2026-07-04 rework after user feedback that the previous
 * two-coupled-fields build - upscaled hero grid + sprite-stamped ribbon -
 * read as two different organisms glued at the hero seam).
 *
 * Architecture: a single low-res trail grid (CELL px per cell) spans the whole
 * page. One agent colony lives on it. What differs per page is only the GUIDE
 * FIELD (pre-deposited attractant), authored at build():
 *
 *  - hero zone: a soft meandering left lane + a funnel toward the trunk mouth
 *    (same 100dvh hero and rightward spill on every page);
 *  - below the hero: a narrow guide tube along a seeded organic trunk path
 *    down the left margin, with branch tubes pouring into each terminal
 *    panel header.
 *
 * Because bloom and filament are THE SAME grid, agents literally stream from
 * the hero mass into the trunk: one texture, one grain, no seam, no drawImage
 * boundary.
 *
 * Scroll gating: a frontier row (lerped toward scrollY + 62% vh, monotonic per
 * page) that agents cannot cross - growth is revealed little by little as you
 * scroll. No scroll listener: the rAF loop reads scrollY. A small share of the
 * colony re-emerges near the frontier tip each step (biologically: growth at
 * the hyphal tip) so colonization keeps pace with scrolling.
 *
 * Budget: only the ACTIVE BAND (viewport + margin, in grid rows) is stepped,
 * diffused and re-rendered each frame; rows outside are frozen (their trail
 * persists and re-renders when scrolled back). Offscreen hero = frozen for
 * free. ~30fps step cap; allocation-free hot loop; document.hidden pauses.
 *
 * Terminal coupling: each branch's target `.panel` is marked `data-myc-claim`;
 * when real trail mass accumulates at the branch endpoint the panel receives a
 * `myc:reach` CustomEvent and term-type.ts starts its typing sequence - the
 * terminal wakes BECAUSE the organism touched it, not on its own.
 *
 * Lifecycle (Astro ClientRouter): the canvas persists (transition:persist).
 * On same-page rebuilds (typing reveals grow the document, resizes of height
 * only) the trail grid is row-copied so nothing restarts. On navigation the
 * hero-zone trail is resampled into the new hero rect (the bloom never
 * restarts); below-hero trail is cleared and re-grows along the new page's
 * guide. `destroy()` is for hard unload.
 *
 * Fallbacks: reduced motion (`html.js` without `html.anim`) settles the hero
 * zone with ~300 sync steps drawn once, plus the fully-drawn static SVG
 * trunk/branches (in Mycelium.astro). No-JS mounts nothing.
 */

export interface Mycelium {
  destroy(): void;
  rebuild(): void;
}

/* ================= shared colour language ================= */

/** Warm umber-to-gold colour stops: [t, r, g, b, a]. */
const LUT_STOPS: [number, number, number, number, number][] = [
  [0.0, 18, 16, 13, 0],
  [0.05, 31, 23, 14, 0],
  [0.16, 47, 33, 18, 110],
  [0.35, 107, 74, 30, 185],
  [0.55, 168, 120, 48, 235],
  [0.78, 217, 162, 74, 255],
  [1.0, 236, 203, 127, 255],
];

/** 256-entry colormap packed 0xAABBGGRR for the Uint32 image buffer. */
function buildLut(): Uint32Array {
  const lut = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let s0 = LUT_STOPS[0]!;
    let s1 = LUT_STOPS[LUT_STOPS.length - 1]!;
    for (let s = 0; s < LUT_STOPS.length - 1; s++) {
      if (t >= LUT_STOPS[s]![0] && t <= LUT_STOPS[s + 1]![0]) {
        s0 = LUT_STOPS[s]!;
        s1 = LUT_STOPS[s + 1]!;
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

/* ================= tuning (validated Jones params, cell units) ================= */

const CELL = 5; // px per grid cell (matches the validated hero density)
const SD = 7.5; // sensor distance, cells
const SA = 0.4; // sensor angle
const TA = 0.45; // turn angle
const SPEED = 1.0; // cells per step
const JIT = 0.12;
const DEPOSIT = 0.15;
const CAP = 6;
const EVAP = 0.94;
const KNEE = 0.8; // soft-knee tone map: n = v / (v + KNEE)
const GW_SENSE = 1.5; // guide weight when sensing

const BAND_MARGIN = 280; // px processed above/below the viewport
const TIP_VH = 0.62; // growth tip line as a fraction of viewport height
const SPILL = 0.6; // hero lane rightward spill (fraction of grid width)
/* near the end of the page the tip line eases down to the viewport bottom so
   the trunk completes into the footer while it is being read, not after */
const TIP_EASE_FROM = 0.72; // scroll progress where the easing starts
const FRONT_LERP = 0.09; // frontier smoothing per step
const FEATHER_ROWS = 10; // rows over which the growth tip fades in
const STEP_MS = 30; // ~33fps step cap (breathing is slow)
const FREEZE_STEPS = 300; // reduced-motion settle

const AG_CAP = 9000;
const RESPAWN_FRAC = 0.0015; // colony share re-emerging on the guide per step
const SCAN_FRAC = 0.06; // agents scanned per step to find frozen ones
const HERO_RESPAWN_FRAC = 0.002; // hero ambience churn (left-biased)
const CULL_GUIDE = 0.012; // below-hero: off-network guide threshold
const CULL_TRAIL = 0.06; // ... and no trail either -> stray
const CULL_P = 0.04; // stray relocation probability per step
const TIP_ROWS = 50; // respawn window height above the frontier
const WALL = 1.5; // repellent border margin, cells (kills wall-hugging)
const CAP_BELOW = 2.4; // softer deposit cap below the hero: strand, not pipe
const CROWD_P = 0.02; // overcrowd thinning: saturated-cell squatters move on
const BELOW_GAIN = 0.55; // render gain below the hero (bright core, no slab)
const GAIN_FADE = 0.045; // per-row ease from hero gain into below-hero gain

/* trunk / branch guide tubes (peak attractant, gaussian sigma in cells) --
   soft and wide so agents meander around the trace instead of pipelining */
const TRUNK_PEAK = 0.55;
const TRUNK_SIG = 2.2;
const BR_PEAK = 0.5;
const BR_SIG = 1.8;

/* branch tip -> terminal activation: dispatch "myc:reach" when this much
   trail mass has accumulated in the 3x3 around the branch endpoint */
const REACH_SUM = 1.6;

const TAU = Math.PI * 2;
const cosSA = Math.cos(SA);
const sinSA = Math.sin(SA);
const cosTA = Math.cos(TA);
const sinTA = Math.sin(TA);
const SVGNS = "http://www.w3.org/2000/svg";

/* ================= pure helpers ================= */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clampInt(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

interface Pt {
  x: number;
  y: number;
}

/** Catmull-Rom -> cubic path data. */
function catmull(pts: Pt[]): string {
  if (pts.length < 2) return "";
  const first = pts[0]!;
  let d = "M" + first.x.toFixed(1) + "," + first.y.toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d +=
      "C" +
      c1x.toFixed(1) +
      "," +
      c1y.toFixed(1) +
      " " +
      c2x.toFixed(1) +
      "," +
      c2y.toFixed(1) +
      " " +
      p2.x.toFixed(1) +
      "," +
      p2.y.toFixed(1);
  }
  return d;
}

function cubicAt(t: number, a: number, b: number, c: number, d: number): number {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
}

/** x of the trunk polyline at document-y `y` (linear interp; y monotonic). */
function trunkXAt(pts: Pt[], y: number): number {
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  if (y <= first.y) return first.x;
  if (y >= last.y) return last.x;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    if (y >= a.y && y <= b.y) {
      const f = (y - a.y) / (b.y - a.y || 1);
      return a.x + (b.x - a.x) * f;
    }
  }
  return last.x;
}

interface BranchEnd {
  x: number; // endpoint, cells
  y: number;
  panel: HTMLElement;
  reached: boolean;
}

/* ================= mount ================= */

export function mountMycelium(root: HTMLElement): Mycelium {
  const canvas = root.querySelector<HTMLCanvasElement>(".myc-canvas");
  const svg = root.querySelector<SVGSVGElement>(".myc-svg");
  const trunkEl = root.querySelector<SVGPathElement>(".myc-svg .trunk");
  const brg = root.querySelector<SVGGElement>(".myc-svg .br");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;

  // Persisted canvas: a second mount (module re-eval) must be a no-op.
  if (!canvas || !ctx || !svg || !trunkEl || !brg || canvas.dataset.mycMounted === "1") {
    return { destroy() {}, rebuild() {} };
  }
  canvas.dataset.mycMounted = "1";

  const anim = document.documentElement.classList.contains("anim");
  const LUT = buildLut();

  /* ---- unified grid state ---- */
  let gw = 0; // grid width, cells
  let gh = 0; // grid height, cells
  let trail = new Float32Array(0);
  let tmp = new Float32Array(0);
  let guide = new Float32Array(0);
  const ag = new Float32Array(AG_CAP * 3); // [x, y, heading] in cell coords
  let nAg = 0;
  let seeded = false;
  let rp = 0; // rolling respawn-scan pointer

  /* ---- per-page geometry (cells unless noted) ---- */
  let cssW = 1;
  let docH = 1; // px
  let vh = window.innerHeight; // px
  let hTopRow = 0;
  let hBotRow = 0;
  let endRow = 0;
  let frontier = 0; // float row; monotonic per page
  let lastPath = "";

  /* ---- guide spine (respawn targets along trunk+branches, y-sorted) ---- */
  let spineX = new Float32Array(0);
  let spineY = new Float32Array(0);
  let spineLen = 0;
  let branchEnds: BranchEnd[] = [];

  /* ---- render strip (band rows -> LUT -> upscaled into the doc canvas) ---- */
  const strip = document.createElement("canvas");
  const stripCtx = strip.getContext("2d", { alpha: true })!;
  let img: ImageData | null = null;
  let buf32 = new Uint32Array(0);
  let bandMaxRows = 0;

  function sense(x: number, y: number): number {
    const xi = x | 0;
    const yi = y | 0;
    // repellent border: without this the reflecting wall + deposited trail
    // form a positive feedback loop and the colony paints a solid gold bar
    if (xi < WALL || xi >= gw - WALL || yi < hTopRow + WALL) return -0.6;
    const i = (yi >= gh ? gh - 1 : yi) * gw + xi;
    return trail[i]! + guide[i]! * GW_SENSE;
  }

  /** Find the spine index window with y in [yLo, yHi); returns packed lo/hi. */
  let winLo = 0;
  let winHi = 0;
  function spineWindow(yLo: number, yHi: number): boolean {
    let lo = 0;
    let hi = spineLen;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (spineY[mid]! < yLo) lo = mid + 1;
      else hi = mid;
    }
    winLo = lo;
    hi = spineLen;
    let lo2 = lo;
    while (lo2 < hi) {
      const mid = (lo2 + hi) >> 1;
      if (spineY[mid]! < yHi) lo2 = mid + 1;
      else hi = mid;
    }
    winHi = lo2;
    return winHi > winLo;
  }

  /** Re-emerge agent j on the guide spine within [yLo, yHi) (cells). */
  function relocate(j: number, yLo: number, yHi: number): boolean {
    if (!spineWindow(yLo, yHi)) return false;
    const k = winLo + ((Math.random() * (winHi - winLo)) | 0);
    ag[j] = spineX[k]! + (Math.random() - 0.5) * 3;
    ag[j + 1] = spineY[k]! + (Math.random() - 0.5) * 2;
    ag[j + 2] = Math.random() * TAU;
    return true;
  }

  /** Advance agents inside band rows [r0, r1); deposit; cull strays. */
  function stepAgents(r0: number, r1: number): void {
    const topEdge = hTopRow + 0.5;
    for (let i = 0; i < nAg; i++) {
      const j = i * 3;
      let y = ag[j + 1]!;
      if (y < r0 || y >= r1) continue; // frozen outside the active band
      let x = ag[j]!;
      let h = ag[j + 2]! + (Math.random() - 0.5) * JIT;
      let ch = Math.cos(h);
      let sh = Math.sin(h);
      const f = sense(x + ch * SD, y + sh * SD);
      const l = sense(x + (ch * cosSA + sh * sinSA) * SD, y + (sh * cosSA - ch * sinSA) * SD);
      const r = sense(x + (ch * cosSA - sh * sinSA) * SD, y + (sh * cosSA + ch * sinSA) * SD);
      let d = 0;
      if (f >= l && f >= r) d = 0;
      else if (l > f && r > f) d = Math.random() < 0.5 ? -TA : TA;
      else if (l > r) d = -TA;
      else d = TA;
      if (d !== 0) {
        const sgn = d > 0 ? sinTA : -sinTA;
        const c2 = ch * cosTA - sh * sgn;
        const s2 = sh * cosTA + ch * sgn;
        ch = c2;
        sh = s2;
        h += d;
      }
      x += ch * SPEED;
      y += sh * SPEED;
      if (x < 0.5) {
        x = 1 - x;
        h = Math.PI - h;
      } else if (x > gw - 1.5) {
        x = 2 * (gw - 1.5) - x;
        h = Math.PI - h;
      }
      if (y < topEdge) {
        y = 2 * topEdge - y;
        h = -h;
      } else if (y > frontier) {
        y = 2 * frontier - y;
        h = -h;
        if (y < topEdge) y = topEdge;
      }
      ag[j] = x;
      ag[j + 1] = y;
      ag[j + 2] = h;
      const ti = (y | 0) * gw + (x | 0);
      // stray cull below the hero: off the network with nothing to follow ->
      // re-emerge on the spine so the colony never dusts the whole page
      if (
        y > hBotRow &&
        guide[ti]! < CULL_GUIDE &&
        trail[ti]! < CULL_TRAIL &&
        Math.random() < CULL_P
      ) {
        if (relocate(j, y - 30, y + 30) || relocate(j, hBotRow, frontier)) continue;
      }
      const cap = y > hBotRow ? CAP_BELOW : CAP;
      const tv = trail[ti]!;
      // overcrowd thinning: an agent squatting a saturated strand cell adds
      // nothing but width; redistribute it to nearby starved guide (branches)
      if (tv >= cap) {
        if (y > hBotRow && Math.random() < CROWD_P && relocate(j, y - 60, frontier)) continue;
      } else {
        const nv = tv + DEPOSIT;
        trail[ti] = nv > cap ? cap : nv;
      }
    }
  }

  /** Tip growth + hero ambience churn. */
  function respawn(r0: number, r1: number): void {
    // frozen agents outside the band re-emerge on the guide: alternately at
    // the growth tip (colonization keeps pace with scroll) and on any starved
    // guide cell in view (branches keep receiving flux after the tip passes)
    if (frontier > hBotRow + 4) {
      const want = Math.max(1, (nAg * RESPAWN_FRAC) | 0);
      const scan = Math.max(want, (nAg * SCAN_FRAC) | 0);
      let moved = 0;
      const tipLo = Math.max(hBotRow, frontier - TIP_ROWS);
      const fillLo = Math.max(hBotRow, r0);
      for (let s = 0; s < scan && moved < want; s++) {
        rp = rp + 1 >= nAg ? 0 : rp + 1;
        const j = rp * 3;
        const y = ag[j + 1]!;
        if (y >= r0 && y < r1) continue; // alive, leave it
        if ((moved & 1) === 0) {
          if (relocate(j, tipLo, frontier)) moved++;
        } else if (spineWindow(fillLo, frontier)) {
          // pick a starved spine cell (low trail) so flux goes where needed
          const k = winLo + ((Math.random() * (winHi - winLo)) | 0);
          const ti = (spineY[k]! | 0) * gw + (spineX[k]! | 0);
          if (trail[ti]! < 1.0) {
            ag[j] = spineX[k]! + (Math.random() - 0.5) * 3;
            ag[j + 1] = spineY[k]! + (Math.random() - 0.5) * 2;
            ag[j + 2] = Math.random() * TAU;
            moved++;
          }
        }
      }
    }
    // hero ambience: tiny left-biased churn keeps the bloom breathing
    if (r0 < hBotRow && hBotRow > hTopRow) {
      const n = Math.max(1, (nAg * HERO_RESPAWN_FRAC) | 0);
      for (let k = 0; k < n; k++) {
        const j = ((Math.random() * nAg) | 0) * 3;
        ag[j] = 3 + Math.random() * Math.random() * (gw - 6);
        ag[j + 1] = hTopRow + Math.random() * (hBotRow - hTopRow);
        ag[j + 2] = Math.random() * TAU;
      }
    }
  }

  /** 3x3 blur folded with evaporation over band rows [r0, r1). */
  function diffuseBand(r0: number, r1: number): void {
    const e9 = EVAP / 9;
    const topAbs = hTopRow + 2; // absorbing rows at the document top edge
    for (let yy = r0; yy < r1; yy++) {
      const y1 = yy * gw;
      if (yy < topAbs) {
        tmp.fill(0, y1, y1 + gw);
        continue;
      }
      const y0 = (yy === 0 ? 0 : yy - 1) * gw;
      const y2 = (yy === gh - 1 ? gh - 1 : yy + 1) * gw;
      for (let xx = 2; xx < gw - 2; xx++) {
        const x0 = xx - 1;
        const x2 = xx + 1;
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
          e9;
      }
      // absorbing side walls: trail dies at the margin instead of piling up
      // against the reflect boundary (clamped blur would otherwise retain it)
      tmp[y1] = 0;
      tmp[y1 + 1] = 0;
      tmp[y1 + gw - 2] = 0;
      tmp[y1 + gw - 1] = 0;
    }
    trail.set(tmp.subarray(r0 * gw, r1 * gw), r0 * gw);
  }

  /** LUT-render band rows [r0, r1) and paint them into the document canvas. */
  function renderBand(r0: number, r1: number): void {
    if (!img) return;
    const rows = r1 - r0;
    for (let yy = r0; yy < r1; yy++) {
      let fm = frontier - yy;
      fm = fm >= FEATHER_ROWS ? 1 : fm <= 0 ? 0 : fm / FEATHER_ROWS;
      const src = yy * gw;
      const dst = (yy - r0) * gw;
      if (fm === 0) {
        buf32.fill(0, dst, dst + gw);
        continue;
      }
      const gain =
        yy <= hBotRow ? fm : fm * Math.max(BELOW_GAIN, 1 - (yy - hBotRow) * GAIN_FADE);
      if (gain === 1) {
        for (let x = 0; x < gw; x++) {
          const v = trail[src + x]!;
          buf32[dst + x] = LUT[((v / (v + KNEE)) * 255) | 0]!;
        }
      } else {
        for (let x = 0; x < gw; x++) {
          const v = trail[src + x]! * gain;
          buf32[dst + x] = LUT[((v / (v + KNEE)) * 255) | 0]!;
        }
      }
    }
    stripCtx.putImageData(img, 0, 0, 0, 0, gw, rows);
    ctx!.clearRect(0, r0 * CELL, cssW, rows * CELL);
    ctx!.drawImage(strip, 0, 0, gw, rows, 0, r0 * CELL, gw * CELL, rows * CELL);
  }

  /** Wake terminals whose branch endpoint has real trail mass on it. */
  function reachCheck(): void {
    for (let b = 0; b < branchEnds.length; b++) {
      const e = branchEnds[b]!;
      if (e.reached || e.y > frontier + 2) continue;
      const xi = clampInt(e.x | 0, 1, gw - 2);
      const yi = clampInt(e.y | 0, 1, gh - 2);
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const o = (yi + dy) * gw + xi;
        sum += trail[o - 1]! + trail[o]! + trail[o + 1]!;
      }
      if (sum >= REACH_SUM) {
        e.reached = true;
        e.panel.dispatchEvent(new CustomEvent("myc:reach"));
      }
    }
  }

  /* ---- frame loop, gated on visibility ---- */
  let rafId = 0;
  let running = false;
  let last = 0;
  let destroyed = false;

  function frame(ts: number): void {
    rafId = requestAnimationFrame(frame);
    if (ts - last < STEP_MS) return;
    last = ts;

    const sy = window.pageYOffset || 0;
    let r0 = ((sy - BAND_MARGIN) / CELL) | 0;
    if (r0 < 0) r0 = 0;
    let r1 = Math.ceil((sy + vh + BAND_MARGIN) / CELL);
    if (r1 > gh) r1 = gh;
    if (r1 - r0 > bandMaxRows) r1 = r0 + bandMaxRows;
    if (r1 <= r0) return;

    // growth tip chases the scroll (62% vh), never retreats within a page;
    // past TIP_EASE_FROM of the scroll range it eases to the viewport bottom
    const maxSy = docH - vh;
    const p = maxSy > 1 ? sy / maxSy : 1;
    let frac = TIP_VH;
    if (p > TIP_EASE_FROM) {
      frac = TIP_VH + ((p - TIP_EASE_FROM) / (1 - TIP_EASE_FROM)) * (1.05 - TIP_VH);
    }
    let tgt = (sy + vh * frac) / CELL;
    if (tgt < hBotRow) tgt = hBotRow;
    if (tgt > endRow) tgt = endRow;
    if (tgt > frontier) frontier += (tgt - frontier) * FRONT_LERP;

    stepAgents(r0, r1);
    respawn(r0, r1);
    diffuseBand(r0, r1);
    renderBand(r0, r1);
    reachCheck();
  }

  function startLoop(): void {
    if (running || !anim || destroyed) return;
    running = true;
    last = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stopLoop(): void {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  /* ---- construction (cold path) ---- */

  /** Soft meandering hero lane + funnel into the trunk mouth, written into
   *  `guide` rows [hTopRow, hBotRow). */
  function buildHeroGuide(mouthX: number): void {
    const rows = hBotRow - hTopRow;
    if (rows <= 0) return;
    const xc0 = gw * 0.11;
    const sigL = gw * 0.05;
    const sigR = gw * SPILL;
    const twoSigL2 = 2 * sigL * sigL;
    const twoSigR2 = 2 * sigR * sigR;
    const fsx = gw * 0.1;
    const fsy = rows * 0.34;
    const twoFsx2 = 2 * fsx * fsx;
    const twoFsy2 = 2 * fsy * fsy;
    for (let y = hTopRow; y < hBotRow; y++) {
      const ry = y - hTopRow;
      const xc = xc0 + Math.sin(ry * 0.05) * gw * 0.03 + Math.sin(ry * 0.017 + 1.3) * gw * 0.02;
      const dyF = y - hBotRow;
      // feather the very top so trail never piles against the document edge
      const edge = ry >= 3 ? 1 : ry / 3;
      for (let x = 0; x < gw; x++) {
        const dx = x - xc;
        const twoS2 = dx < 0 ? twoSigL2 : twoSigR2;
        const band = Math.exp(-(dx * dx) / twoS2);
        const dxF = x - mouthX;
        const funnel = Math.exp(-(dxF * dxF) / twoFsx2 - (dyF * dyF) / twoFsy2);
        guide[y * gw + x] = (band * 0.75 + funnel * 0.9) * edge;
      }
    }
  }

  /** Stamp a gaussian attractant tube cell (max-blend, cold path). */
  function depositTube(cxPx: number, cyPx: number, peak: number, sigma: number): void {
    const cx = cxPx / CELL;
    const cy = cyPx / CELL;
    const R = Math.ceil(sigma * 2.6);
    const inv = 1 / (2 * sigma * sigma);
    const xi0 = clampInt((cx | 0) - R, 0, gw - 1);
    const xi1 = clampInt((cx | 0) + R, 0, gw - 1);
    const yi0 = clampInt((cy | 0) - R, 0, gh - 1);
    const yi1 = clampInt((cy | 0) + R, 0, gh - 1);
    for (let y = yi0; y <= yi1; y++) {
      const dy = y + 0.5 - cy;
      for (let x = xi0; x <= xi1; x++) {
        const dx = x + 0.5 - cx;
        const g = peak * Math.exp(-(dx * dx + dy * dy) * inv);
        const i = y * gw + x;
        if (g > guide[i]!) guide[i] = g;
      }
    }
  }

  function seedAgents(): void {
    const rows = hBotRow - hTopRow;
    const cx = gw * 0.24;
    const cy = hTopRow + rows * 0.5;
    const R = Math.min(gw, rows) * 0.3;
    const nRing = Math.floor(nAg * 0.6);
    let k = 0;
    for (let i = 0; i < nRing; i++) {
      const a = Math.random() * TAU;
      const rr = R * (0.9 + Math.random() * 0.18);
      ag[k++] = clampInt(cx + Math.cos(a) * rr, 1, gw - 2);
      ag[k++] = clampInt(cy + Math.sin(a) * rr, hTopRow + 1, hBotRow - 1);
      ag[k++] = a + Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    }
    const c1x = gw * 0.1;
    const c1y = hTopRow + rows * 0.78;
    const c2x = gw * 0.4;
    const c2y = hTopRow + rows * 0.22;
    const cr = Math.min(gw, rows) * 0.09;
    for (let i = nRing; i < nAg; i++) {
      const even = (i & 1) === 0;
      const a = Math.random() * TAU;
      const rr = cr * Math.sqrt(Math.random());
      ag[k++] = clampInt((even ? c1x : c2x) + Math.cos(a) * rr, 1, gw - 2);
      ag[k++] = clampInt((even ? c1y : c2y) + Math.sin(a) * rr, hTopRow + 1, hBotRow - 1);
      ag[k++] = Math.random() * TAU;
    }
    seeded = true;
  }

  function sizeCanvas(): void {
    canvas!.width = Math.max(1, cssW);
    canvas!.height = Math.max(1, docH);
    canvas!.style.height = docH + "px";
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.imageSmoothingEnabled = true;
  }

  /**
   * Measure the page, (re)generate the SVG reference path, author the guide
   * field + spine for THIS page, and carry the organism over: row-copy on
   * same-page rebuilds, hero-zone resample on navigation.
   */
  function build(): void {
    if (destroyed) return;

    const W = document.documentElement.clientWidth || window.innerWidth;
    const newGw = Math.max(32, Math.ceil(W / CELL));
    vh = window.innerHeight;
    const mobile = W < 768;
    const scrollY = window.pageYOffset || 0;
    const scrollX = window.pageXOffset || 0;
    const path = location.pathname;

    // claims are re-derived from the fresh branch domain below; a rebuild may
    // legitimately drop a branch, so stale marks must not gate typing forever
    document.querySelectorAll<HTMLElement>("[data-myc-claim]").forEach((el) => {
      delete el.dataset.mycClaim;
    });

    const hero = document.querySelector<HTMLElement>(".hero");
    const footer = document.querySelector(".site-foot") || document.querySelector("footer");

    let heroTop = 0;
    let heroH = 0;
    let startY: number;
    if (hero) {
      const hr = hero.getBoundingClientRect();
      heroTop = hr.top + scrollY;
      heroH = hr.height;
      // seam the trunk just inside the hero bottom so it emerges from the mass
      startY = heroTop + heroH - heroH * 0.08;
    } else {
      const main = document.querySelector("main");
      startY = main ? main.getBoundingClientRect().top + scrollY + 8 : 80;
    }

    let endY = 0;
    if (footer) {
      const fr = footer.getBoundingClientRect();
      endY = fr.top + scrollY + Math.min(fr.height * 0.5, 90);
    }

    // collapse both layers before measuring so they never inflate scrollHeight
    canvas!.style.height = "0px";
    svg!.style.height = "0px";
    const newDocH = Math.max(document.documentElement.scrollHeight, endY + 40, startY + 400);
    if (!footer || endY <= startY + 40) endY = newDocH - 40;
    if (endY <= startY + 40) endY = startY + 400;

    svg!.setAttribute("viewBox", "0 0 " + W + " " + newDocH);
    svg!.setAttribute("width", String(W));
    svg!.setAttribute("height", String(newDocH));
    svg!.style.height = newDocH + "px";
    svg!.style.display = anim ? "none" : "block";

    // ---- trunk: seeded organic meander down a left lane ----
    const rnd = mulberry32(0x5eed21 ^ (W & 0xffff));
    const laneX = mobile ? Math.max(11, W * 0.04) : Math.max(20, Math.min(44, W * 0.03));
    const amp = mobile ? 6 : Math.min(22, W * 0.018);
    const span = endY - startY;
    const segs = Math.max(8, Math.round(span / 130));
    const pts: Pt[] = [];
    const phase = rnd() * TAU;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const y = startY + span * t;
      const wob =
        Math.sin(t * Math.PI * 2.6 + phase) * amp +
        Math.sin(t * Math.PI * 6.1 + phase * 1.7) * amp * 0.35;
      const jitter = (rnd() - 0.5) * amp * 0.5;
      const ease = i === 0 ? 0 : 1;
      pts.push({ x: laneX + (wob + jitter) * ease, y });
    }
    trunkEl!.setAttribute("d", catmull(pts));
    const tlen = trunkEl!.getTotalLength();

    // ---- branches pouring into each panel header ----
    while (brg!.firstChild) brg!.removeChild(brg!.firstChild);
    interface BDef {
      sx: number;
      sy: number;
      c1x: number;
      c1y: number;
      c2x: number;
      c2y: number;
      tx: number;
      ty: number;
      panel: HTMLElement | null;
    }
    const defs: BDef[] = [];
    const heads = Array.prototype.slice.call(
      document.querySelectorAll(".panel-head"),
    ) as HTMLElement[];
    for (let idx = 0; idx < heads.length; idx++) {
      const head = heads[idx]!;
      const hr = head.getBoundingClientRect();
      const attachY = hr.top + scrollY + hr.height * 0.5;
      if (attachY < startY + 44 || attachY > endY) continue;
      const drop = mobile ? 30 : 64;
      let sy = attachY - drop;
      if (sy < startY + 20) sy = startY + 20;
      const sx = trunkXAt(pts, sy);
      const tx = mobile ? Math.min(hr.left + scrollX + 40, W - 12) : hr.left + scrollX + 34;
      const ty = attachY;
      const dx = tx - sx;
      const dy = ty - sy;
      if (Math.abs(dx) < 10) continue;
      const br = mulberry32((0xa11ce + idx * 2654435761) | 0);
      // pour: leave tangentially downward, then sweep across into the header
      const c1x = sx + dx * (0.04 + br() * 0.06);
      const c1y = sy + dy * (0.82 + br() * 0.12);
      const c2x = tx - dx * (0.24 + br() * 0.12);
      const c2y = ty - (2 + br() * 6);
      let d =
        "M" +
        sx.toFixed(1) +
        "," +
        sy.toFixed(1) +
        "C" +
        c1x.toFixed(1) +
        "," +
        c1y.toFixed(1) +
        " " +
        c2x.toFixed(1) +
        "," +
        c2y.toFixed(1) +
        " " +
        tx.toFixed(1) +
        "," +
        ty.toFixed(1);
      const nb = 1 + (br() < 0.6 ? 1 : 0);
      for (let bb = 0; bb < nb; bb++) {
        const f = 0.5 + bb * 0.24 + br() * 0.1;
        const mx = sx + dx * f;
        const my = sy + dy * f;
        const len = (mobile ? 16 : 30) + br() * (mobile ? 14 : 34);
        const angA = (br() < 0.5 ? -1 : 1) * (0.5 + br() * 0.7);
        const ex = mx + Math.cos(angA) * len * (dx > 0 ? 1 : -1);
        const ey = my + Math.sin(angA) * len;
        const mcx = mx + (ex - mx) * 0.5 + (br() - 0.5) * 18;
        const mcy = my + (ey - my) * 0.5 + (br() - 0.5) * 18;
        d +=
          " M" +
          mx.toFixed(1) +
          "," +
          my.toFixed(1) +
          "Q" +
          mcx.toFixed(1) +
          "," +
          mcy.toFixed(1) +
          " " +
          ex.toFixed(1) +
          "," +
          ey.toFixed(1);
      }
      const pathEl = document.createElementNS(SVGNS, "path");
      pathEl.setAttribute("d", d);
      brg!.appendChild(pathEl);
      defs.push({ sx, sy, c1x, c1y, c2x, c2y, tx, ty, panel: head.closest<HTMLElement>(".panel") });
    }

    // ---- grid carry-over ----
    const newGh = Math.max(64, Math.ceil(newDocH / CELL));
    const newHTop = Math.max(0, (heroTop / CELL) | 0);
    const newHBot = Math.min(newGh, Math.ceil((heroTop + heroH) / CELL));
    const samePage = path === lastPath && newGw === gw && trail.length > 0;
    const oldTrail = trail;
    const oldGw = gw;
    const oldHTop = hTopRow;
    const oldHBot = hBotRow;

    if (samePage) {
      // typing reveals / height shifts: keep the whole organism, row-copy
      if (newGh !== gh) {
        const next = new Float32Array(newGw * newGh);
        next.set(oldTrail.subarray(0, Math.min(oldTrail.length, next.length)));
        trail = next;
        tmp = new Float32Array(newGw * newGh);
      }
      gh = newGh;
      hTopRow = newHTop;
      hBotRow = newHBot;
    } else {
      // navigation / width change: the hero bloom carries over by CROPPING
      // the old hero zone 1:1 into the new hero rect (no vertical scaling -
      // a squish reads as streaky banding). Heroes are uniform across pages,
      // so the guide is identical and the bloom continues exactly, mid-motion
      // (no decay, no restart); below-hero re-grows along the new page's
      // guide.
      trail = new Float32Array(newGw * newGh);
      tmp = new Float32Array(newGw * newGh);
      const oldRows = oldHBot - oldHTop;
      const newRows = newHBot - newHTop;
      if (oldRows > 2 && newRows > 2 && oldGw > 0) {
        const copyRows = Math.min(oldRows, newRows);
        for (let y = 0; y < copyRows; y++) {
          const srcRow = (oldHTop + y) * oldGw;
          const dst = (newHTop + y) * newGw;
          for (let x = 0; x < newGw; x++) {
            const sxC =
              oldGw === newGw ? x : clampInt(((x / newGw) * oldGw) | 0, 0, oldGw - 1);
            trail[dst + x] = oldTrail[srcRow + sxC]!;
          }
        }
        // carry agents 1:1 where they land inside the new hero; refold the rest
        for (let i = 0; i < nAg; i++) {
          const j = i * 3;
          ag[j] = clampInt((ag[j]! / oldGw) * newGw, 1, newGw - 2);
          const oy = ag[j + 1]! - oldHTop + newHTop;
          ag[j + 1] =
            oy >= newHTop + 1 && oy < newHBot - 1
              ? oy
              : newHTop + 1 + Math.random() * Math.max(1, newRows - 2);
        }
      }
      gw = newGw;
      gh = newGh;
      hTopRow = newHTop;
      hBotRow = newHBot;
      frontier = hBotRow;
      rp = 0;
    }
    lastPath = path;
    cssW = W;
    docH = newDocH;
    endRow = Math.min(gh - 1, Math.ceil(endY / CELL));
    if (frontier > endRow) frontier = endRow;
    if (frontier < hBotRow) frontier = hBotRow;

    if (!seeded || nAg === 0) {
      nAg = clampInt(Math.round(gw * 26), 4000, AG_CAP);
      if (hBotRow > hTopRow + 2) seedAgents();
      else {
        // heroless page: colony starts at the trunk mouth
        nAg = clampInt(nAg >> 1, 2000, AG_CAP);
        for (let i = 0; i < nAg; i++) {
          const j = i * 3;
          ag[j] = clampInt(pts[0]!.x / CELL + (Math.random() - 0.5) * 8, 1, gw - 2);
          ag[j + 1] = startY / CELL + Math.random() * 6;
          ag[j + 2] = Math.random() * TAU;
        }
        seeded = true;
      }
    }

    // ---- guide field + spine for THIS page ----
    guide = new Float32Array(gw * gh);
    buildHeroGuide(pts[0]!.x / CELL);
    const spinePts: number[] = [];
    if (tlen > 1) {
      const steps = Math.max(8, Math.ceil(tlen / CELL));
      for (let s = 0; s <= steps; s++) {
        const p = trunkEl!.getPointAtLength((tlen * s) / steps);
        depositTube(p.x, p.y, TRUNK_PEAK, TRUNK_SIG);
        if ((s & 1) === 0) spinePts.push(p.x / CELL, p.y / CELL);
      }
    }
    branchEnds = [];
    for (let b = 0; b < defs.length; b++) {
      const def = defs[b]!;
      const chord = Math.hypot(def.tx - def.sx, def.ty - def.sy);
      const steps = Math.max(6, Math.ceil((chord * 1.15) / CELL));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const px = cubicAt(t, def.sx, def.c1x, def.c2x, def.tx);
        const py = cubicAt(t, def.sy, def.c1y, def.c2y, def.ty);
        depositTube(px, py, BR_PEAK, BR_SIG);
        if ((s & 1) === 0) spinePts.push(px / CELL, py / CELL);
      }
      if (def.panel) {
        def.panel.dataset.mycClaim = "1";
        branchEnds.push({ x: def.tx / CELL, y: def.ty / CELL, panel: def.panel, reached: false });
      }
    }
    // y-sorted spine arrays for binary-searched respawn windows
    const pairs: [number, number][] = [];
    for (let i = 0; i < spinePts.length; i += 2) pairs.push([spinePts[i]!, spinePts[i + 1]!]);
    pairs.sort((a, b) => a[1] - b[1]);
    spineLen = pairs.length;
    spineX = new Float32Array(spineLen);
    spineY = new Float32Array(spineLen);
    for (let i = 0; i < spineLen; i++) {
      spineX[i] = pairs[i]![0];
      spineY[i] = pairs[i]![1];
    }

    // ---- render strip sized for the largest band this viewport can need ----
    bandMaxRows = Math.ceil((Math.max(vh, heroH) + 2 * BAND_MARGIN) / CELL) + 2;
    if (strip.width !== gw || strip.height < bandMaxRows) {
      strip.width = gw;
      strip.height = bandMaxRows;
      img = stripCtx.createImageData(gw, bandMaxRows);
      buf32 = new Uint32Array(img.data.buffer);
    }

    sizeCanvas();

    if (!anim) {
      // reduced motion: settle the hero zone synchronously, draw once; the
      // fully-drawn static SVG carries the trunk/branches
      stopLoop();
      if (hBotRow > hTopRow + 2) {
        const keep = frontier;
        frontier = hBotRow;
        for (let s = 0; s < FREEZE_STEPS; s++) {
          stepAgents(hTopRow, hBotRow);
          diffuseBand(hTopRow, hBotRow);
        }
        renderBand(hTopRow, Math.min(hBotRow, hTopRow + bandMaxRows));
        frontier = keep;
      }
      return;
    }

    // repaint the current band in the same task: sizeCanvas() wiped the
    // canvas, and waiting for the next rAF frame would flash blank on nav
    {
      const sy = window.pageYOffset || 0;
      let r0 = ((sy - BAND_MARGIN) / CELL) | 0;
      if (r0 < 0) r0 = 0;
      let r1 = Math.ceil((sy + vh + BAND_MARGIN) / CELL);
      if (r1 > gh) r1 = gh;
      if (r1 - r0 > bandMaxRows) r1 = r0 + bandMaxRows;
      if (r1 > r0) renderBand(r0, r1);
    }

    startLoop();
  }

  /* ---- lifecycle (no scroll listener) ---- */

  function onVisibility(): void {
    if (document.hidden) stopLoop();
    else startLoop();
  }

  let rebuildQueued = false;
  function queueBuild(): void {
    if (rebuildQueued || destroyed) return;
    rebuildQueued = true;
    requestAnimationFrame(() => {
      rebuildQueued = false;
      build();
    });
  }

  function onResize(): void {
    queueBuild();
  }

  const ro = new ResizeObserver(queueBuild);
  ro.observe(document.body);
  window.addEventListener("resize", onResize);
  if (anim) document.addEventListener("visibilitychange", onVisibility);

  requestAnimationFrame(build);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!destroyed) queueBuild();
    });
  }

  return {
    rebuild() {
      // re-measure the new page; the persisted hero-zone trail carries over.
      queueBuild();
    },
    destroy() {
      destroyed = true;
      stopLoop();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      delete canvas.dataset.mycMounted;
    },
  };
}
