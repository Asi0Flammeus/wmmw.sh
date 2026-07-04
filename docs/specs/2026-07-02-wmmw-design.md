# wmmw.sh — Design & Site Specification

Date: 2026-07-02
Status: validated design direction (mockup D "Hybride", user-approved with one amendment: the scroll filament becomes physarum-driven).
Reference mockups: `mockups/a-sous-bois.html`, `mockups/b-shell.html`, `mockups/c-reseau-vivant.html`, `mockups/d-hybride.html` (throwaway; D is the design of record).

## 1. Purpose & Identity

Personal branding site for William (asi0): showcase projects, tools, writings, and what nourishes him, carried by the **Mycelic Wealth** philosophy.

- **Name**: wmmw.sh = WilliaM Mycelic Wealth. Palindrome W·M·M·W ("ce qui sort du réseau y revient"). "Wealth" is owned publicly: the site's thesis IS the reclamation of the word.
- **Thesis**: "La richesse s'échange. Elle ne s'empile pas." Wealth is multidimensional (financière, relationnelle, intellectuelle, expérientielle, émotionnelle). Bringing resources to others without forced retribution wins long-run.
- **Audience**: peers (developers, builders), collaborators, curious minds. Build-in-the-open ethos.
- **Tone**: crafted, calm confidence, zero marketing slop.
- crqpt.com is replaced: writings migrate here; crqpt gets a 301 redirect (ops task, outside this repo).

## 2. Design Language (from mockup D)

### Tokens
- **Palette (dark, locked)**: humus `#12100d` (bg), panel surface `#1a1712`, bone `#e8e2d5` (text), muted `#9a9284` (secondary text), single accent: filament gold `#d9a24a` (desaturated; hover shift `#e6b45e`). Borders: bone at ~12% alpha. WCAG AA everywhere (verified pairs in mockup D).
- **Type**: Space Grotesk (display, self-hosted via fontsource), Instrument Sans (body), JetBrains Mono (terminal panels, meta, wordmark). No em/en dashes anywhere in visible copy, ever.
- **Radii**: one system: 10px panels/tiles, pill for chips/CTA.
- **Spacing/breakpoints**: 4px base scale, tokens.css mirroring alysis.cat structure (`tokens.css` / `global.css` / `reset.css`).

