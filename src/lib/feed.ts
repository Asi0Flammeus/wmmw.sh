import rss from "@astrojs/rss";
import { t, localePath, type Locale } from "@i18n/index";
import { publishedWritings, baseSlug } from "@lib/writings";
import { SITE_URL } from "@lib/site";

/** Écrits feed for one locale; used by every rss.xml endpoint. */
export async function buildFeed(locale: Locale): Promise<Response> {
  const entries = await publishedWritings(locale);
  const dict = t(locale);
  return rss({
    title: dict.rss.title,
    description: dict.rss.description,
    site: SITE_URL,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.publishedAt,
      link: localePath(locale, `/ecrits/${baseSlug(entry)}`),
    })),
    customData: `<language>${locale}</language>`,
  });
}
