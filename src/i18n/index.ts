import { ui, type UIDict } from "./ui";
import { LOCALES, type Locale, type Namespace } from "./define";

export { LOCALES, type Locale, type Widen, fmt, splitLink } from "./define";
export type { UIDict };
export const DEFAULT_LOCALE: Locale = "fr";

/**
 * Page namespaces, one file per package in `./ns/<name>.ts`. Each file
 * augments this interface with its FR shape:
 *
 *   declare module "../index" { interface Namespaces { home: Widen<typeof fr> } }
 */
export interface Namespaces {}

/**
 * Legacy page keys of `ui.ts` that a namespace of the same name may shadow
 * while the old pages still read them. The namespace deep-merges over the
 * legacy object (namespace wins), so neither side breaks the other's build.
 * WP1b empties this list together with the legacy block of `ui.ts`.
 */
export const LEGACY_KEYS = [
  "projets",
  "outils",
  "ecrits",
  "contact",
  "manifeste",
  "notFound",
] as const;

type Merged<K extends keyof Namespaces> = K extends keyof UIDict
  ? UIDict[K] & Namespaces[K]
  : Namespaces[K];

/** What `t(locale)` returns: chrome keys plus every namespace. */
export type Dict = Omit<UIDict, keyof Namespaces> & {
  readonly [K in keyof Namespaces]: Merged<K>;
};

/* ---- Namespace registry (build time) ------------------------------------ */

const modules = import.meta.glob<{ default: Namespace }>("./ns/*.ts", {
  eager: true,
});

const namespaces = new Map<string, Namespace>();
for (const [file, mod] of Object.entries(modules)) {
  const ns = mod.default;
  const fileName = file.replace(/^.*\/|\.ts$/g, "");
  if (!ns || typeof ns.name !== "string") {
    throw new Error(`i18n: ${file} must export default defineNamespace(...)`);
  }
  if (ns.name !== fileName) {
    throw new Error(`i18n: ${file} declares namespace "${ns.name}", expected "${fileName}"`);
  }
  if (namespaces.has(ns.name)) {
    throw new Error(`i18n: namespace "${ns.name}" is declared twice`);
  }
  if (
    Object.hasOwn(ui.fr, ns.name) &&
    !(LEGACY_KEYS as readonly string[]).includes(ns.name)
  ) {
    throw new Error(`i18n: namespace "${ns.name}" would shadow the ui.ts key "${ns.name}"`);
  }
  namespaces.set(ns.name, ns);
}

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Deep merge, `over` wins; arrays and strings are replaced, never mixed. */
function deepMerge(base: unknown, over: unknown): unknown {
  if (!isPlain(base) || !isPlain(over)) return over;
  const out: Plain = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge(base[k], v);
  return out;
}

const cache = new Map<Locale, Dict>();

/** Full dictionary for a locale: `ui.ts` chrome merged with every namespace. */
export function t(locale: Locale): Dict {
  let dict = cache.get(locale);
  if (!dict) {
    const merged: Plain = { ...(ui[locale] as Plain) };
    for (const ns of namespaces.values()) {
      merged[ns.name] = deepMerge(merged[ns.name], ns.dict[locale]);
    }
    dict = merged as Dict;
    cache.set(locale, dict);
  }
  return dict;
}

/* ---- Routing helpers ------------------------------------------------------ */

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Locale from a URL pathname: `/en/ecrits` -> "en", `/ecrits` -> "fr". */
export function getLocaleFromUrl(url: URL): Locale {
  const seg = url.pathname.split("/")[1];
  return seg !== undefined && isLocale(seg) ? seg : DEFAULT_LOCALE;
}

/**
 * Localized path. Route slugs stay French across locales:
 * localePath("en", "/ecrits") -> "/en/ecrits"; localePath("fr", "/ecrits") -> "/ecrits".
 */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** hreflang alternates for a path, limited to the locales where it exists. */
export function alternates(
  path: string,
  locales: readonly Locale[] = LOCALES,
): { locale: Locale; href: string }[] {
  return locales.map((locale) => ({ locale, href: localePath(locale, path) }));
}

/* ---- Dates ------------------------------------------------------------------ */

const DATE_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  es: "es-ES",
};

/** Long-form date, per locale: "2 juillet 2026". */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** ISO date for lists (JetBrains Mono, tabular): "2026-07-02". */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
