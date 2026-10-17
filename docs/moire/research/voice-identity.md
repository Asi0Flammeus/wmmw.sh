# William Moiré: identity convergence and voice brief

Scope: identity and voice only. Evidence comes from the vault, ghost knowledge, Maïa's session logs of 2026-10-17, the wmmw.sh and crqpt repos, and public profiles.

Method notes:
- "William Moiré" does not appear anywhere in the qmd `code` index. The name was coined on 2026-10-17 around 10:08Z, so the index is too old to have it. I found the decision in `/home/crqpt/.ghost/sessions/2026-10-17T07-39-40-007Z_01a148cd-5a67-7000-b595-916fd53eb3e6.jsonl` (lines 566 to 617) and in `/home/crqpt/.ghost/sleep/wake-brief.md:9`.
- The hybrid `qmd query` runs timed out and added load to the host, so I stopped them and used BM25 search plus grep instead.
- One deviation from the read-only rule: a curl probe wrote a scratch file at `/tmp/pb.html`. I left it in place rather than delete it.

---

## 1. The William Moiré persona and the name decision

### Timeline (all sourced)

| Date | What happened | Source |
|---|---|---|
| 2026-03-08 | Bought wmmw.sh (primary: "Shell = foundational infrastructure. The real identity"), wmmw.fr (French SME trust) and wmmw.net. "4-letter symmetric domain." | `/data/crqpt/nondual-mind/raw/2026-03-08 - Domain Strategy.md` |
| Manifesto (live) | First reading of the palindrome: "Mon prénom est William. Il commence par W et se termine par M. Wealth Mycelium, c'est WM. Mets les deux face à face et tu obtiens WMMW : un palindrome. Ce qui sort du réseau y revient." Live title: "wmmw.sh : WilliaM Mycelic Wealth". | `/data/crqpt/repos/Asi0Flammeus/wmmw.sh/src/content/manifeste/fr.mdx`, `src/i18n/ui.ts` (footer.thesis) |
| 2026-08-30 | Decided to reveal the person behind Asi0Flammeus and to rename the X and GitHub accounts rather than recreate them. A fresh account was rejected: "un compte William neuf laisse trois ans post-thèse inexpliqués, le mainteneurship Asi0 EST la preuve de travail". Bitcoin stays part of one unified message. Other points: park the old handles, FR-first. | `/home/crqpt/.ghost/knowledge/identite-publique-william-wmmw.md` |
| 2026-10-17 check | Not executed yet. GitHub login is still `Asi0Flammeus`, display name "asi0", 126 repos. The `wmmw` handle on GitHub belongs to someone else (taken since 2015). Renaming the GitHub account makes the profile URL return 404 and frees the old name, so parking the old name is mandatory. | same file |
| 2026-09-20 | Older mirror: "William Mycelium" gives W·M, "Maïa + W" gives M·W. wmmw.sh is described as a shared layer, not a business. | `/data/crqpt/nondual-mind/garden/Une verticale est un organe, pas une identité.md` |
| 2026-10-17 10:05Z | asi0 by voice: he doesn't like "le côté mycélium, parce que c'est un nom", wants "des adjectifs qui font penser à du réseau… dans l'échange", and finds "mutualiste… trop politique". Maïa sends 20 adjectives and picks Meshed, Maillé and Moiré ("two weaves interfering, which is exactly W·M / M·W"). | session line 566 to 573 |
| 10:08Z | asi0: "Est-ce que ça ferait sens de faire **William Moiré** comme une sorte de pseudonyme ?" Maïa: "It sounds like a real French surname, and moire is literally a woven silk with a rippled sheen, so it rhymes with Woven without saying it." She also warns that next to Woven Maïa it reads W·M / W·M, twins rather than a mirror, and that Maillé sounds like "maillet" and is a mustard brand. | session line 577 to 591 |
| 10:10Z | asi0: keep "Woven Maïa" private; the visible site shows only the acronym, read as "William Moiré, ou Mycelial Wealth". Maïa agrees on one condition: "your real name has to be one tap away (about page, footer, invoices)". | line 592 to 602 |
| 10:14Z (binding) | asi0: "William Moire c'est plus pour ma presence en ligne (reseau sociaux etc..) et pour mes factures c'est mon auto-entreprise avec mon vrai nom." wmmw.sh is "ma personal brand international and french too, avec tout mes projets au sens large". | line 606 |
| 10:14Z (critique) | Maïa: "Put the person first… Mycelial Wealth comes after, as the lens… choose one motif, not three. Moiré is the strong one… Leave mycelium to the writing… on phones, real moiré patterns look like rendering bugs… Use it as a still, low-contrast signature (logo, section dividers, one hero image) and never as a moving background… a stranger… five seconds later can say in one sentence what you do." | line 608 to 617 |
| 11:28Z | DNS `moire.wmmw.sh` created for the "William Moiré" redesign preview. | `/data/crqpt/repos/Asi0Flammeus/wmmw.sh/docker-compose.moire.yml` |
| Status | "Not final; settled in the 18 Oct branding session." The name in Maïa's SOUL.md ("Mycorrhizal William") changes only when he decides. | wake-brief.md:9 |

