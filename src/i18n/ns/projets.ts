/**
 * /projets copy (copy deck §4, §13.1). Proof facts were checked on 2026-10-17
 * and re-checked on 2026-10-27 (MIN303: courses/min303/course.yml, 16 h,
 * advanced; course page title served by planb.academy). A proof's `linkText`
 * is the substring of `text` that carries `href` (split with splitLink).
 */
import { defineNamespace, type Widen } from "../define";

const PLANB_REPO = "https://github.com/PlanB-Network/bitcoin-educational-content";
const MIN303 =
  "https://planb.academy/courses/the-world-of-bitcoin-mining-e0d23913-653c-4960-a845-d6738cd49f91";
const CONTRIB = `${PLANB_REPO}#how-can-you-contribute`;

const fr = {
  meta: {
    title: "Projets",
    description:
      "Plan ₿ Academy, alysis, outils sur mesure, Ghosts\u202F: ce qui tourne en ce moment, mon rôle et les preuves.",
  },
  heading: "Mes projets",
  intro: "Ce qui tourne en ce moment, et ce que j’y fais.",
  labels: {
    what: "ce que c’est",
    role: "mon rôle",
    proof: "preuves",
    forYou: "pour toi",
    dims: "Dimensions",
  },
  items: {
    planb: {
      title: "Plan ₿ Academy",
      what: "Une école en ligne pour apprendre Bitcoin, gratuite et open source. Cours, tutoriels et glossaire, traduits dans des dizaines de langues.",
      role: "Je maintiens le dépôt où vit tout ce contenu. Je relis, je fusionne, et j’ai construit le pipeline qui le traduit.",
      proofs: [
        {
          text: "Premier contributeur du dépôt\u202F: plus de 1\u202F400 commits.",
          href: `${PLANB_REPO}/graphs/contributors`,
          linkText: "Premier contributeur du dépôt",
        },
        {
          text: "La PR #4552\u202F: un nouveau pipeline de traduction. Premier test grandeur nature\u202F: 29 langues, 1\u202F349 fichiers.",
          href: `${PLANB_REPO}/pull/4552`,
          linkText: "La PR #4552",
        },
        {
          text: "Le récit\u202F: Un workflow à en perdre la tête",
          href: "/ecrits/workflow-a-en-perdre-la-tete",
          join: true,
          linkText: "Un workflow à en perdre la tête",
        },
        {
          text: "Auteur de MIN303, un cours avancé de 16 heures sur le minage.",
          href: MIN303,
          linkText: "MIN303",
        },
      ],
      forYou: {
        text: "Apprendre Bitcoin gratuitement, dans ta langue. Ou traduire et relire avec nous.",
        href: CONTRIB,
        linkText: "traduire et relire",
      },
      link: "planb.academy",
      dims: ["intellectuelle", "relationnelle"],
    },
    alysis: {
      title: "alysis",
      what: "Un atelier web à Chambéry. Des sites faits main pour des métiers faits main\u202F: artisans, commerces, artistes.",
      role: "On est deux, plus un chat. Je code les sites, je les mets en ligne, et je fais tourner les serveurs qui les portent.",
      proofs: [
        {
          text: "unfocus.art\u202F: portfolio et boutique d’un peintre, en 5 langues. En ligne depuis février 2026.",
          href: "https://unfocus.art",
          linkText: "unfocus.art",
        },
        {
          text: "holy-belleile.fr\u202F: une sandwicherie qui vivait sur Instagram. Sa palette, son lettrage, son burger qui se déplie. En ligne depuis juillet 2026.",
          href: "https://holy-belleile.fr",
          linkText: "holy-belleile.fr",
        },
      ],
      forYou: {
        text: "Un site qui te ressemble. Tout se passe sur alysis.cat.",
        href: "",
        linkText: "",
      },
      link: "alysis.cat",
      dims: ["financière", "relationnelle"],
    },
    tools: {
      title: "Outils sur mesure",
      what: "Des outils et des webapps faits pour une personne ou une équipe. Pas un logiciel de plus\u202F: le tien, à ta façon de travailler.",
      role: "Je cadre le problème, je construis par étapes courtes, j’héberge si tu veux. Le code et les données restent à toi.",
      proofs: [
        {
          text: "Le pipeline de traduction de Plan ₿ Academy, plus haut\u202F: un outil fait pour une équipe.",
          href: "#plan-b-academy",
          linkText: "Le pipeline de traduction de Plan ₿ Academy",
        },
        {
          text: "dicton, ma dictée vocale, publiée sur PyPI. Un outil fait d’abord pour une seule personne\u202F: moi.",
          href: "https://pypi.org/project/dicton",
          linkText: "dicton",
        },
      ],
      agriProof:
        "Pour un négociant agricole\u202F: ses offres commerciales préparées pour WhatsApp, dans la langue et la devise de chaque client. Rien ne part sans sa validation.",
      forYou: {
        text: "Un outil taillé pour ta façon de travailler. Ton code, tes données.",
        href: "",
        linkText: "",
      },
      action: "Raconte-moi ce qui coince",
      dims: ["financière", "émotionnelle"],
    },
    ghosts: {
      title: "Ghosts",
      line: "Des agents au très long cours, en préparation. J’en dis plus bientôt.",
      forYou: "Un message le jour de la sortie. Un seul, promis.",
    },
  },
  closing: "Un seul fil relie ces quatre projets. Il est dans le manifeste.",
  closingLink: "le manifeste",
  dimsAnchor: "les-cinq-dimensions",
} as const;

