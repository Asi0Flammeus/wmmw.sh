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

1. **Line-layer alpha.** §1.2 says every line layer peaks at `--fringe-a` with no multiplier (dossier §9 cap, confirmed by the lab README); §5.2 (base ×2.6) and §5.4 (Q2 ×1.5) still carry multipliers. Built without multipliers.
2. **Q2 at rest.** A9 (invisible at rest, fades in on hover) wins over the prototype (always visible).
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
- The em/en dash and `--` cleanup of writing bodies and `src/components/blog/*` (§9.2, about 120 occurrences in 13 files): needs a sentence-by-sentence pass; open.
- `scripts/qa/*` harness (WP1a's untracked files in the live tree were left alone) and the T1 to T16 automation; checks were run by hand (see the end report).
- `llms.txt`, `PRODUCT.md`, `README.md` refresh (WP5 docs) and the final `registry.json` path audit.
- `SCALEWAY_TEL` (not verified: null, the sentence keeps the address) and `MEDIATEUR` (not designated: the section is not rendered, the build logs one warning).
- `/lectures-sf` is untracked in the live tree, so it is not in this preview.

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
