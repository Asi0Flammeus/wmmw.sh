# External design research brief: wmmw.sh as "William Moiré"

## 0. Key takeaways

1. **The brand idea in one sentence.** A moiré belongs to neither layer. It exists only in the relationship between two layers, which is interdependence and non-duality made visible. The name supports this too: a W flipped vertically is an M, and `wmmw` is a mirror of itself. The moiré is what appears when W and M overlap.
2. **The physics gives the whimsy.** Moiré magnifies movement. A 1 px nudge of one layer sweeps the fringes about 50 px. Calm, small pointer input produces large, slow output, so nothing needs to autoplay. The Toronto Metropolitan University "Interference" installation describes this as "a perceptual amplification of the viewer's movement", and also notes: "if the viewer stops moving, the interference patterns will also stop moving." That is the motion rule to follow.
3. **Safety comes from the numbers.** Use fine, faint lines (pitch 4 to 6 CSS px) so the fringes come out coarse (150 to 400 px). Keep the fringe luminance change below 10% so it sits under the WCAG 2.3.1 general flash threshold by construction. Avoid high contrast stripes with a period of 12 to 24 CSS px: that is 2 to 4 cycles per degree, the band where stripes cause the most discomfort.
4. **Typography.** The body text is currently JetBrains Mono (`/data/crqpt/repos/Asi0Flammeus/wmmw.sh/src/styles/tokens.css:38`). For a site that is meant not to tire the eyes, move body text to a proportional face and keep the mono for labels and code. Basteleur's é works (checked in the font file below).
5. **Contact.** None of the admired "craft" personal sites (Rauno, Paco, Emil, Brittany, Jhey) qualify leads. They are employees. William needs the layer they skip: route the visitor first, then a brief builder that feeds the server inbox, then booking only once the visitor fits.
6. **Read.cv is gone.** Perplexity acquired it on 2025-01-17. Data export closed on 2025-05-16 and `.cv` domains moved to Hello.cv. Do not link to it or depend on it.

---

## 1. Moiré as a design material

### 1.1 Physics you can design with

| Case | Formula | Worked example |
|---|---|---|
| Two equal gratings (pitch p) rotated by α | D = (p/2)/sin(α/2), roughly p/α (Wikipedia) | p = 6 px, α = 1.15° gives D of about 300 px |
| Two parallel gratings, pitch p and p+δp | 2d = p²/δp + p (Wikipedia), which is the beat period p₁p₂/\|p₁−p₂\| | 6 px and 6.25 px gives a 150 px fringe |
| Motion magnification ("moiré speedup") | Fringe shift is about δ/α (rotation case) or δ·p/δp (pitch case) | α = 1.15°: 1 px of layer travel gives about 50 px of fringe travel. Pitch case: about 24x |
| Shape moiré (hidden image) | p_m = −(p_b·p_r)/(p_b−p_r); speed ratio = −p_b/(p_b−p_r) (Wikipedia "Shape moiré") | p_b = 6, p_r = 6.3 gives shapes magnified to 126 px that move about 20x faster |
| Why it is a "beat" | cos a · cos b = ½[cos(a−b) + cos(a+b)]. The difference term is the low-frequency moiré | Sinusoidal line profiles give clean fringes; hard stripes add harmonics and noise |

**Design consequences:**
- **Jitter is magnified too.** Input jitter is amplified about 50x, so always smooth pointer input (lerp about 0.08 per frame) and stop rendering once it settles.
- **Use angle as the control.** The useful range is 0.5° to 3°, which gives fringes from about 690 px down to 115 px. Map pointer x to angle and pointer y to phase.

### 1.2 Lineage: art and branding

