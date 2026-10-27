/**
 * Intake rules shared by the client bundle and the server (copy deck §9.8).
 * Pure: no imports, no side effects, no zod. The server is the authority;
 * the client runs the same checks so a visitor sees the error before sending.
 */

export const PATHS = ["tool", "open", "other"] as const;
export type BriefPath = (typeof PATHS)[number];

export const CHANNELS = ["email", "x", "telegram", "signal", "other"] as const;
export type Channel = (typeof CHANNELS)[number];

export const ENUMS = {
  team: ["solo", "2-10", "11-50", "50+"],
  when: ["asap", "1-3m", "later", "unsure"],
  budget: ["lt2k", "2k-5k", "5k-15k", "15k+", "unsure"],
  funding: ["yes", "no", "not-yet"],
  topic: ["question", "invitation", "data", "other"],
} as const;
export type EnumField = keyof typeof ENUMS;

/** [min, max] characters; min 0 means optional. */
export const LIMITS = {
  problem: [20, 1200],
  solved: [0, 600],
  tools: [0, 300],
  link: [0, 300],
  bring: [10, 800],
  need: [10, 800],
  why: [0, 500],
  message: [10, 500],
  name: [1, 80],
  other: [3, 120],
  ghosts: [3, 254],
} as const;
export type TextField = keyof typeof LIMITS;

/** Fields of each path, in deck order: text fields carry limits, enum fields a list. */
export const PATH_FIELDS: Record<BriefPath, readonly { name: string; kind: "text" | "enum"; required: boolean }[]> = {
  tool: [
    { name: "team", kind: "enum", required: true },
    { name: "problem", kind: "text", required: true },
    { name: "solved", kind: "text", required: false },
    { name: "tools", kind: "text", required: false },
    { name: "when", kind: "enum", required: true },
    { name: "budget", kind: "enum", required: true },
  ],
  open: [
    { name: "link", kind: "text", required: false },
    { name: "bring", kind: "text", required: true },
    { name: "need", kind: "text", required: true },
    { name: "why", kind: "text", required: false },
    { name: "funding", kind: "enum", required: false },
    { name: "when", kind: "enum", required: false },
  ],
  other: [
    { name: "topic", kind: "enum", required: false },
    { name: "message", kind: "text", required: true },
  ],
};

export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_LINE_BREAKS = 30;
export const RETENTION_MONTHS = 12;
export const CONSENT_TEXT_VERSION = "2026-10-17";
export const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export const RE = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  x: /^@?[A-Za-z0-9_]{1,15}$/,
  telegram: /^@?[A-Za-z0-9_]{5,32}$/,
  signalUser: /^@?[A-Za-z][A-Za-z0-9_]{2,31}\.\d{2,}$/,
  signalPhone: /^\+[1-9]\d{6,14}$/,
} as const;

export type Code = "required" | "too_short" | "too_long" | "invalid_format" | "invalid_choice";
/** Error map keyed by payload path: "path", "fields.problem", "contact.value", "consent". */
export type Errors = Record<string, Code>;

export interface Brief {
  path: string;
  fields: Record<string, string>;
  contact: { name: string; channel: string; value: string };
  consent: boolean;
}

/**
 * Normalise visitor text: NFC, CRLF to LF, control characters except \n
 * removed, at most 30 line breaks (extra ones become spaces), trimmed.
 */
export function clean(value: unknown): string {
  if (typeof value !== "string") return "";
  let s = value.normalize("NFC").replace(/\r\n?/g, "\n");
  s = s.replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, "");
  let breaks = 0;
  s = s.replace(/\n/g, () => (++breaks > MAX_LINE_BREAKS ? " " : "\n"));
  return s.trim();
}

export function checkText(value: string, field: TextField, required: boolean): Code | null {
  const [min, max] = LIMITS[field];
  const n = [...value].length;
  if (!n) return required ? "required" : null;
  if (n < min) return "too_short";
  if (n > max) return "too_long";
  return null;
}

