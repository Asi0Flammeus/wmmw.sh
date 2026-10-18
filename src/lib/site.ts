/** Site-wide constants. */
export const SITE_URL = "https://wmmw.sh";
export const SITE_NAME = "wmmw.sh";

/** Public name (identity canon). The legal name appears on legal surfaces only. */
export const AUTHOR = "William Moiré";
export const BRAND_NAME = "William Moiré";
export const LEGAL_NAME = "William Lecompte";
export const HANDLE = "asi0";

export const GITHUB_URL = "https://github.com/Asi0Flammeus";
export const GITHUB_HANDLE = "@Asi0Flammeus";
export const X_URL = "https://x.com/asi0_flammeus";
export const X_HANDLE = "@asi0_flammeus";
export const ALYSIS_URL = "https://alysis.cat";
export const PLANB_URL = "https://planb.academy";
export const PLANB_PROFESSOR_URL =
  "https://planb.academy/professors/asi0-aa19b8be-5958-4c45-8be8-a1582dd5a90b";
export const PLANB_REPO_URL =
  "https://github.com/PlanB-Network/bitcoin-educational-content";

/** Browser chrome colour per theme (= --bg), mirrored in the theme-color metas. */
export const THEME_COLOR = { light: "#ecf2f0", dark: "#121917" } as const;

/**
 * Reachable but unlisted: robots noindex, out of the sitemap (astro.config
 * keeps its own copy of this list) and out of llms.txt.
 */
export const PARKED_PATHS = [
  "/nourritures",
  "/lectures-sf",
  "/lab",
  "/lego",
  "/404",
] as const;

/**
 * Contact mailto slot: stays null (the intake is the contact channel).
 * Kept so pages written against it still compile.
 */
export const CONTACT_EMAIL: string | null = null;

/** Prompt shown in terminal panels (legacy, /lego only): `asi0@wmmw:~$`. */
export const TERM_USER = "asi0@wmmw";
