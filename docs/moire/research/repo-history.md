# wmmw.sh: design history, owner taste and constraints (research brief)

Repo: `/data/crqpt/repos/Asi0Flammeus/wmmw-sylva` (branch `feat/william-moire` = `main` = `42aa0ac`). The live site at https://wmmw.sh runs `main`. `moire.wmmw.sh` does not resolve yet.

## 0. Key takeaways for the redesign

- **The freshest feedback is from today, 2026-10-17.** Three annotations are live and unprocessed at `https://wmmw.sh/api/prototype-feedback`:
  1. Make the background mycelium path contrast more with the page text so it stops blurring the reading. Add more attraction points to get more bifurcation, "effet plus réseau".
  2. Replace the hero sub with only: **"Faisons circuler le savoir, la pratique et la valeur."**
  3. Hero "Lire le manifeste" button: **"pas de CTA"**.
- **The direction is steady: fewer words, more invitation, no decoration over legibility.** "Je fais circuler le code…" became "Faisons circuler… la pratique".
- **Constant dislikes:**
  - geek cosplay (terminal DA: "trop geeky", "impose une DA trop forte")
  - generic AI look ("un site qui pue pas le IA slop")
  - LLM-default choices ("de la vraie recherche… pas du default de llm")
  - "bateau" personal branding ("je veux pas un truc bateau comme tout le monde")
  - visible translucent cards behind text
  - redundant links
- **Constant likes:**
  - the living organism as signature
  - the `[w]→[wmmw]` palindrome wordmark with per-letter w↔m rotation
  - Basteleur display font plus a "monospace nerd" mono
  - a "loupe" glass effect on the important buttons, done right
  - live annotation review on his Fold
- **He has never seen a light mode.** The site is dark-locked (`color-scheme: dark`, `#12100d`). The only light precedent is mockup A, "sous-bois".
- **Two unmerged agent branches (identity canopy, CV home) were never reviewed by him.** Treat them as content quarries, not validated direction.
- **The moiré persona keeps the palindrome** (my observation, not owner-stated). William Moiré gives the initials W.M., mirrored M.W., so WMMW still holds. A moiré is a pattern that exists only in the relation between two overlapping layers, which is interdependence made visible.

## 1. Timeline of directions (and why each was kept or dropped)

