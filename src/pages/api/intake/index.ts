import type { APIRoute } from "astro";
import { intakeAuthorized } from "@lib/intake/auth";
import { listRecords } from "@lib/intake/store";

export const prerender = false;

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });

/**
 * Public intake endpoint (spec §8.3): JSON only. The pipeline lives in
 * processIntake; it is imported here, inside the handler, so no intake module
 * is evaluated by prerendered pages at build time (errata E7).
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const type = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!type.startsWith("application/json")) return json({ error: "unsupported_media_type" }, 415);

  // dynamic on purpose (E7): keep the intake modules out of the prerender chunk
  const { processIntake, readLimited } = await import("@lib/intake/process");
  const text = await readLimited(request);
  if (text === null) return json({ error: "too_large" }, 413);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const kind = (raw as { path?: unknown } | null)?.path === "ghosts" ? "ghosts" : "brief";
  const result = await processIntake(raw, { request, clientAddress, js: true, kind });
  return json(result.body, result.status, result.headers);
};

/** Private list (Bearer INTAKE_TOKEN), newest first; `?path=ghosts` lists the Ghosts list only. */
export const GET: APIRoute = async ({ request, url }) => {
  if (!intakeAuthorized(request)) return json({ error: "Unauthorized" }, 401);
  const only = url.searchParams.get("path");
  const items = (await listRecords())
    .filter((r) => !only || r.path === only)
    .map((r) => ({
      id: r.id,
      received_at: r.received_at,
      path: r.path,
      fit: r.fit.label,
      channel: r.contact.channel,
    }));
  return json(items);
};
