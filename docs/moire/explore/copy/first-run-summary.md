COPY DECK: /data/crqpt/repos/Asi0Flammeus/wmmw.sh/docs/moire/explore/copy/copy-deck.md

The deck covers every string in FR, EN and ES, plus proposed ui.ts keys, word counts, intake spec and a list of 28 defaults. No em or en dashes appear in the deck or the sketch. The banned-word scan only hits the before/after table that removes those words from the manifesto, and the closing checklist that lists them. I also built a copy-fit wireframe (home-sketch.html) and screenshotted it in the shots/ folder next to the deck, at 932x553, 1440, 1100 and 390. These are layout checks, not a palette or type proposal.

## 1. Sitemap and nav
- **Nav:** [w] · Projets · Outils · Écrits · Contact · theme toggle · FR EN ES. No manifesto link and no CTA button.
- **Routes:**
  - `/` home
  - `/projets` "Mes projets", with anchors for each project
  - `/outils`
  - `/ecrits` and `/ecrits/[slug]` (slugs unchanged)
  - `/contact`, H1 "Travailler ensemble", the intake (`?chemin=outil|ouvert|autre|site`)
  - `/manifeste`: not in the nav, linked from the home line, the footer, the end of /projets and /contact
  - `/mentions-legales` (new, anchor `#donnees`)
  - 404: one French route showing the line in all three languages
  - three RSS feeds
  - new `/api/intake` and `/api/intake/start`
- **Parked:** `/nourritures` and `/lectures-sf` are not linked, not indexed and not in the sitemap.
- French slugs in every locale.

## 2. Home copy, FR verbatim
135 visible words with today's writing titles (119 of them fixed copy). No sentence is over 9 words.

- William Moiré
- Faisons circuler le savoir, la pratique et la valeur.
- Physicien devenu développeur indépendant. Aussi connu comme asi0.
- **En ce moment**
  - Plan ₿ Academy · Le savoir Bitcoin, libre, dans ta langue. J'en maintiens les cours. ↗
  - alysis · Des sites faits main pour des métiers faits main. ↗
  - Outils sur mesure · Un logiciel pour une seule personne ? C'est exactement ma taille. →
  - Ghosts · Des agents au très long cours. J'en dis plus bientôt.
- **Travailler ensemble**
  - Raconte-moi ce qui coince. Je te dis franchement si je peux aider.
  - [V1] Raconter · Cadrer · Construire · Entretenir
  - Chips: [Un outil pour moi ou mon équipe] [Un site pour mon activité ↗] [Un projet ouvert] [Autre chose]
- **Écrits**: the 3 latest posts (ISO date and title), then "Tous les écrits"
- [V2] La richesse a cinq dimensions. L'argent n'en est qu'une. · manifeste →

The two visual explanations:
- **V1, four beats on one line.**
  - The segment between Cadrer and Construire is a double line, a quiet nod to "your context and my craft" running side by side.
  - The last segment and node are dashed, meaning "Entretenir" is optional.
  - It reappears on /contact, and on the intake confirmation with the first node filled in.
- **V2, five woven strands with only one in colour (money).** It replaces the old block of five definitions.
  - On hover the strands spread apart, then weave back together on leave.
  - On /contact it reappears as five rows of concrete gains, one per dimension, under "Ce que tu emportes".

Neither visual uses moiré, so the moiré budget is untouched. The alt text for both is in the deck.

## 3. Intake outline
1. **Step 1, "Qu'est-ce qui t'amène ?"** Four cards, each tagged with what it costs:
   - Outil: Payé, sur devis
   - Site: a plain link straight to alysis.cat, nothing stored
   - Projet ouvert: Pas payé par défaut
   - Autre chose: Court et libre
   - A line underneath sends people who only want to learn to Plan ₿ Academy, the writings and the tools.
2. **Step 2, the brief, depending on the path:**
   - Tool: who it's for, what's stuck (the only required text), what solved looks like, current tools, timeline chips, budget chips including "Je ne sais pas encore".
   - Open: link, what you bring, what you need from me, why open, optional funding chip.
   - Other: optional topic chip (question, invitation, my data) and a message of 500 characters max.
3. **Step 3, "Comment je te réponds ?"** First name or handle, one channel (Email, X, Telegram, Signal or Other) with checking per channel, the 12-month storage checkbox, a honeypot, and the send button "Envoyer à William".
4. **Step 4, "Bien reçu, {prénom}."** Their brief repeated back in their own words, then:
   - an honest line that depends on the brief
   - "réponse sous 3 jours ouvrés"
   - a reference number
   - V1 with the first beat done

The deck also specifies:
- every validation and server error message in all three languages
- the stored JSON (fields, types, limits)
- the anti-spam layers:
  - fake success on the honeypot
  - at least 8 s between page load and send, using a signed timestamp
  - 16 KiB body cap
  - 3 sends per 10 minutes and 10 per day per hashed IP, kept in memory only
  - a cap of 200 per day overall
  - an origin check
  - a daily purge after 12 months
- a fallback that works without JavaScript

## 4. Defaults chosen (owner to confirm in annotation review)
- **Prices:** no public price. Budget bands are under 1k, 1k to 3k, 3k to 10k, over 10k €, and "not sure yet".
- **Real name:** only on legal surfaces, not in the structured data.
- **Ghosts:** no sign-up capture; RSS only.
- **Booking:** no booking link; William replies first.
- **Maïa:** not named anywhere.
- **Portrait:** stays on /contact.
- **Manifesto:**
  - the "wmmw" section is rewritten as W·M | M·W, with the old "WilliaM" reading kept as a wink
  - the heading becomes "S'associer librement"
  - "abondance" and "mycélien/Mycelial" are removed, and the Spanish uses "micélica"
- **Hero aside:** "Physicien devenu développeur indépendant" instead of "Physicien de formation", so a stranger can say what he does in five seconds.
- **Reply time:** 3 working days.
- **Writings licence:** CC BY-SA 4.0, which is what makes "Ce que je publie est libre" true.
- **Proof facts:** conservative ("plus de 1 400 commits", "29 langues, 1 349 fichiers", author of MIN303); no "Head of Content" title.
- **Legal identity:** SIREN, SIRET and VAT copied from the alysis.cat legal page. The registry name is left out because it is on the banned-words list.
- **Legal contact:** through the intake only.
- **Consumer mediator:** to be named; no link to the EU dispute platform, which closed in 2025.
- **/contact rendering:** the page renders on demand so it can carry the signed timestamp, with a new optional setting `INTAKE_SECRET`.

## 5. Things to fix or decide before ship
- **The bitcoin sign is missing from the fonts.** "₿" has no glyph in Basteleur, in JetBrains Mono's latin subset or in Instrument Sans, so "Plan ₿ Academy" shows an empty box. Only JetBrains Mono's latin-ext subset has it, so it needs its own font route.
- **The fold test passes.** At 932x553 the "En ce moment" heading and all four rows are visible without scrolling.
- **Legal risk.** French law for professional sites usually expects a reachable email; intake-only contact may not satisfy it. Adding contact@wmmw.sh once the mailbox exists is the safe option.
- **Produce-trader proof.** Confirm the tool is in use and that the client is fine being described before it goes on /projets.
- **lazyagent install line.** The current one only works from inside a clone of the repo; it needs replacing.

Files are in /data/crqpt/repos/Asi0Flammeus/wmmw.sh/docs/moire/explore/copy/:
- copy-deck.md
- home-sketch.html
- shots/home-fold-dark.png
- shots/home-full-light.png
- shots/home-work-light.png
- shots/home-mobile-dark.png