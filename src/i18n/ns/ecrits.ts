/** /ecrits and post pages (copy deck §2.2, §6, §13.1). */
import { defineNamespace, type Widen } from "../define";

const fr = {
  meta: {
    title: "Écrits",
    description:
      "Notes de chantier et idées au long cours\u202F: agents, physique, Bitcoin, et ce qui circule entre eux.",
  },
  heading: "Écrits",
  intro: "Des notes de chantier, et quelques idées au long cours.",
  follow: "Suivre par RSS",
  followHint: "Colle cette adresse dans ton lecteur de flux\u202F:",
  back: "Tous les écrits",
  published: "publié le",
  updated: "mis à jour le",
  translations: "aussi disponible en",
  by: "Par William Moiré",
  byLegacy: "Par asi0 (William Moiré)",
  copy: "Copier",
  copied: "Copié",
  feedLabel: "Adresse du flux",
} as const;

const en: Widen<typeof fr> = {
  meta: {
    title: "Writings",
    description:
      "Build notes and long-running ideas: agents, physics, Bitcoin, and what moves between them.",
  },
  heading: "Writings",
  intro: "Build notes, and a few long-running ideas.",
  follow: "Follow by RSS",
  followHint: "Paste this address into your feed reader:",
  back: "All writings",
  published: "published",
  updated: "updated",
  translations: "also available in",
  by: "By William Moiré",
  byLegacy: "By asi0 (William Moiré)",
  copy: "Copy",
  copied: "Copied",
  feedLabel: "Feed address",
};

const es: Widen<typeof fr> = {
  meta: {
    title: "Escritos",
    description:
      "Notas de obra e ideas de largo recorrido: agentes, física, Bitcoin, y lo que circula entre ellos.",
  },
  heading: "Escritos",
  intro: "Notas de obra, y algunas ideas de largo recorrido.",
  follow: "Seguir por RSS",
  followHint: "Pega esta dirección en tu lector de feeds:",
  back: "Todos los escritos",
  published: "publicado el",
  updated: "actualizado el",
  translations: "también disponible en",
  by: "Por William Moiré",
  byLegacy: "Por asi0 (William Moiré)",
  copy: "Copiar",
  copied: "Copiado",
  feedLabel: "Dirección del feed",
};

export default defineNamespace("ecrits", { fr, en, es });

declare module "../index" {
  interface Namespaces {
    ecrits: Widen<typeof fr>;
  }
}
