# William Moiré: IA, copy deck and qualified intake (wmmw.sh)

Slice: information architecture, every visible string, the "Travailler ensemble" intake. Date 2026-10-17. Branch `feat/william-moire`. **Revision 2**: integrates the binding owner answers of dossier §13 (budget bands, Ghosts « préviens-moi », no booking, physarum retired), re-verifies every proof fact against its source, and makes the intake confirmation strictly honest (it never pretends William has already read the brief).
Binding input: `docs/moire/01-brand-analysis.md` (the dossier). Sources: `research/voice-identity.md`, `research/professional-profile.md`, `research/worldview.md`, `src/i18n/ui.ts`, `src/content/**`, `src/components/pages/*.astro`, `src/lib/site.ts`. Fact checks: local clone of `PlanB-Network/bitcoin-educational-content` (HEAD of 2026-10-12), `alysis-cat/src/content/realisations/*.json`, `alysis-cat/src/pages/mentions-legales.astro`.

## 0. How to read this deck

- **FR is canonical.** EN is re-voiced, not translated. ES uses "tú". Every locale keeps the French slugs.
- **Defaults.** Anything the owner has not answered is tagged **DEFAULT, owner to confirm in annotation review**. The full list is in §14. Answers the owner already gave are applied without a tag:
  - FR+EN+ES.
  - The intake goes to a server inbox, never to email.
  - The running list: Plan ₿ Academy (maintainer), alysis (business websites, independent dev), hyper-personalized tools and webapps, Ghosts (teaser).
  - The legal facts in §11: publisher William Lecompte EI, self-hosted on Scaleway in France, 12-month retention, contact through the intake, Umami without cookies.
  - Dossier §13: physarum retired from public pages (Q1); budget bands `< 2 k€ · 2 à 5 k€ · 5 à 15 k€ · 15 k€ + · je ne sais pas encore`, no public price (Q3); a one-field Ghosts « préviens-moi » stored in the same inbox, tagged `ghosts` (Q5); no booking link, William replies first (Q6).
- **Keys.** Proposed `ui.ts` keys are in `code`. New keys go in all three locales (the `Widen<typeof fr>` type enforces it).
- **Typography for implementers.** French needs a narrow no-break space (U+202F) before `? ! ; :` and inside `« »`, and in numbers (`1 400`). Use U+2026 for the ellipsis. Never U+2013 or U+2014. "Moiré" is always precomposed U+00E9.
- **Casing.** alysis (always lowercase, even at the start of a line), Plan ₿ Academy, Ghosts, asi0, wmmw.sh, William Moiré, Mycelic Wealth, « richesse mycélique », « riqueza micélica », "cinq dimensions".
- **Word counting.** A word is a whitespace-separated token. "Raconte-moi", "J'en", "C'est" count as one. Lone punctuation (`?`, `→`, `·`) does not count. Dates count as one word. "₿" counts as one word.

---

## 1. Sitemap and navigation

### 1.1 Routes (French slugs in every locale; FR unprefixed, `/en`, `/es` prefixed)

| Route | Page (FR H1) | In nav | Reached from | Notes |
|---|---|---|---|---|
| `/` | (H1 « William Moiré ») | `[w]` logo | everywhere | Spec §3 |
| `/projets` | « Mes projets » | Projets | nav, home running rows (internal one) | Anchors `#plan-b-academy`, `#alysis`, `#outils-sur-mesure`, `#ghosts` (holds the open « préviens-moi » field). Spec §4 |
| `/outils` | « Outils » | Outils | nav | Spec §5 |
| `/ecrits` | « Écrits » | Écrits | nav, home "Tous les écrits" | Spec §6. RSS follow action lives here |
| `/ecrits/[slug]` | writing title | | `/ecrits`, home, RSS | Slugs unchanged: `workflow-a-en-perdre-la-tete`, `talking-to-silicon`, `estimateur-de-pareto`, `hello-world` |
| `/contact` | « Travailler ensemble » | Contact | nav, home work block, `/projets`, `/outils` | The intake. Query `?chemin=` with `outil`, `ouvert`, `autre` or `site`, anchor `#intake`. Spec §8 and §9 |
| `/manifeste` | from frontmatter | no (R7) | home Mycelic line, footer, `/projets` closing line, `/contact` "Pourquoi cinq ?" | Spec §7 |
| `/mentions-legales` | « Mentions légales » | no | footer, legal line under the intake, consent checkbox | New. Anchor `#donnees`. Spec §11 |
| `/404` | (no H1 text, path shown) | | | Single FR route, trilingual copy (§12) |
| `/rss.xml`, `/en/rss.xml`, `/es/rss.xml` | | | footer, `/ecrits`, head alternates | Retitled (§13) |
| `/api/intake`, `/api/intake/start` | | | the intake and the Ghosts « préviens-moi » | New (§9.8 to §9.10) |
| `/lego`, `/r/[id]`, `/api/reports`, `/api/prototype-feedback` | | | | Plumbing, unchanged |
| `/nourritures`, `/lectures-sf` | | no | nothing | Parked: not linked, `noindex`, out of the sitemap and `llms.txt`. **DEFAULT, owner to confirm in annotation review** (Q11) |

External destinations (plain row links, never buttons): planb.academy, alysis.cat, github.com/Asi0Flammeus, x.com/asi0_flammeus.

### 1.2 Navigation

Order (unchanged, fits the Fold cover screen): `[w]` · Projets · Outils · Écrits · Contact · theme toggle · FR EN ES. No manifesto link and no CTA button in the nav. The nav label stays « Contact » (short); the page H1 is « Travailler ensemble ». **DEFAULT, owner to confirm in annotation review.**

| Key | FR | EN | ES |
|---|---|---|---|
| `nav.projets` | Projets | Projects | Proyectos |
| `nav.outils` | Outils | Tools | Herramientas |
| `nav.ecrits` | Écrits | Writings | Escritos |
| `nav.contact` | Contact | Contact | Contacto |
| `nav.ariaLabel` | Sections | Sections | Secciones |
| `nav.home` (logo aria-label) | William Moiré, retour à l'accueil | William Moiré, back to home | William Moiré, volver al inicio |
| `nav.logoTip` (tooltip on `[w]`) | Deux trames, un léger décalage. C'est tout mon nom. | Two grids, a slight shift. That's my whole name. | Dos tramas, un ligero desfase. Ese es todo mi nombre. |
| `skip` | Aller au contenu | Skip to content | Ir al contenido |
| `lang.label` | Langues | Languages | Idiomas |
| `lang.switchTo.*` | Français / English / Español | same | same |
| `theme.toLight` (aria-label + tooltip, shown in dark) | Plus de lumière | More light | Más luz |
| `theme.toDark` (shown in light) | Moins de lumière | Less light | Menos luz |

Keys to delete from `ui.ts` with the redesign: `nav.nourritures`, `nav.manifeste` (unused in nav), `hero.h1a`, `hero.h1aEm`, `hero.h1b`, `hero.cta`, `manifeste.heading`, `manifeste.headingGold`, `outils.repoPrivate` (replaced), `contact.direct*`.

### 1.3 Link graph (no section links twice to the same place)

