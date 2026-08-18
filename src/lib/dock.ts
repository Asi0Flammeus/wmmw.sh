/**
 * Header dock: proximity magnification, one spring per pill.
 *
 * Rides the shared pointer bus (src/lib/pointer.ts). It adds no rAF of its own
 * and it holds no listener that pointer.ts already owns.
 *
 * Two ideas carry the whole file:
 *
 * 1. Aim is measured against the REST layout, never against the live one. A
 *    magnified pill is wider, so its live centre drifts away from the cursor;
 *    feeding that back into the field would make the springs chase their own
 *    output and buzz. So the rest widths, heights and centres are cached once,
 *    measured with every inline style cleared, and refreshed only on resize.
 * 2. The frame of reference is the wrapper, not the capsule. The capsule grows
 *    when pills magnify, so its rect is not stable. The wrapper is full width
 *    with a fixed height, so its rect changes only on resize and on scroll.
 *
 * The specular rims are NOT here. src/lib/spec.ts owns every [data-spec]
 * element document wide; this file only magnifies.
 */

import { initPointer, subscribe, type PointerState } from "./pointer";

/** Reach of the field, in composition units (1u == 1px on a 1440x900 frame). */
const REACH_U = 128;
/** Pill growth at full magnification, in composition units. */
const GROW_W_U = 22;
const GROW_H_U = 10;
/** Downward lift at full magnification, in composition units. */
const LIFT_U = 3.5;
/** The pills grow DOWN out of the bar, so the catch box must reach down there. */
const CATCH_BELOW = 104;
const CATCH_ABOVE = 24;
/** Spring stiffness, and damping just under critical (2*sqrt(190) = 27.6). */
const STIFF = 190;
const DAMP = 27;
/** Keyboard parity: the focused pill goes full, its two neighbours get a hint. */
const KB_NEIGHBOUR = 0.24;
/** Under this the spring is parked: snap it and let the loop go quiet. */
const EPS = 0.0015;
/** Smallest change that earns a style write. */
const WRITE_EPS = 0.0008;

interface Item {
  el: HTMLElement;
  /** rest geometry, cached */
  w: number;
  h: number;
  /** rest centre x, in wrapper-local px */
  cx: number;
  /** spring position and velocity, both in [0, 1]-ish */
  v: number;
  vel: number;
  /** last written v, so a parked pill stops touching the DOM */
  written: number;
  /** keyboard target: 0 unless focus sits in the dock */
  kb: number;
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (n: number): number => n * n * (3 - 2 * n);

export interface DockHandle {
  destroy(): void;
}

/**
 * `nav` is the .dock capsule. Its parent must be the full-width .dock-wrap:
 * that wrapper is the stable frame of reference for the field.
 */
export function mountDock(nav: HTMLElement): DockHandle {
  const pointer = initPointer();
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  // Coarse pointer or reduced motion: the CSS rest state IS the design. Never
  // start the springs, never write one inline style. Decided at mount, because
  // every navigation re-mounts anyway.
  if (pointer.reduced || !fine.matches) return { destroy(): void {} };

  const items: Item[] = Array.from(
    nav.querySelectorAll<HTMLElement>(".dock-item"),
    (el) => ({ el, w: 0, h: 0, cx: 0, v: 0, vel: 0, written: 0, kb: 0 }),
  );
  if (items.length === 0) return { destroy(): void {} };

  const box = nav.parentElement ?? nav;
  const mqNarrow = window.matchMedia("(max-width: 900px)");
  const mqWide = window.matchMedia("(min-width: 1680px)");

  /** Mirrors --u in tokens.css. The two must be changed together. */
  const readUnit = (): number => {
    if (mqNarrow.matches) return window.innerWidth / 760;
    if (mqWide.matches) return 1680 / 1440;
    return window.innerWidth / 1440;
  };

  let u = readUnit();
  let boxLeft = 0;
  let boxTop = 0;
  let barTop = 0;
  let barBottom = 0;
  let boxW = -1;
  /** the wrapper moved (scroll) or was never read: one rect read owed */
  let originStale = true;
  /** every spring parked and its style written: the frame body can bail out */
  let settled = false;
  let kbDirty = false;
  let wasAway = true;
  let lastCx = Number.NaN;
  let lastCy = Number.NaN;
  let dead = false;

  const clear = (it: Item): void => {
    it.el.style.width = "";
    it.el.style.height = "";
    it.el.style.transform = "";
  };

  const measure = (): void => {
    for (const it of items) {
      clear(it);
      it.written = 0;
    }
    // Neutralise the capsule's parallax first. .par translates the capsule by
    // up to --pd px while item rects are read in wrapper space, so that offset
    // would be baked into every rest centre and the field would sit off axis.
    nav.style.setProperty("--px", "0");
    nav.style.setProperty("--py", "0");
    u = readUnit();
    const bb = box.getBoundingClientRect();
    const nb = nav.getBoundingClientRect();
    boxW = bb.width;
    boxLeft = bb.left;
    boxTop = bb.top;
    barTop = nb.top - bb.top;
    barBottom = nb.bottom - bb.top;
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      it.w = r.width;
      it.h = r.height;
      it.cx = r.left + r.width / 2 - bb.left;
    }
    nav.style.removeProperty("--px");
    nav.style.removeProperty("--py");
    originStale = false;
    settled = false;
  };

