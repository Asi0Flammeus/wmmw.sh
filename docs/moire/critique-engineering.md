# Engineering critique of 02-design-direction.md

Lens: feasibility and contracts, checked against the code on `feat/william-moire` (Astro 6.4.8, @astrojs/node 10.1.4, node_modules inspected). Ordered by severity. Each item: spec section, problem, why it matters, fix to apply.

## P0: breaks the build, the runtime, or the parallel plan

**E1. §7.2, §7.7: `return Astro.rewrite("/404")` crashes at runtime.**
Problem: Astro 6 throws `ForbiddenRewrite` when an on-demand route rewrites to a prerendered one (`astro/dist/core/rewrites/handler.js`: `serverLike && !state.routeData.prerender && routeData.prerender`). `buildOutput` is already `"server"` here (`/api/reports` is on-demand), so `serverLike` is true. `/de/contact`, `/fr/projets` and `/api/contact` (which matches `[lang]/contact`) would all return a 500.
Why: every bad-locale URL on the two on-demand pages becomes a 500 instead of the 404.
Fix: `return new Response(null, { status: 404 });`. Astro's routing handler (`core/routing/handler.js` L154) sends a null-body 404 to the error page, and the node adapter serves `404.html` from disk. Add to T13: GET `/xx/contact` and `/xx/projets` must return 404 with the 404 page's h1.

**E2. §11 T3 and the §10 package gates: copy-lint can never go green, and it serialises the packages.**
Problem: (a) T3 scans "all files" in `src/` and `public/`. I checked: 14 binary assets contain the byte sequences E2 80 93/94 and E2 94..95 xx. Examples are `src/content/writings/talking-to-silicon-cover.png`, `invitation_door.png`, `public/images/escher_loop.png` and `crqpt_enzo.png`. Read as UTF-8, those bytes come out as U+2013, U+2014 and box-drawing characters. Nobody can fix them: some of these files belong to no package and the others are images. (b) Every package gate needs a full-tree copy-lint pass. Today 13 WP4 files contain dashes (`src/components/blog/{PeriodicTable,Poll,Timeline,ZenCountdown}.astro` plus 9 writings), so WP2, WP3 and WP5 cannot close until WP4 is done.
Fix: scan text extensions only (`.astro .ts .mjs .js .css .md .mdx .json .html .svg .txt .xml .yml`). Add `copy-lint.mjs --owned <globs>` for package gates. Run the full-tree scan in WP1b and CI only. Alternatively, do the mechanical dash pass in WP1a while it runs alone.

**E3. §6.1 shadowing and §9.2 deletions make WP4 break WP2's build (an ordering dependency).**
Problem: the current `HomePage.astro` (WP2, rewritten later) calls `getCollection("projects")` and reads `tools` blurbs. It also reads legacy keys: `chrome.ecrits.all`, `chrome.outils.all`, `chrome.manifeste.heading/headingGold/readMore`, `chrome.projets.*` and `chrome.meta.home`. As soon as WP4 adds `ns/{projets,outils,ecrits,manifeste}.ts` or deletes the `projects` collection, `astro check` fails on HomePage in every tree. A namespace that shadows a key replaces the whole legacy object. WP4 cannot close green before WP2 lands.
Fix: (a) Before ownership transfers, WP1a replaces `HomePage.astro` with a stub that uses only `ui.ts` keys, `writings.ts`, `StepsLine` and `GhostsNotify`. This also gives WP3 a home page for T12. (b) While `LEGACY_KEYS` is non-empty, `t()` deep-merges a namespace over its legacy object, typed `UIDict[K] & Namespaces[K]`. (c) Freeze the exports of `src/lib/writings.ts` (`publishedWritings`, `baseSlug`, `translationsOf`, `Writing`), because WP2 consumes them.

**E4. §6.2, §9.2: removing Hero.astro strips the only h1 from every page, permanently on the parked pages.**
Problem: every page gets its h1 from `Hero.astro` (`<h1 class="band-h">{heroTitle ?? title}</h1>`). There are zero `<h1>` in `src/components/pages/*` and `src/pages/*`. After WP1a, the never-edited `NourrituresPage` and `LecturesSfPage` have no h1 and no visible title.
Why: T15 ("every page: one h1") can never pass, and the parked pages ship headless.
Fix: add `LEGACY_HEAD_PATHS = ["/nourritures", "/lectures-sf"]` to `site.ts`. BaseLayout renders `<PageHead title={heroTitle ?? title} />` before the slot when `path` is in that list. T15 lists its routes explicitly.

