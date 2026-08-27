import type { APIRoute } from "astro";
import { randomUUID } from "crypto";
import { mkdir, readdir, stat, writeFile } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { REPORTS_DIR, reportsAuthorized, REPORT_ID_RE } from "@lib/reports";
import { SITE_URL } from "@lib/site";

export const prerender = false;

const MAX_BYTES = 8 * 1024 * 1024;

const jsonSchema = z.object({
  html: z.string().min(1).max(MAX_BYTES),
  id: z.string().regex(REPORT_ID_RE).optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * Agent publishing endpoint. Auth: `Authorization: Bearer $REPORTS_TOKEN`.
 * Body: raw HTML (Content-Type: text/html) or JSON `{ html, id? }`.
 * Responds `{ id, url }`; the page is served at /r/<id>, noindex, unlisted.
 */
export const POST: APIRoute = async ({ request, url }) => {
  // Behind the nginx TLS proxy url.origin reads http; local dev keeps its origin.
  const origin = url.hostname === "wmmw.sh" ? SITE_URL : url.origin;
  if (!reportsAuthorized(request)) return json({ error: "Unauthorized" }, 401);

  let html: string;
  let id: string = randomUUID();

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const parsed = jsonSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return json(
        { error: "Validation error", details: z.flattenError(parsed.error) },
        400,
      );
    }
    html = parsed.data.html;
    if (parsed.data.id) id = parsed.data.id;
  } else {
    html = await request.text();
    if (!html || html.length > MAX_BYTES) {
      return json({ error: "Body empty or over 8 MiB" }, 400);
    }
  }

  await mkdir(REPORTS_DIR, { recursive: true });
  await writeFile(join(REPORTS_DIR, `${id}.html`), html, "utf8");
  return json({ id, url: new URL(`/r/${id}`, origin).toString() }, 201);
};

/** Management listing (token-protected): id, size, mtime per report. */
export const GET: APIRoute = async ({ request }) => {
  if (!reportsAuthorized(request)) return json({ error: "Unauthorized" }, 401);
  try {
    const files = await readdir(REPORTS_DIR);
    const items = await Promise.all(
      files
        .filter((f) => f.endsWith(".html"))
        .map(async (f) => {
          const s = await stat(join(REPORTS_DIR, f));
          return { id: f.replace(/\.html$/, ""), bytes: s.size, mtime: s.mtime };
        }),
    );
    items.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    return json(items);
  } catch {
    return json([]);
  }
};
