/**
 * Request shape (deck §9.8), server only. zod coerces the shape and drops
 * unknown keys; every string goes through rules.clean. The field-level rules
 * (limits, enums, formats) live in rules.ts so the client runs the same ones.
 */
import { z } from "zod";
import { clean, PATH_FIELDS, PATHS, type Brief, type BriefPath } from "./rules";

/* optional input: an absent key must parse (zod 4 marks a bare transform non-optional) */
const text = z.unknown().optional().transform(clean);
const LOCALES = ["fr", "en", "es"] as const;

/** A same-origin path (no scheme, no protocol-relative), at most 200 chars, else undefined. */
const localPath = text.transform((s) => (s.startsWith("/") && !s.startsWith("//") ? s.slice(0, 200) : undefined));

export const requestSchema = z.object({
  locale: z.enum(LOCALES).catch("fr"),
  path: text,
  fields: z.record(z.string(), z.unknown()).catch({}).default({}),
  contact: z
    .object({ name: text.optional(), channel: text.optional(), value: text.optional() })
    .catch({})
    .default({}),
  consent: z
    .unknown()
    .optional()
    .transform((v) => v === true || v === "on" || v === "true"),
  started: text.optional(),
  page: localPath.optional(),
  from: localPath.optional(),
  site_web: text.optional(),
});

export type IntakeRequest = z.infer<typeof requestSchema>;

/** The brief as the rules see it: only the fields of its path, cleaned. */
export function toBrief(req: IntakeRequest): Brief {
  const path = req.path ?? "";
  const fields: Record<string, string> = {};
  if ((PATHS as readonly string[]).includes(path)) {
    for (const f of PATH_FIELDS[path as BriefPath]) fields[f.name] = clean(req.fields[f.name]);
  }
  return {
    path,
    fields,
    contact: {
      name: req.contact.name ?? "",
      channel: req.contact.channel ?? "",
      value: req.contact.value ?? "",
    },
    consent: req.consent,
  };
}
