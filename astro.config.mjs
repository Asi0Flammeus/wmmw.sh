// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

const SITE = "https://wmmw.sh";

/**
 * Logical paths kept out of the sitemap in every locale: the unlisted
 * component gallery and lab, the parked pages (mirror of PARKED_PATHS in
 * src/lib/site.ts, minus /404 which the integration already drops).
 */
const UNLISTED = ["/lego", "/lab", "/nourritures", "/lectures-sf", "/404"];

/** Logical path of a sitemap URL: locale prefix stripped, "/" for home. */
const logicalPath = (/** @type {string} */ url) =>
  new URL(url).pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";

/**
 * On-demand routes are invisible to the sitemap integration (it only lists
 * prerendered pages and static on-demand paths), so list them by hand.
 */
const ON_DEMAND = ["/contact", "/projets"].flatMap((p) => [
  `${SITE}${p}`,
  `${SITE}/en${p}`,
  `${SITE}/es${p}`,
]);

/**
 * Shiki: github-light-default comments (#6e7781) read 4.37:1 on the light
 * code well; rewrite them to ink-3 (#5d6966, 5.47:1). Dark tokens all pass.
 * @type {import("shiki").ShikiTransformer}
 */
const lightCommentContrast = {
  name: "wmmw:light-comment-contrast",
  span(node) {
    const style = node.properties.style;
    if (typeof style === "string") {
      node.properties.style = style.replace(/#6e7781/gi, "#5d6966");
    }
  },
};

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: "static",
  trailingSlash: "never",
  adapter: node({ mode: "standalone" }),
  // Astro compares Origin with the request URL, which reads http:// behind
  // the TLS proxy and would 403 every no-JS form post. src/middleware.ts
  // replaces it with an allow-list check on form-like POSTs.
  security: { checkOrigin: false },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !UNLISTED.includes(logicalPath(page)),
      customPages: ON_DEMAND,
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light-default", dark: "github-dark-default" },
      transformers: [lightCommentContrast],
    },
  },
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "en", "es"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    // Pre-bundle heavy deps at dev startup so first navigation to a page that
    // uses them (katex on post pages) does not trigger a mid-swap Vite
    // re-optimize (504), which would stall a ClientRouter navigation.
    optimizeDeps: { include: ["katex"] },
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
        "@layouts": "/src/layouts",
        "@styles": "/src/styles",
        "@assets": "/src/assets",
        "@lib": "/src/lib",
        "@i18n": "/src/i18n",
      },
    },
  },
});