**E5. §10, §11: WP1a owns every QA script, but the contracts those scripts need are not defined.**
Problem: WP1a writes all of `scripts/qa/*` before the features exist, packages may not edit them, and WP1 sits idle during the parallel phase. Undefined contracts: the return shape of `__moire.w1.state()`; how T8 finds the V1/V2 figures; the intake selectors for "fill and submit"; the fit line (only `intake`, `intake-done` and `intake-ref` have a `data-qa`, and there is no `data-fit`); the GhostsNotify selectors. Some gates also cross packages: WP3's T12 needs WP2's home row and WP4's on-demand `/projets`, and WP2's T5 and T8 depend on WP3's GhostsNotify DOM.
Fix:
- Move `intake.py` to WP3 and `fold.py`, `words.py`, `motion.py` to WP2.
- WP1a ships `scripts/qa/lib.py` (server boot, browser via QA_CHROMIUM, route list) plus contrast, copy-lint, theme, contracts, annotation, head and shots.
- Add a `data-qa` table to §11: `now-heading`, `now-row`, `intake`, `intake-step-{1..4}`, `intake-path-{tool,open,other}`, `intake-continue`, `intake-send`, `intake-done`, `intake-ref`, `intake-fit` (with `data-fit`), `ghosts-open`, `ghosts-input`, `ghosts-submit`, `ghosts-done`, `visual-v1`, `visual-v2`.
- Define `state(): { live: boolean; settled: boolean; frames: number }`.
- Move T12 and the notify/lens P3 clearance check to WP1b.
- Before transfer, WP1a sets `prerender = false` and the E1 404 guard in `src/pages/projets.astro` and `[lang]/projets.astro`.

**E6. §8.2, §11: how env vars are read and the QA environment make T9 to T12 fail or impossible to automate.**
Problem: (a) Astro 6 writes private `import.meta.env.X` values into the bundle at build time (`astro/dist/env/vite-plugin-import-meta-env.js`). Keys that are absent in the Docker build stage are undefined at runtime. Read through `import.meta.env`, `INTAKE_TOKEN` is never set, so the read API always answers 401. The QA value `INTAKE_MIN_BRIEF_MS=300` is also ignored: Playwright's no-JS submit takes under 8 s, gets a fake 201, and T10 fails. (b) Allowing localhost when `NODE_ENV !== "production"` is fragile: the QA command does not set NODE_ENV, and Vite may define it. (c) The QA command has no `INTAKE_SECRET`, so T11 cannot mint a stale token. The format `base64url(ts.kind.locale.hmac)` leaves the ts unit, the HMAC input and the signature encoding undefined. (d) Pipeline step 1 rejects requests with no Origin and no token before the honeypot runs, so "honeypot -> 201" and "no token -> 400" cannot happen from a Python client as written. (e) The client hard-codes the 8 s minimum while the server reads it from env.
Fix:
- §8.2: every `INTAKE_*` value is read through `process.env` at call time, as `reports.ts` does.
- Drop the NODE_ENV rule. The QA command sets `INTAKE_ALLOWED_ORIGINS=http://127.0.0.1:4321 INTAKE_SECRET=qa-secret`.
- Token: `payload = "${ts_ms}.${kind}.${locale}"`, `sig = base64url(HMAC-SHA256(secret, payload))`, `started = base64url(payload + "." + sig)`.
- T11 sends `Origin: http://127.0.0.1:4321` on every request.
- The intake page and GhostsNotify embed `data-min-ms` from env, and the client waits based on it.

## P1: correctness, security, a11y

**E7. §8.1, §8.3, §8.6: server intake modules get loaded on prerendered pages.**
Problem: GhostsNotify handles POSTs itself, so it imports `processIntake`, which pulls in `store.ts` (a retention sweep "at module load" plus `setInterval`), `ratelimit.ts` and `token.ts`. GhostsNotify renders on home and `/lego`, both prerendered. Those modules therefore run during `astro build` in the Docker build stage and end up in the prerender chunk.
Fix: inside `if (Astro.request.method === "POST")`, call `await import("@lib/intake/process")`. No `src/lib/intake/*` module may have top-level side effects; start the sweep lazily on the first read or write.