| Date | Direction | Outcome and why (evidence) |
|---|---|---|
| 2026-07-02 | **4 mockups** (`/data/crqpt/repos/Asi0Flammeus/wmmw-sylva/mockups/`):<br>A `a-sous-bois.html`: light paper `#f1f2ea`, moss `#3f6d3a`, ink `#20281d`, roman-numeral projects<br>B `b-shell.html`: full shell UI<br>C `c-reseau-vivant.html`: humus `#12100d` plus gold `#d9a24a`, physarum<br>D `d-hybride.html`: C plus terminal panels | **D chosen** with one user amendment: the scroll filament becomes physarum-driven. Spec: `docs/specs/2026-07-02-wmmw-design.md`. Locked: dark, one gold accent, Space Grotesk / Instrument Sans / JetBrains Mono. Hero thesis was "La richesse s'échange. Elle ne s'empile pas." |
| 07-02 to 07-04 | **Terminal DA plus physarum mycelium** | User QA: "the two textures read as glued at the hero seam", so the sim became ONE physarum over the whole document (`src/lib/mycelium.ts`, 1161 lines). Hero is 100dvh on every page with copy bottom-right. Terminals "wake" when a filament branch reaches them (`myc:reach`). |
| 07-06 | Annotations x2 (`95c95e1`) | Wordmark mirror flip removed: **"ne le fait pas tourner"**. Terminal lines typed char by char "comme un vrai shell". |
| 07-09 | Annotations x8 (`623d37d`) and x6 (`053b975`); logo work | Hero slogan became **"Ce qui sort du réseau y revient."**; `.disp-h` widened 22ch to 34ch; manifesto box fills the width; recherche-ouverte renamed sympoesis-research; "Dédale des Décors Dansants" removed from unfocus-art (separate project); don-popote removed (belongs to alysis.cat); dates as YYYY-MM-DD; **Nourritures removed** (`docs/specs/pages-a-dev-plus-tard.md`); line break before the last sub sentence; **Manifeste out of the nav**; softer hero scrim; English command names.<br>Logo: `[w]` expands to `[wmmw]` on hover; 10 logo concepts in `mockups/logos/index.html`.<br>Also added: Umami, the annotation overlay, the first article, CI deploy. |
| 08-18 | **Sylva three.js redesign** (`234d368`, `6ae005d`, `a986b02`, branch `feat/sylva-redesign`), "inspiration: le site three.js open source Sylva de Meng To": procedural root with 130k+40k instanced blades, paper card, fake glass, specular ring, ghost wordmark, spring dock header | **Never reviewed, never merged.** Preview on `wmmw.crqpt.com` (port 4350). Its feedback buffer is empty (`.prototype-feedback/comments.jsonl` 0 bytes; `wmmw.crqpt.com/api/prototype-feedback` returns `[]`). Nine days later the owner asked for a "step back" for pragmatism. The pivot branched from `main` (`68fd27f`) and ignored Sylva. Reading: heavy 3D spectacle was not what he wanted. |
| 08-27 | **Editorial pivot plus house lego, direction C** (`6ea857d`; spec `docs/specs/2026-08-27-pivot-editorial-lego.md`; `PRODUCT.md`) | Owner: "bien que j'apprecie beaucoup la DA actuelle j'aimerai un truc qui soit pragmatique… personal branding, daily usage… un site qui pue pas le IA slop". Then: "les terminaux sont trop geeky et impose une DA trop forte, j'aimerai un moyen plus lisible, presque éditoriale… pour que je puisse facilement le partager et faire du contenu dessus".<br>Agent proposed A (vanilla), B (full shadcn plus Tailwind) and C (own shadcn-protocol registry); he picked C.<br>Shipped: `/lego`, `/api/reports` to `/r/<uuid>`, motion tokens, annotation overlay on in prod. |
| 09-04 | Annotations x10 (`7a22e62`) | Hero: **"William Mycelic"** (he typed "Mycellic"; agent kept "Mycelic"). Sub: "Physicien de formation, DevOps indépendant et tisseur de liens par nature. Je fais circuler le code, le savoir et la valeur." Scrim card removed: "On voit le transparent de la card, je veux qu'elle soit complètement invisible, seulement le texte". `[w]` everywhere, expanding with "rotation de w en m mirror". Line break before "Elle a besoin de mycélium". "Mes projets". unfocus-art dropped. "Tous les projets" dropped: "Pas besoin de ça car chaque ligne est clickable". |
| 09-04 | **Typography: Basteleur plus JetBrains Mono** (`586eba5`) | Owner: "Fais 10 propositions de couple de fonts… Je veux de la vraie recherche sur les sites de design pas du default de llm".<br>v1 (Fraunces + Newsreader rec) was rejected. Owner: "go and find open source awesome list of fonts… intentionally aligned with the feeling of the message".<br>v2 report: https://wmmw.sh/r/3d0c8886-3ff4-4565-8782-9805c5f1cc22 (1 Basteleur + Manuale, 2 Fraunces + Alegreya, 3 Young Serif + Andada, 4 Bluu Next + Goudy, 5 Ortica + Faustina, 6 Coconat + Literata, 7 **Fungal** with its GROW axis as a hero gesture, 8 Trickster, 9 Nyght, 10 Le Murmure).<br>Owner: **"j'aime bien ton bateleur mais j'aimerai bien avec un font monospace un peu terminal en mode monospace nerd"**. Body became mono 1rem/1.6. |
| 09-07 | **Portrait signature, membrane, roaming mycelium** (`8f01118`, `08cb8f0`) | Owner (voice): "on va pas mettre ma photo directement sur la page d'accueil… une page dédiée… je veux pas un truc bateau comme tout le monde". He asked for glassmorphism on important buttons "avec cet effet un peu transparent en loupe", and for physarum attraction points "pour créer plus de maillage… que ça suit là où il y a la lecture".<br>Agent's answers: portrait as the manifeste's closing signature (masked into the humus); `backdrop-filter` "membrane" only on the CTA and header (pushback citing the PRODUCT.md anti-reference); `data-myc-node` attractors plus anastomoses. |
| 09-09 | GitHub issues | #1 "V1: revue et validation globale": validate the design system, "glassmorphism done right", review writings, project, tools and contact pages, "physalis behaviour". #2 "commentaires de blog avec contribution en sats". #3 finish and publish. |
| 09-10 | **Contact page** (`925c982`, `42aa0ac`) | Portrait moved from the manifeste to `/contact`. X is the "direct path" because `CONTACT_EMAIL` is null. No qualified CTA. |
| 09-29 | `feat/proposal-1-identity-canopy` (`2c536bb`, author "daimon"), built on the Sylva branch | Three-line identity sub: "William, aussi asi0. Une thèse en biophysique. / Bitcoin libre, recherche ouverte, Alysis. / J'écris et je travaille avec Maïa, le Ghost." Adds a Lectures block. **Unmerged, unreviewed.** |
| 10-14 | `cv-rework-20261014` (`93a5faf`) and `cv-perf-mycelium-20261014` (`6946729`), Maïa | Home as a sourced "CV dynamique": portrait in the hero, En ce moment, Parcours, Compétences, Réalisations, booking at `cal.alysis.cat/william/30min`, dash purge. Perf bounds on the canvas. **Unmerged, not deployed.** Today's annotations target `main` copy, and he asked for *fewer* words and *no* hero CTA, the opposite of a CV-dense home. |
| 10-17 | New brief (orchestrator session): William Moiré persona | Clean, sharp, not eye-tiring, no walls of text, light plus dark, whimsical micro-motion, few qualified CTAs, moiré with one or two wow effects max. |

