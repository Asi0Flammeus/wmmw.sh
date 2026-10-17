#!/usr/bin/env node
// Optics lens palette builder: solves lightness for target WCAG ratios, clamps chroma to sRGB,
// writes palettes.json next to this file. Run: node _build.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const toLin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
function lin(L, C, H) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const inGamut = (L, C, H) => lin(L, C, H).every((v) => v >= -0.0004 && v <= 1.0004);
const fit = ([L, C, H]) => { let c = C; while (c > 0 && !inGamut(L, c, H)) c -= 0.002; return [L, +Math.max(0, c).toFixed(3), H]; };
const Y = ([L, C, H]) => { const p = lin(L, C, H).map((v) => Math.min(1, Math.max(0, v))); const e = p.map((v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)); const q = e.map(toLin); return 0.2126 * q[0] + 0.7152 * q[1] + 0.0722 * q[2]; };
const cr = (a, b) => { const x = Y(a), y = Y(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// solve L so that colour (C,H) reaches `target` against `bg`, searching away from bg lightness
function solve(C, H, bg, target) {
  const darker = bg[0] > 0.5;
  let lo = darker ? 0.05 : bg[0], hi = darker ? bg[0] : 0.99, best = null;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2, col = fit([mid, C, H]), r = cr(col, bg);
    if (darker) { if (r >= target) { best = col; lo = mid; } else hi = mid; }
    else { if (r >= target) { best = col; hi = mid; } else lo = mid; }
  }
  return [+best[0].toFixed(3), best[1], H];
}
const s = ([L, C, H], a) => `oklch(${+L.toFixed(3)} ${+C.toFixed(3)} ${H}${a !== undefined ? ` / ${a}` : ""})`;

// mode spec -> tokens
function mode(m) {
  const bg = fit(m.bg), surface = fit(m.surface);
  const ink = m.ink.length === 3 && m.ink[0] ? fit(m.ink) : solve(m.ink[1], m.ink[2], bg, m.inkTarget ?? 12.5);
  const ink2 = solve(m.ink2[0], m.ink2[1], bg, m.ink2Target ?? 7.6);
  const ink3 = solve(m.ink3[0], m.ink3[1], surface, m.ink3Target ?? 4.85);
  const accent = fit(m.accent);
  const at = m.accentText ? (m.accentText.length === 3 ? fit(m.accentText) : solve(m.accentText[0], m.accentText[1], surface, m.atTarget ?? 5)) : accent;
  const onA = fit(m.onAccent);
  const focus = m.focus ? fit(m.focus) : at;
  return {
    bg: s(bg), surface: s(surface), ink: s(ink), "ink-2": s(ink2), "ink-3": s(ink3),
    line: s(m.lineCol ? fit(m.lineCol) : ink, m.lineA ?? 0.14),
    accent: s(accent), "accent-text": s(at), "on-accent": s(onA),
    fringe: s(fit(m.fringe), m.fringeA), focus: s(focus),
  };
}

const P = JSON.parse(fs.readFileSync(path.join(here, "_spec.json"), "utf8"));
const out = { lens: P.lens, notes: P.notes, palettes: P.palettes.map((p) => ({ id: p.id, name: p.name, story: p.story, whyNotObvious: p.whyNotObvious, light: mode(p.light), dark: mode(p.dark) })) };
fs.writeFileSync(path.join(here, "palettes.json"), JSON.stringify(out, null, 1));
for (const p of out.palettes) console.log(p.id, JSON.stringify(p.light), "\n   ", JSON.stringify(p.dark));
