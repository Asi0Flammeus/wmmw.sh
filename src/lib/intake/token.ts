/**
 * Signed start token (spec §8.3 step 5, errata E6 and critique E8).
 *   payload = `${ts_ms}.${kind}.${locale}`
 *   sig     = base64url(HMAC-SHA256(secret, payload))
 *   started = base64url(`${payload}.${sig}`)
 * The key is INTAKE_SECRET, read at call time; without it, one random key per
 * process (a restart then turns open forms' tokens into a silent 409 retry).
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { TOKEN_MAX_AGE_MS } from "./rules";

export type TokenKind = "brief" | "ghosts";
const LOCALES = ["fr", "en", "es"];

let processSecret: Buffer | undefined;

function secret(): Buffer {
  const env = process.env.INTAKE_SECRET;
  if (env) return Buffer.from(env);
  processSecret ??= randomBytes(32);
  return processSecret;
}

const sign = (payload: string): string =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

export function mintToken(kind: TokenKind, locale: string, now = Date.now()): string {
  const payload = `${now}.${kind}.${LOCALES.includes(locale) ? locale : "fr"}`;
  return Buffer.from(`${payload}.${sign(payload)}`).toString("base64url");
}

export type TokenCheck =
  | { ok: true; ts: number; kind: TokenKind; locale: string; ageMs: number }
  /** malformed: 400; stale (bad signature, or older than 2 h): 409 with a fresh token */
  | { ok: false; reason: "malformed" | "stale" };

export function checkToken(token: unknown, now = Date.now()): TokenCheck {
  if (typeof token !== "string" || !token || token.length > 512) return { ok: false, reason: "malformed" };
  const raw = Buffer.from(token, "base64url").toString("utf8");
  const m = /^(\d{13})\.(brief|ghosts)\.(fr|en|es)\.([A-Za-z0-9_-]{43})$/.exec(raw);
  if (!m) return { ok: false, reason: "malformed" };
  const [, tsRaw = "", kind = "", locale = "", sig = ""] = m;
  const expected = Buffer.from(sign(`${tsRaw}.${kind}.${locale}`));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: "stale" };
  }
  const ts = Number(tsRaw);
  const ageMs = now - ts;
  if (ageMs > TOKEN_MAX_AGE_MS || ageMs < -60_000) return { ok: false, reason: "stale" };
  return { ok: true, ts, kind: kind as TokenKind, locale, ageMs: Math.max(0, ageMs) };
}

/** Minimum time on form, read at call time (QA runs set 300). */
export function minMs(kind: TokenKind): number {
  const raw = kind === "brief" ? process.env.INTAKE_MIN_BRIEF_MS : process.env.INTAKE_MIN_GHOSTS_MS;
  const n = Number(raw);
  return Number.isFinite(n) && raw !== undefined && raw !== "" ? n : kind === "brief" ? 8000 : 3000;
}