| From | To |
|---|---|
| Home hero | nothing (no CTA, R6) |
| Home "En ce moment" | planb.academy ↗, alysis.cat ↗, `/contact?chemin=outil` (per dossier §10), Ghosts: no link, a quiet « Préviens-moi » disclosure that opens one field in place (§9.10) |
| `/projets` | the four outbound links, `/contact?chemin=outil` (the page's one primary action), `#ghosts` field open, `/manifeste` |
| Home "Travailler ensemble" chips | `/contact?chemin=outil`, alysis.cat ↗, `/contact?chemin=ouvert`, `/contact?chemin=autre` |
| Home "Écrits" | 3 posts, `/ecrits` |
| Home Mycelic line | `/manifeste` |
| Footer | `/manifeste`, GitHub, X, RSS, `/mentions-legales` |

The tool row and the tool chip share a destination but sit in two different sections, which the dossier allows (P7 is per section).

---

## 2. Global chrome

### 2.1 Footer (every page)

| Key | FR | EN | ES |
|---|---|---|---|
| `footer.thesis` | William Moiré · Mycelic Wealth. WM \| MW, un palindrome. Ce qui sort du réseau y revient. | William Moiré · Mycelic Wealth. WM \| MW, a palindrome. What leaves the network comes back. | William Moiré · Mycelic Wealth. WM \| MW, un palíndromo. Lo que sale de la red vuelve a ella. |
| `footer.manifeste` | Le manifeste | The manifesto | El manifiesto |
| `footer.github` | GitHub | GitHub | GitHub |
| `footer.x` | X | X | X |
| `footer.rss` | Flux RSS | RSS feed | Canal RSS |
| `footer.legal` | Mentions légales | Legal notice | Aviso legal |
| `footer.publisher` | Éditeur : William Lecompte, EI | Publisher: William Lecompte, sole trader (EI) | Editor: William Lecompte, empresario individual (EI) |

Layout: line 1 (thesis) next to the static monogram (Q3 quiet moment); line 2 the five links separated by `·`; line 3 the publisher line in `ink-3`, small. The `|` is the mirror axis: render it as a thin vertical rule if the type allows, with the text `|` for screen readers.

### 2.2 Bylines (writings)

| Key | FR | EN | ES |
|---|---|---|---|
| `ecrits.by` | Par William Moiré | By William Moiré | Por William Moiré |
| `ecrits.byLegacy` (posts with `author: "asi0"`) | Par asi0 (William Moiré) | By asi0 (William Moiré) | Por asi0 (William Moiré) |

---

## 3. Home

### 3.1 Composition (top to bottom)

```
[w]  Projets  Outils  Écrits  Contact                    ◐  FR EN ES
-----------------------------------------------------------------------
William Moiré                                   (W1 field, never under text)
Faisons circuler le savoir, la pratique et la valeur.
Physicien devenu développeur indépendant. Aussi connu comme asi0.

En ce moment
  Plan ₿ Academy      Le savoir Bitcoin, libre, dans ta langue. J'en maintiens les cours.   ↗
  alysis              Des sites faits main pour des métiers faits main.                      ↗
  Outils sur mesure   Un logiciel pour une seule personne ? C'est exactement ma taille.      →
  Ghosts              Des agents au très long cours. J'en dis plus bientôt.          (W2 lens)
                      Préviens-moi                    (quiet text button, opens one field in place)

Travailler ensemble
  Raconte-moi ce qui coince. Je te dis franchement si je peux aider.
  o---------o=========o- - - - -o           (V1)
  Raconter  Cadrer    Construire  Entretenir
  [Un outil pour moi ou mon équipe] [Un site pour mon activité ↗] [Un projet ouvert] [Autre chose]

Écrits
  2026-07-04  Un workflow à en perdre la tête
  2026-02-12  Discuter avec Silicium
  2026-02-09  L'estimateur de Pareto
  Tous les écrits

  (V2 ≈≈≈)  La richesse a cinq dimensions. L'argent n'en est qu'une.        manifeste →
-----------------------------------------------------------------------
footer
```

The gift/paid split line is not on home (word budget). It opens the `/contact` page, right above the path chooser.

### 3.2 FR, every visible string (canonical)

| # | Slot | Key | FR | Words | Longest sentence |
|---|---|---|---|---|---|
| 1 | H1 | `home.hero.h1` | William Moiré | 2 | 2 |
| 2 | Sub (owner's line) | `home.hero.sub` | Faisons circuler le savoir, la pratique et la valeur. | 9 | 9 |
| 3 | Aside | `home.hero.aside` | Physicien devenu développeur indépendant. Aussi connu comme asi0. | 8 | 4 |
| 4 | H2 | `home.now.heading` | En ce moment | 3 | 3 |
| 5 | Row 1 name | `home.now.planb.name` | Plan ₿ Academy | 3 | |
| 6 | Row 1 line | `home.now.planb.line` | Le savoir Bitcoin, libre, dans ta langue. J'en maintiens les cours. | 11 | 7 |
| 7 | Row 2 name | `home.now.alysis.name` | alysis | 1 | |
| 8 | Row 2 line | `home.now.alysis.line` | Des sites faits main pour des métiers faits main. | 9 | 9 |
| 9 | Row 3 name | `home.now.tools.name` | Outils sur mesure | 3 | |
| 10 | Row 3 line | `home.now.tools.line` | Un logiciel pour une seule personne ? C'est exactement ma taille. | 10 | 6 |
| 11 | Row 4 name | `home.now.ghosts.name` | Ghosts | 1 | |
| 12 | Row 4 line | `home.now.ghosts.line` | Des agents au très long cours. J'en dis plus bientôt. | 10 | 6 |
| 12b | Row 4 disclosure (closed state) | `ghosts.notify.open` | Préviens-moi | 1 | |
| 13 | H2 | `home.work.heading` | Travailler ensemble | 2 | 2 |
| 14 | Line | `home.work.line` | Raconte-moi ce qui coince. Je te dis franchement si je peux aider. | 12 | 8 |
| 15 | V1 labels | `steps.tell/scope/build/care` | Raconter · Cadrer · Construire · Entretenir | 4 | |
| 16 | Chip 1 | `paths.tool.me` | Un outil pour moi ou mon équipe | 7 | |
| 17 | Chip 2 (external ↗) | `paths.site.me` | Un site pour mon activité | 5 | |
| 18 | Chip 3 | `paths.open.me` | Un projet ouvert | 3 | |
| 19 | Chip 4 | `paths.other.me` | Autre chose | 2 | |
| 20 | H2 | `home.ecrits.heading` | Écrits | 1 | |
| 21 | 3 rows (dynamic) | content | 2026-07-04 Un workflow à en perdre la tête · 2026-02-12 Discuter avec Silicium · 2026-02-09 L'estimateur de Pareto | 16 | 7 |
| 22 | Link | `ecrits.all` | Tous les écrits | 3 | |
| 23 | Mycelic line | `home.wealth.line` | La richesse a cinq dimensions. L'argent n'en est qu'une. | 9 | 5 |
| 24 | Row hint | `home.wealth.more` | manifeste → | 1 | |
| | **Total** | | | **136** (static copy 120, writing rows 16) | **max 9** |

Budget: P4 allows 140. Headroom is 4 words, all of it reserved for longer future writing titles. If a new title pushes the page over 140, cap the home list at 2 rows rather than cut copy. The open « préviens-moi » field (§9.10, 30 more words including the placeholder) appears only after a tap, so it is not part of the at-rest count.

Screen-reader-only strings (not counted, not visible):

| Key | FR | EN | ES |
|---|---|---|---|
| `a11y.external` (suffix on ↗ rows and chip 2) | (site externe) | (external site) | (sitio externo) |
| `home.work.stepsLabel` (aria-label of the V1 list) | Comment on travaille | How we work | Cómo trabajamos |
| `steps.careOptional` (after "Entretenir") | (si tu veux) | (if you want) | (si quieres) |
| `home.wealth.aria` (row link) | Lire le manifeste : la richesse a cinq dimensions | Read the manifesto: wealth has five dimensions | Leer el manifiesto: la riqueza tiene cinco dimensiones |

**Deviation from the dossier sample, on purpose:** the hero aside reads « Physicien devenu développeur indépendant » instead of « Physicien de formation ». The owner's sub line is beautiful but abstract, so the aside has to carry "what he does" for P1 (a stranger names him and one thing he does in 5 s). The owner's own answer ("independent dev") settles the title (Q12). **DEFAULT, owner to confirm in annotation review.**

### 3.3 EN

| Key | EN |
|---|---|
| `home.hero.h1` | William Moiré |
| `home.hero.sub` | Let's keep knowledge, practice and value moving. |
| `home.hero.aside` | Physicist turned independent developer. Also known as asi0. |
| `home.now.heading` | Right now |
| `home.now.planb.*` | Plan ₿ Academy · Free Bitcoin knowledge, in your language. I maintain the courses. |
| `home.now.alysis.*` | alysis · Handmade websites for handmade trades. |
| `home.now.tools.*` | Custom tools · Software for one person? That's exactly my size. |
| `home.now.ghosts.*` | Ghosts · Agents built for the very long run. More soon. |
| `ghosts.notify.open` | Tell me when |
| `home.work.heading` | Work together |
| `home.work.line` | Tell me what's stuck. I'll tell you honestly if I can help. |
| `steps.*` | Tell · Scope · Build · Maintain |
| `paths.*.me` | A tool for me or my team · A website for my business · An open project · Something else |
| `home.ecrits.heading` / `ecrits.all` | Writings · All writings |
| `home.wealth.line` | Wealth has five dimensions. Money is only one. |
| `home.wealth.more` | manifesto → |

EN total with current titles: 124 words. ES total: 133 words (both counted by script, §15).

### 3.4 ES

| Key | ES |
|---|---|
| `home.hero.h1` | William Moiré |
| `home.hero.sub` | Hagamos circular el saber, la práctica y el valor. |
| `home.hero.aside` | Físico convertido en desarrollador independiente. También conocido como asi0. |
| `home.now.heading` | Ahora mismo |
| `home.now.planb.*` | Plan ₿ Academy · El saber Bitcoin, libre, en tu idioma. Mantengo sus cursos. |
| `home.now.alysis.*` | alysis · Webs hechas a mano para oficios hechos a mano. |
| `home.now.tools.*` | Herramientas a medida · ¿Un software para una sola persona? Es justo mi talla. |
| `home.now.ghosts.*` | Ghosts · Agentes de muy largo recorrido. Pronto contaré más. |
| `ghosts.notify.open` | Avísame |
| `home.work.heading` | Trabajar juntos |
| `home.work.line` | Cuéntame qué se atasca. Te diré con franqueza si puedo ayudar. |
| `steps.*` | Contar · Acotar · Construir · Mantener |
| `paths.*.me` | Una herramienta para mí o mi equipo · Una web para mi negocio · Un proyecto abierto · Otra cosa |
| `home.ecrits.heading` / `ecrits.all` | Escritos · Todos los escritos |
| `home.wealth.line` | La riqueza tiene cinco dimensiones. El dinero es solo una. |
| `home.wealth.more` | manifiesto → |

### 3.5 Visual explanations (two concepts, sitewide; no third)

Neither visual uses moiré. The moiré budget (W1, W2, Q1 to Q3) stays untouched, and both visuals are plain line drawings in the same hairline language.

#### V1. « Comment on travaille » (four beats on one line)

- **Replaces:** the paragraph that would explain how an engagement runs (diagnostic, build, care). One glance says: you talk first, then a scoped step, then the build, and care is optional.
- **Markup:** a real `<ol aria-label="Comment on travaille">` with four `<li>`. The line and the nodes are CSS (pseudo-elements) or one inline SVG drawn above the labels, `aria-hidden`; nothing is ever drawn under the label text. The labels are live text, so they translate and stay crisp.
- **Geometry (home):** full width of the text column, max 420 px, 44 px tall. A 1 px horizontal rule at y = 8 px. Four 8 px nodes at 0 %, 33 %, 66 %, 100 %. Labels below in mono at 0.75 rem, `ink-2`, left-aligned under each node (the last one right-aligned).
  - Segment 1 to 2 (« Raconter » to « Cadrer »): one solid hairline.
  - Segment 2 to 3 (« Cadrer » to « Construire »): **two parallel hairlines, 3 px apart**. This is the quiet brand idea: your context and my craft run side by side, distinct, never separate. No caption explains it; it is a gift for those who notice.
  - Segment 3 to 4: a dashed hairline (4 px dash, 4 px gap), and node 4 is hollow with a dashed outline. Label 4 is `ink-3`. Dashes mean optional.
  - Nodes 1 to 3 are hollow `ink-2` rings. Lines are `ink-3`. Nodes and labels must reach 3:1 against the page in both themes (they carry meaning).
- **Whimsy (visitor-triggered only):** on hover or focus-within of the work block, a 4 px dot in the accent colour travels from node 1 to node 3 along the line in 600 ms (ease-out), then rests on node 3. It does not loop. No motion with `prefers-reduced-motion`, and no motion on touch. The accent is legitimate here even if the final palette reserves it for action (the palette judge's rule for OPTICS5): this block is the site's one action block, and the dot travels toward the act.
- **Reuse:**
  - On `/contact`, in the left column with one short sub-label per beat (§8.3).
  - On the intake confirmation (step 4), where node 1 fills with the accent colour as the confirmation arrives (200 ms, once). That says "you are here, done", without a word.
- **Mobile 390 px:** the same row; labels may wrap to two lines. Below 340 px, switch to a vertical list (the line runs down the left).
- **Alt text** (for any raster export, OG or social use; the live version needs none because the list is the text):
  - FR « Comment on travaille, en quatre temps : tu racontes, on cadre un premier pas chiffré, je construis, puis j'entretiens si tu veux. »
  - EN "How we work, in four beats: you tell me, we scope a priced first step, I build, then I maintain it if you want."
  - ES « Cómo trabajamos, en cuatro tiempos: me cuentas, acotamos un primer paso con precio, construyo y luego lo mantengo si quieres. »

#### V2. « Cinq fils » (five strands, one in colour)

- **Replaces:** the old five-dimensions block (term plus definition, about 45 words). The line « La richesse a cinq dimensions. L'argent n'en est qu'une. » stays. The figure makes "only one" visible in under a second.
- **Drawing:** 120 × 40 px (home), left of the line on desktop and above it below 768 px. Five strands run left to right. Each one is a smooth cubic curve with a 3 px amplitude, and their phases are shifted so neighbours cross twice, which reads as a loose weave. Round caps.
  - Four strands are `ink-3`, 1.25 px.
  - One strand is `ink` (full text colour), 1.75 px. It stands out by **contrast and weight, not hue**, so it reads the same in both themes, for colour-blind visitors, and with any final palette. The palette judge reserves the accent for action, so the accent stays off this figure. It is the fourth strand from the top, **not the centre**: money is one among five, not the core.
  - No labels on home.
- **Whimsy:** on hover or focus of the row (the row links to the manifesto), the strands spread apart vertically (spacing 6 px to 9 px) over 400 ms. On leave they weave back together. Distinct, never separate, shown rather than said. Static with reduced motion. Nothing happens on touch.
- **A11y:** `role="img"` with this alt, because the figure adds the "one among five" reading:
  - FR « Cinq fils tissés ensemble. Un seul est plus marqué : l'argent. »
  - EN "Five strands woven together. Only one is drawn bolder: money."
  - ES « Cinco hilos tejidos juntos. Solo uno está más marcado: el dinero. »
- **Reuse:** on `/contact` « Ce que tu emportes » (§8.4), each of the five rows starts with a 16 px stub of its strand. The financial stub is the bold `ink` one and the other four are `ink-3`. That turns the five dimensions into five concrete things a client leaves with, without a sermon. Nowhere else: two reuses of one figure is the ceiling.

### 3.6 Copy-fit check (wireframe, not a palette or type proposal)

`docs/moire/explore/copy/home-sketch.html` lays out the FR home copy with the dossier's starting tokens. Screenshots are in `shots/`:
- `home-fold-dark.png` (932 × 553)
- `home-full-light.png` (1440, built before the V1 selector fix)
- `home-work-light.png` (1100, V1 fixed)
- `home-mobile-dark.png` (390)

Findings:
1. **P2 passes.** At 932 × 553 the « En ce moment » heading and all four rows sit above the fold.
2. **The bitcoin sign needs its own font route.** "₿" (U+20BF) is missing from Basteleur, from JetBrains Mono's latin subset and from Instrument Sans. Only JetBrains Mono's latin-ext subset has it, and Basteleur drew tofu in « Plan ₿ Academy ». Wrap ₿ in a span, or declare a `@font-face` with `unicode-range: U+20BF` that points at a face carrying the glyph. Whatever pairing wins Q2, check this before ship.
3. **Hero sub at 390 px.** « valeur. » falls alone on line 2. Use `text-wrap: balance` on the sub.
4. **Chips wrap at 760 px.** « Autre chose » drops to a second line. That is acceptable, since order is kept and all four stay visible. Do not shorten the chip labels: they are the qualification.
5. **V1 and V2 read at a glance.** The double segment and the dashed optional beat are legible. The coloured strand stands out without shouting.

---

## 4. /projets (« Mes projets »)

Lead at most 2 sentences. Each section has: what it is, my role, 2 or 3 proof facts with links, a « Pour toi » line (what a visitor can get from this item, and where), one outbound link. Numbers are conservative (rounded down) and each one was checked against a source on 2026-10-17. Re-check them on ship day (Q12).

The « Pour toi » lines are the per-item half of the "what you can get from me" articulation (§10.3). Each one names a concrete gain and the door to it, never a promise of results.

| Key | FR | EN | ES |
|---|---|---|---|
| `projets.heading` (H1) | Mes projets | My projects | Mis proyectos |
| `projets.intro` | Ce qui tourne en ce moment, et ce que j'y fais. | What's running right now, and what I do there. | Lo que está en marcha ahora, y lo que hago ahí. |
| `projets.labels.what` (mono micro-label) | Ce que c'est | What it is | Qué es |
| `projets.labels.role` | Mon rôle | My role | Mi papel |
| `projets.labels.proof` | Preuves | Proof | Pruebas |
| `projets.labels.forYou` | Pour toi | For you | Para ti |
| `projets.labels.dims` | Dimensions | Dimensions | Dimensiones |

The micro-labels are lowercase mono, not uppercase (a11y rule: at most one uppercase micro-label per 3 sections).

### 4.1 Plan ₿ Academy (`#plan-b-academy`)

| Part | FR | EN | ES |
|---|---|---|---|
| Ce que c'est | Une école en ligne pour apprendre Bitcoin, gratuite et open source. Cours, tutoriels et glossaire, traduits dans des dizaines de langues. | An online school to learn Bitcoin, free and open source. Courses, tutorials and a glossary, translated into dozens of languages. | Una escuela en línea para aprender Bitcoin, gratuita y de código abierto. Cursos, tutoriales y glosario, traducidos a decenas de idiomas. |
| Mon rôle | Je maintiens le dépôt où vit tout ce contenu. Je relis, je fusionne, et j'ai construit le pipeline qui le traduit. | I maintain the repository where all of it lives. I review, I merge, and I built the pipeline that translates it. | Mantengo el repositorio donde vive todo ese contenido. Reviso, fusiono, y construí el pipeline que lo traduce. |
| Preuve 1 | Premier contributeur du dépôt : plus de 1 400 commits. | Top contributor to the repository: more than 1,400 commits. | Primer contribuidor del repositorio: más de 1400 commits. |
| Preuve 2 | La PR #4552 : un nouveau pipeline de traduction. Premier test grandeur nature : 29 langues, 1 349 fichiers. | PR #4552: a new translation pipeline. First full-scale run: 29 languages, 1,349 files. | La PR #4552: un nuevo pipeline de traducción. Primera prueba a escala real: 29 idiomas, 1349 archivos. |
| Preuve 2, second link | Le récit : Un workflow à en perdre la tête | The story: A workflow to lose your head over | El relato: Un workflow para perder la cabeza |
| Preuve 3 | Auteur de MIN303, un cours avancé de 16 heures sur le minage. | Author of MIN303, an advanced 16-hour course on mining. | Autor de MIN303, un curso avanzado de 16 horas sobre minería. |
| Pour toi | Apprendre Bitcoin gratuitement, dans ta langue. Ou traduire et relire avec nous. | Learn Bitcoin for free, in your language. Or help translate and review. | Aprender Bitcoin gratis, en tu idioma. O traducir y revisar con nosotros. |
| Link | planb.academy ↗ | planb.academy ↗ | planb.academy ↗ |
| Dimensions | intellectuelle · relationnelle | intellectual · relational | intelectual · relacional |

Links and checks:
- Proof 1: `https://github.com/PlanB-Network/bitcoin-educational-content/graphs/contributors`. The GitHub API gave 1,467 commits on 2026-10-17. The local clone (HEAD 2026-10-12) gives 1,465 across his six author identities, against 841 for the next contributor. Shown as "plus de 1 400", and "premier contributeur" holds.
- Proof 2: `https://github.com/PlanB-Network/bitcoin-educational-content/pull/4552` (commit `55b06be`, authored by asi0), plus `/ecrits/workflow-a-en-perdre-la-tete`. "29 langues, 1 349 fichiers" is quoted from the essay (the `scr403` run).
- Proof 3: `courses/min303/course.yml` lists his professor id, `hours: 16`, `level: advanced`, published 2026-09-25. Link the MIN303 course page on planb.academy (verify the exact URL in a browser; the SPA answers 200 on any path).
- « Pour toi »: links to planb.academy (learn). "traduire et relire" links to the repo's contribution guide on GitHub.

Deliberately not shown:
- "Head of Content": the owner's running list says maintainer, and whether the role is current is Q12.
- Course and language totals: disputed, Q12.
- "229 PR": fine to add as « plus de 200 PR fusionnées » if more proof is wanted.

### 4.2 alysis (`#alysis`)

| Part | FR | EN | ES |
|---|---|---|---|
| Ce que c'est | Un atelier web à Chambéry. Des sites faits main pour des métiers faits main : artisans, commerces, artistes. | A web atelier in Chambéry. Handmade websites for handmade trades: craftspeople, shops, artists. | Un taller web en Chambéry. Webs hechas a mano para oficios hechos a mano: artesanos, comercios, artistas. |
| Mon rôle | On est deux, plus un chat. Je code les sites, je les mets en ligne, et je fais tourner les serveurs qui les portent. | There are two of us, plus a cat. I code the sites, put them online, and run the servers that carry them. | Somos dos, más un gato. Programo las webs, las pongo en línea y mantengo los servidores que las sostienen. |
| Preuve 1 | unfocus.art : portfolio et boutique d'un peintre, en 5 langues. En ligne depuis février 2026. | unfocus.art: a painter's portfolio and shop, in 5 languages. Live since February 2026. | unfocus.art: portfolio y tienda de un pintor, en 5 idiomas. En línea desde febrero de 2026. |
| Preuve 2 | holy-belleile.fr : une sandwicherie qui vivait sur Instagram. Sa palette, son lettrage, son burger qui se déplie. En ligne depuis juillet 2026. | holy-belleile.fr: a sandwich shop that lived on Instagram. Its own palette, its own lettering, a burger that unfolds. Live since July 2026. | holy-belleile.fr: una bocadillería que vivía en Instagram. Su paleta, su rotulación, su hamburguesa que se despliega. En línea desde julio de 2026. |
| Pour toi | Un site qui te ressemble. Tout se passe sur alysis.cat. | A website that looks like you. It all happens on alysis.cat. | Una web que se te parece. Todo pasa en alysis.cat. |
| Link | alysis.cat ↗ | alysis.cat ↗ | alysis.cat ↗ |
| Dimensions | financière · relationnelle | financial · relational | financiera · relacional |

Links: `https://unfocus.art`, `https://holy-belleile.fr`, `https://alysis.cat`. Checked against `alysis-cat/src/content/realisations/*.json`: unfocus.art `deploiement: 2026-02`, five languages; Holy `deploiement: 2026-07`, « un burger qui se déplie au scroll ». « deux artisans et un chat » is alysis's own public wording. Prospect mockups (L'Entre Deux, Bois de Lune, Pignan) are not shown: they are not delivered work.
### 4.3 Outils sur mesure (`#outils-sur-mesure`)

| Part | FR | EN | ES |
|---|---|---|---|
| Ce que c'est | Des outils et des webapps faits pour une personne ou une équipe. Pas un logiciel de plus : le tien, à ta façon de travailler. | Tools and web apps made for one person or one team. Not one more piece of software: yours, shaped to the way you work. | Herramientas y webapps hechas para una persona o un equipo. No un software más: el tuyo, a tu manera de trabajar. |
| Mon rôle | Je cadre le problème, je construis par étapes courtes, j'héberge si tu veux. Le code et les données restent à toi. | I scope the problem, build in short steps, and host it if you want. The code and the data stay yours. | Acoto el problema, construyo por etapas cortas y lo alojo si quieres. El código y los datos siguen siendo tuyos. |
| Preuve 1 | Le pipeline de traduction de Plan ₿ Academy, plus haut : un outil fait pour une équipe. | The Plan ₿ Academy translation pipeline, above: a tool made for one team. | El pipeline de traducción de Plan ₿ Academy, más arriba: una herramienta hecha para un equipo. |
| Preuve 2 | dicton, ma dictée vocale, publiée sur PyPI. Un outil fait d'abord pour une seule personne : moi. | dicton, my voice dictation tool, published on PyPI. Built first for exactly one person: me. | dicton, mi dictado por voz, publicado en PyPI. Hecho primero para una sola persona: yo. |
| Preuve 3 (conditional) | Pour un négociant agricole : ses offres commerciales préparées pour WhatsApp, dans la langue et la devise de chaque client. Rien ne part sans sa validation. | For a farm-produce trader: his sales offers drafted for WhatsApp, in each client's language and currency. Nothing goes out without his sign-off. | Para un comerciante agrícola: sus ofertas comerciales preparadas para WhatsApp, en el idioma y la moneda de cada cliente. Nada sale sin su validación. |
| Pour toi | Un outil taillé pour ta façon de travailler. Ton code, tes données. | A tool cut to the way you work. Your code, your data. | Una herramienta a la medida de tu forma de trabajar. Tu código, tus datos. |
| Action (the page's one primary action) | Raconte-moi ce qui coince → | Tell me what's stuck → | Cuéntame qué se atasca → |
| Dimensions | financière · émotionnelle | financial · emotional | financiera · emocional |

Links and checks:
- Proof 1: anchor `#plan-b-academy`.
- Proof 2: `https://pypi.org/project/dicton`.
- Proof 3: no link, client not named. Source: the alysis repo for this client's WhatsApp offers (53 commits, CI, approval before anything is sent; the repo name carries the client's name, so it is not repeated here). The client's own brief describes agricultural trade, not fruit and vegetables, hence « négociant agricole ». Show it only if the tool is in use on ship day and the client agrees to this anonymous description; otherwise drop the row (two proofs remain). **DEFAULT, owner to confirm in annotation review.**
- Action: `/contact?chemin=outil`.

Order matters: the two publicly verifiable proofs come first, the client case last.

### 4.4 Ghosts (`#ghosts`)

| Part | FR | EN | ES |
|---|---|---|---|
| Line | Des agents au très long cours, en préparation. J'en dis plus bientôt. | Agents built for the very long run, in the making. More soon. | Agentes de muy largo recorrido, en preparación. Pronto contaré más. |
| Pour toi | Un message le jour de la sortie. Un seul, promis. | One message on launch day. Just one, promise. | Un mensaje el día del lanzamiento. Solo uno, prometido. |
| Field | the « préviens-moi » field of §9.10, **open by default** here | | |

One sentence about Ghosts, as the dossier asks; the capture is the owner's Q5 answer (one field, same inbox, tagged `ghosts`). On home the same component sits closed behind « Préviens-moi ». No "conscious", "alive" or "soul". Maïa is not named (Q7). **DEFAULT, owner to confirm in annotation review.**

### 4.5 Closing line

| FR | EN | ES |
|---|---|---|
| Un seul fil relie ces quatre projets. Il est dans le manifeste. | One thread runs through these four projects. It's in the manifesto. | Un solo hilo une estos cuatro proyectos. Está en el manifiesto. |

The dimension tags (lowercase mono, the word « Dimensions » links to `/manifeste#les-cinq-dimensions`, EN `#the-five-dimensions`, ES `#las-cinco-dimensiones`) are the only visible bridge between the projects and the worldview. **DEFAULT (on), owner to confirm in annotation review.**

---

## 5. /outils (« Outils »)

| Key | FR | EN | ES |
|---|---|---|---|
| `outils.heading` (H1) | Outils | Tools | Herramientas |
| `outils.intro` | Des outils libres, nés de mon quotidien. Prends ce qui te sert. | Free tools that grew out of my daily work. Take whatever helps. | Herramientas libres, nacidas de mi día a día. Toma lo que te sirva. |
| `outils.install` (label above the code line) | Installer | Install | Instalar |
| `outils.repo` | Le code ↗ | The code ↗ | El código ↗ |
| `outils.private` | Dépôt privé pour l'instant. | Private repository for now. | Repositorio privado por ahora. |
| `outils.status.stable` | stable | stable | estable |
| `outils.copy` / `outils.copied` (copy button on install line) | Copier / Copié | Copy / Copied | Copiar / Copiado |
| `outils.cta.line` | Tu veux un outil comme ça, mais taillé pour toi ? | Want a tool like these, cut to fit you? | ¿Quieres una herramienta así, pero hecha a tu medida? |
| `outils.cta.link` → `/contact?chemin=outil` | Raconte-moi | Tell me | Cuéntame |

Plain blurbs (proposed replacement for `src/content/tools/*.json` `blurb`; the current ones are jargon-dense and fail the meta rule):

| Tool | FR | EN | ES |
|---|---|---|---|
| lazyagent | Un tableau de bord dans le terminal pour suivre tes agents IA, sur ta machine ou à distance. | A terminal dashboard to keep an eye on your AI agents, on your machine or a remote one. | Un panel en la terminal para seguir a tus agentes de IA, en tu máquina o en remoto. |
| dicton | Une dictée vocale rapide, pensée d'abord pour le français. Tu parles, le texte arrive propre. | Fast voice dictation, built French-first. You talk, clean text lands. | Dictado por voz rápido, pensado primero para el francés. Hablas y el texto llega limpio. |
| mindful-navigation | Une extension de navigateur qui glisse une pause avant les sites qui te happent. | A browser extension that slips a pause in front of the sites that pull you in. | Una extensión de navegador que pone una pausa antes de los sitios que te atrapan. |
| agentic-cloud | Un outil en ligne de commande pour gérer plusieurs Nextcloud au même endroit. | A command-line tool to manage several Nextcloud accounts in one place. | Una herramienta de línea de comandos para gestionar varios Nextcloud en un solo lugar. |

Install lines are real code in a code block, never decorative copy. Flag: lazyagent's `cargo install --path .` only works inside a clone. Use the repo's real one-line install (for example `cargo install --git https://github.com/Asi0Flammeus/lazyagent`, verify first).

---

## 6. /ecrits (« Écrits »)

| Key | FR | EN | ES |
|---|---|---|---|
| `ecrits.heading` (H1) | Écrits | Writings | Escritos |
| `ecrits.intro` | Des notes de chantier, et quelques idées au long cours. | Build notes, and a few long-running ideas. | Notas de obra, y algunas ideas de largo recorrido. |
| `ecrits.follow` (the sitewide follow action) | Suivre par RSS | Follow by RSS | Seguir por RSS |
| `ecrits.followHint` | Colle cette adresse dans ton lecteur de flux : | Paste this address into your feed reader: | Pega esta dirección en tu lector de feeds: |
| (value, mono, with copy button) | wmmw.sh/rss.xml | wmmw.sh/en/rss.xml | wmmw.sh/es/rss.xml |
| `ecrits.all` / `ecrits.back` | Tous les écrits | All writings | Todos los escritos |
| `ecrits.published` | publié le | published | publicado el |
| `ecrits.updated` | mis à jour le | updated | actualizado el |
| `ecrits.translations` | aussi disponible en | also available in | también disponible en |

Writing bodies: clean the dashes (see dossier §11). That is out of this deck's scope; the essay `29-languages-one-pr-fr.mdx` alone has several U+2014.

---

## 7. /manifeste (minimal edits)

Keep the text. Keep every strong line, including « On a laissé un seul chiffre confisquer un mot qui en portait cinq. », « La forêt n'a pas besoin d'un arbre de plus. Elle a besoin de mycélium. », « Je ne cherche pas à posséder le réseau, je cherche à y contribuer. », « Si tu es tombé dessus, c'est qu'un fil t'y a conduit. Suis-le. » « comme si ma vie en dépendait » stays here and is never quoted on client-facing pages.

### 7.1 Section « wmmw » rewritten (task-authorised)

Heading becomes « W·M | M·W » (anchor id stays `wmmw`). Paragraphs 1 and 2 are new; the easter egg is new; the last paragraph is his, unchanged.

**FR**

> ## W·M | M·W
>
> William Moiré, c'est W·M. Mycelic Wealth, la richesse mycélique, c'est M·W. Mets-les face à face et tu obtiens wmmw : un palindrome. Ce qui sort du réseau y revient.
>
> Moiré n'est pas un nom choisi au hasard. En physique, un moiré naît quand deux trames presque identiques se superposent avec un léger décalage. Le motif qui apparaît n'appartient à aucune des deux : il n'existe que dans leur relation. La richesse se comporte de la même façon. Elle ne se voit que lorsqu'elle circule entre nous.
>
> (Les premiers lecteurs connaissent une autre lecture : William commence par W et finit par M. Elle tient toujours.)
>
> Ce n'est pas qu'un jeu de lettres. C'est une règle de vie. Je ne mesure pas ce que je donne pour calculer ce que je récupère. Je donne, et le réseau redistribue, à sa manière, dans son temps. La symétrie n'est jamais immédiate ni tracée d'avance, mais elle finit toujours par se refermer.

**EN**

> ## W·M | M·W
>
> William Moiré is W·M. Mycelic Wealth is M·W. Set them facing each other and you get wmmw: a palindrome. What leaves the network comes back to it.
>
> Moiré is not a random name. In physics, a moiré appears when two nearly identical grids overlap with a slight offset. The pattern that shows up belongs to neither grid: it exists only in the relation between them. Wealth behaves the same way. You only see it when it moves between us.
>
> (Early readers know another reading: William starts with W and ends with M. It still holds.)
>
> This is more than a play on letters. It is a rule to live by. I do not measure what I give in order to compute what I collect. I give, and the network redistributes, in its own way, in its own time. The symmetry is never immediate, never mapped in advance, but it always ends up closing.

**ES**

> ## W·M | M·W
>
> William Moiré es W·M. Mycelic Wealth, la riqueza micélica, es M·W. Ponlos frente a frente y obtienes wmmw: un palíndromo. Lo que sale de la red vuelve a ella.
>
> Moiré no es un nombre al azar. En física, un muaré aparece cuando dos tramas casi idénticas se superponen con un ligero desfase. El patrón que surge no pertenece a ninguna de las dos: solo existe en su relación. La riqueza se comporta igual. Solo se ve cuando circula entre nosotros.
>
> (Los primeros lectores conocen otra lectura: William empieza por W y termina en M. Sigue valiendo.)
>
> Es más que un juego de letras. Es una regla de vida. No mido lo que doy para calcular lo que recibo. Doy, y la red redistribuye, a su manera, en su tiempo. La simetría nunca es inmediata ni está trazada de antemano, pero siempre acaba por cerrarse.

This is the only place where the moiré/wealth bridge is stated (dossier §2). "Moiré" and "mycélium" never share a sentence.

### 7.2 Other minimal edits (canon and ban-list compliance)

| # | Where | Before | After | Status |
|---|---|---|---|---|
| M1 | FR H2 | L'anarchie spontanée de l'association | S'associer librement | **DEFAULT, owner to confirm in annotation review** (Q9). The body keeps « anarchie, au sens propre » (allowed inside the manifesto) |
| M1 | EN H2 | The spontaneous anarchy of association | Free association | same |
| M1 | ES H2 | La anarquía espontánea de la asociación | Asociarse libremente | same |
| M2 | FR body | des arbres en abondance vers ceux qui manquent | des arbres qui ont trop vers ceux qui manquent | Ban list (« abondance »). **DEFAULT, owner to confirm in annotation review** |
| M2 | EN body | from the trees in abundance to those in need | from trees with plenty to trees in need | same |
| M2 | ES body | de los árboles en abundancia hacia los que carecen | de los árboles que tienen de sobra hacia los que carecen | same |
| M3 | FR body | Un réseau mycélien n'a pas de chef. | Un mycélium n'a pas de chef. | Canon (D8, no « mycélien/ne ») |
| M3 | EN body | A mycelial network has no boss. | A mycelium has no boss. | Ban list ("Mycelial") |
| M3 | ES body | Una red micelial no tiene jefe. | Un micelio no tiene jefe. | Canon |
| M4 | ES title + body | la riqueza micelial (title and « La riqueza micelial es justo eso ») | la riqueza micélica | Canon D8 |
| M5 | EN title + body | Manifesto: mycelic wealth · "Mycelic wealth is exactly that" | Manifesto: Mycelic Wealth · "Mycelic Wealth is exactly that" | Canon casing |

Page chrome: the end link stays « Tous les écrits ». No CTA on the manifesto.

---

## 8. /contact (« Travailler ensemble »)

### 8.1 Layout

- **Desktop (two columns).**
  - Left: H1, lede, split line, V1 « Comment ça se passe ».
  - Right: the intake card (`#intake`), sticky within the section, with the legal line directly under the card.
  - Below, full width: « Ce que tu emportes » (V2 rows), then « Ailleurs » with the portrait.
- **Mobile.** H1, lede, split line, intake, legal line, V1, « Ce que tu emportes », « Ailleurs ».
- **The single primary action** on this page is the intake's final send button (the glass loupe, D7 / issue #1). Step buttons inside the card are secondary-styled.

### 8.2 Page copy

| Key | FR | EN | ES |
|---|---|---|---|
| `contact.heading` (H1) | Travailler ensemble | Work together | Trabajar juntos |
| `contact.lede` | Je construis le logiciel dont tu as besoin. Pas celui qu'on vend à tout le monde. | I build the software you need. Not the one sold to everyone. | Construyo el software que necesitas. No el que se vende a todo el mundo. |
| `contact.split` | Ce que je publie est libre. Ce que je construis pour toi est cadré et payé. | What I publish is free. What I build for you is scoped and paid. | Lo que publico es libre. Lo que construyo para ti está acotado y se paga. |

### 8.3 « Comment ça se passe » (V1 with sub-labels)

| Key | FR | EN | ES |
|---|---|---|---|
| `contact.steps.heading` | Comment ça se passe | How it goes | Cómo funciona |
| `steps.tell` + `.sub` | Raconter · Ici, en cinq minutes. | Tell · Right here, in five minutes. | Contar · Aquí, en cinco minutos. |
| `steps.scope` + `.sub` | Cadrer · Un premier pas chiffré. Le plan est à toi, qu'on continue ou non. | Scope · A priced first step. The plan is yours, whether we go on or not. | Acotar · Un primer paso con precio. El plan es tuyo, sigamos o no. |
| `steps.build` + `.sub` | Construire · Par étapes courtes. Ton code, tes données. | Build · In short steps. Your code, your data. | Construir · Por etapas cortas. Tu código, tus datos. |
| `steps.care` + `.sub` | Entretenir · Seulement si tu veux. | Maintain · Only if you want. | Mantener · Solo si quieres. |

No duration or price is shown for « Cadrer » (Q3). **DEFAULT, owner to confirm in annotation review.** When the owner sets one, it goes in `steps.scope.sub` (for example « Deux jours, prix fixe. »).

### 8.4 « Ce que tu emportes » (what you can get from me, mapped to the five dimensions)

| Key | Dimension label (mono, `ink-3`) FR / EN / ES | FR | EN | ES |
|---|---|---|---|---|
| `contact.gets.heading` | | Ce que tu emportes | What you leave with | Lo que te llevas |
| `contact.gets.fin` | financière / financial / financiera | Moins de tâches à la main. Un devis clair, sans surprise. | Less work done by hand. A clear quote, no surprises. | Menos tareas a mano. Un presupuesto claro, sin sorpresas. |
| `contact.gets.rel` | relationnelle / relational / relacional | Une ligne directe avec celui qui code. | A direct line to the person writing the code. | Una línea directa con quien escribe el código. |
| `contact.gets.int` | intellectuelle / intellectual / intelectual | Ton code, tes données, et de quoi les comprendre. | Your code, your data, and what you need to understand them. | Tu código, tus datos, y lo necesario para entenderlos. |
| `contact.gets.exp` | expérientielle / experiential / experiencial | Un chantier que tu peux suivre, erreurs comprises. | A build you can follow, mistakes included. | Una obra que puedes seguir, errores incluidos. |
| `contact.gets.emo` | émotionnelle / emotional / emocional | Du calme : un périmètre honnête, aucune dépendance. | Calm: an honest scope, and no lock-in. | Calma: un alcance honesto y ninguna dependencia. |
| `contact.gets.why` → `/manifeste` | | Pourquoi cinq ? Le manifeste. | Why five? The manifesto. | ¿Por qué cinco? El manifiesto. |

Each row starts with the V2 strand stub. The financial stub is the bold `ink` strand, the others are `ink-3`. No row promises a result figure (no invented numbers, no ROI next to "richesse"). The word « richesse » does not appear in this block at all: the dimension names do the work, and « Pourquoi cinq ? » hands the theory to the manifesto.

### 8.5 « Ailleurs » and portrait

| Key | FR | EN | ES |
|---|---|---|---|
| `contact.elsewhere` | Ailleurs | Elsewhere | En otros sitios |
| GitHub · @Asi0Flammeus | Le code, à ciel ouvert. | The code, in the open. | El código, a cielo abierto. |
| X · @asi0_flammeus | Notes courtes et conversations. | Short notes and conversations. | Notas breves y conversaciones. |
| Plan ₿ Academy · asi0 | Mes cours et ma page de professeur. | My courses and my teacher page. | Mis cursos y mi página de profesor. |
| `contact.portraitAlt` | William Moiré, de profil dans la lumière basse d'un intérieur. | William Moiré, in profile, in the low light of an interior. | William Moiré, de perfil, en la luz tenue de un interior. |
| `contact.portraitCaption` | William Moiré · asi0 | William Moiré · asi0 | William Moiré · asi0 |

The portrait stays on `/contact` only, small, beside « Ailleurs » (Q10). **DEFAULT, owner to confirm in annotation review.** Plan ₿ link: the professor page `https://planb.academy/professors/asi0-aa19b8be-5958-4c45-8be8-a1582dd5a90b` (verify in a browser).

---

## 9. The intake: a guided, qualifying conversation

### 9.1 Principles

1. **It is a conversation.** Each step is one question from William, set in the display face, followed by the answer area. Answered steps collapse into a one-line recap with « Changer ». One step is visible at a time; nothing is a blank form.
2. **Qualify by routing.** Websites go to alysis.cat (no form). Learning goes to planb.academy. Only tool, open and other briefs reach the inbox.
3. **Honest at every turn.** Bands include « Je ne sais pas encore ». The confirmation repeats the visitor's own words and says what happens next, including "maybe not me".
4. **Fast.** Three input steps; the tool path takes about 3 minutes. The only required free text is one textarea per path.
5. **Works without JS** (P8). Without JS, all steps render as one long form with fieldsets in the same order, and the server renders the confirmation.
6. **No moiré, no glass inside the card** (dossier §9 forbids pattern in forms; R4). The glass loupe sits on the final send button only.
7. **Tap targets ≥ 44 px**, chips are real radio inputs inside `<fieldset>`/`<legend>`, errors are linked to fields with `aria-describedby`, and the step change is announced in an `aria-live="polite"` region.

### 9.2 Flow

```
/contact                      (?chemin=outil|ouvert|autre preselects and opens step 2 directly; ?chemin=site shows the alysis panel)
  Step 1  Qu'est-ce qui t'amène ?      path: tool | site | open | other     (+ "juste apprendre ?" line)
            site  -> panel "C'est le métier d'alysis" -> link to alysis.cat (no form, no storage)
  Step 2  brief (per path)             narrative text + chips (bands)
  Step 3  Comment je te réponds ?      name + channel + handle + acknowledgement + honeypot
  Step 4  Bien reçu                    summary of their brief, honest next step, reference, V1 with node 1 filled
```

Progress indicator (mono, small): « Étape 1 sur 3 » to « Étape 3 sur 3 ». Step 4 shows no counter.

The Ghosts « préviens-moi » is not a fifth path. It lives on the Ghosts row (home, closed) and on `/projets#ghosts` (open), posts to the same endpoint with `path: "ghosts"`, and has its own strings (§9.10). Keeping it out of the chooser keeps the chooser about work.

Home chip deep links: `?chemin=outil` opens step 2 with the recap « Tu viens pour : un outil pour toi ou ton équipe · Changer ». **DEFAULT, owner to confirm in annotation review.**

Draft safety: answers are kept in `sessionStorage` for the tab (cleared on success or when the tab closes), so a reload or a misclick loses nothing. The legal notice says so (§11).

### 9.3 Step 1: path chooser

| Key | FR | EN | ES |
|---|---|---|---|
| `intake.progress` | Étape {n} sur 3 | Step {n} of 3 | Paso {n} de 3 |
| `intake.s1.question` | Qu'est-ce qui t'amène ? | What brings you here? | ¿Qué te trae por aquí? |
| `paths.tool.me` (card title) | Un outil pour moi ou mon équipe | A tool for me or my team | Una herramienta para mí o mi equipo |
| `paths.tool.hint` | Un logiciel ou une webapp taillés pour ta façon de faire. | Software or a web app cut to the way you work. | Un software o una webapp a la medida de tu forma de trabajar. |
| `paths.tool.tag` | Payé, sur devis | Paid, quoted | De pago, con presupuesto |
| `paths.site.me` | Un site pour mon activité | A website for my business | Una web para mi negocio |
| `paths.site.hint` | C'est le métier d'alysis, notre atelier à Chambéry. | That's what alysis does, our atelier in Chambéry. | Es el oficio de alysis, nuestro taller en Chambéry. |
| `paths.site.tag` | Sur alysis.cat ↗ | On alysis.cat ↗ | En alysis.cat ↗ |
| `paths.open.me` | Un projet ouvert | An open project | Un proyecto abierto |
| `paths.open.hint` | Open source, éducation Bitcoin, recherche ouverte. | Open source, Bitcoin education, open research. | Código abierto, educación Bitcoin, investigación abierta. |
| `paths.open.tag` | Pas payé par défaut | Not paid by default | Sin pago por defecto |
| `paths.other.me` | Autre chose | Something else | Otra cosa |
| `paths.other.hint` | Une question, une invitation, une demande sur tes données. | A question, an invitation, a request about your data. | Una pregunta, una invitación, una solicitud sobre tus datos. |
| `paths.other.tag` | Juste un message | Just a message | Solo un mensaje |
| `intake.s1.learn` | Tu veux juste apprendre ou suivre ? Tout est libre : Plan ₿ Academy, mes écrits, mes outils. | Just want to learn or follow along? It's all free: Plan ₿ Academy, my writings, my tools. | ¿Solo quieres aprender o seguirme? Todo es libre: Plan ₿ Academy, mis escritos, mis herramientas. |
| `intake.s1.continue` | Continuer | Continue | Continuar |
| `intake.err.path` | Choisis un chemin pour continuer. | Pick a path to continue. | Elige un camino para continuar. |

Card 2 is a real link to `https://alysis.cat` styled like the other cards, showing ↗ and the domain, so the visitor knows they are leaving. Selecting it never stores anything. **DEFAULT, owner to confirm in annotation review** (alysis home, no deep link, no tracking parameter).

If someone lands on `?chemin=site`, the card shows this panel instead of step 2:

| Key | FR | EN | ES |
|---|---|---|---|
| `intake.site.title` | Les sites, je les fais avec alysis. | Websites, I make with alysis. | Las webs las hago con alysis. |
| `intake.site.body` | Tu y verras des sites livrés, et un moyen simple de demander. | You'll find delivered sites there, and a simple way to ask. | Allí verás webs entregadas, y una forma sencilla de pedir. |
| `intake.site.go` | Aller sur alysis.cat ↗ | Go to alysis.cat ↗ | Ir a alysis.cat ↗ |
| `intake.site.back` | Revenir au choix | Back to the choice | Volver a elegir |

Recap labels (William's voice, used in the collapsed step line and in the confirmation):

| Key | FR | EN | ES |
|---|---|---|---|
| `intake.recap.path` | Tu viens pour | You came for | Vienes por |
| `paths.tool.you` | un outil pour toi ou ton équipe | a tool for you or your team | una herramienta para ti o tu equipo |
| `paths.open.you` | un projet ouvert | an open project | un proyecto abierto |
| `paths.other.you` | autre chose | something else | otra cosa |
| `intake.change` | Changer | Change | Cambiar |
| `intake.back` | Retour | Back | Volver |

### 9.4 Step 2: the brief (per path)

Footer line on every step-2 variant: `intake.s2.safe` FR « Rien n'est envoyé avant la dernière étape. » EN "Nothing is sent before the last step." ES « Nada se envía antes del último paso. »

#### 9.4.a Path "tool"

| Key | Element | FR | EN | ES |
|---|---|---|---|---|
| `intake.tool.question` | Step heading | Raconte-moi ce qui coince. | Tell me what's stuck. | Cuéntame qué se atasca. |
| `intake.tool.team.legend` | Fieldset, required | C'est pour qui ? | Who is it for? | ¿Para quién es? |
| `intake.tool.team.*` | Chips | Juste moi · 2 à 10 personnes · 11 à 50 · Plus de 50 | Just me · 2 to 10 people · 11 to 50 · More than 50 | Solo yo · De 2 a 10 personas · De 11 a 50 · Más de 50 |
| `intake.tool.problem.label` | Textarea, required, 20 to 1200 | Ce qui coince | What's stuck | Lo que se atasca |
| `intake.tool.problem.hint` | | Qui perd du temps, combien de fois par semaine, et sur quoi. | Who loses time, how many times a week, and on what. | Quién pierde tiempo, cuántas veces por semana, y en qué. |
| `intake.tool.problem.ph` | Placeholder | Chaque lundi, je recopie 40 commandes WhatsApp dans un tableur. Deux heures perdues. | Every Monday I copy 40 WhatsApp orders into a spreadsheet. Two hours gone. | Cada lunes copio 40 pedidos de WhatsApp en una hoja de cálculo. Dos horas perdidas. |
| `intake.tool.solved.label` | Textarea, optional, 0 to 600 | À quoi ressemblerait la fin du problème ? | What would "solved" look like? | ¿Cómo sería el problema resuelto? |
| `intake.tool.solved.hint` | | Facultatif, mais c'est souvent la phrase la plus utile. | Optional, but often the most useful sentence. | Opcional, pero suele ser la frase más útil. |
| `intake.tool.solved.ph` | Placeholder | Les commandes arrivent seules dans le tableur, et je n'ai plus qu'à valider. | Orders land in the spreadsheet on their own, and I just approve them. | Los pedidos llegan solos a la hoja, y yo solo los valido. |
| `intake.tool.tools.label` | Input, optional, 0 to 300 | Tes outils aujourd'hui | Your tools today | Tus herramientas hoy |
| `intake.tool.tools.hint` | | Facultatif. Et où vivent tes données, si tu le sais. | Optional. And where your data lives, if you know. | Opcional. Y dónde viven tus datos, si lo sabes. |
| `intake.tool.tools.ph` | Placeholder | Un tableur partagé, WhatsApp, un vieux logiciel de caisse | A shared spreadsheet, WhatsApp, an old till system | Una hoja compartida, WhatsApp, un viejo software de caja |
| `intake.tool.when.legend` | Fieldset, required | Pour quand ? | By when? | ¿Para cuándo? |
| `intake.when.*` | Chips | Dès que possible · D'ici 1 à 3 mois · Plus tard · Je ne sais pas encore | As soon as possible · Within 1 to 3 months · Later · Not sure yet | Lo antes posible · En 1 a 3 meses · Más adelante · Aún no lo sé |
| `intake.tool.budget.legend` | Fieldset, required | Quel budget ? | What budget? | ¿Qué presupuesto? |
| `intake.tool.budget.*` | Chips | Moins de 2 k€ · 2 à 5 k€ · 5 à 15 k€ · 15 k€ et plus · Je ne sais pas encore | Under €2k · €2k to €5k · €5k to €15k · €15k and up · Not sure yet | Menos de 2 k€ · De 2 a 5 k€ · De 5 a 15 k€ · 15 k€ o más · Aún no lo sé |
| `intake.tool.budget.hint` | | Une fourchette m'aide à proposer la bonne taille. Rien ne t'engage. | A range helps me propose the right size. It commits you to nothing. | Un rango me ayuda a proponer el tamaño justo. No te compromete a nada. |
| `intake.tool.budget.aria.*` | `aria-label` per chip | moins de 2 000 euros · de 2 000 à 5 000 euros · de 5 000 à 15 000 euros · 15 000 euros ou plus · je ne sais pas encore | under 2,000 euros · 2,000 to 5,000 euros · 5,000 to 15,000 euros · 15,000 euros or more · not sure yet | menos de 2000 euros · de 2000 a 5000 euros · de 5000 a 15 000 euros · 15 000 euros o más · aún no lo sé |

Budget bands are the owner's (dossier §13, Q3): `< 2 k€ · 2 à 5 k€ · 5 à 15 k€ · 15 k€ + · je ne sais pas encore`, written out as chip labels. They appear only inside the tool brief; there is no public price anywhere else. Typography: narrow no-break space between the number and « k€ » in FR and ES (`2 k€`), "€2k" in EN. Screen readers get the long form through `aria-label` (« moins de 2 000 euros », "under 2,000 euros", « menos de 2000 euros »), because "k€" is read badly by most voices. The owner may correct the numbers in review; only the chip labels and the enum labels in §9.8 change.

#### 9.4.b Path "open"

| Key | Element | FR | EN | ES |
|---|---|---|---|---|
| `intake.open.question` | Step heading | Parle-moi de ton projet. | Tell me about your project. | Háblame de tu proyecto. |
| `intake.open.link.label` | URL input, optional, 0 to 300, http(s) | Le lien du projet | Project link | El enlace del proyecto |
| `intake.open.link.hint` | | Dépôt, site ou document. Pas encore de lien ? Laisse vide. | Repo, site or document. No link yet? Leave it empty. | Repositorio, web o documento. ¿Aún sin enlace? Déjalo vacío. |
| `intake.open.link.ph` | Placeholder | https://… | https://… | https://… |
| `intake.open.bring.label` | Textarea, required, 10 to 800 | Ce que tu apportes | What you bring | Lo que aportas |
| `intake.open.bring.hint` | | Ton temps, une équipe, du code, une communauté, un financement. | Your time, a team, code, a community, funding. | Tu tiempo, un equipo, código, una comunidad, financiación. |
| `intake.open.bring.ph` | Placeholder | On est trois à traduire des cours Bitcoin en wolof, le soir. | Three of us translate Bitcoin courses into Wolof, in the evenings. | Somos tres traduciendo cursos de Bitcoin al wolof, por las noches. |
| `intake.open.need.label` | Textarea, required, 10 to 800 | Ce que tu attends de moi | What you need from me | Lo que esperas de mí |
| `intake.open.need.hint` | | Du code, une relecture, un coup de main ponctuel, un avis. | Code, a review, a one-off hand, an opinion. | Código, una revisión, una mano puntual, una opinión. |
| `intake.open.need.ph` | Placeholder | Un pipeline pour ne plus copier-coller entre GitHub et nos fichiers. | A pipeline so we stop copy-pasting between GitHub and our files. | Un pipeline para dejar de copiar y pegar entre GitHub y nuestros archivos. |
| `intake.open.why.label` | Textarea, optional, 0 to 500 | Pourquoi en ouvert ? | Why open? | ¿Por qué en abierto? |
| `intake.open.why.hint` | | Facultatif. Une phrase suffit. | Optional. One sentence is enough. | Opcional. Basta una frase. |
| `intake.open.why.ph` | Placeholder | Parce que le savoir Bitcoin ne devrait pas dépendre d'une langue. | Because Bitcoin knowledge shouldn't depend on a language. | Porque el saber Bitcoin no debería depender de un idioma. |
| `intake.open.funding.legend` | Fieldset, optional | Un financement existe ? | Is there funding? | ¿Hay financiación? |
| `intake.open.funding.*` | Chips | Oui · Non · Pas encore | Yes · No · Not yet | Sí · No · Todavía no |
| `intake.open.when.legend` | Fieldset, optional | Pour quand ? | By when? | ¿Para cuándo? |
| | Chips | same as `intake.when.*` | | |

#### 9.4.c Path "other"

| Key | Element | FR | EN | ES |
|---|---|---|---|---|
| `intake.other.question` | Step heading | Je t'écoute. | I'm listening. | Te escucho. |
| `intake.other.topic.legend` | Fieldset, optional | C'est plutôt | It's more like | Es más bien |
| `intake.other.topic.*` | Chips | Une question · Une invitation · Mes données · Autre | A question · An invitation · My data · Other | Una pregunta · Una invitación · Mis datos · Otra cosa |
| `intake.other.msg.label` | Textarea, required, 10 to 500 | Ton message | Your message | Tu mensaje |
| `intake.other.msg.hint` | | 500 signes au plus. Court, c'est très bien. | 500 characters at most. Short is great. | 500 caracteres como máximo. Breve está muy bien. |
| `intake.other.msg.hintData` (when topic = Mes données) | | Donne ta référence si tu en as une. Je réponds sous un mois au plus. | Include your reference if you have one. I reply within one month at most. | Indica tu referencia si la tienes. Respondo en un mes como máximo. |
| `intake.other.msg.ph` | Placeholder | Bonjour William, je voulais te demander… | Hi William, I wanted to ask you… | Hola William, quería preguntarte… |

Character counter (appears at 80 % of the limit), `intake.count`: FR « {n} signes sur {max} » · EN "{n} of {max} characters" · ES « {n} de {max} caracteres ». Screen readers get it at 80 % and 100 % only.

### 9.5 Step 3: how to reply

| Key | Element | FR | EN | ES |
|---|---|---|---|---|
| `intake.s3.question` | Step heading | Comment je te réponds ? | How do I reply to you? | ¿Cómo te respondo? |
| `intake.s3.name.label` | Input, required, 1 to 80 | Ton prénom ou ton pseudo | Your first name or handle | Tu nombre o tu seudónimo |
| `intake.s3.name.ph` | Placeholder | Camille | Sam | Lucía |
| `intake.s3.channel.legend` | Fieldset, required | Par où ? | Where? | ¿Por dónde? |
| `intake.s3.channel.*` | Chips | Email · X · Telegram · Signal · Autre | Email · X · Telegram · Signal · Other | Email · X · Telegram · Signal · Otro |
| `intake.s3.email.label` / `.ph` / `.hint` | Input (type email) | Ton adresse email · toi@exemple.fr · Juste pour te répondre. | Your email address · you@example.com · Only to reply to you. | Tu dirección de email · tu@ejemplo.es · Solo para responderte. |
| `intake.s3.x.label` / `.ph` / `.hint` | Input | Ton pseudo X · @ton_pseudo · Vérifie que tes messages privés sont ouverts, sinon je ne pourrai pas t'écrire. | Your X handle · @your_handle · Make sure your DMs are open, or I won't be able to write to you. | Tu usuario de X · @tu_usuario · Comprueba que tus mensajes directos están abiertos, si no, no podré escribirte. |
| `intake.s3.telegram.label` / `.ph` / `.hint` | Input | Ton pseudo Telegram · @ton_pseudo · Avec ou sans le @, comme tu veux. | Your Telegram username · @your_username · With or without the @, as you like. | Tu usuario de Telegram · @tu_usuario · Con o sin la @, como quieras. |
| `intake.s3.signal.label` / `.ph` / `.hint` | Input | Ton pseudo ou numéro Signal · camille.42 ou +33 6… · Un pseudo Signal suffit, ton numéro reste privé. | Your Signal username or number · sam.42 or +44 7… · A Signal username is enough; your number stays private. | Tu usuario o número de Signal · lucia.42 o +34 6… · Basta un usuario de Signal; tu número sigue siendo privado. |
| `intake.s3.other.label` / `.ph` / `.hint` | Input | Où, et sous quel nom ? · Matrix, Nostr, LinkedIn… · Dis-moi où te trouver. | Where, and under what name? · Matrix, Nostr, LinkedIn… · Tell me where to find you. | ¿Dónde y con qué nombre? · Matrix, Nostr, LinkedIn… · Dime dónde encontrarte. |
| `intake.s3.noList` | Note | Ton contact sert à te répondre, rien d'autre. Pas de newsletter. | Your contact is used to reply, nothing else. No newsletter. | Tu contacto sirve para responderte, nada más. Sin newsletter. |
| `intake.s3.consent` | Checkbox, required | J'ai compris : ce message est gardé 12 mois sur un serveur en France, seulement pour me répondre. | Understood: this message is kept for 12 months on a server in France, only to reply to me. | Entendido: este mensaje se guarda 12 meses en un servidor en Francia, solo para responderme. |
| `intake.s3.consentLink` → `/mentions-legales#donnees` | Link after the checkbox | Détails | Details | Detalles |
| `intake.s3.send` | Primary (glass loupe) | Envoyer à William | Send to William | Enviar a William |
| `intake.s3.sending` | Busy state (`aria-busy`) | Envoi… | Sending… | Enviando… |
| `intake.honeypot` | Off-screen field `site_web` | Si tu es humain, laisse cette case vide. | If you're human, leave this box empty. | Si eres humano, deja esta casilla vacía. |

Honeypot markup: the wrapper is positioned off-screen (not `display:none`) with `aria-hidden="true"`, and the input has `tabindex="-1"` and `autocomplete="off"`. It is named `site_web` because bots love URL fields.

The visitor's Telegram, Signal or X handle is collected only to reply. William's own Telegram and Signal handles are never shown anywhere (dossier §11).

### 9.6 Validation and error states

Client and server share the same rules. Client-side checks run on "Continuer" and on blur after the first attempt, never while typing. On a failed step, an error summary appears at the top of the card, focused, with links to each field (`intake.err.summary`).

Error styling: `ink` text, a small glyph and the sentence, linked to its field with `aria-describedby`, plus a 2 px left rule in `ink` on the field. Never the accent colour and never colour alone: the accent means "act here" (palette judge rule), and a red accent would read as an alarm. The field keeps what the visitor typed. Errors are written in William's voice, never in system voice, and never wink.

| Key | Trigger | FR | EN | ES |
|---|---|---|---|---|
| `intake.err.summary.one` | 1 error | Une réponse à revoir avant de continuer. | One answer to check before you go on. | Una respuesta que revisar antes de seguir. |
| `intake.err.summary.many` | n errors | {n} réponses à revoir avant de continuer. | {n} answers to check before you go on. | {n} respuestas que revisar antes de seguir. |
| `intake.err.path` | no path | Choisis un chemin pour continuer. | Pick a path to continue. | Elige un camino para continuar. |
| `intake.err.team` | team empty | Dis-moi pour qui c'est. | Tell me who it's for. | Dime para quién es. |
| `intake.err.when` | timeline empty (tool) | Choisis un horizon, même approximatif. | Pick a timeframe, even a rough one. | Elige un plazo, aunque sea aproximado. |
| `intake.err.budget` | budget empty | Choisis une fourchette. « Je ne sais pas encore » marche aussi. | Pick a range. "Not sure yet" works too. | Elige un rango. « Aún no lo sé » también vale. |
| `intake.err.required` | required text empty | Il me manque cette réponse. | I'm missing this answer. | Me falta esta respuesta. |
| `intake.err.short` | below min | Encore quelques mots, s'il te plaît : {min} signes au moins. | A few more words, please: at least {min} characters. | Unas palabras más, por favor: al menos {min} caracteres. |
| `intake.err.long` | above max | C'est un peu long : {max} signes au plus. Le reste, on en parlera. | A bit long: {max} characters at most. We'll talk about the rest. | Un poco largo: {max} caracteres como máximo. Lo demás, lo hablamos. |
| `intake.err.url` | bad link | Ce lien ne ressemble pas à une adresse web. Laisse vide si tu n'en as pas. | That doesn't look like a web address. Leave it empty if you don't have one. | Ese enlace no parece una dirección web. Déjalo vacío si no tienes. |
| `intake.err.name` | name empty | Comment je t'appelle ? | What should I call you? | ¿Cómo te llamo? |
| `intake.err.channel` | no channel | Choisis un moyen de te répondre. | Pick a way for me to reply. | Elige cómo responderte. |
| `intake.err.email` | invalid email | Cette adresse email semble incomplète. | This email address looks incomplete. | Esta dirección de email parece incompleta. |
| `intake.err.x` | invalid X | Un pseudo X fait 1 à 15 caractères : lettres, chiffres ou _. | An X handle is 1 to 15 characters: letters, numbers or _. | Un usuario de X tiene de 1 a 15 caracteres: letras, números o _. |
| `intake.err.telegram` | invalid Telegram | Un pseudo Telegram fait 5 à 32 caractères : lettres, chiffres ou _. | A Telegram username is 5 to 32 characters: letters, numbers or _. | Un usuario de Telegram tiene de 5 a 32 caracteres: letras, números o _. |
| `intake.err.signal` | invalid Signal | Indique un pseudo Signal (comme camille.42) ou un numéro qui commence par +. | Enter a Signal username (like sam.42) or a number starting with +. | Indica un usuario de Signal (como lucia.42) o un número que empiece por +. |
| `intake.err.other` | other < 3 chars | Précise où te répondre. | Tell me where to reply. | Dime dónde responderte. |
| `intake.err.consent` | box unchecked | Coche la case pour que je puisse garder ton message. | Tick the box so I can keep your message. | Marca la casilla para que pueda guardar tu mensaje. |

Server and network states (shown in a status line above the send button; the text the visitor typed is never cleared):

| Key | Trigger | FR | EN | ES |
|---|---|---|---|---|
| `intake.net.offline` | fetch failed | Le message n'est pas parti : la connexion a lâché. Ton texte est toujours là. | The message didn't go out: the connection dropped. Your text is still here. | El mensaje no salió: se cortó la conexión. Tu texto sigue aquí. |
| `intake.net.retry` | button | Réessayer | Try again | Reintentar |
| `intake.net.server` | 500 / 503 | Le serveur n'a pas répondu. Ton texte est toujours là. Réessaie dans un instant. | The server didn't answer. Your text is still here. Try again in a moment. | El servidor no respondió. Tu texto sigue aquí. Inténtalo en un momento. |
| `intake.net.rate` | 429 | Plusieurs envois d'affilée depuis ta connexion. Réessaie dans {minutes} minutes. | Several sends in a row from your connection. Try again in {minutes} minutes. | Varios envíos seguidos desde tu conexión. Inténtalo en {minutes} minutos. |
| `intake.net.tooLarge` | 413 | Ton message est trop long pour mon serveur. Raccourcis-le un peu. | Your message is too long for my server. Trim it a little. | Tu mensaje es demasiado largo para mi servidor. Acórtalo un poco. |
| `intake.net.invalid` | 400 (client checks bypassed) | Une réponse ne passe pas. Vérifie les réponses signalées. | One answer doesn't go through. Check the flagged answers. | Una respuesta no pasa. Revisa las respuestas señaladas. |
| `intake.net.fallback` | after 2 failures | Ça ne passe toujours pas ? Écris-moi sur X : @asi0_flammeus. | Still not working? Write to me on X: @asi0_flammeus. | ¿Sigue sin funcionar? Escríbeme en X: @asi0_flammeus. |

Expired start token (409): the client fetches a fresh token and resends once, silently. The visitor sees nothing.

### 9.7 Step 4: honest confirmation

Four rules make it honest:
1. **It shows the brief as received.** It never says "here's what I understood": at that moment nobody has read it, and the page must not pretend otherwise.
2. **It reads as a short paragraph, in the second person,** built from fixed fragments. The visitor's own words are set apart in quotes (text face, `ink`) and are never rewritten, summarised or "improved" by a machine.
3. **It says what happens next, and when,** including "maybe not me".
4. **It applies the owner's Q6 answer.** There is no booking link. William reads every message himself and replies first, in writing.

**Frame strings**

| Key | FR | EN | ES |
|---|---|---|---|
| `intake.done.title` | Bien reçu, {name}. | Got it, {name}. | Recibido, {name}. |
| `intake.done.lede` | Voici ton message, tel qu'il m'arrive. | Here's your message, exactly as it reaches me. | Este es tu mensaje, tal como me llega. |
| `intake.done.next` | Je lis chaque message moi-même et je réponds d'abord par écrit, sous 3 jours ouvrés. Si je ne suis pas la bonne personne, je te le dis, et je t'oriente si je peux. | I read every message myself and reply in writing first, within 3 working days. If I'm not the right person, I'll say so, and point you elsewhere if I can. | Leo cada mensaje yo mismo y respondo primero por escrito, en 3 días laborables. Si no soy la persona adecuada, te lo digo, y te oriento si puedo. |
| `intake.done.ref` | Ta référence : {ref} | Your reference: {ref} | Tu referencia: {ref} |
| `intake.done.again` | Un oubli ? Envoie un complément avec ta référence. | Forgot something? Send a follow-up with your reference. | ¿Olvidaste algo? Envía un complemento con tu referencia. |
| `intake.done.home` | Retour à l'accueil | Back to home | Volver al inicio |
| `intake.sum.more` (a quoted answer over 240 characters is clipped) | Tout afficher | Show all | Ver todo |

The reply time (3 working days) is a **DEFAULT, owner to confirm in annotation review.** The no-booking rule and « je lis chaque message moi-même » are the owner's answer (Q6), not defaults.

**Summary fragments.** Only the fragments for answered fields render, in this order. `{…}` holds the visitor's words, quoted: « » in FR and ES, “ ” in EN.

| Key | FR | EN | ES |
|---|---|---|---|
| `sum.tool.intro` | Tu viens pour un outil. | You came for a tool. | Vienes por una herramienta. |
| `sum.team.solo` | C'est pour toi, en solo. | It's just for you. | Es solo para ti. |
| `sum.team.2-10` | C'est pour une équipe de 2 à 10 personnes. | It's for a team of 2 to 10 people. | Es para un equipo de 2 a 10 personas. |
| `sum.team.11-50` | C'est pour une équipe de 11 à 50 personnes. | It's for a team of 11 to 50 people. | Es para un equipo de 11 a 50 personas. |
| `sum.team.50+` | C'est pour une structure de plus de 50 personnes. | It's for an organisation of more than 50 people. | Es para una organización de más de 50 personas. |
| `sum.tool.problem` | Ce qui coince : {problem} | What's stuck: {problem} | Lo que se atasca: {problem} |
| `sum.tool.solved` | Résolu, ce serait : {solved} | Solved would look like: {solved} | Resuelto, sería: {solved} |
| `sum.tool.tools` | Aujourd'hui, tu utilises : {tools} | Today you use: {tools} | Hoy usas: {tools} |
| `sum.when.asap` | Tu voudrais avancer dès que possible. | You'd like to start as soon as possible. | Quieres avanzar lo antes posible. |
| `sum.when.1-3m` | Tu vises les 1 à 3 prochains mois. | You're aiming at the next 1 to 3 months. | Apuntas a los próximos 1 a 3 meses. |
| `sum.when.later` | Ce n'est pas pour tout de suite. | It's not for right now. | No es para ya. |
| `sum.when.unsure` | Le calendrier reste ouvert. | The timing is still open. | El calendario sigue abierto. |
| `sum.budget.lt2k` | Budget envisagé : moins de 2 k€. | Budget in mind: under €2k. | Presupuesto previsto: menos de 2 k€. |
| `sum.budget.2k-5k` | Budget envisagé : 2 à 5 k€. | Budget in mind: €2k to €5k. | Presupuesto previsto: de 2 a 5 k€. |
| `sum.budget.5k-15k` | Budget envisagé : 5 à 15 k€. | Budget in mind: €5k to €15k. | Presupuesto previsto: de 5 a 15 k€. |
| `sum.budget.15k+` | Budget envisagé : 15 k€ et plus. | Budget in mind: €15k and up. | Presupuesto previsto: 15 k€ o más. |
| `sum.budget.unsure` | Budget : pas encore fixé. | Budget: not set yet. | Presupuesto: aún sin fijar. |
| `sum.open.intro` | Tu viens pour un projet ouvert. | You came for an open project. | Vienes por un proyecto abierto. |
| `sum.open.link` | Le projet : {link} | The project: {link} | El proyecto: {link} |
| `sum.open.bring` | Tu apportes : {bring} | You bring: {bring} | Aportas: {bring} |
| `sum.open.need` | Tu attends de moi : {need} | You need from me: {need} | Esperas de mí: {need} |
| `sum.open.why` | En ouvert, parce que : {why} | Open, because: {why} | En abierto, porque: {why} |
| `sum.open.funding.yes` / `.no` / `.not-yet` | Un financement existe. · Pas de financement. · Pas encore de financement. | There is funding. · No funding. · No funding yet. | Hay financiación. · Sin financiación. · Aún sin financiación. |
| `sum.other.intro` | Tu m'écris pour autre chose. | You're writing about something else. | Me escribes por otra cosa. |
| `sum.other.topic.question` / `.invitation` / `.data` | C'est une question. · C'est une invitation. · C'est une demande sur tes données. | It's a question. · It's an invitation. · It's a request about your data. | Es una pregunta. · Es una invitación. · Es una solicitud sobre tus datos. |
| `sum.other.msg` | Ton message : {message} | Your message: {message} | Tu mensaje: {message} |
| `sum.reply` | Je te réponds {via} : {value}. | I'll reply {via}: {value}. | Te respondo {via}: {value}. |
| `sum.via.*` (email, x, telegram, signal, other) | par email · sur X · sur Telegram · sur Signal · à l'endroit indiqué | by email · on X · on Telegram · on Signal · where you said | por email · en X · en Telegram · en Signal · donde me indicaste |

Topic `other` adds no sentence. The open path reuses `sum.when.*` when a timeline was picked.

**Fit line.** One sentence, right after the summary. The server computes it (first match wins) and stores the label; the client never sends it. Each line describes what William will do, never a judgement of the brief: a machine cannot know whether a brief is "clear".

| Rule | `fit.label` | FR | EN | ES |
|---|---|---|---|---|
| other + topic = data | `data` | Demande sur tes données : je réponds sous un mois au plus, souvent bien avant. | A request about your data: I reply within one month at most, usually much sooner. | Solicitud sobre tus datos: respondo en un mes como máximo, normalmente mucho antes. |
| tool + budget = unsure | `budget-open` | Pas de budget fixé ? C'est courant. Je te proposerai d'abord un premier pas chiffré. | No budget set? That's common. I'll start by suggesting a priced first step. | ¿Sin presupuesto fijado? Es habitual. Primero te propondré un primer paso con precio. |
| tool + budget = lt2k | `small` | Avec moins de 2 k€, on vise petit et précis. C'est souvent le meilleur début. | Under €2k, we aim small and precise. Often the best way to start. | Con menos de 2 k€, apuntamos a algo pequeño y preciso. Suele ser el mejor comienzo. |
| tool + when = asap | `urgent` | C'est urgent : je te dis vite si mon agenda peut suivre. | It's urgent: I'll tell you quickly if my calendar can keep up. | Es urgente: te digo pronto si mi agenda puede seguir. |
| tool (any other) | `tool` | Je reviendrai vers toi avec des questions, ou une première proposition. | I'll come back to you with questions, or a first proposal. | Volveré contigo con preguntas, o una primera propuesta. |
| open | `open` | Je choisis les projets ouverts avec soin. Je ne dis pas oui à tout, mais je réponds à tout. | I pick open projects with care. I don't say yes to everything, but I answer everything. | Elijo los proyectos abiertos con cuidado. No digo que sí a todo, pero respondo a todo. |
| other | `other` | Je réponds à tout, même brièvement. | I answer everything, even briefly. | Respondo a todo, aunque sea brevemente. |

For `data`, the fit line carries the legal timing, so `intake.done.next` drops its first sentence and keeps only « Je lis chaque message moi-même. »

**Rendered example (FR, tool path, budget unsure)**

> **Bien reçu, Camille.**
> Voici ton message, tel qu'il m'arrive.
>
> Tu viens pour un outil. C'est pour une équipe de 2 à 10 personnes. Ce qui coince : « Chaque lundi, je recopie 40 commandes WhatsApp dans un tableur. Deux heures perdues. » Résolu, ce serait : « Les commandes arrivent seules, je n'ai plus qu'à valider. » Tu vises les 1 à 3 prochains mois. Budget : pas encore fixé. Je te réponds par email : camille@exemple.fr.
>
> Pas de budget fixé ? C'est courant. Je te proposerai d'abord un premier pas chiffré.
>
> Je lis chaque message moi-même et je réponds d'abord par écrit, sous 3 jours ouvrés. Si je ne suis pas la bonne personne, je te le dis, et je t'oriente si je peux.
>
> Ta référence : 7K3M 9Q2X · Un oubli ? Envoie un complément avec ta référence.

Layout: the summary paragraph is set in the text face at reading size, the visitor's quotes in `ink`, William's fragments in `ink-2`. The fit line and the next-step lines sit below a hairline. Nothing on this screen is a button except « Retour à l'accueil » (secondary).

Suggested read, one link only, per path:
- **tool:** FR « En attendant, voici comment je travaille : Un workflow à en perdre la tête » · EN "Meanwhile, here's how I work: A workflow to lose your head over" · ES « Mientras tanto, así trabajo: Un workflow para perder la cabeza ».
- **open:** FR « En attendant, pour savoir à qui tu parles : le manifeste » · EN "Meanwhile, to know who you're talking to: the manifesto" · ES « Mientras tanto, para saber con quién hablas: el manifiesto ».
- **other:** none.

V1 sits under the summary with node 1 filled. The legal line (§10.2) stays visible under the card.

The no-JS confirmation is server-rendered with the same copy. The only extra string is `intake.done.nojs`: FR « Tout est arrivé. » EN "Everything arrived." ES « Ha llegado todo. »

### 9.8 Inbox payload and API

**Request** `POST /api/intake`, `Content-Type: application/json` (JS) or `application/x-www-form-urlencoded` (no-JS, same field names flattened as `fields.problem`).

```json
{
  "locale": "fr",
  "path": "tool",
  "fields": { "team": "2-10", "problem": "…", "solved": "…", "tools": "…", "when": "1-3m", "budget": "unsure" },
  "contact": { "name": "Camille", "channel": "email", "value": "camille@exemple.fr" },
  "consent": true,
  "started": "<signed start token>",
  "page": "/contact?chemin=outil",
  "from": "/projets",
  "site_web": ""
}
```

**Stored file** `${INTAKE_DIR}/${id}.json` (one file per request, written to a temp file then renamed, mode 0600):

```json
{
  "v": 1,
  "id": "20261017-140322-7k3m9q2x",
  "ref": "7K3M 9Q2X",
  "received_at": "2026-10-17T14:03:22.418Z",
  "expires_at": "2027-10-17T14:03:22.418Z",
  "locale": "fr",
  "path": "tool",
  "fields": {
    "team": "2-10",
    "problem": "Chaque lundi, je recopie 40 commandes WhatsApp dans un tableur.",
    "solved": "",
    "tools": "Google Sheets, WhatsApp Business",
    "when": "1-3m",
    "budget": "unsure"
  },
  "contact": { "name": "Camille", "channel": "email", "value": "camille@exemple.fr" },
  "consent": { "accepted": true, "basis": "precontract", "text_version": "2026-10-17", "retention_months": 12 },
  "fit": { "label": "budget-open", "reasons": ["budget:unsure"] },
  "page": "/contact?chemin=outil",
  "from": "/projets",
  "meta": { "js": true, "elapsed_s": 143 }
}
```

**Schema (server is the authority; unknown keys are dropped; every string is trimmed, NFC-normalised, CRLF turned into LF, control characters except `\n` removed, at most 30 line breaks)**

| Field | Type | Rule |
|---|---|---|
| `v` | int | schema version, `1` |
| `id` | string | `YYYYMMDD-HHMMSS-` + 8 Crockford base32 chars, lowercase; matches `^[a-z0-9][a-z0-9-]{7,63}$` (same regex as reports) |
| `ref` | string | the 8 random chars, uppercase, grouped 4 + 4; shown to the visitor |
| `received_at`, `expires_at` | ISO 8601 UTC | `expires_at` = received + 12 months |
| `locale` | enum | `fr` \| `en` \| `es` |
| `path` | enum | `tool` \| `open` \| `other` \| `ghosts` (`site` is rejected with 400: it never posts). `ghosts` is the owner's "tagged ghosts" (§9.10) |
| `fields.team` (tool, req.) | enum | `solo` \| `2-10` \| `11-50` \| `50+` |
| `fields.problem` (tool, req.) | string | 20 to 1200 chars |
| `fields.solved` (tool) | string | 0 to 600 |
| `fields.tools` (tool) | string | 0 to 300 |
| `fields.when` (tool req., open opt.) | enum | `asap` \| `1-3m` \| `later` \| `unsure` |
| `fields.budget` (tool, req.) | enum | `lt2k` \| `2k-5k` \| `5k-15k` \| `15k+` \| `unsure` (owner bands, Q3) |
| `fields.link` (open) | string | 0 to 300, must parse as `http:` or `https:` URL |
| `fields.bring` (open, req.) | string | 10 to 800 |
| `fields.need` (open, req.) | string | 10 to 800 |
| `fields.why` (open) | string | 0 to 500 |
| `fields.funding` (open) | enum | `yes` \| `no` \| `not-yet` |
| `fields.topic` (other) | enum | `question` \| `invitation` \| `data` \| `other` |
| `fields.message` (other, req.) | string | 10 to 500 |
| `contact.name` | string | 1 to 80; required for `tool`, `open`, `other`; absent for `ghosts` |
| `contact.channel` | enum | `email` \| `x` \| `telegram` \| `signal` \| `other`. For `ghosts` the server sets it: `email` if the value matches the email rule, else `other` |
| `contact.value` | string | email: `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`, at most 254 · x: `^@?[A-Za-z0-9_]{1,15}$` · telegram: `^@?[A-Za-z0-9_]{5,32}$` · signal: username `^@?[A-Za-z][A-Za-z0-9_]{2,31}\.\d{2,}$` or phone `^\+[1-9]\d{6,14}$` (spaces stripped) · other: 3 to 120. Stored normalised (leading `@` removed for x and telegram) |
| `consent.accepted` | bool | must be `true` (checkbox for the three briefs; the submit itself for `ghosts`, whose fine print says what it accepts) |
| `consent.basis` | enum | `precontract` (tool), `legitimate-interest` (open, other), `consent` (ghosts). Mirrors the legal notice (§11) |
| `consent.text_version` | string | date of the consent wording, so a later wording change stays traceable |
| `fit` | object | `{label, reasons[]}`, computed server-side only (§9.7 table; `ghosts` for the Ghosts list); never taken from the client. Labels: `data` \| `budget-open` \| `small` \| `urgent` \| `tool` \| `open` \| `other` \| `ghosts` |
| `page` | string | path and query of the intake page, at most 200 |
| `from` | string | same-origin path of the previous page (from `document.referrer`), at most 200, else omitted |
| `meta.js` | bool | false for the no-JS path |
| `meta.elapsed_s` | int | seconds between start token and submit |

Not stored, ever: IP address, user agent, external referrer, cookies.

**Responses**
- `201 {"id","ref"}`.
- `400 {"error":"invalid","fields":{"fields.problem":"too_short"}}`. Codes are `required`, `too_short`, `too_long`, `invalid_format`, `invalid_choice`, mapped to §9.6 strings.
- `409 {"error":"stale","started":"<new token>"}`.
- `413 {"error":"too_large"}`.
- `429 {"error":"rate_limited","retry_after":600}` with a `Retry-After` header.
- `503 {"error":"busy"}`.
- The no-JS path gets a `200` HTML confirmation (or the form back with errors).

**Private read** (unchanged from the dossier): `GET /api/intake` and `GET /api/intake/<id>` with `Authorization: Bearer $INTAKE_TOKEN`; `DELETE /api/intake/<id>` mirrors the reports API. List output is newest first, with `id, received_at, path, fit.label, contact.channel`. `GET /api/intake?path=ghosts` lists the Ghosts notification list only (the day Ghosts ships, William exports it, sends one message each, then deletes the entries).

### 9.9 Anti-spam (layered, quiet, no CAPTCHA)

| Layer | Rule | On trigger |
|---|---|---|
| Honeypot | `site_web` must be empty | `201` with a fake `id`/`ref`, nothing stored. Bots learn nothing |
| Minimum time on form | Start token issued on page render. A brief must arrive at least **8 s** after it (three steps cannot be done faster by a human) and within **2 h**. The Ghosts field: at least **3 s** after its token, which is fetched from `GET /api/intake/start` when the disclosure opens (on `/projets`, at render) | Under the minimum: fake `201`, nothing stored. Over 2 h: `409` with a fresh token, and the client resends once |
| Start token | `/contact` (3 locales) renders on demand (`prerender = false`) and embeds `started` = `base64url(ts.locale.hmac)`, with HMAC-SHA256 keyed by new env `INTAKE_SECRET`. If unset, a random key is generated per process at boot (a restart only causes one silent 409 retry). `GET /api/intake/start` returns a fresh token for the retry | Missing or forged: `400` for JSON, and the no-JS form is re-rendered with a fresh token |
| Size limits | Body at most **16 KiB** (checked on `Content-Length` and while streaming); field limits in §9.8; at most 30 line breaks per field; nginx stays at 1 MiB above it | `413` |
| Rate limit | In memory, keyed by `sha256(ip + daily salt)`, never written to disk: **3 per 10 min, 10 per 24 h** per key for briefs; **2 per 10 min** for `ghosts`. Global cap **200 accepted per 24 h**, of which at most **50** `ghosts` (protects the disk) | `429` with `Retry-After`; global cap returns `503` |
| Origin check | `Origin` (or `Referer`) must be `https://wmmw.sh` or the preview host | `403` (no UI copy; only forged requests hit it) |
| Content check | Reject if `problem`/`message` holds more than 3 URLs, or if all text fields are identical. `ghosts`: a value already on the list is not stored twice | Fake `201`, nothing stored (a duplicate Ghosts entry gets a real `201`, so nobody learns who else is on the list) |
| No-JS Ghosts form | `<details>` disclosure posts without a start token (home is prerendered). Accepted only for `path: "ghosts"`, with honeypot, the `ghosts` rate limit and the 50 per day cap | Same responses; success re-renders the page with the thank-you line |
| Retention | Sweep at boot and every 24 h: delete files whose `expires_at` has passed. At most 5,000 files on disk | Oldest-first deletion above 5,000 is logged |

New env and compose items, to add with the implementation: `INTAKE_SECRET` (optional), plus a production intake volume when this merges (dossier §5).

### 9.10 « Préviens-moi » (Ghosts, owner answer Q5)

One field, email or handle, stored in the same inbox with `path: "ghosts"`. It is a follow action, never a primary one: a quiet text button with no glass and no accent fill.

**Where and how**
- **Home, Ghosts row.** Under the row's line sits a text button « Préviens-moi » (`aria-expanded`). On tap it opens the field in place, below the line and inside the text column. The W2 lens keeps its own zone at the right of the row; the field never overlaps it, and the 16 px clearance of P3 applies. Opening is a 200 ms height reveal; with reduced motion it is instant. Without JS it is a `<details>` element and still works.
- **`/projets#ghosts`.** The same component, open by default.
- **After success,** the field is replaced by the thank-you line, and the button does not come back for that session.

**Strings**

| Key | Element | FR | EN | ES |
|---|---|---|---|---|
| `ghosts.notify.open` | Disclosure button | Préviens-moi | Tell me when | Avísame |
| `ghosts.notify.label` | Input label (visible) | Ton email ou ton pseudo | Your email or handle | Tu email o tu usuario |
| `ghosts.notify.ph` | Placeholder | toi@exemple.fr | you@example.com | tu@ejemplo.es |
| `ghosts.notify.hint` | Hint | Un pseudo ? Précise le réseau : @camille sur X. | A handle? Add the network: @sam on X. | ¿Un usuario? Indica la red: @lucia en X. |
| `ghosts.notify.submit` | Submit (secondary) | Me prévenir | Notify me | Avisarme |
| `ghosts.notify.fine` | Fine print under the field | Un seul message, à la sortie de Ghosts. Ensuite, ton contact est effacé. | One message, when Ghosts ships. Then your contact is deleted. | Un solo mensaje, cuando salga Ghosts. Después, tu contacto se borra. |
| `ghosts.notify.legal` → `/mentions-legales#donnees` | Link after the fine print | Détails | Details | Detalles |
| `ghosts.notify.sending` | Busy | Envoi… | Sending… | Enviando… |
| `ghosts.notify.done` | Success (replaces the field, `aria-live="polite"`) | C'est noté. Je te préviens à la sortie. | Noted. I'll tell you when it ships. | Anotado. Te aviso cuando salga. |
| `ghosts.notify.err.empty` | Empty | Il me faut un email ou un pseudo. | I need an email or a handle. | Necesito un email o un usuario. |
| `ghosts.notify.err.format` | Under 3 characters, or a broken email | Ça ne ressemble ni à un email, ni à un pseudo. | That looks like neither an email nor a handle. | No parece ni un email ni un usuario. |
| `ghosts.notify.err.net` | Network, 5xx, 429 | Pas parti. Réessaie dans un instant. | Didn't go through. Try again in a moment. | No se envió. Inténtalo en un momento. |

Visible words when open: 30 in FR (label, placeholder, hint, submit, fine print, link), shown only after a tap. The honeypot (`site_web`, same markup as §9.5) is present here too.

**Payload**

```json
{
  "locale": "fr",
  "path": "ghosts",
  "contact": { "value": "camille@exemple.fr" },
  "started": "<signed start token, absent without JS>",
  "page": "/",
  "site_web": ""
}
```

Stored as a regular inbox file: `path: "ghosts"`, `fields: {}`, `contact: {channel, value}` (channel set by the server, value 3 to 254 characters), `consent: {accepted: true, basis: "consent", text_version, retention_months: 12}`, `fit: {label: "ghosts"}`, no `ref` shown to the visitor. The entry is deleted after the launch message is sent, or after 12 months, whichever comes first. The legal notice says so (§11).


---

## 10. Gift/paid line, legal line, and "what you can get from me"

### 10.1 Gift/paid split (top of `/contact`, above the chooser)

| FR | EN | ES |
|---|---|---|
| Ce que je publie est libre. Ce que je construis pour toi est cadré et payé. | What I publish is free. What I build for you is scoped and paid. | Lo que publico es libre. Lo que construyo para ti está acotado y se paga. |

"Libre" is only true if the writings carry a free licence. The **DEFAULT** in §11 is CC BY-SA 4.0 for texts (owner to confirm in annotation review). If the owner declines, change the line to FR « Ce que je publie est en accès libre. » EN "What I publish is free to read." ES « Lo que publico es de libre acceso. »

### 10.2 Legal line (directly under the intake card, on every step)

| Key | FR | EN | ES |
|---|---|---|---|
| `intake.legal.who` | Tu échanges avec William Moiré. Devis et factures au nom de William Lecompte, EI. | You're talking to William Moiré. Quotes and invoices are issued by William Lecompte, sole trader (EI). | Hablas con William Moiré. Presupuestos y facturas a nombre de William Lecompte, empresario individual (EI). |
| `intake.legal.data` | Ton message est gardé 12 mois, puis effacé. Les détails sont dans les mentions légales. | Your message is kept for 12 months, then deleted. Details are in the legal notice. | Tu mensaje se guarda 12 meses y luego se borra. Los detalles están en el aviso legal. |

Small, `ink-2`, never a wink. "mentions légales" links to `/mentions-legales#donnees`.

### 10.3 What a visitor can get from William (the articulation)

The owner wants a visitor to understand what they can get. The site says it in four places, each in its own register and each at most one line per item, so it never needs a "services" block:

1. **Home:** the four running rows say what exists. The four chips say what you can ask for. Together they answer "what is he doing, and what can I ask him?" in under 60 words.
2. **`/projets`, « Pour toi »:** one line per running item names the concrete gain and its door (§4).
3. **`/contact`, step 1:** each path card is an offer with its nature on a tag (Payé, sur devis · Sur alysis.cat ↗ · Pas payé par défaut · Juste un message). The line under the cards covers the free side (Plan ₿ Academy, writings, tools).
4. **`/contact`, « Ce que tu emportes »:** five concrete gains, one per dimension, tagged with the dimension name in small mono. This is the five dimensions turned into behaviour, not a sermon.

**The map (source of every line above; internal, not shown as a table)**

| Running item | What you get (plain) | Door | Gift or paid | Dimensions it feeds |
|---|---|---|---|---|
| Plan ₿ Academy | Bitcoin knowledge, free, in your language; a way to contribute | planb.academy ↗ · open path for contributions | Gift | intellectuelle, relationnelle |
| alysis | A handmade website that looks like you | alysis.cat ↗ (path « site », no form here) | Paid, through alysis | financière, relationnelle |
| Outils sur mesure | A tool shaped to the way you work; time back; your code and your data | `/contact?chemin=outil` | Paid, scoped, quoted | financière, émotionnelle, intellectuelle |
| Ghosts | One message on launch day | « Préviens-moi » (§9.10) | Gift | expérientielle |
| Writings, free tools, GitHub | Methods, code and build notes, failures included | `/ecrits`, `/outils`, RSS | Gift | intellectuelle, expérientielle |
| Open work (any item) | Code, a review or a hand on an open project | `/contact?chemin=ouvert` | Not paid by default | relationnelle, intellectuelle |

**The gift/paid rule in one picture.** On every surface the free things link out or to reading (planb.academy, writings, tools, RSS, Ghosts list), and the paid things open a conversation (tool brief) or go to the atelier (alysis.cat). A visitor never meets a price list, and never meets a paywall on knowledge. That is « Ce que je publie est libre. Ce que je construis pour toi est cadré et payé. » made structural.

**Why the five dimensions stay optional.** They appear as small lowercase tags (`/projets`) and as five gains (`/contact`), never as a heading on home and never next to a price. The theory lives in the manifesto, one click away from « Pourquoi cinq ? ».

---

## 11. /mentions-legales

Tone: "tu", plain, no wink. « Je » means the publisher, said once. FR is the binding version. EN and ES carry `legal.binding`.

Variables to fill before ship (never rendered as placeholders):
- `{ADRESSE_SIEGE}`: the registered business address, the one already published on the alysis.cat legal notice, never the CV address. **DEFAULT, owner to confirm in annotation review.**
- `{SCALEWAY_TEL}`: the host's phone number from Scaleway's own legal page.
- `{MEDIATEUR}`: name, address and site of the consumer mediator (§11 Médiation).
- `{POLICES}`: final typefaces (Q2).
- `{MAJ}`: month and year of the update.

### 11.1 FR (binding)

> # Mentions légales
>
> Qui publie ce site, où il vit, et ce que deviennent tes données. En clair. Ici, « je », c'est l'éditeur.
>
> ## Éditeur
>
> Le site wmmw.sh est édité par **William Lecompte**, entrepreneur individuel (EI), qui publie sous le nom de William Moiré.
>
> - SIREN : 928 675 495
> - SIRET : 928 675 495 000 16
> - TVA intracommunautaire : FR63928675495
> - Siège : {ADRESSE_SIEGE}
> - Directeur de la publication : William Lecompte
> - Contact : par la page [Travailler ensemble](/contact?chemin=autre), chemin « Autre chose ».
>
> ## Hébergement
>
> Le site est auto-hébergé. Il tourne sur un serveur loué à Scaleway, situé en France, et administré directement par l'éditeur.
>
> Scaleway SAS, 8 rue de la Ville l'Évêque, 75008 Paris, France. {SCALEWAY_TEL}
>
> ## Données personnelles {#donnees}
>
> **Ce que je collecte.** Uniquement ce que tu écris toi-même. Dans Travailler ensemble : le chemin choisi, ton brief, ton prénom ou ton pseudo, et le moyen de te répondre (adresse email, pseudo X, Telegram ou Signal, ou autre). Dans « Préviens-moi » : ton email ou ton pseudo.
>
> **Pourquoi.** Pour te répondre et, si on travaille ensemble, préparer un devis. Base légale : les démarches précontractuelles que tu demandes (article 6.1.b du RGPD) et, pour les autres messages, mon intérêt légitime à y répondre (article 6.1.f).
>
> **Où.** Dans un fichier sur le serveur du site, en France. Rien n'est envoyé par email, aucun outil tiers ne le lit, rien n'est revendu.
>
> **Combien de temps.** 12 mois après réception, puis effacement automatique. Si un devis ou une facture suit, ces pièces sont conservées à part, pendant la durée imposée par la loi.
>
> **La liste Ghosts.** Si tu laisses ton email ou ton pseudo dans « Préviens-moi », je l'utilise pour un seul message, à la sortie de Ghosts, puis je l'efface. Base légale : ton consentement (article 6.1.a du RGPD), que tu peux retirer à tout moment, par le même chemin que tes autres droits. Si Ghosts n'est pas sorti au bout de 12 mois, il est effacé quand même.
>
> **Ton adresse IP.** Elle sert seulement à limiter les abus, en mémoire et sous forme hachée, pendant 24 heures au plus. Elle n'est jamais enregistrée.
>
> **Si je te réponds par X, Telegram ou Signal,** l'échange passe par ces services, selon leurs propres règles.
>
> **Tes droits.** Accès, rectification, effacement, opposition, limitation et portabilité. Pour les exercer : [Travailler ensemble](/contact?chemin=autre), chemin « Autre chose », sujet « Mes données ». Je réponds sous un mois au plus. Tu peux aussi saisir la CNIL (cnil.fr).
>
> ## Cookies et mesure d'audience
>
> Ce site ne dépose aucun cookie. La mesure d'audience passe par Umami, auto-hébergé par l'éditeur, sans cookie et sans profil individuel.
>
> Deux choses restent dans ton navigateur, sans quitter ton appareil : ton choix de thème clair ou sombre, et le brouillon du formulaire pendant que tu l'écris. Le brouillon s'efface à l'envoi ou à la fermeture de l'onglet.
>
> ## Propriété intellectuelle
>
> Les textes de ce site sont publiés sous licence CC BY-SA 4.0, sauf mention contraire : tu peux les reprendre en citant la source et en partageant dans les mêmes conditions. Le code des outils suit la licence indiquée dans chaque dépôt. Le nom William Moiré, le monogramme wmmw et le design du site ne sont pas couverts par cette licence.
>
> ## Liens
>
> Ce site renvoie vers d'autres sites, dont alysis.cat et planb.academy. Je n'ai pas la main sur leur contenu.
>
> ## Médiation
>
> Si tu es un particulier et qu'un litige avec moi n'est pas réglé après une réclamation écrite, tu peux saisir gratuitement le médiateur de la consommation : {MEDIATEUR}.
>
> ## Crédits
>
> Polices : {POLICES}, sous licence SIL Open Font License.
>
> Dernière mise à jour : {MAJ}.

### 11.2 EN

> # Legal notice
>
> Who publishes this site, where it lives, and what happens to your data. In plain words. Here, "I" means the publisher.
>
> *The French version of this notice is the binding one.* (`legal.binding`)
>
> ## Publisher
>
> wmmw.sh is published by **William Lecompte**, sole trader (entrepreneur individuel, EI), who publishes as William Moiré.
>
> - SIREN: 928 675 495
> - SIRET: 928 675 495 000 16
> - EU VAT: FR63928675495
> - Registered address: {ADRESSE_SIEGE}
> - Publication director: William Lecompte
> - Contact: through [Work together](/en/contact?chemin=autre), path "Something else".
>
> ## Hosting
>
> The site is self-hosted. It runs on a server rented from Scaleway, located in France, and administered directly by the publisher.
>
> Scaleway SAS, 8 rue de la Ville l'Évêque, 75008 Paris, France. {SCALEWAY_TEL}
>
> ## Personal data {#donnees}
>
> **What I collect.** Only what you write yourself. In Work together: the path you chose, your brief, your first name or handle, and how to reply (email address, X, Telegram or Signal handle, or other). In "Tell me when": your email or handle.
>
> **Why.** To reply and, if we work together, to prepare a quote. Legal basis: the pre-contract steps you ask for (GDPR article 6.1.b) and, for other messages, my legitimate interest in answering them (article 6.1.f).
>
> **Where.** In a file on the site's server, in France. Nothing is sent by email, no third-party tool reads it, nothing is sold.
>
> **How long.** 12 months after receipt, then automatic deletion. If a quote or invoice follows, those documents are kept separately for as long as the law requires.
>
> **The Ghosts list.** If you leave your email or handle in "Tell me when", I use it for a single message when Ghosts ships, then delete it. Legal basis: your consent (GDPR article 6.1.a), which you can withdraw at any time, the same way as your other rights. If Ghosts has not shipped after 12 months, it is deleted anyway.
>
> **Your IP address.** It is used only to limit abuse, in memory and hashed, for 24 hours at most. It is never stored.
>
> **If I reply via X, Telegram or Signal,** the exchange runs through those services, under their own rules.
>
> **Your rights.** Access, correction, deletion, objection, restriction and portability. To use them: [Work together](/en/contact?chemin=autre), path "Something else", topic "My data". I reply within one month at most. You can also contact the CNIL, the French data protection authority (cnil.fr).
>
> ## Cookies and analytics
>
> This site sets no cookies. Analytics run on Umami, self-hosted by the publisher, without cookies and without individual profiles.
>
> Two things stay in your browser and never leave your device: your light or dark theme choice, and the form draft while you write it. The draft is erased when you send it or close the tab.
>
> ## Intellectual property
>
> Texts on this site are published under CC BY-SA 4.0 unless stated otherwise: you may reuse them with credit, sharing alike. Tool code follows the licence stated in each repository. The name William Moiré, the wmmw monogram and the site design are not covered by this licence.
>
> ## Links
>
> This site links to other sites, including alysis.cat and planb.academy. I have no control over their content.
>
> ## Mediation
>
> If you are a consumer and a dispute with me is not settled after a written complaint, you can refer it free of charge to the consumer mediator: {MEDIATEUR}.
>
> ## Credits
>
> Typefaces: {POLICES}, under the SIL Open Font License.
>
> Last updated: {MAJ}.

### 11.3 ES

> # Aviso legal
>
> Quién publica este sitio, dónde vive y qué pasa con tus datos. Con claridad. Aquí, «yo» es el editor.
>
> *La versión francesa de este aviso es la que hace fe.* (`legal.binding`)
>
> ## Editor
>
> wmmw.sh lo edita **William Lecompte**, empresario individual (entrepreneur individuel, EI), que publica con el nombre de William Moiré.
>
> - SIREN: 928 675 495
> - SIRET: 928 675 495 000 16
> - IVA intracomunitario: FR63928675495
> - Domicilio social: {ADRESSE_SIEGE}
> - Director de la publicación: William Lecompte
> - Contacto: en [Trabajar juntos](/es/contact?chemin=autre), camino «Otra cosa».
>
> ## Alojamiento
>
> El sitio está autoalojado. Funciona en un servidor alquilado a Scaleway, situado en Francia, y administrado directamente por el editor.
>
> Scaleway SAS, 8 rue de la Ville l'Évêque, 75008 París, Francia. {SCALEWAY_TEL}
>
> ## Datos personales {#donnees}
>
> **Qué recojo.** Solo lo que escribes tú. En Trabajar juntos: el camino elegido, tu brief, tu nombre o seudónimo, y cómo responderte (email, usuario de X, Telegram o Signal, u otro). En «Avísame»: tu email o tu usuario.
>
> **Para qué.** Para responderte y, si trabajamos juntos, preparar un presupuesto. Base legal: las gestiones precontractuales que pides (artículo 6.1.b del RGPD) y, para los demás mensajes, mi interés legítimo en responderlos (artículo 6.1.f).
>
> **Dónde.** En un archivo en el servidor del sitio, en Francia. Nada se envía por email, ninguna herramienta de terceros lo lee, nada se vende.
>
> **Cuánto tiempo.** 12 meses desde su recepción, y luego se borra automáticamente. Si sigue un presupuesto o una factura, esos documentos se guardan aparte durante el plazo que exige la ley.
>
> **La lista Ghosts.** Si dejas tu email o tu usuario en «Avísame», lo uso para un solo mensaje cuando salga Ghosts, y luego lo borro. Base legal: tu consentimiento (artículo 6.1.a del RGPD), que puedes retirar en cualquier momento, por la misma vía que tus otros derechos. Si Ghosts no ha salido en 12 meses, se borra igualmente.
>
> **Tu dirección IP.** Solo sirve para limitar abusos, en memoria y en forma de hash, durante 24 horas como máximo. Nunca se guarda.
>
> **Si te respondo por X, Telegram o Signal,** el intercambio pasa por esos servicios, con sus propias reglas.
>
> **Tus derechos.** Acceso, rectificación, supresión, oposición, limitación y portabilidad. Para ejercerlos: [Trabajar juntos](/es/contact?chemin=autre), camino «Otra cosa», tema «Mis datos». Respondo en un mes como máximo. También puedes acudir a la CNIL, la autoridad francesa de protección de datos (cnil.fr).
>
> ## Cookies y medición de audiencia
>
> Este sitio no instala ninguna cookie. La medición de audiencia usa Umami, autoalojado por el editor, sin cookies y sin perfiles individuales.
>
> Dos cosas se quedan en tu navegador y nunca salen de tu dispositivo: tu elección de tema claro u oscuro, y el borrador del formulario mientras lo escribes. El borrador se borra al enviarlo o al cerrar la pestaña.
>
> ## Propiedad intelectual
>
> Los textos de este sitio se publican con licencia CC BY-SA 4.0, salvo indicación contraria: puedes reutilizarlos citando la fuente y compartiendo igual. El código de las herramientas sigue la licencia indicada en cada repositorio. El nombre William Moiré, el monograma wmmw y el diseño del sitio no están cubiertos por esta licencia.
>
> ## Enlaces
>
> Este sitio enlaza a otros, como alysis.cat y planb.academy. No controlo su contenido.
>
> ## Mediación
>
> Si eres consumidor y un litigio conmigo no se resuelve tras una reclamación por escrito, puedes acudir gratuitamente al mediador de consumo: {MEDIATEUR}.
>
> ## Créditos
>
> Tipografías: {POLICES}, con licencia SIL Open Font License.
>
> Última actualización: {MAJ}.

### 11.4 Legal flags (not legal advice; for the owner)

1. **Registry name.** The registry name of the EI is not shown, because it is on the dossier's banned list for visible copy. An EI must show the person's name and SIREN, which is done. The SIREN, SIRET and VAT number are copied from the alysis.cat legal notice (same business). Re-check them on the public registry before ship.
2. **Contact.** The owner chose intake-only contact, and the notice applies it. French law for professional sites expects more: LCEN art. 6 asks a publisher who is a natural person for a phone number, and art. 19 asks anyone offering services online for an email address. The phone number is on the dossier's private list, so the notice shows neither. Low-cost ways to comply later: `contact@wmmw.sh` once the mailbox exists (`CONTACT_EMAIL` in `src/lib/site.ts`), and a business line or a domiciliation service for the phone. The alysis.cat notice already publishes an email for the same EI. **DEFAULT (intake only, as the owner asked; risk flagged), owner to confirm in annotation review.**
3. **Consumer mediator.** Required only if he sells to consumers. Single-person tools may mean consumers. Designate one, or state that offers are for professionals only and drop the section. **DEFAULT (section kept with `{MEDIATEUR}`), owner to confirm in annotation review.**
4. **No EU ODR link.** The EU online dispute platform closed in July 2025. The alysis.cat page still links to it; do not copy that link.
5. **Address.** The registered address is already public on alysis.cat. If the owner prefers a domiciliation address, swap it there too.

---

## 12. 404 (single FR route, trilingual copy)

The 404 is FR-only by contract. So it shows the line in all three languages, FR first, and each language gets its own home link. A tiny inline script can put EN or ES first when the requested path starts with `/en/` or `/es/` (the path is already read with `textContent`).

| Key | FR | EN | ES |
|---|---|---|---|
| `notFound.line` | Rien ici. Mais ce rien peut tout. | Nothing here. But this nothing can do anything. | Aquí no hay nada. Pero esta nada lo puede todo. |
| `notFound.home` | Retour à l'accueil | Back home | Volver al inicio |
| link target | `/` | `/en` | `/es` |
| `meta.notFound` | Page introuvable · William Moiré | Page not found · William Moiré | Página no encontrada · William Moiré |

The requested path is shown above the lines in mono (existing behaviour).

---

## 13. Meta, OG, RSS, JSON-LD

### 13.1 Titles and descriptions

Title pattern: home is `William Moiré · {role}`, inner pages are `{Page} · William Moiré`. Descriptions are at most about 155 characters, with no technical jargon.

| Page | FR title / description | EN title / description | ES title / description |
|---|---|---|---|
| `/` | William Moiré · Développeur indépendant, outils sur mesure / William Moiré, aussi connu comme asi0. Physicien devenu développeur indépendant : sites, outils sur mesure, éducation Bitcoin libre. | William Moiré · Independent developer, custom tools / William Moiré, also known as asi0. Physicist turned independent developer: websites, custom tools, free Bitcoin education. | William Moiré · Desarrollador independiente, herramientas a medida / William Moiré, también conocido como asi0. Físico convertido en desarrollador independiente: webs, herramientas a medida, educación Bitcoin libre. |
| `/projets` | Projets · William Moiré / Plan ₿ Academy, alysis, outils sur mesure, Ghosts : ce qui tourne en ce moment, mon rôle et les preuves. | Projects · William Moiré / Plan ₿ Academy, alysis, custom tools, Ghosts: what's running now, my role and the proof. | Proyectos · William Moiré / Plan ₿ Academy, alysis, herramientas a medida, Ghosts: lo que está en marcha, mi papel y las pruebas. |
| `/outils` | Outils · William Moiré / Des outils libres nés de mon quotidien : suivre ses agents IA, dicter à la voix, faire une pause avant les sites qui happent. | Tools · William Moiré / Free tools from my daily work: watch your AI agents, dictate by voice, pause before the sites that pull you in. | Herramientas · William Moiré / Herramientas libres de mi día a día: seguir a tus agentes de IA, dictar por voz, pausar antes de los sitios que atrapan. |
| `/ecrits` | Écrits · William Moiré / Notes de chantier et idées au long cours : agents, physique, Bitcoin, et ce qui circule entre eux. | Writings · William Moiré / Build notes and long-running ideas: agents, physics, Bitcoin, and what moves between them. | Escritos · William Moiré / Notas de obra e ideas de largo recorrido: agentes, física, Bitcoin, y lo que circula entre ellos. |
| `/ecrits/[slug]` | {titre} · William Moiré / {description} | {title} · William Moiré / {description} | {título} · William Moiré / {description} |
| `/manifeste` | Manifeste : la richesse mycélique · William Moiré / La richesse a cinq dimensions. Elle circule, elle ne s'empile pas. Le manifeste au long cours. | Manifesto: Mycelic Wealth · William Moiré / Wealth has five dimensions. It moves, it doesn't pile up. The long-form manifesto. | Manifiesto: la riqueza micélica · William Moiré / La riqueza tiene cinco dimensiones. Circula, no se acumula. El manifiesto completo. |
| `/contact` | Travailler ensemble · William Moiré / Un outil fait pour toi ou ton équipe, un projet ouvert, autre chose : raconte-moi ce qui coince. Réponse sous 3 jours ouvrés. | Work together · William Moiré / A tool made for you or your team, an open project, something else: tell me what's stuck. Reply within 3 working days. | Trabajar juntos · William Moiré / Una herramienta hecha para ti o tu equipo, un proyecto abierto, otra cosa: cuéntame qué se atasca. Respuesta en 3 días laborables. |
| `/mentions-legales` | Mentions légales · William Moiré / Éditeur, hébergement, données personnelles et cookies du site wmmw.sh. | Legal notice · William Moiré / Publisher, hosting, personal data and cookies for wmmw.sh. | Aviso legal · William Moiré / Editor, alojamiento, datos personales y cookies de wmmw.sh. |

`og:site_name` is « William Moiré » on every page. The default OG image shows the name, the static monogram (Q3) and the line FR « Deux trames. Un troisième motif. » EN "Two layers. A third pattern." ES « Dos tramas. Un tercer patrón. » Its alt text:
- FR « William Moiré. Deux trames de lignes superposées, un troisième motif. »
- EN "William Moiré. Two overlapping line grids, a third pattern."
- ES « William Moiré. Dos tramas de líneas superpuestas, un tercer patrón. »

### 13.2 RSS

| Key | FR | EN | ES |
|---|---|---|---|
| `rss.title` | William Moiré : écrits | William Moiré: writings | William Moiré: escritos |
| `rss.description` | Notes de chantier et idées au long cours, par William Moiré. | Build notes and long-running ideas, by William Moiré. | Notas de obra e ideas de largo recorrido, por William Moiré. |

### 13.3 JSON-LD (home only)

The real name is not included: legal surfaces only (Q4). **DEFAULT, owner to confirm in annotation review.** `jobTitle` and `description` follow the page locale; the EN values are shown below.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://wmmw.sh/#person",
      "name": "William Moiré",
      "givenName": "William",
      "alternateName": ["asi0", "asi0 flammeus", "Asi0Flammeus"],
      "url": "https://wmmw.sh",
      "jobTitle": "Independent developer",
      "description": "Physicist turned independent developer. Maintains Plan ₿ Academy, builds websites with alysis and custom tools for one person or one team.",
      "knowsAbout": ["Bitcoin education", "Web development", "Custom software", "AI agents", "Physics"],
      "affiliation": { "@type": "EducationalOrganization", "name": "Plan ₿ Academy", "url": "https://planb.academy" },
      "worksFor": { "@type": "Organization", "name": "alysis", "url": "https://alysis.cat" },
      "sameAs": [
        "https://github.com/Asi0Flammeus",
        "https://x.com/asi0_flammeus",
        "https://planb.academy/professors/asi0-aa19b8be-5958-4c45-8be8-a1582dd5a90b"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://wmmw.sh/#site",
      "name": "William Moiré",
      "alternateName": "wmmw.sh",
      "url": "https://wmmw.sh",
      "inLanguage": ["fr", "en", "es"],
      "publisher": { "@id": "https://wmmw.sh/#person" }
    }
  ]
}
```

Localised `jobTitle` / `description`:
- **FR:** « Développeur indépendant » / « Physicien devenu développeur indépendant. Maintient Plan ₿ Academy, fait des sites avec alysis et des outils sur mesure pour une personne ou une équipe. »
- **ES:** « Desarrollador independiente » / « Físico convertido en desarrollador independiente. Mantiene Plan ₿ Academy, hace webs con alysis y herramientas a medida para una persona o un equipo. »

`knowsAbout` says "AI agents", not "Long-horizon AI agents", so it does not disclose Ghosts.

`affiliation` names Plan ₿ Academy, the name the visitor reads on the page, rather than the operating company. `worksFor` alysis follows the dossier; alysis is a brand of the same EI, so drop the node if the owner prefers the schema to stay strictly personal. **DEFAULT, owner to confirm in annotation review.**

---

## 14. Owner answers applied, and defaults register

### 14.1 Owner answers applied (no tag)

| Topic | Answer | Where it lands |
|---|---|---|
| Languages | FR + EN + ES, French slugs | Every table |
| Intake target | Server inbox, JSON per request, no email | §9.8 |
| Running list | Plan ₿ Academy (maintainer), alysis (business websites), hyper-personalized tools and webapps, Ghosts (teaser) | Home §3, `/projets` §4 |
| Legal facts | Publisher William Lecompte EI; self-hosted on a Scaleway server in France, run by the publisher; 12-month retention; contact through the intake; Umami without cookies | §11 |
| Q1 Physarum | Retired from all public pages | No slot in the IA |
| Q3 Price | Budget bands in the tool brief only: `< 2 k€ · 2 à 5 k€ · 5 à 15 k€ · 15 k€ + · je ne sais pas encore`; no public price | §9.4.a, §9.7, §9.8 |
| Q5 Ghosts | One-field « préviens-moi », same inbox, tagged `ghosts` | §9.10, home row, `/projets#ghosts`, §11 |
| Q6 Booking | No booking link; William reads every message himself and replies first | §9.7 |

### 14.2 Defaults register

Every line below is **DEFAULT, owner to confirm in annotation review.**

| # | Topic (dossier Q) | Default chosen | Why |
|---|---|---|---|
| D-02 | Long-form face (Q2) | Copy assumes a proportional face for writings, manifesto, legal and the intake summary; mono for labels, dates and chips | "Not eye-tiring" |
| D-04 | Real name (Q4) | "William Lecompte" only on legal surfaces: legal notice, footer publisher line, intake legal line. Not in JSON-LD | Owner brief + dossier §3 |
| D-07 | Maïa (Q7) | Not named anywhere | Voice brief default |
| D-08 | Account names (Q8) | Display names "William Moiré" at launch; handles unchanged; site links use current handles | No dependency on renames |
| D-09 | Manifesto (Q9) | wmmw section rewritten (§7.1); H2 renamed « S'associer librement »; ban-list and canon fixes M2 to M5; « comme si ma vie en dépendait » stays in the manifesto only | Minimal edits |
| D-10 | Portrait (Q10) | Kept on `/contact`, small, beside « Ailleurs » | Owner placed it there on 09-10 |
| D-11 | `/lectures-sf`, `/nourritures` (Q11) | Not linked, noindex, out of sitemap and `llms.txt` | Not ready, not reviewed |
| D-12 | Facts (Q12) | "plus de 1 400 commits" (1,465 to 1,467 counted), "29 langues, 1 349 fichiers" (essay), MIN303 author (16 h, advanced); no "Head of Content"; title « développeur indépendant »; no course or language totals; 420x not cited | Conservative, verifiable |
| D-13 | Hero aside | « Physicien devenu développeur indépendant. Aussi connu comme asi0. » (instead of « Physicien de formation ») | P1 five-second test |
| D-14 | Reply time | « sous 3 jours ouvrés » (confirmation and `/contact` meta) | Sets an honest expectation |
| D-15 | Writings licence | CC BY-SA 4.0 for texts; brand and design excluded | Makes « Ce que je publie est libre » true |
| D-16 | Legal identity | SIREN/SIRET/VAT copied from alysis.cat; registered address from the same page; registry trade name omitted (banned word) | Same EI |
| D-17 | Legal contact | Intake only (owner); LCEN phone and email risk flagged; `contact@wmmw.sh` recommended later | Owner answer + risk note |
| D-18 | Consumer mediator | Section kept, `{MEDIATEUR}` to designate; no EU ODR link | Single-person tools can mean consumers |
| D-19 | Nav label | « Contact » in nav, « Travailler ensemble » as H1 | Fold width |
| D-20 | Home tool row | Links to `/contact?chemin=outil` (dossier) | As specified |
| D-21 | Deep links | `?chemin=outil`, `ouvert` or `autre` open step 2 directly; `?chemin=site` shows the alysis panel | Fewer clicks from home |
| D-22 | alysis link | `https://alysis.cat` home, no deep link, no tracking parameter | Their Umami sees the referrer |
| D-23 | Dimension tags on `/projets` | On (lowercase mono line per project), under the « Pour toi » line | Visible thread to the worldview, no sermon |
| D-24 | 404 | Trilingual on the single FR route | FR-only routing contract |
| D-25 | Intake rendering | `/contact` renders on demand to embed the signed start token; new optional env `INTAKE_SECRET` | Time-on-form check that also works without JS |
| D-26 | Anti-spam numbers | Briefs: 8 s minimum, 2 h maximum, 16 KiB body, 3 per 10 min and 10 per 24 h per hashed IP. Ghosts: 3 s, 2 per 10 min, 50 per day. 200 per day global, 5,000 files cap | Proportionate for a personal inbox |
| D-27 | Open path money | Optional « Un financement existe ? » chip, no budget bands | Not paid by default, but grants exist |
| D-28 | Visitor handles | Collect the visitor's X, Telegram or Signal handle only to reply; William's own Telegram and Signal never shown | Owner listed these channels; dossier privacy rule |
| D-29 | Ghosts field placement | Home: closed behind « Préviens-moi » on the Ghosts row, outside the W2 lens zone. `/projets#ghosts`: open | Keeps home at rest; honours Q5 |
| D-30 | Ghosts list lifecycle | One message at launch, then deletion; 12 months maximum; duplicates not stored | Consent basis, data minimisation |
| D-31 | Client proof on `/projets` | Agricultural trader's WhatsApp offers tool shown last, anonymous, only if live and agreed | Only public proofs are guaranteed |
| D-32 | JSON-LD organisations | `affiliation` Plan ₿ Academy; `worksFor` alysis kept | Matches visible names |
| D-33 | V2 emphasis | The money strand is bold `ink`, not the accent | Accent reserved for action; colour-blind safe |

Facts to re-verify on ship day: commit count (graph link), MIN303 URL, professor page URL, unfocus.art and holy-belleile.fr still live, the agricultural trader tool status and consent, SIREN/SIRET/VAT on the registry, Scaleway phone.

---

## 15. QA checklist for this deck's strings

- No U+2013 or U+2014 anywhere (checked on this file).
- No banned words in visible copy: écosystème, synergie, abondance, alignement, holistique, disruptif, 10x, liberté financière, spirituel, vibration, fréquence, non-dualité, éveil, vacuité, Mycelial, mycélienne, CRQPT, Daimon, telos, orchard; "anarchie" only inside the manifesto body (checked).
- Home FR: 135 visible words with current titles, 119 static; no sentence over 9 words.
- At most one wink per screen: logo tooltip (chrome), « C'est exactement ma taille » (home), « Le reste, on en parlera » is plain, not a joke. No wink in legal text, pricing chips or field labels.
- "tu" and "tú" everywhere, including the legal notice.
- Every external link is a plain row or text link. The only glass button is « Envoyer à William ».
