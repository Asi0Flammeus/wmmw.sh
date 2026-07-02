/**
 * Terminal typing engine (ported from mockup D "hybride").
 *
 * On first viewport entry of each `.panel`, sequentially types every
 * `[data-step="type"]` command, then fades in the following
 * `[data-step="fade"]` output, preserving document order across panels
 * that hold several command groups. Runs once per panel.
 *
 * Gating:
 *  - No `html.anim`  -> no-op. The markup is already the final rendered
 *    state (CSS gates only bite under `html.anim.armed`).
 *  - `html.anim`, no IntersectionObserver -> reveal everything immediately.
 *  - `html.anim` + IO -> arm (`html.armed`), stash + clear command text,
 *    then type on intersection.
 */
export function initTermTyping(): void {
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
    // Stash each command's text, then blank it so it can be typed back in.
    panels.forEach((panel) => {
      panel
        .querySelectorAll<HTMLElement>('[data-step="type"] .cmd-text')
        .forEach((span) => {
          span.dataset.full = span.textContent ?? "";
          span.textContent = "";
        });
    });
    docEl.classList.add("armed");

    const runSeq = (panel: HTMLElement): void => {
      const steps = Array.prototype.slice.call(
        panel.querySelectorAll("[data-step]"),
      ) as HTMLElement[];
      let i = 0;
      const next = (): void => {
        if (i >= steps.length) return;
        const el = steps[i++];
        if (!el) return;
        if (el.getAttribute("data-step") === "type") {
          el.classList.add("typing");
          const span = el.querySelector<HTMLElement>(".cmd-text");
          const full = (span && span.dataset.full) || "";
          let j = 0;
          const tick = (): void => {
            if (span && j < full.length) {
              span.textContent = full.slice(0, ++j);
              setTimeout(tick, 24 + Math.random() * 14);
            } else {
              el.classList.remove("typing");
              el.classList.add("done");
              setTimeout(next, 170);
            }
          };
          tick();
        } else {
          el.classList.add("on");
          setTimeout(next, 380);
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
          if (--remaining <= 0) io.disconnect();
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" },
    );
    panels.forEach((panel) => io.observe(panel));
  } catch {
    docEl.classList.remove("armed");
    panels.forEach(showAll);
  }
}
