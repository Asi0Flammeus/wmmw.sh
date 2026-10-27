/**
 * processIntake(): the single pipeline behind POST /api/intake, the no-JS
 * /contact form and the no-JS Ghosts form (spec §8.3, errata E6 to E9).
 * Loaded with `await import()` inside POST branches only (E7).
 */
import { computeFit } from "./fit";
import { clientKey, countAccepted, globalFull, record, retryAfter } from "./ratelimit";
import {
  CONSENT_TEXT_VERSION,
  MAX_BODY_BYTES,
  RETENTION_MONTHS,
  checkGhosts,
  countUrls,
  ghostsChannel,
  normalizeContact,
  validateBrief,
  type Brief,
  type Errors,
} from "./rules";
import { requestSchema, toBrief } from "./schema";
import { ghostListed, newId, writeRecord, type IntakeRecord } from "./store";
import { checkToken, minMs, mintToken, type TokenKind } from "./token";

export interface ProcessContext {
  request: Request;
  clientAddress?: string;
  /** false for the no-JS form posts */
  js: boolean;
  kind: TokenKind;
}

export interface Accepted {
  id: string;
  ref: string;
  fit: string;
}

export interface ProcessResult {
  status: number;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
  /** set on 201 (real or silent): what the confirmation shows */
  accepted?: Accepted;
  /** the cleaned brief, for re-rendering the no-JS form or its confirmation */
  brief?: Brief;
  errors?: Errors;
  /** a fresh start token, set on 400 (bad token) and 409 */
  fresh?: string;
}

const DEFAULT_ORIGINS = "https://wmmw.sh,https://moire.wmmw.sh";
const BASIS: Record<string, string> = {
  tool: "precontract",
  open: "legitimate-interest",
  other: "legitimate-interest",
  ghosts: "consent",
};
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

/** start token -> what its first accepted submission answered (no-JS reloads, retries) */
const idempotent = new Map<string, { at: number; result: Accepted }>();