**E8. §8.2 vs §8.3 step 5: "a restart costs one silent 409 retry" is false.**
Problem: after a restart the old HMAC no longer verifies, and step 5 treats that as "forged -> 400". Anyone who has the form open during a deploy gets an error (JS) or an `intake.net.invalid` re-render (no-JS). On the preview this happens on every redeploy, because `INTAKE_SECRET=${INTAKE_SECRET:-}` defaults to empty.
Fix: a well-formed token with a bad signature, or one older than 2 h, returns `409 {"error":"stale","started":<fresh>}`. Only a malformed token returns 400. The preview compose uses `${INTAKE_SECRET:?}`, and the same goes into the §9.3 merge checklist for prod.

**E9. §8.6: the Ghosts JS send silently drops fast humans.**
Problem: the "wait out the remaining minimum time" rule is written for the brief only. Someone who pastes an email within 3 s of opening the disclosure gets a fake 201: « C'est noté » shows and nothing is stored.
Fix: `ghosts.client.ts` follows the same rule: it shows the busy state and waits out the remaining time from `data-min-ms`. It fetches a new token at submit if the current one is older than 2 h.

**E10. A11, §8.3: `checkOrigin: false` reopens a contract, and the IP key can be spoofed.**
Problem: (a) The switch is global, so it also removes Astro's cross-site form-POST block from the untouched `/api/prototype-feedback`, which §9.1 says must behave identically. A cross-site `<form enctype="text/plain">` can then post valid JSON into the review buffer on the preview. (b) If nginx appends with `$proxy_add_x_forwarded_for`, the first entry of `x-forwarded-for` is whatever the client sent. Rotating that header bypasses the per-IP limits.
Fix: add `src/middleware.ts`. The file does not exist today and no package owns it; assign it to WP1a. It returns early when `context.isPrerendered` or the method is GET/HEAD/OPTIONS. For form-like content types it requires the Origin (or Referer) to be in `INTAKE_ALLOWED_ORIGINS`. IP: use `x-real-ip`, else the last XFF entry, else `clientAddress`. Add "nginx sets `X-Real-IP $remote_addr`" to §9.3, and have T11 use `X-Real-IP`.

**E11. §5.1 vs §2.1: the W1 layout CSS the prototype depends on is missing from the spec (`w1-hero.html` L22-27, L72-76).**
1. The section needs `overflow: clip`. Without it, the 1900 px `.w1-src::before` square scrolls horizontally at 390 and 320 px. §2.1 bans `overflow: hidden` on anything holding Basteleur and §5.1 never asks for a clip. The obvious workaround, `body { overflow-x: hidden }`, breaks the sticky dock.
2. The section needs `isolation: isolate`, so the z-index -1 pseudo stacks under the h1 halo and not under `main`.
3. The `.w1-fade` bottom gradient (38%, transparent to `--bg`) is missing. A sits within 600 px of the hero bottom, where vignette alpha is still 1, so the field ends on a hard horizontal seam.
4. Every `[data-w1-mask]` needs `width: fit-content`. Otherwise the halo spans the full width and hides the static frame for no-JS, reduced-motion and pre-tap mobile visitors.
5. Scope the halo as `[data-w1]:not([data-live]) [data-w1-mask]`. The prototype selector `:root:has(.w1) .head [data-w1-mask]` paints the dock pills `var(--bg)`, which kills the glass whenever W1 is static.
6. Pill rects are computed in `layout()` only, but the pills are sticky, so the rects go stale after a scroll. Collecting them also needs a document-wide query, which §6.6 forbids.

Fix: write rules 1 to 5 into §5.1. Amend §2.1 to read: "clip allowed on a container whose padding keeps Basteleur lines ≥ 0.4em from its edges, never on the text element". Drop the pills from the live mask (the 82% glass already covers them). Add a test: `scrollWidth <= innerWidth` at 320 and 390 px on every route, with JS on and off.

**E12. §1.4, §4.2: the theme crossfade versus Astro's header rules.**
Problem: `transition:animate="none"` makes Astro emit an ungated `@layer astro { ::view-transition-old(<name>) { animation: none; opacity: 0 } ::view-transition-new(<name>) { animation: none } ::view-transition-group(<name>) { animation: none } }` (`astro/dist/runtime/server/transition.js` L53-57). Those rules also apply to the toggle's `startViewTransition`, so the dock snaps to the new theme while the page fades for 200 ms.
Fix: add `html.theme-xfade [data-qa="header"] { view-transition-name: none !important; }` to global.css. `theme.ts` adds `theme-xfade` before calling `startViewTransition` and removes it on `finished`.

