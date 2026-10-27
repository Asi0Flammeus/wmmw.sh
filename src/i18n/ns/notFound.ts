/** 404 (copy deck §12). The page is FR only and shows all three lines. */
import { defineNamespace, type Widen } from "../define";

const fr = {
  meta: { title: "Page introuvable · William Moiré" },
  title: "Page introuvable",
  line: "Rien ici. Mais ce rien peut tout.",
  home: "Retour à l’accueil",
} as const;

const en: Widen<typeof fr> = {
  meta: { title: "Page not found · William Moiré" },
  title: "Page not found",
  line: "Nothing here. But this nothing can do anything.",
  home: "Back home",
};

const es: Widen<typeof fr> = {
  meta: { title: "Página no encontrada · William Moiré" },
  title: "Página no encontrada",
  line: "Aquí no hay nada. Pero esta nada lo puede todo.",
  home: "Volver al inicio",
};

export default defineNamespace("notFound", { fr, en, es });

declare module "../index" {
  interface Namespaces {
    notFound: Widen<typeof fr>;
  }
}
