# Moiré lab: W1, W2, Q1, Q2, Q3

Prototypes for the five moiré moments of dossier §9 (`docs/moire/01-brand-analysis.md`), now on the locked
palette and type: OPTICS5 "Lycurgus" (`explore/palettes/optics/palettes.json`) and pairing a3
(Basteleur Moonlight with `ss01`, Schibsted Grotesk Variable, JetBrains Mono Variable; `explore/type/system.html`).
Copy comes verbatim from `explore/copy/copy-deck.md`. Every file opens straight from disk (`file://`).
Verified 2026-10-17 in Chromium 1243 (Playwright).

## Files

| File | What it is |
|---|---|
| `tokens.css` | Shared tokens: font faces, Lycurgus light/dark, type scale, base, header and row context. The site's global stylesheet must provide the same names. |
| `w1-hero.html` | W1 "é source": two-source ring interference, WebGL2 single quad, static CSS frame. `mountW1(hero)` |
| `w2-ghosts.html` | W2 Ghosts lens: a slit lens over a squeezed ghost base. `mountW2(box)` |
| `q1-toggle.html` | Q1 theme toggle: two 2 px gratings in a 20 px disc, half moon in dark. Theme boot script. |
| `q2-row.html` | Q2 running-row strip: CSS only, two line layers, hover or focus turns one from 4° to 1.2°. |
| `q3-monogram.html`, `monogram.svg`, `favicon.svg`, `og.svg` | Q3 monogram (line mark, solid mark), favicon, 1200 × 630 OG source. Built by `_qa/build_q3.py`. |
| `fonts/` | Basteleur Moonlight, `btc-piazzolla-380.woff2` (₿ only, 804 B), Schibsted Grotesk and JetBrains Mono (latin and latin-ext, from @fontsource-variable 5.x). `basteleur-bold` and `instrument-sans-*` are leftovers that nothing loads now. |
| `shots/v2/` | QA screenshots of this pass (`shots/v1-neutral/` holds the previous run on the neutral lab palette). |
| `_qa/` | Scripts: `batch.py` (screenshots, `jobs-*.json`), `measure_virtual.py` (loop audit on a virtual 60 Hz clock), `measure.py` (real-clock cost), `measure_settle.py` (real-clock stop check), `a11y.py` (forced colors, no JS, theme switch, remount), `build_q3.py`. `*.prev.html` are the versions before the interrupted re-run. |

Lab URL flags: `?theme=light|dark`, `?bare` (hides the lab bar), `?rm` (forces reduced motion), and per file: W1 `?debug` (clear zones and source), `?model=literal`, `?lerp=`, `?probe`; W2 `?ghost=accent`; Q1 `?a=8`.

## Tokens the moiré reads

Only two tokens. Both are already in `tokens.css`:

| Token | Light | Dark | Source |
|---|---|---|---|
| `--fringe` (opaque line colour) | `oklch(.50 .07 172)` | `oklch(.78 .08 172)` | palette `fringe` hue without its alpha |
| `--fringe-a` (peak line alpha) | `.08` | `.06` | §9 cap. palettes.json ships `.09` in light, the lab clamps it to `.08` |

`docs/moire/final-tokens.css` already defines both tokens with these exact values, and the same font family names.

Every line layer (W1 field, W2 base and lens grating, Q2 strip) peaks at `--fringe-a`, so all of them sit inside the
§9 limits (light .05 to .08, dark .04 to .06). Measured on the W1 screenshots (6 px blur, settled frame): fringe luminance
delta 0.060 in light (5 to 7 % relative), 0.003 absolute in dark. Both stay under the 0.10 ceiling. The W2 figure
inside the lens (the revealed ghosts) is content, not a field: it is painted in `--fringe` through 1.7 px slits.

---

## W1 · Hero "é source" (wow)

