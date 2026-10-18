/**
 * Chrome dictionary: navigation, footer, theme, paths, steps and the shared
 * vocabulary two packages need (spec §6.1). FR is canonical; EN and ES mirror
 * its exact shape. Page copy lives in one namespace per package
 * (`src/i18n/ns/<name>.ts`), merged in by `t()`.
 *
 * Copy rules (binding): no en or em dashes, no shell commands as copy,
 * typographic apostrophes, French narrow no-break spaces ( ) before
 * ? ! : ; and inside « », arrows rendered by <Arrow>, never typed.
 */

import type { Widen } from "./define";

const fr = {
  nav: {
    projets: "Projets",
    outils: "Outils",
    ecrits: "Écrits",
    contact: "Contact",
    ariaLabel: "Sections",
    home: "William Moiré, retour à l’accueil",
    logoTip: "Deux trames, un léger décalage. C’est tout mon nom.",
  },
  skip: "Aller au contenu",
  lang: {
    label: "Langues",
    switchTo: { fr: "Français", en: "English", es: "Español" },
  },
  theme: {
    toLight: "Plus de lumière",
    toDark: "Moins de lumière",
  },
  footer: {
    thesis:
      "William Moiré · Mycelic Wealth. WM | MW, un palindrome. Ce qui sort du réseau y revient.",
    manifeste: "Le manifeste",
    github: "GitHub",
    x: "X",
    rss: "Flux RSS",
    legal: "Mentions légales",
    publisher: "Éditeur : William Lecompte, EI",
  },
  a11y: {
    external: "(site externe)",
  },
  common: {
    allWritings: "Tous les écrits",
  },
  paths: {
    tool: {
      me: "Un outil pour moi ou mon équipe",
      you: "un outil pour toi ou ton équipe",
      hint: "Un logiciel ou une webapp taillés pour ta façon de faire.",
      tag: "Payé, sur devis",
    },
    site: {
      me: "Un site pour mon activité",
      hint: "C’est le métier d’alysis, notre atelier à Chambéry.",
      tag: "Sur alysis.cat",
    },
    open: {
      me: "Un projet ouvert",
      you: "un projet ouvert",
      hint: "Open source, éducation Bitcoin, recherche ouverte.",
      tag: "Pas payé par défaut",
    },
    other: {
      me: "Autre chose",
      you: "autre chose",
      hint: "Une question, une invitation, une demande sur tes données.",
      tag: "Juste un message",
    },
  },
  steps: {
    label: "Comment on travaille",
    tell: { label: "Raconter", sub: "Ici, en cinq minutes." },
    scope: {
      label: "Cadrer",
      sub: "Un premier pas chiffré. Le plan est à toi, qu’on continue ou non.",
    },
    build: { label: "Construire", sub: "Par étapes courtes. Ton code, tes données." },
    care: {
      label: "Entretenir",
      sub: "Seulement si tu veux.",
      optional: "(si tu veux)",
    },
  },
  site: {
    ogLine: "Deux trames. Un troisième motif.",
    ogAlt: "William Moiré. Deux trames de lignes superposées, un troisième motif.",
  },
  rss: {
    title: "William Moiré : écrits",
    description: "Notes de chantier et idées au long cours, par William Moiré.",
  },
  /* parked page (/nourritures): kept, noindex */
  nourritures: {
    heading: "Nourritures",
    intro: "Ce qui me nourrit. Le sol d’où tout pousse.",
    tabs: { livres: "Livres", films: "Films", videos: "Vidéos" },
    empty: "Rien ici pour le moment. Bientôt.",
  },

  /* ---- Legacy (old shape, untouched) ---------------------------------------
     Read by pages not yet rewritten. A namespace with the same name
     deep-merges over its object (see LEGACY_KEYS in index.ts). WP1b deletes
     this block, except meta.nourritures. */
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
} as const;

export type UIDict = Widen<typeof fr>;