  const frame = (dt: number, p: PointerState): void => {
    const away = Number.isNaN(p.cx);
    // NaN never equals itself, so "moved" has to route the away state through a
    // latch instead of comparing coordinates.
    const moved = away
      ? !wasAway
      : wasAway || p.cx !== lastCx || p.cy !== lastCy;
    wasAway = away;
    if (!away) {
      lastCx = p.cx;
      lastCy = p.cy;
    }

    // Parked, and nothing asked for a new pose: no reads, no writes, no math.
    if (settled && !moved && !originStale && !kbDirty) return;
    kbDirty = false;

    // The single layout read of the frame, and it happens before every write,
    // so the writes below never force a synchronous reflow.
    if (originStale) {
      const bb = box.getBoundingClientRect();
      boxLeft = bb.left;
      boxTop = bb.top;
      originStale = false;
    }

    const y = p.cy - boxTop;
    const inField =
      !away && y >= barTop - CATCH_ABOVE && y <= barBottom + CATCH_BELOW;
    const aimX = p.cx - boxLeft;
    const reach = REACH_U * u;
    const growW = GROW_W_U * u;
    const growH = GROW_H_U * u;
    const lift = LIFT_U * u;

    let live = false;
    for (const it of items) {
      const prox = inField ? clamp01(1 - Math.abs(aimX - it.cx) / reach) : 0;
      const target = Math.max(smoothstep(prox), it.kb);

      it.vel += (target - it.v) * STIFF * dt;
      // Exponential velocity decay keeps the settle identical at 60Hz and 120Hz.
      it.vel *= Math.exp(-DAMP * dt);
      it.v += it.vel * dt;
      if (it.v < 0) {
        it.v = 0;
        it.vel = 0;
      }

      if (Math.abs(target - it.v) < EPS && Math.abs(it.vel) < EPS) {
        it.v = target;
        it.vel = 0;
      } else {
        live = true;
      }

      if (Math.abs(it.v - it.written) < WRITE_EPS) continue;
      it.written = it.v;
      if (it.v === 0) {
        // Back to zero: hand the pill back to the stylesheet rather than pin it
        // to a measured pixel value.
        clear(it);
        continue;
      }
      it.el.style.width = `${(it.w + growW * it.v).toFixed(2)}px`;
      it.el.style.height = `${(it.h + growH * it.v).toFixed(2)}px`;
      it.el.style.transform = `translateY(${(lift * it.v).toFixed(2)}px)`;
    }

    settled = !live;
  };

  const ro = new ResizeObserver((entries) => {
    // Width only. The pills grow downward, so a height change on the wrapper
    // would be this file's own output coming back as an input.
    const w = entries[0]?.contentRect.width ?? -1;
    if (Math.abs(w - boxW) < 0.5) return;
    measure();
  });

  const onScroll = (): void => {
    // .site-head is absolute at the top of the page, so scrolling moves the
    // wrapper in viewport space and invalidates the catch box.
    originStale = true;
  };

  const onFocusIn = (e: FocusEvent): void => {
    const hit = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      ".dock-item",
    );
    const at = hit ? items.findIndex((it) => it.el === hit) : -1;
    items.forEach((it, i) => {
      const d = Math.abs(i - at);
      it.kb = at < 0 ? 0 : d === 0 ? 1 : d === 1 ? KB_NEIGHBOUR : 0;
    });
    kbDirty = true;
    settled = false;
  };

  const onFocusOut = (e: FocusEvent): void => {
    const to = e.relatedTarget as Node | null;
    if (to && nav.contains(to)) return;
    for (const it of items) it.kb = 0;
    kbDirty = true;
    settled = false;
  };

  measure();
  // Mono and display metrics differ from the fallback faces, so the rest widths
  // measured before the webfonts land are wrong. Re-measure once they are in.
  void document.fonts?.ready.then(() => {
    if (!dead) measure();
  });

  ro.observe(box);
  window.addEventListener("scroll", onScroll, { passive: true });
  nav.addEventListener("focusin", onFocusIn);
  nav.addEventListener("focusout", onFocusOut);
  const detach = subscribe(frame);

  return {
    destroy(): void {
      dead = true;
      detach();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      nav.removeEventListener("focusin", onFocusIn);
      nav.removeEventListener("focusout", onFocusOut);
      for (const it of items) clear(it);
    },
  };
}
