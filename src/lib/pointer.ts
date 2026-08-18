/**
 * One pointer, one rAF, for the whole page.
 *
 * Everything that reacts to the cursor subscribes here instead of adding its
 * own listener and its own loop: the DOM parallax (--px / --py on <html>), the
 * header dock springs, the specular rims, and the WebGL stage camera. A second
 * rAF would double the layout-read pressure and let the layers drift apart by a
 * frame, which reads as the copy sliding on top of the scene.
 *
 * Contract:
 *  - `pointer.nx` / `pointer.ny` are the damped, normalized cursor in [-1, 1],
 *    origin at the viewport centre. Consumers read them, never write them.
 *  - `subscribe(fn)` gets `(dt, pointer)` once per frame and returns a detach fn.
 *  - Touch is excluded on purpose: coarse pointers get the authored centre pose.
 *    A parallax that snaps to a tap is worse than no parallax.
 */

export interface PointerState {
  /** damped x in [-1, 1] */
  nx: number;
  /** damped y in [-1, 1] */
  ny: number;
  /** raw client x in px, viewport space; NaN while the pointer is away */
  cx: number;
  /** raw client y in px, viewport space; NaN while the pointer is away */
  cy: number;
  /** false until a fine pointer has been seen */
  active: boolean;
  /** true when the visitor asked for less motion */
  reduced: boolean;
}

type Frame = (dt: number, p: PointerState) => void;

/** Damping per 60Hz frame. Sylva's 0.055 is slow enough to feel like weight. */
const DAMP = 0.055;

const target = { x: 0, y: 0 };

const pointer: PointerState = {
  nx: 0,
  ny: 0,
  cx: Number.NaN,
  cy: Number.NaN,
  active: false,
  reduced: false,
};

const frames = new Set<Frame>();

let running = false;
let last = 0;
let raf = 0;
let publishedX = Number.NaN;
let publishedY = Number.NaN;
let booted = false;

function publish(): void {
  // Rounding to 3 decimals lets the style writes stop entirely on an idle
  // page, which is what keeps an untouched tab off the compositor.
  const x = Math.round(pointer.nx * 1000) / 1000;
  const y = Math.round(pointer.ny * 1000) / 1000;
  if (x === publishedX && y === publishedY) return;
  publishedX = x;
  publishedY = y;
  const root = document.documentElement;
  root.style.setProperty("--px", String(x));
  root.style.setProperty("--py", String(y));
}

function tick(now: number): void {
  const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
  last = now;

  // Frame-rate independent exponential approach: the same visual speed at
  // 60Hz, 120Hz and a throttled background tab.
  const a = 1 - Math.pow(1 - DAMP, dt * 60);
  pointer.nx += (target.x - pointer.nx) * a;
  pointer.ny += (target.y - pointer.ny) * a;

  publish();
  for (const fn of frames) fn(dt, pointer);

  raf = requestAnimationFrame(tick);
}

function start(): void {
  if (running || document.hidden) return;
  running = true;
  last = 0;
  raf = requestAnimationFrame(tick);
}

function stop(): void {
  if (!running) return;
  running = false;
  cancelAnimationFrame(raf);
}

function onPointerMove(e: PointerEvent): void {
  if (pointer.reduced || e.pointerType === "touch") return;
  pointer.active = true;
  pointer.cx = e.clientX;
  pointer.cy = e.clientY;
  target.x = (e.clientX / window.innerWidth) * 2 - 1;
  target.y = (e.clientY / window.innerHeight) * 2 - 1;
  start();
}

function onPointerLeave(): void {
  if (pointer.reduced) return;
  pointer.active = false;
  pointer.cx = Number.NaN;
  pointer.cy = Number.NaN;
  target.x = 0;
  target.y = 0;
  start();
}

/** Idempotent: safe to call on every astro:page-load. */
export function initPointer(): PointerState {
  if (booted) {
    start();
    return pointer;
  }
  booted = true;

  pointer.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (pointer.reduced || !fine) {
    // Designed still pose: slightly off-centre, so the composition never looks
    // like it is waiting for something.
    pointer.nx = target.x = 0.28;
    pointer.ny = target.y = -0.12;
    publish();
    // The loop still runs for subscribers that animate on their own clock
    // (the WebGL stage renders a static frame and stops).
    start();
    return pointer;
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  window.addEventListener("pointercancel", onPointerLeave, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  publish();
  start();
  return pointer;
}

export function subscribe(fn: Frame): () => void {
  frames.add(fn);
  start();
  return () => {
    frames.delete(fn);
  };
}

/**
 * Stage the entrance: flip html.staged one frame after markup is live so the
 * browser actually interpolates the clip-paths, then html.staged-done once the
 * choreography has landed, which drops every clip-path (a live clip-path opens
 * a stacking context and would trap DOM layers under the WebGL canvas).
 */
export function stageEntrance(totalMs = 2600): void {
  const root = document.documentElement;
  if (root.classList.contains("staged")) return;
  if (!root.classList.contains("anim")) {
    root.classList.add("staged", "staged-done");
    return;
  }
  // Force a reflow: without it the browser computes only the finished state and
  // skips every transition.
  void document.body.offsetHeight;
  requestAnimationFrame(() => {
    root.classList.add("staged");
    window.setTimeout(() => root.classList.add("staged-done"), totalMs);
  });
}
