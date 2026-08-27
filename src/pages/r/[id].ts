import type { APIRoute } from "astro";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { REPORTS_DIR, reportsAuthorized, REPORT_ID_RE } from "@lib/reports";

export const prerender = false;

/**
 * Serves an agent-published report page. Reports are self-contained HTML
 * files stored under REPORTS_DIR by POST /api/reports; URLs are unguessable
 * UUIDs, never listed, never in the sitemap, and marked noindex.
 */
export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? "";
  if (!REPORT_ID_RE.test(id)) return new Response("Not found", { status: 404 });
  try {
    const html = await readFile(join(REPORTS_DIR, `${id}.html`), "utf8");
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  if (!reportsAuthorized(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const id = params.id ?? "";
  if (!REPORT_ID_RE.test(id)) return new Response("Not found", { status: 404 });
  try {
    await unlink(join(REPORTS_DIR, `${id}.html`));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};
