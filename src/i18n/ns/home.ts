/**
 * Home copy (copy deck §3, §13.1). Arrows are rendered by <Arrow>, never typed.
 * French narrow no-break spaces are written as \u202F escapes.
 */
import { defineNamespace, type Widen } from "../define";

const fr = {
  meta: {
    title: "William Moiré · Développeur indépendant, outils sur mesure",
    description:
      "William Moiré, aussi connu comme asi0. Physicien devenu développeur indépendant\u202F: sites, outils sur mesure, éducation Bitcoin libre.",
  },
  hero: {
    h1: "William Moiré",
    sub: "Faisons circuler le savoir, la pratique et la valeur.",
    aside: "Physicien devenu développeur indépendant. Aussi connu comme asi0.",
  },
  now: {
    heading: "En ce moment",
    planb: {
      name: "Plan ₿ Academy",
      line: "Le savoir Bitcoin, libre, dans ta langue. J’en maintiens les cours.",
    },
    alysis: {
      name: "alysis",
      line: "Des sites faits main pour des métiers faits main.",
    },
    tools: {
      name: "Outils sur mesure",
      line: "Un logiciel pour une seule personne\u202F? C’est exactement ma taille.",
    },
    ghosts: {
      name: "Ghosts",
      line: "Des agents au très long cours. J’en dis plus bientôt.",
      lensLabel: "Loupe à fantômes, à faire glisser",
    },
  },
  work: {
    heading: "Travailler ensemble",
    line: "Raconte-moi ce qui coince. Je te dis franchement si je peux aider.",
  },
  ecrits: {
    heading: "Écrits",
  },
  wealth: {
    line: "La richesse a cinq dimensions. L’argent n’en est qu’une.",
    more: "manifeste",
    aria: "Lire le manifeste\u202F: la richesse a cinq dimensions",
    figureAlt: "Cinq fils tissés ensemble. Un seul est plus marqué\u202F: l’argent.",
  },
} as const;

const en: Widen<typeof fr> = {
  meta: {
    title: "William Moiré · Independent developer, custom tools",
    description:
      "William Moiré, also known as asi0. Physicist turned independent developer: websites, custom tools, free Bitcoin education.",
  },
  hero: {
    h1: "William Moiré",
    sub: "Let’s keep knowledge, practice and value moving.",
    aside: "Physicist turned independent developer. Also known as asi0.",
  },
  now: {
    heading: "Right now",
    planb: {
      name: "Plan ₿ Academy",
      line: "Free Bitcoin knowledge, in your language. I maintain the courses.",
    },
    alysis: {
      name: "alysis",
      line: "Handmade websites for handmade trades.",
    },
    tools: {
      name: "Custom tools",
      line: "Software for one person? That’s exactly my size.",
    },
    ghosts: {
      name: "Ghosts",
      line: "Agents built for the very long run. More soon.",
      lensLabel: "Ghost lens, drag it",
    },
  },
  work: {
    heading: "Work together",
    line: "Tell me what’s stuck. I’ll tell you honestly if I can help.",
  },
  ecrits: {
    heading: "Writings",
  },
  wealth: {
    line: "Wealth has five dimensions. Money is only one.",
    more: "manifesto",
    aria: "Read the manifesto: wealth has five dimensions",
    figureAlt: "Five strands woven together. Only one is drawn bolder: money.",
  },
};

const es: Widen<typeof fr> = {
  meta: {
    title: "William Moiré · Desarrollador independiente, herramientas a medida",
    description:
      "William Moiré, también conocido como asi0. Físico convertido en desarrollador independiente: webs, herramientas a medida, educación Bitcoin libre.",
  },
  hero: {
    h1: "William Moiré",
    sub: "Hagamos circular el saber, la práctica y el valor.",
    aside: "Físico convertido en desarrollador independiente. También conocido como asi0.",
  },
  now: {
    heading: "Ahora mismo",
    planb: {
      name: "Plan ₿ Academy",
      line: "El saber Bitcoin, libre, en tu idioma. Mantengo sus cursos.",
    },
    alysis: {
      name: "alysis",
      line: "Webs hechas a mano para oficios hechos a mano.",
    },
    tools: {
      name: "Herramientas a medida",
      line: "¿Un software para una sola persona? Es justo mi talla.",
    },
    ghosts: {
      name: "Ghosts",
      line: "Agentes de muy largo recorrido. Pronto contaré más.",
      lensLabel: "Lupa de fantasmas, deslízala",
    },
  },
  work: {
    heading: "Trabajar juntos",
    line: "Cuéntame qué se atasca. Te diré con franqueza si puedo ayudar.",
  },
  ecrits: {
    heading: "Escritos",
  },
  wealth: {
    line: "La riqueza tiene cinco dimensiones. El dinero es solo una.",
    more: "manifiesto",
    aria: "Leer el manifiesto: la riqueza tiene cinco dimensiones",
    figureAlt: "Cinco hilos tejidos juntos. Solo uno está más marcado: el dinero.",
  },
};

export default defineNamespace("home", { fr, en, es });

declare module "../index" {
  interface Namespaces {
    home: Widen<typeof fr>;
  }
}
