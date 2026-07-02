import { ui, type UIDict } from "./ui";

export const LOCALES = ["fr", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Locale from a URL pathname: `/en/ecrits` -> "en", `/ecrits` -> "fr". */
export function getLocaleFromUrl(url: URL): Locale {
  const seg = url.pathname.split("/")[1];
  return seg !== undefined && isLocale(seg) ? seg : DEFAULT_LOCALE;
}

/** Chrome dictionary for a locale. */
export function t(locale: Locale): UIDict {
  return ui[locale];
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

/** hreflang alternates for a path (same content in every locale). */
export function alternates(path: string): { locale: Locale; href: string }[] {
  return LOCALES.map((locale) => ({ locale, href: localePath(locale, path) }));
}

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

/** Compact mono date for terminal listings: "2026-07-02". */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
