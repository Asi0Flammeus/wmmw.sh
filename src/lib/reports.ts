import { timingSafeEqual } from "crypto";
import { join } from "path";

/** Storage for agent-published report pages (docker volume in prod). */
export const REPORTS_DIR =
  process.env.REPORTS_DIR ?? join(process.cwd(), ".reports");

/** UUIDs, or uuid-like slugs an agent may mint itself. */
export const REPORT_ID_RE = /^[a-z0-9][a-z0-9-]{7,63}$/;

/** Bearer-token check against REPORTS_TOKEN, constant-time. */
export function reportsAuthorized(request: Request): boolean {
  const token = process.env.REPORTS_TOKEN;
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
