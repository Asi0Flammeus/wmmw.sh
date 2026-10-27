/** /mentions-legales chrome (copy deck §11, §13.1). The body is legal-<locale>.mdx. */
import { defineNamespace, type Widen } from "../define";

const fr = {
  meta: {
    title: "Mentions légales",
    description:
      "Éditeur, hébergement, données personnelles et cookies du site wmmw.sh.",
  },
  heading: "Mentions légales",
  binding: "",
} as const;

const en: Widen<typeof fr> = {
  meta: {
    title: "Legal notice",
    description: "Publisher, hosting, personal data and cookies for wmmw.sh.",
  },
  heading: "Legal notice",
  binding: "The French version of this notice is the binding one.",
};

const es: Widen<typeof fr> = {
  meta: {
    title: "Aviso legal",
    description: "Editor, alojamiento, datos personales y cookies de wmmw.sh.",
  },
  heading: "Aviso legal",
  binding: "La versión francesa de este aviso es la que hace fe.",
};

export default defineNamespace("legal", { fr, en, es });

declare module "../index" {
  interface Namespaces {
    legal: Widen<typeof fr>;
  }
}
