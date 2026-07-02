/**
 * Scroll filament, physarum-driven (spec 2.3).
 *
 * A seeded organic **reference path** runs down the page margin (trunk + one
 * hypha per terminal-panel header), generated exactly like mockup D by
 * measuring the live document. That path is drawn once into an `<svg>` layer;
 * the living rendering is a small dedicated physarum sim on a `<canvas>`.
 *
 * The sim does not run over document pixels. Each strand is *rectified* into a
 * narrow ribbon field, arc-length x lateral-offset (<=64px-wide equivalent, low
 * res). The reference path pre-deposits a faint, permanent **guide trail**
 * (attractant) down each ribbon's centreline; agents spawn at the top, sense
 * the guide + their own evaporating reinforcement, wobble, and colonise it.
 *
 * Growth is scroll-gated: the frontier is the arc-length whose document-y sits
 * at the viewport middle (smoothed with a small lerp). Agents cannot advance
 * past the frontier; branch ribbons stay dormant until the trunk frontier
 * reaches their anchor. There is no `scroll` listener: a single rAF loop reads
 * `scrollY`, gated by `visibilitychange` (pauses when the tab is hidden).
 *
 * Modes:
 *  - no-JS         -> this module never runs; the SVG stays empty (mockup D).
 *  - reduced motion (`html.js` without `html.anim`) -> the SVG is built and
 *    fully drawn, static; no canvas, no loop.
 *  - `html.anim`   -> the SVG fades to a faint guide and the canvas sim runs.
 *
 * Budget: <=2000 agents total, ribbons a few thousand cells; the frame loop
 * allocates nothing (typed-array buffers are swapped, colour strings and the
 * fade rect are precomputed). Re-measure is the cold path (ResizeObserver on
 * the body + viewport resize + fonts.ready), where allocation is fine.
 */

export interface Filament {
  destroy(): void;
}

/* ---------------- tuning ---------------- */

const RIB_WID = 21; // trunk lateral cells (odd -> centred guide)
const BR_WID = 13; // branch lateral cells
const LAT_SCALE = 2.4; // px per lateral cell  (~48px ribbon, <=64)
const BR_LAT = 2.2; // px per lateral cell for branches
const ARC_STRIDE = 4; // px per trunk arc cell
const BR_ARC = 6; // px per branch arc cell
const GUIDE_SIGMA = 2.5; // guide gaussian width, cells (wider -> thicker strand)
const GUIDE_PEAK = 1; // guide attractant peak
const GUIDE_WEIGHT = 0.7; // guide contribution when sensing
const SD = 3; // sensor distance, cells
const SA = 0.5; // sensor angle, rad
const TA = 0.42; // turn angle, rad
const SPEED = 1.05; // cells per step
const JIT = 0.22; // heading jitter (organic wobble)
const HCONE = 1.15; // forward heading cone -> growth stays downward
const DEPOSIT = 0.2;
const CAP = 4; // reinforcement ceiling
const EVAP = 0.9; // evaporation (folded into the 3x3 blur)
const FRONT_LERP = 0.09; // trunk frontier smoothing
const BR_FRONT_LERP = 0.05; // branch growth smoothing
const DIFFUSE_MARGIN = 6; // rows kept evaporating past the frontier
const MAX_AGENTS = 2000;
const MAX_TRUNK_AGENTS = 1400;
const VMAX = CAP + GUIDE_PEAK * GUIDE_WEIGHT; // sensed value ceiling
const DOT = 3.5; // agent dot, css px (thicker living footprint)

const cosSA = Math.cos(SA);
const sinSA = Math.sin(SA);
const TAU = Math.PI * 2;
const SVGNS = "http://www.w3.org/2000/svg";

/* ---------------- ribbon model ---------------- */

interface Ribbon {
  len: number; // arc cells
  wid: number; // lateral cells
  latScale: number; // px per lateral cell
  cx: Float32Array; // centreline doc-x per arc cell
  cy: Float32Array; // centreline doc-y per arc cell (trunk: monotonic in y)
  nx: Float32Array; // unit normal x
  ny: Float32Array; // unit normal y
  guide: Float32Array; // permanent attractant (len*wid)
  field: Float32Array; // evaporating reinforcement (len*wid)
  tmp: Float32Array; // diffusion scratch (len*wid)
  ag: Float32Array; // agents: [s, u, heading] * nAg
  nAg: number;
  isTrunk: boolean;
  anchorS: number; // trunk arc index this branch attaches to (0 for trunk)
  active: boolean; // trunk always true; branch flips when frontier arrives
  frontier: number; // current smoothed growth frontier, arc cells
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

/* ---------------- pure helpers (allocation-free in the frame path) ---------------- */

/** Deterministic RNG so the organic path is stable across rebuilds. */
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

/** Catmull-Rom -> cubic path data (mockup D). */
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

/**
 * Float arc index whose centreline-y is `y`. Assumes `cy` monotonic increasing
 * (true for the trunk). Binary search + linear interpolation, no allocation.
 */
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

/** Sample guide + reinforcement at a fractional ribbon coordinate. */
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

/** Advance every agent one step: sense, turn, move, gate, deposit. */
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
      /* growth stream from the top, plus repopulation of the grown region */
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
    // lateral spread thickens the reinforced core of the strand
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

/* ---------------- ribbon construction (cold path) ---------------- */

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
  };
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

