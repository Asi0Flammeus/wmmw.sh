import type { APIRoute } from "astro";
import { mintToken } from "@lib/intake/token";

export const prerender = false;

/** A fresh start token: GET /api/intake/start?kind=brief|ghosts&locale=fr. */
export const GET: APIRoute = ({ url }) => {
  const kind = url.searchParams.get("kind") === "ghosts" ? "ghosts" : "brief";
  const locale = url.searchParams.get("locale") ?? "fr";
  return new Response(JSON.stringify({ started: mintToken(kind, locale) }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
};
