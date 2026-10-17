#!/usr/bin/env python3
"""Generate specimen.html for the William Moiré type exploration.

Run: python3 build.py  (writes specimen.html next to this file)
Fonts: Google Fonts CSS for library faces, local files for Basteleur
(public/fonts) and Sprat (fonts/, OFL, from github.com/EthanNakache/Sprat-type).
"""
from pathlib import Path

HERE = Path(__file__).parent
NNBSP = " "

HERO_LINE = "Faisons circuler le savoir, la pratique et la valeur."
ASIDE = "Physicien de formation. Aussi connu comme asi0."
PARA = (
    f"Depuis des années, une phrase me dérange{NNBSP}: réduire «{NNBSP}riche{NNBSP}» "
    f"à «{NNBSP}riche financièrement{NNBSP}». On a laissé un seul chiffre confisquer un mot "
    "qui en portait cinq. La richesse ne se compte pas, elle se traverse. Elle s’échange, "
    "elle ne s’empile pas. Physicien de formation, j’ai passé des années à chercher les "
    f"structures cachées derrière ce qui se voit. Un moiré en est une{NNBSP}: deux trames "
    "presque identiques, un léger décalage, et un troisième motif apparaît, qui n’appartient "
    "à aucune des deux. C’est ainsi que je travaille. Ton contexte, mon métier, et un outil "
    "qu’aucun de nous n’avait. Le code et les écrits restent à ciel ouvert, comme Plan ₿ "
    "Academy. Si tu es tombé dessus, c’est qu’un fil t’y a conduit. Suis-le."
)
ROWS = [
    ("Plan ₿ Academy", "Le savoir Bitcoin, libre, dans ta langue.", "planb.academy ↗"),
    ("alysis", "Des sites faits main pour des métiers faits main.", "alysis.cat ↗"),
    ("Outils sur mesure", f"Un logiciel pour une seule personne{NNBSP}? C’est ma taille.", "sur demande"),
    ("Ghosts", "Des agents au très long cours. J’en dis plus bientôt.", "bientôt"),
]
WRITINGS = [
    ("2026-07-04", "Un workflow à en perdre la tête"),
    ("2026-02-12", "Discuter avec Silicium"),
]
GLYPHS = "Écrits · Œuvre · Ça · Ñ · ₿"

GOOGLE = (
    "https://fonts.googleapis.com/css2?"
    "family=Atkinson+Hyperlegible+Next:wght@200..800"
    "&family=Piazzolla:ital,opsz,wght@0,8..30,100..900;1,8..30,100..900"
    "&family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900"
    "&family=Hubot+Sans:wdth,wght@75..125,200..900"
    "&family=Mona+Sans:wdth,wght@75..125,200..900"
    "&family=Hedvig+Letters+Serif:opsz@12..24"
    "&family=Hedvig+Letters+Sans"
    "&family=Recursive:slnt,wght,CASL,CRSV,MONO@-15..0,300..1000,0..1,0..1,0..1"
    "&family=JetBrains+Mono:wght@100..800"
    "&display=block"
)

