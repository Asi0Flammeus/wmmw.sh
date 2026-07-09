/**
 * UI chrome dictionary. FR is canonical; EN and ES mirror its exact shape.
 * Copy rule (binding): no em or en dashes anywhere in visible copy.
 */

const fr = {
  nav: {
    projets: "Projets",
    outils: "Outils",
    ecrits: "Écrits",
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
    h1a: "Ce qui sort du réseau",
    h1aEm: "réseau",
    h1b: "y revient.",
    sub: "William. Physicien de formation, tisseur de réseaux par nature. Je fais circuler le code, le savoir et la valeur.",
    cta: "./lire-manifeste.sh",
  },
  manifeste: {
    heading: "La forêt n'a pas besoin d'un arbre de plus.",
    headingGold: "Elle a besoin de mycélium.",
    cmd: "cat manifeste.md",
    readMore: "cat manifeste.md | less",
    title: "Manifeste",
  },
  projets: {
    heading: "Projets",
    cmd: "ls projets/",
    intro: "# Les arbres que le réseau nourrit.",
    all: "cd projets/",
  },
  outils: {
    heading: "Outils & repos",
    cmd: "tree outils/",
    intro: "# Des outils libres, comme des spores : prenez, semez.",
    all: "cd outils/",
    treeSummary: (n: number) => `${n} directories, 0 files`,
    repoPrivate: "repo privé, ouverture prochaine",
    install: "installation",
  },
  ecrits: {
    heading: "Écrits",
    cmd: "ls ecrits/*.md",
    intro: "# Des signaux envoyés dans le réseau.",
    all: "cd ecrits/",
    published: "publié le",
    updated: "mis à jour le",
    back: "cd ..",
    translations: "aussi disponible en",
    readingDir: "ecrits/",
  },
  nourritures: {
    heading: "Nourritures",
    cmdBooks: "cat -n nourritures/livres.txt",
    cmdDirs: "ls nourritures/films/ nourritures/videos/",
    intro: "# Ce qui me nourrit. Le sol d'où tout pousse.",
    tabs: { livres: "Livres", films: "Films", videos: "Vidéos" },
    empty: "# vide pour le moment. bientôt.",
  },
  footer: {
    echoCmd: 'echo "$WMMW"',
    echoOut:
      "wmmw.sh : WilliaM Mycelic Wealth. Un palindrome. Ce qui sort du réseau y revient.",
    linksCmd: "ls -l liens/",
    rss: "flux rss",
    contactSoon: "courriel, bientôt",
  },
  notFound: {
    output: "cat: aucun fichier ou dossier de ce type",
    hint: "cd /",
  },
  meta: {
    home: "William, alias asi0. Projets, outils, écrits et nourritures, portés par la richesse mycélique : la richesse s'échange, elle ne s'empile pas.",
    manifeste: "La richesse mycélique : apporter des ressources aux autres sans exiger de retour. Le manifeste au long format.",
    projets: "Les arbres que le réseau nourrit : recherche ouverte, éducation Bitcoin, sites artisanaux, art émergent.",
    outils: "Des outils libres, comme des spores : TUI pour agents, dictée vocale, extensions, CLI cloud.",
    ecrits: "Des signaux envoyés dans le réseau : essais sur la technique, la physique et ce qui circule entre les deux.",
    nourritures: "Ce qui me nourrit : livres, films et vidéos. Le sol d'où tout pousse.",
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
    h1a: "What leaves the network",
    h1aEm: "network",
    h1b: "comes back.",
    sub: "William. Physicist by training, network weaver by nature. I keep code, knowledge and value in circulation.",
    cta: "./read-manifesto.sh",
  },
  manifeste: {
    heading: "The forest does not need one more tree.",
    headingGold: "It needs mycelium.",
    cmd: "cat manifesto.md",
    readMore: "cat manifesto.md | less",
    title: "Manifesto",
  },
  projets: {
    heading: "Projects",
    cmd: "ls projets/",
    intro: "# The trees the network feeds.",
    all: "cd projets/",
  },
  outils: {
    heading: "Tools & repos",
    cmd: "tree outils/",
    intro: "# Free tools, like spores: take them, sow them.",
    all: "cd outils/",
    treeSummary: (n: number) => `${n} directories, 0 files`,
    repoPrivate: "private repo, opening soon",
    install: "install",
  },
  ecrits: {
    heading: "Writings",
    cmd: "ls ecrits/*.md",
    intro: "# Signals sent into the network.",
    all: "cd ecrits/",
    published: "published",
    updated: "updated",
    back: "cd ..",
    translations: "also available in",
    readingDir: "ecrits/",
  },
  nourritures: {
    heading: "Nourishment",
    cmdBooks: "cat -n nourritures/books.txt",
    cmdDirs: "ls nourritures/films/ nourritures/videos/",
    intro: "# What feeds me. The soil everything grows from.",
    tabs: { livres: "Books", films: "Films", videos: "Videos" },
    empty: "# empty for now. soon.",
  },
  footer: {
    echoCmd: 'echo "$WMMW"',
    echoOut:
      "wmmw.sh: WilliaM Mycelic Wealth. A palindrome. What leaves the network returns to it.",
    linksCmd: "ls -l liens/",
    rss: "rss feed",
    contactSoon: "email, soon",
  },
  notFound: {
    output: "cat: no such file or directory",
    hint: "cd /",
  },
  meta: {
    home: "William, aka asi0. Projects, tools, writings and nourishment, carried by mycelic wealth: wealth is exchanged, it does not stack.",
    manifeste: "Mycelic wealth: bringing resources to others without demanding a return. The long-form manifesto.",
    projets: "The trees the network feeds: open research, Bitcoin education, handcrafted websites, emerging art.",
    outils: "Free tools, like spores: agent TUI, voice dictation, browser extensions, cloud CLI.",
    ecrits: "Signals sent into the network: essays on technology, physics and what flows between the two.",
    nourritures: "What feeds me: books, films and videos. The soil everything grows from.",
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
    h1a: "Lo que sale de la red",
    h1aEm: "red",
    h1b: "vuelve.",
    sub: "William. Físico de formación, tejedor de redes por naturaleza. Hago circular el código, el saber y el valor.",
    cta: "./leer-manifiesto.sh",
  },
  manifeste: {
    heading: "El bosque no necesita un árbol más.",
    headingGold: "Necesita micelio.",
    cmd: "cat manifiesto.md",
    readMore: "cat manifiesto.md | less",
    title: "Manifiesto",
  },
  projets: {
    heading: "Proyectos",
    cmd: "ls projets/",
    intro: "# Los árboles que la red alimenta.",
    all: "cd projets/",
  },
  outils: {
    heading: "Herramientas y repos",
    cmd: "tree outils/",
    intro: "# Herramientas libres, como esporas: toma, siembra.",
    all: "cd outils/",
    treeSummary: (n: number) => `${n} directories, 0 files`,
    repoPrivate: "repo privado, se abrirá pronto",
    install: "instalación",
  },
  ecrits: {
    heading: "Escritos",
    cmd: "ls ecrits/*.md",
    intro: "# Señales enviadas a la red.",
    all: "cd ecrits/",
    published: "publicado el",
    updated: "actualizado el",
    back: "cd ..",
    translations: "también disponible en",
    readingDir: "ecrits/",
  },
  nourritures: {
    heading: "Alimentos",
    cmdBooks: "cat -n nourritures/libros.txt",
    cmdDirs: "ls nourritures/films/ nourritures/videos/",
    intro: "# Lo que me nutre. El suelo del que todo crece.",
    tabs: { livres: "Libros", films: "Películas", videos: "Vídeos" },
    empty: "# vacío por ahora. pronto.",
  },
  footer: {
    echoCmd: 'echo "$WMMW"',
    echoOut:
      "wmmw.sh: WilliaM Mycelic Wealth. Un palíndromo. Lo que sale de la red vuelve a ella.",
    linksCmd: "ls -l liens/",
    rss: "canal rss",
    contactSoon: "correo, pronto",
  },
  notFound: {
    output: "cat: no existe el fichero o el directorio",
    hint: "cd /",
  },
  meta: {
    home: "William, alias asi0. Proyectos, herramientas, escritos y alimentos, guiados por la riqueza micélica: la riqueza se intercambia, no se apila.",
    manifeste: "La riqueza micélica: aportar recursos a los demás sin exigir retorno. El manifiesto en formato largo.",
    projets: "Los árboles que la red alimenta: investigación abierta, educación Bitcoin, webs artesanales, arte emergente.",
    outils: "Herramientas libres, como esporas: TUI para agentes, dictado por voz, extensiones, CLI cloud.",
    ecrits: "Señales enviadas a la red: ensayos sobre la técnica, la física y lo que circula entre ambas.",
    nourritures: "Lo que me nutre: libros, películas y vídeos. El suelo del que todo crece.",
    notFound: "Página no encontrada.",
  },
  rss: {
    title: "wmmw.sh: escritos",
    description: "Señales enviadas a la red. Los escritos de William (asi0).",
  },
};

export const ui = { fr, en, es } as const;
export type UIDict = Dict;
