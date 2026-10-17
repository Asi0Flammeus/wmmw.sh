# William Moiré: brand analysis dossier (wmmw.sh redesign)

Date: 2026-10-17 · Branch: `feat/william-moire` (HEAD `42aa0ac`, same as `main`) · Preview: `moire.wmmw.sh` via `docker-compose.moire.yml` (container `wmmw-moire`, port 4356)

Inputs (verbatim, nothing dropped): `docs/moire/research/repo-history.md`, `professional-profile.md`, `worldview.md`, `voice-identity.md`, `moire-and-references.md`. Binding owner answers of 2026-10-17 override every brief where they conflict.

Copy rule for this document: every proposed visible line is free of em and en dashes. French uses "tu", Spanish "tú".

---

## 0. Decisions at a glance

| # | Decision | Basis |
|---|---|---|
| D1 | The person leads, the concept follows. H1 is "William Moiré". "WilliaM Mycelic Wealth" leaves every title. | Maïa critique 10:14Z; voice brief §1 |
| D2 | Hero sub is the owner's own line: « Faisons circuler le savoir, la pratique et la valeur. » No hero CTA. | Owner annotations 2026-10-17 (#2, #3) |
| D3 | Moiré is the only visual motif. Mycelium lives in words only ("Mycelic Wealth"). The full-page physarum canvas retires from public pages (owner confirmation required, Q1). | Maïa critique; owner "brouille la lecture" (10-17); research §1.5 |
| D4 | Two wow moments maximum, both triggered by the visitor and quickly at rest: the hero field radiating from the accent of "Moiré", and the Ghosts reveal lens. | Brief, research §1.6 |
| D5 | Four offer paths. wmmw.sh is the hub and sends website requests to alysis.cat. Qualified requests go to a server inbox as JSON. No email. | Owner answers; profile brief §4 |
| D6 | The `[w]` to `[wmmw]` per-letter rotation wordmark stays. A W rotated half a turn is an M, so it already performs the new name. | Owner like 09-04 |
| D7 | Basteleur stays for display. Long reading moves to a proportional face; mono stays for short UI text (owner to choose from a side-by-side, Q2). | Owner like 09-04; "not eye-tiring" goal |
| D8 | Canon spelling locked: **William Moiré** (precomposed é), **Mycelic Wealth**, « richesse mycélique », « riqueza micélica », "cinq dimensions" (never "formes"). | Site canon; worldview §2 |
| D9 | Light and dark are both first-class, following the system preference. Dark keeps humus and gold. Light grows from mockup A ("sous-bois" paper). | Brief; repo history |

---

## 1. Identity core

William Moiré is the public name of William Lecompte, known online for years as asi0 (asi0 flammeus). He is a physicist by training (PhD, Université Grenoble Alpes, defended 2023-01-31) who became an independent developer. He runs four things you can see and follow. He maintains **Plan ₿ Academy**, where he is the #1 contributor to the open content repo (1,467 commits, 229 merged PRs as of 2026-10-17). He builds **business websites with alysis**, his atelier in Chambéry. He makes **hyper-personalized tools and webapps** for one person or one team. And he is preparing **Ghosts**, very long-horizon agents, which are teased but not disclosed. One idea holds this breadth together: wealth has five dimensions, and it moves rather than piles up (Mycelic Wealth). Think of the person as the network and the projects as its organs: you see who he is through the work, across projects.

**Positioning (one line)**

- EN: "For people and small teams that off-the-shelf software does not fit, William Moiré is the physicist turned independent developer who builds the tool that does, in the open, with code they own."
- FR : « Pour les personnes et petites équipes que le logiciel standard ne sert pas, William Moiré est le physicien devenu développeur indépendant qui construit l'outil juste, à ciel ouvert, avec un code qui leur appartient. »

**Public line (hero sub, owner-authored 2026-10-17)**

- FR « Faisons circuler le savoir, la pratique et la valeur. »
- EN "Let's keep knowledge, practice and value moving."
- ES « Hagamos circular el saber, la práctica y el valor. »

---

## 2. The concept: why Moiré

**The metaphor in physics terms.** A moiré appears when two fine, nearly identical gratings overlap with a small shift in angle or pitch. The large pattern you see belongs to neither layer. It lives only in the relation between them. Identical, aligned layers produce nothing. A tiny shift produces a large, visible change (about 50 px of fringe travel for 1 px of layer travel at 1.15°). That is interdependence, and non-duality made concrete: the layers stay distinct, and what they make together cannot be split back into either one.

**Why it is the right name and the right image**

1. **It meets his own brief.** On 10-17 he asked for an adjective of network and exchange, not a noun ("le côté mycélium, parce que c'est un nom"), and nothing political ("mutualiste… trop politique"). He proposed "William Moiré" himself at 10:08Z.
2. **It is a physicist's word.** It is the "hidden structure made visible", which his manifesto already claims: « j'ai passé des années à chercher les structures cachées derrière ce qui se voit. »
3. **It is the logo's construction rule.** W·M (William Moiré) faces M·W (Mycelic Wealth): a figure laid over its own mirror image, which is how a moiré is made.
4. **It reads as a real French surname** and is understood in ES (*muaré*). Searching "William Moiré" turns up no living person.
5. **It turns whimsy into physics.** Small, calm input from the visitor produces a large, slow response, and it stops when they stop. That gives a living feel without autoplay.

