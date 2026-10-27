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
  meta: {
    nourritures: "Ce qui me nourrit\u202F: livres, films et vidéos. Le sol d’où tout pousse.",
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
  meta: {
    nourritures: "What feeds me: books, films and videos. The soil everything grows from.",
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
  meta: {
    nourritures: "Lo que me nutre: libros, películas y vídeos. El suelo del que todo crece.",
  },
};

export const ui = { fr, en, es } as const;
