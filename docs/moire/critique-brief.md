# Critique of 02-design-direction.md: owner brief and taste fidelity

Date 2026-10-17 · Lens: owner brief (few words, no walls, not eye-tiring, easy to find your way, small whimsy, light and dark, few qualified CTAs, moiré subtle with at most 2 wow, visual explanations not overused, felt expertise, person first) and the dossier taste ledger (§7). Read: spec in full, dossier incl. §13, copy deck §1 to §10 and §12, judges `results.json`, palette OPTICS5, type `system.html`, moiré `README.md` and prototype sources, prototype shots `explore/moire/shots/v2/*` and `explore/copy/shots/home-full-light.png`. Contrast numbers below come from `contrast.mjs`.

Severity: **P0** breaks the brief or a ledger rule as written, fix before WP2 starts · **P1** the owner will notice on first review · **P2** taste or clarity debt · **P3** owner questions.

---

## P0

### 1. §5 overrides the newer prototype with two regressions: W1 becomes invisible and its halos draw cards behind text
- **Where:** §5 intro ("this section overrides [the HTML] where they differ"), §5.1 "Profile" row and "Static frame" bullet.
- **Problem:** The spec was written before the last prototype pass, and its precedence rule keeps the stale values. (a) Profile: the spec says "raised cosine squared". The README measured that fringe at 4/255 levels, which "disappears on ordinary screens". The prototype switched to a 50 % duty soft square, which is about 2× more legible at the same .08 cap. (b) Static halos: the spec's `box-shadow: 0 0 22px 18px var(--bg); border-radius: 14px` is the exact halo the README rejected because it "drew visible boxes in dark mode". (c) Those halos apply to every `[data-w1-mask]`, the dock pills included, and set `background: var(--bg)` on them. On coarse pointers W1 stays static until a hero tap. So on the owner's Fold the glass dock he asked for renders as two opaque pills inside a bg-coloured cloud.
- **Why it matters:** The wow the brief asks for fades to nothing, and dark mode shows card-like boxes behind the name, which R4 forbids (« complètement invisible, seulement le texte »). The owner sees both on his own device.
- **Fix:** In §5 intro, flip the rule: "for W1, W2, Q1, Q2, Q3 parameters, `explore/moire/*.html` + README (19:03) win over this section, except lerp 0.18 and Q2 560 ms." In §5.1, set Profile to "50 % duty soft square, edges at least 1 device px, flattened to its mean before Nyquist (prototype `w1-hero.html`)". Change the static halo to `box-shadow: 0 0 56px 30px var(--bg)`, scope it to hero text plus header text only through `:root:not(.w1-live):has([data-w1]) …`, and **never set `background` on `.dock-pill`**: the pill's 82 % bg plus its 14 px backdrop blur already averages a 6 px grating to zero.

### 2. Moiré is overcharged at rest: alphas break the cap, and Q2 smudges every row next to W2
- **Where:** §1.2 `--fringe` row ("W2 base strip uses `--fringe-a × 2.6`, Q2 uses `× 1.5`"), §5.2 base strip opacity, §5.4, §7.1 row grid.
- **Problem:** W2 base at ×2.6 gives .208 alpha in light, and Q2 at ×1.5 gives .12. Both are above the dossier §9 cap of .05 to .08 in light and .04 to .06 in dark. The prototype already removed both ("the base used to be 2.6× that, which broke the §9 cap"). Q2 is also visible at rest, since only the angle changes on hover. At 1440 × 900 the fold then holds W1 rings, three hatched Q2 patches, the W2 strip and the Q1 hatch disc. In `q2-light-hover.png` the resting strips look like loading skeletons or sparklines. The spec also moves Q2 after the arrow (name, line, arrow, Q2), while the prototype has (name, line, Q2, arrow). In the spec's order the row ends on a smudge and the fringe slides away from the arrow.
- **Why it matters:** The brief says "subtle, one or two wow". Three identical patches stacked right above the Ghosts lens make W2 the fourth striped thing in the column, not a surprise. This is the "trop chargé" and "IA slop texture" reading.
- **Fix:** §1.2: every line layer peaks at `--fringe-a`, with no multipliers. §5.4: `.q2 { opacity: 0 }` at rest; on row `:hover`/`:focus-visible`, opacity goes to `var(--fringe-a)` over `--t-2` while layer B turns 4° to 1.2° over 560 ms. Grid ≥1024: `minmax(11rem,16rem) minmax(0,1fr) clamp(96px,12vw,168px) auto`. §5.2/§7.1 Ghosts column: `clamp(220px, 24vw, 340px)` (prototype value, which keeps the line on one row at 1440). Add a check to T8: at rest, with no hover, only W1, W2 and Q1 layers have a computed opacity above 0 on home.