**How it connects to Mycelic Wealth without overloading the site**

| Layer | Role | Where it appears |
|---|---|---|
| Moiré | How the brand **looks** and behaves | Logo construction, 2 wow moments, quiet details |
| Mycelic Wealth | What the brand **means** (five dimensions) | One line on home, the manifesto, the footer palindrome |
| Mycelium | Vocabulary only | Manifesto prose; never as a visual layer, never in the same sentence as moiré |

The bridge between them (state it once, on the manifesto): wealth only shows when it moves between people, just as the pattern only shows between two layers. Home never explains this. It shows the pattern and offers one line about the five dimensions.

**Translating the metaphor into client promises** (use as behaviour, not slogans): your context plus my craft gives a tool neither of us had · no cloned templates (identical layers make nothing) · you keep your code and data, I keep my craft (both layers stay intact) · small precise interventions with outsized effect.

**Brand idea in 3 words**

- **EN: "Distinct, never separate."**
- **FR : « Distinct, jamais séparé. »**
- **ES: « Distinto, nunca separado. »**

It also works as a design rule. Text and pattern stay distinct (the pattern never runs under text), yet they relate: the pattern answers the visitor. Its expressive line for the OG image, the footer and the 404 is « Deux trames. Un troisième motif. » / "Two layers. A third pattern."

---

## 3. Name architecture during convergence

**Principle:** one person, several names, one job each. Visitors meet the person first and the concept second.

| Name | Job | Shown | Never |
|---|---|---|---|
| **William Moiré** | Author and brand | Wordmark context, H1, `<title>`, `og:site_name`, bylines, JSON-LD `name`, RSS title | Accent stripped in human-facing text |
| **asi0** | Lineage and proof of work (Bitcoin, Plan ₿, GitHub) | Hero aside « Aussi connu comme asi0 » (phase 0), footer, link labels, legacy bylines "asi0 (William Moiré)", JSON-LD `alternateName` | H1, title |
| **wmmw / wmmw.sh** | Address, monogram, palindrome | URL, `[w]`/`[wmmw]` wordmark, favicon (solid), footer line | "WilliaM Mycelic Wealth" in titles |
| **William Lecompte** | Legal name (invoices: his sole-trader business, owner 10:14Z) | Legal notice, intake confirmation, small footer line | Hero, title, meta, OG |
| **Woven Maïa** | Private | Nowhere | Everywhere |
| **Maïa** | Agent collaborator | Not named by default (Q7) | |

**Palindrome reading with the new name**

```
   W · M          |          M · W
William Moiré     |     Mycelic Wealth
 the author    mirror      the lens
               axis
           w  m | m  w
```

Proposed visible line (footer): « William Moiré · Mycelic Wealth. WM | MW, un palindrome. Ce qui sort du réseau y revient. » / "William Moiré · Mycelic Wealth. WM | MW, a palindrome. What leaves the network comes back."

The old reading ("WilliaM": William starts with W and ends with M) survives as an easter egg in the manifesto's rewritten "wmmw" section, so earlier readers are not contradicted.

**Surface rules**

- `<title>` home: « William Moiré · Développeur indépendant, outils sur mesure » / "William Moiré · Independent developer, custom tools". Inner pages: « Écrits · William Moiré ».
- Meta (FR): « William Moiré, aussi connu comme asi0. Physicien devenu développeur indépendant : sites, outils sur mesure, éducation Bitcoin libre. »
- RSS title: « William Moiré : écrits » (replaces « Les écrits de William (asi0) »).
- JSON-LD: `Person` with `name: "William Moiré"`, `alternateName: ["asi0", "asi0 flammeus", "Asi0Flammeus"]`, `sameAs` GitHub, X and the Plan ₿ professor page (not the generic `/about`), plus a `WebSite` node. The full graph is in `research/voice-identity.md` §2. Whether to include the real name is Q4.
- `src/lib/site.ts`: `AUTHOR = "William Moiré"`, add `BRAND_NAME`, `LEGAL_NAME` (legal and intake pages only), `ALYSIS_URL`; keep `HANDLE = "asi0"` and `SITE_NAME = "wmmw.sh"`.
- Machine contexts use ASCII `moire` (slugs, handles, file names). Human contexts always use precomposed U+00E9.

**Convergence phases (accounts):** phase 0 at launch sets the display names to "William Moiré" and points the bios to wmmw.sh as "Plan ₿ Academy maintainer · alysis". Phase 1 (3 to 6 months) moves asi0 to the footer and schema, and may rename the X handle with the old one parked. The GitHub login `Asi0Flammeus` stays permanently, because renaming it breaks 126 repos' worth of URLs. The timing is the owner's call (Q8); the site does not depend on it.

---

## 4. Audiences and jobs to be done

