# William Moiré: design direction and build specification (wmmw.sh)

Date 2026-10-17 · Branch `feat/william-moire` · Author: art direction and tech lead · Status: **binding for implementation** · Revision 2 (after the brief and engineering critiques and the finished moiré lab README; rejected critiques are listed with reasons in Appendix B)

This document turns the locked decisions into a build plan that 4 to 6 engineers can execute in parallel without guessing. When this spec and an exploration file disagree, this spec wins; when this spec and the dossier (`01-brand-analysis.md`) or the copy deck (`explore/copy/copy-deck.md`) disagree on a fact, the dossier and the copy deck win and the disagreement is a bug in this spec.

Inputs (all read in full): `01-brand-analysis.md` (incl. §13 owner answers), `explore/copy/copy-deck.md` (rev. 2), `explore/type/system.html` (pairing a3), `explore/palettes/optics/palettes.json` + `contrast.txt` (OPTICS5), `explore/judges/results.json`, `explore/copy/home-sketch.html`, `explore/moire/*.html` + `explore/moire/tokens.css` + `explore/moire/README.md` (final lab pass), `critique-brief.md`, `critique-engineering.md`, and the current codebase (`src/**`, `astro.config.mjs`, `registry.json`, `package.json`, `Dockerfile`, `docker-compose*.yml`, `PRODUCT.md`, `node_modules/astro` 6.4.8 where a behaviour is load-bearing).

Companion file: **`docs/moire/final-tokens.css`** is the exact token file to ship as `src/styles/tokens.css`.

The moiré values in §5 are reconciled with the lab README of the final prototype pass. Where §5 still differs from the prototypes, the difference is deliberate and listed in Appendix A; there is no other precedence rule between §5 and `explore/moire/`.

Writing rule for everything this spec asks engineers to produce: no U+2013 or U+2014 anywhere in `src/` or `public/` (comments included), no prompt glyphs, French narrow no-break spaces (U+202F) written as ` ` in TS sources, typographic apostrophe U+2019 in visible copy.

---

## 0. Decisions at a glance

| # | Decision | Where |
|---|---|---|
| A1 | OPTICS5 hues and chromas verbatim; light `--fringe-a` clamped to .08 (dossier §9); comfort tune from the three judges: dark night L .195 to .205 (surface .242, surface-2 .272), ink-3 L .49 light / .66 dark. Every text pair now passes on every surface in both themes: no forbidden pair left | §1 |
| A2 | `html[data-theme]` always set before first paint (stored choice, else system); no-JS falls back to `prefers-color-scheme`; themed islands allowed via `[data-theme]` on any element | §1.4 |
| A3 | Ruby means "act here" (primary loupe, links, focus) plus one control: the dark-mode moon of the theme toggle. Selected inputs are inverted ink, success is jade, errors are ink + glyph + sentence | §1.2 |
| A4 | The Lycurgus cup is acted out where people see it: theme toggle jade hatch by day, ruby moon by night; text selection jade by day (front light), ruby by night (back light) | §1.2, §5.3 |
| A5 | Header is a two-pill glass dock, sticky from 768 px; static two-row header below 768 px; the footer repeats the four nav links so no page ends in a dead end on phones | §6.2 |
| A6 | One primary (loupe) action per page at most: `/contact` step 3 send, `/projets` tool action. Home has none; its four chips are secondary doors and carry an arrow | §6.3, §7 |
| A7 | No reveal-on-scroll, no scroll-linked or scroll-triggered motion, no autoplay. Six visitor-triggered micro-interactions, all settled within 600 ms. Touch gets its own triggers where a tap is natural (W1 on `pointerdown`, M1 on a logo tap, W2 tap-to-place) | §4 |
| A8 | W1 lerp 0.18 per 60 Hz frame (lab 0.16, dossier 0.08) so a 720 px jump settles in about 577 ms (P5) | §5.1 |
| A9 | Q2 strip invisible at rest, fades in with its 560 ms turn on hover; wordmark stagger 20/60/100 ms (settles at 600 ms) | §4, §5.4 |
| A10 | i18n: `ui.ts` (chrome, WP1) plus one namespace file per package in `src/i18n/ns/`, auto-merged by `t()`; while legacy keys exist a namespace deep-merges over its legacy object, so no package can break another's build | §6.1 |
| A11 | No-JS intake posts to the page itself (`/contact` renders on demand), never to `/api/intake` (explicit override of deck §9.8). JS intake posts JSON to `/api/intake`. Ghosts no-JS posts to `/projets#ghosts`. Astro `security.checkOrigin` off, replaced by `src/middleware.ts` (all form-like POSTs) plus the intake origin check | §8 |
| A12 | `/lab` serves committed WebP copies in `public/lab/` (Docker context excludes `docs/`) | §7.10 |
| A13 | OG images are committed PNGs per locale; favicon and footer signature use the solid monogram; the line monogram ships only at 192 px and up (OG, `/lab`) | §5.5 |
| A14 | WP1a runs first and alone (foundation, stubs, shared QA library), WP2 to WP5 run in parallel with their own QA scripts and owned-files lint, then WP1b integrates (registry, `/lego`, cross-package tests) | §10 |
| A15 | Home is lighter: V1 (steps line) leaves home and lives on `/contact` and the confirmation; the Mycelic line becomes an unruled coda. FR home: 132 words | §7.1 |
| A16 | W1 rises from the é into open space: field faded to 0 above the name (nothing in the dock band, no dock masks), rest centre placed at runtime in the largest free area | §5.1 |
| A17 | `/contact` proves before it asks: left column carries the steps, « Ce que tu emportes » and two proofs beside the sticky intake | §7.7 |
| A18 | The paid-path brief plays as short turns inside step 2 (JS only), recapped with the deck's own summary sentences | §8.4 |
| A19 | RSS follow block sits under the list; the feeds render as a designed page through `rss.xsl` | §7.4 |
| A20 | Resolved 2026-10-18: the private section of `docs/moire/research/worldview.md` and the matching lines in the dossier and research notes were scrubbed, and the local exploration commit was rewritten before any push. Never commit private matters: the repo is public | §9.3 |

---

## 1. Tokens

### 1.1 File layout and naming

| File | Owner | Content |
|---|---|---|
| `src/styles/tokens.css` | WP1 | Verbatim copy of `docs/moire/final-tokens.css` |
| `src/styles/fonts.css` | WP1 | `@font-face` only (§2.2) |
| `src/styles/reset.css` | WP1 | Minimal reset (keep current one, drop `color-scheme: dark`, keep the reduced-motion block) |
| `src/styles/global.css` | WP1 | Imports reset, fonts, tokens, prose (in that order; BaseLayout imports only `global.css`); base elements incl. `html { background: var(--bg) }`; primitives (§6.3); legacy primitives for parked pages |
| `src/styles/prose.css` | WP1 | Long-form reading styles shared by posts, manifesto, legal (§2.5); scoped under `.prose`, so importing it sitewide is safe |
| `src/styles/crqpt-compat.css` | WP4 | Blog component adapter, made theme aware (§9) |

Token groups (names are final, use nothing else in new code):

- **Colour (per theme):** `--bg --surface --surface-2 --ink --ink-2 --ink-3 --accent --accent-hover --accent-text --accent-wash --on-accent --line --line-strong --focus --success --error --selection-bg --selection-ink --input-bg --input-border --input-placeholder --code-bg --code-ink --fringe --fringe-a`
- **Glass and depth (per theme):** `--dock-bg --dock-edge --dock-highlight --dock-shadow --loupe-sheen --loupe-rim --loupe-shadow --loupe-shadow-hover --shadow-1`; theme independent `--dock-blur --dock-sat`
- **Type, space, layout, radii, motion, layers:** see `final-tokens.css` (`--fs-* --lh-* --ls-* --measure* --s-* --section-gap --block-gap --pad --maxw --header-h --tap --r-* --t-* --ease-* --z-*`)
- **Legacy aliases** (`--bone --surf --hair --accent-soft --body --r-tile --t-base ...`): exist only so registry blog components, TerminalPanel and parked pages keep rendering. New code never uses them.

### 1.2 Roles and rules

| Token | Light | Dark | Role and rule |
|---|---|---|---|
| `--bg` | `oklch(0.957 0.007 172)` #ecf2f0 | `oklch(0.205 0.012 175)` #121917 | Page. Text sits on it, never on a scrim. Dark lifted from .195 (judges: less halation in long reading) |
| `--surface` | `oklch(0.930 0.010 172)` #e2eae7 | `oklch(0.242 0.014 175)` #19221f | Chip hover, checked path card, tooltips' outer ring |
| `--surface-2` | `oklch(0.912 0.012 172)` #dae5e1 | `oklch(0.272 0.015 175)` #1f2926 | Inline code, kbd, tooltip body. Every ink, ink-3 included, passes on it |
| `--ink` | `oklch(0.278 0.022 180)` #1c2c29 | `oklch(0.887 0.008 170)` #d5dbd9 | Headings, body, typed text, selected chip fill, error rule |
| `--ink-2` | #414f4b | #a4aeab | Secondary text, nav, hints, row lines |
| `--ink-3` | `oklch(0.490 0.015 180)` #586361 | `oklch(0.660 0.015 175)` #899592 | Meta only (dates, tags, micro-labels, placeholders); ≥4.81:1 on every surface in both themes |
| `--accent` | `oklch(0.515 0.16 5)` #ad335b | `oklch(0.55 0.165 5)` #bb3c65 | Ruby fill. Primary loupe, skip link, V1 travelling dot, confirmation node. Nothing else |
| `--accent-hover` | #a02550 | #c04169 | Primary hover fill |
| `--accent-text` | #ab3159 | #de7f96 | Links (always underlined), focus ring, dark loupe rim |
| `--accent-wash` | ruby 8% | ruby-text 10% | Legacy `--accent-soft` only |
| `--on-accent` | #fdf9f9 | #fdf9f9 | Label on ruby |
| `--line` | ink 14% | ink 14% | Hairlines (row rules, section rules). Decorative only |
| `--line-strong` | `oklch(0.600 0.014 180)` #788380 | `oklch(0.540 0.015 175)` #66726e | Borders of controls (inputs, chips, path cards, secondary buttons): ≥3:1 |
| `--focus` | = accent-text | = accent-text | 2 px outline, offset 3 px (4 px on rows) |
| `--success` | `oklch(0.450 0.075 172)` #1d6350 | `oklch(0.780 0.080 172)` #80c8b1 | "Copié", confirmation check, "C'est noté" glyph. Jade, the cup in front light |
| `--error` | = ink | = ink | Error text and 2 px left rule. Never ruby (judges: ruby = act here) |
| `--selection-bg` | jade (`--fringe` hue) 18% | ruby (`--accent-text`) 22% | `::selection` with `--selection-ink` (= ink, links included). The cup: jade in front light (day), ruby in back light (night) |
| `--input-bg` | #f8fbfa | `oklch(0.180 0.011 175)` #0d1311 | Wells for inputs, textareas and code blocks |
| `--fringe` / `--fringe-a` | #33705f / .08 | #80c8b1 / .06 | The only colour moiré line layers read. **Every line layer (W1, W2 base and lens grating, Q2) peaks at `--fringe-a`, no multipliers** (dossier §9 cap). Q1 uses `--fringe` opaque as an icon colour by day |

Other rules:

1. Links in running text: `color: var(--accent-text); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px;` hover: thickness 2px. The comfort judge measured accent-text within 1.0 to 1.5:1 of ink-2, so the underline is mandatory, not decorative.
2. Row links, nav links, chips and buttons are not "running text" and carry no underline at rest (row hover adds a name underline, §4).
3. `accent-color: var(--ink)` on native checkboxes (consent box): checking a box is input, not action.
4. Ground chroma never rises (judges: jade plus ruby tips into Christmas above C 0.012). No new saturated jade token.
5. `theme-color` hex values: light `#ecf2f0`, dark `#121917` (exported from `src/lib/site.ts` as `THEME_COLOR`).
6. Ruby at rest appears in links, focus rings, the primary loupe and one control: the toggle's dark-mode moon (A3, A4). Nowhere else.

### 1.3 Contrast table (re-verified 2026-10-17 after the comfort tune, with `node /home/crqpt/.cache/moire-qa/contrast.mjs FG BG`)

Translucent colours are composited over the stated background. "Dock worst case" is the dock glass (bg at 82%) over solid ink, the most pessimistic thing that can scroll under it. "Sheen worst point" is the loupe highlight at the top edge of the label box.