## 2. Owner's stated likes and dislikes (verbatim where possible)

### Likes
- **A living organism that roams and meshes:** "des points de source ou d'attraction pour ce physaliste… plus de maillage… ça donne plus l'impression que ça se balade… que ça suit là où il y a la lecture" (09-07). Today: "davantage de point d'attraction pour créer davantage de bifurcation et faire un effet plus réseau".
- **Wordmark:** "Il faut just [w] et si on hover dessus ça devient [wmmw] avec l'animation de w rotation en m mirror et rotation pour devenir w" (09-04). Shipped in `src/components/Header.astro`. The rejected version was the whole-word `scaleX(-1)` flip.
- **Type:** Basteleur ("j'aime bien ton bateleur") plus "monospace un peu terminal en mode monospace nerd".
- **Glass "loupe" on important buttons and a dock:** "nos boutons ou les endroits qui sont importants soit un peu en mode glace morphisme. Et avec un dock, avec cet effet un peu transparent en loupe". Still open as "glassmorphism done right" in issue #1. He wants it done well, not refused.
- **Pragmatic daily-use surface:** articles/newsletter, tools, repos, UUID agent reports.
- **The lego approach:** the tweet he quoted: "collecting inspirations and modules from other people, building a lego of components".
- **Real research and visual comparison** before choices (fonts, palettes).
- **Copy he wrote himself:**
  - "Faisons circuler le savoir, la pratique et la valeur."
  - "Des websites, apps ou SaaS hyper-personnalisés au service du fait main."
  - "Pour artisans et indépendants"
  - "Mes projets"
- **Live review:** "tu actives le annotate system true comme ça je te fais un review en live et on itère".

### Dislikes
- **Terminal cosplay:** "les terminaux sont trop geeky et impose une DA trop forte" (08-27). Codified in `PRODUCT.md` anti-references.
- **AI slop and LLM-default design:** "un site qui pue pas le IA slop"; "pas du default de llm".
- **Translucent cards behind text:** "je veux qu'elle soit complètement invisible, seulement le texte".
- **Redundant navigation:** "Pas besoin de ça car chaque ligne est clickable".
- **Hero CTA (today):** "pas de CTA". Manifeste was already out of the nav (07-09).
- **Photo on the homepage, or a generic About page:** "on va pas mettre ma photo directement sur la page d'accueil"; "pas un truc bateau".
- **Background that hurts reading (today):** "pour éviter que cela brouille la lecture".
- **Mixing unrelated things:** unfocus-art versus Dédale; don-popote belongs to alysis.cat; Nourritures hidden "quand le contenu sera prêt".
- **Wordy self-description:** the hero sub shrank from 2 sentences to 1 inclusive line.
- **Anti-references in `/data/crqpt/repos/Asi0Flammeus/wmmw-sylva/PRODUCT.md`:**
  - default shadcn (zinc + Inter + 0.5rem radius)
  - SaaS hero metrics
  - gradient text
  - glassmorphism-by-default

## 3. Hard constraints and contracts a redesign must preserve