### 3. Footer signature as a line monogram at 64 px renders as grey mush on every page
- **Where:** §5.5 "line variant at 64 px and above (128, 96, 64)", "Footer signature (WP1). Line monogram at 64 px".
- **Problem:** The W grating is 8/512 of the box. At 64 px that is a 1 px pitch with 0.5 px bars. The prototype pass found the line mark aliases below about 3 px of pitch, so it set "line at 192 px and up only" and moved the footer to the solid mark at 32 px.
- **Why it matters:** A smeared logo on every page footer is the opposite of "sharp and professional", and it is the one brand mark every page shows.
- **Fix:** §5.5 rule becomes "line variant at 192 px and above only (OG, `/lab`); solid at every smaller size". Footer: solid mark pair at 32 px with a 1 px axis, `--ink-2`, monochrome (as in `q3-light.png`).

### 4. The whimsy disappears on touch, including the owner's own device
- **Where:** §4 intro ("hover-only effects are wrapped in `(hover: hover) and (pointer: fine)`"), §4.1 M1, M3, M4, M5, §5.1 Input ("coarse pointers only after the first tap inside the hero"), §6.3 tooltip "never on touch".
- **Problem:** On the Fold (932 × 553, coarse pointer: dossier audience F) and on phones, M1 (the wordmark flip, the owner's 09-04 like), M3, M4 and M5 never fire. W1 stays a static frame because nobody taps a hero that has no CTA. Touch visitors get only the Q1 turn and a W2 drag they have to find.
- **Why it matters:** The brief asks for whimsical small animations, and the owner reviews on the Fold. What he will see is a static site.
- **Fix (all remain visitor-triggered, settle within 600 ms, and are not scroll-linked):**
  - W1: on coarse pointers, create GL after `load` + idle as on fine pointers. Retarget on **`pointerdown`** anywhere in the hero, not on a completed tap. A scroll then still sets the target at its touch-down point; `pointercancel` only stops further updates.
  - M1: under `(hover: none)`, a logo tap on the home page (no navigation) plays the expand-and-return. A logo tap from another page sets `sessionStorage["wm-m1"]`, and home plays M1 once on arrival.
  - M4 and M5: under `(hover: none)`, play once when the host is at least 60 % in view (IntersectionObserver, unobserve after the first play, never with reduced motion). These are figures, not content reveals.
  - Amend A7 to "no scroll-linked motion, no content reveals; M4 and M5 may fire once in view on `hover: none` devices".

---

## P1

### 5. W1 frames the navigation, not the name, and the spec's own target table is wrong
- **Where:** §3.4 row 1440 × 900 ("field fills the right half"), §5.1 rest offset C0 = A + (90, 140).
- **Problem:** At 1440 the name runs from x 168 to 1220, so the é source sits about 85 px from the container's right edge (`w1-light-debug.png`). With the h1 masked, the visible field is a crescent around the dock and the toggle (`w1-light-rest.png`). The Q1 hatch disc therefore sits inside the W1 rings, two gratings side by side at the busiest spot on the page. The empty zone to the right of the sub and aside (x 760 to 1240, y 330 to 430) stays nearly blank.
- **Why it matters:** "é source" should read as rings born from the accent and spreading into open space. Instead it reads as texture around the nav, and moiré on moiré next to the toggle is exactly the overload the budget exists to prevent.
- **Fix:** §5.1: (a) fade the field to 0 above the h1's top line box (no field in the dock band, so Q1 never sits inside W1); (b) set C0 at runtime to the centre of the largest free rect in the hero below the h1 baseline, recomputed on resize, and derive the static frame's `--bx/--by` from it per breakpoint; (c) add to T8: "at 932 × 553, 1440 × 900 and 390 × 844, at least 1.5 fringe pairs are visible at above 50 % of peak alpha outside the clear zones, and none inside the header band". Correct the §3.4 text.

### 6. Intake step 2 on the tool path is a form wall (about 175 visible words)
- **Where:** §8.4 Step 2, deck §9.4.a.
- **Problem:** One card step holds the recap, 3 chip groups (13 chips), 2 textareas with long example placeholders, 1 input, 6 labels or legends, 4 hints and the safety line: about 175 words. That is more than the whole home page (136).
- **Why it matters:** "Few but meaningful qualified CTAs, not plain forms." The conversation promised in deck §9.1 breaks on its longest step, which is also the paid path.
- **Fix:** §8.4: with JS, step 2 plays as turns inside the same step and reuses the existing recap mechanic. Turn A: « C'est pour qui ? » chips + Continuer. Turn B: problem + solved + Continuer. Turn C: tools + when + budget + Continuer. Each answered turn collapses into its `intake.sum.*` sentence (deck §9.7, e.g. « C'est pour une équipe de 2 à 10 personnes. ») with « Changer ». The progress stays « Étape 2 sur 3 ». Do not auto-advance on chip choice (arrow keys change radios). Open path: (link, bring, need) then (why, funding, when). No new strings. No-JS stays one long form.

