/**
 * Mycelium: one living organism spanning hero + page (spec 2.1 + 2.3, unified).
 *
 * A single document-level canvas carries ONE physarum organism. It is not a
 * uniform full-page grid; it has an ACTIVE DOMAIN made of two coupled fields:
 *
 *  1. HERO BLOOM  - a Jones-model slime-mould sim on a fixed low-res torus grid
 *     (validated params + warm umber->gold LUT, ported from the hero sim). The
 *     colony is weighted LEFT (left-column + bottom-left-funnel attractant) so
 *     the mass gathers toward the trunk mouth; on full (home) heroes it may
 *     spill softly rightward, on band heroes it stays tighter.
 *  2. LEFT RIBBON - below the hero, the filament ribbon machinery: a narrow
 *     rectified trail field down a left lane with a pre-deposited predilection
 *     guide (trunk + pouring branches to each [data-block] panel header). Growth
 *     is scroll-gated (frontier ~ viewport middle, smoothed) so the channels are
 *     revealed little by little. No scroll listener: the rAF loop reads scrollY.
 *
 * The two read as ONE organism: the trunk seams into the hero bottom and both
 * render through the same LUT. The bloom feeds the channels (the trunk's source
 * stream sits under the bloom mass).
 *
 * Rendering: the canvas is document-tall and painted in DOCUMENT coordinates,
 * so scrolling is free (the canvas scrolls with the page); only growth/breathing
 * triggers a redraw, and only the current viewport band is cleared+repainted
 * (grown regions above stay painted). The hero grid is rasterised to an
 * offscreen buffer then drawImage-scaled into the measured hero rect.
 *
 * Budget: only active-domain cells are processed (hero grid + ribbon rows near
 * the frontier/viewport); ~30fps step cap; allocation-free hot loop; hero
 * stepping pauses when the hero is scrolled far past, ribbon stepping pauses
 * when its grown span leaves the viewport, everything pauses on document.hidden.
 *
 * Lifecycle (Astro ClientRouter): the canvas persists (transition:persist) and
 * the single sim instance stays alive across navigations - the bloom is never
 * interrupted. `rebuild()` (called on astro:page-load) re-measures page height,
 * hero rect and anchors, regrows the below-hero guide domain and resets the
 * frontier, while preserving the hero field. `destroy()` is for hard unload.
 *
 * Fallbacks: reduced motion (`html.js` without `html.anim`) settles the bloom
 * with ~300 sync steps drawn once, plus the fully-drawn static SVG trunk/
 * branches (the SVG fallback lives in Mycelium.astro). No-JS mounts nothing.
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

/** 256-entry colormap packed 0xAABBGGRR for the hero Uint32 image buffer. */
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

/**
 * Pre-render SPR_COUNT soft radial stamps sampled along the umber->gold ramp.
 * The ribbon is painted by drawing these overlapping (source-over) so the
 * strand reads as one continuous organic filament, never a comb of ticks.
 */
