/**
 * Structured data (copy deck §13.3). Home only: a Person and the WebSite it
 * publishes. The real name stays on legal surfaces, never here.
 * Written by WP1a from the deck; WP5 owns it from here.
 */
import type { Locale } from "@i18n/index";
import {
  SITE_URL,
  BRAND_NAME,
  SITE_NAME,
  GITHUB_URL,
  X_URL,
  PLANB_URL,
  PLANB_PROFESSOR_URL,
  ALYSIS_URL,
} from "./site";

const PERSON: Record<Locale, { jobTitle: string; description: string }> = {
  fr: {
    jobTitle: "Développeur indépendant",
    description:
      "Physicien devenu développeur indépendant. Maintient Plan ₿ Academy, fait des sites avec alysis et des outils sur mesure pour une personne ou une équipe.",
  },
  en: {
    jobTitle: "Independent developer",
    description:
      "Physicist turned independent developer. Maintains Plan ₿ Academy, builds websites with alysis and custom tools for one person or one team.",
  },
  es: {
    jobTitle: "Desarrollador independiente",
    description:
      "Físico convertido en desarrollador independiente. Mantiene Plan ₿ Academy, hace webs con alysis y herramientas a medida para una persona o un equipo.",
  },
};

export function homeJsonLd(locale: Locale): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: BRAND_NAME,
        givenName: "William",
        alternateName: ["asi0", "asi0 flammeus", "Asi0Flammeus"],
        url: SITE_URL,
        jobTitle: PERSON[locale].jobTitle,
        description: PERSON[locale].description,
        knowsAbout: [
          "Bitcoin education",
          "Web development",
          "Custom software",
          "AI agents",
          "Physics",
        ],
        affiliation: {
          "@type": "EducationalOrganization",
          name: "Plan ₿ Academy",
          url: PLANB_URL,
        },
        worksFor: { "@type": "Organization", name: "alysis", url: ALYSIS_URL },
        sameAs: [GITHUB_URL, X_URL, PLANB_PROFESSOR_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        name: BRAND_NAME,
        alternateName: SITE_NAME,
        url: SITE_URL,
        inLanguage: ["fr", "en", "es"],
        publisher: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };
}