# Each pairing: id, title, faces, licence, b(itcoin) note, CSS custom properties.
# --d* display, --t* text, --m* mono. Fallback faces after the primary carry ₿ when missing.
JBM = "'JetBrains Mono', ui-monospace, monospace"
BAST = "'Basteleur', Georgia, serif"
P = [
    dict(id="a", name="Basteleur ss01 + Atkinson Hyperlegible Next + JetBrains Mono",
         role="Dossier starting point. Keep Basteleur, move reading to a legibility sans.",
         lic="OFL · OFL · OFL", btc="Basteleur no, Atkinson no (₿ falls back), JBM yes",
         css={"--d": BAST, "--d-hero": "400", "--d-h2": "400", "--d-row": "400", "--d-ls": "-0.01em", "--d-ff": "'ss01'",
              "--t": "'Atkinson Hyperlegible Next', 'Schibsted Grotesk', system-ui, sans-serif", "--t-w": "400",
              "--t-lead-w": "400", "--m": JBM}),
    dict(id="a2", name="Basteleur ss01 + Piazzolla + JetBrains Mono",
         role="Keep Basteleur, read in a compact, sharp text serif from Huerta Tipográfica.",
         lic="OFL · OFL · OFL", btc="Basteleur no (804 B Piazzolla subset), Piazzolla yes, JBM yes",
         css={"--d": BAST, "--d-hero": "400", "--d-h2": "400", "--d-row": "400", "--d-ls": "-0.01em", "--d-ff": "'ss01'",
              "--t": "'Piazzolla', Georgia, serif", "--t-w": "400", "--t-lead-w": "400", "--m": JBM}),
    dict(id="a3", name="Basteleur ss01 + Schibsted Grotesk + JetBrains Mono",
         role="Keep Basteleur, read in a crisp newspaper grotesk (Schibsted, Bakken & Bæck).",
         lic="OFL · OFL · OFL", btc="Basteleur no (804 B Piazzolla subset), Schibsted yes, JBM yes",
         css={"--d": BAST, "--d-hero": "400", "--d-h2": "400", "--d-row": "400", "--d-ls": "-0.01em", "--d-ff": "'ss01'",
              "--t": "'Schibsted Grotesk', system-ui, sans-serif", "--t-w": "400", "--t-lead-w": "400", "--m": JBM}),
    dict(id="b", name="Basteleur + JetBrains Mono (today)",
         role="Baseline: the system live on wmmw.sh (default glyphs, Bold h2), mono for everything that is not display.",
         lic="OFL · OFL", btc="Basteleur no (804 B Piazzolla subset), JBM yes",
         css={"--d": BAST, "--d-hero": "400", "--d-h2": "700", "--d-row": "400", "--d-ls": "-0.01em",
              "--t": JBM, "--t-w": "400", "--t-lead-w": "400", "--m": JBM, "--t-size": "18px"}),
    dict(id="c", name="Hubot Sans + Mona Sans + JetBrains Mono",
         role="Precise instrument. GitHub's open source pair: chamfered expanded display, calm grotesk text.",
         lic="OFL · OFL · OFL", btc="all three yes",
         css={"--d": "'Hubot Sans', system-ui, sans-serif", "--d-hero": "300", "--d-h2": "600", "--d-row": "500",
              "--d-wdth": "125%", "--d-wdth-row": "100%", "--d-ls": "-0.015em",
              "--t": "'Mona Sans', system-ui, sans-serif", "--t-w": "400", "--t-lead-w": "400", "--m": JBM}),
    dict(id="d", name="Sprat + Schibsted Grotesk + JetBrains Mono",
         role="Sharp serif from Collletttivo with a width axis. Editorial and exact, hairlines like a fine grating.",
         lic="OFL (self-host from GitHub) · OFL · OFL", btc="Sprat no (804 B Piazzolla subset), Schibsted yes, JBM yes",
         css={"--d": "'Sprat', 'Piazzolla', Georgia, serif", "--d-hero": "40", "--d-h2": "100", "--d-row": "100",
              "--d-wdth": "122%", "--d-wdth-row": "122%", "--d-ls": "0",
              "--t": "'Schibsted Grotesk', system-ui, sans-serif", "--t-w": "400", "--t-lead-w": "400", "--m": JBM}),
    dict(id="e", name="Piazzolla Display + Piazzolla + JetBrains Mono",
         role="Warm and sharp, one family. Italic 30 pt optical size for the name, text cut for reading.",
         lic="OFL · OFL", btc="all yes",
         css={"--d": "'Piazzolla', Georgia, serif", "--d-hero": "300", "--d-h2": "600", "--d-row": "500",
              "--d-hero-style": "italic", "--d-opsz": "30", "--d-ls": "-0.01em",
              "--t": "'Piazzolla', Georgia, serif", "--t-w": "400", "--t-lead-w": "400", "--m": JBM}),
    dict(id="f", name="Hedvig Letters Serif + Hedvig Letters Sans + JetBrains Mono",
         role="Warm contemporary duo from Kanon Foundry. Quiet humanist serif, matching sans for reading.",
         lic="OFL · OFL · OFL", btc="Hedvig serif no, Hedvig sans no (fallbacks supply it), JBM yes",
         css={"--d": "'Hedvig Letters Serif', 'Piazzolla', Georgia, serif", "--d-hero": "400", "--d-h2": "400",
              "--d-row": "400", "--d-ls": "-0.02em",
              "--t": "'Hedvig Letters Sans', 'Schibsted Grotesk', system-ui, sans-serif", "--t-w": "400",
              "--t-lead-w": "400", "--m": JBM}),
    dict(id="g", name="Recursive Casual + Recursive Linear + Recursive Mono",
         role="One family, two natures: the CASL axis runs from linear to casual. Distinct, never separate.",
         lic="OFL", btc="yes",
         css={"--d": "'Recursive', system-ui, sans-serif", "--d-hero": "500", "--d-h2": "700", "--d-row": "600",
              "--d-vs": "'CASL' 1, 'MONO' 0", "--d-ls": "-0.02em",
              "--t": "'Recursive', system-ui, sans-serif", "--t-w": "400", "--t-vs": "'CASL' 0, 'MONO' 0",
              "--t-lead-w": "400",
              "--m": "'Recursive', ui-monospace, monospace", "--m-vs": "'MONO' 1, 'CASL' 0"}),
]

