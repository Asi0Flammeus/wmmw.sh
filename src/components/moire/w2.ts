/**
 * W2 · Ghosts lens (spec §5.2, critique E14 and E15; ported from
 * docs/moire/explore/moire/w2-ghosts.html). 1D shape moiré: the ghost squeezed
 * into every 4 px band, read through slits at 4.25 px (magnification 17, one
 * ghost per 68 px). The lens paints the exact composite from its position.
 * Three custom properties per frame (--L, --gx, --reveal); rAF only while moving.
 */
const PB = 4;
const PR = 4.25;
const MAG = PR / (PR - PB);
const PERIOD = PB * MAG;
const LENS_W = 136;
const REST = 56;

export interface W2Handle {
  destroy(): void;
}

export function mountW2(box: HTMLElement): W2Handle {
  const lens = box.querySelector<HTMLElement>("[data-w2-lens]");
  const ac = new AbortController();
  const opt = { signal: ac.signal };
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  let W = 0;
  let L = 0;
  let T = 0;
  let raf = 0;
  let last = 0;
  let speed = 0;
  let drag: { id: number; dx: number } | null = null;
  if (!lens) return { destroy: () => ac.abort() };

  /* phase of the magnified ghost row inside the lens for a lens position */
  const phase = (l: number): number => {
    const g = -(l / PB) * PERIOD;
    return (((g % PERIOD) + PERIOD) % PERIOD) - PERIOD;
  };
  const clamp = (l: number): number => Math.max(0, Math.min(W - LENS_W, l));

  function paint(): void {
    box.style.setProperty("--L", `${L.toFixed(3)}px`);
    box.style.setProperty("--gx", `${phase(L).toFixed(3)}px`);
    /* ghosts dim when they would race past: honest motion blur, no strobing */
    const fade = 1 - 0.75 * Math.min(1, Math.max(0, (speed * MAG - 900) / 1500));
    box.style.setProperty("--reveal", fade.toFixed(3));
    const pct = Math.round((L / Math.max(1, W - LENS_W)) * 100);
    lens?.setAttribute("aria-valuenow", String(pct));
    lens?.setAttribute("aria-valuetext", `${pct} %`);
  }

  function frame(now: number): void {
    raf = 0;
    const dt = last ? Math.min(64, now - last) : 16.7;
    last = now;
    const prev = L;
    const k = 1 - Math.pow(1 - (drag ? 0.35 : 0.3), dt / 16.667);
    L += (T - L) * k;
    if (Math.abs(T - L) < 0.1) L = T;
    speed = speed * 0.5 + (Math.abs(L - prev) / (dt / 1000)) * 0.5;
    if (L === T && !drag) speed = 0;
    paint();
    if (L !== T || (drag && speed > 1)) raf = requestAnimationFrame(frame);
    else last = 0;
  }

  function go(t: number, snap = true): void {
    T = clamp(snap ? clamp(Math.round(t / PB) * PB) : t);
    if (mqReduce.matches) {
      L = T;
      speed = 0;
      paint();
      return;
    }
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  }

  function measure(): void {
    W = box.clientWidth;
    L = T = clamp(L || REST);
    paint();
  }

  box.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button > 0) return;
      const x = e.clientX - box.getBoundingClientRect().left;
      const onLens = x >= L && x <= L + LENS_W;
      drag = { id: e.pointerId, dx: onLens ? x - L : LENS_W / 2 };
      box.setPointerCapture(e.pointerId);
      go(x - drag.dx, false);
    },
    opt,
  );
  box.addEventListener(
    "pointermove",
    (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      go(e.clientX - box.getBoundingClientRect().left - drag.dx, false);
    },
    opt,
  );
  const end = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    go(T);
  };
  box.addEventListener("pointerup", end, opt);
  box.addEventListener("pointercancel", end, opt);
  box.addEventListener("lostpointercapture", end, opt);

  /* keyboard: the lens is a slider (a toy, it carries no information) */
  lens.setAttribute("role", "slider");
  lens.tabIndex = 0;
  lens.setAttribute("aria-label", box.dataset.label ?? "Ghosts");
  lens.setAttribute("aria-valuemin", "0");
  lens.setAttribute("aria-valuemax", "100");
  lens.setAttribute("aria-orientation", "horizontal");
  lens.addEventListener(
    "keydown",
    (e) => {
      const step = e.shiftKey ? 60 : 6;
      const moves: Record<string, number> = {
        ArrowRight: T + step,
        ArrowUp: T + step,
        ArrowLeft: T - step,
        ArrowDown: T - step,
        PageUp: T + 40,
        PageDown: T - 40,
        Home: 0,
        End: W,
      };
      const target = moves[e.key];
      if (target === undefined) return;
      e.preventDefault();
      go(target);
    },
    opt,
  );

  const ro = new ResizeObserver(measure);
  ro.observe(box);
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        L = T;
        speed = 0;
        paint();
      }
    },
    opt,
  );

  return {
    destroy(): void {
      ac.abort();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      drag = null;
      for (const p of ["--L", "--gx", "--reveal"]) box.style.removeProperty(p);
      for (const a of ["role", "tabindex", "aria-label", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext", "aria-orientation"]) {
        lens.removeAttribute(a);
      }
    },
  };
}