const en: Widen<typeof fr> = {
  meta: {
    title: "Projects",
    description:
      "Plan ₿ Academy, alysis, custom tools, Ghosts: what’s running now, my role and the proof.",
  },
  heading: "My projects",
  intro: "What’s running right now, and what I do there.",
  labels: {
    what: "what it is",
    role: "my role",
    proof: "proof",
    forYou: "for you",
    dims: "Dimensions",
  },
  items: {
    planb: {
      title: "Plan ₿ Academy",
      what: "An online school to learn Bitcoin, free and open source. Courses, tutorials and a glossary, translated into dozens of languages.",
      role: "I maintain the repository where all of it lives. I review, I merge, and I built the pipeline that translates it.",
      proofs: [
        {
          text: "Top contributor to the repository: more than 1,400 commits.",
          href: `${PLANB_REPO}/graphs/contributors`,
          linkText: "Top contributor to the repository",
        },
        {
          text: "PR #4552: a new translation pipeline. First full-scale run: 29 languages, 1,349 files.",
          href: `${PLANB_REPO}/pull/4552`,
          linkText: "PR #4552",
        },
        {
          text: "The story: A workflow to lose your head over",
          href: "/ecrits/workflow-a-en-perdre-la-tete",
          join: true,
          linkText: "A workflow to lose your head over",
        },
        {
          text: "Author of MIN303, an advanced 16-hour course on mining.",
          href: MIN303,
          linkText: "MIN303",
        },
      ],
      forYou: {
        text: "Learn Bitcoin for free, in your language. Or help translate and review.",
        href: CONTRIB,
        linkText: "help translate and review",
      },
      link: "planb.academy",
      dims: ["intellectual", "relational"],
    },
    alysis: {
      title: "alysis",
      what: "A web atelier in Chambéry. Handmade websites for handmade trades: craftspeople, shops, artists.",
      role: "There are two of us, plus a cat. I code the sites, put them online, and run the servers that carry them.",
      proofs: [
        {
          text: "unfocus.art: a painter’s portfolio and shop, in 5 languages. Live since February 2026.",
          href: "https://unfocus.art",
          linkText: "unfocus.art",
        },
        {
          text: "holy-belleile.fr: a sandwich shop that lived on Instagram. Its own palette, its own lettering, a burger that unfolds. Live since July 2026.",
          href: "https://holy-belleile.fr",
          linkText: "holy-belleile.fr",
        },
      ],
      forYou: {
        text: "A website that looks like you. It all happens on alysis.cat.",
        href: "",
        linkText: "",
      },
      link: "alysis.cat",
      dims: ["financial", "relational"],
    },
    tools: {
      title: "Custom tools",
      what: "Tools and web apps made for one person or one team. Not one more piece of software: yours, shaped to the way you work.",
      role: "I scope the problem, build in short steps, and host it if you want. The code and the data stay yours.",
      proofs: [
        {
          text: "The Plan ₿ Academy translation pipeline, above: a tool made for one team.",
          href: "#plan-b-academy",
          linkText: "The Plan ₿ Academy translation pipeline",
        },
        {
          text: "dicton, my voice dictation tool, published on PyPI. Built first for exactly one person: me.",
          href: "https://pypi.org/project/dicton",
          linkText: "dicton",
        },
      ],
      agriProof:
        "For a farm-produce trader: his sales offers drafted for WhatsApp, in each client’s language and currency. Nothing goes out without his sign-off.",
      forYou: {
        text: "A tool cut to the way you work. Your code, your data.",
        href: "",
        linkText: "",
      },
      action: "Tell me what’s stuck",
      dims: ["financial", "emotional"],
    },
    ghosts: {
      title: "Ghosts",
      line: "Agents built for the very long run, in the making. More soon.",
      forYou: "One message on launch day. Just one, promise.",
    },
  },
  closing: "One thread runs through these four projects. It’s in the manifesto.",
  closingLink: "the manifesto",
  dimsAnchor: "the-five-dimensions",
};