CSS = r"""
@font-face{font-family:"Basteleur";font-weight:400 500;font-display:block;src:url("../../../../public/fonts/basteleur-moonlight.woff2") format("woff2")}
@font-face{font-family:"Basteleur";font-weight:700;font-display:block;src:url("../../../../public/fonts/basteleur-bold.woff2") format("woff2")}
@font-face{font-family:"Basteleur";font-weight:400 500;font-display:block;src:url("fonts/btc-piazzolla-380.woff2") format("woff2");unicode-range:U+20BF;size-adjust:116%}
@font-face{font-family:"Basteleur";font-weight:700;font-display:block;src:url("fonts/btc-piazzolla-380.woff2") format("woff2");unicode-range:U+20BF;size-adjust:116%}
@font-face{font-family:"Sprat";font-weight:10 200;font-stretch:100% 200%;font-display:block;src:url("fonts/btc-piazzolla-380.woff2") format("woff2");unicode-range:U+20BF;size-adjust:109%}
@font-face{font-family:"Sprat";font-weight:10 200;font-stretch:100% 200%;font-display:block;src:url("fonts/Sprat_Variable.ttf") format("truetype")}
:root{--paper:#f2f0e9;--ink:#1e1c17;--ink2:#58544a;--ink3:#6f6a5e;--hair:rgba(30,28,23,.14);
  --night:#12100d;--bone:#e8e2d5;--bone2:#b6ae9e;--hair-n:rgba(232,226,213,.14)}
*{box-sizing:border-box}
html,body{margin:0;background:#dcd8cd}
body{font-family:'JetBrains Mono',monospace;color:var(--ink);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.intro{max-width:1440px;margin:0 auto;padding:40px 56px 8px;font:13px/1.6 'JetBrains Mono',monospace;color:#3d3a32}
.intro h1{font:600 15px/1.4 'JetBrains Mono',monospace;margin:0 0 6px}
section.pair{width:1440px;margin:0 auto 28px;background:var(--paper);padding:40px 56px 48px;position:relative}
.pair *{font-kerning:normal}
.meta{display:flex;justify-content:space-between;gap:24px;font:400 12px/1.5 var(--m);font-variation-settings:var(--m-vs,normal);color:var(--ink3);border-bottom:1px solid var(--hair);padding-bottom:12px;margin-bottom:28px}
.meta strong{color:var(--ink);font-weight:600}
.meta .id{display:inline-block;min-width:28px;color:var(--ink)}
.D{font-feature-settings:var(--d-ff,normal);font-family:var(--d);font-variation-settings:var(--d-vs,normal);letter-spacing:var(--d-ls,0);font-stretch:var(--d-wdth,100%)}
.T{font-family:var(--t);font-variation-settings:var(--t-vs,normal);font-weight:var(--t-w)}
.M{font-family:var(--m);font-variation-settings:var(--m-vs,normal)}
.hero{display:grid;grid-template-columns:1fr 280px;gap:32px;align-items:end;margin-bottom:44px}
.hero h1{margin:0;font-size:128px;line-height:1.1;font-weight:var(--d-hero);font-style:var(--d-hero-style,normal);white-space:nowrap}
.pair[data-opsz] .hero h1{font-optical-sizing:auto}
.hero .line{font-size:26px;line-height:1.35;margin:14px 0 0;font-weight:var(--t-lead-w);max-width:40ch}
.hero .aside{font-size:14px;line-height:1.5;color:var(--ink2);margin:12px 0 0;letter-spacing:.01em}
.eg{background:transparent;border:1px solid var(--hair);padding:8px 10px 10px;position:relative}
.eg .gl{position:absolute;left:18px;line-height:0;white-space:nowrap;font-size:104px;font-weight:var(--d-hero);font-style:var(--d-hero-style,normal)}
.eg .gl span+span{margin-left:18px}
.eg canvas{display:block;width:258px;height:236px}
.eg p{margin:6px 0 0;font:11px/1.45 var(--m);font-variation-settings:var(--m-vs,normal);color:var(--ink3)}
.grid{display:grid;grid-template-columns:minmax(0,560px) minmax(0,1fr);gap:72px;align-items:start}
h2.D{font-size:44px;line-height:1.1;margin:0 0 18px;font-weight:var(--d-h2)}
.rows{list-style:none;margin:0;padding:0;border-top:1px solid var(--hair)}
.rows li{display:grid;grid-template-columns:1fr auto;gap:4px 16px;padding:14px 0 15px;border-bottom:1px solid var(--hair)}
.rows .rt{font-size:26px;line-height:1.15;font-weight:var(--d-row);font-stretch:var(--d-wdth-row,var(--d-wdth,100%))}
.rows .rd{grid-column:1;font-size:16px;line-height:1.45;color:var(--ink2)}
.rows .tag{grid-row:1;grid-column:2;align-self:center;font-size:12.5px;color:var(--ink3);letter-spacing:.01em}
.read .lab{font-size:13px;color:var(--ink3);margin:0 0 10px;letter-spacing:.02em}
.read p{font-size:var(--t-size,18px);line-height:1.65;max-width:62ch;margin:0;hyphens:manual}
.foot{display:grid;grid-template-columns:minmax(0,1fr) 560px;gap:48px;margin-top:44px;align-items:stretch}
.nav{display:flex;gap:26px;align-items:baseline;font-size:14px;letter-spacing:.01em;padding-bottom:14px;border-bottom:1px solid var(--hair)}
.nav .w{font-weight:700}
.nav .sp{flex:1}
.nav .cur{text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:1px}
.wr{list-style:none;margin:10px 0 18px;padding:0}
.wr li{display:flex;gap:20px;align-items:baseline;padding:6px 0}
.wr .dt{font-size:13px;color:var(--ink3);font-variant-numeric:tabular-nums}
.wr .tt{font-size:18px}
.gc{display:grid;gap:6px}
.gc div{display:flex;align-items:baseline;gap:14px}
.gc small{font:11px var(--m);font-variation-settings:var(--m-vs,normal);color:var(--ink3);width:56px;flex:none}
.gc .g-d{font-size:40px;line-height:1.15;font-weight:var(--d-row);font-stretch:var(--d-wdth-row,var(--d-wdth,100%))}
.gc .g-t{font-size:22px}
.gc .g-m{font-size:16px}
.night{background:var(--night);color:var(--bone);padding:26px 28px 28px}
.night .n1{font-size:72px;display:inline-block;line-height:1.1;margin:0;font-weight:var(--d-hero);font-style:var(--d-hero-style,normal);white-space:nowrap}
.night .n2{font-size:20px;line-height:1.4;margin:8px 0 14px;color:var(--bone)}
.night p.n3{font-size:var(--t-size,18px);line-height:1.65;margin:0;color:var(--bone2)}
.night .n4{font-size:12.5px;color:var(--bone2);margin-top:14px;display:flex;justify-content:space-between}
"""