- **Bridget Riley, "Current" (1964).** On the cover of MoMA's "The Responsive Eye" (1965) catalogue. She was accused of "eye-bashing". This is the failure mode to avoid.
- **Ludwig Wilding.** Superimposed line layers with a shallow gap between them. He called his own work "irritating art", and viewers "would often rub their eyes". He was also in The Responsive Eye. Take the method and leave the irritation.
- **Carlos Cruz-Diez, Physichromie (from 1959).** A "light trap" in which colour frames produce "chromatic ranges that are not present on the support". This is emergence: the best metaphor for Mycelic Wealth.
- **Jesús Rafael Soto, "Vibration" works.** Rods appear to "vanish and return as the viewer moves". The meaning comes from the viewer's participation.
- **Sonos identity (Bruce Mau Design, 2015).** A sunburst wordmark that "pulses" as you scroll. It won a Cannes Lion and Adweek's "Cleverest Logo". The agency said it was not scientifically tested, and Sonos's brand VP said they didn't expect it to be so noticeable. The lesson: a moiré produced by the user's own scroll is memorable, but test it on real screens.
- **Riverside Studios (Superunion, London).** "one set of vertical straight lines lay over another set that are slightly curved", inspired by TV screens, and "Even printed items can be animated."
- **Pittsburgh Dance Council (Wall-to-Wall Studios).** A custom moiré typeface used to suggest motion.
- **Banknotes.** Fine wavy guilloches that deliberately trigger moiré in scanners as an anti-counterfeiting measure.

### 1.3 Interactive web references

- **21st.dev "Moiré Field".** "Two identical ring rulings, one anchored, one following your pointer", built from "Two CSS gradient layers: no canvas, no WebGL", and "static under reduced motion" (MIT). This is the closest existing analogue of the hero proposed below.
- **CodePen soju22/LYVpVYZ.** A WebGL points moiré that reacts to the mouse.
- **HWS moiré applet.** A fixed layer plus a draggable layer. **Interfere** (an iOS app) is a moiré toy.

### 1.4 Implementation techniques

| Technique | Best for | Cost | Pitfalls |
|---|---|---|---|
| CSS `repeating-linear-gradient` / `repeating-radial-gradient` on a pseudo-element, animated by **transform only** | Cards, toggle, quiet backgrounds | Near zero if the layer is promoted and only `transform` changes. Animating gradient parameters, `background-position` or custom properties inside the gradient forces a repaint every frame | Hard 1px stops alias. Chromium historically quantised gradients (Roselli 2014; there is a Skia analytic-gradient fix since). Oversized rotated layers (inset −25%) cost GPU memory, so never make them full-viewport at 200vmax |
| SVG `<pattern>` or explicit `<line>` sets | Logo mark, small static marks | Cheap when static. Animating `patternTransform` re-renders the SVG on the main thread | Use `shape-rendering="geometricPrecision"`. Below about 48 px the moiré disappears, so ship a solid monogram for the favicon |
| Canvas 2D, about 2·(width/pitch) lines per frame | Hero fallback, the Ghosts lens | Low (about 500 lines per frame at 1440 px and 6 px pitch; an estimate, profile it) | Must scale by `devicePixelRatio` (cap at 2). Render only on demand |
| WebGL fragment shader (one full-screen quad, raw WebGL2, no three.js) | Hero wow | One draw call, constant memory. Context creation is the main cost, so initialise lazily after LCP | Needs `fwidth` anti-aliasing (native in WebGL2; WebGL1 needs `OES_standard_derivatives`). Provide a context-loss and no-WebGL fallback to a static CSS frame |

Hero shader core (sinusoidal profile, fades out before the Nyquist limit so there is no false moiré from aliasing):
```glsl
float grating(vec2 p, float a, float pitch){
  float v = dot(p, vec2(cos(a), sin(a))) / pitch;
  float g = 0.5 + 0.5*cos(6.2831853*v);
  return mix(g, 0.5, smoothstep(0.25, 0.5, fwidth(v))); // flatten near 2 px per cycle
}
// m = grating(p,0.,pitch) * grating(p - ptr*k, uAngle, pitch); out = vec4(ink, m*uAlpha);
// radial variant: replace dot(...) with length(p - center)
```
Pitch should be snapped to device pixels: `pitch = round(6*dpr)/dpr`.

### 1.5 "Calm moiré" rules

