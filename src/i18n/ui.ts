/**
 * UI chrome dictionary. FR is canonical; EN and ES mirror its exact shape.
 * Copy rules (binding): no em or en dashes anywhere in visible copy; no shell
 * commands as copy (pivot éditorial 2026-08-27).
 */

const fr = {
  nav: {
    projets: "Projets",
    outils: "Outils",
    ecrits: "Écrits",
    contact: "Contact",
    nourritures: "Nourritures",
    manifeste: "Manifeste",
    ariaLabel: "Sections",
    home: "wmmw.sh, retour à l'accueil",
  },
  skip: "aller au contenu",
  lang: {
    label: "Langues",
    switchTo: { fr: "Français", en: "English", es: "Español" },
  },
  hero: {
    h1a: "William Mycelic",
    h1aEm: "Mycelic",
    h1b: "",
    sub: "Physicien de formation, DevOps indépendant et tisseur de liens par nature. Je fais circuler le code, le savoir et la valeur.",
    cta: "Lire le manifeste",
  },
  manifeste: {
    heading: "La forêt n'a pas besoin d'un arbre de plus.",
    headingGold: "Elle a besoin de mycélium.",
    readMore: "Lire le manifeste en entier",
    title: "Manifeste",
  },
  projets: {
    heading: "Mes projets",
    intro: "Les arbres que le réseau nourrit.",
    all: "Tous les projets",
  },
  outils: {
    heading: "Outils & repos",
    intro: "Des outils libres, comme des spores : prenez, semez.",
    all: "Tous les outils",
    repoPrivate: "repo privé, ouverture prochaine",
    install: "installation",
  },
  ecrits: {
    heading: "Écrits",
    intro: "Des signaux envoyés dans le réseau.",
    all: "Tous les écrits",
    published: "publié le",
    updated: "mis à jour le",
    back: "Tous les écrits",
    translations: "aussi disponible en",
  },
  nourritures: {
    heading: "Nourritures",
    intro: "Ce qui me nourrit. Le sol d'où tout pousse.",
    tabs: { livres: "Livres", films: "Films", videos: "Vidéos" },
    empty: "Rien ici pour le moment. Bientôt.",
  },
  contact: {
    heading: "Contact",
    intro:
      "Une idée à relier, une question ou simplement l'envie d'échanger ? Écris-moi là où tu te sens chez toi.",
    direct: "Le chemin le plus direct",
    directText:
      "Pour le moment, le plus simple est de m'envoyer un message sur X. Une adresse wmmw.sh viendra compléter ce chemin.",
    directCta: "M'écrire sur X",
    directEmailText:
      "Le courriel est le chemin le plus simple pour me joindre. Je te répondrai dès que possible.",
    directEmailCta: "M'écrire par courriel",
    elsewhere: "Ailleurs dans le réseau",
    portraitAlt:
      "William, alias asi0, de profil dans la lumière basse d'un intérieur.",
    portraitCaption: "William · asi0",
    links: {
      github: "Code, outils et contributions ouvertes.",
      x: "Notes courtes et conversations.",
      planb: "Éducation Bitcoin et travail collectif.",
    },
  },
  footer: {
    thesis:
      "wmmw.sh : WilliaM Mycelic Wealth. Un palindrome. Ce qui sort du réseau y revient.",
    rss: "flux RSS",
    contact: "contact",
  },
  notFound: {
    output: "Cette page n'existe pas, ou pas encore.",
    hint: "Retour à l'accueil",
  },
  meta: {
    home: "William, alias asi0. Projets, outils, écrits et nourritures, portés par la richesse mycélique : la richesse s'échange, elle ne s'empile pas.",
    manifeste: "La richesse mycélique : apporter des ressources aux autres sans exiger de retour. Le manifeste au long format.",
    projets: "Les arbres que le réseau nourrit : recherche ouverte, éducation Bitcoin, sites artisanaux, art émergent.",
    outils: "Des outils libres, comme des spores : TUI pour agents, dictée vocale, extensions, CLI cloud.",
    ecrits: "Des signaux envoyés dans le réseau : essais sur la technique, la physique et ce qui circule entre les deux.",
    nourritures: "Ce qui me nourrit : livres, films et vidéos. Le sol d'où tout pousse.",
    contact:
      "Contacter William, alias asi0, et retrouver ses présences sur GitHub, X et Plan ₿ Academy.",
    notFound: "Page introuvable.",
  },
  rss: {
    title: "wmmw.sh : écrits",
    description: "Des signaux envoyés dans le réseau. Les écrits de William (asi0).",
  },
} as const;