export function allowedOrigins(): Set<string> {
  return new Set(
    (process.env.INTAKE_ALLOWED_ORIGINS || DEFAULT_ORIGINS)
      .split(",")
      .map((s) => s.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  );
}

/** Step 1. "ok", "forbidden", or "unknown" (neither header: only a valid token lets it through). */
function originCheck(request: Request): "ok" | "forbidden" | "unknown" {
  const allowed = allowedOrigins();
  const origin = request.headers.get("origin");
  if (origin && origin !== "null") return allowed.has(origin) ? "ok" : "forbidden";
  const referer = request.headers.get("referer");
  if (!referer) return "unknown";
  try {
    return allowed.has(new URL(referer).origin) ? "ok" : "forbidden";
  } catch {
    return "forbidden";
  }
}

/** A plausible 201 that stores nothing: bots learn nothing. */
function silent(kind: TokenKind, brief: Brief): ProcessResult {
  if (kind === "ghosts") return { status: 201, body: { ok: true }, accepted: { id: "", ref: "", fit: "ghosts" } };
  const { id, ref } = newId();
  const fit = computeFit(brief).label;
  return { status: 201, body: { id, ref, fit }, accepted: { id, ref, fit }, brief };
}

/** Step 2 for JSON: Content-Length, then a 16 KiB limited reader. null = too large. */
export async function readLimited(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Flat form names (fields.problem, contact.value.email, consent=on) to the JSON payload shape. */
export function parseForm(form: FormData): Record<string, unknown> {
  const get = (name: string): string => {
    const v = form.get(name);
    return typeof v === "string" ? v : "";
  };
  const fields: Record<string, string> = {};
  for (const [name, value] of form.entries()) {
    if (typeof value !== "string" || !name.startsWith("fields.")) continue;
    /* `when` exists in two groups: keep the value of the chosen path's group */
    const [, key, group] = name.split(".");
    if (group && group !== get("path")) continue;
    if (key && value) fields[key] = value;
  }
  const channel = get("contact.channel");
  return {
    locale: get("locale"),
    path: get("path"),
    fields,
    contact: {
      name: get("contact.name"),
      channel,
      value: get(`contact.value.${channel}`) || get("contact.value"),
    },
    consent: get("consent") === "on",
    started: get("started") || undefined,
    page: get("page"),
    from: get("from") || undefined,
    site_web: get("site_web"),
  };
}

export async function processIntake(raw: unknown, ctx: ProcessContext): Promise<ProcessResult> {
  const { request, kind } = ctx;
  const now = Date.now();

  const origin = originCheck(request);
  if (origin === "forbidden") return { status: 403, body: { error: "forbidden" } };

  const req = requestSchema.parse(raw ?? {});
  const brief = toBrief(req);

  const key = clientKey(request, ctx.clientAddress, now);
  const attemptWait = retryAfter(key, "attempt", now);
  if (attemptWait) return rateLimited(attemptWait);
  record(key, "attempt", now);

  const isGhosts = kind === "ghosts";
  if (isGhosts ? req.path !== "ghosts" : req.path === "ghosts") {
    return { status: 400, body: { error: "invalid", fields: { path: "invalid_choice" } }, brief };
  }

  /* 4. honeypot */
  if (req.site_web) return silent(kind, brief);

  /* 5. token (no-JS Ghosts is the only path without one) */
  const tokenless = isGhosts && !ctx.js && !req.started;
  let elapsedMs = 0;
  if (!tokenless) {
    const check = checkToken(req.started, now);
    if (!check.ok || check.kind !== kind) {
      const fresh = mintToken(kind, req.locale, now);
      if (check.ok || check.reason === "stale") {
        return { status: 409, body: { error: "stale", started: fresh }, fresh, brief };
      }
      return { status: 400, body: { error: "invalid", fields: { started: "invalid_format" } }, fresh, brief };
    }
    elapsedMs = check.ageMs;
    if (check.ageMs < minMs(kind)) return silent(kind, brief);
    const prior = idempotent.get(req.started as string);
    if (prior && now - prior.at < TOKEN_TTL_MS) {
      const r = prior.result;
      return { status: 201, body: isGhosts ? { ok: true } : { ...r }, accepted: r, brief };
    }
  } else if (origin === "unknown") {
    return { status: 403, body: { error: "forbidden" } };
  }

  /* 6. rate limits and global caps */
  const bucket = isGhosts ? (tokenless ? "ghostsNoToken" : "ghosts") : "brief";
  const wait = retryAfter(key, bucket, now);
  if (wait) return rateLimited(wait);
  if (globalFull(isGhosts ? "ghosts" : "brief", tokenless, now)) {
    return { status: 503, body: { error: "busy" } };
  }

  /* 7. validate */
  const ghostValue = req.contact.value ?? "";
  const ghostCode = isGhosts ? checkGhosts(ghostValue) : null;
  const errors: Errors = isGhosts ? (ghostCode ? { "contact.value": ghostCode } : {}) : validateBrief(brief);
  if (Object.keys(errors).length) {
    return { status: 400, body: { error: "invalid", fields: errors }, errors, brief };
  }

  /* 8. content check */
  if (!isGhosts) {
    const f = brief.fields;
    const texts = [f.problem, f.solved, f.tools, f.bring, f.need, f.why, f.message].filter(Boolean);
    const tooManyUrls = countUrls(f.problem ?? "") > 3 || countUrls(f.message ?? "") > 3;
    const allSame = texts.length > 1 && texts.every((s) => s === texts[0]);
    if (tooManyUrls || allSame) return silent(kind, brief);
  }

  record(key, bucket, now);
  countAccepted(isGhosts ? "ghosts" : "brief", tokenless);

  /* 9. ghosts duplicate: a real 201, nothing written */
  if (isGhosts && (await ghostListed(ghostValue))) {
    return { status: 201, body: { ok: true }, accepted: { id: "", ref: "", fit: "ghosts" } };
  }

  /* 11, 12. fit and write */
  const { id, ref } = newId(new Date(now));
  const fit = isGhosts ? { label: "ghosts", reasons: ["path:ghosts"] } : computeFit(brief);
  const expires = new Date(now);
  expires.setUTCMonth(expires.getUTCMonth() + RETENTION_MONTHS);
  const channel = isGhosts ? ghostsChannel(ghostValue) : brief.contact.channel;
  const rec: IntakeRecord = {
    v: 1,
    id,
    ref,
    received_at: new Date(now).toISOString(),
    expires_at: expires.toISOString(),
    locale: req.locale,
    path: isGhosts ? "ghosts" : brief.path,
    fields: isGhosts ? {} : brief.fields,
    contact: isGhosts
      ? { channel, value: ghostValue }
      : { name: brief.contact.name, channel, value: normalizeContact(channel, brief.contact.value) },
    consent: {
      accepted: true,
      basis: BASIS[isGhosts ? "ghosts" : brief.path] ?? "legitimate-interest",
      text_version: CONSENT_TEXT_VERSION,
      retention_months: RETENTION_MONTHS,
    },
    fit,
    page: req.page ?? "",
    ...(req.from ? { from: req.from } : {}),
    meta: { js: ctx.js, elapsed_s: Math.round(elapsedMs / 1000) },
  };
  await writeRecord(rec);

  /* 10. idempotency for this token */
  const accepted = { id, ref, fit: fit.label };
  if (req.started) {
    for (const [k, v] of idempotent) if (now - v.at > TOKEN_TTL_MS) idempotent.delete(k);
    idempotent.set(req.started, { at: now, result: accepted });
  }

  /* 13. respond */
  return { status: 201, body: isGhosts ? { ok: true } : { ...accepted }, accepted, brief };
}

function rateLimited(seconds: number): ProcessResult {
  return {
    status: 429,
    body: { error: "rate_limited", retry_after: seconds },
    headers: { "Retry-After": String(seconds) },
  };
}
