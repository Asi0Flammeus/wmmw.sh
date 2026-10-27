import { timingSafeEqual } from "node:crypto";

/** Bearer-token check against INTAKE_TOKEN (read at call time), constant-time. Mirror of reportsAuthorized. */
export function intakeAuthorized(request: Request): boolean {
  const token = process.env.INTAKE_TOKEN;
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
