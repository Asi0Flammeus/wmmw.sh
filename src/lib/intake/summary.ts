/**
 * The honest confirmation (copy deck §9.7): fixed fragments in William's voice
 * plus the visitor's own words, never rewritten. Pure and shared: the server
 * renders it for the no-JS confirmation, the client for the JS one, so the
 * two can never drift. Every part is inserted as text, never as HTML.
 */
import type { Dict } from "@i18n/index";
import type { Brief } from "./rules";

export type IntakeStrings = Dict["intake"];

/** frag: William's words (ink-2); quote: the visitor's words, quoted (ink); value: visitor data, unquoted (ink). */
export interface Part {
  kind: "frag" | "quote" | "value";
  text: string;
}

/** A quote longer than this is clipped in the confirmation behind « Tout afficher ». */
export const QUOTE_CLIP = 240;

/** Split "Ce qui coince : {problem}" around its placeholders into parts. */
function fill(template: string, vars: Record<string, Part>): Part[] {
  const parts: Part[] = [];
  let last = 0;
  for (const m of template.matchAll(/\{(\w+)\}/g)) {
    const v = vars[m[1] ?? ""];
    if (!v) continue;
    if (m.index > last) parts.push({ kind: "frag", text: template.slice(last, m.index) });
    parts.push(v);
    last = m.index + m[0].length;
  }
  if (last < template.length) parts.push({ kind: "frag", text: template.slice(last) });
  return parts;
}

/** Summary paragraph parts, only for answered fields, in deck order; sentences joined by one space. */
export function composeSummary(brief: Brief, s: IntakeStrings): Part[] {
  const sum = s.sum;
  const f = brief.fields;
  const sentences: Part[][] = [];
  const say = (text: string | undefined): void => {
    if (text) sentences.push([{ kind: "frag", text }]);
  };
  const quote = (template: string, key: string): void => {
    if (f[key]) sentences.push(fill(template, { [key]: { kind: "quote", text: f[key] } }));
  };

  if (brief.path === "tool") {
    say(sum.tool.intro);
    say(sum.team[f.team as keyof typeof sum.team]);
    quote(sum.tool.problem, "problem");
    quote(sum.tool.solved, "solved");
    quote(sum.tool.tools, "tools");
    say(sum.when[f.when as keyof typeof sum.when]);
    say(sum.budget[f.budget as keyof typeof sum.budget]);
  } else if (brief.path === "open") {
    say(sum.open.intro);
    quote(sum.open.link, "link");
    quote(sum.open.bring, "bring");
    quote(sum.open.need, "need");
    quote(sum.open.why, "why");
    say(sum.open.funding[f.funding as keyof typeof sum.open.funding]);
    say(sum.when[f.when as keyof typeof sum.when]);
  } else if (brief.path === "other") {
    say(sum.other.intro);
    say(sum.other.topic[f.topic as keyof typeof sum.other.topic]);
    quote(sum.other.msg, "message");
  }

  const { channel, value } = brief.contact;
  if (channel && value) {
    sentences.push(
      fill(sum.reply, {
        via: { kind: "frag", text: sum.via[channel as keyof typeof sum.via] ?? sum.via.other },
        value: { kind: "value", text: value },
      }),
    );
  }
  return sentences.flatMap((parts, i) => (i ? [{ kind: "frag", text: " " } as Part, ...parts] : parts));
}
