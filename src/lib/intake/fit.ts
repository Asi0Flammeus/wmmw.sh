/** Server-side fit label (copy deck §9.7, first match wins). Never taken from the client. */
import type { Brief } from "./rules";

export type FitLabel = "data" | "budget-open" | "small" | "urgent" | "tool" | "open" | "other" | "ghosts";

export function computeFit(brief: Brief): { label: FitLabel; reasons: string[] } {
  const f = brief.fields;
  if (brief.path === "other" && f.topic === "data") return { label: "data", reasons: ["topic:data"] };
  if (brief.path === "tool") {
    if (f.budget === "unsure") return { label: "budget-open", reasons: ["budget:unsure"] };
    if (f.budget === "lt2k") return { label: "small", reasons: ["budget:lt2k"] };
    if (f.when === "asap") return { label: "urgent", reasons: ["when:asap"] };
    return { label: "tool", reasons: ["path:tool"] };
  }
  if (brief.path === "open") return { label: "open", reasons: ["path:open"] };
  return { label: "other", reasons: ["path:other"] };
}
