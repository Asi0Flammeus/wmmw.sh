/** /contact page copy around the intake (copy deck §8, §13.1). */
import { defineNamespace, type Widen } from "../define";

const fr = {
  meta: {
    title: "Travailler ensemble",
    description:
      "Un outil fait pour toi ou ton équipe, un projet ouvert, autre chose\u202F: raconte-moi ce qui coince. Réponse sous 3 jours ouvrés.",
  },
  heading: "Travailler ensemble",
  lede: "Je construis le logiciel dont tu as besoin. Pas celui qu’on vend à tout le monde.",
  split: "Ce que je publie est libre. Ce que je construis pour toi est cadré et payé.",
  steps: { heading: "Comment ça se passe" },
  gets: {
    heading: "Ce que tu emportes",
    items: {
      fin: { dim: "financière", text: "Moins de tâches à la main. Un devis clair, sans surprise." },
      rel: { dim: "relationnelle", text: "Une ligne directe avec celui qui code." },
      int: { dim: "intellectuelle", text: "Ton code, tes données, et de quoi les comprendre." },
      exp: { dim: "expérientielle", text: "Un chantier que tu peux suivre, erreurs comprises." },
      emo: { dim: "émotionnelle", text: "Du calme\u202F: un périmètre honnête, aucune dépendance." },
    },
    why: "Pourquoi cinq\u202F? Le manifeste.",
  },
  elsewhere: "Ailleurs",
  links: {
    github: "Le code, à ciel ouvert.",
    x: "Notes courtes et conversations.",
    planb: "Mes cours et ma page de professeur.",
  },
  portraitAlt: "William Moiré, de profil dans la lumière basse d’un intérieur.",
  portraitCaption: "William Moiré · asi0",
} as const;

const en: Widen<typeof fr> = {
  meta: {
    title: "Work together",
    description:
      "A tool made for you or your team, an open project, something else: tell me what’s stuck. Reply within 3 working days.",
  },
  heading: "Work together",
  lede: "I build the software you need. Not the one sold to everyone.",
  split: "What I publish is free. What I build for you is scoped and paid.",
  steps: { heading: "How it goes" },
  gets: {
    heading: "What you leave with",
    items: {
      fin: { dim: "financial", text: "Less work done by hand. A clear quote, no surprises." },
      rel: { dim: "relational", text: "A direct line to the person writing the code." },
      int: { dim: "intellectual", text: "Your code, your data, and what you need to understand them." },
      exp: { dim: "experiential", text: "A build you can follow, mistakes included." },
      emo: { dim: "emotional", text: "Calm: an honest scope, and no lock-in." },
    },
    why: "Why five? The manifesto.",
  },
  elsewhere: "Elsewhere",
  links: {
    github: "The code, in the open.",
    x: "Short notes and conversations.",
    planb: "My courses and my teacher page.",
  },
  portraitAlt: "William Moiré, in profile, in the low light of an interior.",
  portraitCaption: "William Moiré · asi0",
};

const es: Widen<typeof fr> = {
  meta: {
    title: "Trabajar juntos",
    description:
      "Una herramienta hecha para ti o tu equipo, un proyecto abierto, otra cosa: cuéntame qué se atasca. Respuesta en 3 días laborables.",
  },
  heading: "Trabajar juntos",
  lede: "Construyo el software que necesitas. No el que se vende a todo el mundo.",
  split: "Lo que publico es libre. Lo que construyo para ti está acotado y se paga.",
  steps: { heading: "Cómo funciona" },
  gets: {
    heading: "Lo que te llevas",
    items: {
      fin: { dim: "financiera", text: "Menos tareas a mano. Un presupuesto claro, sin sorpresas." },
      rel: { dim: "relacional", text: "Una línea directa con quien escribe el código." },
      int: { dim: "intelectual", text: "Tu código, tus datos, y lo necesario para entenderlos." },
      exp: { dim: "experiencial", text: "Una obra que puedes seguir, errores incluidos." },
      emo: { dim: "emocional", text: "Calma: un alcance honesto y ninguna dependencia." },
    },
    why: "¿Por qué cinco? El manifiesto.",
  },
  elsewhere: "En otros sitios",
  links: {
    github: "El código, a cielo abierto.",
    x: "Notas breves y conversaciones.",
    planb: "Mis cursos y mi página de profesor.",
  },
  portraitAlt: "William Moiré, de perfil, en la luz tenue de un interior.",
  portraitCaption: "William Moiré · asi0",
};

export default defineNamespace("contact", { fr, en, es });

declare module "../index" {
  interface Namespaces {
    contact: Widen<typeof fr>;
  }
}