const es: Widen<typeof fr> = {
  meta: {
    title: "Proyectos",
    description:
      "Plan ₿ Academy, alysis, herramientas a medida, Ghosts: lo que está en marcha, mi papel y las pruebas.",
  },
  heading: "Mis proyectos",
  intro: "Lo que está en marcha ahora, y lo que hago ahí.",
  labels: {
    what: "qué es",
    role: "mi papel",
    proof: "pruebas",
    forYou: "para ti",
    dims: "Dimensiones",
  },
  items: {
    planb: {
      title: "Plan ₿ Academy",
      what: "Una escuela en línea para aprender Bitcoin, gratuita y de código abierto. Cursos, tutoriales y glosario, traducidos a decenas de idiomas.",
      role: "Mantengo el repositorio donde vive todo ese contenido. Reviso, fusiono, y construí el pipeline que lo traduce.",
      proofs: [
        {
          text: "Primer contribuidor del repositorio: más de 1400 commits.",
          href: `${PLANB_REPO}/graphs/contributors`,
          linkText: "Primer contribuidor del repositorio",
        },
        {
          text: "La PR #4552: un nuevo pipeline de traducción. Primera prueba a escala real: 29 idiomas, 1349 archivos.",
          href: `${PLANB_REPO}/pull/4552`,
          linkText: "La PR #4552",
        },
        {
          text: "El relato: Un workflow para perder la cabeza",
          href: "/ecrits/workflow-a-en-perdre-la-tete",
          join: true,
          linkText: "Un workflow para perder la cabeza",
        },
        {
          text: "Autor de MIN303, un curso avanzado de 16 horas sobre minería.",
          href: MIN303,
          linkText: "MIN303",
        },
      ],
      forYou: {
        text: "Aprender Bitcoin gratis, en tu idioma. O traducir y revisar con nosotros.",
        href: CONTRIB,
        linkText: "traducir y revisar",
      },
      link: "planb.academy",
      dims: ["intelectual", "relacional"],
    },
    alysis: {
      title: "alysis",
      what: "Un taller web en Chambéry. Webs hechas a mano para oficios hechos a mano: artesanos, comercios, artistas.",
      role: "Somos dos, más un gato. Programo las webs, las pongo en línea y mantengo los servidores que las sostienen.",
      proofs: [
        {
          text: "unfocus.art: portfolio y tienda de un pintor, en 5 idiomas. En línea desde febrero de 2026.",
          href: "https://unfocus.art",
          linkText: "unfocus.art",
        },
        {
          text: "holy-belleile.fr: una bocadillería que vivía en Instagram. Su paleta, su rotulación, su hamburguesa que se despliega. En línea desde julio de 2026.",
          href: "https://holy-belleile.fr",
          linkText: "holy-belleile.fr",
        },
      ],
      forYou: {
        text: "Una web que se te parece. Todo pasa en alysis.cat.",
        href: "",
        linkText: "",
      },
      link: "alysis.cat",
      dims: ["financiera", "relacional"],
    },
    tools: {
      title: "Herramientas a medida",
      what: "Herramientas y webapps hechas para una persona o un equipo. No un software más: el tuyo, a tu manera de trabajar.",
      role: "Acoto el problema, construyo por etapas cortas y lo alojo si quieres. El código y los datos siguen siendo tuyos.",
      proofs: [
        {
          text: "El pipeline de traducción de Plan ₿ Academy, más arriba: una herramienta hecha para un equipo.",
          href: "#plan-b-academy",
          linkText: "El pipeline de traducción de Plan ₿ Academy",
        },
        {
          text: "dicton, mi dictado por voz, publicado en PyPI. Hecho primero para una sola persona: yo.",
          href: "https://pypi.org/project/dicton",
          linkText: "dicton",
        },
      ],
      agriProof:
        "Para un comerciante agrícola: sus ofertas comerciales preparadas para WhatsApp, en el idioma y la moneda de cada cliente. Nada sale sin su validación.",
      forYou: {
        text: "Una herramienta a la medida de tu forma de trabajar. Tu código, tus datos.",
        href: "",
        linkText: "",
      },
      action: "Cuéntame qué se atasca",
      dims: ["financiera", "emocional"],
    },
    ghosts: {
      title: "Ghosts",
      line: "Agentes de muy largo recorrido, en preparación. Pronto contaré más.",
      forYou: "Un mensaje el día del lanzamiento. Solo uno, prometido.",
    },
  },
  closing: "Un solo hilo une estos cuatro proyectos. Está en el manifiesto.",
  closingLink: "el manifiesto",
  dimsAnchor: "las-cinco-dimensiones",
};

export default defineNamespace("projets", { fr, en, es });

declare module "../index" {
  interface Namespaces {
    projets: Widen<typeof fr>;
  }
}