export function checkEnum(value: string, field: EnumField, required: boolean): Code | null {
  if (!value) return required ? "required" : null;
  return (ENUMS[field] as readonly string[]).includes(value) ? null : "invalid_choice";
}

/** http(s) URL check for the open path link. */
export function checkUrl(value: string): Code | null {
  if (!value) return null;
  const tooLong = checkText(value, "link", false);
  if (tooLong) return tooLong;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? null : "invalid_format";
  } catch {
    return "invalid_format";
  }
}

/** Contact value per channel (spaces stripped for Signal phone numbers). */
export function checkContact(channel: string, value: string): Code | null {
  if (!value) return "required";
  switch (channel) {
    case "email":
      return value.length <= 254 && RE.email.test(value) ? null : "invalid_format";
    case "x":
      return RE.x.test(value) ? null : "invalid_format";
    case "telegram":
      return RE.telegram.test(value) ? null : "invalid_format";
    case "signal": {
      const compact = value.replace(/\s+/g, "");
      return RE.signalUser.test(value) || RE.signalPhone.test(compact) ? null : "invalid_format";
    }
    case "other":
      return checkText(value, "other", true);
    default:
      return "invalid_choice";
  }
}

/** Stored form of a contact value: leading @ dropped for X and Telegram, phone compacted. */
export function normalizeContact(channel: string, value: string): string {
  if (channel === "x" || channel === "telegram") return value.replace(/^@/, "");
  if (channel === "signal" && RE.signalPhone.test(value.replace(/\s+/g, ""))) {
    return value.replace(/\s+/g, "");
  }
  return value;
}

/** Errors of one step (1 path, 2 brief, 3 reply). */
export function validateStep(step: 1 | 2 | 3, brief: Brief): Errors {
  const errors: Errors = {};
  const path = brief.path as BriefPath;
  if (step === 1) {
    if (!(PATHS as readonly string[]).includes(brief.path)) {
      errors.path = brief.path ? "invalid_choice" : "required";
    }
    return errors;
  }
  if (step === 2) {
    if (!(PATHS as readonly string[]).includes(brief.path)) return errors;
    for (const f of PATH_FIELDS[path]) {
      const v = brief.fields[f.name] ?? "";
      const code =
        f.kind === "enum"
          ? checkEnum(v, f.name as EnumField, f.required)
          : f.name === "link"
            ? checkUrl(v)
            : checkText(v, f.name as TextField, f.required);
      if (code) errors[`fields.${f.name}`] = code;
    }
    return errors;
  }
  const { name, channel, value } = brief.contact;
  const nameCode = checkText(name, "name", true);
  if (nameCode) errors["contact.name"] = nameCode;
  if (!(CHANNELS as readonly string[]).includes(channel)) {
    errors["contact.channel"] = channel ? "invalid_choice" : "required";
  } else {
    const valueCode = checkContact(channel, value);
    if (valueCode) errors["contact.value"] = valueCode;
  }
  if (brief.consent !== true) errors.consent = "required";
  return errors;
}

export function validateBrief(brief: Brief): Errors {
  return { ...validateStep(1, brief), ...validateStep(2, brief), ...validateStep(3, brief) };
}

/** Ghosts: one value, an email (when it looks like one) or a handle. */
export function checkGhosts(value: string): Code | null {
  if (!value) return "required";
  const code = checkText(value, "ghosts", true);
  if (code) return code === "too_short" ? "invalid_format" : code;
  if (/^[^\s@]+@/.test(value) && !RE.email.test(value)) return "invalid_format";
  return null;
}

export function ghostsChannel(value: string): "email" | "other" {
  return RE.email.test(value) ? "email" : "other";
}

/** Number of http(s) URLs in a text (content check: more than 3 is spam). */
export function countUrls(text: string): number {
  return (text.match(/https?:\/\//gi) ?? []).length;
}
