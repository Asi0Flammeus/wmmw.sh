import type { APIRoute } from "astro";
import { intakeAuthorized } from "@lib/intake/auth";
import { deleteRecord, readRecord } from "@lib/intake/store";

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/** One record (Bearer INTAKE_TOKEN). */
export const GET: APIRoute = async ({ request, params }) => {
  if (!intakeAuthorized(request)) return json({ error: "Unauthorized" }, 401);
  const rec = await readRecord(params.id ?? "");
  return rec ? json(rec) : json({ error: "Not found" }, 404);
};

/** Delete a record (Bearer INTAKE_TOKEN), e.g. once the Ghosts launch message is sent. */
export const DELETE: APIRoute = async ({ request, params }) => {
  if (!intakeAuthorized(request)) return json({ error: "Unauthorized" }, 401);
  return (await deleteRecord(params.id ?? "")) ? json({ ok: true }) : json({ error: "Not found" }, 404);
};
