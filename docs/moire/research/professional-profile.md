# Brief: William Moiré's professional offer, with proof

## 0. Read this first

- **The CV repo is the wrong register for this site.** `/home/crqpt/repos/Asi0Flammeus/william-lecompte-cv/data.typ` and `cv.typ` are a French CV for temp agency work. The title is "Employé polyvalent, disponible immédiatement" and it lists grape harvesting, warehouse and library jobs. Use it for dates and facts only, never for tone. It also contains a phone number and a street address, which must not be used.
- **Some CV facts contradict each other or the evidence.** The owner should confirm these before any of them goes on the site:
  - **Plan B scale:** `data.typ` says "40+ cours traduits en 30 langues". `cv.typ` says "20+ cours traduits en 20 langues". The repo supports roughly 40 courses in about 30 languages (section 3).
  - **Teaching subject:** `data.typ` says biostatistics for third-year pharmacology students. `cv.typ` says physics tutorials for undergraduates.
  - **Plan B dates:** the CV says 2019 to 2024. But his GitHub bio still says "Head of Content at @PlanB-Network", he has 136 commits in 2026, and PR #4552 merged on 2026-07-04. The role looks current.
  - **Master and PhD dates:** the CV puts the Master in 2018 to 2019. The orchard note `sympoiesis-research/CONTEXT.md` says "2020-2023 : Master + thèse".
  - **Job title:** the site hero says "DevOps indépendant" (`src/i18n/ui.ts`). The CV says "Développeur généraliste indépendant, CRQPT, 2024 to today".
- **Three B2B fronts overlap.** alysis.cat sells custom sites to artisans. Maison Lysalis is a drafted, unconfirmed offer: agents and sovereign automation for notaries, building firms and upscale hotels. wmmw.sh is the person. Recommendation: wmmw.sh is the hub, and it sends craft-website requests to alysis.cat.
- **qmd search did not work.** `qmd-remote status` showed an empty index ("0 files indexed") and `query` hung, so I searched the vault (`~/nondual-mind`) with grep instead.

---

## 1. Professional profile

**Education**

- Physics bachelor's degree, Université Grenoble Alpes (UGA), 2013 to 2017.
- Master "Complex Living Matter", UGA (dates need confirming, see above).
- **PhD in physics**, discipline "Physique pour les sciences du vivant", UGA. Defended 31/01/2023.
  - Title: *"Theoretical and numerical description of the interaction between processive motors and the microtubule lattice"*.
  - Sources: theses.fr API for NNT 2023GRALY001; DOI 10.70675/e5b8f4a2zfcdfz4eb5za15bzcf50ac428456.
  - He built the MoTub model, a kinetic Monte Carlo simulation. Its optimised algorithm is **420x faster** (a 99.8% cost reduction): 30x from updating only the neighbourhood of each event, the rest from redundant list-of-lists structures. Source: `goals-to-actions/docs/orchard/sympoiesis-research/missions/motub-kmc-v2/INDEX.md`.
  - Code is public at github.com/WilliamLec/kMC_MoTub.
- Teaching: part-time lecturer at UGA, 2019 to 2022 (subject needs confirming).
- Languages: French native, English fluent at scientific level, Spanish working level (0.66 self-rated in `raw/PBN Builder ID Card.md`). The site is trilingual FR/EN/ES.

**Roles**