- **Spatial frequency.** One CSS reference pixel is about 0.0213°, so 1° is about 47 CSS px. Stripes near 3 cycles per degree (period about 16 px) cause the most illusions, discomfort, migraine and photosensitive risk (Wilkins; PMC6867050). Stripes around 0.3 cycles per degree "bother almost no one". So: lines at 4 to 6 px (8 to 12 cycles per degree, faint), fringes at 150 to 400 px (0.1 to 0.3 cycles per degree).
- **Luminance.** WCAG 2.3.1 defines a general flash as an opposing change of at least 10% of maximum relative luminance, over 25% of a 10° field (341×256 px). Keep line alpha at about 0.05 to 0.08 in light mode and about 0.04 to 0.06 in dark mode. The fringe delta then stays under 0.10, so fringe speed cannot produce a "flash" by definition.
- **Fringe count.** The legacy ITC/Ofcom note flags clearly visible stripes with "more than five light-dark pairs". Patterns that move or reverse are worse than static ones, and a W3C draft limited changing stripes to 25% of a 355×268 area. So mask the field radially to show at most 4 to 5 fringe pairs, and keep fringe period at or above 250 px on desktop.
- **Motion.**
  - Pointer-driven only. No autoplay, no scroll-linked parallax (WCAG 2.3.3 calls parallax non-essential, with a vestibular rationale).
  - Never use device orientation.
  - Settle within about 600 ms and then stop rendering entirely (IntersectionObserver plus `visibilitychange`).
- **Media queries.**
  - `prefers-reduced-motion: reduce` gives one composed static frame. Freeze it; do not remove it (technique C39).
  - `forced-colors: active` hides the pattern.
  - `print` hides the pattern.
  - `pointer: coarse` gives the static frame, optionally with a drag only inside the hero.
- **Dark mode.** Equal alpha reads stronger on dark backgrounds, so lower it.

### 1.6 Four moiré moments, plus one bonus. Budget: two "wow" moments at most

**M1. Logo mark "W over M" (quiet, identity, carries the meaning).**
- Two SVG line sets: nine parallel zigzag strokes forming W at pitch p, and the same strokes mirrored vertically (M) at pitch 1.08p.
- Where they overlap, one broad fringe emerges, which reads as "the pattern between William and Moiré".
- Hover or focus: rotate the M set by about 3° over 600 ms and the fringe sweeps across.
- At 32 px and below, use a solid monogram.
- Risk: low. The design risk is legibility; prototype at 48, 96 and 256 px.