### Routing and i18n
- FR is the default and unprefixed; `/en/*` and `/es/*` are prefixed.
- **Route slugs stay French in every locale** (`/en/ecrits`, `/en/projets`); see `localePath()` in `src/i18n/index.ts`.
- `trailingSlash: "never"`.
- hreflang alternates plus `x-default` (FR) are emitted in `src/layouts/BaseLayout.astro`.
- `src/i18n/ui.ts`: FR is canonical, and EN/ES must match its shape (typed `Widen<typeof fr>`).
- Writings link translations via `translationOf`; the URL slug is `baseSlug()`:
  - `workflow-a-en-perdre-la-tete` (files `29-languages-one-pr-*.mdx`)
  - `talking-to-silicon`
  - `estimateur-de-pareto`
  - `hello-world`
- A pending crqpt.com 301 maps `/writings/*` to `/ecrits/*`, so these slugs must survive.
- `404` is FR-only.

### RSS
- `/rss.xml`, `/en/rss.xml`, `/es/rss.xml` via `src/lib/feed.ts`.
- `<link rel=alternate type=application/rss+xml>` for all three locales in the head.
- Footer link "flux RSS".

### Agent reports (`src/pages/api/reports.ts`, `src/pages/r/[id].ts`, `src/lib/reports.ts`)
- `POST /api/reports` with `Authorization: Bearer $REPORTS_TOKEN` and a body of `text/html` or JSON `{html, id?}`. Limits: 8 MiB in the app, but nginx caps the body at 1 MiB. Returns `{id, url}`.
- `GET /api/reports` (token) lists reports.
- `GET /r/<id>` serves the HTML with `X-Robots-Tag: noindex, nofollow, noarchive`.
- `DELETE /r/<id>` needs the token and `Content-Type: application/json`.
- IDs must match `/^[a-z0-9][a-z0-9-]{7,63}$/`.
- Storage: `REPORTS_DIR=/data/reports`, docker volume `wmmw-reports`.
- These need SSR `prerender=false`, so the **node standalone adapter must stay**.
- Reports are self-contained HTML and not styled by the site. At least one is in active use (the fonts report).

### `/lego` and `registry.json`
- `/lego` (`src/pages/lego.astro`) is noindex and filtered out of the sitemap in `astro.config.mjs`.
- `registry.json` items reference **exact file paths**: `src/styles/tokens.css`, `reset.css`, `global.css`, `TerminalPanel.astro`, `TermCmd.astro`, `lib/term-type.ts`, `blog/Timeline|Poll|Math|ZenCountdown|PeriodicTable|PeriodicColumn.astro`, `AnnotationOverlay.astro`, `api/prototype-feedback.ts`, the reports files.
- Agents install with `npx shadcn@latest add Asi0Flammeus/wmmw.sh/<item>`.
- **Renaming or moving these files breaks the registry**, so update `registry.json` in the same change.

### Annotation overlay
- `src/components/AnnotationOverlay.astro`: "Annoter" button bottom-right, Alt+Y, z-index 9999. It uses `var(--font-mono)` and `var(--text-sm)`, which are not defined here and fall back.
- `src/pages/api/prototype-feedback.ts`: POST and GET (`?page=` filter), no DELETE. Schema includes `viewport.pointer`.
- Gated by the **build-time** arg `ANNOTATION_SYSTEM=true` (Dockerfile ARG, docker-compose build arg).
- Feedback volume: `wmmw-feedback` mounted at `/app/.prototype-feedback`.
- Processing convention: commit `feat(...): applique N annotations (...)` listing each one, then back up and truncate `comments.jsonl`.

### Umami
- In the head: `<script defer src="https://umami.crqpt.com/script.js" data-website-id="3d240735-3660-427b-b997-4421c359d435">`.

### SEO
- canonical, OG and twitter tags.
- JSON-LD `Person` on the home page (`name: "William"`, `alternateName: "asi0"`, `sameAs` GitHub/X/PlanB). This needs updating for "William Moiré".
- Sitemap, `public/llms.txt` (stale: still lists Nourritures), and the `[w]` `public/favicon.svg`.

### Deploy (collision risk)
- `docker-compose.yml` hardcodes `container_name: wmmw`, host port `4327`, and volumes `wmmw-reports` and `wmmw-feedback`.
- Pushing to `main` triggers CI and then `./deploy.sh update` on prod.
- A `moire.wmmw.sh` preview therefore needs its own compose project, container name, port and feedback volume, and must never push to `main`.
- Precedent: Sylva used a `docker-compose.preview.yml` on port 4350 (that file is not in this tree).

