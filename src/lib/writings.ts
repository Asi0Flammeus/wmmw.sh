import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@i18n/index";

export type Writing = CollectionEntry<"writings">;

/** Base slug shared by all translations of a post; survives from crqpt URLs. */
export function baseSlug(entry: Writing): string {
  return entry.data.translationOf ?? entry.id.replace(/-(fr|en|es)$/, "");
}

/** Published writings for a locale, newest first. */
export async function publishedWritings(lang: Locale): Promise<Writing[]> {
  const entries = await getCollection(
    "writings",
    ({ data }) => !data.draft && data.lang === lang,
  );
  return entries.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

/** Existing translations of a post (other locales only), for the per-post switcher. */
export async function translationsOf(entry: Writing): Promise<Writing[]> {
  const base = baseSlug(entry);
  return getCollection(
    "writings",
    (candidate) =>
      !candidate.data.draft &&
      candidate.id !== entry.id &&
      baseSlug(candidate) === base,
  );
}
