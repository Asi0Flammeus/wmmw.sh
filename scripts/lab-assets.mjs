#!/usr/bin/env node
/**
 * /lab assets (spec §7.10, decision A12). The Docker build context excludes
 * docs/, so /lab serves committed copies: palette and type renders as WebP
 * (1200 px wide, quality 80), the five moiré prototypes with what they load,
 * and src/lib/lab-data.json (palette stories and judges' scores). The PNG
 * renders are gitignored in docs/moire/explore: run it from the checkout that
 * has them, or point LAB_SRC at that explore directory.
 * Re-run by hand when the explorations change:  node scripts/lab-assets.mjs
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.env.LAB_SRC || join(ROOT, "docs/moire/explore");
const OUT = join(ROOT, "public/lab");

const PALETTE_DIRS = { G: "obvious", OPTICS: "optics", PRINT: "print", SPORE: "spore" };
const PALETTES = ["G1", "G2", ...[1, 2, 3, 4, 5].flatMap((n) => [`OPTICS${n}`, `PRINT${n}`, `SPORE${n}`])];
const TYPE = ["a", "a2", "a3", "b", "c", "d", "e", "f", "g", "rec-1440-light", "rec-932-dark", "rec-390-light", "rec-390-dark"];
const MOIRE = ["w1-hero.html", "w2-ghosts.html", "q1-toggle.html", "q2-row.html", "q3-monogram.html", "tokens.css", "favicon.svg", "monogram.svg", "og.svg"];
/* U+2013, U+2014 and prompt glyphs are banned from public/ (copy lint T3) */
const BANNED = /[\u2013\u2014\u276F]|~\$|^\$ /m;

const family = (id) => PALETTE_DIRS[id.replace(/\d+$/, "")];

/** Write one WebP and return its size (the page sets explicit width and height). */
async function webp(src, dest) {
  await mkdir(dirname(dest), { recursive: true });
  const { width, height } = await sharp(src).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
  return { width, height };
}

const sizes = {};
for (const id of PALETTES) sizes[`palettes/${id}`] = await webp(join(SRC, "palettes", family(id), `${id}.png`), join(OUT, "palettes", `${id}.webp`));
for (const id of TYPE) sizes[`type/${id}`] = await webp(join(SRC, "type", `${id}.png`), join(OUT, "type", `${id}.webp`));

await mkdir(join(OUT, "moire/fonts"), { recursive: true });
const fonts = new Set();
for (const name of MOIRE) {
  const text = await readFile(join(SRC, "moire", name), "utf8");
  if (BANNED.test(text)) throw new Error(`lab-assets: banned glyph in moire/${name}`);
  for (const m of text.matchAll(/url\("?(fonts\/[^")]+)"?\)/g)) fonts.add(m[1]);
  await writeFile(join(OUT, "moire", name), text);
}
for (const font of fonts) await copyFile(join(SRC, "moire", font), join(OUT, "moire", font));

/* palette stories and judges' scores */
const stories = {};
for (const dir of Object.values(PALETTE_DIRS)) {
  const data = JSON.parse(await readFile(join(SRC, "palettes", dir, "palettes.json"), "utf8"));
  for (const p of data.palettes) stories[p.id] = { name: p.name, story: (p.story ?? "").split(/(?<=[.!?])\s/)[0] };
}
const judges = JSON.parse(await readFile(join(SRC, "judges/results.json"), "utf8"));
const judgeName = (j) => j.judge.split(/[\s(]/)[0];
const palettes = PALETTES.map((id) => ({
  id,
  name: stories[id]?.name ?? id,
  story: stories[id]?.story ?? "",
  scores: Object.fromEntries(judges.map((j) => [judgeName(j), j.scores.find((s) => s.id === id)?.score ?? null])),
}));
const summary = judges.map((j) => ({
  judge: judgeName(j),
  top3: j.top3,
  optics5: j.scores.find((s) => s.id === "OPTICS5")?.score ?? null,
}));
const json = JSON.stringify({ palettes, judges: summary, sizes }, null, 2);
if (BANNED.test(json)) throw new Error("lab-assets: banned glyph in lab-data.json");
await writeFile(join(ROOT, "src/lib/lab-data.json"), `${json}\n`);
console.log(`lab-assets: ${PALETTES.length} palettes, ${TYPE.length} type renders, ${MOIRE.length + fonts.size} moiré files`);