**M2. Hero interference field (wow #1).**
- Two radial ring gratings in WebGL. One is anchored on the **accent of the é in "Moiré"** (the accent becomes the wave source). The other follows the smoothed pointer.
- The result looks like two-source wave interference, a natural picture of relational wealth.
- Fallback: the same composition rendered statically with CSS radial gradients and server-rendered, so no layout shift and LCP stays text.
- Risk: medium (performance on low-end phones, vestibular). Mitigations: DPR cap of 2, render on demand, reduced-motion freeze, fringe-count mask.

**M3. Theme toggle that "turns" a grating (quiet).**
- A 32 px button holding two clipped line sets.
  - Light mode: aligned at 0°, an even hatch.
  - Dark mode: one set rotated to 8°, so dark fringe bands appear (a moon by interference).
- Switch the page itself with a 200 ms View Transitions crossfade.
- I advise against a full-page striped "venetian blind" wipe: that is exactly "changing stripes over more than 25% of the field" together with a light-to-dark transition.
- Risk: very low.

**M4. Hover on "running" project cards (quiet).**
```css
.card{position:relative;isolation:isolate;overflow:hidden}
.card::before,.card::after{content:"";position:absolute;inset:-25%;z-index:-1;pointer-events:none;
  background:repeating-linear-gradient(90deg,var(--ink) 0 1px,transparent 1px 5px);opacity:.07}
.card::after{transform:rotate(4deg);transition:transform .7s cubic-bezier(.2,.8,.2,1)}
.card:is(:hover,:focus-visible)::after{transform:rotate(1.2deg);will-change:transform}
@media (prefers-reduced-motion:reduce){.card::after{transition:none}}
@media (forced-colors:active){.card::before,.card::after{display:none}}
```
- At 4°, D is about 72 px. At 1.2°, D is about 239 px, so the card visibly "breathes out" on hover.
- Risk: low. Watch for many promoted layers; apply `will-change` only on hover.

**Bonus M5. Ghosts teaser using shape moiré (wow #2, an alternative to M2 if only one wow is allowed).**
- The base layer holds rows of a tiny ghost glyph at p_b = 6 px. A draggable "lens" holds slits at p_r = 6.3 px.
- Under the lens, ghosts appear about 126 px tall and drift about 20x faster than the lens. The direction depends on the sign; test both.
- The message only exists in the interference, which fits "to be disclosed soon". Copy example: "Ghosts. Bientôt."
- Risk: medium. It needs higher contrast to be legible, so keep it inside one card, smooth and clamp lens velocity, and give a static revealed frame under reduced motion.

---

## 2. Eight personal sites worth learning from

| Site | Why it feels expert | Navigation | "Work with me" | One idea to steal |
|---|---|---|---|---|
| **rauno.me** | One line of identity ("Estonian interaction designer working with Vercel and Devouring Details") plus a 7-line manifesto from "Make it fast." to "Make it." | Large link blocks: Craft, History of Software Design, Projects, Field Notes. Archived versions "2023", "2022" | None. Email only, with click-to-copy showing "Copied" | Copy-email micro-feedback, plus **archived versions** to make the asi0 to William Moiré evolution followable |
| **paco.me** | "Crafting interfaces". One-line entries | Single scroll: Building, Projects, Writing, **Now**, Connect | Soft: "Reach me at" | A **Now** block, which maps directly onto the 4 running items |
| **emilkowal.ski** | "Design Engineer". Named open-source proof (Sonner, Vaul) | Single column: Projects, Writing, Newsletter, More | A course banner ("aiforui.dev is in early access") plus a newsletter | One slim **top banner** for the single live thing (the Ghosts waitlist) |
| **joshwcomeau.com** | Playful copy and whimsical controls | Nav: categories, courses, goodies, About | Courses plus a newsletter | **"Disable sounds"** toggle and a witty honeypot: "Are you a human? If so, please ignore this checkbox" |
| **brittanychiang.com** | Calm split layout | Sticky left identity column (`lg:sticky lg:w-[48%]`), right column scrolls | None (résumé link only) | Sticky identity column. Her cursor spotlight `radial-gradient(600px circle at x y, rgba(29,78,216,.15), transparent 80%)` can become a **moiré lens** instead |
| **jhey.dev** | "Designer · Engineer · Tastemaker", "Crafting interfaces, prototypes, and experiments for the web." | Index, Email, AMA, Follow | None. Email copy shows "Copied!" | A **live status strip** (weather and local time, now playing). For William, use real signals such as the latest Plan B Academy commit or the last alysis site shipped |
| **dennissnellenberg.com** (freelancer) | "Let's start a project together", local time "09:41 PM CET", company registration and VAT shown | Menu overlay | **Numbered intake**: 01 name, 02 email, 03 organization, 04 "What services are you looking for?", 05 message | Numbered conversational fields, plus a **legal identity line** as a trust signal |
| **anthonyhobday.com** (independent) | "I design software interfaces." Breadth shown as **counts**: Paid service (1), Blog posts (20), Side projects (13)… | Counted index | One priced service, "Design feedback", shown with "68 clients" | **Counted index** to show William's breadth without walls of text, plus one priced entry offer |

Also noted:
- maximeheckel.com: a "Say the magic word" bot check and an NYC coffee invitation.
- leerob.com: "I'm an engineer and writer." with one email CTA for advising and angel investing.
- lynnandtonic.com: a visible version label, "v. XIX".
- csswizardry.com: "Book a Free Call" and "Start a Conversation". No qualification.

What they share: a single column of about 680 px or less, h2 section labels, one-line entries, no hero image, and identity in one sentence.

---

## 3. Qualified contact that is not a plain form

1. **Cal.com Routing Forms** (cal.com/routing; cal.com/help/routing/headless-routing).
   - Screening questions send the visitor to a booking page, an external redirect, or a "Custom Page with a message".
   - The "redirect when accessed without routing form" setting means the booking link cannot be used without qualifying first.
   - Pattern to copy: **booking appears only after the answers fit.**
2. **Dennis Snellenberg contact** (dennissnellenberg.com/contact).
   - Five numbered questions that require an organization and a service choice, framed by local time and legal entity details.
   - It qualifies by asking "who are you, and for whom" before "what".
3. **Anthony Hobday, Design feedback** (anthonyhobday.com/sideprojects/feedback/).
   - A visible price ladder: "Your first video costs £30, your second £60, and each video after that £100". Or "A month of unlimited feedback by email for £200". "Payments never repeat."
   - Process: email, Stripe link, send the work, reply within one working day.
   - It qualifies through a small paid entry point and acts as a **pricing anchor**.
4. **Designjoy** (designjoy.co).
   - One plan at $4,995/month, a "limited roster", an explicit exclusion list (no 3D, video, animated graphics, InDesign), and a "15-min intro call".
   - It qualifies through price and through "what I don't do".

Supporting patterns:
- **Mad Libs or "Huffduffer" narrative forms** (adactio.com/tags/madlibs). LukeW reports a 25 to 40% conversion lift; I could not verify the underlying data.
- **Paid diagnostic or roadmapping** (Jonathan Stark: "a smaller paid diagnostic").

### Synthesised flow for wmmw.sh (all copy free of dashes)

**Step 1, choose a path.** "Qu'est-ce qui vous amène ?" / "What brings you here?"
- "Un site pour mon activité" leads to alysis.cat (external redirect, keeps wmmw as the hub).
- "Un outil fait pour moi ou mon équipe" leads to the brief builder.
- "Bitcoin et Plan B Academy" leads to planb.academy.
- "Ghosts" leads to the waitlist, stored in the inbox.
- "Autre chose" leads to free text of 500 characters at most.

**Step 2, brief builder (custom tools).**
- FR: "Je m'appelle [nom]. Aujourd'hui, [qui] perd du temps à [tâche] avec [outil actuel]. J'aimerais [résultat] d'ici [échéance]. Budget envisagé : [tranche]."
- EN: "I'm [name]. Today [who] loses time on [task] using [current tool]. I'd like [outcome] by [deadline]. Budget in mind: [band]."
- Budget bands are placeholders A, B and C plus "pas encore sûr". The owner sets the numbers. An optional anchor line: "Les projets commencent généralement à [X]".

**Step 3, store and route.** POST structured JSON to the server inbox, for example:
`{id, received_at, locale, path, who, task, current_tool, outcome, deadline_band, budget_band, contact:{name, handle_or_email}, honeypot, fit}`
- If `fit` is true, show the booking link inline (the Cal.com pattern, self-built).
- Otherwise show a custom message pointing to a resource.

---

## 4. Typography: six pairings

I measured accent geometry from the actual font files (Google Fonts subsets and the repo's woff2) using fontTools. Every family below has é, É, ñ, Ñ, ¿ and ¡. Basteleur also has è, à, ç, œ, Œ, « », a typographic apostrophe, and combining U+0301 with a GPOS `mark` feature.

| # | Display | Text | Mono | License | é check | Rationale and risk |
|---|---|---|---|---|---|---|
| 1 | **Basteleur Moonlight** (keep) | Atkinson Hyperlegible Next (Braille Institute, Google Fonts 2025) | **JetBrains Mono** (labels and code only) | OFL (Basteleur name table: "SIL OFL", v1.300) | Lowercase é top 820/1000, inside ascent 950. **Uppercase É in Bold reaches 1011, above hhea ascent 950** | Continuity and warmth. Move body text off mono. Risk: all-caps "MOIRÉ" in Bold clips with tight `line-height`, `overflow:hidden` or `background-clip:text`. Use line-height of 1.1 or more, or avoid caps |
| 2 | **Fraunces** (opsz 144, SOFT about 50, WONK 1) | Geist | Geist Mono | OFL (Undercase Type; Geist by Vercel) | Accent rise 0.21 em; É reaches 0.91 of ascent (safe) | A soft, warm serif against a sharp neutral sans. The SOFT axis lets warmth be tuned by axis value without new fonts |
| 3 | **Instrument Serif** (Regular and Italic only) | Instrument Sans | **JetBrains Mono** | OFL | 0.22 em; É at 0.96 | One coherent studio pairing. The italic "Moiré" can be a signature. Display use only |
| 4 | **Bricolage Grotesque** (opsz 96, wdth 75 to 100, wght 200 to 800; Mathieu Triay) | Bricolage at opsz 12, or Atkinson Next | Commit Mono (OFL, @fontsource/commit-mono) | OFL | 0.22 em; É at 0.96 | Sharp grotesk with quirky ink traps. "Professional but personal" |
| 5 | **Recursive** CASL 1 (one family, two natures) | Recursive CASL 0 | Recursive MONO 1 | OFL (Arrow Type) | 0.28 em, the most generous accent; É at 0.99 | A literal sharp-to-warm axis, a non-duality metaphor. Animating CASL on hover gives whimsy without moving anything. Risk: can feel techy-cute; subset it |
| 6 | **Funnel Display** (NORD ID, 2024) | Funnel Sans | JetBrains Mono | OFL | 0.21 em; É at 0.89 (most headroom) | Clean, contemporary, low-risk |

**Accent option:**
- **Fungal** (Velvetyne, Raphaël Bastide and Jérémy Landes, 2022) has **Grow** and **Thickness** axes. Its hyphae grow out of each glyph.
- It is a DejaVu Sans fork under the Bitstream DejaVu license. Use it once, for example growing "Mycelic Wealth" from Grow 0 to 400 on hover. It is not a primary face.

**Excluded:**
- Pangram Pangram free fonts (PP Editorial New, Neue Montreal): personal use only, and a commercial site needs a web license.
- Fontshare (ITF FFL): commercial use is allowed, but self-hosting and redistribution terms are ambiguous.
- Redaction: OFL and added to Google Fonts 2026-10-09, but its origin is a criminal-justice redaction art project, which is the wrong connotation.
- Gloock (É at 1.01 of ascent) and Newsreader (É at 1.19): caps accents exceed the ascender.

**Recommendation:** #3 if keeping JetBrains Mono for continuity matters, #2 if warmth is the priority. Self-host the latin and latin-ext subsets and preload only the display woff2.

---

## Sources
- [Wikipedia: Moiré pattern](https://en.wikipedia.org/wiki/Moir%C3%A9_pattern), [Shape moiré](https://en.wikipedia.org/wiki/Shape_moir%C3%A9)
- [TMU Interference](https://torontomu.ca/design-technology-lab/projects/interference), [Kinetica: Ludwig Wilding](https://kinetica-museum.org/artist-profiles/ludwig-wilding/), [MoMA: Riley, Current](https://www.moma.org/collection/works/79998), [MoMA Post: Cruz-Diez](https://post.moma.org/?p=3241), [Arte al Día: Soto and Cruz-Diez](https://artealdia.com/Galleries/TRIBUTE-TO-JESUS-RAFAEL-SOTO-AND-CARLOS-CRUZ-DIEZ-AT-ESPACE-MEYER-ZAFRA)
- [Creative Bloq: Sonos](https://www.creativebloq.com/news/sonos-logo-scrolling), [Essential Install: Sonos](https://essentialinstall.com/news/home-cinema/sonos_logo_makes_waves/), [ADC: Riverside Studios](https://www.oneclub.org/awards/adcawards/-award/35406/riverside-studios), [Wall-to-Wall: PDC](https://walltowall.com/news_posts/wall-to-wall-studios-designs-integrated-branding-for-pittsburgh-dance-council-2016-2017-season)
- [21st.dev Moiré Field](https://21st.dev/@n1m4mz/components/moire-field.md), [CodePen soju22](https://codepen.io/soju22/pen/LYVpVYZ), [HWS applet](https://math.hws.edu/xJava/other/Moire1.html), [madebyevan grid shader](https://www.madebyevan.com/shaders/grid/), [web.dev animations guide](https://web.dev/articles/animations-guide), [Roselli: gradients in Chrome](https://adrianroselli.com/2014/10/linear-gradient-problems-in-chrome.html), [CSS-Tricks: stripes](https://css-tricks.com/?p=333052)
- [W3C Understanding 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html), [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [ITC/Ofcom legacy flash note](https://www.ofcom.org.uk/__data/assets/pdf_file/0021/16248/gn_flash.pdf), [hellocatfood summary](https://www.hellocatfood.com/potentially-harmful/), [W3C list: stripe area](https://lists.w3.org/Archives/Public/w3c-wai-gl/2004JanMar/0346.html), [PMC6867050 (3 cpd)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6867050), [Aston: gamma oscillations](https://research.aston.ac.uk/en/publications/induced-visual-illusions-and-gamma-oscillations-in-human-primary-/)
- [rauno.me](https://rauno.me), [paco.me](https://paco.me), [emilkowal.ski](https://emilkowal.ski), [joshwcomeau.com](https://www.joshwcomeau.com), [use-sound post](https://joshwcomeau.com/react/announcing-use-sound-react-hook/), [brittanychiang.com](https://brittanychiang.com), [jhey.dev](https://jhey.dev), [dennissnellenberg.com/contact](https://dennissnellenberg.com/contact), [anthonyhobday.com](https://anthonyhobday.com), [maximeheckel.com](https://maximeheckel.com), [leerob.com](https://leerob.com), [jakub.kr](https://jakub.kr), [tonsky.me](https://tonsky.me), [csswizardry services](https://csswizardry.com/services/), [lynnandtonic.com](https://lynnandtonic.com), [TechCrunch: Read.cv](https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/)
- [Cal.com routing](https://cal.com/routing), [Cal.com headless routing](https://cal.com/help/routing/headless-routing.md), [Cal.com redirect setting](https://cal.com/help/event-types/redirect-on-no-routing-form), [Calendly routing forms](https://calendly.com/blog/routing-forms), [Hobday feedback](https://anthonyhobday.com/sideprojects/feedback/), [Designjoy](https://www.designjoy.co), [adactio madlibs](https://adactio.com/tags/madlibs), [Jonathan Stark pricing sprint](https://jonathanstark.com/private-pricing-sprint)
- [Fraunces on Google Fonts](https://fonts.google.com/specimen/Fraunces/about), [Recursive](https://recursive.design/), [Fungal on Velvetyne](https://velvetyne.fr/fonts/fungal/), [Slanted: Fungal](https://www.slanted.de/?p=690138), [Pangram Pangram about](https://pangrampangram.com/pages/about), [Fontsource Commit Mono](https://www.jsdelivr.com/package/npm/@fontsource/commit-mono), [AIGA: Redaction](https://eyeondesign.aiga.org/a-typeface-inspired-by-legal-briefs-that-challenges-the-justice-system/), Google Fonts METADATA.pb files at github.com/google/fonts/tree/main/ofl/ (one per family above)
- Local evidence:
  - `/data/crqpt/repos/Asi0Flammeus/wmmw.sh/public/fonts/basteleur-moonlight.woff2` and `basteleur-bold.woff2`: glyph coverage and metrics.
  - `/data/crqpt/repos/Asi0Flammeus/wmmw.sh/src/styles/tokens.css:37-39`: current `--disp` (Basteleur) and `--body`/`--mono` (both JetBrains Mono).
  - No moiré code exists yet in `src/`.