const en: UIDict = {
  nav: {
    projets: "Projects",
    outils: "Tools",
    ecrits: "Writings",
    contact: "Contact",
    ariaLabel: "Sections",
    home: "William Moiré, back to home",
    logoTip: "Two grids, a slight shift. That’s my whole name.",
  },
  skip: "Skip to content",
  lang: {
    label: "Languages",
    switchTo: { fr: "Français", en: "English", es: "Español" },
  },
  theme: {
    toLight: "More light",
    toDark: "Less light",
  },
  footer: {
    thesis:
      "William Moiré · Mycelic Wealth. WM | MW, a palindrome. What leaves the network comes back.",
    manifeste: "The manifesto",
    github: "GitHub",
    x: "X",
    rss: "RSS feed",
    legal: "Legal notice",
    publisher: "Publisher: William Lecompte, sole trader (EI)",
  },
  a11y: {
    external: "(external site)",
  },
  common: {
    allWritings: "All writings",
  },
  paths: {
    tool: {
      me: "A tool for me or my team",
      you: "a tool for you or your team",
      hint: "Software or a web app cut to the way you work.",
      tag: "Paid, quoted",
    },
    site: {
      me: "A website for my business",
      hint: "That’s what alysis does, our atelier in Chambéry.",
      tag: "On alysis.cat",
    },
    open: {
      me: "An open project",
      you: "an open project",
      hint: "Open source, Bitcoin education, open research.",
      tag: "Not paid by default",
    },
    other: {
      me: "Something else",
      you: "something else",
      hint: "A question, an invitation, a request about your data.",
      tag: "Just a message",
    },
  },
  steps: {
    label: "How we work",
    tell: { label: "Tell", sub: "Right here, in five minutes." },
    scope: {
      label: "Scope",
      sub: "A priced first step. The plan is yours, whether we go on or not.",
    },
    build: { label: "Build", sub: "In short steps. Your code, your data." },
    care: {
      label: "Maintain",
      sub: "Only if you want.",
      optional: "(if you want)",
    },
  },
  site: {
    ogLine: "Two layers. A third pattern.",
    ogAlt: "William Moiré. Two overlapping line grids, a third pattern.",
  },
  rss: {
    title: "William Moiré: writings",
    description: "Build notes and long-running ideas, by William Moiré.",
  },
  nourritures: {
    heading: "Nourishment",
    intro: "What feeds me. The soil everything grows from.",
    tabs: { livres: "Books", films: "Films", videos: "Videos" },
    empty: "Nothing here yet. Soon.",
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
};

const es: UIDict = {
  nav: {
    projets: "Proyectos",
    outils: "Herramientas",
    ecrits: "Escritos",
    contact: "Contacto",
    ariaLabel: "Secciones",
    home: "William Moiré, volver al inicio",
    logoTip: "Dos tramas, un ligero desfase. Ese es todo mi nombre.",
  },
  skip: "Ir al contenido",
  lang: {
    label: "Idiomas",
    switchTo: { fr: "Français", en: "English", es: "Español" },
  },
  theme: {
    toLight: "Más luz",
    toDark: "Menos luz",
  },
  footer: {
    thesis:
      "William Moiré · Mycelic Wealth. WM | MW, un palíndromo. Lo que sale de la red vuelve a ella.",
    manifeste: "El manifiesto",
    github: "GitHub",
    x: "X",
    rss: "Canal RSS",
    legal: "Aviso legal",
    publisher: "Editor: William Lecompte, empresario individual (EI)",
  },
  a11y: {
    external: "(sitio externo)",
  },
  common: {
    allWritings: "Todos los escritos",
  },
  paths: {
    tool: {
      me: "Una herramienta para mí o mi equipo",
      you: "una herramienta para ti o tu equipo",
      hint: "Un software o una webapp a la medida de tu forma de trabajar.",
      tag: "De pago, con presupuesto",
    },
    site: {
      me: "Una web para mi negocio",
      hint: "Es el oficio de alysis, nuestro taller en Chambéry.",
      tag: "En alysis.cat",
    },
    open: {
      me: "Un proyecto abierto",
      you: "un proyecto abierto",
      hint: "Código abierto, educación Bitcoin, investigación abierta.",
      tag: "Sin pago por defecto",
    },
    other: {
      me: "Otra cosa",
      you: "otra cosa",
      hint: "Una pregunta, una invitación, una solicitud sobre tus datos.",
      tag: "Solo un mensaje",
    },
  },
  steps: {
    label: "Cómo trabajamos",
    tell: { label: "Contar", sub: "Aquí, en cinco minutos." },
    scope: {
      label: "Acotar",
      sub: "Un primer paso con precio. El plan es tuyo, sigamos o no.",
    },
    build: { label: "Construir", sub: "Por etapas cortas. Tu código, tus datos." },
    care: {
      label: "Mantener",
      sub: "Solo si quieres.",
      optional: "(si quieres)",
    },
  },
  site: {
    ogLine: "Dos tramas. Un tercer patrón.",
    ogAlt: "William Moiré. Dos tramas de líneas superpuestas, un tercer patrón.",
  },
  rss: {
    title: "William Moiré: escritos",
    description: "Notas de obra e ideas de largo recorrido, por William Moiré.",
  },
  nourritures: {
    heading: "Alimentos",
    intro: "Lo que me nutre. El suelo del que todo crece.",
    tabs: { livres: "Libros", films: "Películas", videos: "Vídeos" },
    empty: "Nada por ahora. Pronto.",
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
};

export const ui = { fr, en, es } as const;