**Behaviour.** Grating A (6 px rings, snapped to device pixels) is centred on the acute accent of the é. The JS measures
the accent from the rendered ink: it diffs `é` against `e` on a canvas and takes the centroid, giving .313 em right of the
glyph origin and .743 em above the baseline, which matches the type report. `ss01` leaves the lowercase é alone, so the
canvas measure (which has no `font-feature-settings`) stays valid. Grating B has pitch `p2 = p1·r`. Its centre is driven
by the smoothed pointer C through the moiré magnifier: `B = A − (C − A)(r − 1)`. The zero-order fringe then runs
through the é and the pointer, and every fringe keeps a radial period of 260 px on desktop and 206 px below 768 px.
Moving B to the raw pointer would draw about 130 hyperbolae; see `?model=literal`. The field is masked to zero around
every text line and fades out 600 to 950 px from the é, which leaves at most 3.7 fringe pairs on desktop and 4.6 below 768 px.
Lerp is 0.16 per 60 Hz frame, dt-corrected with dt capped at 64 ms. Fine pointers follow the cursor. On touch, a tap
inside the hero moves the source, and a scroll (`pointercancel`) does not.

**Changes in this pass.**
- Lycurgus tokens. Copy from the deck: the aside now reads « Physicien devenu développeur indépendant. Aussi connu comme asi0. », and rows take their deck lines.
- Type report scale: the name is `--fs-hero` on one line, with 16.5vw on two lines at ≤ 560 px.
- Wordmark in JBM 700. Arrows are inline SVG.
- **Profile.** The rings are now 50 % duty soft squares. Edges are at least one device px wide, and the profile flattens to its mean before Nyquist. It replaces raised-cosine². The fringe of an AND of two gratings scales with the square of their fundamental, so at the same .08 peak alpha the fringe is about 2× more legible. The cos² fringe was 4/255 levels, which disappears on ordinary screens. The CSS frame uses the same profile.
- **Shader.** `fwidth` is now analytic (|∇v| = 1/pitch along the radius), so pixels outside the vignette or inside text zones return before any ring math. The output is pixel-identical (max diff 1/255).
- The clear zone starts at 16 + 1 px, so pixel centres on the 16 px line read 0. `checkClearZones()` now returns `0`.
- **Static halos.** They now have a long Gaussian falloff (`0 0 56px 30px var(--bg)`). The old 22 px falloff drew visible boxes in dark mode. They are also scoped to the hero, plus the header on the home page through `:has(.w1)`. The toggle sits above its neighbours' halos.
- `destroy()` loses the context, then swaps in a fresh canvas. A lost context sticks to its canvas, so before this fix a remount on the same node stayed static.

**Measured cost.**

| Test | Result |
|---|---|
| Virtual 60 Hz clock, 1440×900, 300 ms gesture (18 moves) | 48 rAF callbacks in 3.3 s, 29 after the last move. **Loop stops 459 ms after the last move**, 0 callbacks in the last 1.5 s |
| Same, one jump of about 350 px (touch-like) | 34 frames, stops after 543 ms |
| Same, Fold 932×553 | 45 frames, stops after 408 ms |
| Real clock, 1440×900@1, canvas 1440×499 | **CPU per frame 1.18 ms mean** (lerp, uniforms, draw submit). rAF callback 2.55 ms mean |
| Real clock, stop check (`measure_settle.py`) | 22 frames to settle, then **0 rAF in the next 3 s** |
| Theme switch | exactly 1 frame (alpha .08 → .06) |
| Text clear zones (GPU readback, rect + 16 px) | max alpha 0 |

GPU time could not be measured on this host. It has no GPU (ANGLE on SwiftShader) and ran at load average ~70 on 8 cores.
One GPU-fenced frame cost about 600 ms, against 37 ms for an empty clear plus readback on the same canvas. That is why the
real-clock settle took 4.2 s: the loop converges by frame count, because dt is capped. The shader work per frame is 0.72 Mpx
at DPR 1 and 2.9 Mpx at DPR 2 (capped), with a 12-rect smooth union and two ring evaluations per lit pixel. **Before ship:**
run `__w1.bench(30)` in the lab on the Fold and on a mid laptop (it fences with a 1 px readback). Target: under 4 ms per frame at DPR 2.

**Accessibility.**
- `prefers-reduced-motion: reduce` (and `html.rm`): WebGL never starts, and the static CSS frame stays. It switches to static live if the preference changes.
- `forced-colors: active` and print: field and static frame hidden, halos removed.
- No JS: the server-rendered CSS frame, which has the same composition as the WebGL rest frame, with page-coloured halos keeping text clear.
- WebGL missing or context lost: static frame, then a relaunch on `webglcontextrestored`.
- Everything is `aria-hidden`. Nothing needs a pointer. Hidden tabs and an off-screen hero stop the loop (`visibilitychange`, IntersectionObserver).