### 7. Mobile visitors hit a dead end at the bottom of every long page
- **Where:** §6.2 Header (<768 px: static) and Footer row 2.
- **Problem:** Below 768 px the header scrolls away, and the footer links are manifesto, GitHub, X, RSS and legal: none of Projets, Outils, Écrits, Contact. At the end of a post, `/projets` or the manifesto, the only way on is a long scroll back up.
- **Why it matters:** "Easy to navigate, find your way" fails on the most common device class.
- **Fix:** Footer gets a first link row, `nav.projets · nav.outils · nav.ecrits · nav.contact` (existing keys, `aria-current` mirrored), then the current row. Alternative if the owner prefers: header sticky below 768 px at 48 px (mark + toggle + langs), with the nav row static.

### 8. `/contact` asks before it proves: no proof facts, the "what you get" block sits under the form, and there are two leads
- **Where:** §7.7 order; dossier §10 inventory ("Proof facts … Use on /projets **and /contact** with links"); dossier P4 ("inner page leads at most 2 sentences").
- **Problem:** The home tool row and chip both deep-link straight into the intake. `/contact` carries no proof at all, and « Ce que tu emportes », the clearest "what you can get from me", is a full-width band under the form. `contact.split` is set in `--fs-lead` ink, so the page opens with 4 lead-sized sentences.
- **Why it matters:** Audience A needs "proof he ships" within 2 minutes (dossier §4). The ask comes before any proof.
- **Fix:** ≥1100 left column: PageHead (h1 + lede), `contact.split` in `--fs-body` ink-2 (no longer a lead), V1 detailed, then `Gets` (moved up from the full-width band), then « Preuves » (`projets.labels.proof`) with two standalone deck strings plus their links: Plan ₿ Preuve 2 (PR #4552, 29 langues, 1 349 fichiers) and Outils Preuve 2 (dicton on PyPI). Do not reuse Outils Preuve 1, because its « plus haut » only makes sense on `/projets`. « Ailleurs » stays full width below. <1100: h1, lede, split, intake, legal line, V1, Preuves, Gets, Ailleurs.

### 9. Home chips read as tags or filters, not doors
- **Where:** §6.3 `Chip` (arrow only when `external`), §7.1 section 3.
- **Problem:** Three of the four chips are bare outlined pills with the same shape as the intake's `.chip-radio`. Nothing says "this takes you somewhere", and on the only action block of home they look like a filter set.
- **Why it matters:** These are the "few but meaningful qualified CTAs". If they look like tags they stop being CTAs, and touch visitors get no hover cue.
- **Fix:** `Chip` renders `<Arrow dir="right">` by default (`external` keeps the external arrow), with a 2 px arrow nudge on hover or focus at 240 ms. Radio chips keep no arrow and show the check when selected, so link chips and radio chips stay visually distinct. Zero words added.

---

## P2

### 10. Below the hero, home is five ruled bands and three line drawings: template monotony and too many visual explanations
- **Where:** §7.1 sections 2 to 5 (row rules, chips, writing rows, WealthLine "top and bottom `--line` rules"), footer rule; V1 on home, V2, footer monogram.
- **Problem:** Running rows, writing rows and the wealth row all share one hairline-row shape, so the page reads as the standard minimal-dev-portfolio stack (`home-full-light.png`). V1 (steps line), V2 (strands) and the footer monogram sit in one screen together with W2.
- **Why it matters:** « pas un truc bateau comme tout le monde » and "visual explanations without overuse". V1 explains an engagement on a page whose only job is to open the door.
- **Fix:** Remove `StepsLine` from `WorkBlock` on home. It stays on `/contact` and the confirmation (M6), and M4 lives there. Home drops to 132 words. `WealthLine` becomes a coda: no top or bottom rules, `margin-block: var(--section-gap)`, V2 drawn at 1.33× (160 × 53), the line at `--fs-lead`. Update T5 and the deck §3.2 count.

### 11. The Lycurgus story is spent where nobody sees it, and backwards
- **Where:** §0 A4, §1.2 `--selection-bg`, §5.3 Q1 (colour `--ink-2`).
- **Problem:** The cup is jade in front light (day) and ruby in back light (night), yet the selection runs ruby by day and jade by night. Ruby at rest on home amounts to two small text links. Two of the three judges proposed the same graft: Q1 acts out the cup with a jade hatch by day and a ruby moon by night. The spec skipped it. Separately, the light-state toggle (an even horizontal hatch in a circle, `q1-light.png`) reads as a hamburger icon, and on mobile there is no menu to expect.
- **Why it matters:** The palette was picked for its story (brand judge 9/10: "the theme toggle becomes the cup"). Spent only on `::selection`, the story never reaches visitors. The toggle is a control, so ruby there stays within A3.
- **Fix:** §5.3: in dark, set B strokes `--accent-text` (#de7f96) while set A stays `--ink-2`, so the half moon forms in ruby. Light stays monochrome. Rotate both sets to 45° (B at 45° + 3° in dark) so neither state reads as a menu, and re-check that the moon still forms. §1.2: swap the selection to jade by day (`--fringe` at about 18 %) and ruby by night (`--accent-text` at about 22 %), re-verify with `contrast.mjs`, and fix A4's wording.

### 12. `/ecrits` puts a subscribe block above the content, and its button opens raw XML
- **Where:** §7.4.
- **Problem:** The page leads with the follow block (a newsletter-style pattern). « Suivre par RSS » links to the feed, which most browsers show as an XML tree or download.
- **Why it matters:** Non-developer visitors meet a broken-looking page on the sitewide follow action. It reads as geeky and careless, not expert.
- **Fix:** Move the follow block under the list. Ship `public/rss.xsl` (a styled feed page in the site tokens, both themes, explaining "colle cette adresse dans ton lecteur", reusing `ecrits.followHint`), wired with `@astrojs/rss`'s `stylesheet: "/rss.xsl"` for all three feeds. A raw feed then becomes a designed page: a quiet expertise signal.

### 13. The Ghosts lens gives no sign it can be dragged
- **Where:** §5.2 Interaction and Static.
- **Problem:** No cursor is specified (the prototype has `grab` on the lens only). The rest frame already shows both ghosts whole, so nothing invites a move, and touch needs a drag nobody knows about.
- **Why it matters:** The owner's checklist says "findable, playful". An undiscovered W2 means the site ships one wow.
- **Fix:** `cursor: grab` on the whole strip and `grabbing` while held. On fine pointers, while the pointer is over the strip the lens target follows the pointer's x (same lerp and settle; drag still works), so the moiré answers the visitor as W1 does. On touch, add tap-to-place (tap anywhere on the strip sets the target) next to the drag.

### 14. Dark mode keeps the night all three judges asked to lift
- **Where:** §0 A1 ("base tokens verbatim"), §1.2 dark `--bg`.
- **Problem:** Distinct, brand and comfort judges each proposed lifting the night from L .195 to about .205 or more against halation in long reading. The spec ships .195 with ink at 13.03:1.
- **Why it matters:** "Pas fatigant pour les yeux", and the owner reads at night.
- **Fix (a tune inside OPTICS5, not a new palette):** dark `--bg` `oklch(0.205 0.012 175)`, `--surface` 0.242, `--surface-2` 0.272, `--ink-3` `oklch(0.66 0.015 175)`, with `--dock-bg` and `theme-color` following. Measured: ink 12.72:1, accent-text 6.43:1, ink-3 5.78 / 5.27 / 4.82:1 on bg / surface / surface-2 (the forbidden pair disappears), ruby fill edge 3.36:1 (the rim carries the boundary). Re-run the §1.3 table.

### 15. The line that carries "what he does" is the quietest line in the hero
- **Where:** §7.1 hero aside (JBM `--fs-mono`, ink-2); deck §3.2 note (the aside must carry P1).
- **Problem:** The abstract owner line gets 26 px ink, while the job line ("Physicien devenu développeur indépendant") gets 14 px mono at 7.6:1.
- **Why it matters:** P1 (a stranger names him and one thing he does in 5 s) depends on the line set most quietly.
- **Fix:** Keep JBM `--fs-mono` (type lock) but set the colour to `--ink`, add `text-wrap: balance`, and run the P1 test on the Fold before WP2 closes.

---

## P3 (owner questions, for annotation review)

### 16. Two destinations are duplicated on home
- **Where:** §7.1. The Outils row and chip 1 both go to `/contact?chemin=outil`, and the alysis row and chip 2 both go to alysis.cat. Deck §1.1 says the internal running row goes to `/projets`, while deck §1.3 and dossier §10 say `/contact`.
- **Why:** The owner disliked redundant links (09-04). None of the running rows reaches `/projets`, where the proof lives.
- **Ask:** Should the Outils row point to `/projets#outils-sur-mesure` (proof, then that page's primary "Raconte-moi ce qui coince"), leaving chip 1 as the direct door? This needs the owner, because dossier §10 is binding.

### 17. Inner pages carry template labels and framework labels
- **Where:** §7.2 (four mono micro-labels × 4 articles = 16, plus the « Dimensions » tags), §7.7 `Gets` dimension labels (« émotionnelle : Du calme… »).
- **Why:** The case-study template and the "five kinds of value" framework read as consultant or AI-slop on a builder's page ("trop concept").
- **Ask:** Drop the « ce que c'est » and « mon rôle » labels (those paragraphs explain themselves) and keep « preuves » and « pour toi ». On `/contact`, keep the five sentences and stubs, and let the owner decide whether the five dimension words stay.

### 18. A missing expertise signal: the site is itself open source
- **Where:** §6.2 Footer.
- **Why:** `github.com/Asi0Flammeus/wmmw.sh` is public (checked with `gh`), and the positioning is "à ciel ouvert, avec un code qui leur appartient". Linking the site's own source is the most direct proof for audience D, and footer words do not count against the home budget.
- **Ask:** Add a footer link « Le code de ce site » / "This site's code" / « El código de este sitio » (new deck key `footer.source`) once the owner approves the string. See the blocker below first.

### 19. §12 overstates to the owner
- **Where:** §12 « Un seul vrai bouton », against A6 (`/contact` send **and** `/projets` tool action); « l'expertise se sent dans la retenue ».
- **Fix:** Change to « Un seul vrai bouton par page ». Name the visible signals (honest confirmation with reference, deep-linked conversation, styled feed, open source) instead of "restraint", which on its own also describes every template.

---

## Outside this lens, blocker before any push

`docs/moire/research/worldview.md` is tracked on `feat/william-moire`. Its last section named private matters. The repo `Asi0Flammeus/wmmw.sh` is **public**, and the branch has not been pushed yet. Remove these lines, or untrack `docs/moire/research/`, before the first push. Also check that `01-brand-analysis.md` §11 stays at category level.