function buildSprites(): HTMLCanvasElement[] {
  const sprites: HTMLCanvasElement[] = new Array(SPR_COUNT);
  for (let k = 0; k < SPR_COUNT; k++) {
    const t = k / (SPR_COUNT - 1);
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
    const spr = document.createElement("canvas");
    spr.width = SPR_SIZE;
    spr.height = SPR_SIZE;
    const sctx = spr.getContext("2d")!;
    const c = SPR_SIZE * 0.5;
    const g = sctx.createRadialGradient(c, c, 0, c, c, c);
    const col = rr + "," + gg + "," + bb;
    g.addColorStop(0, "rgba(" + col + ",1)");
    g.addColorStop(0.4, "rgba(" + col + ",0.62)");
    g.addColorStop(0.75, "rgba(" + col + ",0.16)");
    g.addColorStop(1, "rgba(" + col + ",0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, SPR_SIZE, SPR_SIZE);
    sprites[k] = spr;
  }
  return sprites;
}

/* ================= hero bloom tuning (validated Jones params) ================= */

const H_SD = 7.5; // sensor distance, cells
const H_SA = 0.4; // sensor angle
const H_TA = 0.45; // turn angle
const H_SPEED = 1.0;
const H_DEPOSIT = 0.15;
const H_EVAP = 0.94;
const H_JIT = 0.12;
const H_CAP = 6;
const H_KNEE = 0.8; // soft-knee tone map: n = v / (v + KNEE)
const H_GUIDE_W = 1.7; // weight of the lane/funnel attractant when sensing
const H_W = 300; // fixed grid width  (persists across navigations)
const H_H = 176; // fixed grid height
const H_FREEZE_STEPS = 300; // reduced-motion settle
const hCosSA = Math.cos(H_SA);
const hSinSA = Math.sin(H_SA);
const hCosTA = Math.cos(H_TA);
const hSinTA = Math.sin(H_TA);

/* ================= ribbon tuning ================= */

const RIB_WID = 21; // trunk lateral cells
const BR_WID = 13; // branch lateral cells
const LAT_SCALE = 2.4; // px per lateral cell (~48px, <=64)
const BR_LAT = 2.2;
const ARC_STRIDE = 4; // px per trunk arc cell
const BR_ARC = 6;
const GUIDE_SIGMA = 2.5;
const GUIDE_PEAK = 1;
const GUIDE_WEIGHT = 0.7;
const SD = 3;
const SA = 0.5;
const TA = 0.42;
const SPEED = 1.05;
const JIT = 0.22;
const HCONE = 1.15;
const DEPOSIT = 0.2;
const CAP = 4;
const EVAP = 0.9;
const FRONT_LERP = 0.09;
const BR_FRONT_LERP = 0.05;
const DIFFUSE_MARGIN = 6;
const KNEE_R = 0.55; // ribbon tone map knee (softer core)
const REVEAL_FEATHER = 12; // arc cells over which the growth tip fades in
const MIN_N = 0.05; // skip near-invisible ribbon arc steps
/* ribbon is stamped as overlapping soft sprites, one per arc step: spacing
   (ARC_STRIDE / BR_ARC) stays well under 2*R_MIN so stamps fuse (no comb) */
const R_MIN = 3.4; // min stamp radius, px (>= BR_ARC/2 -> guaranteed overlap)
const R_SPAN = 5.5; // extra radius at full intensity, px
const SUM_KNEE = 3.5; // width tone map: wide where the strand is reinforced
const ALPHA_MAX = 0.82; // cap per-stamp alpha -> soft, never a solid pipe
const SPR_COUNT = 12; // colour buckets (umber->gold)
const SPR_SIZE = 40; // sprite bitmap size, px
const MAX_RIBBON_AGENTS = 1800;
const MAX_TRUNK_AGENTS = 1200;
const STEP_MS = 30; // ~33fps step cap (breathing is slow)

const TAU = Math.PI * 2;
const cosSA = Math.cos(SA);
const sinSA = Math.sin(SA);
const SVGNS = "http://www.w3.org/2000/svg";

/* ================= ribbon model ================= */

interface Ribbon {
  len: number;
  wid: number;
  latScale: number;
  cx: Float32Array;
  cy: Float32Array; // trunk: monotonic in document-y
  nx: Float32Array;
  ny: Float32Array;
  guide: Float32Array;
  field: Float32Array;
  tmp: Float32Array;
  ag: Float32Array; // [s, u, heading] * nAg
  nAg: number;
  isTrunk: boolean;
  anchorS: number; // trunk arc index a branch attaches to (0 for trunk)
  active: boolean;
  frontier: number;
  wob: Float32Array; // per-arc radius modulation (organic width variation)
}

interface Pt {
  x: number;
  y: number;
}

interface BranchDef {
  sx: number;
  sy: number;
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
  tx: number;
  ty: number;
  anchorY: number;
}

/* ================= pure helpers (allocation-free in the frame path) ================= */

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clampInt(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
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

/** Float arc index whose centreline-y is `y` (cy monotonic increasing). */
function arcIndexAtY(cy: Float32Array, len: number, y: number): number {
  if (len < 2) return 0;
  if (y <= cy[0]!) return 0;
  if (y >= cy[len - 1]!) return len - 1;
  let lo = 0;
  let hi = len - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cy[mid]! < y) lo = mid;
    else hi = mid;
  }
  const y0 = cy[lo]!;
  const y1 = cy[hi]!;
  const denom = y1 - y0;
  return lo + (denom > 1e-4 ? (y - y0) / denom : 0);
}

function senseR(
  guide: Float32Array,
  field: Float32Array,
  len: number,
  wid: number,
  sf: number,
  uf: number,
): number {
  let si = sf | 0;
  if (si < 0) si = 0;
  else if (si > len - 1) si = len - 1;
  let ui = uf | 0;
  if (ui < 0) ui = 0;
  else if (ui > wid - 1) ui = wid - 1;
  const idx = si * wid + ui;
  return guide[idx]! * GUIDE_WEIGHT + field[idx]!;
}