**E13. §8.4 step 4, §4.1 M6: a confirmation rendered client-side cannot contain Astro components.**
Problem: step 4 is described as "an empty template" filled from JSON, yet it must contain `<StepsLine done={1}>` (build-time path data, no client JS), `Button` and per-path writing links. None of these can be built in the browser. The summary and fit-line composition would also be written twice (client and server), and the two copies will drift.
Fix: the server renders step 4 in full inside `<section data-step="4" hidden>`: StepsLine done=1, all three suggested reads with `hidden`, and the button. JS fills `[data-slot=name|summary|fit|ref]` through `textContent` and removes `hidden`, which replays the M6 CSS animation. The composition goes in `src/lib/intake/summary.ts`, a pure module like `rules.ts` shared by client and server.

**E14. §5.2, §4, T7: settle times break the 600 ms ceiling and T7.**
Problem: W2 eases at 0.2 per frame after release and settles at < 0.02 px. That takes ln(0.02/d)/ln(0.8) frames: End from rest in a 400 px column (d ≈ 208) is 41.5 frames ≈ 692 ms, and PageUp is ≈ 568 ms. T7 waits 1000 ms and then demands zero rAF in the last 600 ms, so everything must settle within 400 ms. W1's own spec allows 577 ms. Under reduced motion, the prototype's ResizeObserver still schedules a rAF on its first callback.
Fix: W2 release ease 0.3 per frame, settle at 0.1 px then snap (≈ 21 frames ≈ 360 ms for 208 px; count the speed-decay frames in the budget). T7 waits 1200 ms after the last action and checks the trailing 600 ms. With reduced motion, `w1.ts` and `w2.ts` create no observers that call rAF. Block Umami with `page.route`, then assert zero rAF calls in total.

**E15. §5 vs §5.2: "all moiré is aria-hidden" contradicts the W2 slider.**
Problem: if the W2 root gets `aria-hidden` under the blanket rule, the focusable `role="slider"` sits inside a hidden subtree (axe flags this as aria-hidden-focus).
Fix: write the exception into §5. Only `.gl-base`, `.gl-fade` and `.gl-ghosts` are aria-hidden. The slider role and tabindex are added by JS only, as in the prototype's `mountW2`, together with `aria-valuetext`.

**E16. §8.5 and ClientRouter: gaps in the no-JS form.**
1. "Continuer", "Retour" and "Changer" render in the long form, where they do nothing.
2. `fields.when` exists in both the tool and open groups (deck §9.8). Reused ids mean a label in the open group toggles the tool group's hidden input.
3. If JS is loaded but the enhancement has not attached, ClientRouter intercepts the submit (`ClientRouter.astro` L105-140) and POSTs multipart through fetch. An Enter-submit on steps 1-2 also reaches the router unless the handler calls `preventDefault` synchronously.
4. CopyLine buttons do nothing without JS.

Fix: mark JS-only controls `data-js-only` and add `html:not(.js) [data-js-only] { display: none }`. Namespace ids as `${group}-${name}-${value}`. Put `data-astro-reload` on both forms. The form's submit listener calls `e.preventDefault()` first, then maps Enter to "Continuer". `parseForm` accepts both urlencoded and multipart.

**E17. §6.3, §8.4: forced-colors gaps.**
Problem: the checked radio chip is shown only by background and text colour, which forced colours override, so checked and unchecked look the same. The error rule is a `box-shadow`, which forced colours drop. The V1 dot and node use ruby fills.
Fix: in `@media (forced-colors: active)`: `.chip-radio input:checked + span { forced-color-adjust: none; background: Highlight; color: HighlightText; border-color: Highlight }` and `[aria-invalid="true"] { border-left: 3px solid CanvasText }`. Check glyphs are inline SVG with `currentColor`. T16 adds `forced_colors="active"` screenshots.

## P2: contract gaps, test gaps

**E18. §9.1 vs §9.4/§10: who edits the registry is contradictory.** §9.1 has each package update `registry.json`; §9.4 and §10 give it to WP1 only. §9.4 also uses brace and glob shorthand, which is not a valid `files[].path`.
Fix: only WP1b edits it, packages report path changes, and every file is listed explicitly.

**E19. §7.2, §8.6: `/projets` couples WP3 and WP4.**
Problem: deck §9.9 mints the ghosts token "at render" on `/projets`, which needs `Cache-Control: no-store` in WP4's route, and nobody asks WP4 for it. Token-less no-JS ghosts posts share the 50-per-day cap, so one bot can lock real signups out for the day.
Fix: GhostsNotify never embeds a token; it fetches one on first focus. §7.2 states that "ProjetsPage never reads the request body". Token-less posts get a separate cap of 10 per day and 1 per 10 min per key.

