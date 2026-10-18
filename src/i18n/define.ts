/**
 * i18n building blocks shared by `ui.ts`, every `ns/<name>.ts` namespace and
 * client bundles. Safe to import anywhere: it has no side effects and pulls in
 * no dictionary (unlike `index.ts`, whose glob bundles every namespace).
 */

export const LOCALES = ["fr", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Recursively widen literal types so EN and ES may hold different strings
 * while keeping FR's exact shape. Arrays widen to arrays of the union of
 * their element shapes, so a list may differ in length per locale.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends (...args: infer A) => infer R
        ? (...args: A) => R
        : T extends readonly (infer U)[]
          ? readonly Widen<U>[]
          : { readonly [K in keyof T]: Widen<T[K]> };

/** A namespace as `index.ts` collects it from `ns/<name>.ts`. */
export interface Namespace<N extends string = string, D = unknown> {
  readonly name: N;
  readonly dict: Readonly<Record<Locale, D>>;
}

/**
 * Declare a namespace file. Usage in `src/i18n/ns/home.ts`:
 *
 *   const fr = { hero: { h1: "William Moiré" } } as const;
 *   const en: Widen<typeof fr> = { hero: { h1: "William Moiré" } };
 *   const es: Widen<typeof fr> = { hero: { h1: "William Moiré" } };
 *   export default defineNamespace("home", { fr, en, es });
 *   declare module "../index" {
 *     interface Namespaces { home: Widen<typeof fr> }
 *   }
 */
export function defineNamespace<N extends string, F>(
  name: N,
  dict: { fr: F; en: Widen<F>; es: Widen<F> },
): Namespace<N, Widen<F>> {
  return { name, dict: dict as Record<Locale, Widen<F>> };
}

/**
 * Fill `{placeholders}` in a dictionary string:
 * fmt("Étape {n} sur 3", { n: 2 }) -> "Étape 2 sur 3".
 * Unknown placeholders are left as written, so a typo shows in review.
 */
export function fmt(
  str: string,
  vars: Readonly<Record<string, string | number>>,
): string {
  return str.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(vars, key) ? String(vars[key]) : match,
  );
}

/**
 * Split a verbatim string around the substring to link, so the copy stays
 * whole in the dictionary: splitLink(t.legal.data, "mentions légales").
 * Throws when the needle is missing (a build error on static pages, a 500
 * on on-demand ones: keep the needle in the same dictionary as the text).
 */
export function splitLink(
  text: string,
  needle: string,
): [before: string, needle: string, after: string] {
  const at = text.indexOf(needle);
  if (at < 0) {
    throw new Error(`splitLink: "${needle}" not found in "${text}"`);
  }
  return [text.slice(0, at), needle, text.slice(at + needle.length)];
}
