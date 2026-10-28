# William Moiré: build log (feat/william-moire)

Date 2026-10-27. Builder: MoireBuild (one pass, WP2 to WP5 and WP1b of `02-design-direction.md` on top of WP1a).
Preview: https://moire.wmmw.sh (ANNOTATION_SYSTEM=true, noindex in the page and `X-Robots-Tag` at the edge).

## What was built

| Area | Files |
|---|---|
| i18n namespaces | `src/i18n/ns/{home,projets,outils,ecrits,manifeste,contact,intake,legal,notFound}.ts`; legacy block of `ui.ts` deleted (keeps `nourritures` and `meta.nourritures`), `LEGACY_KEYS` empty |
| Home | `HomePage`, `home/{HomeHero,RunningList,RunningRow,WorkBlock,LatestWritings,WealthLine}`, `moire/{MoireField,w1.ts,GhostsLens,w2.ts}`, Q2 in `RunningRow`, `visual/{StepsLine,FiveStrands}` (M4, M5, M6) |
| /projets | on demand, `projets/{ProjectSection,Part,LinkedText}`, open `GhostsNotify` handling the no-JS post |
| /outils, /ecrits, posts, /manifeste | `OutilsPage` + `outils/CopyLine`, `EcritsIndexPage` + `ecrits/WritingRow`, `EcritPostPage`, `ManifestePage`; tool blurbs from the deck; manifesto edits M1 to M5 and the « W·M \| M·W » section in 3 locales |
| /contact and the intake | on demand, `contact/{Gets,Elsewhere}`, `intake/{IntakeForm,PathCards,ChipGroup,Field,ChannelFields,IntakeConfirmation,GhostsNotify,intake.client.ts,ghosts.client.ts,intake.css}` |
| Inbox backend | `src/lib/intake/{rules,schema,summary,fit,messages,token,ratelimit,store,process,auth}.ts`, `src/pages/api/intake/{index,[id],start}.ts` |
| Legal | `/mentions-legales` (3 locales), `LegalPage`, `legal/legal-{fr,en,es}.mdx`, `src/lib/legal.ts` |
| 404, /lab, /lego | trilingual 404; `/lab` from `public/lab/**` + `src/lib/lab-data.json` (`scripts/lab-assets.mjs`); `/lego` rebuilt with the new primitives |
| Identity | `public/favicon.svg` (solid monogram, light/dark), `public/apple-touch-icon.png`, `public/og/default-{fr,en,es}.png` from `src/assets/og/og.html` via `scripts/og-render.py` |
| Ops | `docker-compose.moire.yml` (port 4378 from `port-claim wmmw-moire`, `INTAKE_SECRET` required), `.env.example`, `.gitignore` (`.intake/`) |

## Decisions where the spec was silent or contradicted itself

1. **Line-layer alpha.** §1.2 says every line layer peaks at `--fringe-a` with no multiplier (dossier §9 cap, confirmed by the lab README); §5.2 (base ×2.6) and §5.4 (Q2 ×1.5) still carry multipliers. Built without multipliers, except Q2 on hover (see 2).
2. **Q2 at rest.** A9 (invisible at rest, fades in on hover) wins over the prototype (always visible). Fix pass 28 Oct: at the bare `--fringe-a` the hovered strip measured a 13 (light) / 9 (dark) luma range at 1280 × 800, invisible; the hover peak is now `--fringe-a × 4` (.32 / .24, luma range 50 / 35). At rest it stays at 0, so the §9 cap on what sits on screen holds. Touch has no Q2 column (E24): a press (`:active`) shows M3 (underline, arrow) before navigating.
3. **W1 above the name.** A16 asks the field to fade to 0 above the name. Implemented as a 64 px ramp starting 0.15em above the accent, identical in the CSS frame (third mask layer) and the shader (`uTop`). The rest centre stays at A + (90, 140) as in the §5.1 table, so the first live frame equals the static frame; "largest free area" placement was not built.
4. **W1 dock masks.** Pills are not clear zones (critique E11.6): the clear zones are the hero's own text lines.
5. **V1 travelling dot.** Drawn as the list's `::after`, a grid item spanning beats 1 to 2, moved by `background-position`: no script measures anything (the spec forbids client JS for V1/V2).
6. **RSS follow block under the list** (A19 over the §7.4 order). The `rss.xsl` designed feed page was **not built**.
7. **`fit.ts` and `summary.ts`.** Fit stays server-only in `fit.ts`; the confirmation composition is the pure, shared `summary.ts` (critique E13); error texts and field ids in the pure `messages.ts`.
8. **Token-less no-JS Ghosts posts** get their own caps (1 per 10 min per key, 10 per day) per critique E19; ghosts duplicates count as accepted.
9. **French narrow no-break spaces in MDX** are written as `&#8239;` (TS sources use `\u202F`).
10. **lazyagent install line** `cargo install --git https://github.com/Asi0Flammeus/lazyagent`: verified structurally (public repo, single root `[package] name = "lazyagent"`), not by compiling (no Rust toolchain on this host).
11. **Proof facts re-checked 2026-10-27:** MIN303 page (`/courses/the-world-of-bitcoin-mining-e0d23913-…`, title served by planb.academy), `course.yml` (16 h, advanced, professor id), contribution guide anchor, holy-belleile.fr 200, unfocus.art 302, PyPI dicton 200, SIREN/SIRET/VAT/address on alysis.cat/mentions-legales.
12. **Proof 2 of Plan ₿ Academy** carries « Le récit » on a second line of the same list item.
13. **Ghosts done state:** after a success in the session, the closed home disclosure disappears entirely; the open `/projets` one shows the done line.

