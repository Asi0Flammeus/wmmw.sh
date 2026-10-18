import { defineMiddleware } from "astro:middleware";

/**
 * Cross-site form POST guard. Replaces Astro's `security.checkOrigin`
 * (disabled in astro.config.mjs): that check compares Origin with the request
 * URL, which reads http:// behind the TLS proxy, so it rejected every no-JS
 * form post. Same scope as Astro's check: on-demand routes, unsafe methods,
 * form-like or missing content types. JSON bodies pass through (a cross-site
 * form cannot send them; the intake API runs its own origin check).
 *
 * Trusted: the request's own origin, plus INTAKE_ALLOWED_ORIGINS (comma
 * list, read at call time; default the production and preview hosts).
 * Origin is read first, then Referer; a request with neither is refused.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const FORM_TYPES = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"];
const DEFAULT_ORIGINS = "https://wmmw.sh,https://moire.wmmw.sh";

function allowedOrigins(): Set<string> {
  const raw = process.env.INTAKE_ALLOWED_ORIGINS || DEFAULT_ORIGINS;
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  );
}

function senderOrigin(headers: Headers): string | null {
  const origin = headers.get("origin");
  if (origin && origin !== "null") return origin;
  const referer = headers.get("referer");
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export const onRequest = defineMiddleware((context, next) => {
  const { request, url, isPrerendered } = context;
  if (isPrerendered || SAFE_METHODS.has(request.method)) return next();

  const type = (request.headers.get("content-type") ?? "").toLowerCase();
  const formLike = type === "" || FORM_TYPES.some((t) => type.includes(t));
  if (!formLike) return next();

  const from = senderOrigin(request.headers);
  if (from && (from === url.origin || allowedOrigins().has(from))) return next();

  return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
    status: 403,
  });
});
