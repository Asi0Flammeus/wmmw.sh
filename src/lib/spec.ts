/**
 * One specular-rim driver for every [data-spec] element on the page.
 *
 * The rim is a masked conic gradient (see src/styles/stage.css) whose start
 * angle points at the cursor. Each element only needs two custom properties, so
 * a single pass over the collected nodes replaces one listener per component.
 *
 * Two easings, both frame-rate independent:
 *   angle:      ang += shortestArc(target - ang) * (1 - exp(-dt * 8))
 *   brightness: br  += (target - br)             * (1 - exp(-dt * 9))
 * Brightness rises as the pointer closes in, and clamps while the element holds
 * keyboard focus so tab navigation lights the same rim as the pointer.
 *
 * Rects are read once per resize, never per frame: a rim that costs a layout
 * read per element per frame is a rim that costs more than it is worth.
 */

import { subscribe, type PointerState } from "./pointer";

/** Past this distance from an element's centre the rim is dark. */
const REACH = 320;

/** Below this delta the element is settled and we stop writing styles. */
const SETTLED = 0.002;

interface Rim {
  el: HTMLElement;
  /** centre x; document space, or viewport space when `fixed` */
  cx: number;
  /** centre y; document space, or viewport space when `fixed` */
  cy: number;
  /** true when the element sits in a position:fixed subtree, so scroll does not move it */
  fixed: boolean;
  /** current angle in radians */
  ang: number;
  /** current brightness in [0, 1] */
  br: number;
  /** last written angle, to skip redundant style writes */
  wroteAng: number;
  wroteBr: number;
  focused: boolean;
}

let rims: Rim[] = [];
let detach: (() => void) | undefined;
let resizeObserver: ResizeObserver | undefined;
let measured = false;

/* Centres are stored in document space so scrolling needs no re-measure: the
   layout read stays once per resize. A fixed subtree is the exception, because
   scrolling does not move it, so those centres stay in viewport space. */
function measure(): void {
  for (const rim of rims) {
    rim.fixed = false;
    for (let node: HTMLElement | null = rim.el; node; node = node.parentElement) {
      if (getComputedStyle(node).position === "fixed") {
        rim.fixed = true;
        break;
      }
    }
    const r = rim.el.getBoundingClientRect();
    rim.cx = r.left + r.width * 0.5 + (rim.fixed ? 0 : window.scrollX);
    rim.cy = r.top + r.height * 0.5 + (rim.fixed ? 0 : window.scrollY);
  }
  measured = true;
}

function frame(dt: number, pointer: PointerState): void {
  if (!measured) measure();

  const away = Number.isNaN(pointer.cx);
  const ka = 1 - Math.exp(-dt * 8);
  const kb = 1 - Math.exp(-dt * 9);

  for (const rim of rims) {
    let targetAng = rim.ang;
    let targetBr = 0;

    if (rim.focused) {
      targetBr = 0.9;
    } else if (!away) {
      const dx = pointer.cx + (rim.fixed ? 0 : window.scrollX) - rim.cx;
      const dy = pointer.cy + (rim.fixed ? 0 : window.scrollY) - rim.cy;
      targetAng = Math.atan2(dy, dx);
      const d = Math.hypot(dx, dy);
      targetBr = Math.max(0, 1 - d / REACH);
      // Squared falloff: the rim should be a highlight, not a glow field.
      targetBr *= targetBr;
    }

    // Shortest arc, so the highlight never spins the long way round.
    let diff = targetAng - rim.ang;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    rim.ang += diff * ka;
    rim.br += (targetBr - rim.br) * kb;

    const a = Math.round(rim.ang * 100) / 100;
    const b = Math.round(rim.br * 100) / 100;
    if (Math.abs(a - rim.wroteAng) < SETTLED && Math.abs(b - rim.wroteBr) < SETTLED) {
      continue;
    }
    rim.wroteAng = a;
    rim.wroteBr = b;
    rim.el.style.setProperty("--spec-angle", `${a}rad`);
    rim.el.style.setProperty("--spec-bright", String(b));
  }
}

function onFocusIn(e: FocusEvent): void {
  const t = e.target as HTMLElement | null;
  for (const rim of rims) rim.focused = t !== null && rim.el.contains(t);
}

function onFocusOut(): void {
  for (const rim of rims) rim.focused = false;
}

/**
 * Collect every [data-spec] element and start driving it. Idempotent and
 * re-entrant: call it on every astro:page-load, it rebuilds the node list.
 */
export function initSpec(): void {
  teardownSpec();

  const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-spec]"));
  if (nodes.length === 0) return;

  rims = nodes.map((el) => ({
    el,
    cx: 0,
    cy: 0,
    fixed: false,
    ang: 2.4,
    br: 0,
    wroteAng: Number.NaN,
    wroteBr: Number.NaN,
    focused: false,
  }));
  measured = false;

  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      measured = false;
    });
    resizeObserver.observe(document.body);
  }

  detach = subscribe(frame);
}

export function teardownSpec(): void {
  detach?.();
  detach = undefined;
  resizeObserver?.disconnect();
  resizeObserver = undefined;
  document.removeEventListener("focusin", onFocusIn);
  document.removeEventListener("focusout", onFocusOut);
  for (const rim of rims) {
    rim.el.style.removeProperty("--spec-angle");
    rim.el.style.removeProperty("--spec-bright");
  }
  rims = [];
}