**E20. §5.6: none of the perf budgets has a test.**
Fix: add `scripts/qa/perf.py` using Playwright CDP:
- Throttle with `Network.emulateNetworkConditions` (Fast 4G) and `Emulation.setCPUThrottlingRate 4`.
- Measure LCP, CLS and long tasks (TBT = Σ max(0, d - 50)) with PerformanceObserver.
- Sum compressed transfer sizes per type, excluding the ClientRouter chunk and Umami, and check per-chunk budgets for `w1` and `w2`.
- Add two checks: no element with a computed `font-family` starting with Basteleur below 20 px, and the `scrollWidth` check from E11.

**E21. T5: the word count fails on a correct page.**
Problem: the "closed `<details>`" exclusion only covers no-JS. With JS, the collapsed region (grid 0fr) keeps its ~30 words, which gives 136 + 30 > 140. "No sentence over 10 words" has no segmentation rule, so row names, V1 labels and chips join into one long sentence.
Fix: the collapsed region uses `hidden` and `words.py` drops `[hidden]`. Run the count with JS on and off. Segment on block boundaries (`innerText` split on `\n`), then on `[.!?…]`.

**E22. T2 cannot be enforced as written.**
Problem: grep cannot tell `--ink-3` on `--surface-2`, because the background comes from ancestors. A `contrast.mjs` that "encodes this table" with hard-coded values is tautological.
Fix: parse `src/styles/tokens.css` per theme, vendoring the OKLCH converter from `~/.cache/moire-qa/contrast.mjs` (CI cannot reach that path). Replace the grep with a Playwright walker that compares each text node's colour against its first opaque ancestor background.

**E23. Smaller test-spec gaps.**
- T6 reads the computed background of `html`, but the spec never puts the page background on `html`; add `html { background: var(--bg) }`.
- The W2 margin below 768 px (1rem) equals T8's 16 px margin exactly, so sub-pixel rounding makes the test flaky; use 1.25rem.
- T14 rebuilds the `dist/` the QA server is serving; use `astro build --outDir /tmp/wm-annot` and run it last.

**E24. §7.1 vs §5.4:** the 4-column row grid starts at ≥1024 px, but the Q2 strip is gated on hover plus fine pointer. Touch devices at ≥1024 px get an empty 96 to 168 px column.
Fix: put the 4-column template inside the q2 query.

**E25. Shared APIs that are undefined.**
- Props for `MoireField` and `GhostsLens` (WP1b renders GhostsLens on `/lego`). Proposal: `GhostsLens { locale; label?; class? }` and `MoireField { class? }` with the hero content in the default slot.
- The short-viewport `--header-h: 3.75rem` must live on `:root` in global.css, because the hero margin reads it.
- Who imports `prose.css`.
- Which file holds `parseForm`.
- Where the idempotency map (token -> {id, ref, fit}) lives.
- "`splitLink` throws at build" is false on on-demand pages, where it becomes a runtime 500.
- Client code may import `define.ts`, but never `index.ts` (its glob would bundle every namespace).

Fix: answer each of these in §6 and §8. Add to T13 a GET of every on-demand route × 3 locales × each `?chemin=` value, expecting 200.

**E26. §7.9, §7.10:** 404 and `/lab` are FR only but inherit `alternatesFor` = all locales, so they emit hreflang and switch links to `/en/404` and `/es/lab`.
Fix: pass `alternatesFor={["fr"]}`.

**E27. Deps:** `lab-assets.mjs` imports `sharp`, which is only a transitive optional dependency.
Fix: WP1a adds `sharp@0.34.5` to devDependencies.

**E28. Spec vs deck:** deck §9.8 sends no-JS posts urlencoded to `/api/intake`, while §8.3 answers 415. Under the spec's own precedence rule, the deck wins.
Fix: state the override explicitly in §8 and A11.

**E29. a11y details.**
- The section link on `/ecrits/<slug>` should get `aria-current="true"`, not `"page"`.
- Step 1 has both a legend and an h2; use `<legend><h2 tabindex="-1">`.
- Moving focus while also announcing progress makes screen readers say both; announce progress only when focus does not move.

**E30. Minor rendering.**
- The `MonogramDefs` svg must use `width=0 height=0 position:absolute`, not `display:none`, which breaks pattern references.
- At DPR 1.25, W1 rounds the line pitch to 6.4 px while the CSS frame uses 6 px. The first live frame then differs from the static frame and shimmers during the 320 ms crossfade. Fix: use the same pitch in both, or add resolution media queries.