### Why Moiré

1. **His own criterion.** He wanted an adjective that evokes network and exchange, not a noun, and nothing political.
2. **It reads as a real French surname**, which makes it a credible pen name in FR, EN and ES. In Spanish the fabric is called *muaré*, so ES readers know the word too.
3. **Physics.** A moiré is the interference you get when two nearly identical grids overlap with a small shift or rotation. That is a physicist's word and fits his PhD background (the "Bridge Thinker" pattern in `ghost-daimon/knowledge/asi0-self/PATTERNS.md`).
4. **The name is the logo's construction rule.** WM | MW is a pattern overlaid on its own mirror image, which is exactly what a moiré is.
5. **It is unique in search.** A web search for "William Moiré" returns no living person. Without the accent you get historical Scottish figures named William Moir ([William Moir, Wikipedia](https://en.wikipedia.org/wiki/William_Moir); [Aberdeen Roll of Honour](https://www.abdn.ac.uk/collections/our-collections/roll-of-honour/4084/); [patrickspeople.scot](https://patrickspeople.scot/ourfamily/7467.htm)).

### The accent

- Always display **Moiré** (U+00E9, NFC precomposed, not e plus a combining accent) in the logo, titles, schema and bylines, in all three languages. The accent is what sets it apart from "Moir" and from the plain noun "moire" (the fabric).
- Use ASCII **moire** wherever a machine needs it: handles, slugs, file names (`williammoire`, `william-moire`).
- Optional pronunciation aside: "Moiré, comme le motif" / "Moiré, like the pattern."
- Check that both chosen fonts (Basteleur and JetBrains Mono, per commit 586eba5) render é cleanly at display sizes.

### How the palindrome works

```
W·M          M·W
William Moiré   Mycelic Wealth
the author      the lens
      wmmw  (mirror axis between the two Ms)
```

- The public pairing is **William Moiré × Mycelic Wealth**, and it restores a true mirror. Maïa's "twins" objection only applied to pairing with Woven Maïa, which is now private.
- The older "WilliaM" reading (William starts with W and ends with M) still works. Keep it as an easter egg in the manifesto so old readers aren't contradicted.
- **Spelling to lock: Mycelic or Mycelial.** The site and the vault telos use "Mycelic Wealth" / "richesse mycélique" / "riqueza micélica". asi0 says "Micélial/Mycellial" in voice notes and Maïa writes "Mycelial". Your owner answers say Mycelic, so lock **Mycelic** everywhere and never mix. The palindrome works with either.

### Tensions to settle before building

- `PRODUCT.md` says "The organism is the signature. The physarum mycelium simulation carries the identity." That conflicts with the decided direction: moiré as the one visual motif, mycelium only in the writing.
- **Moving moiré** tires the eye and looks like a bug on phones. The wow effect should be user-triggered and brief (hover or tap shifts one layer of the monogram a few degrees), with a static state under `prefers-reduced-motion`.
- **Public accounts are out of date.**
  - X shows name "asi0" and bio "Head of Content at @planb_network / @DecouvreBitcoin", linking to planb.network.
  - GitHub's bio is "Head of Content at @PlanB-Network | ₿-focused and building sovereign communities" (both fetched live today).
  - Neither links to wmmw.sh. Both should say "Plan ₿ Academy maintainer", per your running list.
- **Whether Maïa is named in public is still open.** The canopy proposal in this worktree (`2c536bb`, `src/i18n/ui.ts`) says "J'écris et je travaille avec Maïa, le Ghost." The owner wants Woven Maïa private and Ghosts teaser-only, and the Kido OG question ("between Maïa and William") is still unanswered. Default: no Maïa on the public site.
- **The live site stacks three layers** before saying what he does: title "WilliaM Mycelic Wealth", H1 "William Mycelic", then a worldview. This is exactly the "concept eating the brand" failure Maïa described.

---

## 2. Naming architecture during the convergence period

**Principle:** one person, four names, one job each. The visitor meets the person first and the concept second.

| Name | Job | Shown | Never shown |
|---|---|---|---|
| **William Moiré** | the author and the brand | logo wordmark, H1, `<title>`, og:site_name, bylines, schema `name` | in ASCII contexts with the accent stripped |
| **asi0** | lineage handle (Bitcoin, Plan B, GitHub), proof of work | hero aside "aussi asi0" (phase 1 only), footer, contact link labels, legacy bylines, schema `alternateName` | as the H1 or the title |
| **wmmw / wmmw.sh** | address, monogram, palindrome | favicon, avatar, footer explanation, URL | spelled out as "WilliaM Mycelic Wealth" in titles |
| **William Lecompte** (legal name) | invoices, contracts, legal | legal notice (mentions légales), intake confirmation, a small footer link | hero, title, meta, OG |
| **Woven Maïa** | private | nowhere | everywhere |

### Surface by surface

| Surface | Recommendation (FR / EN) |
|---|---|
| Logo | Wordmark "William Moiré" plus the `wmmw` monogram built from two overlaid line grids with the mirror axis between the Ms. Static by default; wow effect #1 is the hover or tap shift. |
| Favicon / avatar | Solid monogram only. Fine line grids alias into unintended moiré at 16 to 32 px. |
| `<title>` home | "William Moiré · Développeur indépendant, outils sur mesure" / "William Moiré · Independent developer, custom tools" |
| `<title>` inner pages | "Écrits · William Moiré", "Writings · William Moiré" (middle dot, no dashes) |
| Meta description home | FR: "William Moiré, aussi connu comme asi0. Physicien devenu développeur indépendant : sites, outils sur mesure, éducation Bitcoin libre." EN: "William Moiré, also known as asi0. Physicist turned independent developer: websites, custom tools, free Bitcoin education." |
| og:site_name / OG image | "William Moiré", not "wmmw.sh". OG image: name, one sentence, a faint still moiré texture. |
| Hero | H1 "William Moiré", then one plain sentence about what he builds, then a small aside "Physicien de formation. Aussi connu comme asi0." |
| Manifesto "wmmw" section | Rewrite as W·M (William Moiré) + M·W (Mycelic Wealth) = wmmw, plus the "WilliaM" wink. |
| Writings byline | New posts: "William Moiré". Old posts keep `author: "asi0"`, displayed as "asi0 (William Moiré)". |
| Footer | Line 1: the palindrome sentence. Line 2: "asi0 sur GitHub et X". Line 3: "Éditeur : William Lecompte, EI · Mentions légales". |
| Contact / intake | "Tu échanges avec William Moiré. Devis et factures au nom de William Lecompte, EI." This sets expectations and gives Savoie clients a real name. |
| Legal notice (missing today) | Copy the existing pattern in `/data/crqpt/repos/alysis-cat/alysis-cat/src/pages/mentions-legales.astro` (brand, registered name CRQPT, Entrepreneur individuel, William Lecompte, SIREN, director of publication, host). wmmw.sh will take paid intake, so as I understand French rules for professional sites it needs a full legal notice. Confirm against the alysis page. |
| RSS | Title "William Moiré : écrits". Replace the current "Les écrits de William (asi0)". |

### schema.org (home)

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
      "knowsAbout": ["Bitcoin education", "Web development", "Custom software", "Long-horizon AI agents", "Physics"],
      "affiliation": { "@type": "Organization", "name": "Plan ₿ Network", "url": "https://planb.network" },
      "worksFor": { "@type": "Organization", "name": "alysis", "url": "https://alysis.cat" },
      "sameAs": [
        "https://github.com/Asi0Flammeus",
        "https://x.com/asi0_flammeus",
        "https://planb.academy/professors/asi0-aa19b8be-5958-4c45-8be8-a1582dd5a90b"
      ]
    },
    { "@type": "WebSite", "@id": "https://wmmw.sh/#site", "name": "William Moiré",
      "alternateName": "wmmw.sh", "url": "https://wmmw.sh", "inLanguage": ["fr", "en", "es"],
      "publisher": { "@id": "https://wmmw.sh/#person" } }
  ]
}
```

- `PLANB_URL` currently points to the generic `/about` page, which is weak for `sameAs`. The professor ID comes from `PlanB-Network/bitcoin-educational-content/professors/asi0/professor.yml`. planb.academy is a single-page app that returns 200 for any path, so check the URL in a real browser.
- Leave "William Lecompte" out of `alternateName` by default (see D1). Add Malt and Contra to `sameAs` only if they are rebranded consistently.

### Constants in `src/lib/site.ts`

- `AUTHOR` becomes "William Moiré".
- Add `BRAND_NAME = "William Moiré"`, `LEGAL_NAME = "William Lecompte"` (used only on the legal and intake pages) and `ALYSIS_URL`.
- Keep `HANDLE = "asi0"` and `SITE_NAME = "wmmw.sh"` (feed and URL contexts only).
- `PLANB_URL` becomes the professor page.

### Convergence phases (accounts)

| Phase | Site | X | GitHub |
|---|---|---|---|
| 0, at launch | Full William Moiré, "aussi asi0" in the hero aside | Display name "William Moiré (asi0)", bio points to wmmw.sh, drop "Head of Content" | Display name "William Moiré", blog field https://wmmw.sh, bio "Plan ₿ Academy maintainer · alysis" |
| 1, about 3 to 6 months | asi0 moves to footer and schema only | Rename to @williammoire or @WilliamMoire and immediately park @asi0_flammeus with a new account (BEC and Plan B link to it) | Keep the `Asi0Flammeus` login. Renaming costs 126 repos' worth of redirects and a 404 profile, for little gain. |
| Permanent | asi0 stays in Plan B professor records, commit history and the GitHub login. It works as a dev signature, not a brand. | | |

Handle snapshot (2026-10-17, not reservations): `github.com/WilliamMoire`, `williammoire`, `wmoire` and `WMMW-sh` return 404. fxtwitter returns 404 for `WilliamMoire`, `williammoire`, `wmmwsh` and `wmmw_sh`, which can also mean suspended accounts. GitHub `wmmw` and Instagram `asi0` are taken.

### Owner decisions to raise (18 Oct session)

- **D1.** Real name in the JSON-LD `alternateName`? It would link the PhD and Malt/Contra credibility to the brand, at the cost of the pseudonym's separation. Today the link already exists in practice (alysis.cat legal notice, Malt and Contra profiles "williamlecompte").
- **D2.** Display-name change only, or a handle rename too, and when?
- **D3.** Is Maïa named in public copy? Default: no.
- **D4.** Lock Mycelic over Mycelial.
- **D5.** Portraits. His rule ("dépenser son image seulement quand elle apporte quelque chose de considérable", `garden/Tenir un fort pseudonymat devient plus coûteux….md`) and the current signature portrait need a deliberate yes.

---

## 3. Voice profile

**Sources:** `writings/hello-world-fr.mdx`, `ce-rien-qui-peut-tout-fr.mdx`, `talking-to-silicon-fr.mdx`, `estimateur-de-pareto-fr.mdx`, `29-languages-one-pr-fr.mdx`, the crqpt i18n (`/home/crqpt/repos/Asi0Flammeus/crqpt/src/i18n/ui/fr.json`), his voice notes, `ghost-daimon/knowledge/asi0-self/{STYLE,VALUES,RED_LINES,PATTERNS}.md`, and the garden notes on sentence rhythm.

**Caveat:** several essays are co-signed ("Par asi0 et Chiron", "Par asi0 & Daïmon"). His own note says a model reformulating dictation "ne garde qu'une partie du style". `hello-world` and `ce-rien` are the most purely his. His older essays use em dashes; the current rule bans them.

**Global settings**
- **Address:** **tu** in FR, **tú** in ES. This matches his essays ("bienvenue à toi"), the current contact page ("Écris-moi là où tu te sens chez toi") and alysis.cat ("Tu cherches l'excellence pour ton service"). Drop crqpt's "vous" and "Nous contacter"; he works solo.
- **Sentence length:**
  - Homepage micro copy: at most 10 words per sentence, at most 2 sentences per block.
  - Body text: 8 to 25 words, averaging about 15, with at most one long crescendo sentence per section.
  - He cares about this: "une phrase courte coupe, une phrase longue emporte" (garden note on Provost).
- **Humour:** dry and self-directed, delivered in asides. At most one wink per screen. Never at the visitor's expense, never in pricing, legal or form fields.
- **Technical density:** close to zero on the homepage, with one technical word per card at most, glossed in plain words. The current meta "TUI pour agents, CLI cloud" fails this. Depth belongs in the writings. English tech terms are fine in FR where he would say them out loud (workflow, PR, agents).
- **Casing:** alysis (lowercase), Plan ₿ Academy, Ghosts (capital G), asi0 (with a zero), wmmw.sh, William Moiré.
- **EN is re-voiced, not translated** ("Ce qui sort du réseau y revient" becomes "What leaves the network comes back").

| # | Trait | Evidence | Do | Don't |
|---|---|---|---|---|
| 1 | Warm, direct tu | "Bonjour (ou bonsoir) et bienvenue à toi !" | "Raconte-moi ce qui coince." | "N'hésitez pas à nous contacter." |
| 2 | Wonder he keeps awake on purpose | "Les humains sont excellents pour s'émerveiller mais nuls pour le rester." | "Des agents qui bossent pendant que tu dors. Ça reste fou." | "Solutions IA révolutionnaires", "game changer" |
| 3 | Bridges between physics and old wisdom | Peano's empty set, the Tao Te King and the Casimir effect on one page | One bridge per section, anchored in an image | Stacking concepts, AQAL or "non-dualité" as a headline |
| 4 | Wordplay and parenthetical asides | "là (las ?)", "à en perdre la tête", "Dis Gogol", "(encore ?)" | One wink per screen | Puns in CTAs, nested parentheses |
| 5 | Playful humility, not false modesty | "un petit bout de ce monde", "Relentless owl flying through cyberspace", "Je cherche la reconnaissance de mes pairs" | "Je ne sais pas tout faire. Je sais trouver." | "Expert", "leader", 🚀🔥 (the inventory flagged the alysis Instagram bio for this) |
| 6 | A long sentence, then a short drop | "Il y a deux ans, c'était de la science-fiction. Aujourd'hui, c'est... juste mardi. / Et c'est précisément le problème." | Mix lengths, end a block on a short line | Walls of text, or monotone 5-word staccato |
| 7 | Concrete proof | "La PR #4552", "entre Lugano et Turin", "trois ans de traduction automatique" | Numbers, names, links | "Des solutions sur mesure innovantes", claims he can't back (RED_LINES §3) |
| 8 | Loops, mirrors, and an invitation to close | "contempler → penser → écrire → construire" and its reverse, Moebius, "Alors, que feras-tu ?", "Suis-le." | End sections on an open door | "Réservez maintenant !", urgency, FOMO |

**Hard bans:**
- em and en dashes (hyphens in French imperatives and compounds like "Raconte-moi" or "moi-même" are fine);
- terminal cosplay copy (`./lire-manifeste.sh` was removed on purpose, see PRODUCT.md);
- empty agreement words, dramatizing, announcing his own rigour (VOICE.md);
- generic marketing phrasing.

---

## 4. Ten homepage micro-copy lines (FR / EN)

1. **Hero sub.** FR: "Je construis le logiciel dont tu as besoin. Pas celui qu'on vend à tout le monde." EN: "I build the software you need. Not the one sold to everyone."
2. **Hero aside (convergence).** FR: "Physicien de formation. Aussi connu comme asi0." EN: "Physicist by training. Also known as asi0."
3. **Running-now heading.** FR: "Ce qui tourne en ce moment" EN: "What's running right now"
4. **Plan ₿ Academy.** FR: "Je maintiens Plan ₿ Academy. Le savoir Bitcoin, libre, dans ta langue." EN: "I maintain Plan ₿ Academy. Free Bitcoin knowledge, in your language."
5. **alysis.** FR: "Avec alysis, des sites faits main pour des métiers faits main." EN: "With alysis, handmade websites for handmade trades."
6. **Custom tools.** FR: "Un outil pour une seule personne ? C'est exactement ma taille." EN: "Software for one person? That's exactly my size."
7. **Ghosts teaser.** FR: "Ghosts. Des agents au très long cours. J'en dis plus bientôt." EN: "Ghosts. Agents built for the very long run. More soon."
8. **Qualified CTA.** FR: "Raconte-moi ce qui coince. Je te dis franchement si je peux aider." EN: "Tell me what's stuck. I'll tell you honestly if I can help."
9. **Mycelic Wealth teaser.** FR: "La richesse a cinq formes. L'argent n'en est qu'une." EN: "Wealth comes in five forms. Money is just one."
10. **Footer palindrome.** FR: "William Moiré, Mycelic Wealth. WM, MW. Ce qui sort du réseau y revient." EN: "William Moiré, Mycelic Wealth. WM, MW. What leaves the network comes back."

**Extra lines:**
- **Intake confirmation:** "Bien reçu. Je lis chaque message moi-même." / "Got it. I read every message myself."
- **404** (a nod to Ce Rien Qui Peut Tout): "Rien ici. Mais rien peut tout." / "Nothing here. But nothing can do everything."
- **Logo moiré tooltip:** "Deux trames, un léger décalage. C'est tout mon nom." / "Two grids, a slight shift. That's my whole name."
- **Theme toggle:** "Plus de lumière" / "Moins de lumière" (EN: "More light" / "Less light").
- **ES hero, to set tú:** "Construyo el software que necesitas. No el que se vende a todos."

Sources (web): [William Moir, Wikipedia](https://en.wikipedia.org/wiki/William_Moir) · [Aberdeen Roll of Honour](https://www.abdn.ac.uk/collections/our-collections/roll-of-honour/4084/) · [patrickspeople.scot](https://patrickspeople.scot/ourfamily/7467.htm)