| Mode | FG | BG | Ratio | Min | Result | Hex | Use |
|---|---|---|---|---|---|---|---|
| light | ink | bg | 12.88:1 | 7 | pass | #1c2c29 / #ecf2f0 | body text |
| light | ink | surface | 11.89:1 | 7 | pass | #1c2c29 / #e2eae7 | text on surface |
| light | ink | surface-2 | 11.26:1 | 7 | pass | #1c2c29 / #dae5e1 | code, kbd, tooltip |
| light | ink | input-bg | 13.96:1 | 7 | pass | #1c2c29 / #f8fbfa | typed text |
| light | ink | selection on bg | 10.14:1 | 4.5 | pass | #1c2c29 / #cbdbd6 | selected text (jade 18 %) |
| light | ink | accent-wash on bg | 11.45:1 | 4.5 | pass | #1c2c29 / #e7e3e4 | legacy fills |
| light | bg | ink | 12.88:1 | 4.5 | pass | #ecf2f0 / #1c2c29 | selected chip label |
| light | ink-2 | bg | 7.64:1 | 4.5 | pass | #414f4b / #ecf2f0 | secondary text |
| light | ink-2 | surface | 7.05:1 | 4.5 | pass | #414f4b / #e2eae7 | secondary on surface |
| light | ink-2 | surface-2 | 6.68:1 | 4.5 | pass | #414f4b / #dae5e1 | secondary on surface-2 |
| light | ink-2 | input-bg | 8.28:1 | 4.5 | pass | #414f4b / #f8fbfa | hints in wells |
| light | ink-2 | dock worst case | 5.42:1 | 4.5 | pass | #414f4b / #c7cfcc | nav over glass (dock worst case) |
| light | ink-3 | bg | 5.50:1 | 4.5 | pass | #586361 / #ecf2f0 | meta, dates |
| light | ink-3 | surface | 5.07:1 | 4.5 | pass | #586361 / #e2eae7 | meta on surface |
| light | ink-3 | surface-2 | 4.81:1 | 4.5 | pass | #586361 / #dae5e1 | meta on surface-2 (now allowed) |
| light | ink-3 | input-bg | 5.96:1 | 4.5 | pass | #586361 / #f8fbfa | placeholder |
| light | accent-text | bg | 5.61:1 | 4.5 | pass | #ab3159 / #ecf2f0 | links |
| light | accent-text | surface | 5.18:1 | 4.5 | pass | #ab3159 / #e2eae7 | links on surface |
| light | accent-text | surface-2 | 4.90:1 | 4.5 | pass | #ab3159 / #dae5e1 | links on surface-2 |
| light | accent-text | input-bg | 6.08:1 | 4.5 | pass | #ab3159 / #f8fbfa | links in wells |
| light | on-accent | accent | 5.88:1 | 4.5 | pass | #fdf9f9 / #ad335b | primary label |
| light | on-accent | accent-hover | 6.99:1 | 4.5 | pass | #fdf9f9 / #a02550 | primary label, hover |
| light | on-accent | accent + sheen worst point | 5.09:1 | 4.5 | pass | #fdf9f9 / #b44368 | loupe sheen worst point |
| light | accent | bg | 5.44:1 | 3 | pass | #ad335b / #ecf2f0 | primary edge |
| light | accent-text | bg | 5.61:1 | 3 | pass | #ab3159 / #ecf2f0 | focus ring |
| light | fringe (opaque) | bg | 5.11:1 | 3 | pass | #33705f / #ecf2f0 | Q1 hatch by day (jade) |
| light | line-strong | bg | 3.47:1 | 3 | pass | #788380 / #ecf2f0 | control borders |
| light | line-strong | input-bg | 3.76:1 | 3 | pass | #788380 / #f8fbfa | input border |
| light | line-strong | surface | 3.20:1 | 3 | pass | #788380 / #e2eae7 | borders on surface |
| light | success | bg | 6.32:1 | 4.5 | pass | #1d6350 / #ecf2f0 | success |
| light | success | surface | 5.84:1 | 4.5 | pass | #1d6350 / #e2eae7 | success on surface |
| light | success | input-bg | 6.85:1 | 4.5 | pass | #1d6350 / #f8fbfa | success in wells |
| light | line | bg | 1.30:1 | ≥1.15 | pass | #cfd7d4 / #ecf2f0 | hairline |
| light | fringe @ .08 | bg | 1.11:1 | <1.15 | pass | #dee8e4 / #ecf2f0 | moiré line |
| dark | ink | bg | 12.76:1 | 7 | pass | #d5dbd9 / #121917 | body text |
| dark | ink | surface | 11.63:1 | 7 | pass | #d5dbd9 / #19221f | text on surface |
| dark | ink | surface-2 | 10.63:1 | 7 | pass | #d5dbd9 / #1f2926 | code, kbd, tooltip |
| dark | ink | input-bg | 13.41:1 | 7 | pass | #d5dbd9 / #0d1311 | typed text |
| dark | ink | selection on bg | 9.00:1 | 4.5 | pass | #d5dbd9 / #3f2f33 | selected text (ruby 22 %) |
| dark | ink | accent-wash on bg | 11.12:1 | 4.5 | pass | #d5dbd9 / #262323 | legacy fills |
| dark | bg | ink | 12.76:1 | 4.5 | pass | #121917 / #d5dbd9 | selected chip label |
| dark | ink-2 | bg | 7.84:1 | 4.5 | pass | #a4aeab / #121917 | secondary text, Q1 set A |
| dark | ink-2 | surface | 7.15:1 | 4.5 | pass | #a4aeab / #19221f | secondary on surface |
| dark | ink-2 | surface-2 | 6.54:1 | 4.5 | pass | #a4aeab / #1f2926 | secondary on surface-2 |
| dark | ink-2 | input-bg | 8.24:1 | 4.5 | pass | #a4aeab / #0d1311 | hints in wells |
| dark | ink-2 | dock worst case | 4.97:1 | 4.5 | pass | #a4aeab / #353c3a | nav over glass (dock worst case) |
| dark | ink-3 | bg | 5.78:1 | 4.5 | pass | #899592 / #121917 | meta, dates |
| dark | ink-3 | surface | 5.27:1 | 4.5 | pass | #899592 / #19221f | meta on surface |
| dark | ink-3 | surface-2 | 4.82:1 | 4.5 | pass | #899592 / #1f2926 | meta on surface-2 (now allowed) |
| dark | ink-3 | input-bg | 6.07:1 | 4.5 | pass | #899592 / #0d1311 | placeholder |
| dark | accent-text | bg | 6.43:1 | 4.5 | pass | #de7f96 / #121917 | links, Q1 set B (ruby moon) |
| dark | accent-text | surface | 5.86:1 | 4.5 | pass | #de7f96 / #19221f | links on surface |
| dark | accent-text | surface-2 | 5.36:1 | 4.5 | pass | #de7f96 / #1f2926 | links on surface-2 |
| dark | accent-text | input-bg | 6.75:1 | 4.5 | pass | #de7f96 / #0d1311 | links in wells |
| dark | on-accent | accent | 5.08:1 | 4.5 | pass | #fdf9f9 / #bb3c65 | primary label |
| dark | on-accent | accent-hover | 4.77:1 | 4.5 | pass | #fdf9f9 / #c04169 | primary label, hover |
| dark | on-accent | accent + sheen worst point | 4.87:1 | 4.5 | pass | #fdf9f9 / #bd4169 | loupe sheen worst point |
| dark | accent | bg | 3.36:1 | 3 | pass | #bb3c65 / #121917 | fill edge (rim carries it) |
| dark | accent-text | bg | 6.43:1 | 3 | pass | #de7f96 / #121917 | loupe rim, focus ring |
| dark | line-strong | bg | 3.56:1 | 3 | pass | #66726e / #121917 | control borders |
| dark | line-strong | input-bg | 3.74:1 | 3 | pass | #66726e / #0d1311 | input border |
| dark | line-strong | surface | 3.24:1 | 3 | pass | #66726e / #19221f | borders on surface |
| dark | success | bg | 9.24:1 | 4.5 | pass | #80c8b1 / #121917 | success |
| dark | success | surface | 8.42:1 | 4.5 | pass | #80c8b1 / #19221f | success on surface |
| dark | success | input-bg | 9.71:1 | 4.5 | pass | #80c8b1 / #0d1311 | success in wells |
| dark | line | bg | 1.40:1 | ≥1.15 | pass | #2d3432 / #121917 | hairline |
| dark | fringe @ .06 | bg | 1.11:1 | <1.15 | pass | #182420 / #121917 | moiré line |

No pair fails. The previous forbidden pair (ink-3 on surface-2, 4.41 and 4.25:1) is gone: ink-3 now clears 4.81:1 on surface-2 in both themes, so no CSS rule has to police which surface meta text sits on. `scripts/qa/contrast.mjs` (WP1a) parses `src/styles/tokens.css` per theme (it vendors the OKLCH converter of the moire-qa tool, because CI cannot reach `/home/crqpt/.cache`) and recomputes every row above; the rendered-page walker of T2 covers real compositions.

Code blocks (future MDX fences): Shiki dual themes `github-light-default` / `github-dark-default` on `--input-bg`. Measured: every light token colour ≥4.85:1 except comments #6e7781 at 4.37:1, which a 6-line Shiki transformer in `astro.config.mjs` rewrites to #5d6966 (ink-3, 5.47:1 on the well). Every dark token colour ≥6.20:1.

### 1.4 Theme mechanics

**Head order in `BaseLayout.astro` (WP1), before any stylesheet:**

```html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" content="#ecf2f0" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#121917" media="(prefers-color-scheme: dark)" />
<script is:inline>
  (function () {
    var d = document.documentElement, t = null, src = "user";
    try { t = localStorage.getItem("theme"); } catch (e) {}
    if (t !== "light" && t !== "dark") {
      src = "system";
      t = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    d.setAttribute("data-theme", t);
    d.setAttribute("data-theme-source", src);
    d.classList.add("js");
    try { if (!matchMedia("(prefers-reduced-motion: reduce)").matches) d.classList.add("anim"); } catch (e) {}
    if (src === "user") {
      var c = t === "dark" ? "#121917" : "#ecf2f0", m = document.querySelectorAll('meta[name="theme-color"]');
      for (var i = 0; i < m.length; i++) m[i].setAttribute("content", c);
    }
  })();
</script>
```

The current script's `className = c` (overwrite) is replaced by `classList.add`.

**Client module `src/lib/theme.ts` (WP1):**

```ts
export type Theme = "light" | "dark";
export const THEME_KEY = "theme";
export function currentTheme(): Theme;                 // reads html[data-theme]
export function setTheme(t: Theme, o?: { persist?: boolean; animate?: boolean }): void;
// persist (default true): localStorage + data-theme-source="user".
// animate (default true): wraps the change in document.startViewTransition when supported and
//   motion is welcome; adds html.theme-xfade for 200 ms; adds html.theme-switching for one frame
//   so element transitions do not stagger. Without View Transitions: instant swap.
export function syncThemeColor(): void;               // both theme-color metas take the current theme hex when source=user
export function followSystem(): () => void;           // while source=system, mirror prefers-color-scheme changes live
```

CSS (global.css): `html.theme-xfade::view-transition-old(root), html.theme-xfade::view-transition-new(root) { animation-duration: var(--t-2); animation-timing-function: ease; }`, `html.theme-switching *, html.theme-switching *::before, html.theme-switching *::after { transition: none !important; }` and `html.theme-xfade [data-qa="header"] { view-transition-name: none !important; }`. The last rule matters: `transition:animate="none"` on the header makes Astro emit ungated `::view-transition-old/new/group(<header name>) { animation: none }` rules (`astro/dist/runtime/server/transition.js`), which would also apply to the toggle's view transition and snap the dock while the page fades. `theme.ts` adds `theme-xfade` **before** calling `startViewTransition` and removes it on `finished`. Scoping by class keeps Astro's navigation transitions untouched. No striped or wiped transitions (dossier §9).

**ClientRouter carry-over (module script in BaseLayout, WP1).** The router copies `<html>` attributes from the incoming static document, which carries none of ours:

```ts
document.addEventListener("astro:before-swap", (e) => {
  const from = document.documentElement;
  const to = (e as Event & { newDocument: Document }).newDocument.documentElement;
  for (const c of ["js", "anim"]) to.classList.toggle(c, from.classList.contains(c));
  to.dataset.theme = from.dataset.theme ?? "light";
  to.dataset.themeSource = from.dataset.themeSource ?? "system";
});
document.addEventListener("astro:after-swap", syncThemeColor);
```

Contract: **no component other than WP1's theme code adds classes or attributes to `<html>`.** Live states belong to the component's own element (W1 marks its section `data-live`, not `html.w1-live` as the prototype does).

**Toggle:** see `ThemeToggle` in §5.3. It persists, it is hidden without JS (`html:not(.js) .theme-toggle { display: none }`), and the system preference stays the default until the visitor clicks. The header is swapped on every navigation (not `transition:persist`), so the toggle re-runs its label update on `astro:page-load`.

---

## 2. Typography

### 2.1 Families and roles (pairing a3, locked)

| Role | Family | Settings | Used for |
|---|---|---|---|
| Display | Basteleur Moonlight | weight 400 only, `font-feature-settings: "ss01"`, `font-synthesis: none`, `letter-spacing: var(--ls-disp)` | Hero name, h1, h2, h3, running and writing row titles, intake questions, 404 lines. **Never below 20 px, never uppercase, never italic, Bold cut retired** |
| Reading | Schibsted Grotesk Variable | 400 body, 500 labels, 600 CTA labels and `<strong>`, real italic | All reading text, leads, row lines, labels, inputs, CTA labels, chip labels, footer text |
| UI mono | JetBrains Mono Variable | 400, wordmark 700, `letter-spacing: var(--ls-mono)`, dates `font-variant-numeric: tabular-nums` | Nav, language switch, hero aside, dates, tags, micro-labels (lowercase), code, wordmark, progress "Étape 1 sur 3" |

Basteleur rules that bite: its accents rise above the ascent (typo ascent .8em, win ascent 1.157em), so **no `overflow: hidden`, no `background-clip: text`, no line-height under 1.04** on any element that holds Basteleur. The one allowed clip is on a container whose padding keeps every Basteleur line at least 0.4em from the clipping edge, never on the text element (the W1 hero section uses `overflow: clip` this way, §5.1). UA styles make h1 to h3 bold: global.css sets `font-weight: 400` on every Basteleur element. Never nest Schibsted or JBM text inside a Basteleur element without resetting `font-feature-settings: normal` (ss01 would leak into the other face).

### 2.2 Font files and `@font-face` (`src/styles/fonts.css`, WP1)

| Face | Source | Size | Download |
|---|---|---|---|
| Basteleur Moonlight | `public/fonts/basteleur-moonlight.woff2` (exists) | 45 KB | **preloaded** on every page |
| Basteleur ₿ subset | copy `docs/moire/explore/type/fonts/btc-piazzolla-380.woff2` to `public/fonts/btc-piazzolla-380.woff2` | 0.8 KB | when U+20BF appears in display text |
| Schibsted Grotesk Variable latin / latin-ext, normal + italic | `@fontsource-variable/schibsted-grotesk` 5.3.0 (new dependency) | 47 + 21 KB normal, 50 + 22 KB italic | latin-ext only for ₿ and rare letters |
| JetBrains Mono Variable latin / latin-ext, normal | `@fontsource-variable/jetbrains-mono` (existing) | 40 + 15 KB | latin-ext only for ₿ |

Delete `public/fonts/basteleur-bold.woff2` and remove `import "@fontsource-variable/jetbrains-mono/index.css"` from BaseLayout (it declares every subset). The `url("@fontsource-variable/...")` form below was verified on 2026-10-17 in a scratch Astro 6 build: Vite resolves the package path, fingerprints the file into `/_astro/`, and dedupes it with `?url` imports.

```css
@font-face { font-family: "Basteleur"; font-style: normal; font-weight: 400 500; font-display: swap;
  src: url("/fonts/basteleur-moonlight.woff2") format("woff2"); }
/* ₿ is not in Basteleur: Piazzolla subset, same family and weight range, scaled to the cap height */
@font-face { font-family: "Basteleur"; font-style: normal; font-weight: 400 500; font-display: swap;
  src: url("/fonts/btc-piazzolla-380.woff2") format("woff2"); unicode-range: U+20BF; size-adjust: 116%; }

@font-face { font-family: "Schibsted Grotesk Variable"; font-style: normal; font-weight: 400 900; font-display: swap;
  src: url("@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2") format("woff2-variations");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "Schibsted Grotesk Variable"; font-style: normal; font-weight: 400 900; font-display: swap;
  src: url("@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-ext-wght-normal.woff2") format("woff2-variations");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
/* italic: same two blocks with font-style: italic and the -wght-italic files */
@font-face { font-family: "JetBrains Mono Variable"; font-style: normal; font-weight: 100 800; font-display: swap;
  src: url("@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2") format("woff2-variations");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: "JetBrains Mono Variable"; font-style: normal; font-weight: 100 800; font-display: swap;
  src: url("@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-ext-wght-normal.woff2") format("woff2-variations");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
```

Preload (head, after the theme script): `<link rel="preload" href="/fonts/basteleur-moonlight.woff2" as="font" type="font/woff2" crossorigin />`. Nothing else is preloaded.

Glyph coverage (checked with fontTools): ₿ exists in Schibsted latin-ext, JBM latin-ext and the Piazzolla subset, not in Basteleur. **No face has → or ↗** (always inline SVG, §6.3) **nor U+202F** (the narrow no-break space falls back to the system face per character; keep U+202F anyway, never swap it for U+00A0).

### 2.3 Scale

| Token | Value | Line height | Notes |
|---|---|---|---|
| `--fs-hero` | `clamp(2.5rem, 9.4vw, 8.5rem)` | 1.1 | one line, `white-space: nowrap` above 560 px |
| `--fs-hero-narrow` | `16.5vw` | 1.04 | ≤560 px, two lines ("William" / "Moiré") |
| `--fs-h1` | `clamp(2.5rem, 1.75rem + 3.2vw, 4.25rem)` | 1.1 | inner page titles (added: the report has no inner h1) |
| `--fs-h1-post` | `clamp(2.125rem, 1.5rem + 2.6vw, 3.5rem)` | 1.1 | writing titles (long) |
| `--fs-h2` | `clamp(2rem, 1.4rem + 1.9vw, 2.75rem)` | 1.2 | section headings |
| `--fs-prose-h2` | `clamp(1.625rem, 1.35rem + 1.1vw, 2.125rem)` | 1.2 | h2 inside prose |
| `--fs-h3` | `clamp(1.375rem, 1.2rem + 0.5vw, 1.625rem)` | 1.2 | row titles, intake questions |
| `--fs-lead` | `clamp(1.1875rem, 1rem + 0.7vw, 1.625rem)` | 1.35 | hero sub, page leads, `-0.005em` |
| `--fs-body` | `1.125rem` | 1.65 | reading, max `--measure` (64ch) |
| `--fs-small` | `1rem` | 1.45 | row lines, hints, footer |
| `--fs-mono` | `.875rem` | 1.4 | nav, aside, langs, `+.01em` |
| `--fs-meta` | `.8125rem` | 1.4 | dates (tabular), tags, micro-labels, V1 labels |
| `--fs-code` | `.9375rem` | 1.55 | inline and block code |
| `--fs-wordmark` | `1.1rem` | 1 | `[w]`, JBM 700 |

