import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const LOCALES = ["fr", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

/** One string per locale. FR is canonical and required. */
const localized = z.object({
  fr: z.string(),
  en: z.string(),
  es: z.string(),
});

const writings = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/writings" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().default("asi0"),
      tags: z.array(z.string()).default([]),
      image: image().optional(),
      imageAlt: z.string().optional(),
      draft: z.boolean().default(false),
      lang: z.enum(LOCALES),
      /** Base slug linking translations of the same post (e.g. "talking-to-silicon"). */
      translationOf: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/projects" }),
  schema: z.object({
    /** Directory-style name shown in terminal listings (e.g. "recherche-ouverte/"). */
    name: z.string(),
    /** Display title (e.g. "Recherche ouverte"). */
    title: z.string(),
    blurb: localized,
    url: z.url().optional(),
    status: z.enum(["actif", "en-cours", "archive"]).default("actif"),
    order: z.number(),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/tools" }),
  schema: z.object({
    name: z.string(),
    blurb: localized,
    /** Public repo URL; absent while a repo is still private. */
    repo: z.url().optional(),
    /** Product/site URL when distinct from the repo. */
    url: z.url().optional(),
    status: z.enum(["stable", "beta"]),
    /** Install one-liner, shown verbatim in mono. */
    install: z.string().optional(),
    order: z.number(),
  }),
});

const nourritures = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/nourritures" }),
  schema: z.object({
    type: z.enum(["livre", "film", "video"]),
    title: z.string(),
    author: z.string(),
    url: z.url().optional(),
    note: localized.partial().optional(),
    order: z.number(),
  }),
});

const manifeste = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/manifeste" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lang: z.enum(LOCALES),
  }),
});

export const collections = { writings, projects, tools, nourritures, manifeste };