## Deliberately not built

- Booking or reservation pages (owner Q6, asi0 27 Oct: later, maybe a dedicated webapp).
- `rss.xsl` (designed feed page, A19).
- `scripts/qa/*` harness (WP1a's untracked files in the live tree were left alone) and the T1 to T16 automation; checks were run by hand (see the end report).
- `llms.txt`, `PRODUCT.md`, `README.md` refresh (WP5 docs) and the final `registry.json` path audit.
- `SCALEWAY_TEL` (not verified: null, the sentence keeps the address) and `MEDIATEUR` (not designated: the section is not rendered, the build logs one warning).
- `/lectures-sf` is untracked in the live tree, so it is not in this preview.

## Home performance (fix pass 28 Oct)

LCP element: the `h1` (« William Moiré », Basteleur, preloaded). Nothing is render-blocking (CSS inlined, scripts are modules); the cost was main-thread work and bytes before the first paint.

- **W1 WebGL boots on the first pointer intent in the hero**, no longer at load + idle (`w1.ts`). The static CSS frame is the first live frame, so nothing changes on screen; the shader compile and first GPU commit (about 0.8 s of the 4× trace on this host) leave the load window.
- **Edge gzip is missing.** The vhost has no `gzip`, so the home ships 101 KB of HTML (64 KB of it inlined CSS, 80 KB before the `h1`) and the scripts uncompressed; gzip gives 22 KB. Needed in `/etc/nginx/applications/moire.wmmw.sh.conf` (server 443): `gzip on; gzip_proxied any; gzip_types text/css application/javascript application/json image/svg+xml text/xml;` (`text/html` is implied).

Lighthouse 13 medians, local build against a build of the previous HEAD, desktop 1280 × 800 unless noted (as `pw perf --lighthouse`); "gzip" is a local gzip proxy standing in for the vhost directive. This host benchmarks at `benchmarkIndex` 130 to 380, a slow CPU for Lighthouse (its threshold is 1000), so the default 4× CPU slowdown over-states a mid phone, and the variance is large (host load 9 to 18): single runs swing by a second.

| Profile | Before | After | Before + gzip | After + gzip |
|---|---|---|---|---|
| Lighthouse default (Slow 4G, 4× CPU) | perf .43, LCP 2.58 s, TBT 1.51 s (n=5) | perf .49, LCP 2.60 s, TBT 0.61 s (n=5) | perf .46, LCP 2.18 s, TBT 1.50 s (n=4) | perf .78, LCP 2.14 s, TBT 0.09 s (n=4) |
| Slow 4G, 1× CPU (n=4) | | | LCP 2.12 s, TBT 0.02 s | LCP 2.12 s, TBT 0 |
| Spec §5.6: Fast 4G, mobile 390, 4× CPU (n=3) | LCP 1.35 s | LCP 1.48 s | | LCP 1.12 s |
| Fast 4G, desktop 1280, 4× CPU (n=3) | perf .57, LCP 1.61 s, TBT 1.73 s | perf .78, LCP 1.40 s, TBT 0.33 s | | |

Under the spec's own profile (Fast 4G, mid phone) the LCP budget of 1.8 s holds before and after (on a coarse pointer W1 never booted at load, so the mobile difference is run noise). Under Lighthouse's default Slow 4G the LCP floor is about 2.1 s even at 1× CPU and with gzip: it is network-bound (HTML, Basteleur 45 KB, JetBrains Mono 40 KB and Schibsted 47 KB all land before the first paint). Going under 1.8 s there needs fewer font bytes before the first paint (subset or instance the two variable fonts), which the §5.6 font budget does not ask for.

## Redeploy

From the build worktree (`/data/crqpt/tmp/wt-wmmw-moire`, branch `moire-build` = `feat/william-moire` on origin):

```
git pull --ff-only   # or commit there
sudo docker compose -f docker-compose.moire.yml --env-file .env.moire up -d --build
curl -sI https://moire.wmmw.sh | head -3
```

`.env.moire` (mode 600, never committed) holds `INTAKE_SECRET` and `INTAKE_TOKEN`. Assets: `node scripts/lab-assets.mjs` (with `LAB_SRC` pointing at an explore dir that has the PNG renders) and `python3 scripts/og-render.py`.

## Roll back

1. Stop the preview: `sudo docker compose -f docker-compose.moire.yml down` (add `-v` to drop the intake, reports and feedback volumes).
2. Vhost: `/etc/nginx/applications/moire.wmmw.sh.conf` (hand-managed, TLS by certbot, already existed). It pointed at 4356 before this build; the copy is `/data/crqpt/tmp/moire.wmmw.sh.conf.bak-4356`. To remove the site: `sudo rm` the file, `sudo nginx -t && sudo systemctl reload nginx`.
3. DNS: `moire.wmmw.sh A 163.172.31.176` already existed (created 17 Oct with asi0's go); this build did not touch DNS. Removal goes through the OVH procedure in `~/.ghost/knowledge/dns-records-on-ovh-zones-…md` (DELETE the record id, then refresh the zone).
4. Port: `port-claim release wmmw-moire`.