/** Advance a ribbon's agents one step (sense, turn, move, gate, deposit). */
function stepRibbon(r: Ribbon): void {
  const len = r.len;
  const wid = r.wid;
  const guide = r.guide;
  const field = r.field;
  const ag = r.ag;
  const n = r.nAg;
  const frontI = r.frontier + 1.5;
  const half = (wid - 1) * 0.5;
  for (let i = 0; i < n; i++) {
    const b = i * 3;
    let s = ag[b]!;
    let u = ag[b + 1]!;
    let h = ag[b + 2]! + (Math.random() - 0.5) * JIT;
    const ch = Math.cos(h);
    const sh = Math.sin(h);
    const fv = senseR(guide, field, len, wid, s + ch * SD, u + sh * SD);
    const lv = senseR(
      guide,
      field,
      len,
      wid,
      s + (ch * cosSA + sh * sinSA) * SD,
      u + (sh * cosSA - ch * sinSA) * SD,
    );
    const rv = senseR(
      guide,
      field,
      len,
      wid,
      s + (ch * cosSA - sh * sinSA) * SD,
      u + (sh * cosSA + ch * sinSA) * SD,
    );
    if (fv >= lv && fv >= rv) {
      /* keep heading */
    } else if (lv > fv && rv > fv) {
      h += Math.random() < 0.5 ? -TA : TA;
    } else if (lv > rv) {
      h -= TA;
    } else {
      h += TA;
    }
    if (h > HCONE) h = HCONE;
    else if (h < -HCONE) h = -HCONE;
    s += Math.cos(h) * SPEED;
    u += Math.sin(h) * SPEED;
    if (u < 0) {
      u = 0;
      h = -h;
    } else if (u > wid - 1) {
      u = wid - 1;
      h = -h;
    }
    if (s >= frontI || s >= len - 1) {
      if (Math.random() < 0.55) s = Math.random() * 2;
      else s = Math.random() * (frontI > 0 ? frontI : 1);
      u = half + (Math.random() - 0.5) * 3;
      h = (Math.random() - 0.5) * 0.6;
    } else if (s < 0) {
      s = 0;
    }
    ag[b] = s;
    ag[b + 1] = u;
    ag[b + 2] = h;
    let si = s | 0;
    if (si < 0) si = 0;
    else if (si > len - 1) si = len - 1;
    let ui = u | 0;
    if (ui < 0) ui = 0;
    else if (ui > wid - 1) ui = wid - 1;
    const idx = si * wid + ui;
    let nv = field[idx]! + DEPOSIT;
    if (nv > CAP) nv = CAP;
    field[idx] = nv;
    if (ui > 0) {
      let lv2 = field[idx - 1]! + DEPOSIT * 0.45;
      field[idx - 1] = lv2 > CAP ? CAP : lv2;
    }
    if (ui < wid - 1) {
      let rv2 = field[idx + 1]! + DEPOSIT * 0.45;
      field[idx + 1] = rv2 > CAP ? CAP : rv2;
    }
  }
}

/** 3x3 blur folded with evaporation, rows [0, maxRow). Buffers swapped. */
function diffuse(r: Ribbon, maxRow: number): void {
  const wid = r.wid;
  const len = r.len;
  const f = r.field;
  const t = r.tmp;
  const rows = maxRow < len ? maxRow : len;
  const e = EVAP / 9;
  for (let s = 0; s < rows; s++) {
    const s0 = (s > 0 ? s - 1 : 0) * wid;
    const s1 = s * wid;
    const s2 = (s < len - 1 ? s + 1 : len - 1) * wid;
    for (let u = 0; u < wid; u++) {
      const u0 = u > 0 ? u - 1 : 0;
      const u2 = u < wid - 1 ? u + 1 : wid - 1;
      t[s1 + u] =
        (f[s0 + u0]! +
          f[s0 + u]! +
          f[s0 + u2]! +
          f[s1 + u0]! +
          f[s1 + u]! +
          f[s1 + u2]! +
          f[s2 + u0]! +
          f[s2 + u]! +
          f[s2 + u2]!) *
        e;
    }
  }
  r.field = t;
  r.tmp = f;
}

function blankRibbon(len: number, wid: number, latScale: number): Ribbon {
  const cells = len * wid;
  return {
    len,
    wid,
    latScale,
    cx: new Float32Array(len),
    cy: new Float32Array(len),
    nx: new Float32Array(len),
    ny: new Float32Array(len),
    guide: new Float32Array(cells),
    field: new Float32Array(cells),
    tmp: new Float32Array(cells),
    ag: new Float32Array(0),
    nAg: 0,
    isTrunk: false,
    anchorS: 0,
    active: false,
    frontier: 0,
    wob: new Float32Array(len),
  };
}

/** Smooth per-arc radius noise in ~[0.6, 1.4] so the strand width breathes. */
function computeWob(r: Ribbon, seed: number): void {
  const rnd = mulberry32(seed);
  const p1 = rnd() * TAU;
  const p2 = rnd() * TAU;
  const p3 = rnd() * TAU;
  for (let i = 0; i < r.len; i++) {
    const w =
      0.55 * Math.sin(i * 0.11 + p1) +
      0.3 * Math.sin(i * 0.27 + p2) +
      0.15 * Math.sin(i * 0.5 + p3);
    r.wob[i] = 1 + w * 0.4;
  }
}