| Role | Evidence |
|---|---|
| **Head of Content and content repo maintainer, Plan ₿ Network / Plan ₿ Academy** (Plan B Network SA, Lugano) | GitHub bio. **#1 contributor** to `PlanB-Network/bitcoin-educational-content`: 1,467 commits per the GitHub API, out of 5,121 in the repo. 229 merged PRs. Repo has 120 stars and 271 forks. Coordinates course coordinators by domain (Social studies, Business, Mining, Protocol/Lightning, Security, Bitcoin), per `journal/2026-08-30 - Actual Course Coordinators.md`. University programme and professor network work is in `raw/logs PBN Education.md`. |
| **Course author, Plan ₿ Academy** | MIN303 "The World of Bitcoin Mining" (advanced theory seminar, 16 h). MIN304 "Heat your home while mining bitcoins" (practice, 6 h, co-authored). Source: `courses/min303`, `min304/course.yml`. |
| **Secretary and manager, Découvre Bitcoin** ("the engine oil") | Team coordination, AI tools (LLM-Translator), infrastructure (servers, Lightning node), accounting and treasury, migration to Ghost (`raw/DB - Core Contributeurs.md`). Plus a 6-month cleanup of contractor accounting (`orchard/db/missions/contractor-accounting-cleanup.md`). |
| **Independent general developer, CRQPT** (French sole-trader status, moving to a WMMW entity), 2024 to today | "Tout le cycle en autonomie : sites web, web apps, outils internes, serveurs. Relation client, devis, facturation et comptabilité" (`data.typ`). |
| **CTO, alysis SAS** (alysis.cat, Chambéry) | Custom sites for artisans, plus maintenance and analytics. A two-person atelier "plus a cat" (`orchard/alysis/CONTEXT.md`). Delivered real client sites (section 3). |
| **Sympoesis Research** (open, interdisciplinary science) | The thesis algorithm is being rebuilt as a reusable kMC engine that works for any physical model. Phase 0 and 1 are done: 21 tests pass and the TASEP analytic check passes. The repo `Asi0Flammeus/kMC_simulation` is private. |

**Skills stack** (all seen in real repos)

- **TypeScript:** Bun, Hono, Astro, SvelteKit (Svelte 5), React/Vite, vanilla TS PWAs. Realtime over SSE, WebAuthn passkeys, web-push (VAPID), service workers, magic links (Resend).
- **Python:** uv, FastAPI, a desktop GUI plus REST API (Language-Toolkit), NumPy and scientific code, PyPI publishing (dicton).
- **Rust:** lazyagent TUI. **Kotlin/Android:** fold8-pdf-reader on MuPDF. **Bash.**
- **Data and infra:** SQLite as the default; Docker and compose; Cloudron self-hosting; systemd user services; Tailscale; nginx; rclone and Nextcloud; GitHub Actions CI.
- **AI:** headless agent orchestration (omp, Claude Code), multi-agent pipelines with deterministic verifiers, translation at scale (DeepL, OpenAI, Google, ElevenLabs), speech-to-text (Whisper via Groq, ElevenLabs Scribe), text-to-speech, typed LLM judgments (Jev), voice interfaces with undo.
- **Bitcoin:** Lightning node operations, BTCPay, home mining, education.
- **Beyond code:** pedagogy and curriculum design, coordinating international volunteers and contractors, treasury and invoicing, French copywriting.

---

## 2. Problems he can solve, and who would hire him

| # | Client problem (in their words) | Who and when | Proof |
|---|---|---|---|
| 1 | "Our knowledge is stuck in one language." | Education platforms, open-source projects, NGOs, course creators, documentation teams | Plan ₿ translation pipeline, 3 generations; Language-Toolkit; unfocus.art in 5 languages |
| 2 | "A repetitive admin task eats my week." | SMEs, traders, offices, artisans; anyone sending the same message, quote or report by hand | Christ'Offres: WhatsApp sales offers for a produce trader. Approval before anything is sent, client's language, currency and incoterms per client (`alysis-cat/demex-automatisation-offre-commerciale/docs/CONTEXTE.md`). Voice edits to a shopping list, with undo (`shared-shopping-list`) |
| 3 | "We want AI agents without losing control or our data." | Small teams, independent consultants, privacy-minded orgs, Bitcoin orgs | Translation v3: "do not ask the model to hold the frame, and do not ask the frame to speak the language". lazyagent, agentic-toolbox, self-hosted stack on Cloudron |
| 4 | "We need a small, solid tool, fast." | Associations, small teams, families, internal ops | Bun + SQLite PWAs that run in production: cachet-coche (medication reminders, passkeys, push), kyma-pulse, finances-cockpit, a realtime multiplayer Mastermind |
| 5 | "Our Bitcoin org's operations are a mess." | Bitcoin-native orgs in FR/CH/BE paying contractors in sats | Découvre Bitcoin treasury, Lightning node, contractor reconciliation. Rated 74/100, the best of 6 solo-business ideas, in `mycelic-wealth/notes/2026-07-31 - 6 idees business solo...` |
| 6 | "Our simulation is too slow or impossible to reproduce." | Research labs, scientists, R&D teams | 420x kMC speedup; test-first rebuild of the engine |
| 7 | "Turn our expertise into a course, or train our team." | Orgs needing curriculum, workshops or onboarding | MIN303/MIN304, university teaching, coordinating courses across 6 domains |
| 8 | "My website doesn't look like me." | Artisans, shops, artists | **Send to alysis.cat** (Holy, unfocus.art) |

