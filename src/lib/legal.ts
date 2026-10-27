/**
 * Variables of the legal notice (spec §7.8, copy deck §11). Never rendered as
 * placeholders: a null value drops its sentence or section.
 *
 * Checked 2026-10-27 on https://alysis.cat/mentions-legales (same EI): SIREN,
 * SIRET, VAT number and registered address match. Owner to confirm (deck D-16).
 */

export const SIREN = "928 675 495";
export const SIRET = "928 675 495 000 16";
export const TVA = "FR63928675495";
export const ADRESSE_SIEGE = "334 rue Nicolas Parent, 73000 Chambéry, France";

/** Scaleway's phone, once verified on Scaleway's own legal page; null keeps only the address. */
export const SCALEWAY_TEL: string | null = null;

/** Consumer mediator (deck flag 3): null means not designated, so « Médiation » is not rendered. */
export const MEDIATEUR: string | null = null;

export const POLICES = "Basteleur (Velvetyne), Schibsted Grotesk, JetBrains Mono";

export const MAJ = { fr: "octobre 2026", en: "October 2026", es: "octubre de 2026" } as const;

if (MEDIATEUR === null) {
  console.warn("[legal] MEDIATEUR is not designated: the Médiation section is not rendered (copy deck §11.4, flag 3)");
}