| Audience | Arrives from | In 10 seconds they need | In 2 minutes they need | Success action |
|---|---|---|---|---|
| **A. Person or small team with a stuck workflow** (founder, SME, association, Bitcoin org, independent) | Referral, X, a writing, alysis | "A real person who builds custom software, and there is a way to ask." | Proof he ships (PR #4552 translation pipeline: 29 languages, 1,349 files; tools in production), how an engagement runs, a price signal, the gift/paid split | Qualified brief in the inbox |
| **B. Artisan or shop wanting a website** | Word of mouth, Savoie, alysis client sites | "Websites? That is alysis." | Real sites (unfocus.art, holy-belleile.fr), then alysis.cat | Click through to alysis.cat |
| **C. Bitcoin learners, Plan ₿ community, contributors, professors** | planb.academy, GitHub, X (asi0) | "Yes, this is asi0, the Plan ₿ Academy maintainer." | Link to the academy, the translation essay, a way to contribute | Click to planb.academy, or an open collaboration request |
| **D. Peers, builders, devs** (asi0 followers) | X, GitHub, HN-style shares | "What is he running now? What is new?" | Tools (lazyagent, dicton), writings, RSS, the Ghosts teaser | RSS or follow; star a repo |
| **E. Open collaborators** (open source, education, research) | Manifesto shares, Plan ₿ network | "He builds in the open and works with others." | The manifesto, the collaboration path | Open collaboration request |
| **F. The owner and his agents** | Daily use on the Fold (932x553, coarse pointer), agent reports `/r/<id>` | A page he can share without hesitation | Readable reports, untouched APIs, the annotation overlay on the preview | Shares a page; agents publish without plumbing |

Breadth risk ("touche-à-tout"): it is answered structurally. Present one person and four running organs, one line each. The worldview is the visible thread, not a fifth section.

---

## 5. Offer ladder and CTA philosophy

| Path | For | What happens | A qualified request needs |
|---|---|---|---|
| **1. Suivre le fil** / Follow the thread (free) | Audiences C, D, E | Writings, RSS, tools, GitHub, X. Ghosts: "more soon" (capture is Q5) | Nothing |
| **2. Un outil fait pour toi** / A tool made for you (core, paid) | Audience A | Starts with a scoped first step (a short diagnostic: a priced, ordered plan you keep whether or not you continue), then a time-boxed build, then optional ongoing care. Client owns the code. Prices are Q3 | Who you are and for whom (just me / a team of N / an organisation) · the problem in one sentence · who loses time and how often · current tools and where the data lives (optional) · what "solved" looks like · timeline band · budget band (including "not sure yet") · how to reply to you · storage consent |
| **3. Un site pour ton activité** / A website for your business | Audience B | Routed straight to alysis.cat. No form on wmmw.sh | None on wmmw.sh |
| **4. Construire à ciel ouvert** / Build in the open (not paid by default) | Audiences C, E | Open source, Bitcoin education, open projects | Project link · what you bring · what you need from me · why it should be open · how to reply |

"Autre chose / Something else" exists as a 500-character fallback.

**CTA philosophy**

1. **Zero CTA in the hero** (owner, 10-17). The first action appears after the running list.
2. **Sitewide budget: one primary action and one follow action.** The primary action opens a conversation ("Travailler ensemble"). The follow action is RSS. External destinations (planb.academy, alysis.cat) are plain row links, not buttons.
3. **Ask a question, never show a blank form.** Step 1 is a path chooser: « Qu'est-ce qui t'amène ? » Step 2 is a short narrative brief with chips for the bands. Step 3 is an honest confirmation.
4. **Route away when he is not the right door** (website to alysis, learning to planb.academy). Saying "that is not me" is part of the qualification.
5. **State the gift/paid split plainly:** « Ce que je publie est libre. Ce que je construis pour toi est cadré et payé. » This prevents the manifesto's « sans exiger de retour » from blurring paid work.
6. **Booking only after fit.** `cal.alysis.cat/william/30min` exists. If it is used, show it only on the confirmation screen of a qualifying tool brief (Q6).
7. **The glass "loupe" the owner asked for** goes only on the primary action and the header dock, never on cards that hold text.

**Inbox contract** (to implement; `docker-compose.moire.yml` already declares `INTAKE_DIR=/data/intake`, `INTAKE_TOKEN`, volume `moire-intake`)

- `POST /api/intake`: public, honeypot, size limit, in-memory rate limit, no IP persisted. It stores one JSON file per request: `{id, received_at, locale, path: "tool"|"open"|"other", fields:{...}, contact:{name, channel, value}, fit, page}`.
- `GET /api/intake` and `GET /api/intake/<id>` require `Authorization: Bearer $INTAKE_TOKEN`. `DELETE` mirrors the reports API.
- The production compose needs its own intake volume when this merges. The legal notice should state the retention period.

---

## 6. Voice

**Traits**

| Trait | Do | Don't |
|---|---|---|
| Warm, direct "tu" (FR) / "tú" (ES) | « Raconte-moi ce qui coince. » | « N'hésitez pas à nous contacter. » |
| Wonder kept awake | « Des agents qui bossent pendant que tu dors. Ça reste fou. » | "révolutionnaire", "game changer" |
| Concrete proof over claims | "PR #4552", "1,467 commits", named shipped sites | « solutions innovantes », invented numbers, testimonials (none exist yet) |
| Playful humility | « Je ne sais pas tout faire. Je sais trouver. » | "expert", "leader", rocket emojis |
| Long line, short drop | End a block on a short sentence | Walls of text or monotone staccato |
| One bridge, one image | One physics or nature image per section | Stacking concepts; "non-dualité" as a headline |
| Loops and open doors | End sections on an invitation (« Suis-le. ») | Urgency, FOMO, « Réservez maintenant ! » |

**Rules:** home sentences have at most 10 words, with at most 2 sentences per block. Allow one wink per screen, never in pricing, legal text or form fields. Keep technical density near zero on home (at most one technical word per row). EN is re-voiced, not translated. Always write casing as: alysis, Plan ₿ Academy, Ghosts, asi0, wmmw.sh, William Moiré.

**Banned in visible copy:** em and en dashes (hyphens in « Raconte-moi » are fine); shell commands as copy; non-dualité, éveil, vacuité, spirituel, vibration, fréquence; alignement, holistique, abondance, écosystème, synergie, disruptif, 10x, « liberté financière »; "Mycelial", « mycélienne », CRQPT, Daimon, telos, orchard; "anarchie" outside the manifesto (Q9); returns or ROI anywhere near "richesse".

**Sample micro-copy**

| Slot | FR | EN |
|---|---|---|
| Hero sub | Faisons circuler le savoir, la pratique et la valeur. | Let's keep knowledge, practice and value moving. |
| Hero aside | Physicien de formation. Aussi connu comme asi0. | Physicist by training. Also known as asi0. |
| Running heading | En ce moment | Right now |
| Plan ₿ Academy | Je maintiens Plan ₿ Academy. Le savoir Bitcoin, libre, dans ta langue. | I maintain Plan ₿ Academy. Free Bitcoin knowledge, in your language. |
| alysis | Des sites faits main pour des métiers faits main. | Handmade websites for handmade trades. |
| Custom tools | Un logiciel pour une seule personne ? C'est exactement ma taille. | Software for one person? That's exactly my size. |
| Ghosts | Des agents au très long cours. J'en dis plus bientôt. | Agents built for the very long run. More soon. |
| Work heading + line | Travailler ensemble · Raconte-moi ce qui coince. Je te dis franchement si je peux aider. | Work together · Tell me what's stuck. I'll tell you honestly if I can help. |
| Path question | Qu'est-ce qui t'amène ? | What brings you here? |
| Paths | Un outil pour moi ou mon équipe · Un site pour mon activité · Un projet ouvert · Autre chose | A tool for me or my team · A website for my business · An open project · Something else |
| Contact lede | Je construis le logiciel dont tu as besoin. Pas celui qu'on vend à tout le monde. | I build the software you need. Not the one sold to everyone. |
| Brief hint | Une phrase sur le problème, ce qu'il coûte, et à quoi ressemble « résolu ». | One sentence on the problem, what it costs, and what solved looks like. |
| Honeypot | Si tu es humain, laisse cette case vide. | If you're human, leave this box empty. |
| Confirmation | Bien reçu. Je lis chaque message moi-même. | Got it. I read every message myself. |
| Legal on intake | Tu échanges avec William Moiré. Devis et factures au nom de William Lecompte, EI. | You're talking to William Moiré. Quotes and invoices are issued by William Lecompte, sole trader. |
| Mycelic line | La richesse a cinq dimensions. L'argent n'en est qu'une. | Wealth has five dimensions. Money is only one. |
| Theme toggle | Plus de lumière / Moins de lumière | More light / Less light |
| Logo tooltip | Deux trames, un léger décalage. C'est tout mon nom. | Two grids, a slight shift. That's my whole name. |
| 404 | Rien ici. Mais ce rien peut tout. | Nothing here. But this nothing can do anything. |

---

## 7. Owner's taste ledger

This section is binding: the redesign must not repeat anything under "Rejected".

### Likes (keep and build on)

| Date | Like | Verbatim | Implication |
|---|---|---|---|
| 09-04 | Wordmark `[w]` expanding to `[wmmw]` with per-letter rotation | « Il faut just [w] et si on hover dessus ça devient [wmmw] avec l'animation de w rotation en m mirror » | Keep it unchanged. It already performs W/M. |
| 09-04 | Basteleur display | « j'aime bien ton bateleur » | Keep it for display. Avoid all-caps and small sizes (its "E" reads like "€"; a Bold "É" overshoots the ascent). |
| 09-04 | Nerd monospace | « un font monospace un peu terminal en mode monospace nerd » | Keep JetBrains Mono for labels, dates, nav, code and short lines. Long reading is Q2. |
| 09-07 | Glass "loupe" on important buttons and a dock | « soit un peu en mode glace morphisme. Et avec un dock, avec cet effet un peu transparent en loupe » | Glass on the primary action and the header dock only, done properly (issue #1). |
| 09-07, 10-17 | A living organism that roams and meshes | « que ça suit là où il y a la lecture »; « davantage de point d'attraction… effet plus réseau » | The "living" quality moves into a moiré that answers the visitor. Retiring the physarum is Q1. |
| 08-27 | Editorial, legible, shareable | « un moyen plus lisible, presque éditoriale… pour que je puisse facilement le partager et faire du contenu dessus » | Every page must be screenshot-worthy and readable by non-developers. |
| 08-27 | Pragmatic daily-use surface; own component lego | « pragmatique… personal branding, daily usage »; picked option C (own registry) | Keep the reports, the registry and `/lego`. |
| 09-04 | Real research and side-by-side comparison | « de la vraie recherche sur les sites de design pas du default de llm » | Present font and palette choices as compared options, not as an agent's pick. |
| ongoing | Live annotation review on the Fold | « tu actives le annotate system true comme ça je te fais un review en live » | Preview built with `ANNOTATION_SYSTEM=true`; check every page at 932x553. |
| 10-17 | His own lines | « Faisons circuler le savoir, la pratique et la valeur. »; « au service du fait main »; « Mes projets » | Use his words before anything we write. |
| 10-17 | The name itself | « Est-ce que ça ferait sens de faire William Moiré comme une sorte de pseudonyme ? » | The owner's own idea, so build on it fully. |

### Dislikes (avoid)

| Date | Dislike | Verbatim |
|---|---|---|
| 08-27 | AI slop, generic LLM look | « un site qui pue pas le IA slop »; « pas du default de llm » |
| 09-04 | Translucent card behind text | « je veux qu'elle soit complètement invisible, seulement le texte » |
| 09-04 | Redundant links | « Pas besoin de ça car chaque ligne est clickable » |
| 09-07 | Generic personal branding, photo on home | « je veux pas un truc bateau comme tout le monde »; « on va pas mettre ma photo directement sur la page d'accueil » |
| 10-17 | A background that blurs reading | « pour éviter que cela brouille la lecture » |
| 10-17 | Wordy self-description | The hero sub shrank from two sentences to one inclusive line. |
| 07-09 | Mixing unrelated projects | Dédale out of unfocus-art; don-popote belongs to alysis; Nourritures « quand le contenu sera prêt » |
| 08-27 | PRODUCT.md anti-references | default shadcn (zinc, Inter, 0.5rem), SaaS hero metrics, gradient text, glassmorphism by default |

### Rejected directions (never repeat)

| # | Date | Direction | Evidence | Guardrail |
|---|---|---|---|---|
| R1 | 08-27 (and mockup B, 07-02) | **Terminal cosplay** | « les terminaux sont trop geeky et impose une DA trop forte » | No prompts, no typed-out lines, no box drawing, no `./script.sh` copy, no TerminalPanel on public pages |
| R2 | 08-18, inferred | **Heavy 3D spectacle** (Sylva three.js, 130k blades) | Never reviewed. Nine days later he asked for a "step back" for pragmatism | No three.js scenes. WebGL only as one lazy full-screen quad for wow 1 |
| R3 | 07-06 | Whole-word mirror flip of the wordmark | « ne le fait pas tourner » | Per-letter rotation only |
| R4 | 09-04 | Scrim or glass card behind text | quote above | Text sits on the page colour. Glass on actions only |
| R5 | 09-07 | Photo on home, generic About page | quotes above | Portrait only on `/contact` (Q10). No "About me" page |
| R6 | 10-17 | Hero CTA | « pas de CTA » | Hero holds name, line and aside only |
| R7 | 07-09 | Manifeste in the nav | annotation batch `623d37d` | Reached from a home line and the footer |
| R8 | 09-04 | LLM-default type (Fraunces + Newsreader, v1) | v1 rejected; Fraunces passed over again in v2 | Do not lead with Fraunces, even though the research ranks it #2 |
| R9 | 10-17 | "Mycélium" as the name; political words | « le côté mycélium, parce que c'est un nom »; « mutualiste… trop politique » | Mycelium stays in prose. Avoid "anarchie" on public pages outside the manifesto |
| R10 | 10-17 | Woven Maïa in public | 10:10Z: keep private | Never shown |
| R11 | 10-17 owner answers | Sympoesis research and unfocus-art as running projects | Binding answer | Not in "En ce moment" |
| R12 | 10-14, inferred | CV-dense home (portrait hero, skills, timeline) | Unreviewed branch; 10-17 asks for fewer words | Home stays sparse. CV facts serve as proof on inner pages |

Content quarries that were never reviewed (use their facts, not their direction): `2c536bb` identity canopy (« J'écris et je travaille avec Maïa, le Ghost. ») and `93a5faf` CV home (`src/lib/cv.ts` sourced facts).

---

## 8. Design principles (each testable)

| # | Principle | Test |
|---|---|---|
| P1 | **Person first, in five seconds.** | 3 people who do not know him view home for 5 s and each states who he is and one thing he does. Pass: 3 of 3. |
| P2 | **The fold shows the work.** No 100dvh heroes or title bands. | At 932x553 (Fold) and 390x844, the "En ce moment" heading and its first row are visible without scrolling, on every locale. |
| P3 | **Nothing moves behind text.** | No animated or patterned layer intersects the bounding box of any text node (plus 16 px). Pattern alpha in reading zones is 0. Automated check on all routes. |
| P4 | **Few words.** | Home shows at most 140 visible words (FR, excluding header and footer). No home sentence exceeds 10 words. Inner page leads are at most 2 sentences. |
| P5 | **Calm by construction.** | At most 2 wow moments sitewide. Every motion is triggered by the visitor and settles in 600 ms or less, after which the performance trace shows no further rAF. No autoplay, no scroll-linked motion. |
| P6 | **Two first-class themes.** | Every text pair passes AA in both themes (4.5:1 body, 3:1 large text and UI). No flash of the wrong theme on load. The toggle persists and the system preference is the default. |
| P7 | **One primary action per screen, never in the hero.** | Count primary-styled actions per viewport: 0 in the hero, at most 1 elsewhere. No section links twice to the same destination. |
| P8 | **Static first, editorial not emulated.** | With JS off and with reduced motion, every page renders a designed, complete composition. A grep for prompt glyphs, box-drawing characters and U+2013/U+2014 in `src` and `public` returns nothing. |

**Palette starting point (verified with WCAG formulas)**

- Dark (current tokens): bone `#e8e2d5` on `#12100d` 14.7:1 · ink-2 `#b6ae9e` 8.6:1 · ink-3 `#8d8472` 5.1:1 · gold `#d9a24a` 8.3:1.
- Light (from mockup A): ink `#20281d` on paper `#f1f2ea` 13.5:1 · secondary `#5c5a4e` 6.2:1 · accent text ochre `#8a5a12` 5.2:1.
- Gold `#d9a24a` on paper is only 2.0:1, so in light mode it is decorative only (fills and lines, never text). One accent per theme.

**Typography starting point:** Basteleur (display, mixed case, line-height 1.1 or more, never all-caps or below about 20 px) · JetBrains Mono (nav, dates, labels, code, short home rows) · a proportional text face for long reading (research pairing #1: Atkinson Hyperlegible Next). All self-hosted, latin and latin-ext subsets, preloading only the display woff2. The final choice is Q2, decided from a side-by-side report.

---

## 9. Moiré usage rules

### Allowed moments (budget: 2 wow and 3 quiet)

| Moment | Type | Spec | Touch (Fold) behaviour |
|---|---|---|---|
| **W1. Hero "é source"** | Wow | Two radial ring gratings: one anchored on the accent of the é in "Moiré", one following the smoothed pointer (lerp 0.08). It reads as two-source interference. Server-rendered static CSS frame first; WebGL2 (single quad, no three.js) initialised lazily after LCP; masked to 0 around text blocks | Static frame until a touch inside the hero, then the second source moves to the touch point and settles |
| **W2. Ghosts lens** | Wow | Shape moiré inside the Ghosts row or card only: a draggable slit lens over 6 px ghost glyphs reveals the word. The text « Ghosts » stays readable without the lens | Drag inside the card. Reduced motion shows the revealed frame |
| Q1. Theme toggle | Quiet | 32 px button. Light: aligned hatch. Dark: one set at 8°, fringe "moon". 200 ms crossfade for the page | Tap |
| Q2. Running-row hover | Quiet | Two faint line layers; hover or focus rotates one from 4° to 1.2° (fringe 72 to 239 px) | None (hover only) |
| Q3. Static monogram | Quiet | W over mirrored M line sets for the OG image, footer signature and `/contact`. Solid monogram at 48 px and below (favicon, avatar) | Static |

If only one wow ships, it is W1.

### Forbidden

- Under any running text. Under writing bodies (`/ecrits/[slug]`) or the manifesto body. In forms and inputs. In agent reports (`/r/<id>`).
- Full-viewport moving fields, scroll-linked or parallax motion, autoplay or idle loops, device-orientation input.
- Striped page transitions ("venetian blind" theme wipes).
- Fine-line moiré at 48 px and below (favicon), gradient text, moiré inside the `[w]` wordmark animation.
- High-contrast stripes with a 12 to 24 px period. More than 5 visible fringe pairs.

### Parameters

- Line pitch 4 to 6 CSS px, snapped to DPR (`round(6*dpr)/dpr`).
- Fringe period 150 to 400 px (250 px or more on desktop). Angle range 0.5° to 3°.
- Line alpha 0.05 to 0.08 in light mode, 0.04 to 0.06 in dark mode, which keeps the fringe luminance delta under 0.10.
- DPR cap of 2. Render on demand only; stop on settle, `visibilitychange` and when out of view.
- Sinusoidal profile with `fwidth` fade (no aliasing moiré). Fallback to the static frame on context loss or when WebGL is missing.

### Accessibility guardrails

- `prefers-reduced-motion: reduce`: one composed static frame, frozen rather than removed.
- `forced-colors: active` and `print`: the pattern is hidden.
- All moiré is decorative (`aria-hidden`) and carries no information. Nothing essential needs a pointer.
- WCAG 2.3.1 is met by construction (under 10% luminance delta). Motion is triggered by interaction and settles in under 1 s, so 2.2.2 pause controls are not triggered. Interaction motion honours 2.3.3 through reduced motion.
- Animations stay gated by `html.anim`, with the `astro:before-swap` class carry-over intact.

---

## 10. Content inventory and information architecture

### Inventory verdicts

| Asset | Verdict |
|---|---|
| Manifesto FR/EN/ES (about 900 words, strong lines) | **Keep, restructure for reading.** Rewrite the "wmmw" section as W·M / M·W. Keep « On a laissé un seul chiffre confisquer un mot qui en portait cinq. » and « Si tu es tombé dessus, c'est qu'un fil t'y a conduit. Suis-le. » Wording edits are Q9 |
| Home five-dimensions block | **Reduce to one line** plus a link to the manifesto |
| Projects JSON (Sympoesis, DB & PBN, alysis) | **Replace** with the 4 running items. Plan ₿ entry names his real role. Sympoesis leaves the running list |
| Tools (lazyagent, dicton, mindful-navigation, agentic-cloud) | **Keep on `/outils`**, off home |
| Writings: workflow essay, Silicon, Pareto | **Keep.** The workflow essay is the flagship proof for path 2. Fix the dash violations in their bodies |
| hello-world (dead crqpt links) | **Fix links or unlist** (its Möbius loop is a reusable motif) |
| ce-rien-qui-peut-tout (draft) | Stays a draft; inspires the 404 |
| Portrait `src/assets/william.jpg` | Stays on `/contact` only (Q10) |
| Nourritures | Parked; remove it from `public/llms.txt` |
| `/lectures-sf` (untracked in the working tree since 09-10, SF reading list) | Status unknown (Q11) |
| Proof facts (PhD, 1,467 commits, PR #4552, shipped sites) | Use on `/projets` and `/contact` with links. Confirm the disputed figures first (Q12) |
| Testimonials | None exist. Do not invent any |

### Pages (French slugs in every locale)

| Route | Purpose | Notes |
|---|---|---|
| `/` | Who, what's running, how to work together | Spec below |
| `/projets` | "En ce moment", long form | 4 sections: what it is, my role, 2 or 3 proof facts, link. Ghosts gets one sentence |
| `/outils` | Free tools | One line each plus the real install line |
| `/ecrits`, `/ecrits/[slug]` | Writing | Proportional body, 65ch, no moiré, both themes; slugs unchanged |
| `/contact` | **Travailler ensemble**: path chooser, brief, confirmation | Gift/paid split, legal-name line, links elsewhere, portrait |
| `/manifeste` | Mycelic Wealth | Linked from the home line and the footer, not from the nav |
| `/mentions-legales` | **New.** Legal notice (paid intake) | Pattern: `alysis-cat/src/pages/mentions-legales.astro` |
| `/404`, `/lego`, `/r/[id]`, `/rss.xml`, APIs | Plumbing | Unchanged, plus the new `/api/intake` |

**Navigation:** `[w]` · Projets · Outils · Écrits · Contact · theme toggle · FR EN ES. This keeps the current order and labels, which is short enough for the Fold cover screen. No manifesto link and no CTA button in the nav.

### Home spec (FR, about 130 words)

1. **Hero** (no CTA, W1 field): H1 « William Moiré » · « Faisons circuler le savoir, la pratique et la valeur. » · « Physicien de formation. Aussi connu comme asi0. »
2. **En ce moment**: four rows. Each whole row is the link.
   - Plan ₿ Academy (to planb.academy)
   - alysis (to alysis.cat)
   - Outils sur mesure (to `/contact`, tool path)
   - Ghosts (W2, no link or follow, per Q5)
3. **Travailler ensemble**: one line plus the 4 path chips. This is the only primary action block.
4. **Écrits**: the 3 latest (ISO date and title), then « Tous les écrits ».
5. **Mycelic Wealth**: « La richesse a cinq dimensions. L'argent n'en est qu'une. » (the row links to the manifesto).
6. **Footer**:
   - palindrome line
   - GitHub · X · flux RSS · Mentions légales
   - « Éditeur : William Lecompte, EI »

---

## 11. Constraints and contracts to preserve

The full detail is in `research/repo-history.md` §3. These are the ones that bite.

- **Routing and i18n:** FR is unprefixed; `/en`, `/es` prefixed; slugs French everywhere (`localePath()`); `trailingSlash: "never"`; hreflang plus `x-default`; `ui.ts` FR canonical with EN/ES matching its shape (any new key, such as intake or legal, goes in all three); writing slugs `workflow-a-en-perdre-la-tete`, `talking-to-silicon`, `estimateur-de-pareto`, `hello-world` must survive (pending crqpt.com 301); 404 FR-only.
- **RSS:** three feeds plus head alternates plus the footer link. Retitle to William Moiré.
- **Reports:** `POST/GET /api/reports`, `GET/DELETE /r/<id>`, token, ID regex, `REPORTS_DIR`, noindex header. Node standalone adapter stays (SSR). Reports are never restyled.
- **Registry:** `registry.json` points at exact paths (tokens, reset, global, `TerminalPanel.astro`, `TermCmd.astro`, `term-type.ts`, blog components, `AnnotationOverlay.astro`, feedback API, report files). Retiring terminal UI from public pages must not delete or move those files without updating `registry.json` in the same change.
- **Annotation overlay:** build-time `ANNOTATION_SYSTEM=true` (already set in `docker-compose.moire.yml`), Alt+Y, feedback volume `moire-feedback`. Processing convention: commit listing each annotation, then back up and truncate. The 3 live prod annotations (10-17) are absorbed here: #2 and #3 are adopted, and #1's intent becomes P3. Do not truncate the prod buffer from this branch.
- **Preview isolation:** compose project `wmmw-moire`, container `wmmw-moire`, port 127.0.0.1:4356, volumes `moire-*`. Never push to `main` (CI deploys prod). Never touch the `wmmw` service.
- **Intake (new):** `INTAKE_DIR=/data/intake`, `INTAKE_TOKEN`, JSON per request, private read endpoint, no email (§5).
- **SEO:** canonical, OG, twitter; JSON-LD updated to William Moiré; sitemap excludes `/lego`; `llms.txt` refreshed; favicon is a solid monogram.
- **Umami:** the script tag stays as is.
- **a11y:** AA verified pairs in both themes; 2 px focus-visible outline (gold in dark, ochre in light); skip link; `aria-current` on nav and language links; no-JS readable; `100dvh` never `100vh`; single column below 768 px; tap targets 44 px or more; hero at most 4 text elements; at most 1 uppercase micro-label per 3 sections; no section numbers, scroll cues or decorative dots.
- **Copy:** no U+2013/U+2014 in `src` or `public`, and no `--` in MDX (writing bodies currently violate this and must be cleaned). No shell commands as copy. First person. "tu"/"tú". Canon spellings from D8.
- **Stale docs to update with the redesign:** `PRODUCT.md` ("The organism is the signature" and "Mono is seasoning, never body" both contradict current direction), and the memory note that still places the portrait in the manifesto.
- **Private, never on the site:** personal and financial matters, journals, business internals, unreleased work, phone and street address from the CV, Telegram and Signal handles.

---

## 12. Open questions for the owner

1. **Physarum.** On 10-17 you asked for more bifurcation in the mycelium canvas. On the same day the direction became one motif (moiré) with nothing moving behind text. Do we retire the canvas from public pages (recommended), or keep it as a contained figure on `/manifeste` only?
2. **Long-form typeface.** You chose a mono body on 09-04. For a site that must not tire the eyes, I propose mono for short UI text and a proportional face for writings and the manifesto. Do you want a side-by-side report (3 options, Basteleur kept) before we lock it?
3. **Price signal.** Show a starting price for the first step of the tool path (as a filter), or quote only? If bands appear in the brief, what are the numbers?
4. **Real name.** The legal notice and intake line will carry "William Lecompte, EI". Should it also appear in the JSON-LD `alternateName` (which ties the PhD to the brand), or stay on legal surfaces only?
5. **Ghosts capture.** Should "more soon" collect a contact into the inbox ("préviens-moi"), or point to RSS and X only?
6. **Booking.** After a qualifying tool brief, should the confirmation offer `cal.alysis.cat/william/30min`, or do you always reply first?
7. **Maïa in public.** Is she named anywhere (the canopy draft says « J'écris et je travaille avec Maïa, le Ghost. »), or not at all until Ghosts are disclosed?
8. **Account renames.** Set display names to "William Moiré" at launch (recommended), and rename the X handle later with @asi0_flammeus parked? When?
9. **Manifesto edits.** May we rewrite the "wmmw" section for W·M / M·W, rename « L'anarchie spontanée de l'association » (for example to « S'associer librement »), and keep « comme si ma vie en dépendait » out of client-facing pages?
10. **Portrait.** Keep the portrait on `/contact`, or remove it from the new site?
11. **`/lectures-sf`.** This untracked page (SF reading list, created 09-10) is in the working tree. Ship it, link it, or leave it out?
12. **Facts to confirm before they ship.**
    - Plan ₿ scale: "40+ courses in 30 languages" vs "20+ in 20". The repo shows about 41 courses with near-full coverage in 28 languages, and 319 tutorials.
    - Is the Head of Content role current?
    - Public title: « développeur indépendant » vs « DevOps indépendant ».
    - The 420x kMC speedup: may it be cited, with a link?

---

## 13. Owner answers (2026-10-17, binding, supersede section 12)

- **Q1 Physarum:** retire the mycelium canvas from all public pages. Code stays in the repo (registry), no canvas on the new site.
- **Q3 Price:** budget bands inside the tool brief only (`< 2 k€ · 2 à 5 k€ · 5 à 15 k€ · 15 k€ + · je ne sais pas encore`), no public price. Numbers can be corrected in review.
- **Q5 Ghosts:** yes, a tiny one-field "préviens-moi" (email or handle) stored in the same server inbox, tagged `ghosts`.
- **Q6 Booking:** no booking link. The confirmation says he reads every message himself and replies first.
- Still open, defaults apply and are marked for the annotation review: Q2 long-form face (decided by the type exploration), Q4 real name (legal surfaces only), Q7 Maïa (not named), Q8 account renames (outside the site), Q9 manifesto (minimal edits: W·M | M·W section), Q10 portrait (kept on /contact), Q11 /lectures-sf (left out: untracked work in progress, not ours), Q12 facts (conservative, verifiable wording only).