### W1 integration notes (Astro)

**Component** `src/components/moire/HeroSource.astro` plus module `src/lib/moire/w1.ts`. For the module, copy `mountW1`
from `w1-hero.html` without the "QA hooks (lab only)" block, and keep the QA hooks behind `import.meta.env.DEV`.

Props:

| Prop | Type | Source |
|---|---|---|
| `name` | string | `home.hero.h1` « William Moiré ». The component splits the last character into the source span. If the name does not end in « é », render plain text and omit `data-w1`. |
| `sub` | string | `home.hero.sub` |
| `aside` | string | `home.hero.aside` |
| `period` | number = 260 | `data-period` (desktop fringe period, px) |
| `periodNarrow` | number = 206 | `data-period-narrow` (below 768 px) |

Static frame markup (server-rendered, works without JS):

```astro
<section class="w1" data-w1 data-period={period} data-period-narrow={periodNarrow}>
  <div class="w1-field" aria-hidden="true"><canvas></canvas></div>
  <div class="wrap">
    <h1 class="w1-name" data-w1-mask>{name.slice(0, -1)}<span class="w1-src">{name.slice(-1)}</span></h1>
    <p class="w1-sub" data-w1-mask>{sub}</p>
    <p class="w1-aside" data-w1-mask>{aside}</p>
  </div>
  <div class="w1-fade" aria-hidden="true"></div>
</section>
```

- **CSS.** Copy the `/* ===== W1 hero ===== */` block. The `.w1-src::before` pseudo-element is the static frame: two `repeating-radial-gradient`s ANDed with `mask-composite: intersect` (`-webkit-mask-composite: source-in`), opacity `var(--fringe-a)`, centred at `--src-x: .313em; --src-y: .057em`. Basteleur sets USE_TYPO_METRICS, so the inline box top is the .8 em typo ascent.
- **Changing the period.** Recompute the static frame: `r = P / (P − 6)`, `--p2 = 6r`, `--bx = −90(r − 1)`, `--by = −140(r − 1)`. The rest offset of C is (90, 140).
- **Header.** `margin-top: -72px` and the padding assume a 72 px header. Use a `--head-h` token. The field runs under the header and fades out at the page top.
- **Header masks.** Add `data-w1-mask` to the wordmark, the nav link group and the language group in the layout header. The halo rule only applies when `.w1` exists (`:root:not(.w1-live):has(.w1) .head [data-w1-mask]`). Give the theme toggle `position: relative; z-index: 1`.
- **Never** put `overflow: hidden` or `background-clip: text` on the name line: accents rise above Basteleur's ascent. `.w1` uses `overflow: clip` on the section, far from the glyphs.

**Life cycle with ClientRouter.** Load the moiré code from a script in the layout, so the listeners exist from the first load.
Import the module only where the element exists:

```ts
// src/scripts/moire.ts, imported once by Layout.astro
const live: { destroy(): void }[] = [];
document.addEventListener("astro:page-load", async () => {
  const w1 = document.querySelector<HTMLElement>("[data-w1]");
  if (w1) { const { mountW1 } = await import("../lib/moire/w1"); if (w1.isConnected) live.push(mountW1(w1)); }
  const w2 = document.querySelector<HTMLElement>("[data-w2]");
  if (w2) { const { mountW2 } = await import("../lib/moire/w2"); if (w2.isConnected) live.push(mountW2(w2)); }   // reads data-label
});
document.addEventListener("astro:before-swap", () => { live.splice(0).forEach((m) => m.destroy()); });
```

- `destroy()` aborts every listener (one AbortController), disconnects the Intersection, Resize and Mutation observers, cancels rAF, frees the GPU (`WEBGL_lose_context`), swaps in a fresh canvas and removes `w1-live`. Do **not** add `w1-live` to the `astro:before-swap` class carry-over; only `anim` and `data-theme` travel.
- Init is lazy. Fine pointers wait for `document.fonts.ready`, then `load`, then `requestIdleCallback` (timeout 1.5 s). Coarse pointers wait for the first tap. LCP is never delayed: the static frame is the LCP-time picture.

