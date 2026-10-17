// quick tuner: node _check.mjs palettes.json [ID] -> compact ratio table (math copied from contrast.mjs)
import fs from "fs";
const clamp = (x) => Math.min(1, Math.max(0, x));
function oklchToSrgb(L, C, H) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const inGamut = lin.every((v) => v >= -0.0005 && v <= 1.0005);
  const enc = lin.map((v) => { v = clamp(v); return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055; });
  return { rgb: enc, lin: lin.map(clamp), inGamut };
}
function parse(c) {
  c = c.trim();
  let m;
  if ((m = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i))) {
    let h = m[1]; if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const lin = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return { rgb, lin, inGamut: true, alpha: 1 };
  }
  if ((m = c.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+)(%?))?\s*\)$/i))) {
    const rgb = [m[1], m[2], m[3]].map((v) => parseFloat(v) / 255);
    let a = m[4] === undefined ? 1 : parseFloat(m[4]); if (m[5] === "%") a /= 100;
    return { rgb, lin: rgb.map(toLin), inGamut: true, alpha: a };
  }
  if ((m = c.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/i))) {
    let L = parseFloat(m[1]); if (m[2] === "%" || L > 1) L = L / 100;
    let a = m[5] === undefined ? 1 : parseFloat(m[5]); if (m[6] === "%") a /= 100;
    return { ...oklchToSrgb(L, parseFloat(m[3]), parseFloat(m[4])), alpha: a };
  }
  throw new Error("unparseable color: " + c);
}
function toLin(v) { return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }
function over(fg, bg) { const a = fg.alpha ?? 1; if (a >= 1) return fg; const rgb = fg.rgb.map((v, i) => v * a + bg.rgb[i] * (1 - a)); return { rgb, lin: rgb.map(toLin), inGamut: true, alpha: 1 }; }
const lum = (p) => 0.2126 * p.lin[0] + 0.7152 * p.lin[1] + 0.0722 * p.lin[2];
function ratio(fg, bg) { const B = parse(bg), F = over(parse(fg), B); const a = lum(F), b = lum(B); const [hi, lo] = a > b ? [a, b] : [b, a]; return (hi + 0.05) / (lo + 0.05); }
const hex = (c) => "#" + parse(c).rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");

const P = [["ink","bg",11],["ink","surface",7],["ink-2","bg",7],["ink-3","bg",4.5],["ink-3","surface",4.5],["accent-text","bg",4.5],["accent-text","surface",4.5],["on-accent","accent",4.5],["accent","bg",3],["focus","bg",3],["line","bg",1.15],["fringe","bg",0],["accent","surface",0],["ink","accent",0]];
const data = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const only = process.argv[3];
for (const p of data.palettes) {
  if (only && p.id !== only) continue;
  console.log("#", p.id, p.name);
  for (const m of ["light","dark"]) {
    const t = p[m];
    const g = Object.entries(t).filter(([k,v]) => !parse(v).inGamut).map(([k]) => k);
    console.log("  " + m + "  hex: " + ["bg","surface","ink","ink-2","ink-3","accent","accent-text","on-accent"].map(k => k + "=" + hex(t[k])).join(" ") + (g.length ? "  OUT-OF-GAMUT: " + g.join(",") : ""));
    console.log("    " + P.map(([f,b,min]) => { const v = ratio(t[f], t[b]); return `${f}/${b} ${v.toFixed(2)}${v < min ? "!" : ""}`; }).join(" | "));
  }
}
