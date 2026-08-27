# Pivot éditorial + lego maison (direction C)

Date: 2026-08-27. Statut: direction validée par asi0, premier jet à reviewer en
live via l'annotation system. Amende le spec 2026-07-02 sur les points listés;
tout le reste (stack, i18n, mycelium, palette, perf) reste en vigueur.

## Décisions

1. **DA éditoriale, terminal retiré du chrome.** Les terminaux "imposent une DA
   trop forte" (asi0). Le site doit être lisible, presque éditorial,
   partageable, utilisable comme support de contenu. Conserver: palette humus /
   bone / or, les trois fontes, le mycélium (signature), les hairlines et le
   radius unique. Retirer du chrome et des pages: prompts `asi0@wmmw:~$`,
   commandes `cat`/`ls`/`tree` comme copy, box-drawing, typing animé,
   `TerminalPanel` comme conteneur par défaut. Le mono reste pour les dates,
   micro-labels et le wordmark.
2. **Lego maison (direction C).** `registry.json` à la racine, protocole shadcn
   (`registry:item` + `target`), distribue tokens + composants `.astro` + CSS.
   Consommation agent: `npx shadcn@latest add Asi0Flammeus/wmmw.sh/<item>`.
   beui.dev / rareui.com / beautifului.dev / transitions.dev servent de
   carrières à porter en vanilla, jamais de dépendances.
3. **Motion tokens.** Échelle de durées/easings dans `tokens.css`
   (école transitions.dev: rapide, fonctionnel, `prefers-reduced-motion`
   systématique). Le skill transitions.dev est installable au besoin pour
   auditer/appliquer.
4. **Reports UUID (remplace html-deliverable pour les livrables persistants).**
   - `POST /api/reports` (Bearer `REPORTS_TOKEN`, runtime env) reçoit un HTML
     autonome, le stocke dans `REPORTS_DIR` (volume docker), répond l'URL.
   - `GET /r/<uuid>`: sert le HTML stocké, `X-Robots-Tag: noindex`, hors
     sitemap, non listé. `GET /api/reports` (token) liste pour la gestion.
   - Contenu: formats Fold du skill html-deliverable (cover ≤699px synthétique,
     inner 700-1120px complet, laptop ≥1121px; surface claire contraste dur).
5. **Page galerie `/lego`** (noindex): tous les composants du registre rendus
   en live, pour validation et annotation par asi0.
6. **Annotation system actif en prod** (`ANNOTATION_SYSTEM=true` au build
   docker) le temps de la review; retiré une fois la DA validée.

## Hors scope de ce jet

- Newsletter (capture email) : slot prévu, activation plus tard.
- Suppression du composant TerminalPanel du repo (il reste comme item de
  registre pour les articles qui citent du shell).
