// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://wmmw.sh",
  output: "static",
  trailingSlash: "never",
  adapter: node({ mode: "standalone" }),
  integrations: [
    mdx(),
    sitemap({
      // /lego is the unlisted component gallery; /r/* are unlisted reports.
      filter: (page) => !page.includes("/lego"),
    }),
  ],
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