### a11y rules (spec plus `PRODUCT.md`)
- WCAG AA on verified pairs; worst historical case was 4.83:1.
- focus-visible 2px gold outline.
- Full keyboard reach and a skip link ("aller au contenu").
- `aria-current` on nav and language links; aria-labels on the language switcher.
- Every animation gated by `html.anim` (set only when there is no `prefers-reduced-motion`) with a designed static state.
- No-JS keeps all content readable.
- `100dvh`, never `100vh`.
- Single column below 768px.
- The `astro:before-swap` carry-over of the `js/anim/armed` classes is required with ClientRouter.
- 2026-07-02 layout rules:
  - hero has at most 4 text elements
  - at most 1 uppercase micro-label per 3 sections
  - no section numbering, scroll cues, decorative dots or locale strips
  - the layout family varies per section

### Copy rules
- **No em or en dashes in any visible copy** (`ui.ts` header: "binding"). The CV branch README adds that `grep -rP '[—–]' src public` must stay empty, including `--` in MDX.
- `main` currently **violates this in writing bodies**: talking-to-silicon has 15 per locale, Pareto FR has 18, the workflow essay has 6 to 11, plus `--` in Pareto EN and hello-world.
- No shell commands as copy.
- FR uses "tu" (contact: "Écris-moi là où tu te sens chez toi").
- Write in the first person.
- Brand spelling is "Mycelic". Inconsistency: the EN teaser says "Mycelial wealth".

### Fold reading context
- `PRODUCT.md`: about 90% of report reads happen on a Galaxy Z Fold 8, often outdoors.
- Every owner annotation reports viewport **932x553, pointer coarse**. Check the hero and every page at that size: a 100dvh hero there is only 553px tall.

### Typography gotchas
- Basteleur has two cuts and no italic.
- Its decorative capitals make "E" read like "€", which makes all-caps or small labels unreadable. The language switcher was forced to mono for this reason.
- Self-host only (Velvetyne sends no CORS headers). Files: `public/fonts/basteleur-*.woff2`.
- `PRODUCT.md` still says "Mono is seasoning, never body", which **contradicts** the owner's 09-04 choice of a mono body. `PRODUCT.md` is stale on this point.
- On 09-04 the agent warned the owner that the mono body might be tiring on long writings, and invited him to annotate if so. That risk matters given the new "not eye-tiring" goal.

## 4. Content inventory

### Pages (each also under `/en` and `/es` unless noted)

| Route | Content | Strength |
|---|---|---|
| `/` | Hero, manifeste teaser, projects, tools, latest 3 writings (verbatim in §5) | No offer: says nothing about what you can get from him. Weak on "work with me". |
| `/manifeste` | `src/content/manifeste/{fr,en,es}.mdx`, about 900 words. Sections: intro, "Le mycélium ne discrimine pas", "Les cinq dimensions", "L'anarchie spontanée de l'association", "wmmw" (the palindrome explained via the name William), "Construire à ciel ouvert" | **Strong voice**, but a wall of text. Best lines: "On a laissé un seul chiffre confisquer un mot qui en portait cinq."; "La richesse ne se compte pas, elle se traverse."; "La forêt n'a pas besoin d'un arbre de plus. Elle a besoin de mycélium."; "Je ne mesure pas ce que je donne pour calculer ce que je récupère."; "Si tu es tombé dessus, c'est qu'un fil t'y a conduit. Suis-le." Will be orphaned if the hero CTA goes (it is not in the nav). |
| `/projets` | 3 projects, each in its own section with a status badge | Thin. |
| `/outils` | 4 tools with status badge and install line | OK. |
| `/ecrits`, `/ecrits/[slug]` | Index (ISO date, title, hook) and post page (65ch, cover, tags, translation switcher, `crqpt-compat.css`, KaTeX) | Good. |
| `/contact` | Portrait `src/assets/william.jpg` ("de profil dans la lumière basse d'un intérieur"). Direct path: "M'écrire sur X". Elsewhere: GitHub @Asi0Flammeus, X @asi0_flammeus, Plan ₿ Academy | Weak: no qualified path, email slot null. |
| `/nourritures` | Built but unlinked. 6 books, no notes: Haraway *Staying with the Trouble*, Wilber *Integral Psychology*, Ahrens *How to Take Smart Notes*, Rovelli *L'Ordre du temps*, Hunt & Thomas *The Pragmatic Programmer*, Laozi *Tao Te King* | Parked by the owner. |
| `/404` (FR only), `/lego` (no locales), `/r/[id]`, APIs | Plumbing | Keep. |