/** Recursively widen literal strings so EN/ES may differ from FR values while matching its shape. */
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => R
    : { readonly [K in keyof T]: Widen<T[K]> };

type Dict = Widen<typeof fr>;

const en: Dict = {
  nav: {
    projets: "Projects",
    outils: "Tools",
    ecrits: "Writings",
    contact: "Contact",
    nourritures: "Nourishment",
    manifeste: "Manifesto",
    ariaLabel: "Sections",
    home: "wmmw.sh, back to home",
  },
  skip: "skip to content",
  lang: {
    label: "Languages",
    switchTo: { fr: "Français", en: "English", es: "Español" },
  },
  hero: {
    h1a: "William Mycelic",
    h1aEm: "Mycelic",
    h1b: "",
    sub: "Physicist by training, independent DevOps and weaver of ties by nature. I keep code, knowledge and value in circulation.",
    cta: "Read the manifesto",
  },
  manifeste: {
    heading: "The forest does not need one more tree.",
    headingGold: "It needs mycelium.",
    readMore: "Read the full manifesto",
    title: "Manifesto",
  },
  projets: {
    heading: "My projects",
    intro: "The trees the network feeds.",
    all: "All projects",
  },
  outils: {
    heading: "Tools & repos",
    intro: "Free tools, like spores: take them, sow them.",
    all: "All tools",
    repoPrivate: "private repo, opening soon",
    install: "install",
  },
  ecrits: {
    heading: "Writings",
    intro: "Signals sent into the network.",
    all: "All writings",
    published: "published",
    updated: "updated",
    back: "All writings",
    translations: "also available in",
  },
  nourritures: {
    heading: "Nourishment",
    intro: "What feeds me. The soil everything grows from.",
    tabs: { livres: "Books", films: "Films", videos: "Videos" },
    empty: "Nothing here yet. Soon.",
  },
  contact: {
    heading: "Contact",
    intro:
      "An idea to connect, a question, or simply a wish to talk? Write to me wherever feels natural.",
    direct: "The most direct path",
    directText:
      "For now, the simplest way is to message me on X. A wmmw.sh email address will complete this path later.",
    directCta: "Write to me on X",
    directEmailText:
      "Email is the simplest way to reach me. I will reply as soon as I can.",
    directEmailCta: "Write to me by email",
    elsewhere: "Elsewhere in the network",
    portraitAlt:
      "William, aka asi0, in profile in the low light of an interior.",
    portraitCaption: "William · asi0",
    links: {
      github: "Code, tools and open contributions.",
      x: "Short notes and conversations.",
      planb: "Bitcoin education and collective work.",
    },
  },
  footer: {
    thesis:
      "wmmw.sh: WilliaM Mycelic Wealth. A palindrome. What leaves the network returns to it.",
    rss: "RSS feed",
    contact: "contact",
  },
  notFound: {
    output: "This page does not exist, or not yet.",
    hint: "Back to home",
  },
  meta: {
    home: "William, aka asi0. Projects, tools, writings and nourishment, carried by mycelic wealth: wealth is exchanged, it does not stack.",
    manifeste: "Mycelic wealth: bringing resources to others without demanding a return. The long-form manifesto.",
    projets: "The trees the network feeds: open research, Bitcoin education, handcrafted websites, emerging art.",
    outils: "Free tools, like spores: agent TUI, voice dictation, browser extensions, cloud CLI.",
    ecrits: "Signals sent into the network: essays on technology, physics and what flows between the two.",
    nourritures: "What feeds me: books, films and videos. The soil everything grows from.",
    contact:
      "Contact William, aka asi0, and find him on GitHub, X and Plan ₿ Academy.",
    notFound: "Page not found.",
  },
  rss: {
    title: "wmmw.sh: writings",
    description: "Signals sent into the network. Writings by William (asi0).",
  },
};

