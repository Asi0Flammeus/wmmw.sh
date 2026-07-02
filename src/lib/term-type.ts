/**
 * Terminal block-reveal engine.
 *
 * On first viewport entry of each `.panel`, reveals its `[data-step]` blocks
 * in document order: a command line (`data-step="type"`) appears as a whole
 * block, then its output (`data-step="fade"`) prints, and only then the next
 * command, like a real shell running commands one by one. No character typing.
 * Runs once per panel.
 *
 * Gating:
 *  - No `html.anim`  -> no-op. Markup already carries the final visible state.
 *  - `html.anim`, no IntersectionObserver -> reveal everything immediately.
 *  - `html.anim` + IO -> arm (`html.armed`) and reveal blocks on intersection.
 */
/** Active observer from the last run; disconnected before each re-init (SPA swaps). */
let activeObserver: IntersectionObserver | null = null;

export function initTermTyping(): void {
  // Re-runnable across ClientRouter navigations: drop any prior observer.
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  const docEl = document.documentElement;
  const panels = Array.prototype.slice.call(
    document.querySelectorAll(".panel"),
  ) as HTMLElement[];
  if (!panels.length) return;

  const showAll = (panel: HTMLElement): void => {
    panel.querySelectorAll("[data-step]").forEach((el) => {
      el.classList.add("on", "done");
    });
  };

  // No animation intent: markup already carries the final visible state.
  if (!docEl.classList.contains("anim")) return;

  if (!("IntersectionObserver" in window)) {
    panels.forEach(showAll);
    return;
  }

  try {
    docEl.classList.add("armed");

    const CMD_TO_OUT = 240; // command block shown -> its output prints
    const OUT_TO_NEXT = 460; // output shown -> next command appears

    const runSeq = (panel: HTMLElement): void => {
      const steps = Array.prototype.slice.call(
        panel.querySelectorAll("[data-step]"),
      ) as HTMLElement[];
      let i = 0;
      const next = (): void => {
        if (i >= steps.length) return;
        const el = steps[i++];
        if (!el) return;
        el.classList.add("on");
        if (el.getAttribute("data-step") === "type") {
          // Caret blinks on the active command until its output prints.
          setTimeout(() => {
            el.classList.add("done");
            next();
          }, CMD_TO_OUT);
        } else {
          setTimeout(next, OUT_TO_NEXT);
        }
      };
      next();
    };

    let remaining = panels.length;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          runSeq(e.target as HTMLElement);
          if (--remaining <= 0) {
            io.disconnect();
            activeObserver = null;
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -28% 0px" },
    );
    activeObserver = io;
    panels.forEach((panel) => io.observe(panel));
  } catch {
    docEl.classList.remove("armed");
    panels.forEach(showAll);
  }
}