function computeNormals(r: Ribbon): void {
  const len = r.len;
  const cx = r.cx;
  const cy = r.cy;
  for (let i = 0; i < len; i++) {
    const i0 = i > 0 ? i - 1 : i;
    const i1 = i < len - 1 ? i + 1 : i;
    let tx = cx[i1]! - cx[i0]!;
    let ty = cy[i1]! - cy[i0]!;
    const m = Math.sqrt(tx * tx + ty * ty) || 1;
    tx /= m;
    ty /= m;
    r.nx[i] = -ty;
    r.ny[i] = tx;
  }
}

function depositGuide(r: Ribbon): void {
  const len = r.len;
  const wid = r.wid;
  const half = (wid - 1) * 0.5;
  const twoSigma2 = 2 * GUIDE_SIGMA * GUIDE_SIGMA;
  for (let s = 0; s < len; s++) {
    const row = s * wid;
    for (let u = 0; u < wid; u++) {
      const du = u - half;
      r.guide[row + u] = GUIDE_PEAK * Math.exp(-(du * du) / twoSigma2);
    }
  }
}

function seedRibbonAgents(r: Ribbon, n: number): void {
  r.nAg = n;
  r.ag = new Float32Array(n * 3);
  const half = (r.wid - 1) * 0.5;
  const top = Math.min(r.len, 4);
  for (let i = 0; i < n; i++) {
    const b = i * 3;
    r.ag[b] = Math.random() * top;
    r.ag[b + 1] = half + (Math.random() - 0.5) * 3;
    r.ag[b + 2] = (Math.random() - 0.5) * 0.6;
  }
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
  const sprites = buildSprites();

  /* ---- hero bloom state (fixed-resolution torus grid, persists across nav) ---- */
  const heroCanvas = document.createElement("canvas");
  heroCanvas.width = H_W;
  heroCanvas.height = H_H;
  const heroCtx = heroCanvas.getContext("2d", { alpha: true })!;
  const heroImg = heroCtx.createImageData(H_W, H_H);
  const heroBuf32 = new Uint32Array(heroImg.data.buffer);
  const H_CELLS = H_W * H_H;
  let heroTrail = new Float32Array(H_CELLS);
  let heroTmp = new Float32Array(H_CELLS);
  const heroGuide = new Float32Array(H_CELLS);
  const H_N = clampInt(Math.round(H_CELLS * 0.14), 4000, 9000);
  const H_RESPAWN = Math.max(1, (H_N * 0.002) | 0);
  const heroAg = new Float32Array(H_N * 3);
  let heroSeeded = false;

  /* ---- ribbon + document state ---- */
  let ribbons: Ribbon[] = [];
  let cssW = 1;
  let docH = 1;
  let scale = 1;
  let heroTop = 0;
  let heroH = 0;
  let vh = window.innerHeight;

  /* seed the bloom left-weighted so the mass gathers toward the trunk mouth */
  function seedHero(): void {
    const cx = H_W * 0.24;
    const cy = H_H * 0.5;
    const R = Math.min(H_W, H_H) * 0.3;
    const nRing = Math.floor(H_N * 0.6);
    let k = 0;
    for (let i = 0; i < nRing; i++) {
      const a = Math.random() * TAU;
      const rr = R * (0.9 + Math.random() * 0.18);
      heroAg[k++] = (cx + Math.cos(a) * rr + H_W) % H_W;
      heroAg[k++] = (cy + Math.sin(a) * rr + H_H) % H_H;
      heroAg[k++] = a + Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    }
    const c1x = H_W * 0.1;
    const c1y = H_H * 0.78;
    const c2x = H_W * 0.4;
    const c2y = H_H * 0.22;
    const cr = Math.min(H_W, H_H) * 0.09;
    for (let i = nRing; i < H_N; i++) {
      const even = (i & 1) === 0;
      const a = Math.random() * TAU;
      const rr = cr * Math.sqrt(Math.random());
      heroAg[k++] = ((even ? c1x : c2x) + Math.cos(a) * rr + H_W) % H_W;
      heroAg[k++] = ((even ? c1y : c2y) + Math.sin(a) * rr + H_H) % H_H;
      heroAg[k++] = Math.random() * TAU;
    }
    heroSeeded = true;
  }

  /* A soft, gently meandering vertical BAND down an interior left lane (not a
     razor column pinned to the hard edge, which used to pile trail into a
     saturated straight bar). `spill` widens the rightward tail: wide on full
     heroes, tight on band. A bottom-left funnel feeds the trunk mouth. */
  function buildHeroGuide(spill: number): void {
    const xc0 = H_W * 0.11; // lane centre, kept off the left edge
    const sigL = H_W * 0.05; // steep-ish toward the edge -> no edge pile-up
    const sigR = H_W * spill; // soft rightward spill (variant-controlled)
    const twoSigL2 = 2 * sigL * sigL;
    const fsx = H_W * 0.1;
    const fsy = H_H * 0.34;
    const twoFsx2 = 2 * fsx * fsx;
    const twoFsy2 = 2 * fsy * fsy;
    for (let y = 0; y < H_H; y++) {
      // organic meander so the lit strand never reads as a ruled line
      const xc = xc0 + Math.sin(y * 0.05) * H_W * 0.03 + Math.sin(y * 0.017 + 1.3) * H_W * 0.02;
      const dyF = y - H_H; // funnel toward the very bottom (trunk mouth)
      for (let x = 0; x < H_W; x++) {
        const dx = x - xc;
        const twoS2 = dx < 0 ? twoSigL2 : 2 * sigR * sigR;
        const band = Math.exp(-(dx * dx) / twoS2);
        const dxF = x - xc0;
        const funnel = Math.exp(-(dxF * dxF) / twoFsx2 - (dyF * dyF) / twoFsy2);
        heroGuide[y * H_W + x] = band * 0.75 + funnel * 0.9;
      }
    }
  }

  const heroMask = document.createElement("canvas");
  heroMask.width = H_W;
  heroMask.height = H_H;
  const heroMaskCtx = heroMask.getContext("2d", { alpha: true })!;
  const heroMaskImg = heroMaskCtx.createImageData(H_W, H_H);

  /* Alpha mask that feathers all borders of the bloom rect (so the drawImage
     boundary is invisible); on the band variant it also confines the mass to
     the left ~46% with a soft tail, instead of full-width strands. */
  function buildHeroMask(full: boolean): void {
    const d = heroMaskImg.data;
    const edgeT = H_H * 0.12;
    const edgeB = H_H * 0.1;
    const edgeL = H_W * 0.09;
    const edgeR = full ? H_W * 0.14 : H_W * 0.18;
    const confineStart = 0.46;
    const confineEnd = 0.62;
    for (let y = 0; y < H_H; y++) {
      let ty = Math.min(y, H_H - 1 - y) / (y < H_H * 0.5 ? edgeT : edgeB);
      if (ty > 1) ty = 1;
      else if (ty < 0) ty = 0;
      const fy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < H_W; x++) {
        let tx = Math.min(x / edgeL, (H_W - 1 - x) / edgeR);
        if (tx > 1) tx = 1;
        else if (tx < 0) tx = 0;
        const fx = tx * tx * (3 - 2 * tx);
        let a = fy * fx;
        if (!full) {
          const fr = x / H_W;
          const c =
            fr <= confineStart
              ? 1
              : fr >= confineEnd
                ? 0
                : 1 - (fr - confineStart) / (confineEnd - confineStart);
          a *= c * c;
        }
        d[(y * H_W + x) * 4 + 3] = (a * 255) | 0;
      }
    }
    heroMaskCtx.putImageData(heroMaskImg, 0, 0);
  }

  function heroSense(sx: number, sy: number): number {
    let xi = sx | 0;
    let yi = sy | 0;
    if (xi < 0) xi += H_W;
    else if (xi >= H_W) xi -= H_W;
    if (yi < 0) yi += H_H;
    else if (yi >= H_H) yi -= H_H;
    const idx = yi * H_W + xi;
    return heroTrail[idx]! + heroGuide[idx]! * H_GUIDE_W;
  }

  function stepHero(): void {
    for (let i = 0; i < H_N; i++) {
      const j = i * 3;
      let x = heroAg[j]!;
      let y = heroAg[j + 1]!;
      let h = heroAg[j + 2]! + (Math.random() - 0.5) * H_JIT;
      let ch = Math.cos(h);
      let sh = Math.sin(h);
      const f = heroSense(x + ch * H_SD, y + sh * H_SD);
      const l = heroSense(
        x + (ch * hCosSA + sh * hSinSA) * H_SD,
        y + (sh * hCosSA - ch * hSinSA) * H_SD,
      );
      const r = heroSense(
        x + (ch * hCosSA - sh * hSinSA) * H_SD,
        y + (sh * hCosSA + ch * hSinSA) * H_SD,
      );
      let d = 0;
      if (f >= l && f >= r) d = 0;
      else if (l > f && r > f) d = Math.random() < 0.5 ? -H_TA : H_TA;
      else if (l > r) d = -H_TA;
      else d = H_TA;
      if (d !== 0) {
        const sgn = d > 0 ? hSinTA : -hSinTA;
        const c2 = ch * hCosTA - sh * sgn;
        const s2 = sh * hCosTA + ch * sgn;
        ch = c2;
        sh = s2;
        h += d;
      }
      x += ch * H_SPEED;
      y += sh * H_SPEED;
      if (x < 0) x += H_W;
      else if (x >= H_W) x -= H_W;
      if (y < 0) y += H_H;
      else if (y >= H_H) y -= H_H;
      heroAg[j] = x;
      heroAg[j + 1] = y;
      heroAg[j + 2] = h;
      const ti = (y | 0) * H_W + (x | 0);
      const nv = heroTrail[ti]! + H_DEPOSIT;
      heroTrail[ti] = nv > H_CAP ? H_CAP : nv;
    }
    for (let i = 0; i < H_RESPAWN; i++) {
      const j = ((Math.random() * H_N) | 0) * 3;
      // respawn left-biased so the colony keeps its centre of mass on the left
      heroAg[j] = Math.random() * Math.random() * H_W;
      heroAg[j + 1] = Math.random() * H_H;
      heroAg[j + 2] = Math.random() * TAU;
    }
    const e9 = H_EVAP / 9;
    for (let yy = 0; yy < H_H; yy++) {
      const y0 = ((yy - 1 + H_H) % H_H) * H_W;
      const y1 = yy * H_W;
      const y2 = ((yy + 1) % H_H) * H_W;
      for (let xx = 0; xx < H_W; xx++) {
        const x0 = xx === 0 ? H_W - 1 : xx - 1;
        const x2 = xx === H_W - 1 ? 0 : xx + 1;
        heroTmp[y1 + xx] =
          (heroTrail[y0 + x0]! +
            heroTrail[y0 + xx]! +
            heroTrail[y0 + x2]! +
            heroTrail[y1 + x0]! +
            heroTrail[y1 + xx]! +
            heroTrail[y1 + x2]! +
            heroTrail[y2 + x0]! +
            heroTrail[y2 + xx]! +
            heroTrail[y2 + x2]!) *
          e9;
      }
    }
    const swap = heroTrail;
    heroTrail = heroTmp;
    heroTmp = swap;
  }

  function renderHero(): void {
    for (let i = 0; i < H_CELLS; i++) {
      const v = heroTrail[i]!;
      heroBuf32[i] = LUT[((v / (v + H_KNEE)) * 255) | 0]!;
    }
    heroCtx.putImageData(heroImg, 0, 0);
    // feather + confine the bloom so the rect boundary is invisible
    heroCtx.globalCompositeOperation = "destination-in";
    heroCtx.drawImage(heroMask, 0, 0);
    heroCtx.globalCompositeOperation = "source-over";
    // draw the bloom into the measured hero rect (document coords; scaled).
    ctx!.drawImage(heroCanvas, 0, 0, H_W, H_H, 0, heroTop, cssW, heroH);
  }

  /** Render a ribbon's grown field in document coords, viewport-culled. */
  function renderRibbonField(r: Ribbon): void {
    const len = r.len;
    const wid = r.wid;
    const latScale = r.latScale;
    const cx = r.cx;
    const cy = r.cy;
    const nx = r.nx;
    const ny = r.ny;
    const wob = r.wob;
    const field = r.field;
    const guide = r.guide;
    const half = (wid - 1) * 0.5;
    const front = r.frontier;
    let maxI = Math.ceil(front);
    if (maxI > len - 1) maxI = len - 1;
    const top = scrollTopCache;
    const bot = top + vh;
    // one overlapping soft stamp per arc step: centred on the field's lateral
    // centroid, radius grown by how reinforced the strand is (organic width),
    // colour by peak intensity. Overlap (spacing << 2*R) fuses it into a
    // continuous filament; source-over avoids junction bulges.
    for (let i = 0; i <= maxI; i++) {
      const yc = cy[i]!;
      if (yc < top - 16 || yc > bot + 16) continue;
      const feather = front - i;
      const fm = feather >= REVEAL_FEATHER ? 1 : feather <= 0 ? 0 : feather / REVEAL_FEATHER;
      if (fm <= 0) continue;
      const base = i * wid;
      let sum = 0;
      let wsum = 0;
      let peak = 0;
      for (let u = 0; u < wid; u++) {
        const v = field[base + u]! + guide[base + u]! * GUIDE_WEIGHT;
        sum += v;
        wsum += v * u;
        if (v > peak) peak = v;
      }
      if (sum < 1e-3) continue;
      const coreN = peak / (peak + KNEE_R);
      const alpha = coreN * fm * ALPHA_MAX;
      if (alpha < MIN_N) continue;
      const uc = wsum / sum;
      const widthN = sum / (sum + SUM_KNEE);
      const rad = (R_MIN + R_SPAN * widthN) * wob[i]!;
      const off = (uc - half) * latScale;
      const wx = cx[i]! + nx[i]! * off;
      const wy = yc + ny[i]! * off;
      let bk = (coreN * (SPR_COUNT - 1)) | 0;
      if (bk < 0) bk = 0;
      else if (bk > SPR_COUNT - 1) bk = SPR_COUNT - 1;
      ctx!.globalAlpha = alpha;
      ctx!.drawImage(sprites[bk]!, wx - rad, wy - rad, rad * 2, rad * 2);
    }
    ctx!.globalAlpha = 1;
  }

  /* ---- frame loop, gated on visibility + active domains ---- */
  let rafId = 0;
  let running = false;
  let last = 0;
  let destroyed = false;
  let scrollTopCache = 0;

  function frame(ts: number): void {
    rafId = requestAnimationFrame(frame);
    if (ts - last < STEP_MS) return;
    last = ts;

    const sy = window.pageYOffset || 0;
    scrollTopCache = sy;
    const viewTop = sy;
    const viewBot = sy + vh;

    // advance the trunk frontier from scroll (cheap; always) + branch waking
    const trunk = ribbons[0];
    if (trunk) {
      const tipY = sy + vh * 0.5;
      const tgt = arcIndexAtY(trunk.cy, trunk.len, tipY);
      trunk.frontier += (tgt - trunk.frontier) * FRONT_LERP;
      const tf = trunk.frontier;
      for (let i = 1; i < ribbons.length; i++) {
        const br = ribbons[i];
        if (br && !br.active && tf >= br.anchorS) br.active = true;
      }
    }

    // clear only the current viewport band; grown regions above stay painted
    ctx!.clearRect(0, sy, cssW, vh);

    // hero bloom: step + draw only while the hero band is near the viewport
    const heroBottom = heroTop + heroH;
    const heroActive = heroBottom > viewTop - vh * 0.5 && heroTop < viewBot + vh * 0.25;
    if (heroActive) {
      stepHero();
      renderHero();
    }

    // ribbons: step + render only while their grown span meets the viewport
    for (let i = 0; i < ribbons.length; i++) {
      const r = ribbons[i];
      if (!r || !r.active) continue;
      let maxI = Math.ceil(r.frontier);
      if (maxI > r.len - 1) maxI = r.len - 1;
      const spanTop = r.cy[0]!;
      const spanBot = r.cy[maxI]!;
      const visible = spanBot > viewTop - vh * 0.25 && spanTop < viewBot + vh * 0.25;
      if (!r.isTrunk) {
        const tg = r.len - 1;
        r.frontier += (tg - r.frontier) * BR_FRONT_LERP;
      }
      if (!visible) continue;
      stepRibbon(r);
      let maxRow = Math.ceil(r.frontier) + DIFFUSE_MARGIN;
      if (maxRow > r.len) maxRow = r.len;
      diffuse(r, maxRow);
      renderRibbonField(r);
    }
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

  function makeTrunkRibbon(tlen: number): Ribbon {
    const rl = clampInt(Math.round(tlen / ARC_STRIDE), 24, 1600);
    const r = blankRibbon(rl, RIB_WID, LAT_SCALE);
    for (let i = 0; i < rl; i++) {
      const p = trunkEl!.getPointAtLength((tlen * i) / (rl - 1));
      r.cx[i] = p.x;
      r.cy[i] = p.y;
    }
    computeNormals(r);
    depositGuide(r);
    computeWob(r, 0x7ea1 ^ (r.len & 0xffff));
    r.isTrunk = true;
    r.active = true;
    r.anchorS = 0;
    return r;
  }

  function makeBranchRibbon(def: BranchDef, trunk: Ribbon): Ribbon {
    const chord = Math.hypot(def.tx - def.sx, def.ty - def.sy);
    const rl = clampInt(Math.round((chord * 1.15) / BR_ARC), 6, 60);
    const r = blankRibbon(rl, BR_WID, BR_LAT);
    for (let i = 0; i < rl; i++) {
      const t = rl > 1 ? i / (rl - 1) : 0;
      r.cx[i] = cubicAt(t, def.sx, def.c1x, def.c2x, def.tx);
      r.cy[i] = cubicAt(t, def.sy, def.c1y, def.c2y, def.ty);
    }
    computeNormals(r);
    depositGuide(r);
    computeWob(r, (0xb2c3 + def.anchorY * 131) | 0);
    r.isTrunk = false;
    r.active = false;
    r.anchorS = arcIndexAtY(trunk.cy, trunk.len, def.anchorY);
    return r;
  }

  function sizeCanvas(): void {
    scale = 1; // document-tall canvas: keep backing bounded on integrated GPUs
    canvas!.width = Math.max(1, Math.round(cssW * scale));
    canvas!.height = Math.max(1, Math.round(docH * scale));
    canvas!.style.height = docH + "px";
    ctx!.setTransform(scale, 0, 0, scale, 0, 0);
    ctx!.imageSmoothingEnabled = true;
  }

  /**
   * Measure the page, (re)generate the SVG reference path + ribbon domain, and
   * refresh the hero rect. Preserves the hero field (bloom continuity); resets
   * the below-hero frontier to the current scroll.
   */
  function build(): void {
    if (destroyed) return;

    const W = document.documentElement.clientWidth || window.innerWidth;
    cssW = W;
    vh = window.innerHeight;
    const mobile = W < 768;
    const scrollY = window.pageYOffset || 0;
    const scrollX = window.pageXOffset || 0;

    const hero = document.querySelector<HTMLElement>(".hero");
    const heroFull = !!document.querySelector(".hero.full");
    const footer =
      document.querySelector(".site-foot") || document.querySelector("footer");

    let startY: number;
    if (hero) {
      const hr = hero.getBoundingClientRect();
      heroTop = hr.top + scrollY;
      heroH = hr.height;
      // seam the trunk just inside the hero bottom so it emerges from the bloom
      startY = heroTop + heroH - heroH * 0.08;
    } else {
      heroTop = 0;
      heroH = 0;
      const main = document.querySelector("main");
      startY = main ? main.getBoundingClientRect().top + scrollY + 8 : 80;
    }

    let endY = 0;
    if (footer) {
      const fr = footer.getBoundingClientRect();
      endY = fr.top + scrollY + Math.min(fr.height * 0.5, 90);
    }

    // collapse both layers before measuring so they never inflate scrollHeight
    // (the SVG is absolutely positioned; a stale height would self-perpetuate)
    canvas!.style.height = "0px";
    svg!.style.height = "0px";
    docH = Math.max(document.documentElement.scrollHeight, endY + 40, startY + 400);
    if (!footer || endY <= startY + 40) endY = docH - 40;
    if (endY <= startY + 40) endY = startY + 400;

    // SVG spans the full document (fallback stroke + coordinate space). Drive
    // its visibility from the captured anim flag rather than the html.anim CSS
    // gate, which ClientRouter drops from <html> on navigation.
    svg!.setAttribute("viewBox", "0 0 " + W + " " + docH);
    svg!.setAttribute("width", String(W));
    svg!.setAttribute("height", String(docH));
    svg!.style.height = docH + "px";
    svg!.style.display = anim ? "none" : "block";

    // ---- trunk: seeded organic meander down a left lane ----
    const rnd = mulberry32(0x5eed21 ^ (W & 0xffff));
    const laneX = mobile
      ? Math.max(11, W * 0.04)
      : Math.max(20, Math.min(44, W * 0.03));
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
    const defs: BranchDef[] = [];
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
        const ang = (br() < 0.5 ? -1 : 1) * (0.5 + br() * 0.7);
        const ex = mx + Math.cos(ang) * len * (dx > 0 ? 1 : -1);
        const ey = my + Math.sin(ang) * len;
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
      const path = document.createElementNS(SVGNS, "path");
      path.setAttribute("d", d);
      brg!.appendChild(path);
      defs.push({ sx, sy, c1x, c1y, c2x, c2y, tx, ty, anchorY: sy });
    }

    // hero guide follows the variant: full spills softer, band stays tight
    buildHeroGuide(heroFull ? 0.6 : 0.34);
    buildHeroMask(heroFull);
    if (!heroSeeded) seedHero();

    if (!anim) {
      // reduced motion: static SVG + a settled, frozen bloom drawn once.
      stopLoop();
      ribbons = [];
      sizeCanvas();
      ctx!.clearRect(0, 0, cssW, docH);
      if (heroH > 0) {
        for (let s = 0; s < H_FREEZE_STEPS; s++) stepHero();
        renderHero();
      }
      return;
    }

    // ---- ribbon domain: trunk + dormant pouring branches ----
    const next: Ribbon[] = [];
    if (tlen > 1) {
      const trunk = makeTrunkRibbon(tlen);
      const nBr = defs.length;
      const trunkAgents = clampInt(trunk.len, 300, MAX_TRUNK_AGENTS);
      seedRibbonAgents(trunk, trunkAgents);
      next.push(trunk);
      if (nBr > 0) {
        const remaining = MAX_RIBBON_AGENTS - trunkAgents;
        const per = clampInt(Math.floor(remaining / nBr), 12, 48);
        for (let i = 0; i < nBr; i++) {
          const rib = makeBranchRibbon(defs[i]!, trunk);
          seedRibbonAgents(rib, per);
          next.push(rib);
        }
      }
    }
    ribbons = next;

    sizeCanvas();
    startLoop();
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
      // re-measure the new page; the persisted hero field carries over.
      queueBuild();
    },
    destroy() {
      destroyed = true;
      stopLoop();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      ribbons = [];
      delete canvas.dataset.mycMounted;
    },
  };
}
