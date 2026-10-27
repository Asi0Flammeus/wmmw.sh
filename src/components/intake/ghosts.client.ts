/**
 * Ghosts « Préviens-moi », enhanced (spec §8.6, critique E9 and E19): the
 * disclosure becomes a button with a 200 ms reveal, a start token is fetched
 * on first open or focus (fresh again at submit when older than 2 h), the
 * send waits out the remaining minimum time while busy, then posts JSON.
 */
import { TOKEN_MAX_AGE_MS, checkGhosts } from "@lib/intake/rules";

const DONE_KEY = "wm-ghosts-done";

interface Strings {
  sending: string;
  submit: string;
  err: { empty: string; format: string; net: string };
}

function sleep(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

export function initGhosts(root: HTMLElement, signal: AbortSignal): void {
  const form = root.querySelector<HTMLFormElement>("form");
  const details = root.querySelector<HTMLElement>(".gn-details");
  const region = root.querySelector<HTMLElement>(".gn-region");
  const toggle = root.querySelector<HTMLButtonElement>(".gn-toggle");
  const doneLine = root.querySelector<HTMLElement>("[data-done]");
  const input = root.querySelector<HTMLInputElement>(".gn-input");
  const errBox = root.querySelector<HTMLElement>(".gn-error");
  const submit = root.querySelector<HTMLButtonElement>("button[type=submit]");
  if (!form || !details || !region || !doneLine || !input || !errBox || !submit) return;
  const strings = JSON.parse(root.querySelector("[data-i18n]")?.textContent ?? "{}") as Strings;
  const closed = root.dataset.open !== "true";
  const minMs = Number(root.dataset.minMs) || 3000;
  const label = submit.querySelector<HTMLElement>(".btn-label") ?? submit;
  const errId = errBox.id;
  let token = "";
  let tokenAt = 0;
  let pending: Promise<void> | null = null;

  const finish = (): void => {
    details.hidden = true;
    if (toggle) toggle.hidden = true;
    doneLine.hidden = false;
  };

  let done = false;
  try {
    done = sessionStorage.getItem(DONE_KEY) === "1";
  } catch {
    /* storage blocked */
  }
  if (done) {
    finish();
    if (closed) doneLine.hidden = true;
    return;
  }

  const fetchToken = (): Promise<void> => {
    pending ??= fetch(`/api/intake/start?kind=ghosts&locale=${root.dataset.locale ?? "fr"}`, { signal })
      .then((r) => r.json() as Promise<{ started: string }>)
      .then((b) => {
        token = b.started;
        tokenAt = Date.now();
      })
      .catch(() => undefined)
      .finally(() => {
        pending = null;
      });
    return pending;
  };

  /* closed variant: the details stays open, the region opens and closes */
  if (closed && toggle && details instanceof HTMLDetailsElement) {
    const wasOpen = details.open;
    details.open = true;
    details.dataset.enhanced = "";
    region.hidden = !wasOpen;
    toggle.setAttribute("aria-expanded", String(wasOpen));
    if (wasOpen) void fetchToken();
    const anim = document.documentElement.classList.contains("anim");
    toggle.addEventListener(
      "click",
      () => {
        const opening = region.hidden;
        toggle.setAttribute("aria-expanded", String(opening));
        if (opening) {
          void fetchToken();
          region.hidden = false;
          if (anim) {
            region.dataset.opening = "";
            void region.offsetHeight;
            delete region.dataset.opening;
          }
          return;
        }
        if (!anim) {
          region.hidden = true;
          return;
        }
        region.dataset.closing = "";
        region.addEventListener(
          "transitionend",
          () => {
            region.hidden = true;
            delete region.dataset.closing;
          },
          { once: true, signal },
        );
      },
      { signal },
    );
  } else {
    form.addEventListener("focusin", () => token || void fetchToken(), { signal, once: true });
  }

  const showError = (key: keyof Strings["err"] | null): void => {
    const text = errBox.querySelector("[data-err-text]");
    if (text) text.textContent = key ? strings.err[key] : "";
    errBox.hidden = !key;
    const described = new Set((input.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
    if (key) described.add(errId);
    else described.delete(errId);
    input.setAttribute("aria-describedby", [...described].join(" "));
    if (key && key !== "net") input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  };

  const busy = (on: boolean): void => {
    submit.disabled = on;
    if (on) submit.setAttribute("aria-busy", "true");
    else submit.removeAttribute("aria-busy");
    label.textContent = on ? strings.sending : strings.submit;
  };

  const send = async (retried = false): Promise<void> => {
    const fd = new FormData(form);
    const body = {
      locale: root.dataset.locale,
      path: "ghosts",
      contact: { value: input.value.trim() },
      started: token,
      page: root.dataset.page,
      site_web: String(fd.get("site_web") ?? ""),
    };
    let res: Response;
    try {
      res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
    } catch {
      showError("net");
      return;
    }
    if (res.status === 201) {
      try {
        sessionStorage.setItem(DONE_KEY, "1");
      } catch {
        /* storage blocked: the button may come back next page */
      }
      finish();
      return;
    }
    if (res.status === 409 && !retried) {
      const b = (await res.json().catch(() => ({}))) as { started?: string };
      if (b.started) {
        token = b.started;
        tokenAt = Date.now();
        await sleep(minMs);
        return send(true);
      }
    }
    showError(res.status === 400 ? "format" : "net");
  };

  form.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      const code = checkGhosts(input.value.trim());
      if (code) {
        showError(code === "required" ? "empty" : "format");
        input.focus();
        return;
      }
      showError(null);
      busy(true);
      void (async () => {
        if (!token || Date.now() - tokenAt > TOKEN_MAX_AGE_MS - 60_000) await fetchToken();
        /* never let a fast human hit the silent drop: wait out the minimum time */
        const wait = minMs - (Date.now() - tokenAt) + 150;
        if (wait > 0) await sleep(wait);
        await send();
        busy(false);
      })();
    },
    { signal },
  );
}