All non-home pages open on a **100dvh "band" hero holding only the page title**, which costs a full screen before any content.

### Projects (`src/content/projects/*.json`)
- **Sympoesis Research** (order 1, en-cours, no URL): "Je cherche à nourrir le terrain d'une science ouverte et collaborative. Ma thèse en biophysique n'était que la première étape." Weak: vague, nothing to click.
- **Découvre Bitcoin & Plan B Network** (planb.network): "Éducation Bitcoin libre et open-source, du contenu francophone à l'académie internationale." Generic; hides his real role (Head of Content, top contributor).
- **alysis.cat**: "Des sites, apps ou SaaS hyper-personnalisés pour artisans et indépendants, au service du fait main." His own wording; this is the commercial door.
- Removed or pending: unfocus-art (now an Alysis client site); **Dédale des Décors Dansants** (anthology, separate project, metadata to define); don-popote (alysis).

### Tools (`src/content/tools/*.json`, all marked "stable")
- **lazyagent** (Rust): "TUI façon lazygit pour surveiller ses agents IA dans tmux, en local comme en ssh." Strong.
- **dicton** (Python, curl install): "Dictée vocale française sub-seconde. Whisper turbo, nettoyage LLM." Strong.
- **mindful-navigation**: "une pause d'intention avant les sites distrayants." Thin but on-worldview.
- **agentic-cloud**: "CLI multi-Nextcloud au-dessus de rclone. Montages VFS, partages publics." Niche.

### Writings (`src/content/writings/`)