### Signature elements
1. **Physarum hero** (home only): full-viewport (100dvh) canvas, Jones-model slime mold sim, warm umber→gold colormap, agents seeded to form a visible network within ~5s. Implementation: port the validated CPU sim from mockup D (Float32Array trail ~320x180 upscaled, ~8-12k agents, single-pass blur+evaporation, zero allocations in loop, LUT render). Pauses on `document.hidden` and offscreen (IntersectionObserver). Reduced motion: 300 steps synchronously at load, draw once, freeze. A later upgrade MAY port the WebGL2 transform-feedback sim from crqpt (`crqpt/docs/physarum-sim3-handoff.md` seam) behind the same interface; not v1 scope.
2. **Terminal panels**: reusable component. Anatomy: elevated surface, 1px low-alpha border, slim header strip with mono path label (`asi0@wmmw:~/projets`), NO fake window buttons. Body in mono; first line = prompt + command; output shape varies per section (markdown cat / aligned ls / box-drawing tree / dotted leaders / cat -n). Command types on first viewport entry (IntersectionObserver, once); fully pre-rendered under reduced motion and no-JS.
3. **Scroll filament, physarum-driven** (user amendment; replaces mockup D's pure SVG stroke-draw):
   - A seeded organic **reference path** runs down the page margin (as in mockup D), with branch anchors reaching each terminal panel header.
   - The visible filament is **living**: a small dedicated physarum sim whose agents colonize the reference path. Mechanism: a narrow offscreen trail field (ribbon along the path, low resolution); the reference path pre-deposits a faint **guide trail** (attractant); agents spawn at the top and follow/reinforce it, wobbling organically around the trace.
   - **Scroll gating**: growth frontier mapped to scroll progress. Agents cannot advance past the arc-length corresponding to the current scroll tip (tip ~viewport middle, smoothed with a small lerp). Branch guide trails activate when the tip passes their anchor.
   - Budget: this sim is small (≤2k agents, ribbon field ≤64px wide equivalent); must never contend with the hero sim (hero pauses when scrolled away, filament sim pauses when tab hidden). No `scroll` event listener: rAF loop reading `scrollY` gated by visibility, or CSS scroll-timeline where supported for the gating value.
   - Fallbacks: `prefers-reduced-motion` → static fully-drawn SVG stroke (mockup D behavior, pre-rendered). No-JS → same static SVG.
4. **Palindrome nod**: wordmark `wmmw.sh` mirrors on hover (CSS only, reduced-motion gated). Footer: `echo "$WMMW"` line.

### Layout rules (binding, inherited from mockup phase)
- Dark theme locked; one accent; hero max 4 text elements; max 1 uppercase micro-label per 3 sections; no section numbering, no scroll cues, no decorative dots, no locale strips; layout family varies per section; explicit single-column collapse <768px; `100dvh` never `100vh`.

## 3. Site Architecture

### Stack
- **Astro 6**, `output: "static"`, node adapter standalone, `inlineStylesheets: "always"`, path aliases: mirror `alysis.cat/astro.config.mjs`.
- **bun** as package manager/runtime. TypeScript. Zod content schemas.
- No UI framework. Vanilla CSS design tokens. Sims and typing effects = small vanilla TS modules loaded as islands of behavior (plain `<script>` in Astro components), not framework islands.
- Fonts self-hosted via `@fontsource` packages (Space Grotesk, Instrument Sans, JetBrains Mono variable where available).

### i18n
- FR is the default locale at root (no prefix). `/en/` and `/es/` prefixed routes, built from day one via Astro i18n (`defaultLocale: "fr"`, `locales: ["fr","en","es"]`).
- UI chrome strings in a typed dictionary (`src/i18n/`). v1 ships FR chrome complete; EN/ES chrome translated at build of those routes (same dictionary file).
- Writings keep the crqpt collection model: `lang` + `translationOf` linking translations; per-post language switcher renders only existing translations; `hreflang` alternates emitted.

### Content collections (`src/content/`)
- `writings/` (MDX): schema ported from crqpt (`title, description, publishedAt, updatedAt?, tags[], image?, imageAlt?, draft, lang, translationOf?`). Migrate the 4 posts × existing langs (11 files + 2 covers) from `../crqpt/src/content/writings/`.
- `projects/` (data collection, JSON/YAML): name, blurb per lang, url?, status, order. Seed: recherche-ouverte, decouvre-bitcoin/plan-b, alysis.cat, unfocus-art.
- `tools/` (data): name, blurb per lang, repo url, status (`stable|beta`), order. Seed: lazyagent, dicton, don-popote, mindful-navigation, agentic-cloud.
- `nourritures/` (data): type (`livre|film|video`), title, author/creator, url?, note?. Seed: the 6 books from the mockups; films/videos empty (UI shows muted "bientôt" state until populated).

### Pages & routes
| Route | Content |
|---|---|
| `/` | One-pager: physarum hero, manifeste (terminal panel), condensed teasers of projets / outils / écrits (latest 3) / nourritures, footer. Scroll filament runs the full page. |
| `/manifeste` | Full manifesto page: the philosophy long-form (mycelium metaphor, 5 dimensions, spontaneous anarchy of association). Content authored as MDX so it can grow. |
| `/projets` | All projects, terminal-panel presentation, one panel per project with room for longer descriptions and links. |
| `/outils` | All tools/repos: tree overview panel + per-tool detail rows (repo link, status badge, install one-liner). |
| `/ecrits` | Writings index per locale (dotted-leader TOC style), drafts excluded. |
| `/ecrits/[slug]` | Post page: readable measure (65ch), mono metadata, prose styles for MDX, translation switcher, og image from cover. |
| `/nourritures` | Books populated; Films/Vidéos tabs muted until data exists. |
| `/404` | Themed 404: `asi0@wmmw:~$ cat <path>` → `cat: aucun fichier de ce type`. |
| `/rss.xml` | Écrits feed, FR default (per-locale feeds `/en/rss.xml`, `/es/rss.xml`). |

All pages except `/` skip the hero sim; they keep the scroll filament (shorter reference path) and terminal panels. Every page: BaseLayout with SEO component (title/description/canonical/og/twitter, JSON-LD Person on `/`), sitemap, `llms.txt` in `public/`.

### Contact & links
- Footer links: GitHub (`github.com/Asi0Flammeus`), RSS, contact. v1 contact = GitHub profile; a `mailto:` slot is wired behind a single constant and activates once the wmmw.sh mailbox exists.

## 4. Performance & Accessibility Budget

- LCP < 2.5s: hero headline is the LCP element (text over canvas); sims boot after `requestIdleCallback`/first paint; fonts `font-display: swap`, subset latin+latin-ext.
- Sims: hero ≤ 33ms/frame budget on integrated graphics (validated ~3ms/step in mockup); filament sim ≤ 2ms/frame; both pause when hidden/offscreen. CLS 0 (canvas absolutely positioned, space reserved).
- Keyboard: nav and panels fully reachable; tabs (nourritures) with proper ARIA tablist; focus-visible styles in accent gold.
- `prefers-reduced-motion`: every animation has a designed static state (spec'd per element above).
- Zero client JS on `/ecrits/[slug]` besides the filament module (post pages must stay featherweight).

## 5. Deployment & Ops

- Mirror alysis.cat pattern: Dockerfile + docker-compose + `deploy.sh` to the crqpt server; domain `wmmw.sh`.
- crqpt.com 301 → wmmw.sh (path-mapped for `/writings/*` → `/ecrits/*` where slugs survive; ops task outside this repo, tracked in the plan).
- CI: GitHub workflow, `bun install && bun run check && bun run build` on PR.

## 6. Non-goals (v1)

- No newsletter, no comments, no analytics.
- No WebGL2 sim port (CPU sim is the v1; seam kept compatible).
- No CMS: content lives in the repo.
- Films/Vidéos data entry (UI ready, data later).

## 7. Open items resolved

- Naming: "Mycelic Wealth" owned (decided 2026-07-02).
- Language: FR-first, trilingual routing from day one.
- Design: mockup D + physarum-driven scroll filament (this spec).
- Mockups A/B/C: kept in `mockups/` as exploration record; deleted when v1 ships.

## 8. Addendum: v1 QA round (2026-07-02, user-decided)

Supersedes the matching points above:

- **One organism, not two sims (user-decided).** Hero sim and scroll filament are merged into a single physarum organism: `src/lib/mycelium.ts` + `src/components/Mycelium.astro` (replaces `physarum-hero.ts` / `filament.ts` / `Filament.astro`). ONE document-level canvas (absolute, full page height, `transition:persist="mycelium"`), one warm umber-to-gold LUT. Active-domain simulation only: (a) hero bloom grid, LEFT-weighted (soft interior guide band ~11% width that meanders; spill 0.6 on home, 0.34 on band pages), edges feathered so no rect boundary ever shows; (b) below the hero, a narrow left ribbon with pre-deposited predilection paths: trunk + branches that "pour" into each `[data-block]` panel header (tangential-down then sweep, no perpendicular T), revealed progressively by the scroll frontier (viewport-middle arc-length, smoothed; no scroll listeners). The trunk seams out of the bloom through the hero fondu: the organism is the prolongation of the hero.
- **Hero on every page, persistent across navigation.** `<ClientRouter />` everywhere; the mycelium canvas persists across swaps (the bloom never restarts; below-hero channels re-grow per page after re-measuring anchors on `astro:page-load`). Home = `full` variant (100dvh, thesis copy); other pages = `band` variant (clamp(230px, 38dvh, 420px)) whose h1 is the page title (BaseLayout `heroVariant` / `heroTitle`). Hero.astro owns copy + veil only (no canvas); veil gives the bottom fondu but feathers open over the left column so the trunk crosses unwalled. Replaces "all pages except / skip the hero sim" (§3) and the zero-client-JS post budget (§4).
- **ClientRouter class carry-over**: `astro:before-swap` copies the runtime `js/anim/armed` html classes onto the incoming document (the router would otherwise wipe them and silently degrade all animation gates).
- **Terminal typing is organism-driven** (2026-07-04, supersedes the pure-IO rule): panels that receive a filament branch are marked `data-myc-claim` by `mycelium.ts`; typing starts when the branch tip reaches the header (`myc:reach` CustomEvent on the panel), so a terminal visibly wakes BECAUSE the mycelium touched it. Viewport entry (IO rootMargin -28%) only arms a ~3.8s safety deadline for claimed panels (sim stalled / tip never crossing the anchor) and remains the direct trigger for unclaimed panels. Growth tip sits at ~62% vh so the arrival slightly precedes the old reveal line on slow scroll. Re-armed per page load.
- **Header**: single overlay style on every page, soft top scrim, `aria-current` nav state; not persisted (lang switcher is path-dependent).
- Reduced motion: frozen ~300-step bloom render + fully-drawn static SVG trunk/branches, zero rAF. No-JS: nothing mounts (decorative layer).