**How the mask avoids text boxes.**
1. On go-live and on every hero resize (ResizeObserver), each `[data-w1-mask]` element is read through `Range.selectNodeContents().getClientRects()`.
2. Fragments are merged per rendered line (same top within half a line height), which gives one rect per line in hero-relative CSS px. Rects outside the hero band are skipped, and at most 12 go into `uniform vec4 uR[12]`.
3. The shader takes `sdBox` per rect and folds them with a smooth min (k = 48 px). Neighbouring lines melt into one soft clearing, never boxes. Alpha is `smoothstep(17, 80, d)`: exactly 0 within 16 px of any line box (P3), full 80 px away.
4. Without WebGL, the same elements get the page-coloured halo.
5. Text that reflows without resizing the hero (late font swap) is covered because go-live waits for `document.fonts.ready`.

**How the theme switch updates uniforms.** `readTokens()` reads `--fringe` and `--fringe-a` from `getComputedStyle(:root)`.
It resolves the colour to sRGB by painting it into a 1×1 2D canvas, so `oklch()` works, then sets `uInk` (vec3) and `uAlpha` (float).
Two triggers call it, then exactly one `draw()`:
- a MutationObserver on `<html>` attributes `data-theme`, `class` and `style`;
- the `(prefers-color-scheme: dark)` change event.

The Q1 view transition captures the new frame, because the observer microtask draws before the "new" snapshot. Nothing else
in W1 knows about themes.

**Budget.** No dependency, no three.js. JS: 10.2 KB minified, **4.2 KB brotli**. That drops to 3.8 KB if the GLSL comments
move out of the template literal; esbuild cannot strip them inside it. CSS: 2.9 KB minified, **0.85 KB brotli**. Ceiling:
5 KB brotli for JS and CSS together. It loads on the home page only, through the dynamic import.

---

## W2 · Ghosts lens (wow)

**Behaviour.** A 1D shape moiré in the Ghosts row only. The base layer is the ghost shape (dome, two eyes, scalloped hem)
squeezed into every 4 px band, drawn as a faint line layer. The lens carries slits at 4.25 px, which magnifies 17×. One ghost
period reads 68 px, and the ghosts run 16× faster than the lens, the other way. The lens paints the exact composite from its
position, which avoids rasterising two 4 px gratings over each other, a pattern that aliases at DPR 1.

Dragging moves the lens with lerp .35 while held. On release it eases (.2) to the nearest 4 px multiple, so both ghosts land
whole and centred. From 900 px/s of ghost speed they fade, down to 25 % at 2400 px/s: honest motion blur instead of strobing.
Keyboard: the lens is a `role="slider"` (arrows move 6 px, Shift or PageUp/PageDown move 40 px, Home and End). The heading
« Ghosts » and its line stay readable without the lens.

**Changes in this pass.**
- Lycurgus. The base and lens grating now peak at `--fringe-a`; the base used to be 2.6× that, which broke the §9 cap.
- Deck copy, with « Préviens-moi » as a `<details>` in the text column (lab context, §9.10 strings).
- The lens column narrowed to `clamp(220px, 24vw, 340px)` so the line stays on one row at 1440.
- The lens is top-anchored, so opening the field never moves it.
- Hover border affordance.
- Mobile row layout. `destroy()` also removes the `aria-label` it set.

**Measured cost.**

| Test | Result |
|---|---|
| Virtual 60 Hz clock, 120 px drag over 300 ms | 50 frames, 31 after release. **Loop stops 484 ms after release**, 0 in the last 1.5 s |
| Real clock, 1440×900, 1.25 s drag plus 3 s | 74 rAF callbacks, **mean callback 0.39 ms**, mean interval 19.2 ms (52 fps on the loaded host). Last callback 205 ms after release, 0 in the last 1.5 s |
| Real clock, stop check | 66 frames, settled 439 ms after release, **0 rAF in the next 3 s** |

Per frame, the loop writes three custom properties (`--L`, `--gx`, `--reveal`) and one `aria-valuenow`. Style and paint stay
inside the 136 × 88 px lens. No WebGL.