| Slug | Date | Locales, length | Summary | Verdict |
|---|---|---|---|---|
| `workflow-a-en-perdre-la-tete` | 2026-07-04 | fr/en/es, about 2.3k to 2.5k words, "Par asi0 & Daïmon", Timeline plus Poll | 3 years of LLM translation at Découvre Bitcoin, from raw GPT-3.5 to a headless agentic workflow (PR #4552) | **Strongest expertise proof**; maps directly to "hire me" |
| `talking-to-silicon` | 2026-02-12 | fr/en/es, about 1.5k to 1.7k words, "Par asi0 et Chiron", ZenCountdown plus PeriodicTable | Wonder at talking to matter. FR hook: "On peut parler à la matière maintenant, elle répond, et tu trouves ça normal ?" | Strong voice, interactive |
| `estimateur-de-pareto` | 2026-02-09 | fr/en/es, about 2.8k words, KaTeX, 4 images | Recursive 80/20 as a universal estimator | Solid "problem solver" piece; long |
| `hello-world` "L'invitation" | 2026-01-09 | fr/en/es, about 400 words | crqpt-era intro with **dead links** (`/fr/telos/`, `/fr/services/`, `/fr/explorations/`, crqpt form). Contains the loop "contempler → penser → écrire → construire" as a Möbius ribbon | Weak as published; the Möbius loop is a reusable identity motif |
| `ce-rien-qui-peut-tout` | 2026-02-11 | fr/en only, **draft**, about 700 words | Origin of the CRQPT name; non-duality ("La forme est vide = le vide est forme"); signature "un petit bout de ce rien" | Worldview-rich but tied to the old identity |

### Unmerged sourced facts (quarry: `git show 93a5faf:src/lib/cv.ts`)
- PhD in physics: LIPhy, Université Grenoble Alpes, defended 2023-01-31 (theses.fr 2023GRALY001).
- Head of Content at Plan ₿ Network; top contributor to `bitcoin-educational-content` with 1,467 commits (as of 2026-10-14).
- Pipeline test run: 29 languages, 1,349 files.
- Alysis: registered March 2024, Chambéry. Sites shipped in 2026: unfocus.art, Holy (holy-belleile.fr), alysis.cat.
- Skills: Docker, nginx/TLS, CI, self-hosting, TypeScript, Python, Rust, Kotlin, Astro, agentic workflows.
- Booking URL: `https://cal.alysis.cat/william/30min`.
- Alternative portrait: `src/assets/portraits/william-cutout.png` (beanie and fleece) on that branch.
- The mockups also claim "algorithme kinetic Monte Carlo quasi-O(1), 420 fois plus rapide" for the thesis. This is unverified; check before reuse.

## 5. Current home page (FR, `main`, verbatim)

Sources: `src/components/pages/HomePage.astro`, `Hero.astro`, `Header.astro`, `Footer.astro`, `ui.ts`.

- `<title>`: wmmw.sh : WilliaM Mycelic Wealth
- Meta description: "William, alias asi0. Projets, outils, écrits et nourritures, portés par la richesse mycélique : la richesse s'échange, elle ne s'empile pas."

**Header**
- Wordmark `[w]` (expands to `[wmmw]`)
- Nav: Projets · Outils · Écrits · Contact
- Language switcher: FR · EN · ES (mono)

**Hero** (100dvh, copy bottom-right, over the mycelium canvas)
- H1: William *Mycelic* ("Mycelic" in gold)
- Sub: Physicien de formation, DevOps indépendant et tisseur de liens par nature. / Je fais circuler le code, le savoir et la valeur.
  - Owner's replacement, today: "Faisons circuler le savoir, la pratique et la valeur."
- CTA chip (membrane): Lire le manifeste →
  - Owner, today: "pas de CTA"

**Section 1 (manifeste)**
- H2: La forêt n'a pas besoin d'un arbre de plus. / **Elle a besoin de mycélium.** (gold)
- Body: Le mycélium ne discrimine pas entre les nutriments. Il transporte ce dont la forêt a besoin. La richesse mycélique, c'est apporter des ressources aux autres comme si ta vie en dépendait, sans exiger de retour. Le retour vient toujours, sous une forme qu'on n'attendait pas.
- H3: Les cinq dimensions
  - Financière: des liquidités pour soutenir le vivant.
  - Relationnelle: la confiance, tissée lien par lien.
  - Intellectuelle: le savoir qui circule dans le réseau.
  - Expérientielle: les aventures que la forêt produit.
  - Émotionnelle: ce que le sol nourrit en silence.
- Link: Lire le manifeste en entier →

**Section 2:** H2 "Mes projets", intro "Les arbres que le réseau nourrit.", then rows: Sympoesis Research / Découvre Bitcoin & Plan B Network / alysis.cat with the blurbs from §4. No "all projects" link.

**Section 3:** H2 "Outils & repos", intro "Des outils libres, comme des spores : prenez, semez.", then rows lazyagent / dicton / mindful-navigation / agentic-cloud, then "Tous les outils →".

**Section 4:** H2 "Écrits", intro "Des signaux envoyés dans le réseau.", then:
- 2026-07-04 Un workflow à en perdre la tête
- 2026-02-12 Discuter avec Silicium
- 2026-02-09 L'estimateur de Pareto
- Each row shows its description; then "Tous les écrits →".

**Footer**
- `w·m·m·w`
- "wmmw.sh : WilliaM Mycelic Wealth. Un palindrome. Ce qui sort du réseau y revient."
- Links: GitHub · flux RSS · contact

**EN equivalents**
- Hero sub: "Physicist by training, independent DevOps and weaver of ties by nature. I keep code, knowledge and value in circulation." CTA: "Read the manifesto".
- "The forest does not need one more tree. It needs mycelium."
- Section heads: "My projects", "Tools & repos", "Writings".

**Visual system of record** (`src/styles/tokens.css`)
- Colors: bg `#12100d`, surf `#1a1712`, bone `#e8e2d5`, ink-2 `#b6ae9e`, ink-3 `#8d8472`, accent `#d9a24a` / `#e4b262`, hairlines bone at 12 to 14%.
- Radii: 10px tiles, pill.
- Motion: `--t-fast .16s`, `--t-base .24s`, `--t-slow .5s`.
- `--glass-*` membrane tokens.
- Fonts: `--disp` Basteleur, `--body` and `--mono` JetBrains Mono Variable.
- Section heads get a 3.5rem gold underline that is drawn when the mycelium reaches them (`myc-touched`).
- Layout alternates `offset-l` / `offset-r` (`src/styles/global.css`).

## 6. Open loops worth carrying over
- Process the 3 live annotations (today) or explicitly supersede them in the moiré branch. They are still in the prod buffer.
- Issue #1 V1 checklist (design system, "glassmorphism done right", page reviews, organism behaviour) and issue #2 (sats-funded blog comments) are natural "qualified CTA / follow" hooks.
- The memory note at `/home/crqpt/repos/Asi0Flammeus/centaur-infra/shared/.claude/projects/-data-crqpt-repos-Asi0Flammeus-wmmw-sh/memory/wmmw-pivot-editorial-lego.md` describes the portrait as the manifeste signature. That is outdated: it moved to `/contact` on 09-10.
