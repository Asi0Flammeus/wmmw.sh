/** /outils copy (copy deck §5, §13.1). Tool blurbs live in src/content/tools/*.json. */
import { defineNamespace, type Widen } from "../define";

const fr = {
  meta: {
    title: "Outils",
    description:
      "Des outils libres nés de mon quotidien\u202F: suivre ses agents IA, dicter à la voix, faire une pause avant les sites qui happent.",
  },
  heading: "Outils",
  intro: "Des outils libres, nés de mon quotidien. Prends ce qui te sert.",
  install: "Installer",
  repo: "Le code",
  private: "Dépôt privé pour l’instant.",
  status: { stable: "stable", beta: "bêta" },
  copy: "Copier",
  copied: "Copié",
  cta: {
    line: "Tu veux un outil comme ça, mais taillé pour toi\u202F?",
    link: "Raconte-moi",
  },
} as const;

const en: Widen<typeof fr> = {
  meta: {
    title: "Tools",
    description:
      "Free tools from my daily work: watch your AI agents, dictate by voice, pause before the sites that pull you in.",
  },
  heading: "Tools",
  intro: "Free tools that grew out of my daily work. Take whatever helps.",
  install: "Install",
  repo: "The code",
  private: "Private repository for now.",
  status: { stable: "stable", beta: "beta" },
  copy: "Copy",
  copied: "Copied",
  cta: {
    line: "Want a tool like these, cut to fit you?",
    link: "Tell me",
  },
};

const es: Widen<typeof fr> = {
  meta: {
    title: "Herramientas",
    description:
      "Herramientas libres de mi día a día: seguir a tus agentes de IA, dictar por voz, pausar antes de los sitios que atrapan.",
  },
  heading: "Herramientas",
  intro: "Herramientas libres, nacidas de mi día a día. Toma lo que te sirva.",
  install: "Instalar",
  repo: "El código",
  private: "Repositorio privado por ahora.",
  status: { stable: "estable", beta: "beta" },
  copy: "Copiar",
  copied: "Copiado",
  cta: {
    line: "¿Quieres una herramienta así, pero hecha a tu medida?",
    link: "Cuéntame",
  },
};

export default defineNamespace("outils", { fr, en, es });

declare module "../index" {
  interface Namespaces {
    outils: Widen<typeof fr>;
  }
}