**Accessibility.**
- Reduced motion: no easing. Drag and keys jump straight to the target, and the rest frame (whole ghosts, revealed) is what shows.
- Forced colors and print: the strip is hidden, the slider leaves the accessibility tree, and the row text remains.
- No JS: the CSS rest frame (`--L: 56px; --gx: 0px`) shows as a picture, with no role and no tab stop.
- `touch-action: pan-y` keeps vertical page scroll on touch. Pointer capture holds the drag.

### W2 integration notes (Astro)

**Component** `src/components/moire/GhostsLens.astro` plus `src/lib/moire/w2.ts` (copy `mountW2`). It is used in the
Ghosts row of « En ce moment » on home. On `/projets#ghosts` it is optional (§9: row or card only).

Props:

| Prop | Type | Note |
|---|---|---|
| `label` | string | The slider's `aria-label`. **The copy deck has no key for it.** Proposed key `ghosts.lens.label`: FR « Loupe à fantômes : fais-la glisser », EN "Ghost lens: drag it", ES « Lupa de fantasmas: deslízala ». Needs the copy owner's sign-off. |

```astro
<div class="gl" data-w2 data-label={label}>
  <div class="gl-base" aria-hidden="true"></div>
  <div class="gl-fade" aria-hidden="true"></div>
  <div class="gl-lens"><div class="gl-ghosts" aria-hidden="true"></div></div>
</div>
```

- **CSS.** Copy the `/* ===== W2 · Ghosts lens ===== */` block. The ghost is one `data:` SVG mask (`--ghost`), reused squeezed (4 × 78) in the base and magnified (68 × 78) in the lens.
- **Row grid.** `minmax(10rem, 16rem) 1fr clamp(220px, 24vw, 340px)`. The lens is `align-self: start`. Below 768 px the strip goes full width under the text. The « Préviens-moi » field lives in the text column and never overlaps the strip, which keeps the 16 px of P3.
- **Life cycle.** Same `astro:page-load` / `astro:before-swap` pair as W1 (above). `destroy()` aborts listeners, disconnects the ResizeObserver, cancels rAF, and removes inline properties and ARIA.
- **Theme.** Pure CSS tokens; nothing to update.
- **Budget.** JS 2.7 KB minified, **1.2 KB brotli**. CSS 2.4 KB minified, **0.84 KB brotli**. Ceiling 2.5 KB brotli.

---

## Q1 · Theme toggle (quiet)

**Behaviour.** A 32 px button with a 44 px hit area. Two 2 px gratings sit in a 20 px disc. In light, set B lies on set A:
one even hatch. In dark, set B turns 3° about the disc's left edge. The fringe (38 px) is about twice the disc, so it closes
into a half moon. 8° packs 1.4 fringes into the disc and reads as stripes; see `?a=8`. The theme crossfades over 200 ms
through View Transitions, scoped with `html.theme-vt` so it never retimes the ClientRouter's page transitions. The choice
persists in `localStorage("theme")`. Without a stored choice, the system preference is followed live. Labels come from the
deck: `theme.toDark` « Moins de lumière » and `theme.toLight` « Plus de lumière ».

**Accessibility.**
- Reduced motion: no rotation and no crossfade.
- Forced colors: a plain disc of lines (set B hidden) with a `ButtonText` ring.
- No JS: the button is hidden and the system preference applies.
- Transitions are gated by `html.anim`.

**Integration.**
- Put the head boot script `is:inline` before any stylesheet paints.
- Carry `data-theme` in `astro:before-swap` (`e.newDocument.documentElement.dataset.theme = …`), as in the lab.
- Re-run `label()` on `astro:page-load` if the header is not `transition:persist`.
- Keep the clipPath id unique if two icons ever share a page.
- **Budget:** JS 0.48 KB brotli, CSS 0.5 KB brotli.

## Q2 · Running-row strip (quiet)

**Behaviour.** CSS only. Each « En ce moment » link row gets `<span class="q2" aria-hidden="true">` in its own grid column,
between the line and the arrow. It never sits under text. Two 5 px line layers combine inside an isolated group that fades
to `--fringe-a`. Hover or focus turns layer B from 4° to 1.2° about the strip's left edge. The fringe widens from 72 px to
239 px and slides toward the arrow, over 0.7 s, transform only. The arrow nudges by 2 px. The Ghosts row has no strip,
because W2 lives there.