/** Pre-deposit the permanent gaussian guide down the centreline. */
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

function seedAgents(r: Ribbon, n: number): void {
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

/* ---------------- mount ---------------- */

export function mountFilament(root: HTMLElement): Filament {
  const svg = root.querySelector<SVGSVGElement>(".fila-svg");
  const trunkEl = root.querySelector<SVGPathElement>(".fila-svg .trunk");
  const brg = root.querySelector<SVGGElement>(".fila-svg .br");
  const canvas = root.querySelector<HTMLCanvasElement>(".fila-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;

  const anim = document.documentElement.classList.contains("anim");

  // If the essential nodes are missing there is nothing to drive.
  if (!svg || !trunkEl || !brg) {
    return { destroy() {} };
  }

  /* precomputed render assets (built once, referenced by the frame loop) */
  const PALETTE: string[] = [];
  for (let i = 0; i < 10; i++) {
    const tt = i / 9;
    const rr = Math.round(217 + (228 - 217) * tt);
    const gg = Math.round(162 + (178 - 162) * tt);
    const bb = Math.round(74 + (98 - 74) * tt);
    const a = (0.12 + 0.78 * tt).toFixed(3);
    PALETTE.push("rgba(" + rr + "," + gg + "," + bb + "," + a + ")");
  }
  const PAL_MAX = PALETTE.length - 1;
  const PAL_SCALE = PAL_MAX / VMAX;
  const FADE = "rgba(18,16,13,0.16)"; // bg at low alpha -> breathing trails

  let ribbons: Ribbon[] = [];
  let vh = window.innerHeight;
  let cssW = window.innerWidth;
  let cssH = window.innerHeight;
  let dprScale = 1;
  let rafId = 0;
  let running = false;
  let destroyed = false;

  function sizeCanvas(): void {
    if (!canvas) return;
    cssW = window.innerWidth;
    cssH = window.innerHeight;
    dprScale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dprScale);
    canvas.height = Math.round(cssH * dprScale);
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

  function renderRibbon(r: Ribbon, sy: number): void {
    if (!ctx) return;
    const len = r.len;
    const wid = r.wid;
    const latScale = r.latScale;
    const ag = r.ag;
    const field = r.field;
    const guide = r.guide;
    const cx = r.cx;
    const cy = r.cy;
    const nx = r.nx;
    const ny = r.ny;
    const n = r.nAg;
    const half = (wid - 1) * 0.5;
    const dh = DOT * 0.5;
    let cur = -1;
    for (let i = 0; i < n; i++) {
      const b = i * 3;
      const s = ag[b]!;
      const u = ag[b + 1]!;
      let si = s | 0;
      if (si < 0) si = 0;
      else if (si > len - 1) si = len - 1;
      const off = (u - half) * latScale;
      const wx = cx[si]! + nx[si]! * off;
      const scy = cy[si]! + ny[si]! * off - sy;
      if (scy < -6 || scy > cssH + 6) continue;
      let ui = u | 0;
      if (ui < 0) ui = 0;
      else if (ui > wid - 1) ui = wid - 1;
      const idx = si * wid + ui;
      const v = field[idx]! + guide[idx]! * GUIDE_WEIGHT;
      let bk = (v * PAL_SCALE) | 0;
      if (bk < 0) bk = 0;
      else if (bk > PAL_MAX) bk = PAL_MAX;
      if (bk !== cur) {
        ctx.fillStyle = PALETTE[bk]!;
        cur = bk;
      }
      ctx.fillRect(wx - dh, scy - dh, DOT, DOT);
    }
  }

  function frame(): void {
    rafId = requestAnimationFrame(frame);
    if (!ctx) return;
    const sy = window.pageYOffset || 0;

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

    ctx.setTransform(dprScale, 0, 0, dprScale, 0, 0);
    ctx.fillStyle = FADE;
    ctx.fillRect(0, 0, cssW, cssH);

    for (let i = 0; i < ribbons.length; i++) {
      const r = ribbons[i];
      if (!r || !r.active) continue;
      if (!r.isTrunk) {
        const tg = r.len - 1;
        r.frontier += (tg - r.frontier) * BR_FRONT_LERP;
      }
      stepRibbon(r);
      let maxRow = Math.ceil(r.frontier) + DIFFUSE_MARGIN;
      if (maxRow > r.len) maxRow = r.len;
      diffuse(r, maxRow);
      renderRibbon(r, sy);
    }
  }

  function startLoop(): void {
    if (running || !anim || destroyed) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }
  function stopLoop(): void {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  /** Sample the trunk path into a ribbon via exact arc-length points. */
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
    r.isTrunk = true;
    r.active = true;
    r.anchorS = 0;
    return r;
  }

  /** Sample a branch main-cubic into a dormant ribbon. */
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
    r.isTrunk = false;
    r.active = false;
    r.anchorS = arcIndexAtY(trunk.cy, trunk.len, def.anchorY);
    return r;
  }

  /**
   * Cold path: measure the document, (re)generate the SVG reference path, and
   * under `html.anim` rebuild the ribbons + (re)start the sim.
   */
  function build(): void {
    if (destroyed) return;

    const W = document.documentElement.clientWidth || window.innerWidth;
    vh = window.innerHeight;
    const mobile = W < 768;
    const scrollY = window.pageYOffset || 0;
    const scrollX = window.pageXOffset || 0;

    const hero = document.querySelector(".hero");
    const footer =
      document.querySelector(".site-foot") || document.querySelector("footer");

    let startY: number;
    if (hero) {
      // Begin inside the hero (~40% down) so the strand reads as growing OUT
      // of the hero network, through the fondu, into the page below.
      const hr = hero.getBoundingClientRect();
      startY = hr.top + scrollY + hr.height * 0.4;
    } else {
      const main = document.querySelector("main");
      startY = main ? main.getBoundingClientRect().top + scrollY + 8 : 80;
    }
    let endY = 0;
    if (footer) {
      const fr = footer.getBoundingClientRect();
      endY = fr.top + scrollY + Math.min(fr.height * 0.5, 90);
    }

    // Collapse the layer before measuring so it never inflates scrollHeight.
    svg!.style.height = "0px";
    const docH = Math.max(
      document.documentElement.scrollHeight,
      endY + 40,
      startY + 400,
    );
    if (!footer || endY <= startY + 40) endY = docH - 40;
    if (endY <= startY + 40) endY = startY + 400;

    svg!.setAttribute("viewBox", "0 0 " + W + " " + docH);
    svg!.setAttribute("width", String(W));
    svg!.setAttribute("height", String(docH));
    svg!.style.height = docH + "px";

    // ---- trunk: seeded organic meander down a left lane (mockup D) ----
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
      const ease = i === 0 ? 0 : 1; // anchor the very top on the lane
      pts.push({ x: laneX + (wob + jitter) * ease, y });
    }
    trunkEl!.setAttribute("d", catmull(pts));
    const tlen = trunkEl!.getTotalLength();

    // ---- branches toward each panel header ----
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
      // Depart the trunk a little above the header, then pour down-and-across.
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
      // Leave tangentially downward (c1 mostly down, barely across), then sweep
      // across into the header horizontally (c2 pulled back at header height):
      // an S that pours, never a perpendicular T.
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
      // 1-2 decorative sub-branchlets (SVG guide only; not simulated)
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

    if (!anim) {
      // Reduced motion: static, fully-drawn SVG. No canvas, no loop.
      root.classList.remove("living");
      stopLoop();
      ribbons = [];
      return;
    }

    // ---- rebuild ribbons + budget agents (trunk + dormant branches) ----
    root.classList.add("living");
    const next: Ribbon[] = [];
    if (tlen > 1) {
      const trunk = makeTrunkRibbon(tlen);
      const nBr = defs.length;
      const trunkAgents = clampInt(trunk.len, 400, MAX_TRUNK_AGENTS);
      seedAgents(trunk, trunkAgents);
      next.push(trunk);
      if (nBr > 0) {
        const remaining = MAX_AGENTS - trunkAgents;
        const per = clampInt(Math.floor(remaining / nBr), 12, 48);
        for (let i = 0; i < nBr; i++) {
          const rib = makeBranchRibbon(defs[i]!, trunk);
          seedAgents(rib, per);
          next.push(rib);
        }
      }
    }
    ribbons = next;

    sizeCanvas();
    if (ctx) ctx.setTransform(dprScale, 0, 0, dprScale, 0, 0);
    startLoop();
  }

  /* ---- lifecycle wiring (cold; no scroll listener anywhere) ---- */

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
    sizeCanvas();
    queueBuild();
  }

  const ro = new ResizeObserver(queueBuild);
  ro.observe(document.body);
  window.addEventListener("resize", onResize);
  if (anim) document.addEventListener("visibilitychange", onVisibility);

  // Build after layout settles; rebuild once fonts land (metrics shift).
  requestAnimationFrame(build);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!destroyed) queueBuild();
    });
  }

  return {
    destroy() {
      destroyed = true;
      stopLoop();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      ribbons = [];
    },
  };
}
