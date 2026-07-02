import type { APIRoute } from "astro";
import { buildFeed } from "@lib/feed";
import type { Locale } from "@i18n/index";

export function getStaticPaths() {
  return ["en", "es"].map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params }) => buildFeed(params.lang as Locale);
