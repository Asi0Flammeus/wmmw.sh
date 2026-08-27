# wmmw.sh

Personal branding site for William (asi0), carried by the Mycelic Wealth
philosophy. The name is a palindrome (WilliaM Mycelic Wealth, W.M.M.W: ce qui
sort du reseau y revient) and the site's thesis is the reclamation of the word
wealth: "La richesse s'echange. Elle ne s'empile pas." Wealth is
multidimensional (financiere, relationnelle, intellectuelle, experientielle,
emotionnelle), and bringing resources to others without forced retribution wins
in the long run. It showcases projects, tools, writings, and what nourishes him,
build-in-the-open.

## Stack

Astro 6 (`output: "static"`, node standalone adapter), bun as package manager
and runtime, TypeScript, Zod content schemas. No UI framework: vanilla CSS
design tokens, and the simulations plus typing effects are small vanilla TS
modules loaded as plain `<script>` in Astro components. Trilingual from day one
(FR default at root, `/en/` and `/es/` prefixed) via Astro i18n.

## Development

```sh
bun install      # install dependencies (uses bun.lock)
bun run dev       # local dev server
bun run check     # astro check (type + content diagnostics)
bun run build     # production build to dist/
bun run preview   # serve the built output locally
```

Node 22 (see `.nvmrc`).

## Content

Content lives in the repo under `src/content/`:

- `writings/`    MDX posts (migrated from crqpt), with `lang` + `translationOf`
- `projects/`    data collection (name, blurb per lang, url, status, order)
- `tools/`       data collection (name, blurb per lang, repo, status, order)
- `nourritures/` data collection (livre / film / video)
- `manifeste/`   MDX long-form manifesto

Schemas are defined in `src/content.config.ts`. UI chrome strings live in the
typed dictionary under `src/i18n/`.

## Design

Pivot éditorial 2026-08-27 (see `docs/specs/2026-08-27-pivot-editorial-lego.md`):
the terminal grammar left the chrome; the site reads as an editorial surface on
the humus/bone/gold palette, with the physarum mycelium as the signature. Mono
is reserved for dates, labels and code. `PRODUCT.md` carries the strategic
brief; motion tokens live in `src/styles/tokens.css`, and the transitions.dev
skill is vendored under `.agents/skills/` for motion work.

## Component registry (the house lego)

`registry.json` at the repo root follows the shadcn registry protocol and
distributes the site's own tokens, editorial CSS and `.astro` components.
Agents (from any project) install items with:

```sh
npx shadcn@latest add Asi0Flammeus/wmmw.sh/<item>
```

The unlisted gallery at `/lego` (noindex, out of the sitemap) renders every
item live; asi0 validates and annotates components there.

## Agent reports (UUID pages)

Agents publish self-contained HTML reports (Fold-first formats, see the
html-deliverable skill) without a rebuild:

```sh
curl -X POST https://wmmw.sh/api/reports \
  -H "Authorization: Bearer $REPORTS_TOKEN" \
  -H "Content-Type: text/html" \
  --data-binary @report.html
# -> { "id": "<uuid>", "url": "https://wmmw.sh/r/<uuid>" }
```

Pages under `/r/<uuid>` are unlisted, noindex, and served from the
`wmmw-reports` docker volume. `GET /api/reports` (same token) lists them;
`DELETE /r/<uuid>` removes one (send `Content-Type: application/json` so the
request passes Astro's cross-site form check).

## Deployment

Containerized: a multi-stage `Dockerfile` builds with bun and runs the Astro
node-standalone server on Node 22 (`node dist/server/entry.mjs`).
`docker-compose.yml` publishes the container's port 4321 on host port 4327
(4321-4326 are already used by sibling apps). On the crqpt server an nginx
vhost (`/etc/nginx/sites-enabled/wmmw.sh`) reverse-proxies `wmmw.sh` and
`www.wmmw.sh` to `localhost:4327`, with TLS issued by certbot (Let's Encrypt).

- `./deploy.sh`            first deploy (creates `.env.prod`, builds, starts)
- `./deploy.sh update`     pull latest, rebuild, restart, health check
- `./deploy.sh status`     service + local + public health
- `./deploy.sh logs`       tail container logs
- `./deploy.sh rollback`   restore the previous image
- `./deploy.sh down`       stop containers

Content is in-repo and the contact link is the GitHub profile. The only secret
is `REPORTS_TOKEN` (agent report publishing); `ANNOTATION_SYSTEM=true` enables
the QA overlay during design-review rounds. See `.env.example`.

CI (`.github/workflows/ci.yml`) gates every pull request and push to `main`:
`bun install`, `bun run check`, `bun run build`, plus a Docker image build smoke
test.

## Pending ops (outside this repo)

crqpt.com is replaced by wmmw.sh: point a 301 redirect from crqpt.com to
wmmw.sh, path-mapped for `/writings/*` to `/ecrits/*` where slugs survive. This
is a server-side ops task, tracked outside this repository.
