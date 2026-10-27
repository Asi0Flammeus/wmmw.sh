/** /manifeste chrome (copy deck §7, §13.1). The text itself lives in src/content/manifeste. */
import { defineNamespace, type Widen } from "../define";

const fr = {
  meta: {
    title: "Manifeste\u202F: la richesse mycélique",
    description:
      "La richesse a cinq dimensions. Elle circule, elle ne s’empile pas. Le manifeste au long cours.",
  },
} as const;

const en: Widen<typeof fr> = {
  meta: {
    title: "Manifesto: Mycelic Wealth",
    description:
      "Wealth has five dimensions. It moves, it doesn’t pile up. The long-form manifesto.",
  },
};

const es: Widen<typeof fr> = {
  meta: {
    title: "Manifiesto: la riqueza micélica",
    description:
      "La riqueza tiene cinco dimensiones. Circula, no se acumula. El manifiesto completo.",
  },
};

export default defineNamespace("manifeste", { fr, en, es });

declare module "../index" {
  interface Namespaces {
    manifeste: Widen<typeof fr>;
  }
}
