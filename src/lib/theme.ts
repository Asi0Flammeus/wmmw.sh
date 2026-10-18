/**
 * Theme state on <html> (spec §1.4). The inline head script in BaseLayout sets
 * data-theme and data-theme-source before first paint; this module changes
 * them afterwards. Nothing else writes theme attributes or classes on <html>.
 *
 * Listen to `wm:theme` on document (detail: Theme) to react to a change, or
 * observe html[data-theme] (what W1 does).
 */
import { THEME_COLOR } from "./site";

export type Theme = "light" | "dark";
export const THEME_KEY = "theme";
export const THEME_EVENT = "wm:theme";

const root = (): HTMLElement => document.documentElement;

/** The theme on screen, read from html[data-theme]. */
export function currentTheme(): Theme {
  return root().dataset.theme === "dark" ? "dark" : "light";
}

/** Both theme-color metas take the current theme hex when the visitor chose
 *  one; otherwise each keeps its own media colour. */
export function syncThemeColor(): void {
  const user = root().dataset.themeSource === "user";
  const now = THEME_COLOR[currentTheme()];
  for (const m of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const own = (m.media || "").includes("dark") ? THEME_COLOR.dark : THEME_COLOR.light;
    m.content = user ? now : own;
  }
}

function motionWelcome(): boolean {
  return (
    root().classList.contains("anim") &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Switch the theme.
 * - persist (default true): store the choice and mark data-theme-source="user".
 * - animate (default true): 200 ms page crossfade through View Transitions
 *   when supported and motion is welcome; otherwise an instant swap.
 */
export function setTheme(
  theme: Theme,
  { persist = true, animate = true }: { persist?: boolean; animate?: boolean } = {},
): void {
  const d = root();
  const swap = (): void => {
    // Element transitions off while the colours swap, then a forced style
    // flush so they come back with nothing left to animate (no stagger).
    d.classList.add("theme-switching");
    d.dataset.theme = theme;
    if (persist) {
      d.dataset.themeSource = "user";
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        /* storage blocked: the choice lasts for this page */
      }
    }
    void getComputedStyle(d).backgroundColor;
    d.classList.remove("theme-switching");
    syncThemeColor();
    document.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
  };

  if (!animate || !motionWelcome() || typeof document.startViewTransition !== "function") {
    swap();
    return;
  }
  // theme-xfade before the transition starts: it scopes the 200 ms timing
  // and lifts the header out of Astro's animation:none rules (global.css).
  d.classList.add("theme-xfade");
  document
    .startViewTransition(swap)
    .finished.finally(() => d.classList.remove("theme-xfade"));
}

/**
 * While no choice is stored (data-theme-source="system"), mirror live
 * changes of prefers-color-scheme. Returns the unsubscribe function.
 */
export function followSystem(): () => void {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onChange = (e: MediaQueryListEvent): void => {
    if (root().dataset.themeSource !== "system") return;
    setTheme(e.matches ? "dark" : "light", { persist: false, animate: false });
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