const es: Dict = {
  nav: {
    projets: "Proyectos",
    outils: "Herramientas",
    ecrits: "Escritos",
    contact: "Contacto",
    nourritures: "Alimentos",
    manifeste: "Manifiesto",
    ariaLabel: "Secciones",
    home: "wmmw.sh, volver al inicio",
  },
  skip: "ir al contenido",
  lang: {
    label: "Idiomas",
    switchTo: { fr: "Français", en: "English", es: "Español" },
  },
  hero: {
    h1a: "William Mycelic",
    h1aEm: "Mycelic",
    h1b: "",
    sub: "Físico de formación, DevOps independiente y tejedor de vínculos por naturaleza. Hago circular el código, el saber y el valor.",
    cta: "Leer el manifiesto",
  },
  manifeste: {
    heading: "El bosque no necesita un árbol más.",
    headingGold: "Necesita micelio.",
    readMore: "Leer el manifiesto completo",
    title: "Manifiesto",
  },
  projets: {
    heading: "Mis proyectos",
    intro: "Los árboles que la red alimenta.",
    all: "Todos los proyectos",
  },
  outils: {
    heading: "Herramientas y repos",
    intro: "Herramientas libres, como esporas: toma, siembra.",
    all: "Todas las herramientas",
    repoPrivate: "repo privado, se abrirá pronto",
    install: "instalación",
  },
  ecrits: {
    heading: "Escritos",
    intro: "Señales enviadas a la red.",
    all: "Todos los escritos",
    published: "publicado el",
    updated: "actualizado el",
    back: "Todos los escritos",
    translations: "también disponible en",
  },
  nourritures: {
    heading: "Alimentos",
    intro: "Lo que me nutre. El suelo del que todo crece.",
    tabs: { livres: "Libros", films: "Películas", videos: "Vídeos" },
    empty: "Nada por ahora. Pronto.",
  },
  contact: {
    heading: "Contacto",
    intro:
      "¿Una idea que conectar, una pregunta o simplemente ganas de conversar? Escríbeme donde te resulte más natural.",
    direct: "El camino más directo",
    directText:
      "Por ahora, lo más sencillo es enviarme un mensaje en X. Más adelante, una dirección wmmw.sh completará este camino.",
    directCta: "Escribirme en X",
    directEmailText:
      "El correo es la forma más sencilla de contactarme. Te responderé en cuanto pueda.",
    directEmailCta: "Escribirme por correo",
    elsewhere: "En otros rincones de la red",
    portraitAlt:
      "William, alias asi0, de perfil en la luz tenue de un interior.",
    portraitCaption: "William · asi0",
    links: {
      github: "Código, herramientas y contribuciones abiertas.",
      x: "Notas breves y conversaciones.",
      planb: "Educación sobre Bitcoin y trabajo colectivo.",
    },
  },
  footer: {
    thesis:
      "wmmw.sh: WilliaM Mycelic Wealth. Un palíndromo. Lo que sale de la red vuelve a ella.",
    rss: "canal RSS",
    contact: "contacto",
  },
  notFound: {
    output: "Esta página no existe, o todavía no.",
    hint: "Volver al inicio",
  },
  meta: {
    home: "William, alias asi0. Proyectos, herramientas, escritos y alimentos, guiados por la riqueza micélica: la riqueza se intercambia, no se apila.",
    manifeste: "La riqueza micélica: aportar recursos a los demás sin exigir retorno. El manifiesto en formato largo.",
    projets: "Los árboles que la red alimenta: investigación abierta, educación Bitcoin, webs artesanales, arte emergente.",
    outils: "Herramientas libres, como esporas: TUI para agentes, dictado por voz, extensiones, CLI cloud.",
    ecrits: "Señales enviadas a la red: ensayos sobre la técnica, la física y lo que circula entre ambas.",
    nourritures: "Lo que me nutre: libros, películas y vídeos. El suelo del que todo crece.",
    contact:
      "Contactar con William, alias asi0, y encontrarlo en GitHub, X y Plan ₿ Academy.",
    notFound: "Página no encontrada.",
  },
  rss: {
    title: "wmmw.sh: escritos",
    description: "Señales enviadas a la red. Los escritos de William (asi0).",
  },
};

export const ui = { fr, en, es } as const;
export type UIDict = Dict;
