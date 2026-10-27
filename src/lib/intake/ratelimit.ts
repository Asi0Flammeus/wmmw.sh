/**
 * In-memory rate limits (spec §8.3 step 6, critique E10 and E19). Nothing is
 * written to disk: keys are sha256(ip + daily salt) and vanish with the process.
 *
 * Per key: accepted briefs 3 per 10 min and 10 per 24 h; accepted ghosts 2 per
 * 10 min; token-less ghosts 1 per 10 min; every POST 30 per 10 min (attempts,
 * so fixing validation errors never trips it). Global per UTC day: 200 accepted,
 * at most 50 ghosts, at most 10 token-less ghosts.
 */
import { createHash, randomBytes } from "node:crypto";

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

type Bucket = "attempt" | "brief" | "ghosts" | "ghostsNoToken";
const RULES: Record<Bucket, { limit: number; windowMs: number }[]> = {
  attempt: [{ limit: 30, windowMs: 10 * MIN }],
  brief: [
    { limit: 3, windowMs: 10 * MIN },
    { limit: 10, windowMs: DAY },
  ],
  ghosts: [{ limit: 2, windowMs: 10 * MIN }],
  ghostsNoToken: [{ limit: 1, windowMs: 10 * MIN }],
};

const hits = new Map<string, number[]>();
let salt = { day: "", value: "" };
let global = { day: "", accepted: 0, ghosts: 0, ghostsNoToken: 0 };
let warnedNoForward = false;

const utcDay = (now: number): string => new Date(now).toISOString().slice(0, 10);

function hashKey(ip: string, now: number): string {
  const day = utcDay(now);
  if (salt.day !== day) {
    salt = { day, value: randomBytes(16).toString("hex") };
    hits.clear();
  }
  return createHash("sha256").update(ip + salt.value).digest("hex");
}

const PRIVATE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|::ffff:(127|10|192\.168)\.)/i;

/**
 * Client key. nginx sets X-Real-IP to $remote_addr; failing that, the last
 * X-Forwarded-For entry (the one our proxy appended), else the socket address.
 * Behind a proxy that forwards nothing, the socket is the proxy: per-key limits
 * are skipped (null) and only the global caps apply.
 */
export function clientKey(request: Request, clientAddress: string | undefined, now = Date.now()): string | null {
  const real = request.headers.get("x-real-ip")?.trim();
  const xff = request.headers.get("x-forwarded-for");
  const forwarded = real || xff?.split(",").map((s) => s.trim()).filter(Boolean).at(-1);
  const ip = forwarded || clientAddress || "";
  if (!forwarded && (!ip || PRIVATE.test(ip))) {
    if (!warnedNoForward) {
      warnedNoForward = true;
      console.warn("[intake] no forwarding header from a private address: per-client limits skipped");
    }
    return null;
  }
  return hashKey(ip, now);
}

/** Seconds until the key may try `bucket` again, or 0 when allowed. Does not record. */
export function retryAfter(key: string | null, bucket: Bucket, now = Date.now()): number {
  if (!key) return 0;
  let wait = 0;
  for (const rule of RULES[bucket]) {
    const list = (hits.get(`${bucket}:${key}`) ?? []).filter((t) => now - t < rule.windowMs);
    const oldest = list[0];
    if (oldest !== undefined && list.length >= rule.limit) {
      wait = Math.max(wait, Math.ceil((oldest + rule.windowMs - now) / 1000));
    }
  }
  return wait;
}

export function record(key: string | null, bucket: Bucket, now = Date.now()): void {
  if (!key) return;
  const id = `${bucket}:${key}`;
  const keep = Math.max(...RULES[bucket].map((r) => r.windowMs));
  const list = (hits.get(id) ?? []).filter((t) => now - t < keep);
  list.push(now);
  hits.set(id, list);
}

/** Global daily caps: true when one more accepted submission of this kind is over the cap. */
export function globalFull(kind: "brief" | "ghosts", tokenless: boolean, now = Date.now()): boolean {
  const day = utcDay(now);
  if (global.day !== day) global = { day, accepted: 0, ghosts: 0, ghostsNoToken: 0 };
  if (global.accepted >= 200) return true;
  if (kind === "ghosts" && global.ghosts >= 50) return true;
  return kind === "ghosts" && tokenless && global.ghostsNoToken >= 10;
}

export function countAccepted(kind: "brief" | "ghosts", tokenless: boolean): void {
  global.accepted++;
  if (kind === "ghosts") global.ghosts++;
  if (kind === "ghosts" && tokenless) global.ghostsNoToken++;
}
