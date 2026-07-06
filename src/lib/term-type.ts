/**
 * Terminal typing / reveal engine.
 *
 * On first viewport entry of each `.panel`, plays its `[data-step]` blocks
 * in document order like a real shell: a command line (`data-step="type"`)
 * types out character-by-character with a blinking caret, then its output
 * (`data-step="fade"`) prints as a whole block, and only then the next
 * command types. Runs once per panel.
 *
 * Gating:
 *  - No `html.anim`  -> no-op. Markup already carries the final visible state.
 *  - `html.anim`, no IntersectionObserver -> reveal everything immediately.
 *  - `html.anim` + IO -> arm (`html.armed`) and reveal blocks on intersection.
 *  - Mycelium-claimed panels (`data-myc-claim`, set by mycelium.ts when a
 *    filament branch pours into the panel) wait for the organism instead: the
 *    branch tip dispatches `myc:reach` on the panel and THAT starts the
 *    sequence, so the terminal visibly wakes when the filament touches it.
 *    Viewport entry only arms a safety deadline in case the sim is stalled.
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
    const REACH_GRACE = 3800; // claimed panel: max wait after viewport entry
    const CHAR_MS = 32; // per-character cadence while a command line types

    const start = (panel: HTMLElement): void => {
      // idempotent across the reach event, the grace deadline and re-inits
      if (panel.dataset.termStarted === "1") return;
      panel.dataset.termStarted = "1";
      runSeq(panel);
    };

    // Type a command line out character-by-character (its prompt is already
    // visible); the blinking caret trails the text. `done` fires once fully
    // typed. `.cmd-text` + dataset.full lets a panel revealed mid-type
    // elsewhere (see NourrituresPage finalize) restore the full command text.
    const typeCmd = (el: HTMLElement, done: () => void): void => {
      const textEl = el.querySelector<HTMLElement>(".cmd-text");
      if (!textEl) {
        done();
        return;
      }
      const full = textEl.dataset.full ?? textEl.textContent ?? "";
      textEl.dataset.full = full;
      textEl.textContent = "";
      el.classList.add("typing");
      let n = 0;
      const tick = (): void => {
        textEl.textContent = full.slice(0, n);
        if (n >= full.length) {
          el.classList.remove("typing");
          done();
          return;
        }
        n += 1;
        setTimeout(tick, CHAR_MS);
      };
      tick();
    };

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
          // Command types out; the caret keeps blinking through a short dwell,
          // then the command "runs" and its output block prints.
          typeCmd(el, () => {
            setTimeout(() => {
              el.classList.add("done");
              next();
            }, CMD_TO_OUT);
          });
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
          const panel = e.target as HTMLElement;
          // filament-claimed panels wake on "myc:reach"; viewport entry only
          // guarantees typing eventually happens should the organism stall
          if (panel.dataset.mycClaim === "1") {
            setTimeout(() => start(panel), REACH_GRACE);
          } else {
            start(panel);
          }
          if (--remaining <= 0) {
            io.disconnect();
            activeObserver = null;
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -28% 0px" },
    );
    activeObserver = io;
    panels.forEach((panel) => {
      panel.addEventListener("myc:reach", () => start(panel), { once: true });
      io.observe(panel);
    });
  } catch {
    docEl.classList.remove("armed");
    panels.forEach(showAll);
  }
}
