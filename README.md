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

## Deployment

Containerized: a multi-stage `Dockerfile` builds with bun and runs the Astro
node-standalone server on Node 22 (`node dist/server/entry.mjs`).
`docker-compose.yml` publishes the container's port 4321 on host port 4322
(alysis.cat already uses 4321; wmmw takes the next port). On the crqpt server the
Cloudron App Proxy routes `wmmw.sh` to `localhost:4322`.

- `./deploy.sh`            first deploy (creates `.env.prod`, builds, starts)
- `./deploy.sh update`     pull latest, rebuild, restart, health check
- `./deploy.sh status`     service + local + public health
- `./deploy.sh logs`       tail container logs
- `./deploy.sh rollback`   restore the previous image
- `./deploy.sh down`       stop containers

v1 needs no build-time or runtime secrets: content is in-repo and the contact
link is the GitHub profile. See `.env.example` for the runtime variables.

CI (`.github/workflows/ci.yml`) gates every pull request and push to `main`:
`bun install`, `bun run check`, `bun run build`, plus a Docker image build smoke
test.

## Pending ops (outside this repo)

crqpt.com is replaced by wmmw.sh: point a 301 redirect from crqpt.com to
wmmw.sh, path-mapped for `/writings/*` to `/ecrits/*` where slugs survive. This
is a server-side ops task, tracked outside this repository.