JS = r"""
// é / É metrics: measured on canvas with the loaded face, guides drawn in em units.
function drawEg(sec){
  const cv = sec.querySelector('canvas'); if(!cv) return;
  const cs = getComputedStyle(sec.querySelector('.hero h1'));
  const dpr = 2, W = 258, H = 236; cv.width = W*dpr; cv.height = H*dpr;
  const ctx = cv.getContext('2d'); ctx.scale(dpr,dpr);
  const size = 104, base = 182;
  const style = cs.fontStyle === 'italic' ? 'italic ' : '';
  const stretch = sec.dataset.stretch || 'normal';
  ctx.font = `${style}${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  try{ ctx.fontStretch = stretch; }catch(e){}
  const m = s => ctx.measureText(s);
  const asc = m('é').fontBoundingBoxAscent, desc = m('é').fontBoundingBoxDescent;
  const xh = m('x').actualBoundingBoxAscent, cap = m('H').actualBoundingBoxAscent;
  const e1 = m('é').actualBoundingBoxAscent, E1 = m('É').actualBoundingBoxAscent;
  const ink = getComputedStyle(sec).getPropertyValue('--ink').trim() || '#1e1c17';
  const guide = (y, label, col) => { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y+.5); ctx.lineTo(W, y+.5); ctx.stroke();
    ctx.fillStyle = col; ctx.font = '9px JetBrains Mono, monospace'; ctx.fillText(label, W-ctx.measureText(label).width-2, y-2); };
  guide(base, 'base', 'rgba(30,28,23,.35)');
  guide(base-xh, 'x', 'rgba(30,28,23,.22)');
  guide(base-cap, 'cap', 'rgba(30,28,23,.22)');
  guide(base-asc, 'asc', 'rgba(160,90,20,.7)');
  const lb = (1.1*size + asc - desc)/2; // top of a line box at line-height 1.1
  ctx.setLineDash([3,3]); guide(base-lb, 'lh 1.1', 'rgba(160,40,40,.6)'); ctx.setLineDash([]);
  // glyphs drawn in the DOM so OpenType features (ss01) and variations apply
  const gl = document.createElement('div'); gl.className = 'gl D';
  gl.innerHTML = '<span>é</span><span>É</span>';
  gl.style.top = (8 + base - (asc - desc)/2) + 'px';
  sec.querySelector('.eg').appendChild(gl);
  const lmin = (2*E1 - asc + desc)/size;
  sec.querySelector('.eg p').textContent =
    `é top ${(e1/size).toFixed(2)}em · É top ${(E1/size).toFixed(2)}em · ascent ${(asc/size).toFixed(2)}em · x ${(xh/size).toFixed(2)} · cap ${(cap/size).toFixed(2)} · É clear from line-height ${Math.max(lmin,0).toFixed(2)}`;
}
function fitNight(sec){
  const n = sec.querySelector('.night .n1'); if(!n) return;
  const avail = n.parentElement.clientWidth - 56; let fs = 72;
  while(n.scrollWidth > avail && fs > 30){ fs -= 2; n.style.fontSize = fs + 'px'; }
}
document.fonts.ready.then(() => setTimeout(() => {
  document.querySelectorAll('section.pair').forEach(s => { drawEg(s); fitNight(s); });
  document.documentElement.dataset.ready = '1';
}, 300));
"""


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def block(p):
    style = ";".join(f"{k}:{v}" for k, v in p["css"].items())
    stretch = {"125%": "expanded", "122%": "expanded"}.get(p["css"].get("--d-wdth", ""), "normal")
    opsz = ' data-opsz="1"' if p["css"].get("--d-opsz") else ""
    rows = "".join(
        f'<li><span class="rt D">{esc(t)}</span><span class="rd T">{esc(d)}</span><span class="tag M">{esc(g)}</span></li>'
        for t, d, g in ROWS)
    wr = "".join(f'<li><span class="dt M">{d}</span><span class="tt T">{esc(t)}</span></li>' for d, t in WRITINGS)
    first2 = PARA.split(". ")
    excerpt = ". ".join(first2[:3]) + "."
    return f"""
<section class="pair" id="{p['id']}" data-stretch="{stretch}"{opsz} style="{style}">
  <div class="meta M"><span><span class="id">{p['id']}</span> <strong>{esc(p['name'])}</strong> · {esc(p['role'])}</span><span>licence {esc(p['lic'])} · ₿ {esc(p['btc'])}</span></div>
  <div class="hero">
    <div>
      <h1 class="D">William Moiré</h1>
      <p class="line T">{esc(HERO_LINE)}</p>
      <p class="aside M">{esc(ASIDE)}</p>
    </div>
    <div class="eg"><canvas></canvas><p></p></div>
  </div>
  <div class="grid">
    <div>
      <h2 class="D">En ce moment</h2>
      <ul class="rows">{rows}</ul>
    </div>
    <div class="read">
      <p class="lab M">Manifeste · 18px / 1.65</p>
      <p class="T">{esc(PARA).replace("Suis-le.", '<span style="white-space:nowrap">Suis-le.</span>')}</p>
    </div>
  </div>
  <div class="foot">
    <div>
      <nav class="nav M"><span class="w">[w]</span><span>Projets</span><span>Outils</span><span class="cur">Écrits</span><span>Contact</span><span class="sp"></span><span>FR</span><span>EN</span><span>ES</span></nav>
      <ul class="wr">{wr}</ul>
      <div class="gc">
        <div><small>display</small><span class="g-d D">{esc(GLYPHS)}</span></div>
        <div><small>text</small><span class="g-t T">{esc(GLYPHS)}</span></div>
        <div><small>mono</small><span class="g-m M">{esc(GLYPHS)} · 2026-10-17</span></div>
      </div>
    </div>
    <div class="night">
      <p class="n1 D">William Moiré</p>
      <p class="n2 T">{esc(HERO_LINE)}</p>
      <p class="n3 T">{esc(excerpt)}</p>
      <div class="n4 M"><span>Écrits · 2026-07-04</span><span>FR · EN · ES</span></div>
    </div>
  </div>
</section>"""


def main():
    blocks = "".join(block(p) for p in P)
    html = f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=1440">
<title>William Moiré · type specimen</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{GOOGLE}">
<style>{CSS}</style></head><body>
<div class="intro"><h1>William Moiré · type specimen (exploration only)</h1>
Nine pairings, same content. Basteleur in a, a2 and a3 runs with its ss01 stylistic set (plain E and A); b is the live default.
Missing ₿ glyphs come from an 804-byte Piazzolla subset declared with unicode-range U+20BF. Each block: the name, the hero line, the running list, 120 words of manifesto at 18px / 1.65,
mono for navigation and dates, a glyph check, and a dark panel. The box beside each name draws é and É on the face's own metrics:
asc is the font ascent, the dashed line is the top of a line box at line-height 1.1.</div>
{blocks}
<script>{JS}</script>
</body></html>"""
    (HERE / "specimen.html").write_text(html, encoding="utf-8")
    print("wrote", HERE / "specimen.html", len(html))


if __name__ == "__main__":
    main()