Who hires him and why: he is a physicist who ships. He covers the whole loop alone, from diagnosis to code, servers and handover, and he documents it in the open. The client owns the code ("Souveraineté du client : tout en open source, le code appartient au client", alysis CONTEXT).

---

## 3. Proof points usable on the site

**Plan ₿ Academy** (local clone at `/data/crqpt/repos/PlanB-Network/bitcoin-educational-content`)

- **#1 contributor:** 1,467 commits, 229 merged PRs (GitHub API, 2026-10-17).
- **Catalogue:** about 41 courses with near-full coverage in 28 languages (32 language codes exist at least partially). 319 tutorials. 10,102 markdown content files.
- **Glossary:** 768 terms in 29 languages (internal SEO audit of planb.academy, 2026-03-31).
- **PR #4552**, "[SCRIPT] update translation pipeline": merged 2026-07-04, +1,837 lines. Full-scale run: "29 languages, 1349 files, almost everything passes" (`src/content/writings/29-languages-one-pr-en.mdx`). It makes a strong public case study.
- The Lysalis drafts say "400 tutos". The repo shows 319, so say **300+**.

**Shipped tools** (public repos)

- **dicton:** on PyPI, CI badge, push-to-talk dictation with 5 modes.
- **lazyagent:** Rust TUI with remote hosts and a "teleport" feature that moves an agent's session to another machine.
- **Language-Toolkit:** GUI plus API, 29 languages, deployed as an API.
- **drd:** design research tool. Its README thesis: "The fix is not a better prompt, it is better input".
- **LLM-Translator:** 7 stars, the ancestor of the pipeline.
- Also: agentic-cloud, mindful-navigation, fold8-pdf-reader.

**Client work** (sources: `/home/crqpt/repos/alysis-cat/alysis-cat/src/content/realisations/*.json`, `alysis-cat/` repos)

- **unfocus.art:** painter's portfolio and shop, 5 languages, original and print sales, built for visitors who scan a QR code in the gallery. Live since 2026-02.
- **holy-belleile.fr:** sandwich shop that "vivait sur Instagram". Its own palette and lettering, plus a burger that unfolds on scroll. Live since 2026-07.
- **alysis.cat:** the atelier's own site.
- Mockups prepared for several local prospects (not named here).
- Business automation: Christ'Offres (WhatsApp). Name the client only with consent; otherwise "a produce trader".
- Don Popote: recipe-curator SaaS in beta, Stripe live.

**Research:** thesis on theses.fr, public code (WilliamLec/kMC_MoTub), 420x speedup.

**Writing already on the site:** "A workflow to lose your head over", "The Pareto Estimator", "Talking to Silicon".

**Quotes worth reusing** (all dash-free):

- "Determinism no longer replaces the model's intelligence. It gives it a riverbed." (PR essay)
- "Brute force, here, is not an absence of care. It is a redistribution of care."
- "The fix is not a better prompt, it is better input." (drd README)
- "La preuve plutôt que la confiance." (alysis principle)
- Plan ₿ professor bio: "Relentless owl flying through cyberspace, on a mission to create self-governed communities that coexist with their surroundings."

**Do not publish:** client testimonials. `avis/*.json` holds only the review requests, with no answers yet. The internal rule "Aucun chiffre de résultat inventé" also applies.

---

## 4. Proposed offer ladder

Internal price anchors already exist:

- Lysalis (`orchard/lysalis/CONTEXT.md`): paid diagnostic, 2 days, 1.5 to 2k €. 10-day mission, 8 to 12k €. Sovereign hosting and maintenance, 150 to 300 €/month.
- alysis: a 2,048 € flat site and 32 €/month maintenance at first, then launch offers of 256 to 1,024 € plus 25 to 60 €/month.

Both are unvalidated or changing. My recommendation: show the format, duration and a starting price for the Diagnostic only, as a filter, and quote the rest.

**1. Follow** (free, everyone)
- What: writings, RSS, GitHub, X. The default action for peers and the curious.
- Qualified request: none. CTA: "Follow the thread".

**2. Diagnostic** (entry point, paid, fixed price, about 2 days)
- For: a founder, small team or org with one painful recurring problem (admin flow, multilingual content, agents, internal tool).
- Deliverable: a prioritised backlog with cost estimates, which the client signs off.
- A qualified request includes:
  - the problem in one sentence;
  - who loses time today, and roughly how much per week;
  - current tools and where the data lives;
  - what "solved" looks like;
  - timeline;
  - budget range;
  - who decides.

**3. Mission** (time-boxed, about 10 working days)
- For: clients who completed the Diagnostic, or who already have a clear brief.
- How it runs: work the backlog in priority order; checkpoint and training on day 5 and day 10; code owned by the client and open source by default. Anything left over becomes the next proposal.
- A qualified request includes: the Diagnostic output or an equivalent written scope, access constraints (data, accounts, compliance), and a target start date.

**4. Ongoing care or collaboration** (two doors)
- **Care:** hosting, updates, backups and monitoring of what was built, on sovereign infrastructure, monthly and cancellable. Requires a completed mission or an existing stack he can audit.
- **Open collaboration:** open-source projects, Bitcoin education, open research (Sympoesis). Not paid by default; follows the manifesto's "spontaneous anarchy of association".
  - A qualified request includes: a project link, what you bring, what you need from him, and why it should be open.

**Routing line:** "Need a website for your craft or shop? That is alysis.cat."

**Sample copy** (EN, dash-free):

- Section title: "What I can untangle for you"
- Diagnostic: "Two days to map one stubborn problem. You leave with a priced, ordered plan, whether you hire me next or not."
- Mission: "Ten working days, one ordered backlog. You own every line of code."
- Care: "I keep what we built running, on servers you can trust."
- Collaboration: "Building something open? Tell me what you bring and what you need."
- Form hint: "One sentence on the problem, who it costs, and what solved looks like."

---

## 5. Public links and handles

| Channel | Value | Source |
|---|---|---|
| GitHub (main) | github.com/Asi0Flammeus (62 public repos; profile blog link https://blog.crqpt.com) | GitHub API |
| GitHub (academic) | github.com/WilliamLec (kMC_MoTub) | vault |
| X | x.com/asi0_flammeus (@asi0_flammeus) | `src/lib/site.ts` |
| Plan ₿ Academy | https://planb.academy/about. Professor profile "asi0", tags cypherpunk / self-sovereignty / decentralization | `site.ts`, `professors/asi0/` |
| Lightning address (published in the public repo) | asi0@decouvrebitcoin.com | `professors/asi0/professor.yml` |
| Thesis | theses.fr/2023GRALY001 | theses.fr |
| Key PR | github.com/PlanB-Network/bitcoin-educational-content/pull/4552 | essay |
| PyPI | pypi.org/project/dicton | dicton README |
| PGP | github.com/Asi0Flammeus/pgp-public-keys | vault |
| Ventures and client sites | alysis.cat, unfocus.art, holy-belleile.fr, crqpt.com | content JSON |
| Contact inbox | `CONTACT_EMAIL` is still `null` in `src/lib/site.ts`; the planned address is contact@wmmw.sh. Until then, the X DM fallback works against qualified requests. The CVs also show william@alysis.cat and contact@crqpt.com. | `site.ts`, CV |

**Kept out on purpose:** phone number, street address, the private Telegram and Signal handles in the internal builder card, personal finances, family details, and the temp-job CV context. Lysalis domains and the site were unconfirmed as of 2026-08, so it should not be presented as a live brand.
