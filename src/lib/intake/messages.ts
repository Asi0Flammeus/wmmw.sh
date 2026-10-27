/**
 * Field ids and error sentences of the intake, shared by the server-rendered
 * no-JS form and the client (copy deck §9.6). Pure: strings come in as data.
 */
import { fmt } from "@i18n/define";
import type { IntakeStrings } from "./summary";
import { LIMITS, type Code, type TextField } from "./rules";

/** DOM id of the control an error key points to (first chip of a fieldset). */
export function fieldId(key: string, path: string, channel: string): string {
  const field = key.replace(/^fields\./, "");
  switch (key) {
    case "path":
      return "path-tool";
    case "contact.name":
      return "contact-name";
    case "contact.channel":
      return "channel-email";
    case "contact.value":
      return `contact-value-${channel || "email"}`;
    case "consent":
      return "consent";
    case "fields.team":
      return "tool-team-solo";
    case "fields.when":
      return `${path === "open" ? "open" : "tool"}-when-asap`;
    case "fields.budget":
      return "tool-budget-lt2k";
    case "fields.funding":
      return "open-funding-yes";
    case "fields.topic":
      return "other-topic-question";
    default:
      return `${path}-${field}`;
  }
}

/** The sentence for one error, in William's voice. */
export function errorText(key: string, code: Code, channel: string, s: IntakeStrings): string {
  const e = s.err;
  if (key === "path") return e.path;
  if (key === "consent") return e.consent;
  if (key === "contact.name") return code === "too_long" ? fmt(e.long, { max: LIMITS.name[1] }) : e.name;
  if (key === "contact.channel") return e.channel;
  if (key === "contact.value") {
    if (code === "required") return e.required;
    if (channel === "other") return code === "too_long" ? fmt(e.long, { max: LIMITS.other[1] }) : e.other;
    return e[channel as "email" | "x" | "telegram" | "signal"] ?? e.required;
  }
  const field = key.replace(/^fields\./, "");
  if (field === "team") return e.team;
  if (field === "when") return e.when;
  if (field === "budget") return e.budget;
  if (field === "link" && code === "invalid_format") return e.url;
  if (field in LIMITS) {
    const [min, max] = LIMITS[field as TextField];
    if (code === "too_short") return fmt(e.short, { min });
    if (code === "too_long") return fmt(e.long, { max });
  }
  return e.required;
}

/** Which step an error key belongs to. */
export function stepOf(key: string): 1 | 2 | 3 {
  if (key === "path") return 1;
  return key.startsWith("fields.") ? 2 : 3;
}
