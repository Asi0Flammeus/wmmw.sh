/**
 * The intake inbox on disk (spec §8.3 steps 9, 10, 12; retention). One JSON
 * file per request in INTAKE_DIR (dir 0700, files 0600), written to a temp
 * file then renamed. No top-level side effects (errata E7): the directory is
 * created and the retention sweep started on the first read or write.
 */
import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const INTAKE_ID_RE = /^[a-z0-9][a-z0-9-]{7,63}$/;
const CROCKFORD = "0123456789abcdefghjkmnpqrstvwxyz";
const MAX_FILES = 5000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface IntakeRecord {
  v: 1;
  id: string;
  ref: string;
  received_at: string;
  expires_at: string;
  locale: string;
  path: string;
  fields: Record<string, string>;
  contact: { name?: string; channel: string; value: string };
  consent: { accepted: true; basis: string; text_version: string; retention_months: number };
  fit: { label: string; reasons: string[] };
  page: string;
  from?: string;
  meta: { js: boolean; elapsed_s: number };
}

export const intakeDir = (): string => process.env.INTAKE_DIR || join(process.cwd(), ".intake");

let ready: Promise<void> | undefined;
let ghostValues: Set<string> | undefined;

/** Create the directory and start the daily retention sweep, once. */
function ensure(): Promise<void> {
  ready ??= (async () => {
    await mkdir(intakeDir(), { recursive: true, mode: 0o700 });
    await sweep();
    setInterval(() => void sweep().catch((e) => console.error("[intake] sweep", e)), DAY_MS).unref();
  })();
  return ready;
}

/** id = UTC YYYYMMDD-HHMMSS- + 8 Crockford chars (40 random bits); ref = the 8 chars, uppercase, 4 + 4. */
export function newId(now = new Date()): { id: string; ref: string } {
  const bytes = randomBytes(5);
  let bits = 0n;
  for (const b of bytes) bits = (bits << 8n) | BigInt(b);
  let code = "";
  for (let i = 0; i < 8; i++) code = CROCKFORD[Number((bits >> BigInt(i * 5)) & 31n)] + code;
  const stamp = now.toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  return { id: `${stamp}-${code}`, ref: `${code.slice(0, 4)} ${code.slice(4)}`.toUpperCase() };
}

export async function writeRecord(record: IntakeRecord): Promise<void> {
  await ensure();
  const file = join(intakeDir(), `${record.id}.json`);
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(tmp, JSON.stringify(record, null, 2), { mode: 0o600 });
  await rename(tmp, file);
  if (record.path === "ghosts") (await ghostsIndex()).add(normalizeGhost(record.contact.value));
}

export async function readRecord(id: string): Promise<IntakeRecord | null> {
  if (!INTAKE_ID_RE.test(id)) return null;
  await ensure();
  try {
    return JSON.parse(await readFile(join(intakeDir(), `${id}.json`), "utf8")) as IntakeRecord;
  } catch {
    return null;
  }
}

export async function deleteRecord(id: string): Promise<boolean> {
  if (!INTAKE_ID_RE.test(id)) return false;
  await ensure();
  try {
    await unlink(join(intakeDir(), `${id}.json`));
    ghostValues = undefined;
    return true;
  } catch {
    return false;
  }
}

/** Every record, newest first (ids sort by time). */
export async function listRecords(): Promise<IntakeRecord[]> {
  await ensure();
  const names = (await readdir(intakeDir())).filter((f) => f.endsWith(".json")).sort().reverse();
  const out: IntakeRecord[] = [];
  for (const name of names) {
    try {
      out.push(JSON.parse(await readFile(join(intakeDir(), name), "utf8")) as IntakeRecord);
    } catch {
      /* a half-written or foreign file: skip it */
    }
  }
  return out;
}

export const normalizeGhost = (value: string): string => value.trim().toLowerCase().replace(/^@/, "");

/** Normalised values already on the Ghosts list (built from disk on first use). */
async function ghostsIndex(): Promise<Set<string>> {
  if (!ghostValues) {
    const set = new Set<string>();
    for (const r of await listRecords()) if (r.path === "ghosts") set.add(normalizeGhost(r.contact.value));
    ghostValues = set;
  }
  return ghostValues;
}

export async function ghostListed(value: string): Promise<boolean> {
  await ensure();
  return (await ghostsIndex()).has(normalizeGhost(value));
}

/** Delete files past expires_at; above MAX_FILES delete the oldest and log. */
async function sweep(): Promise<void> {
  const dir = intakeDir();
  const names = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
  const now = Date.now();
  let kept = names.length;
  for (const name of names) {
    try {
      const rec = JSON.parse(await readFile(join(dir, name), "utf8")) as IntakeRecord;
      if (Date.parse(rec.expires_at) <= now) {
        await unlink(join(dir, name));
        kept--;
      }
    } catch {
      /* unreadable: leave it for a human */
    }
  }
  if (kept > MAX_FILES) {
    const remaining = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort();
    const drop = remaining.slice(0, remaining.length - MAX_FILES);
    for (const name of drop) await unlink(join(dir, name)).catch(() => undefined);
    console.warn(`[intake] over ${MAX_FILES} files: deleted the ${drop.length} oldest`);
  }
  ghostValues = undefined;
}