**Accessibility.**
- Reduced motion: no transition.
- Hidden on `hover: none`, below 768 px, in forced colors and in print.
- Gated by `html.anim`.

**Integration.**
- Row grid: `minmax(10rem, 16rem) 1fr clamp(96px, 12vw, 168px) auto`.
- Arrows are inline SVG symbols (`#i-ext` for external rows, plus the deck's `a11y.external` suffix; `#i-next` for internal rows).
- **Budget:** CSS 0.4 KB brotli.

## Q3 · Monogram (quiet, static)

**Behaviour.** The W·M mark is a 7-stroke zigzag. The W carries grating A (pitch 8/512), the M carries grating B (8.64/512),
and they meet only in the shared stroke, where the beat shows. Mirrored, it reads M·W (footer `WM | MW`).

**Changes in this pass.**
- Lycurgus colours. The OG uses Schibsted for its line, and Basteleur with `ss01` for the name.
- OG alt text from the deck: « William Moiré. Deux trames de lignes superposées, un troisième motif. »
- The footer `|` is a 1 px rule with a screen-reader `|`.
- **Size rule fixed.** The line mark aliases below about 3 px of line pitch, so it ships at **192 px and up** only (OG, `/contact`). The **footer signature now uses the solid mark at 32 px.** The 34 px line mark broke §9's "no fine-line moiré at 48 px and below" rule and rendered as grey mush.
- The palindrome pair is monochrome: the accent stays for action.
- `favicon.svg` is solid, with the ruby shared stroke and light/dark through `prefers-color-scheme`.

**Integration.**
- Inline the `<symbol>` set (`#wm-line`, `#wm-solid`) once in the layout. Colour comes from `currentColor` (plus `--mono-s` for the favicon stroke).
- `public/favicon.svg` as is.
- Rasterise `og.svg` to `og.png` at build with Chromium. It embeds woff2 subsets, which resvg ignores. `build_q3.py` writes the FR line only; add EN "Two layers. A third pattern." and ES « Dos tramas. Un tercer patrón. » variants.
- In forced colors the mark is `CanvasText`.
- **Budget:** monogram 3.0 KB (0.75 KB gzip), favicon 678 B, og.svg 16.7 KB (build input, not shipped).

---

## Site-wide budget

| Moment | JS (br) | CSS (br) | Where it loads |
|---|---|---|---|
| W1 | 4.2 KB (3.8 KB without GLSL comments) | 0.85 KB | home only, dynamic import |
| W2 | 1.2 KB | 0.84 KB | home (and `/projets` if used), dynamic import |
| Q1 | 0.48 KB | 0.5 KB | every page |
| Q2 | 0 | 0.4 KB | home |
| Q3 | 0 | inline symbols about 0.75 KB gzip | every page (footer) |
| ₿ face | 804 B woff2 | | only where ₿ is rendered (unicode-range) |

The total stays under about 9 KB brotli of moiré code, with no runtime dependency.

## Deviations from the dossier (deliberate, flagged for review)

1. **Light fringe alpha .08**, not the palette's .09: §9 caps it.
2. **W1 ring profile is a soft square** (50 % duty, fwidth-wide edges, mean fade before Nyquist), not a pure sinusoid. It keeps the anti-aliasing intent and doubles fringe legibility under the alpha cap.
3. **W1 lerp is 0.16**, not 0.08. With 0.08 the loop needs about 1.1 s to settle; §9's accessibility line asks for under 1 s. Measured: 459 ms.
4. **Q1 dark angle is 3°**, not 8°: 8° draws stripes at 2 px pitch, not a moon.
5. **Footer signature is the solid mark**: the line mark is not legible at 48 px and below.
6. **W2 lens label** needs a new i18n key (see W2 props).

## Open items

- Real-device GPU timing for W1 (`__w1.bench(30)` on the Fold and a mid laptop). This host has no GPU.
- Owner sign-off on the lens label string and the soft-square profile.
- OG EN/ES variants in the build script.