Inputs use `1.0625rem` Schibsted (≥16 px prevents iOS zoom). Prose h3 is Schibsted 600 at `1.1875rem`.

### 2.4 Typesetting rules

- `text-wrap: balance` on h1 to h3, hero sub, page leads, 404 lines; `text-wrap: pretty` on paragraphs.
- `hyphens: auto` in prose below 560 px only (with correct `lang`).
- Numbers: dates are ISO `2026-07-04` in lists (JBM tabular), long form (`formatDate`) on post pages.
- French: U+202F before `? ! : ;` and inside `« »`, U+202F as thousands separator (`1 400`), U+2026 for the ellipsis. Written as ` ` escapes in TS. Spanish and English follow the deck.
- Apostrophe: U+2019 in visible copy in all locales. The deck's straight `'` is a typing convenience, not the spec.
- Every arrow in the deck (`→ ↗ ←`) is removed from the string and rendered as `<Arrow>` (§6.3).

### 2.5 Prose (`src/styles/prose.css`, WP1)

`.prose` is the reading surface for posts, the manifesto and the legal notice: Schibsted `--fs-body`/`--lh-body`, `max-width: var(--measure)`, paragraph spacing `1.1em`, h2 Basteleur `--fs-prose-h2` with `margin: 2.2em 0 .6em`, h3 Schibsted 600, lists with 1.25em indent and `--ink-3` markers, `blockquote` as a pull line (Basteleur `--fs-h3`, ink, no italic, `border-left: 2px solid var(--line-strong)`, padding-left 1rem), `figure` full measure with `figcaption` in `--fs-meta` ink-3, inline `code` on `--surface-2` (`--fs-code`, radius 4px, padding .1em .35em), `pre.astro-code` on `--input-bg` with 1px `--line` border, radius 8px, padding 1rem, `overflow-x: auto`, `hr` as 1px `--line` with 2.5em margins, `.katex` inherits ink. Links follow §1.2 rule 1.

---

## 3. Layout, spacing, breakpoints

### 3.1 Containers and grids

- `.wrap`: `max-width: var(--maxw)` (1200 px, padding included, as in the prototypes) `margin-inline: auto; padding-inline: var(--pad)`.
- Reading column: `max-width: var(--measure)` centred inside `.wrap` (posts, manifesto, legal). The page head of a reading page shares that column.
- Split layout (`.split`, ≥1100 px): `grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); column-gap: clamp(2.5rem, 5vw, 4.5rem)`. Used by home (Travailler ensemble | Écrits) and `/contact` (copy | intake, mirrored to 5fr / 7fr).
- Sections: `margin-block-start: var(--section-gap)` between top-level blocks; `--block-gap` inside a section. Headings `margin: 0 0 .45em`.
- Single column below 768 px everywhere. No horizontal scroll at 320 px.

### 3.2 Breakpoints (literal values in media queries)

| Name | Query | What changes |
|---|---|---|
| narrow | `max-width: 560px` | hero name on two lines at `--fs-hero-narrow` |
| md | `min-width: 768px` | sticky glass dock, inline nav, running rows on one line, W1 period 260 (206 below) |
| q2 | `(min-width: 1024px) and (hover: hover) and (pointer: fine)` | the 4-column running-row grid and its Q2 strip column (touch devices at any width keep the 3-column grid, no empty column) |
| lg | `min-width: 1100px` | split layouts; `/projets` aside column; `/contact` two columns |
| short | `(max-height: 600px) and (min-width: 768px)` | compact dock (pill 44 px, `--header-h: 3.75rem` set on `:root` in `tokens.css`), tighter hero padding |
| tiny | `max-width: 339px` | V1 switches to a vertical list |

### 3.3 Hero sizing (no 100dvh, ever)

The hero is content height. The fold must show the running list.

- ≥768 px: `margin-top: calc(-1 * var(--header-h))` so the W1 field runs under the dock; `padding-block: calc(var(--header-h) + clamp(1.5rem, 7svh, 6rem)) clamp(1.75rem, 6svh, 4.5rem)`.
- <768 px: header is in flow; `padding-block: clamp(1.25rem, 4svh, 2rem) clamp(1.75rem, 5svh, 2.5rem)`.
- short: `padding-block: calc(var(--header-h) + 1.25rem) 1.5rem`.

### 3.4 Target behaviours (computed with the tokens above; the fold test in §11 is the authority)

| Viewport | Header | Hero | "En ce moment" heading + first row ends at | Visible at rest |
|---|---|---|---|---|
| 932 × 553 (Fold) | dock 72 px (short query: 60) | name one line ≈ 88 px, sub 1 line, aside 1 line (2 in ES) | ≈ 437 px | heading + rows 1 and 2, row 3 partly |
| 390 × 844 | static, 2 rows ≈ 100 px | name 2 lines ≈ 133 px, sub 2 lines, aside 2 lines | ≈ 565 px | heading + rows 1 to 3 |
| 1440 × 900 | dock 72 px | name 136 px one line; the field rises from the é into the free area right of the sub and aside, nothing in the dock band | ≈ 551 px | heading + all 4 rows |

---

## 4. Motion language

Principle: **small calm input, larger slow response, then stillness.** Every motion is triggered by the visitor, gated by `html.anim`, settles within `--t-5` (600 ms), and leaves no requestAnimationFrame running. No autoplay, no idle loops, no scroll-linked or scroll-triggered motion (the current `.reveal` scroll timeline and the IntersectionObserver reveal are deleted; "play once when in view" is a reveal and stays out, dossier P5), no parallax, no device orientation. Hover-only effects are wrapped in `@media (hover: hover) and (pointer: fine)`; focus-visible triggers the same state where it makes sense.

**Touch is not a lesser device** (the owner reviews on the Fold, a coarse pointer). Where a tap is a natural gesture, it triggers the whimsy: W1 retargets on `pointerdown` anywhere in the hero (§5.1), W2 takes a tap to place the lens and a drag (§5.2), Q1 turns on tap, M1 plays on a logo tap. M3, M4 and M5 stay hover and focus effects: their hosts are links whose tap navigates, and the deck keeps V1 and V2 still on touch (deck §3.5).

### 4.1 The six micro-interactions (the whole budget)

| # | Name | Trigger | Motion | Duration / easing | Reduced motion | Owner |
|---|---|---|---|---|---|---|
| M1 | Wordmark `[w]` to `[wmmw]` | hover, focus-visible on the logo; **touch** (`hover: none`): a logo tap. On home the tap does not reload: it scrolls to top (smooth unless reduced motion) and plays expand, hold 900 ms, collapse. From another page the tap navigates and sets `sessionStorage["wm-m1"]`; home plays the same sequence once on arrival and clears the flag | existing implementation kept: `.rest` max-width 0 to 3.2ch; each letter from `translateX(-0.28em) rotate(180deg)` to none (a w flips into its mirror m) | max-width 440 ms, letters 500 ms, `--ease-spring`, delays **20 / 60 / 100 ms** (settles at 600 ms; collapse mirrors it) | letters appear without rotation | WP1 |
| M2 | Theme toggle "cup" | click or tap | grating B turns 0° to 3° about the disc's edge point (Q1), page crossfades | grating 420 ms `--ease-out`; page 200 ms ease | state switches, no turn, no crossfade | WP1 |
| M3 | Running row | hover, focus-visible | Q2 strip fades in (opacity 0 to `--fringe-a`) while layer B turns 4° to 1.2° (fringe 72 to 239 px, sliding toward the arrow); arrow `translateX(2px)`; row name gets a 1px underline (offset .18em) | strip opacity 200 ms, turn **560 ms** `--ease-out`, arrow 240 ms; on leave the strip fades out over 200 ms | underline only (no strip) | WP2 |
| M4 | V1 travelling dot | hover or focus-within of `[data-steps-host]` (on `/contact`, the left column block) | 4 px ruby dot travels from node 1 to node 3 along the line, rests; on leave it fades | travel 600 ms `--ease-out`; fade out 160 ms then reset | dot never shown | WP2 |
| M5 | V2 weave | hover, focus-visible of `[data-strands-host]` (home coda link) | strand spacing 6 px to 9 px (translateY ±3 / ±6 px from the middle strand), back on leave | 400 ms `--ease-out` both ways | static | WP2 |
| M6 | Confirmation node | intake step 4 appears (server-rendered section un-hidden) | V1 node 1 fills with `--accent` (scale .6 to 1 + fill), a CSS animation that replays when `hidden` is removed | 200 ms `--ease-out`, once | filled, no scale | WP2 (component), WP3 (trigger) |

### 4.2 Functional transitions (not whimsy, still bounded)

| Element | Motion | Duration | Reduced motion |
|---|---|---|---|
| Primary loupe | hover: fill to `--accent-hover`, shadow to `--loupe-shadow-hover`, `translateY(-1px)`; press: `translateY(0) scale(.985)` | 160 ms / 80 ms | colour only |
| Secondary button, chip | border colour to ink, background to `--surface`; link chip arrow `translateX(2px)` | 160 ms (arrow 240 ms) | instant, no nudge |
| Links | underline thickness 1 to 2 px | 120 ms | instant |
| Ghosts disclosure | the closed region carries `hidden`; on open JS removes `hidden`, then animates `grid-template-rows: 0fr` to `1fr` next frame; on close it animates back and sets `hidden` on `transitionend` | 200 ms `--ease-out` | instant |
| Intake step or turn change | answered step or turn collapses to its recap line; next question fades in from `translateY(8px)` | 240 ms | instant |
| Copy button | label swap "Copier" to "Copié" + check glyph in `--success`, back after 1600 ms | 160 ms | instant |
| Tooltip (`[data-tip]`) | opacity + `translateY(2px)` after a 350 ms hover delay | 120 ms | no translate |
| W1 static to live | canvas crossfade from the CSS frame (identical first frame, §5.1) | 320 ms | never live |
| Page navigation | Astro ClientRouter default fade; the header has `transition:animate="none"` so the dock does not blink | Astro default | Astro honours reduced motion |

`reset.css` keeps its global reduced-motion clamp as a safety net.

---

## 5. Moiré integration

Budget (dossier §9): **two wow, three quiet, nothing else.** All moiré is `aria-hidden`, carries no information, is hidden under `forced-colors: active` and in print, never sits under running text, and every layer element carries `data-moire-layer="w1|w2|q1|q2|q3"` for the automated P3 check. Shared parameters: line pitch 4 to 6 CSS px snapped to device pixels (`round(p*dpr)/dpr`), DPR cap 2, sinusoidal profile with `fwidth` fade in shaders, at most 5 visible fringe pairs, alpha from `--fringe-a`.

Port the algorithms from the prototypes (`docs/moire/explore/moire/w1-hero.html`, `w2-ghosts.html`, `q1-toggle.html`, `q2-row.html`, `q3-monogram.html`, shared `tokens.css`); delete their lab bars, `?query` switches and `palette` code. The prototype README may still be in progress; the HTML is the reference, and this section overrides it where they differ.

### 5.1 W1 · `MoireField` (hero "é source") · WP2

Files: `src/components/moire/MoireField.astro`, `src/components/moire/w1.ts`.

- **Model.** Two ring gratings. Source A sits on the acute accent of the final é of "William Moiré". Grating B has pitch `p2 = p1 * r` and its centre is driven by the smoothed pointer C through the magnifier coupling `B = A - (C - A) * (r - 1)`, so every fringe keeps the radial period `P = p1 * r / (r - 1)`. Driving B straight to the pointer is rejected (130 fringes for 400 px).
- **Parameters.**

| Parameter | Value |
|---|---|
| `p1` | 6 px snapped to DPR |
| Period P | 260 px at ≥768 px, 206 px below |
| Rest offset C0 | A + (90, 140) px (same as the CSS frame) |
| Reach clamp | 720 px from A |
| Lerp | **0.18** per 60 Hz frame, dt corrected; settle when the remaining distance < 0.75 px (a 720 px jump settles in about 577 ms) |
| Vignette around A | alpha 1 to 0 between 600 and 950 px (at most 4.6 fringe pairs) |
| Text clear zone | alpha 0 inside every `[data-w1-mask]` line rect grown by 16 px, feathered over 64 px, rects merged by smooth union (k = 48), at most 12 rects |
| Colour, alpha | `--fringe`, `--fringe-a` read from `<html>` at mount and on theme change: light #33705f @ .08, dark #80c8b1 @ .06 |
| Profile | raised cosine squared, flattened to the mean (0.375) as `fwidth` approaches Nyquist |
| Accent anchor | measured at runtime from rendered ink (draw é and e, diff, centroid); fallback `--src-x: .313em; --src-y: .057em` from the glyph box top (type report: accent centre about .32em right of the é origin and .71em above the baseline) |

- **Static frame (server rendered, no JS).** `.w1-src::before` draws both gratings with `repeating-radial-gradient` combined by `mask-composite: intersect`, a 1900 px square centred on A with the 600 to 950 px vignette, `opacity: var(--fringe-a)`. Desktop: `--p1: 6px; --p2: 6.1417px; --bx: -2.126px; --by: -3.307px`; below 768 px: `--p2: 6.18px; --bx: -2.7px; --by: -4.2px`. While static, every `[data-w1-mask]` element gets an invisible page-coloured halo (`background: var(--bg); box-shadow: 0 0 22px 18px var(--bg); border-radius: 14px`) so the frame never reaches text. This halo is the page colour, so it never reads as a card (R4).
- **Live mode.** WebGL2, one oversized triangle, premultiplied alpha, `antialias: false`, `powerPreference: "low-power"`. Init after `load` + `document.fonts.ready` + `requestIdleCallback` (1500 ms timeout) on fine pointers; on coarse pointers only after the first tap inside the hero. First live frame equals the CSS frame, then a 320 ms crossfade (`[data-w1][data-live] canvas { opacity: 1 }`, static `::before` to 0).
- **Input.** Mouse and pen: follow `pointermove` inside the hero. Touch: a tap (moved < 10 px, held < 600 ms) jumps the target to the touch point and the field settles; scrolling fires `pointercancel` and does nothing.
- **Render on demand.** rAF only while unsettled. Stop on settle, on `visibilitychange` hidden, when the hero leaves the viewport (IntersectionObserver). ResizeObserver re-measures and draws one frame. A MutationObserver on `html[data-theme]` re-reads tokens and draws one frame. Context loss: back to the static frame; restore: live again.
- **Never live** with `prefers-reduced-motion: reduce` (static frame, frozen) or without WebGL2. Hidden in forced colors and print.
- **Clear zones source.** The hero's h1, sub and aside, plus the header dock pills, carry `data-w1-mask` (WP1 adds it to the pills).
- **Astro lifecycle.** `document.addEventListener("astro:page-load", mount)`; `document.addEventListener("astro:before-swap", destroy)`. `destroy()` aborts listeners, disconnects observers, calls `WEBGL_lose_context`.
- **QA hook (always shipped, under 300 bytes).** `window.__moire = { w1: { state(), checkClearZones() } }`. `checkClearZones()` reads back the max alpha inside every text rect + 16 px and must return 0.
- **Perf budget.** `w1.ts` ≤ 5 KB min+gz; frame cost ≤ 2 ms at 1440 × 900 DPR 2 on an integrated GPU (prototype `stats.bench`); ≤ 36 frames per settle; zero rAF after settle; GL created after LCP; CLS 0 (absolutely positioned canvas).

### 5.2 W2 · `GhostsLens` (Ghosts row) · WP2

Files: `src/components/moire/GhostsLens.astro`, `src/components/moire/w2.ts`.

- **Model.** 1D shape moiré. Base: the ghost glyph squeezed into every 4 px band (`pb = 4`). Lens: slits at `pr = 4.25` px, magnification 17, so one ghost period reads 68 px. The lens paints the exact composite (magnified ghost masked by its slits) from its position, instead of rasterising two 4 px gratings (which aliases at DPR 1).
- **Geometry.** Strip height 88 px, ghost height 78 px, lens width 136 px (two periods), rest position `--L: 56px` (both ghosts whole and centred). Lens frame: `background: var(--bg); border-radius: 12px; box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ink) 22%, transparent)`; faint lens grating `color-mix(in oklab, var(--ink) 9%, transparent)`. Base strip `opacity: calc(var(--fringe-a) * 2.6)`; ghosts in `--fringe` (the accent stays reserved for action). Edge fade with a `--bg` gradient (18% each side).
- **Interaction.** Pointer and touch drag inside the strip (`touch-action: pan-y`, so vertical scroll still works), lerp 0.35 while dragging and 0.2 on release, release snaps to the nearest multiple of `pb` (ghosts centred), settle at |T − L| < 0.02 px. Speed fade: ghosts dim up to 75% above 900 px/s ghost speed (honest motion blur, no strobing). Three custom properties per frame (`--L --gx --reveal`), nothing else.
- **Keyboard.** The lens is `role="slider"`, `tabindex="0"`, `aria-valuemin="0" aria-valuemax="100"`, `aria-valuenow` in %, label from `home.now.ghosts.lensLabel` (new key, §6.1). Arrows move 6 px, Shift ×10, PageUp/PageDown 40 px, Home/End.
- **Static and reduced.** The CSS rest frame is the no-JS and reduced-motion state; with reduced motion, moves are instant.
- **Layout.** ≥768 px: own grid column `clamp(220px, 30vw, 400px)` to the right of the Ghosts text, column gap ≥ 24 px. <768 px: full width under the text, `margin-top: 1rem`. The « Préviens-moi » field never overlaps it (P3, 16 px clearance).
- **Budget.** `w2.ts` ≤ 2.5 KB min+gz; zero rAF after settle.

### 5.3 Q1 · `ThemeToggle` · WP1

File: `src/components/ThemeToggle.astro` (+ `src/lib/theme.ts`).

- 32 px visual button, 44 px hit area (`::before` inset −6 px), round, `box-shadow: inset 0 0 0 1px var(--line)` (hover: ink 35%), colour `--ink-2`, hover `--ink`.
- Inline SVG 32 × 32, clip circle r = 10: set A horizontal lines every 2 units (stroke 1); set B the same, rotated about (6, 16). **Light: B at 0°** (one even hatch, a lit disc). **Dark: B at 3°** (fringe period about 38 px, about twice the disc: the hatch stays open on the left and closes on the right, a half moon made by interference). Unique clipPath id per instance.
- `aria-label` and tooltip: `theme.toDark` ("Moins de lumière") when light, `theme.toLight` ("Plus de lumière") when dark. Updates on change.
- Forced colors: set B hidden, ring in `ButtonText`. Hidden without JS.

### 5.4 Q2 · Running row strip · WP2

Inside `RunningRow.astro` (link rows only, not Ghosts): `<span class="q2" aria-hidden="true" data-moire-layer="q2">` in its own last grid column `clamp(96px, 12vw, 168px)`, height 32 px. Two `repeating-linear-gradient(180deg, var(--fringe) 0 1.6px, transparent 1.6px 5px)` layers in an isolated group, group `opacity: calc(var(--fringe-a) * 1.5)`, mask `linear-gradient(90deg, transparent, #000 34%, #000 92%, transparent)`. Layer B at rest `rotate(4deg)` about `6px 50%`; row hover or focus-visible: `rotate(1.2deg)` over 560 ms. Shown only under the q2 query (§3.2); hidden in forced colors and print. Transform only (compositor).

### 5.5 Q3 · Monogram, favicon, OG

- **Symbols (WP1).** `src/components/MonogramDefs.astro` renders once at the top of `<body>` a hidden `<svg>` with `<symbol id="wm-line">` (W in 4 px bars at 8 px pitch, M in 4.32 px bars at 8.64 px pitch, sharing the middle stroke) and `<symbol id="wm-solid">` (seven solid strokes, the shared one coloured separately). Geometry: copy from `explore/moire/q3-monogram.html` / `monogram.svg`. Rename the CSS variables `--mono-a/-b/-s` to `--wm-a/-b/-s` (avoids confusion with the `--mono` font token).
- **`Monogram.astro` (WP1).** `variant: "line" | "solid"`, `size` (px, the 512 box; the glyph is about 59% of the box height), `mirrored` (`scaleX(-1)`), `tint` (`--wm-b: var(--accent)`). Rule, from the prototype ladder and dossier §9: line variant at 64 px and above (128, 96, 64), solid at 48 px and below (48, 32, 16). No fine-line moiré at 48 px or less.
- **Footer signature (WP1).** Line monogram at 64 px (glyph about 38 px tall): W·M, a 1 px axis (`--ink` at 28%, 24 px tall), mirrored M·W, colour `--ink-2`, no tint (ruby is for action). The prototype's 34 px line signature breaks the dossier's 48 px rule and is not used. The line variant also appears in the OG image and on `/lab`.
- **Favicon (WP5).** `public/favicon.svg`: solid monogram on a rounded square (rx 112 of 512). Light: bg #ecf2f0, strokes #1c2c29, shared stroke #ad335b. Dark (`@media (prefers-color-scheme: dark)` inside the SVG): bg #17201d, strokes #d5dbd9, shared stroke #de7f96. Plus `public/apple-touch-icon.png` 180 × 180 (light version).
- **OG (WP5).** 1200 × 630 PNG per locale: `public/og/default-fr.png`, `default-en.png`, `default-es.png`. Composition from `explore/moire/og.svg` ported to Lycurgus light: bg #ecf2f0; "William Moiré" Basteleur 112 px ink at left; the line « Deux trames. Un troisième motif. » / "Two layers. A third pattern." / « Dos tramas. Un tercer patrón. » in Schibsted 36 px ink-2; `wmmw.sh` JBM 24 px ink-3 bottom left; line monogram 360 px on the right, M tinted ruby, over a faint static ring field (fringe @ .08) that never touches the text. Source `src/assets/og/og.html`, rendered by `scripts/og-render.py` (Playwright, dev only, outputs committed). `og:image:alt` from `site.ogAlt`.

### 5.6 Sitewide moiré perf budget

| Metric | Budget |
|---|---|
| Own JS on home (W1 + W2 + theme + toggle + ghosts notify + carry-over), min+gz | ≤ 14 KB (Astro router and Umami excluded) |
| Fonts on home | ≤ 160 KB (Basteleur 45 preloaded, Schibsted latin 47, JBM latin 40, Piazzolla 0.8) |
| LCP (home, Fast 4G, mid phone, lab) | ≤ 1.8 s; LCP element is the h1 |
| CLS | ≤ 0.02 |
| TBT | ≤ 50 ms |
| rAF after settle | 0 (automated, §11) |
| WebGL contexts | ≤ 1 per page, created after load + idle |

---

## 6. Components inventory

### 6.1 i18n architecture (WP1 builds it, everyone uses it)

- `src/i18n/define.ts` (WP1): `LOCALES`, `Locale`, `Widen<T>`, `defineNamespace(name, { fr, en, es })`, `fmt(str, vars)` (replaces `{n}`, `{name}`, `{ref}`, `{min}`, `{max}`, `{minutes}`, `{via}`, `{value}`), `splitLink(text, needle): [before, needle, after]` (throws at build if `needle` is not in `text`; used to link a substring such as "mentions légales" without breaking the verbatim string).
- `src/i18n/ui.ts` (WP1): chrome and shared vocabulary only (table below).
- `src/i18n/ns/<name>.ts` (one owner each): `export default defineNamespace("<name>", { fr, en, es })` with `const fr = {...} as const` and `en`, `es` typed `Widen<typeof fr>`, plus
  ```ts
  declare module "../index" { interface Namespaces { <name>: Widen<typeof fr> } }
  ```
- `src/i18n/index.ts` (WP1): keeps `localePath`, `alternates`, `formatDate`, `isoDate`, `getLocaleFromUrl`, `isLocale`; merges `ui[locale]` with every `ns/*.ts` via `import.meta.glob("./ns/*.ts", { eager: true })`; `export interface Namespaces {}`; `export type Dict = Omit<UIDict, keyof Namespaces> & Namespaces`; `t(locale): Dict`. Build-time checks: file name equals namespace name; two namespaces with the same name throw; a namespace may only shadow a key listed in `LEGACY_KEYS` (the old page keys kept until WP1b), never `nav`, `footer`, `theme`, `paths`, `steps`, `common`, `site`, `rss`, `a11y`, `lang`, `skip`.
- Client scripts never import `@i18n`. Components pass needed strings in a `<script type="application/json" data-i18n>` block and read them with `JSON.parse`; user data is always inserted with `textContent`.

**Key mapping rule.** A copy-deck key `x.y.z` lives at `t(locale).x.y.z`, in namespace `x`, with these exceptions (moved because two packages need them):

| Deck key | Lives at | File |
|---|---|---|
| `nav.*`, `skip`, `lang.*`, `theme.*`, `footer.*`, `rss.*`, `a11y.external` | same | `ui.ts` |
| `paths.*` (titles `.me`, `.you`, `.hint`, `.tag`) | `paths.*` | `ui.ts` |
| `steps.tell/scope/build/care` + `.sub`, `steps.careOptional` | `steps.<beat>.label`, `.sub`, `steps.care.optional` | `ui.ts` |
| `home.work.stepsLabel` | `steps.label` | `ui.ts` |
| `ecrits.all` | `common.allWritings` | `ui.ts` |
| OG line and alt (§13.1) | `site.ogLine`, `site.ogAlt` | `ui.ts` |
| `ghosts.notify.*` | `intake.ghosts.*` | `ns/intake.ts` |
| `sum.*`, fit lines (§9.7) | `intake.sum.*`, `intake.fit.<label>` | `ns/intake.ts` |
| `legal.binding` | `legal.binding` | `ns/legal.ts` |
| §13.1 titles and descriptions | `<ns>.meta.title`, `<ns>.meta.description` per page | page namespace |
| enum chip labels | next to their legend, keyed by the enum value of deck §9.8: `intake.tool.team.options["2-10"]`, `intake.when.options["1-3m"]` (shared by tool and open), `intake.tool.budget.options["lt2k"]` + `intake.tool.budget.aria["lt2k"]`, `intake.open.funding.options["not-yet"]`, `intake.other.topic.options["data"]`, `intake.s3.channel.options["telegram"]` | `ns/intake.ts` |

Strings the deck lists in tables without a key get one in the owning namespace, named after their slot in camelCase and kept in deck order: e.g. `projets.items.planb.what`, `projets.items.planb.proofs` (array of `{ text, href?, linkText? }`), `projets.closing`, `contact.links.github`, `outils.blurbs.lazyagent` (or the JSON blurb, WP4's choice, not both), `intake.done.read.tool`.

New keys this spec adds (FR / EN / ES, no deck equivalent): `home.now.ghosts.lensLabel` « Loupe à fantômes, à faire glisser » / "Ghost lens, drag it" / « Lupa de fantasmas, deslízala »; `home.wealth.figureAlt` = deck §3.5 V2 alt; `ecrits.copy` / `ecrits.copied` reuse the `outils.copy` values; `notFound.title` (sr-only h1) « Page introuvable » / "Page not found" / « Página no encontrada ».

**`ui.ts` final shape (WP1a writes it, WP1b removes the legacy block):** `nav{projets,outils,ecrits,contact,ariaLabel,home,logoTip}`, `skip`, `lang{label,switchTo}`, `theme{toLight,toDark}`, `footer{thesis,manifeste,github,x,rss,legal,publisher}`, `a11y{external}`, `common{allWritings}`, `paths{tool,site,open,other}`, `steps{label,tell,scope,build,care}`, `site{ogLine,ogAlt}`, `rss{title,description}` (retitled: « William Moiré : écrits »), `nourritures{...}` and `meta.nourritures` (kept for the parked page), and **legacy** `projets`, `outils`, `ecrits`, `contact`, `manifeste`, `notFound`, `meta` (old shape, untouched) so that pages not yet rewritten still compile. `hero`, `nav.nourritures`, `nav.manifeste`, `footer.contact` are deleted in WP1a.

**Namespaces and owners:** `home` (WP2) · `contact`, `intake`, `legal` (WP3) · `projets`, `outils`, `ecrits`, `manifeste` (WP4) · `notFound` (WP5). `/lab` is FR only and uses literal strings in `lab.astro`.

### 6.2 Chrome (WP1)

**`BaseLayout.astro`**

```ts
interface Props {
  locale: Locale;
  title: string;                 // page name; <title> = `${title} · William Moiré` unless rawTitle
  rawTitle?: boolean;            // home, 404: title used verbatim
  description: string;
  path: string;                  // logical unprefixed path, e.g. "/ecrits/talking-to-silicon"
  ogImage?: string;              // default `/og/default-${locale}.png`
  ogImageAlt?: string;           // default t(locale).site.ogAlt
  ogType?: "website" | "article";// default "website"; posts pass "article"
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
  alternatesFor?: Locale[];      // locales where this path exists (default all); drives hreflang and the language switch
  langFallbackPath?: string;     // where the switch sends a locale missing from alternatesFor (default "/")
  /** @deprecated ignored; kept so the untracked /lectures-sf page and pre-rewrite pages compile */
  heroVariant?: string; heroTitle?: string;
}
```

Renders: head (§1.4 order, then `<title>`, description, canonical, robots, OG/Twitter with `og:site_name` "William Moiré", hreflang + x-default, RSS alternates, `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`, `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`, Basteleur preload, Umami `data-domains="wmmw.sh"`, JSON-LD, `<ClientRouter />`); body: skip link, `MonogramDefs`, `Header`, `<main id="contenu">` slot, `Footer`, `AnnotationOverlay` when enabled.

Robots `noindex, nofollow` when `noindex`, when `ANNOTATION_SYSTEM` (or `PUBLIC_ANNOTATION_SYSTEM`) is `"true"`, or when `path` is in `PARKED_PATHS = ["/nourritures", "/lectures-sf", "/lab", "/lego", "/404"]`. Removed from the layout: `Mycelium`, `Hero`, `myc:reach`, `initTermTyping`, the reveal observer.

**`Header.astro`** (`{ locale, path, langHrefs }` from BaseLayout)

Anatomy: `<header class="site-head" data-qa="header" transition:animate="none">` > `.wrap.dock` > `a.dock-pill.dock-mark.wordmark[data-w1-mask]` (M1, aria-label `nav.home`, tooltip `nav.logoTip` via `data-tip`) + `.dock-pill.dock-nav[data-w1-mask]` > `nav[aria-label=nav.ariaLabel]` (4 links, `aria-current="page"` on the active section: ink + 1px underline offset 5px; others ink-2) + `.dock-tools` (`ThemeToggle`, `nav.lang[aria-label=lang.label]` FR EN ES in JBM, current: ink + underline + `aria-current="true"`, others ink-2, each with `hreflang` and `aria-label` `lang.switchTo.*`).

- ≥768 px: `position: sticky; top: 0; z-index: var(--z-header); padding-top: .625rem; height: var(--header-h)`. Pills: height 52 px (44 in short), `border-radius: var(--r-pill)`, `background: var(--dock-bg)`, `backdrop-filter: blur(var(--dock-blur)) saturate(var(--dock-sat))`, `border: 1px solid var(--dock-edge)`, `box-shadow: var(--dock-highlight), var(--dock-shadow)`. Mark pill hugs its content and grows with M1; nav pill right aligned. Links reach 44 px tap height.
- <768 px: static, no glass. Grid `"mark tools" "nav nav"` (`.dock-nav { display: contents }`), row 1 is 48 px, row 2 is the nav (44 px targets, `gap: 1.25rem`, `overflow-x: auto` as a 320 px safety), 1px `--line` under the header.
- Forced colors: pills get `border: 1px solid CanvasText`, no backdrop.
- `scroll-padding-top: calc(var(--header-h) + 1rem)` on `html` (≥768 px) so `#ghosts` and `#intake` never land under the dock.

**`Footer.astro`** (`{ locale }`): `.wrap`, 1px `--line` top rule, `margin-top: var(--section-gap)`, `padding-block: clamp(2.5rem, 6svh, 4rem)`. Row 1: signature (line monogram pair at 64 px, §5.5) + `footer.thesis` in Schibsted `--fs-small` ink-2, max 52ch, where " | " renders as `<span class="axis" aria-hidden="true"></span><span class="sr">|</span>`. Row 2: links « Le manifeste · GitHub · X · Flux RSS · Mentions légales » (ink, `·` separators `aria-hidden`, GitHub and X `rel="me"`, RSS to the locale feed). Row 3: `footer.publisher` in `--fs-meta` ink-3.

### 6.3 UI primitives (WP1)

| Component | File | Props | Anatomy and states |
|---|---|---|---|
| `Arrow` | `src/components/ui/Arrow.astro` | `dir: "right" \| "left" \| "external" \| "down"`, `size?: string` (default `.8em`), `class?` | `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">`, stroke currentColor 1.5, round caps. Paths: right `M3 8h10M9 4l4 4-4 4`; left `M13 8H3M7 4L3 8l4 4`; external `M5 11L11 5M6 5h5v5`; down `M8 3v10M4 9l4 4 4-4` |
| `Button` | `src/components/ui/Button.astro` | `variant?: "primary" \| "secondary" \| "text"` (default secondary), `href?`, `type?: "button" \| "submit"`, `arrow?: "right" \| "left" \| "external" \| "none"`, `external?: boolean`, `locale: Locale`, `name? value? form? disabled? busy? id? class? "data-qa"?` | `<a>` when `href`, else `<button>`. **primary (loupe):** min-height 48 px, padding 0 1.25rem, pill, Schibsted 600 1rem `.005em`, `background: var(--loupe-sheen), var(--accent)`, `color: var(--on-accent)`, `box-shadow: var(--loupe-rim), var(--loupe-shadow)`; hover/press §4.2; busy `aria-busy="true"` + label swap by caller, disabled opacity .55 no shadow. **secondary:** min-height 44 px, transparent, `1px solid var(--line-strong)`, ink, hover border ink + `--surface`. **text:** inline, accent-text, underline rule. `external` adds `rel="noopener"`, the external arrow and `<span class="sr">` `a11y.external`. Same tab always |
| `Chip` (link) | `src/components/ui/Chip.astro` | `href`, `locale`, `external?`, `class?`, `"data-qa"?` | min-height 44 px, padding 0 1rem, pill, `1px solid var(--line-strong)`, Schibsted 500 `.9375rem` ink; hover border ink + `--surface`; focus ring; external arrow + sr suffix |
| Radio chip (CSS) | `global.css` `.chip-radio` | n/a | `<label class="chip-radio"><input class="sr" type="radio" ...><span>Label</span></label>`; checked: span `background: var(--ink); color: var(--bg); border-color: var(--ink)` + 12 px check glyph; `input:focus-visible + span` gets the focus ring |
| `PageHead` | `src/components/ui/PageHead.astro` | `title`, `lead?`, `size?: "page" \| "post"`, `id?` (default `page-title`), slots `meta`, `aside` | h1 Basteleur `--fs-h1` (post: `--fs-h1-post`), lead `--fs-lead` ink-2 max `--measure-lead`; `padding-top: clamp(1.5rem, 5svh, 3.5rem)` |
| Tooltip (CSS) | `global.css` `[data-tip]` | `data-tip="text"` | `::after` with `attr(data-tip)`, `--surface-2` bg, ink text, `--fs-meta` Schibsted, 1px `--line`, `--shadow-1`, radius 8px, max-width 28ch, below the element; shown on hover (350 ms delay) and focus-visible; never on touch |
| `ThemeToggle` | §5.3 | `locale` | |
| `Monogram`, `MonogramDefs` | §5.5 | `variant?, size?, mirrored?, tint?, label?, class?` | `label` set: `role="img" aria-label`; else `aria-hidden` |

### 6.4 Shared visual and capture components (stubbed by WP1, then owned as listed)

WP1 creates each file with the final `Props` interface and a plain, correct render (labels in a list, a form without enhancement) so dependent packages compile and look right before the owner lands. Ownership transfers when WP1a merges.

```ts
// src/components/visual/StepsLine.astro (V1) -> WP2
interface Props {
  locale: Locale;
  variant?: "compact" | "detailed"; // compact: home, labels only; detailed: /contact, labels + subs
  done?: 0 | 1;                     // 1: node 1 filled in accent (M6), used on the intake confirmation
  class?: string;
}
// The nearest ancestor with [data-steps-host] triggers M4 on hover/focus-within.

// src/components/visual/FiveStrands.astro (V2) -> WP2
interface Props {
  variant?: "figure" | "stub"; // figure: 120 x 40 (home); stub: 16 x 8 bullet (/contact)
  strand?: 0 | 1 | 2 | 3 | 4;  // stub only; 3 is the money strand (bold ink)
  label?: string;              // figure only; role="img" + aria-label; absent => aria-hidden
  class?: string;
}
// The nearest ancestor with [data-strands-host] triggers M5.

// src/components/intake/GhostsNotify.astro -> WP3
interface Props {
  locale: Locale;
  open?: boolean;  // false: closed disclosure under the home Ghosts line; true: always open (/projets#ghosts)
  page: string;    // logical path stored in the payload: "/" or "/projets"
  class?: string;
}

// src/lib/jsonld.ts -> WP5
export function homeJsonLd(locale: Locale): Record<string, unknown>;
```

### 6.5 Package-local components

| Component | File | Owner | Purpose |
|---|---|---|---|
| `HomeHero` | `src/components/home/HomeHero.astro` | WP2 | h1 with the final é wrapped in `<span class="w1-src">`, sub, aside; all `data-w1-mask` |
| `MoireField`, `GhostsLens` | `src/components/moire/*` | WP2 | §5.1, §5.2 |
| `RunningList`, `RunningRow` | `src/components/home/*` | WP2 | §7.1; `RunningRow` props `{ locale, name, line, href?, external?, variant?: "link" \| "ghosts" }` + default slot (ghosts extras) |
| `WorkBlock`, `LatestWritings`, `WealthLine` | `src/components/home/*` | WP2 | §7.1 |
| `IntakeForm`, `IntakeConfirmation`, `PathCards`, `ChannelFields` | `src/components/intake/*` | WP3 | §7.7, §8 |
| `Gets`, `Elsewhere` | `src/components/contact/*` | WP3 | §7.7 |
| `LegalPage` + `legal-fr.mdx`, `legal-en.mdx`, `legal-es.mdx` | `src/components/pages/LegalPage.astro`, `src/components/legal/` | WP3 | §7.8 |
| `ProjectSection`, `ToolRow`, `CopyLine`, `WritingRow` | `src/components/projets/`, `outils/`, `ecrits/` | WP4 | §7.2 to §7.4. `CopyLine` props `{ code: string; locale: Locale; copyLabel: string; copiedLabel: string; label?: string }` |

### 6.6 Client script rules (all packages)

- Component scripts are bundled modules (`<script>` without `is:inline`), run once per full load. Initialise on `document.addEventListener("astro:page-load", init)` and tear down on `astro:before-swap` (listeners through one `AbortController`, observers disconnected, rAF cancelled).
- Query from the component root, never `document` wide, so two instances never collide.
- No framework runtime, no animation library, no three.js (R2). Pointer events only; passive listeners for move and touch.
- State that must survive a swap lives in `sessionStorage` (intake draft, ghosts done) or on `<html>` only through WP1's theme code (§1.4).
- Never `innerHTML` with visitor data or the URL; use `textContent`.

---

## 7. Pages

Every page: one h1, landmarks (header, nav, main, footer), French slugs in all locales, `trailingSlash: "never"`, both themes, no moiré outside home, no glass outside the dock and the primary loupe.

### 7.1 Home `/`, `/en`, `/es` · WP2

Section order (copy deck §3, keys `home.*`):

1. **Hero** inside `MoireField`: h1 `home.hero.h1` (`id="hero-title"`), sub `home.hero.sub` (`--fs-lead`, ink, `text-wrap: balance`, max 40ch), aside `home.hero.aside` (JBM `--fs-mono`, ink-2, max 64ch). No CTA, no photo.
2. **En ce moment** (`<section aria-labelledby="now">`, h2 `id="now" data-qa="now-heading"`): `RunningList` of 4 `RunningRow` (`data-qa="now-row"`):
   - Plan ₿ Academy → `https://planb.academy` (external) · alysis → `https://alysis.cat` (external) · Outils sur mesure → `/contact?chemin=outil` (right arrow) · Ghosts (variant `ghosts`, not a link): line, then `GhostsNotify open={false} page="/"` inline after the line, `GhostsLens` in its column.
   - Row grid: ≥1024 `minmax(11rem, 16rem) minmax(0, 1fr) auto clamp(96px, 12vw, 168px)` (name, line, arrow, Q2); 768 to 1023 `minmax(10rem, 14rem) minmax(0, 1fr) auto`; <768 `minmax(0, 1fr) auto` (name, then line under it, arrow top right). Ghosts row ≥768 `minmax(11rem, 16rem) minmax(0, 1fr) clamp(220px, 30vw, 400px)`. Column gap 1.5rem, `padding-block: .9rem`, min-height 4.5rem, rules `--line`. Name Basteleur `--fs-h3`, line Schibsted `--fs-small` ink-2, arrow ink-3 (ink on hover). The whole row is the `<a>`; no separate link inside (owner: "chaque ligne est clickable"). No row background on hover (R4); M3 only. Domains are not printed (word budget).
3. **Travailler ensemble** (`WorkBlock`, `data-steps-host`): h2 `home.work.heading`, line `home.work.line` (ink-2, max 46ch), `StepsLine variant="compact"` (max 420 px), then 4 `Chip`: `paths.tool.me` → `/contact?chemin=outil`; `paths.site.me` → `https://alysis.cat` external; `paths.open.me` → `/contact?chemin=ouvert`; `paths.other.me` → `/contact?chemin=autre`. Chips wrap, order kept, labels never shortened. This is the only action block; no primary button on home.
4. **Écrits** (`LatestWritings`): h2 `home.ecrits.heading`, 3 latest (ISO date JBM `--fs-meta` ink-3 tabular + title Basteleur `--fs-h3`), each row a link; then text link `common.allWritings` + right arrow. If FR visible words exceed 140, render 2 rows (copy deck §3.2).
5. **Mycelic line** (`WealthLine`, one `<a>` to `/manifeste` with `aria-label` `home.wealth.aria`, `data-strands-host`): `FiveStrands variant="figure" label={home.wealth.figureAlt}` (left ≥768, above the line below), the line `home.wealth.line` (ink), hint `home.wealth.more` + right arrow (accent-text). Top and bottom `--line` rules.

Layout: sections 3 and 4 side by side in `.split` at ≥1100 px; stacked below. JSON-LD: `homeJsonLd(locale)`. Title (raw): `home.meta.title`.

**Not on home:** hero CTA, photo, five-dimensions block, gift/paid line, tools list, project details, manifesto in nav, newsletter, testimonials, metrics, scroll cues, section numbers, uppercase labels, reveal animations, physarum, TerminalPanel.

### 7.2 `/projets` · WP4 (renders on demand)

`export const prerender = false` in `src/pages/projets.astro` and `src/pages/[lang]/projets.astro` (the latter validates `lang` in `["en", "es"]`, else `return new Response(null, { status: 404 })`, never `Astro.rewrite("/404")`: see §13 E1). Reason: the no-JS Ghosts form posts here (§8.6).

Order (deck §4): `PageHead` (`projets.heading`, `projets.intro`) → four `<article>` with ids `plan-b-academy`, `alysis`, `outils-sur-mesure`, `ghosts`, separated by a `--line` rule and `--section-gap`:

- ≥1100 px: grid `15rem minmax(0, var(--measure))`. Aside: h2 (Basteleur `--fs-h2`) + dimensions line (JBM `--fs-meta`: the word `projets.labels.dims` links to `/manifeste#les-cinq-dimensions` (EN `#the-five-dimensions`, ES `#las-cinco-dimensiones`), then the tags joined by ` · `). Body: parts in order, each with a lowercase JBM micro-label (ink-3) above Schibsted text: « ce que c'est », « mon rôle », « preuves » (list, each proof with its link per deck), « pour toi » (ink, slightly larger: `1.1875rem`), then the outbound text link (`planb.academy`, `alysis.cat` + external arrow).
- Outils sur mesure: the page's single primary action, `Button variant="primary" arrow="right"` "Raconte-moi ce qui coince" → `/contact?chemin=outil`. Proof 3 (agricultural trader) is behind `const SHOW_AGRI_PROOF = false` (owner default, deck D-31).
- Ghosts: line + « pour toi » + `GhostsNotify open page="/projets"`.
- Closing line (`projets.closing`) with « le manifeste » linked through `splitLink`.

**Not here:** Sympoesis, "Head of Content", course or language totals, 420x, client names, prospect mockups, photos, counters.

### 7.3 `/outils` · WP4

`PageHead` (`outils.heading`, `outils.intro`) → tool rows from `src/content/tools/*.json` (blurbs replaced by the deck's plain blurbs, §5 table): name (Basteleur `--fs-h3`), blurb (Schibsted), status tag (JBM meta ink-3, `outils.status.stable`), then if `install` exists: micro-label `outils.install` + `CopyLine` (code on `--input-bg`, JBM `--fs-code`, copy button `outils.copy`/`outils.copied`, never a `$` prompt), then `outils.repo` + external arrow, or `outils.private` when no repo. lazyagent: replace `cargo install --path .` by the verified one-line install (`cargo install --git https://github.com/Asi0Flammeus/lazyagent`); if it cannot be verified on ship day, omit the install line. Closing: `outils.cta.line` + `Button variant="secondary" arrow="right"` `outils.cta.link` → `/contact?chemin=outil`.

**Not here:** jargon blurbs, terminal panels, typed lines, stars or download counters.

### 7.4 `/ecrits` · WP4

`PageHead` (`ecrits.heading`, `ecrits.intro`) → follow block: `Button variant="secondary"` `ecrits.follow` → locale feed; `ecrits.followHint` + `CopyLine` with `wmmw.sh/rss.xml` (EN `/en/rss.xml`, ES `/es/rss.xml`) → list of writings (`WritingRow`: ISO date, title Basteleur `--fs-h3`, description Schibsted `--fs-small` ink-2; whole row a link). Drafts excluded.

**Not here:** tag filters, cover images in the list, search, pagination.

### 7.5 `/ecrits/[slug]` · WP4

Reading layout: back link (`common.allWritings`, left arrow, ink-3) → `PageHead size="post"` with the title, `slot="meta"`: byline (`ecrits.byLegacy` when `author === "asi0"`, else `ecrits.by`), `ecrits.published` + long date (+ `ecrits.updated`), tags (JBM meta ink-3 `#tag`), translations line (`ecrits.translations` + links) → cover `figure` (Astro `Image`, widths 480/800/1200) → `<div class="prose crqpt-compat">` → end back link. `BaseLayout` gets `ogType="article"`, `ogImage` = cover when present, `alternatesFor` = locales that exist for the slug, `langFallbackPath="/ecrits"`. Slugs unchanged (`workflow-a-en-perdre-la-tete`, `talking-to-silicon`, `estimateur-de-pareto`, `hello-world`).

**Not here:** moiré, glass, sidebars, share buttons, related posts, comments.

### 7.6 `/manifeste` · WP4

Reading layout: h1 from frontmatter title, prose body, `common.allWritings` end link. Content edits (deck §7): the `wmmw` section rewritten as « W·M | M·W » with `<h2 id="wmmw">` written as JSX in the MDX (keeps the anchor), M1 to M5 edits in FR/EN/ES, frontmatter titles to canon casing. Pull quotes use the prose blockquote style.

**Not here:** CTA, portrait, physarum, five-dimension cards, moiré.

### 7.7 `/contact` · WP3 (renders on demand)

`prerender = false` on `src/pages/contact.astro` and `src/pages/[lang]/contact.astro` (lang validation as §7.2). The response sets `Cache-Control: no-store` (it embeds a start token). GET renders the intake; POST handles the no-JS brief (§8.5).

Order:

- **≥1100 px**, `.split` mirrored (5fr | 7fr). Left: `PageHead` (`contact.heading`, `contact.lede`), `contact.split` (ink, `--fs-lead`), « Comment ça se passe » (`contact.steps.heading`, h2 `--fs-h3`) with `StepsLine variant="detailed"`. Right: `#intake` card, sticky (`top: calc(var(--header-h) + 1rem)`) only when `min-height: 760px`; legal line directly under it (`intake.legal.who`, `intake.legal.data` with « mentions légales » linked to `/mentions-legales#donnees` via `splitLink`), `--fs-small` ink-2. Below, full width: « Ce que tu emportes » (`Gets`: 5 rows, each `FiveStrands variant="stub"` (strand 3 bold for `fin`), dimension label JBM meta ink-3, sentence; then `contact.gets.why` as a link to `/manifeste`), then « Ailleurs » (`Elsewhere`: portrait `src/assets/william.jpg` 200 px wide, aspect 4:5, radius 12px, Astro `Image` widths 240/360/480, alt `contact.portraitAlt`, caption `contact.portraitCaption`; three row links GitHub @Asi0Flammeus, X @asi0_flammeus, Plan ₿ Academy asi0 → `PLANB_PROFESSOR_URL`, each with its deck line and external arrow).
- **<1100 px**: h1, lede, split, intake card, legal line, V1, gets, elsewhere.
- **Intake card:** no fill (R4), `1px solid var(--line)`, radius 12px, padding `clamp(1.25rem, 3vw, 2rem)`. Anatomy and behaviour in §8.4. The send button is the page's single primary loupe.

**Not here:** email address, booking link, phone, Telegram or Signal of William, price list, moiré, glass inside the card.

### 7.8 `/mentions-legales` · WP3 (static)

New routes `src/pages/mentions-legales.astro`, `src/pages/[lang]/mentions-legales.astro` (static, `getStaticPaths` en/es) rendering `LegalPage` with the locale MDX body (`src/components/legal/legal-<locale>.mdx`, deck §11 verbatim, imported directly as components, not a content collection). Reading layout; `<h2 id="donnees">` on the personal data section in all locales; EN and ES show `legal.binding` under the h1. Variables come from `src/lib/legal.ts` (WP3) and are never rendered as placeholders:

| Variable | Value | Rule |
|---|---|---|
| `ADRESSE_SIEGE` | 334 rue Nicolas Parent, 73000 Chambéry, France | from the alysis.cat legal page (deck D-16, owner to confirm) |
| `SCALEWAY_TEL` | verify on Scaleway's own legal page before ship | `null` until verified; when null the sentence keeps only the address |
| `MEDIATEUR` | `null` (not designated) | when null the « Médiation » section is not rendered and the build logs one warning (deck flag 3) |
| `POLICES` | Basteleur (Velvetyne), Schibsted Grotesk, JetBrains Mono | |
| `MAJ` | octobre 2026 / October 2026 / octubre de 2026 | |

Title `legal.meta.title`. **Not here:** the registry trade name, phone, EU ODR link, cookie banner (none needed).

### 7.9 404 · WP5

Single FR route `src/pages/404.astro` (Astro emits `/404.html`), `rawTitle` `notFound.meta.title` per deck §12, noindex. Content: sr-only h1 `notFound.title`; requested path in JBM `--fs-mono` ink-3 (`textContent` from `location.pathname`, existing safe pattern); three blocks FR, EN, ES, each the line `notFound.line` in Basteleur `--fs-h3` (lang attribute set per block) and its home link (`/`, `/en`, `/es`) with right arrow. An inline script moves EN or ES first when the path starts with `/en/` or `/es/`. The footer and header stay.

### 7.10 `/lab` (noindex, FR only, unlinked) · WP5

Purpose: show the owner how the direction was chosen. Route `src/pages/lab.astro`, `noindex`, excluded from the sitemap, never linked from nav, footer or `llms.txt`.

- **Assets: committed copies in `public/lab/`** (the Docker build context excludes `docs/`, so a build step cannot read them). `scripts/lab-assets.mjs` (sharp, already in `node_modules`) writes `public/lab/palettes/{G1,G2,OPTICS1..5,PRINT1..5,SPORE1..5}.webp` and `public/lab/type/{a,a2,a3,b,c,d,e,f,g,rec-1440-light,rec-932-dark,rec-390-light,rec-390-dark}.webp` at 1200 px wide, quality 80, and `src/lib/lab-data.json` (id, name, first sentence of `story`, judges' scores per id from `results.json`). It also copies the five moiré prototypes plus `tokens.css`, `favicon.svg`, `monogram.svg`, `og.svg` and only the fonts they reference into `public/lab/moire/`. The script fails if any copied file contains U+2013/U+2014 or a prompt glyph. Re-run by hand when explorations change.
- **Sections:** « Palette » (grid of 17 cards; G1 and G2 tagged « centre évident »; OPTICS5 tagged « retenue » with a 2px `--accent` outline; each card shows id, name, story sentence) → « Ce que les juges ont dit » (table: judge, top 3, OPTICS5 score: distinct 8.5, brand 9, comfort 7) → « Typographie » (pairings a, a2, a3 « retenue », b to g, then the four recommendation shots) → « Moiré » (links to `/lab/moire/w1-hero.html`, `w2-ghosts.html`, `q1-toggle.html`, `q2-row.html`, `q3-monogram.html`) → « Jetons » (live swatches of every colour token in two side-by-side `data-theme="light"` and `data-theme="dark"` islands with hex, OKLCH and role).
- Images `loading="lazy"`, explicit width and height.

### 7.11 Parked and plumbing

`/nourritures` (tracked) and `/lectures-sf` (untracked, not ours, never edited) stay reachable but noindex via `PARKED_PATHS`, out of the sitemap and `llms.txt`. `/lego` is rebuilt in WP1b (§10). `/r/[id]`, `/api/reports`, `/api/prototype-feedback` are untouched.

---

## 8. Backend: the intake inbox · WP3

### 8.1 Files

```
src/lib/intake/rules.ts     pure validators + limits + regexes (shared by client bundle and server; no zod here)
src/lib/intake/schema.ts    zod schema (deck §9.8) built on rules.ts constants; server only
src/lib/intake/token.ts     signed start token (HMAC-SHA256)
src/lib/intake/ratelimit.ts in-memory limits, hashed keys, daily salt
src/lib/intake/store.ts     ids, atomic write, read, list, delete, retention sweep, ghosts index
src/lib/intake/fit.ts       fit label (deck §9.7 table, first match wins)
src/lib/intake/process.ts   processIntake(): the single pipeline used by the API and by the no-JS pages
src/lib/intake/auth.ts      intakeAuthorized(request): Bearer INTAKE_TOKEN, timingSafeEqual (mirror of reportsAuthorized)
src/pages/api/intake/index.ts  POST (public, JSON), GET (token)
src/pages/api/intake/[id].ts   GET, DELETE (token)
src/pages/api/intake/start.ts  GET fresh start token
```

All endpoints `export const prerender = false`. `src/lib/reports.ts` is not imported or modified.

### 8.2 Environment

| Var | Default | Use |
|---|---|---|
| `INTAKE_DIR` | `join(process.cwd(), ".intake")` locally; `/data/intake` in the preview compose | storage, dir mode 0700, files 0600 |
| `INTAKE_TOKEN` | unset (read endpoints answer 401) | Bearer token for GET/DELETE |
| `INTAKE_SECRET` | random 32 bytes per process | start token HMAC key (a restart costs one silent 409 retry) |
| `INTAKE_MIN_BRIEF_MS` / `INTAKE_MIN_GHOSTS_MS` | 8000 / 3000 | minimum time on form; QA runs set 300 |
| `INTAKE_ALLOWED_ORIGINS` | `https://wmmw.sh,https://moire.wmmw.sh` (+ `http://localhost:4321`, `http://127.0.0.1:4321` when `NODE_ENV !== "production"`) | origin check |

Add `.intake/` to `.gitignore`, document the five vars in `.env.example`, and add `INTAKE_SECRET=${INTAKE_SECRET:-}` to `docker-compose.moire.yml` (WP3 owns these three files). The production `docker-compose.yml` is **not** edited on this branch (merge checklist, §9.3).

### 8.3 API contract

**`POST /api/intake`** · `Content-Type: application/json` only (415 otherwise). Body per deck §9.8 (`locale, path, fields, contact, consent, started, page, from, site_web`). Pipeline in `processIntake(input, { request, clientAddress, js, kind })`, in this order:

1. **Origin:** if `Origin` is present it must be in the allowed list, else 403; if absent, `Referer` (when present) must match; if both are absent the request continues only with a valid token.
2. **Size:** `Content-Length` over 16 KiB → 413; the body is read through a 16 KiB limited reader (413 when exceeded while streaming).
3. **Parse** (400 `invalid` on bad JSON). Strings trimmed, NFC normalised, CRLF to LF, control characters except `\n` removed, at most 30 line breaks; unknown keys dropped.
4. **Honeypot** `site_web` non-empty → fake `201` (random id and ref), nothing stored.
5. **Token:** `started = base64url(ts.kind.locale.hmac)`, `kind` is `brief` or `ghosts`. Missing or forged → 400 (JSON). Older than 2 h → `409 {"error":"stale","started":"<fresh>"}`. Younger than the minimum → fake 201. Ghosts posted without JS (§8.6) are the only path allowed without a token.
6. **Rate limit (in memory, never on disk):** key `sha256(ip + dailySalt)`, ip = `x-real-ip` || first `x-forwarded-for` || `clientAddress`. If no forwarded header exists and the address is loopback or private (proxy without forwarding headers), per-key limits are skipped, only global caps apply, and one warning is logged per process. Accepted submissions count: briefs 3 per 10 min and 10 per 24 h; ghosts 2 per 10 min. All POSTs count toward a looser 30 per 10 min attempt limit (so fixing validation errors never trips 429). Over limit → `429 {"error":"rate_limited","retry_after":<s>}` + `Retry-After`. Global: 200 accepted per UTC day, at most 50 ghosts → `503 {"error":"busy"}`.
7. **Validate** (zod, deck §9.8 table) → `400 {"error":"invalid","fields":{"fields.problem":"too_short"}}` with codes `required | too_short | too_long | invalid_format | invalid_choice`. `path: "site"` → 400.
8. **Content check:** more than 3 URLs in `problem`/`message`, or all text fields identical → fake 201.
9. **Ghosts duplicate:** normalised value already listed → real 201, nothing written (nobody learns who is on the list).
10. **Idempotency:** a second submission with the same start token returns the first `{id, ref, fit}` (covers no-JS reloads).
11. **Fit** computed server side (never from the client).
12. **Write** `${INTAKE_DIR}/${id}.json` (temp file then rename, 0600), record shape exactly deck §9.8 (`v, id, ref, received_at, expires_at (+12 months), locale, path, fields, contact, consent{accepted, basis, text_version: "2026-10-17", retention_months: 12}, fit{label, reasons}, page, from, meta{js, elapsed_s}`). `id` = UTC `YYYYMMDD-HHMMSS-` + 8 lowercase Crockford base32 chars (40 random bits), matches `^[a-z0-9][a-z0-9-]{7,63}$`; `ref` = the 8 chars uppercase as `XXXX XXXX`. Never stored: IP, user agent, external referrer, cookies.
13. **Respond** `201 {"id","ref","fit"}` (`ghosts`: `201 {"ok":true}`).

**`GET /api/intake/start?kind=brief|ghosts&locale=fr`** → `{ "started": "<token>" }`, `Cache-Control: no-store`.

**`GET /api/intake[?path=ghosts]`** (Bearer) → newest first `[{ id, received_at, path, fit, channel }]`. **`GET /api/intake/[id]`** (Bearer) → full record. **`DELETE /api/intake/[id]`** (Bearer) → `{ "ok": true }`. Invalid id → 404. No token configured or wrong token → 401. Style mirrors `src/pages/api/reports.ts` (`json()` helper, zod, same status shapes).

**Retention:** sweep at module load and every 24 h (`setInterval(...).unref()`): delete files past `expires_at`; above 5,000 files delete oldest first and log.

Astro config: `security: { checkOrigin: false }` (WP1). Astro's built-in check compares `Origin` with the request URL, which reads `http://` behind the TLS proxy (see the comment in `api/reports.ts`) and would reject every no-JS form post with 403. Step 1 above replaces it.

### 8.4 Intake UI with JS (guided conversation)

One `<form id="intake" data-qa="intake" method="post" action="{localePath(locale, '/contact')}#intake" novalidate>` serves both modes. Inside: `<section data-step="1">`, `<section data-step="2">` (three groups `[data-path-group="tool|open|other"]`), `<section data-step="3">`, and an empty `<section data-step="4" hidden>` template for the confirmation. Hidden inputs: `locale`, `started` (server rendered token), `page`, `from` (filled from `document.referrer` when same origin), honeypot `site_web` (off-screen wrapper `aria-hidden="true"`, input `tabindex="-1" autocomplete="off"`, label `intake.honeypot`).

- `intake.client.ts` (WP3) sets `form[data-enhanced]` and shows one step at a time. Card head: progress `intake.progress` (JBM meta ink-3, `fmt` with n), "Retour" text button (left arrow) from step 2. Answered steps collapse into recap lines (`intake.recap.path` + `paths.<p>.you` + "Changer" text button). Question headings are h2 in Basteleur `--fs-h3` with `tabindex="-1"`; focus moves to the new heading on each step and an `aria-live="polite"` region announces the progress string.
- **Step 1:** `fieldset` with legend `intake.s1.question`; four path cards in a 2 × 2 grid ≥560 px (stacked below): radio cards for tool, open, other (title Schibsted 600 `1.0625rem`, hint `--fs-small` ink-2, tag JBM meta ink-3; `1px solid var(--line-strong)`, radius 12px, min-height 7rem; checked: `2px solid var(--ink)`, `--surface` background, check glyph top right; focus ring on the card). The site card is a real link to `https://alysis.cat` styled the same with the external arrow; selecting it stores nothing. Under the cards, `intake.s1.learn` rebuilt from parts (`lead`, then links « Plan ₿ Academy » → planb.academy, « mes écrits » → `/ecrits`, « mes outils » → `/outils`, joined exactly as the deck string). "Continuer" (secondary, right arrow).
- **Deep links:** `?chemin=outil|ouvert|autre` preselects the radio server side and, with JS, opens step 2 with the recap; `?chemin=site` shows the alysis panel (`intake.site.*`) in place of step 2.
- **Step 2:** per path, deck §9.4 exactly. Radio chips (`.chip-radio`) for bands; textareas `field-sizing: content` (fallback `rows="4"`), min-height 7.5rem; input wells per §1.2. Footer line `intake.s2.safe`. Character counter appears at 80% of the limit (`intake.count`), announced at 80% and 100% only.
- **Step 3:** name; channel radio chips; one value input per channel (five wrappers in the DOM, the checked channel's wrapper visible via `:has()` and JS; names `contact.value.email|x|telegram|signal|other`; email input `type="email" inputmode="email" autocomplete="email"`); `intake.s3.noList`; consent checkbox + `intake.s3.consentLink` → `/mentions-legales#donnees`; status line (`aria-live`) above the send button; **send = `Button variant="primary" type="submit"`** `intake.s3.send`, busy label `intake.s3.sending`.
- **Validation:** `rules.ts` on "Continuer" and on blur after the first attempt, never while typing. Error summary at the top of the card (focused, links to fields, `intake.err.summary.one|many`), field errors in ink with a 14 px glyph, `aria-describedby`, `box-shadow: inset 3px 0 0 var(--error)` on the field. Typed text is never cleared.
- **Send:** JSON POST to `/api/intake`. If less than the minimum time has passed since the token, wait the remainder while showing the busy state (never let a fast human hit the silent drop). 201 → render step 4 client side from the JSON i18n block (`textContent` only), clear the draft, focus the title. 400 → map field codes to `intake.err.*`, return to the first failing step. 409 → take `started` from the body and resend once silently. 413, 429 (with minutes), 5xx, network → `intake.net.*` in the status line, retry button, `intake.net.fallback` after two failures.
- **Draft:** `sessionStorage["wm-intake-v1"]`, saved 300 ms after input, restored on load, cleared on success.
- **Step 4 (confirmation, deck §9.7):** title `intake.done.title` (Basteleur `--fs-h3`), lede, summary paragraph (fragments in ink-2, visitor's quoted words in ink, « » in FR and ES, “ ” in EN; quotes over 240 characters clipped with `intake.sum.more`), hairline, fit line, `intake.done.next` (data path drops its first sentence), `intake.done.ref` (`data-qa="intake-ref"`) + `intake.done.again`, one suggested read per path, `StepsLine done={1}`, `Button variant="secondary"` `intake.done.home`. No other button.

### 8.5 Intake without JS

The same form renders as one long form: all three steps visible in order, step 2 groups shown or hidden by `form:has(input[name="path"][value="tool"]:checked) [data-path-group="tool"]` (no `:has` support: all groups visible under their legends, harmless). No HTML `required` attributes (they would block hidden groups); the server is the validator. On POST, `/contact` (or `/en/contact`, `/es/contact`) reads `Astro.request.formData()` (after a `Content-Length` ≤ 16 KiB check), calls `processIntake(parseForm(form), { js: false, kind: "brief", ... })` and renders either the confirmation (same copy plus `intake.done.nojs` under the title, `data-qa="intake-done"`) or the form again with the error summary (`role="alert"`) and every value kept. A missing, forged or stale token re-renders the form with a fresh token and `intake.net.invalid` (no-JS has no silent retry). `parseForm` maps the flat names (`fields.problem`, `contact.name`, `contact.value.<channel>`, `consent=on`) to the JSON shape of §8.3. A reload of the confirmation resubmits the same token and returns the same reference (idempotency).

### 8.6 Ghosts « Préviens-moi »

`GhostsNotify` (deck §9.10). Closed variant: `<details>` whose `<summary>` is the quiet text button `intake.ghosts.open` (JBM `--fs-mono`, ink-2, underline `--line-strong`); JS upgrades it to a `button[aria-expanded]` with the 200 ms reveal and fetches a token from `/api/intake/start?kind=ghosts` on open. Open variant (`/projets`): no disclosure. Field: label, input (`inputmode="email" autocomplete="email"`), hint, `Button variant="secondary" type="submit"` `intake.ghosts.submit`, fine print + `intake.ghosts.legal` link, honeypot, hidden `path=ghosts`, `locale`, `page`. JS: JSON POST, success replaces the form with `intake.ghosts.done` (`aria-live`, success glyph) and sets `sessionStorage["wm-ghosts-done"]` so the button does not return that session; errors `intake.ghosts.err.*`.

No JS: the form posts to `localePath(locale, "/projets") + "#ghosts"`. On that on-demand page, the open `GhostsNotify` instance handles the request itself: if `Astro.request.method === "POST"` and the form has `path=ghosts`, it reads `formData()`, calls `processIntake(..., { js: false, kind: "ghosts" })` and renders its done or error state. Exactly one instance per page handles POSTs (the open one). No ref is shown for ghosts.

---

## 9. Contracts to preserve

### 9.1 Must stay byte-identical or behaviour-identical

| Contract | Rule | Check |
|---|---|---|
| Reports | `src/lib/reports.ts`, `src/pages/api/reports.ts`, `src/pages/r/[id].ts` untouched; `REPORTS_DIR`, token, id regex, noindex header, node standalone adapter | `git diff --exit-code main -- <3 files>` + runtime smoke (§11) |
| Annotation overlay | `AnnotationOverlay.astro` and `/api/prototype-feedback` untouched and rendered when `ANNOTATION_SYSTEM=true`; no global rule may restyle `#proto-chrome` or `.proto-*`; our z-indexes stay ≤ 100 (overlay uses 9999+); the dock's `backdrop-filter` must not contain the overlay (it is a sibling at the end of body) | §11 |
| Robots in review | `ANNOTATION_SYSTEM=true` adds `<meta name="robots" content="noindex, nofollow">` on every page | §11 |
| Routing and i18n | FR unprefixed, `/en` `/es` prefixed, French slugs, `trailingSlash: "never"`, hreflang + x-default, 404 FR only, writing slugs unchanged | build output check |
| i18n shape | FR canonical, EN and ES same shape (enforced by `Widen`) in `ui.ts` and every namespace | `astro check` |
| RSS | three feeds, head alternates, footer link; retitled through `ui.rss` (« William Moiré : écrits », deck §13.2) | build output |
| Registry and `/lego` | `registry.json` paths exact; if a registry-referenced file changes meaning, moves or is retired, its entry is updated in the same package. WP1 owns `registry.json` and writes the final version in WP1a (below) | JSON path existence check after WP2 to WP5 |
| Umami | same script, adds `data-domains="wmmw.sh"` (preview traffic not counted) | head check |
| Sitemap | excludes `/lego`, `/lab`, `/nourritures`, `/lectures-sf`, `/404` (all locales); **adds `customPages`** for the on-demand routes `/contact`, `/en/contact`, `/es/contact`, `/projets`, `/en/projets`, `/es/projets` (the sitemap integration only lists prerendered pages) | `dist/client/sitemap-0.xml` |
| SEO | canonical, OG, Twitter, JSON-LD (WP5), `og:site_name` "William Moiré", `llms.txt` refreshed (WP5) | head check |

### 9.2 Retirements and content fixes

- **Physarum (owner Q1):** delete `src/components/Mycelium.astro`, `src/lib/mycelium.ts`, `src/components/Hero.astro` (the 100dvh band) in WP1a. None is referenced by `registry.json`.
- **Terminal UI:** `TerminalPanel.astro`, `TermCmd.astro`, `term-type.ts` stay (registry) and render on `/lego` only; `/lego` calls `initTermTyping()` itself (WP1b). `TERM_USER` stays in `site.ts`.
- **`src/lib/site.ts` (WP1a):** `AUTHOR = "William Moiré"`, `BRAND_NAME = "William Moiré"`, `LEGAL_NAME = "William Lecompte"`, `ALYSIS_URL = "https://alysis.cat"`, `PLANB_URL = "https://planb.academy"`, `PLANB_PROFESSOR_URL = "https://planb.academy/professors/asi0-aa19b8be-5958-4c45-8be8-a1582dd5a90b"` (verify in a browser), `PLANB_REPO_URL = "https://github.com/PlanB-Network/bitcoin-educational-content"`, `GITHUB_HANDLE = "@Asi0Flammeus"`, `X_HANDLE = "@asi0_flammeus"`, `THEME_COLOR`, `PARKED_PATHS`; keep `SITE_URL`, `SITE_NAME = "wmmw.sh"`, `HANDLE = "asi0"`, `GITHUB_URL`, `X_URL`, `CONTACT_EMAIL = null`, `TERM_USER`.
- **Writing bodies (WP4):** remove every U+2013/U+2014 and prose `--` from `src/content/**` without changing meaning (parenthetical pairs become commas or parentheses; a dash before a clause becomes a colon or a full stop; numeric ranges become « 1 à 3 » / "1 to 3" / « 1 a 3 »). Files today: `29-languages-one-pr-{fr,en,es}`, `talking-to-silicon-{fr,en,es}`, `estimateur-de-pareto-fr`, `ce-rien-qui-peut-tout-{fr,en}` (drafts too: the lint scans `src/`), `hello-world-en` (`--`; also replace its dead crqpt `/telos/` links with plain text). Same cleanup in `src/components/blog/{Timeline,PeriodicTable,Poll,ZenCountdown}.astro` (comments included).
- **Blog components (WP4):** text that used `var(--accent)` moves to `var(--accent-text)`; `crqpt-compat.css` hues get a light set and a dark set (each ≥4.5:1 on its `--bg` for text uses, verified with the tool) under the same theme selectors as `tokens.css`.
- **Content collections (WP4):** delete `src/content/projects/*.json` and the `projects` collection (replaced by the `projets` namespace); replace tool blurbs with the deck's plain ones; manifesto edits §7.6.
- **Parked:** `nourritures` keys and page kept, noindex.

### 9.3 Merge checklist (not done on this branch)

- Production `docker-compose.yml`: add `INTAKE_DIR=/data/intake`, `INTAKE_TOKEN=${INTAKE_TOKEN:-}`, `INTAKE_SECRET=${INTAKE_SECRET:-}`, volume `wmmw-intake:/data/intake`; set `INTAKE_TOKEN` in `.env.prod` on the server.
- Never push to `main` from this branch (CI deploys prod). Never touch the running `wmmw` service, nginx, or the prod annotation buffer.
- Facts to re-verify on ship day (deck §14): commit count, MIN303 URL, professor URL, unfocus.art and holy-belleile.fr live, agricultural trader status, SIREN/SIRET/VAT, Scaleway phone, lazyagent install line.

### 9.4 `registry.json` final (WP1a)

Keep unchanged: `terminal-panel`, `timeline`, `poll`, `math`, `zen-countdown`, `periodic-table`, `periodic-column`, `annotation-overlay`, `reports-api`. Update descriptions: `tokens` (files `tokens.css`, `reset.css`, `fonts.css`; dependencies `@fontsource-variable/schibsted-grotesk`, `@fontsource-variable/jetbrains-mono`; "Lycurgus palette, light and dark, type scale a3, spacing, motion, glass"), `editorial-css` (files `global.css`, `prose.css`; "Base elements, primitives, prose, legacy editorial classes"). Add: `ui-primitives` (`src/components/ui/{Arrow,Button,Chip,PageHead}.astro`), `theme-toggle` (`ThemeToggle.astro`, `src/lib/theme.ts`), `monogram` (`Monogram.astro`, `MonogramDefs.astro`), `moire-field` (`src/components/moire/MoireField.astro`, `w1.ts`), `ghosts-lens` (`GhostsLens.astro`, `w2.ts`), `steps-line` (`src/components/visual/StepsLine.astro`), `five-strands` (`FiveStrands.astro`), `intake-inbox` (`src/lib/intake/*.ts`, `src/pages/api/intake/*.ts`; dependency `zod`; "Needs INTAKE_TOKEN and an INTAKE_DIR volume"). Targets follow the existing `src/components/wmmw/` convention. These paths are contracts: WP2 to WP5 must create files at exactly these paths.

---

## 10. Work packages

Sequencing: **WP1a alone** → **WP2, WP3, WP4, WP5 in parallel** → **WP1b** (integration). Each package ends with: `bun run check` and `bun run build` green, `node scripts/qa/copy-lint.mjs` green, its own checks from §11 green, screenshots at 932 × 553, 390 × 844, 1440 × 900 in both themes saved under `docs/moire/qa/<wp>/`.

**Strict ownership:** a file is edited by exactly one package. Reading any file is free. Files created by WP1a as stubs transfer to the listed owner when WP1a merges; WP1 never touches them again. Nobody edits a file not listed for their package; if you need a change in someone else's file, ask its owner.

**Owned by nobody, never edited on this branch:** `src/lib/reports.ts`, `src/pages/api/reports.ts`, `src/pages/r/[id].ts`, `src/components/AnnotationOverlay.astro`, `src/pages/api/prototype-feedback.ts`, `src/components/TerminalPanel.astro`, `src/components/TermCmd.astro`, `src/lib/term-type.ts`, `src/components/pages/NourrituresPage.astro`, `src/pages/nourritures.astro`, `src/pages/[lang]/nourritures.astro`, `src/content/nourritures/*`, the untracked `lectures-sf` files, `src/assets/william.jpg`, `public/images/*`, `Dockerfile`, `docker-compose.yml`, `deploy.sh`, `.github/workflows/deploy.yml`, everything under `docs/moire/explore/`.

### WP1 · Foundation (WP1a first and alone; WP1b last)

| WP1a owns and edits | |
|---|---|
| Config and deps | `package.json` (add `@fontsource-variable/schibsted-grotesk@^5.3.0`, scripts `qa:*`), `bun.lock`, `astro.config.mjs` (sitemap filter + customPages, `security.checkOrigin: false`, Shiki dual themes + comment transformer; keep everything else), `.github/workflows/ci.yml` (add copy lint and contrast steps) |
| Styles | `src/styles/tokens.css` (= `final-tokens.css`), `fonts.css` (new), `reset.css`, `global.css`, `prose.css` (new) |
| Layout and chrome | `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `Footer.astro`, `ThemeToggle.astro`, `Monogram.astro`, `MonogramDefs.astro`, `src/components/ui/{Arrow,Button,Chip,PageHead}.astro` |
| Lib | `src/lib/site.ts`, `src/lib/theme.ts` |
| i18n | `src/i18n/index.ts`, `define.ts`, `ui.ts` |
| Assets | add `public/fonts/btc-piazzolla-380.woff2`; delete `public/fonts/basteleur-bold.woff2` |
| Retire | delete `src/components/Mycelium.astro`, `src/lib/mycelium.ts`, `src/components/Hero.astro` |
| Registry | `registry.json` (final, §9.4) |
| QA harness | `scripts/qa/*` (§11) |
| Stubs (transfer) | `src/components/visual/StepsLine.astro` → WP2, `src/components/visual/FiveStrands.astro` → WP2, `src/components/intake/GhostsNotify.astro` → WP3, `src/lib/jsonld.ts` → WP5 |

WP1a compatibility duties (so the other packages start from a green build): keep the deprecated BaseLayout props; keep legacy keys in `ui.ts`; keep legacy primitives in `global.css` (`.sec .sec-inner .offset-l .offset-r .sec-head .disp-h .sec-intro .arrow-link .rows .row-item .meta-label .reveal(no-op) .wrap .sr .skip`) restyled with the new tokens, permanently (parked pages and registry `editorial-css`); keep every exported constant of `site.ts`.

| WP1b owns and edits | |
|---|---|
| Cleanup | `src/i18n/ui.ts` (delete the legacy block except `nourritures` and `meta.nourritures`), `src/i18n/index.ts` (empty `LEGACY_KEYS`) |
| `/lego` | `src/pages/lego.astro`: tokens in both themes (islands), type specimen, Button/Chip/Arrow/PageHead/ThemeToggle/Monogram, StepsLine, FiveStrands, GhostsLens, GhostsNotify (closed), blog components, TerminalPanel (legacy, with a local `initTermTyping()` call), every block labelled with its registry id |
| Final QA | runs all of §11, files issues to owners, verifies every `registry.json` path exists |

### WP2 · Home and the moiré

| Owns | |
|---|---|
| Pages | `src/components/pages/HomePage.astro` (rewrite), `src/pages/index.astro`, `src/pages/[lang]/index.astro` |
| Home parts | `src/components/home/{HomeHero,RunningList,RunningRow,WorkBlock,LatestWritings,WealthLine}.astro` |
| Moiré | `src/components/moire/{MoireField.astro,w1.ts,GhostsLens.astro,w2.ts}` (Q2 lives in `RunningRow`) |
| Visuals (from stubs) | `src/components/visual/StepsLine.astro`, `FiveStrands.astro` (V1, V2 per deck §3.5; path data computed at build in frontmatter, no client JS) |
| i18n | `src/i18n/ns/home.ts` |

Uses (read only): `GhostsNotify` (WP3), `homeJsonLd` (WP5), UI primitives (WP1). Done when: fold test, word count, P3 and rAF checks green on home in 3 locales × 2 themes.

### WP3 · Contact, intake, inbox, legal

| Owns | |
|---|---|
| Pages | `src/components/pages/ContactPage.astro` (rewrite), `src/pages/contact.astro`, `src/pages/[lang]/contact.astro`, `src/pages/mentions-legales.astro`, `src/pages/[lang]/mentions-legales.astro`, `src/components/pages/LegalPage.astro` |
| Components | `src/components/intake/{IntakeForm,IntakeConfirmation,PathCards,ChannelFields}.astro`, `intake.client.ts`, `GhostsNotify.astro` (from stub), `ghosts.client.ts`, `intake.css`; `src/components/contact/{Gets,Elsewhere}.astro`; `src/components/legal/legal-{fr,en,es}.mdx` |
| Backend | `src/lib/intake/*.ts`, `src/lib/legal.ts`, `src/pages/api/intake/{index,[id],start}.ts` |
| i18n | `src/i18n/ns/{contact,intake,legal}.ts` |
| Ops files | `.gitignore`, `.env.example`, `docker-compose.moire.yml` |

Done when: intake JS and no-JS tests, API tests, ghosts tests green; legal page renders with no placeholder.

### WP4 · Projets, outils, écrits, manifeste, content

| Owns | |
|---|---|
| Pages | `src/components/pages/{ProjetsPage,OutilsPage,EcritsIndexPage,EcritPostPage,ManifestePage}.astro`; routes `src/pages/{projets,outils,manifeste}.astro`, `src/pages/[lang]/{projets,outils,manifeste}.astro`, `src/pages/ecrits/{index,[slug]}.astro`, `src/pages/[lang]/ecrits/{index,[slug]}.astro`, `src/pages/rss.xml.ts`, `src/pages/[lang]/rss.xml.ts` |
| Components | `src/components/projets/*`, `src/components/outils/*` (incl. `CopyLine.astro`), `src/components/ecrits/*`, `src/components/blog/*.astro` (dash cleanup, token migration) |
| Content | `src/content/**` (writings, manifeste, tools; delete projects), `src/content.config.ts` |
| Styles and lib | `src/styles/crqpt-compat.css`, `src/lib/writings.ts`, `src/lib/feed.ts` |
| i18n | `src/i18n/ns/{projets,outils,ecrits,manifeste}.ts` |

Note: `ecrits.copy/copied` and `outils.copy/copied` hold the same values; `CopyLine` takes its labels as props so both pages reuse it.

### WP5 · 404, lab, identity assets, metadata docs

| Owns | |
|---|---|
| Pages | `src/pages/404.astro`, `src/pages/lab.astro` |
| Assets | `public/favicon.svg`, `public/apple-touch-icon.png`, `public/og/default-{fr,en,es}.png`, `public/lab/**`, `src/assets/og/og.html`, `src/lib/lab-data.json` |
| Scripts | `scripts/lab-assets.mjs`, `scripts/og-render.py` |
| Lib (from stub) | `src/lib/jsonld.ts` (deck §13.3, localised `jobTitle` and `description`, no real name) |
| Docs | `public/llms.txt` (William Moiré identity, current pages without nourritures, languages, RSS; UTF-8 é), `PRODUCT.md` (replace "The organism is the signature" with "The moiré answers the visitor, then rests"; "Mono is seasoning" with the a3 roles; palette Lycurgus; focus ring ruby; anti-references kept), `README.md` (intake env and QA commands) |
| i18n | `src/i18n/ns/notFound.ts` |

---

## 11. Acceptance tests

QA server (local): `bun run build && HOST=127.0.0.1 PORT=4321 INTAKE_TOKEN=qa INTAKE_DIR=/tmp/wm-intake INTAKE_MIN_BRIEF_MS=300 INTAKE_MIN_GHOSTS_MS=300 REPORTS_TOKEN=qa REPORTS_DIR=/tmp/wm-reports node dist/server/entry.mjs`. Browser checks use Python Playwright with `QA_CHROMIUM` (default `/home/crqpt/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`, the same browser as `shoot.py`). All scripts live in `scripts/qa/` (WP1a) and exit non-zero on failure.

| # | Check | Script | Pass condition |
|---|---|---|---|
| T1 | `astro check` + build | `bun run check && bun run build` | 0 errors |
| T2 | Contrast table | `node scripts/qa/contrast.mjs` | every pair of §1.3 meets its minimum; the two forbidden pairs are reported as forbidden; a grep proves no CSS sets `color: var(--ink-3)` on an element whose background is `--surface-2` (lint rule on component CSS) |
| T3 | Copy lint | `node scripts/qa/copy-lint.mjs` | no U+2013/U+2014 in `src/` and `public/` (all files); no box drawing U+2500 to U+257F; no prompt glyphs (`~$`, `❯`, `^\$ ` lines, `asi0@`) outside the allowlist `TerminalPanel.astro`, `TermCmd.astro`, `term-type.ts`, the `TERM_USER` line of `site.ts`; no prose `--` in MDX (outside frontmatter, fenced and inline code; a line of exactly `---` is allowed); also scans built HTML of every public route except `/lego` for the same patterns |
| T4 | Fold | `python3 scripts/qa/fold.py` | for `/`, `/en`, `/es` at 932 × 553, 390 × 844, 1440 × 900, light and dark: `[data-qa=now-heading]` and the first `[data-qa=now-row]` have `getBoundingClientRect().bottom ≤ innerHeight` |
| T5 | Home words | `python3 scripts/qa/words.py` | FR home: clone `main`, remove `.sr`, `[aria-hidden=true]`, closed `<details>` content; split on whitespace; drop tokens without a letter or digit; count ≤ 140. Also no sentence over 10 words |
| T6 | No theme flash | `python3 scripts/qa/theme.py` | for `light`/`dark` system × stored `light`/`dark`/none: at `DOMContentLoaded`, `html[data-theme]` is the expected theme and `getComputedStyle(html).backgroundColor` is that theme's bg; in built HTML the inline theme script precedes every `<style>` and `<link rel=stylesheet>`; after a ClientRouter navigation `data-theme`, `js`, `anim` survive; clicking the toggle persists across reload |
| T7 | No rAF after settle | `python3 scripts/qa/motion.py` | init script wraps `requestAnimationFrame` and logs timestamps; on home (desktop 1440, fine pointer): move the pointer through the hero, drag the Ghosts lens, hover a row; wait 1000 ms; zero rAF calls in the last 600 ms. Same with `reduced_motion="reduce"`: zero rAF calls at all from W1 and W2 |
| T8 | Nothing moves behind text (P3) | `python3 scripts/qa/motion.py` | after W1 goes live and after three pointer positions, `window.__moire.w1.checkClearZones()` returns 0; for every `[data-moire-layer]` other than W1, its rect grown by 16 px does not intersect any text node rect in `main` (TreeWalker over text nodes, excluding text inside the layer and `aria-hidden` subtrees); figures (V1, V2) overlap no text rect at 0 px |
| T9 | Intake with JS | `python3 scripts/qa/intake.py --js` | `/contact?chemin=outil` opens at step 2; complete tool path; confirmation shows title with the name, quoted problem, fit line `budget-open` for budget "unsure", a reference; one new file in `INTAKE_DIR` with the deck §9.8 shape and no IP field; `/es/contact?chemin=autre` works too |
| T10 | Intake without JS | `python3 scripts/qa/intake.py --nojs` | `java_script_enabled=False`; fill and submit the long form; 200 page with `[data-qa=intake-done]` and `intake.done.nojs`; reload repost returns the same reference and no second file; a submission missing `fields.problem` re-renders the form with the error summary and keeps typed values |
| T11 | API | `python3 scripts/qa/intake.py --api` | honeypot → 201 and no file; no token → 400; stale token → 409 with `started`; 17 KiB body → 413; 4th brief in 10 min from one forwarded IP → 429 + `Retry-After`; `Origin: https://evil.example` → 403; `GET /api/intake` without Bearer → 401, with Bearer lists the id newest first; `GET /api/intake/<id>` returns the record; `DELETE` removes the file; ghosts duplicate → 201, still one entry |
| T12 | Ghosts | `python3 scripts/qa/intake.py --ghosts` | home: open, submit an email → done line, one `path: "ghosts"` file; no JS: home form posts to `/projets#ghosts` and renders the done line |
| T13 | Contracts | `bash scripts/qa/contracts.sh` | `git diff --exit-code main -- src/lib/reports.ts src/pages/api/reports.ts 'src/pages/r/[id].ts' src/components/AnnotationOverlay.astro src/pages/api/prototype-feedback.ts`; POST `/api/reports` with token → 201, `GET /r/<id>` → 200 with `X-Robots-Tag: noindex`; every `registry.json` path exists; sitemap contains `/contact` and `/projets` (3 locales) and excludes `/lego`, `/lab`, `/nourritures` |
| T14 | Annotation overlay | `bash scripts/qa/annotation.sh` | `ANNOTATION_SYSTEM=true bun run build`: `dist/client/index.html` contains `id="proto-chrome"` and `<meta name="robots" content="noindex, nofollow">`; default build: neither |
| T15 | Head | `bash scripts/qa/head.sh` | every page: one `<h1>`, `meta[name=color-scheme][content="light dark"]`, two `theme-color` metas with media, Basteleur preload only, Umami with `data-domains="wmmw.sh"`, `og:site_name` "William Moiré", canonical; home has the JSON-LD Person named "William Moiré" without "Lecompte" |
| T16 | Screenshots | `python3 scripts/qa/shots.py` | every route × 3 viewports × 2 themes + reduced motion + JS off, written to `docs/moire/qa/latest/` for the manual review |

### Manual review checklist (owner and art direction, on the Fold with `ANNOTATION_SYSTEM=true`)

- [ ] Five-second test (P1): three people who do not know William name him and one thing he does.
- [ ] The W1 field answers the pointer and rests; it never touches text; it reads as one calm interference, not a texture.
- [ ] The Ghosts lens is findable, playful, and the word « Ghosts » reads without it.
- [ ] Light and dark both feel finished, outdoors and at night; no Christmas, no candy.
- [ ] The dock reads as glass over the hero and stays legible over scrolled text.
- [ ] Exactly one primary loupe per page where one exists (`/contact` step 3, `/projets` tools); none on home.
- [ ] The intake feels like a conversation; the confirmation is honest (no "I understood"); no booking link anywhere.
- [ ] Basteleur never below 20 px, never clipped, never bold; ₿ looks right in « Plan ₿ Academy » in every face.
- [ ] Every "→" and "↗" is an SVG and aligned on the text baseline.
- [ ] French spacing (U+202F) present in FR; apostrophes curly everywhere.
- [ ] No photo outside `/contact`; portrait small; no physarum; no terminal on public pages.
- [ ] `/lab` shows G1, G2, the 15 candidates, Lycurgus marked, the pairings, working prototype links.
- [ ] Keyboard only: skip link, dock, toggle, rows, chips, lens slider, every intake step, focus always visible.
- [ ] Screen reader pass (VoiceOver or TalkBack) on home and the intake.
- [ ] `/mentions-legales` shows no placeholder and the owner confirms the address, mediator and phone decisions.

---

## 12. Pourquoi cette direction (pour William)

Ton nom dit déjà le design : deux trames distinctes, un motif qui n'existe qu'entre elles.
La coupe de Lycurgus fait pareil avec la lumière : jade de face, rubis à contre-jour, une seule matière.
Le rubis ne sert qu'à une chose, agir ; tout le reste respire en verre jade, clair ou sombre, sans fatiguer l'œil.
Basteleur porte ton nom, Schibsted porte la lecture, JetBrains Mono garde ton côté nerd pour les petits repères.
Le moiré ne vit qu'à deux endroits, ton é et la loupe des Ghosts : il répond au visiteur, puis se tait.
La page d'accueil tient en moins de 140 mots et montre ce qui tourne avant même qu'on fasse défiler.
Un seul vrai bouton, au bout d'une conversation qui qualifie la demande au lieu d'un formulaire vide.
Rien ne bouge derrière le texte : l'expertise se sent dans la retenue.

---

## 13. Errata (2026-10-18, binding, supersedes the sections cited)

Revision 2 announces an Appendix B listing the rejected critiques; it was never written. Rule: **every item of `critique-engineering.md` applies as written unless this spec explicitly addresses the same point with a different decision.** The brief critique (`critique-brief.md`) was absorbed through decisions A5 to A18 and needs no errata. Items confirmed missing from revision 2, binding:

- **E1 (§7.2, §7.7).** An on-demand route never calls `Astro.rewrite("/404")`: Astro 6 throws `ForbiddenRewrite` when an on-demand route rewrites to a prerendered one, which turns every bad-locale URL into a 500. Use `return new Response(null, { status: 404 })`; the node adapter serves `404.html`. T13 adds: GET `/xx/contact` and `/xx/projets` return 404 with the 404 page's h1.
- **E2 (T3, §10 gates).** Copy lint scans text extensions only (`.astro .ts .mjs .js .css .md .mdx .json .html .svg .txt .xml .yml`). `copy-lint.mjs --owned <globs>` is the package gate; the full-tree scan runs in WP1b and CI only.
- **E6 (§8.2, §11).** Every `INTAKE_*` value is read through `process.env` at call time (as `reports.ts` does), never `import.meta.env`. No `NODE_ENV` rule. Token: `payload = "${ts_ms}.${kind}.${locale}"`, `sig = base64url(HMAC-SHA256(secret, payload))`, `started = base64url(payload + "." + sig)`. The intake page and GhostsNotify embed `data-min-ms` from env and the client waits on it. T11 sends `Origin` on every request.
- **E7 (§8.1, §8.6).** Server intake modules are loaded with `await import("@lib/intake/process")` inside the POST branch only. No `src/lib/intake/*` module has top-level side effects; the retention sweep starts lazily on the first read or write.
- **E9 (§8.6).** `ghosts.client.ts` follows the brief's rule: busy state, wait out the remaining `data-min-ms`, fetch a fresh token at submit when the current one is older than 2 h.
- **QA port (§11).** Port 4321 is production on this server, and 4321 to 4329 and 4360 to 4371 are other live services. Every QA script reads `QA_PORT` (default 4781) and the QA server env uses `PORT=$QA_PORT` and `INTAKE_ALLOWED_ORIGINS=http://127.0.0.1:$QA_PORT`. Packages building in parallel get distinct ports (WP2 4782, WP3 4783, WP4 4784, WP5 4785).
- **Host speed.** The build server is shared and often heavily loaded; headless Chromium is slow there. Keep browser sweeps targeted (one browser per run, only the routes and viewports the check needs), and wrap long commands in `timeout`.
