/**
 * The intake as a conversation (spec §8.4, copy deck §9): one step at a time,
 * answered steps collapse into a recap, validation on « Continuer » and on blur
 * after a first attempt (never while typing), a draft kept for the tab, then a
 * JSON send and the confirmation filled from the server-rendered template.
 * Every visitor string is inserted with textContent.
 */
import { fmt } from "@i18n/define";
import { PATH_FIELDS, validateStep, type Brief, type BriefPath, type Errors } from "@lib/intake/rules";
import { errorText, fieldId, stepOf } from "@lib/intake/messages";
import { composeSummary, QUOTE_CLIP, type IntakeStrings } from "@lib/intake/summary";

const DRAFT_KEY = "wm-intake-v1";
const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;
type Step = 1 | 2 | 3;

interface I18n {
  intake: IntakeStrings;
  paths: Record<"tool" | "open" | "other", { you: string }>;
}

function sleep(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

export function initIntake(form: HTMLFormElement, signal: AbortSignal): void {
  const card = form.closest<HTMLElement>("[data-intake-card]");
  const raw = card?.querySelector("[data-intake-i18n]")?.textContent;
  if (!card || !raw) return;
  const { intake: s, paths } = JSON.parse(raw) as I18n;
  const $ = <T extends Element = HTMLElement>(sel: string): T | null => form.querySelector<T>(sel);
  const steps = new Map<Step, HTMLElement>(
    ([1, 2, 3] as const).map((n) => [n, $(`[data-step="${n}"]`) as HTMLElement]),
  );
  const done = card.querySelector<HTMLElement>('[data-step="4"]');
  const summaryBox = $("[data-err-summary]");
  const progress = $("[data-progress]");
  const live = $("[data-live]");
  const back = $<HTMLButtonElement>("[data-back]");
  const recap = $("[data-recap]");
  const recapPath = $("[data-recap-path]");
  const sitePanel = $("[data-site-panel]");
  const status = $("[data-status]");
  const retry = $<HTMLButtonElement>("[data-retry]");
  const send = $<HTMLButtonElement>('[data-qa="intake-send"]');
  const sendLabel = send?.querySelector<HTMLElement>(".btn-label") ?? null;
  const startedInput = $<HTMLInputElement>('input[name="started"]');
  const minMs = Number(form.dataset.minMs) || 8000;
  if (!done || !summaryBox || !progress || !send || !startedInput) return;

  let step: Step = 1;
  const attempted = new Set<Step>();
  let tokenAt = Date.now();
  let failures = 0;
  let busy = false;

  form.dataset.enhanced = "";
  const fromInput = $<HTMLInputElement>('input[name="from"]');
  try {
    const ref = new URL(document.referrer);
    if (fromInput && ref.origin === location.origin) fromInput.value = (ref.pathname + ref.search).slice(0, 200);
  } catch {
    /* no referrer */
  }

  /* ---- reading the form ------------------------------------------------- */
  const value = (name: string): string => {
    const el = form.elements.namedItem(name);
    if (el instanceof RadioNodeList) return el.value;
    if (el instanceof HTMLInputElement && el.type === "checkbox") return el.checked ? "on" : "";
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value.trim();
    return "";
  };
  const currentPath = (): string => value("path");
  const brief = (): Brief => {
    const path = currentPath();
    const fields: Record<string, string> = {};
    if (path in PATH_FIELDS) {
      for (const f of PATH_FIELDS[path as BriefPath]) {
        fields[f.name] = f.name === "when" ? value(`fields.when.${path}`) : value(`fields.${f.name}`);
      }
    }
    const channel = value("contact.channel");
    return {
      path,
      fields,
      contact: { name: value("contact.name"), channel, value: channel ? value(`contact.value.${channel}`) : "" },
      consent: value("consent") === "on",
    };
  };

  /* ---- errors -------------------------------------------------------------- */
  const containerOf = (key: string): HTMLElement | null => {
    const b = brief();
    const name =
      key === "fields.when" ? `fields.when.${b.path}` : key === "contact.value" ? `contact.value.${b.contact.channel}` : key;
    return form.querySelector<HTMLElement>(`[data-field="${name}"]`);
  };
  const setFieldError = (container: HTMLElement, text: string | null): void => {
    const box = container.querySelector<HTMLElement>(".field-err");
    const span = box?.querySelector("[data-err-text]");
    if (box && span) {
      span.textContent = text ?? "";
      box.hidden = !text;
    }
    for (const control of container.querySelectorAll("input, textarea")) {
      if (text) control.setAttribute("aria-invalid", "true");
      else control.removeAttribute("aria-invalid");
    }
  };
  const clearStep = (n: Step): void => {
    for (const c of steps.get(n)?.querySelectorAll<HTMLElement>("[data-field]") ?? []) setFieldError(c, null);
  };
  const showErrors = (errors: Errors, focus = true): void => {
    const b = brief();
    const keys = Object.keys(errors);
    summaryBox.replaceChildren();
    if (!keys.length) {
      summaryBox.hidden = true;
      return;
    }
    const head = document.createElement("p");
    head.textContent = keys.length === 1 ? s.err.summary.one : fmt(s.err.summary.many, { n: keys.length });
    const list = document.createElement("ul");
    for (const key of keys) {
      const code = errors[key];
      if (!code) continue;
      const text = errorText(key, code, b.contact.channel, s);
      const container = containerOf(key);
      if (container) setFieldError(container, text);
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${fieldId(key, b.path, b.contact.channel)}`;
      a.textContent = text;
      li.append(a);
      list.append(li);
    }
    summaryBox.append(head, list);
    summaryBox.hidden = false;
    if (focus) summaryBox.focus();
  };
  summaryBox.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element).closest("a");
      if (!a) return;
      e.preventDefault();
      document.getElementById(a.hash.slice(1))?.focus();
    },
    { signal },
  );

  /* ---- steps ---------------------------------------------------------------- */
  const render = (n: Step | "site", moveFocus = true): void => {
    if (n !== "site") step = n;
    for (const [k, el] of steps) {
      if (k === n) el.dataset.active = "";
      else delete el.dataset.active;
    }
    if (sitePanel) {
      if (n === "site") sitePanel.dataset.active = "";
      else delete sitePanel.dataset.active;
    }
    const path = currentPath();
    if (path) form.dataset.path = path;
    else delete form.dataset.path;
    progress.textContent = n === "site" ? "" : fmt(s.progress, { n });
    if (back) back.hidden = n === "site" || n === 1;
    if (recap && recapPath) {
      const known = paths[path as keyof typeof paths];
      recap.hidden = n === "site" || n === 1 || !known;
      recapPath.textContent = known?.you ?? "";
    }
    summaryBox.hidden = true;
    if (!moveFocus) return;
    const scope = n === "site" ? sitePanel : n === 2 ? steps.get(2)?.querySelector(`[data-path-group="${path}"]`) : steps.get(n);
    const heading = scope?.querySelector<HTMLElement>(".q");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: false });
  };

  const tryAdvance = (): void => {
    attempted.add(step);
    clearStep(step);
    const errors = validateStep(step, brief());
    if (Object.keys(errors).length) {
      showErrors(errors);
      return;
    }
    if (step < 3) render((step + 1) as Step);
  };

  for (const btn of form.querySelectorAll<HTMLButtonElement>(".continue")) {
    btn.addEventListener("click", tryAdvance, { signal });
  }
  back?.addEventListener("click", () => step > 1 && render((step - 1) as Step), { signal });
  $("[data-change]")?.addEventListener("click", () => render(1), { signal });
  $("[data-site-back]")?.addEventListener("click", () => render(1), { signal });
  form.addEventListener(
    "change",
    (e) => {
      const t = e.target as HTMLInputElement;
      if (t.name === "path") form.dataset.path = t.value;
      if (t.name === "fields.topic") {
        const hint = form.querySelector("#other-message-hint");
        if (hint) hint.textContent = t.value === "data" ? s.other.msg.hintData : s.other.msg.hint;
      }
    },
    { signal },
  );

  /* blur validation, only after a first attempt at that step */
  form.addEventListener(
    "focusout",
    (e) => {
      const container = (e.target as Element).closest<HTMLElement>("[data-field]");
      if (!container || !attempted.has(step)) return;
      const errors = validateStep(step, brief());
      const key = Object.keys(errors).find((k) => containerOf(k) === container);
      setFieldError(container, key ? errorText(key, errors[key] ?? "required", brief().contact.channel, s) : null);
    },
    { signal },
  );

  /* ---- character counters (80 % and 100 % announced) ------------------------- */
  for (const el of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-max]")) {
    const max = Number(el.dataset.max);
    const counter = el.closest("[data-field]")?.querySelector<HTMLElement>("[data-count]");
    let said = 0;
    el.addEventListener(
      "input",
      () => {
        const n = [...el.value].length;
        const text = fmt(s.count, { n, max });
        if (counter) {
          counter.hidden = n < max * 0.8;
          counter.textContent = text;
        }
        const mark = n >= max ? 100 : n >= max * 0.8 ? 80 : 0;
        if (mark && mark !== said && live) live.textContent = text;
        said = mark;
      },
      { signal },
    );
  }

  /* ---- draft ------------------------------------------------------------------ */
  let saveTimer = 0;
  const saveDraft = (): void => {
    const data: Record<string, string> = {};
    for (const [k, v] of new FormData(form)) {
      if (typeof v === "string" && !["started", "site_web", "from", "page", "locale"].includes(k)) data[k] = v;
    }
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      /* storage blocked: no draft */
    }
  };
  form.addEventListener(
    "input",
    () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(saveDraft, 300);
    },
    { signal },
  );
  form.addEventListener("change", saveDraft, { signal });
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null") as Record<string, string> | null;
    for (const [k, v] of Object.entries(draft ?? {})) {
      const el = form.elements.namedItem(k);
      if (el instanceof RadioNodeList) {
        if (!(k === "path" && form.dataset.chemin)) el.value = v;
      } else if (el instanceof HTMLInputElement && el.type === "checkbox") el.checked = v === "on";
      else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = v;
    }
  } catch {
    /* no draft */
  }

  /* ---- send --------------------------------------------------------------------- */
  const setBusy = (on: boolean): void => {
    busy = on;
    send.disabled = on;
    if (on) send.setAttribute("aria-busy", "true");
    else send.removeAttribute("aria-busy");
    if (sendLabel) sendLabel.textContent = on ? s.s3.sending : s.s3.send;
  };
  const say = (text: string, canRetry: boolean): void => {
    if (status) status.textContent = text;
    if (retry) retry.hidden = !canRetry;
  };

  const showDone = (b: Brief, ref: string, fit: string): void => {
    const slot = (name: string): HTMLElement | null => done.querySelector<HTMLElement>(`[data-slot="${name}"]`);
    const title = slot("title");
    if (title) title.textContent = fmt(s.done.title, { name: b.contact.name });
    const summary = slot("summary");
    if (summary) {
      summary.replaceChildren();
      for (const part of composeSummary(b, s)) {
        const span = document.createElement("span");
        span.className = part.kind === "frag" ? "sum-frag" : part.kind === "value" ? "sum-value" : "sum-quote";
        if (part.kind !== "quote") {
          span.textContent = part.text;
          summary.append(span);
          continue;
        }
        if ([...part.text].length <= QUOTE_CLIP) {
          span.textContent = s.sum.quote.open + part.text + s.sum.quote.close;
          summary.append(span);
          continue;
        }
        const chars = [...part.text];
        const shown = document.createTextNode(s.sum.quote.open + chars.slice(0, QUOTE_CLIP).join(""));
        const ell = document.createElement("span");
        ell.textContent = "…";
        ell.setAttribute("aria-hidden", "true");
        const rest = document.createElement("span");
        rest.hidden = true;
        rest.textContent = chars.slice(QUOTE_CLIP).join("");
        span.append(shown, ell, rest, document.createTextNode(s.sum.quote.close));
        const more = document.createElement("button");
        more.type = "button";
        more.className = "q-more";
        more.textContent = s.sum.more;
        more.addEventListener("click", () => {
          rest.hidden = false;
          ell.remove();
          more.remove();
        });
        summary.append(span, more);
      }
    }
    const fitEl = slot("fit");
    if (fitEl) {
      fitEl.textContent = s.fit[fit as keyof typeof s.fit] ?? "";
      fitEl.dataset.fit = fit;
    }
    const next = slot("next");
    if (next) next.textContent = fit === "data" ? s.done.nextData : s.done.next;
    const refEl = slot("ref");
    if (refEl) refEl.textContent = fmt(s.done.ref, { ref });
    for (const read of done.querySelectorAll<HTMLElement>("[data-read]")) read.hidden = read.dataset.read !== b.path;
    form.hidden = true;
    done.hidden = false;
    done.dataset.qa = "intake-done";
    title?.focus();
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* storage blocked */
    }
  };

  const submit = async (): Promise<void> => {
    if (busy) return;
    const b = brief();
    for (const n of [1, 2, 3] as const) {
      attempted.add(n);
      const errors = validateStep(n, b);
      if (Object.keys(errors).length) {
        render(n, false);
        showErrors(errors);
        return;
      }
    }
    setBusy(true);
    say("", false);
    /* never let a fast human hit the silent drop: wait out the minimum time */
    const wait = minMs - (Date.now() - tokenAt) + 150;
    if (wait > 0) await sleep(wait);
    const post = async (resent: boolean): Promise<void> => {
      if (Date.now() - tokenAt > TOKEN_MAX_AGE_MS - 60_000) {
        const r = await fetch(`/api/intake/start?kind=brief&locale=${form.dataset.locale}`, { signal }).catch(() => null);
        const body = (await r?.json().catch(() => null)) as { started?: string } | null;
        if (body?.started) {
          startedInput.value = body.started;
          tokenAt = Date.now();
          await sleep(minMs);
        }
      }
      const payload = {
        locale: form.dataset.locale,
        ...b,
        started: startedInput.value,
        page: value("page"),
        from: value("from") || undefined,
        site_web: value("site_web"),
      };
      let res: Response;
      try {
        res = await fetch("/api/intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal,
        });
      } catch {
        fail(s.net.offline);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (res.status === 201) {
        showDone(b, String(body.ref ?? ""), String(body.fit ?? ""));
        return;
      }
      if (res.status === 409 && !resent && typeof body.started === "string") {
        startedInput.value = body.started;
        tokenAt = Date.now();
        await sleep(minMs + 150);
        return post(true);
      }
      if (res.status === 400 && body.fields && typeof body.fields === "object") {
        const errors = body.fields as Errors;
        const first = Math.min(...Object.keys(errors).map(stepOf)) as Step;
        if (Number.isFinite(first)) {
          render(first, false);
          showErrors(errors);
        }
        say(s.net.invalid, false);
        return;
      }
      if (res.status === 413) return fail(s.net.tooLarge);
      if (res.status === 429) {
        const minutes = Math.max(1, Math.ceil(Number(body.retry_after ?? 600) / 60));
        return fail(fmt(s.net.rate, { minutes }));
      }
      fail(s.net.server);
    };
    const fail = (text: string): void => {
      failures++;
      say(failures >= 2 ? `${text} ${s.net.fallback}` : text, true);
    };
    await post(false);
    setBusy(false);
  };

  retry?.addEventListener("click", () => void submit(), { signal });
  form.addEventListener(
    "submit",
    (e) => {
      /* synchronously, before ClientRouter sees it (critique E16.3) */
      e.preventDefault();
      if (step < 3) tryAdvance();
      else void submit();
    },
    { signal },
  );

  /* ---- start ------------------------------------------------------------------- */
  const chemin = form.dataset.chemin;
  if (chemin === "site" && sitePanel) render("site", false);
  else if (chemin && currentPath()) render(2, false);
  else render(1, false);
}
