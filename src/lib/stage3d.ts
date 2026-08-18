/**
 * The hero stage: a procedural mycelial root, rendered in three.js.
 *
 * Ported from the Sylva moss root (three r149 UMD) to r185 ES modules, and
 * re-dressed in wmmw.sh's palette: humus and gold instead of moss green.
 * The scene is deterministic. One seeded PRNG drives every curve, every
 * blade and every mote, so each reload grows the same organism.
 *
 * Coordinate contract: the camera FOV is re-solved on resize so one world
 * unit equals one CSS pixel at z = 0. The root is pinned to the same pixel
 * grid the hero copy is laid out on.
 *
 * Rendering contract: no own rAF. The shared pointer bus calls `frame` once
 * per page frame; an IntersectionObserver and `document.hidden` gate the
 * actual render so an offscreen or background hero costs nothing.
 */

import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  WireframeGeometry,
} from "three";
import type { Material, Texture } from "three";
import { initPointer, subscribe, type PointerState } from "@lib/pointer";

export interface StageHandle {
  destroy(): void;
}

/** Re-entrant mounts on the same canvas return the live handle: a no-op. */
const mountedHandles = new WeakMap<HTMLCanvasElement, StageHandle>();

/* ==================================================================== *
 * constants
 * ==================================================================== */

/** Camera distance. FOV is solved from it so 1 world unit = 1 CSS px at z=0. */
const DIST = 1400;
/** Each root is modelled in a 10-unit-wide local box, like the reference. */
const BOXW = 10;
const TAU = Math.PI * 2;
const UP = new Vector3(0, 1, 0);

const NEAR_ASPECT = 1.5;
const FAR_ASPECT = 2.3;
/** Far ridge depth. k = (DIST - z) / DIST undoes the perspective shrink. */
const FAR_Z = -420;

/** Survey pulse: duration and the lag that holds the solid behind the rim. */
const SCAN_DUR = 3.4;

/** Spore trail pool. Values are the landed defaults from the trail skill. */
const SPRAY_N = 620;
const SPRAY_LIFE = 1.6;

/** Out-of-frame sentinel: the fur un-parts when the pointer leaves. */
const AWAY = 9999;

/* ==================================================================== *
 * palette - wmmw.sh tokens, sRGB hex
 *
 * `new Color(hex)` converts sRGB hex into the linear working space
 * (ColorManagement is on by default since r152), so every derived Color
 * below already holds the linear values the shaders want.
 * ==================================================================== */

const T_SURF = 0x1a1712;
const T_BONE = 0xe8e2d5;
const T_INK2 = 0xb6ae9e;
const T_ACCENT = 0xd9a24a;
const T_ACCENT2 = 0xe4b262;

function scaled(hex: number, k: number): Color {
  return new Color(hex).multiplyScalar(k);
}
/** Format a linear Color as a GLSL vec3 literal. */
function glsl3(c: Color): string {
  return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
}

/* Lights. Key warm gold-white, fill a cool bounce from below, ambient low
   and bone-tinted. The haze target is DARK and warm, unlike Sylva's lit
   green air: on a near-black page a pale haze would put a grey floor under
   every shadow. The luminance gain in aerial() keeps the darks dark. */
const KEY_DIR = new Vector3(-0.3, 0.92, 0.28).normalize();
const FILL_DIR = new Vector3(0.12, -0.86, 0.5).normalize();
const KEY_COL = new Color(1.18, 1.0, 0.74);
const FILL_COL = new Color(0.34, 0.42, 0.6);
const AMB_COL = scaled(T_BONE, 0.07);
const HAZE_COL = scaled(T_ACCENT, 0.07).add(scaled(T_SURF, 0.5));

/* The fur ramp: dark wet humus at the blade root, lit gold at the tip.
   Scale factors mirror the reference ramp's relative luminances (its deep
   to tipHi span was roughly 1:20), re-hued through the accent tokens. */
const FUR_DEEP = glsl3(scaled(T_SURF, 0.8));
const FUR_MID = glsl3(scaled(T_ACCENT, 0.22));
const FUR_TIP = glsl3(scaled(T_ACCENT, 0.55));
const FUR_TIPHI = glsl3(scaled(T_ACCENT2, 0.85));

/* The rind (the reference's bark slot): raked pale fibre over damp umber,
   darkest in the splits, with a dusting of pale gold where it faces up.
   The reference could hold a near-black bark against its olive page; on
   #12100d the same values vanish. The whole ramp sits well above the page
   background so the tube keeps a silhouette even with the fur stripped. */
const RIND_LO = glsl3(scaled(T_SURF, 2.4));
const RIND_FIBRE = glsl3(scaled(T_INK2, 0.4));
const RIND_UMBER = glsl3(scaled(T_ACCENT, 0.5));
const GOLD_DUST = glsl3(scaled(T_ACCENT2, 0.55));
const HUMUS_LO = glsl3(scaled(T_SURF, 1.7));
const HUMUS_HI = glsl3(scaled(T_ACCENT, 0.26));

/* ==================================================================== *
 * GLSL chunks - lifted from the reference, masks removed (this scene
 * composes with placement and haze, not with box-space masks)
 * ==================================================================== */

const LIGHT_GLSL = /* glsl */ `
uniform vec3 uKeyDir, uKeyCol, uFillDir, uFillCol, uAmbCol, uHazeCol;
uniform float uHaze, uFog, uHazeLift;
vec3 litSurface(vec3 N, vec3 albedo, float ao){
  float k = max(dot(N, uKeyDir), 0.0);
  float f = max(dot(N, uFillDir), 0.0);
  float sky = 0.5 + 0.5 * N.y;
  return albedo * (uKeyCol * (0.09 + 1.05 * k) + uFillCol * (0.04 + 0.34 * f) + uAmbCol * (0.35 + 0.65 * sky)) * ao;
}
/* Aerial haze, weighted by the surface's own luminance: a flat mix puts a
   floor under every shadow. Distant geometry gets uHazeLift near 1 and does
   lift its darks, which is what air does at that range. */
vec3 aerial(vec3 c, float h){
  float amt = clamp(uFog + uHaze * smoothstep(0.05, 0.95, h), 0.0, 1.0);
  float gain = smoothstep(0.003, 0.075, dot(c, vec3(0.30, 0.59, 0.11)));
  return mix(c, uHazeCol, amt * mix(uHazeLift, 1.0, gain));
}
/* Survey pulse. The solid only exists behind the wavefront; the lag holds
   it a beat behind the wireframe so the mesh reads as a scan, not a wipe.
   Two long sines wobble the front so it never reads as a clean circle. */
uniform vec3 uScanO;
uniform float uScanR, uScanOn;
bool unscanned(vec3 w, float lag){
  if (uScanOn < 0.5) return false;
  float wob = sin(w.y * 0.011 + w.x * 0.007) * 36.0 + sin(w.z * 0.021 + w.y * 0.013) * 17.0;
  return distance(w, uScanO) > uScanR - lag + wob;
}
`;

const NOISE_GLSL = /* glsl */ `
vec2 hash22(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
/* gradient noise, not value noise: value noise puts its extrema on the
   lattice, which on a tube shows up as blobs in rows */
float gnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash22(i + vec2(0,0)), f - vec2(0,0)),
                 dot(hash22(i + vec2(1,0)), f - vec2(1,0)), u.x),
             mix(dot(hash22(i + vec2(0,1)), f - vec2(0,1)),
                 dot(hash22(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
}
const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);
float gfbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * gnoise(p); p = ROT * p * 2.03; a *= 0.5; } return s; }
float ridged(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++){ s += a * (1.0 - abs(gnoise(p) * 2.0)); p = ROT * p * 2.11; a *= 0.5; } return s; }
`;

const WIND_GLSL = /* glsl */ `
uniform float uTime;
uniform float uWind;
vec3 windOffset(vec3 p){
  float ph = p.x * 0.42 + p.y * 0.30 + p.z * 0.70;
  float a = 0.030 * uWind;
  return vec3((sin(uTime * 0.58 + ph) + 0.45 * sin(uTime * 1.37 + ph * 2.3)) * a,
              sin(uTime * 0.79 + ph * 1.7) * a * 0.42,
              sin(uTime * 0.51 + ph * 0.9) * a * 0.55);
}
`;

/* ---- rind shell: humus over woody fibre ---- */

const RIND_VERT =
  WIND_GLSL +
  /* glsl */ `
attribute vec3 inf;
varying vec3 vN; varying vec3 vW; varying vec3 vInf; varying float vH;
uniform float uBoxH;
void main(){
  vInf = inf;
  vN = normalize(normal);
  vec3 p = position + windOffset(position) * (0.35 + 0.65 * inf.z);
  vH = clamp(p.y / uBoxH + 0.5, 0.0, 1.0);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const RIND_FRAG =
  NOISE_GLSL +
  LIGHT_GLSL +
  /* glsl */ `
uniform float uAlpha; uniform float uBoxH;
varying vec3 vN; varying vec3 vW; varying vec3 vInf; varying float vH;

/* Grain is strongly anisotropic: features run ten times longer along the
   limb than around it, so squash the domain in v first. */
vec2 rindDomain(vec2 uv){ return vec2(uv.x * 7.0, uv.y * 0.62); }
float rindHeight(vec2 uv){
  vec2 q = rindDomain(uv);
  vec2 w = vec2(gfbm(q * 0.5), gfbm(q * 0.5 + 9.1));
  vec2 p = q + w * 0.60;
  float ridge = ridged(p);
  float plate = smoothstep(-0.25, 0.45, gfbm(q * 0.34));
  float crack = smoothstep(0.30, 0.86, ridged(p * 1.9 + 4.0));
  float fine  = gfbm(p * 5.5) * 0.5 + 0.5;
  return (ridge - 0.5) * 1.85 * mix(0.35, 1.0, plate) - crack * 0.42 + fine * 0.20;
}
/* bump-map an unparametrised surface from screen-space derivatives */
vec3 bumped(vec3 N, vec3 p, float h, float k){
  vec3 dpx = dFdx(p), dpy = dFdy(p);
  float dhx = dFdx(h) * k, dhy = dFdy(h) * k;
  vec3 r1 = cross(dpy, N), r2 = cross(N, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * N - grad);
}

void main(){
  if (unscanned(vW, 520.0)) discard;
  vec2 uv = vInf.xy;
  float cap = vInf.z;
  float m = smoothstep(0.05, 0.42, cap);
  vec3 N = normalize(vN);

  float h = rindHeight(uv);
  N = bumped(N, vW, h, mix(0.26, 0.06, m));

  vec2 q = rindDomain(uv);
  float grain  = gfbm(q * 1.25) * 0.5 + 0.5;
  float mottle = gfbm(q * 0.28 + 21.0) * 0.5 + 0.5;
  float crack  = smoothstep(0.30, 0.86, ridged(q * 1.9 + 4.0));

  /* woody fibre where the light rakes it, damp umber in the drift,
     near-black in the splits */
  vec3 fibre = mix(${RIND_LO}, ${RIND_FIBRE}, grain);
  vec3 umber = mix(${RIND_LO}, ${RIND_UMBER}, grain);
  vec3 rind  = mix(fibre, umber, mottle * 0.78);
  rind *= 1.0 - 0.70 * crack;

  /* the cushion under the fur: wet humus warming toward gold where it packs */
  float mo = gfbm(vec2(vW.x * 2.6, vW.z * 2.6 + vW.y * 1.9)) * 0.5 + 0.5;
  vec3 humus = mix(${HUMUS_LO}, ${HUMUS_HI}, mo);
  humus *= 0.80 + 0.42 * cap;

  vec3 col = mix(rind, humus, m);
  /* a crust of pale gold spore dust where the rind shows and faces up */
  float dust = smoothstep(0.56, 0.84, gfbm(q * 0.62 + 31.0) * 0.5 + 0.5);
  dust *= (1.0 - m) * smoothstep(-0.10, 0.70, N.y) * smoothstep(0.15, 0.50, h);
  col = mix(col, ${GOLD_DUST}, dust * 0.55);

  /* Contact shadow along the fur line. The cushion overhangs the rind it
     sits on; without this the two materials meet on a paint-mask edge. */
  float contact = smoothstep(0.0, 0.16, cap) * (1.0 - smoothstep(0.16, 0.60, cap));
  col *= 1.0 - 0.48 * contact;
  float ao = mix(0.30, 1.02, smoothstep(-0.40, 0.62, h)) * mix(1.0, 0.86, m);
  vec3 lit = litSurface(N, col, ao);

  vec3 V = normalize(cameraPosition - vW);
  /* Wet-bark rim: the key light catches the lit edge and holds the
     silhouette against the dark page. */
  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  lit += (col * 1.6 + vec3(0.010, 0.007, 0.004)) * uKeyCol * rim * ao;
  float spec = pow(max(dot(reflect(-uKeyDir, N), V), 0.0), 24.0);
  lit += uKeyCol * spec * 0.10 * (1.0 - 0.7 * m) * ao;

  gl_FragColor = vec4(aerial(lit, vH), uAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ---- hyphae fur ---- */

const HYPHAE_VERT =
  WIND_GLSL +
  /* glsl */ `
attribute vec3 offset;
attribute vec3 nrm;
attribute vec4 rnd;
attribute float aux;
uniform vec3 uMouse;
uniform float uMouseR;
uniform float uBoxH;
varying float vT; varying float vShade; varying float vDark;
varying float vTone; varying float vH; varying vec3 vN; varying vec3 vW;

void main(){
  float t = uv.y; vT = t;
  float len = rnd.y;

  /* a local basis around the surface normal, rolled by the blade's yaw */
  vec3 ref = abs(nrm.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 T0 = normalize(cross(nrm, ref));
  vec3 B0 = cross(nrm, T0);
  float ca = cos(rnd.x), sa = sin(rnd.x);
  vec3 widthDir = T0 * ca + B0 * sa;
  vec3 leanDir  = T0 * -sa + B0 * ca;

  float bend = t * t;
  float gust = (sin(uTime * 1.75 + offset.x * 1.6 + rnd.x) * 0.12
             +  sin(uTime * 0.85 + offset.x * 0.55) * 0.07) * uWind;

  vec3 world = offset + windOffset(offset)
             + nrm * (t * len)
             + widthDir * (position.x * len * 0.62)
             + leanDir * (rnd.z * 0.42 * len) * bend
             + (T0 * gust + B0 * gust * 0.6) * bend * len * 1.6;

  /* the cursor parts the fur: push tangentially, press down along nrm */
  vec3 toB = offset - uMouse;
  float infl = smoothstep(uMouseR, 0.0, length(toB * vec3(1.0, 1.0, 0.30)));
  infl *= infl;
  vec3 push = toB - nrm * dot(toB, nrm);
  float pl = length(push);
  push = pl > 0.0001 ? push / pl : T0;
  /* Scaled by the blade's own length, not by a constant: a fixed push is
     several blade heights and combs the pile into streaks. */
  world += push * infl * bend * len * 2.2;
  world -= nrm * infl * bend * len * 1.0;
  vDark = infl;

  vShade = (0.66 + 0.34 * rnd.w) * (0.82 + 0.18 * sin(rnd.x * 2.0));
  vShade *= 0.46 + 0.54 * clamp(nrm.y * 0.5 + 0.62, 0.0, 1.0);
  vTone = smoothstep(0.16, 0.86, aux);
  vN = normalize(mix(nrm, normalize(leanDir * rnd.z + nrm), 0.35));
  vH = clamp(world.y / uBoxH + 0.5, 0.0, 1.0);
  vec4 wp = modelMatrix * vec4(world, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const HYPHAE_FRAG =
  LIGHT_GLSL +
  /* glsl */ `
uniform float uAlpha;
varying float vT; varying float vShade; varying float vDark;
varying float vTone; varying float vH; varying vec3 vN; varying vec3 vW;
void main(){
  if (unscanned(vW, 520.0)) discard;
  /* Humus at the blade root, gold at the tip. Linear-space stops derived
     from the accent tokens; the output pass handles the sRGB transfer. */
  vec3 deep  = ${FUR_DEEP};
  vec3 mid   = ${FUR_MID};
  vec3 tip   = ${FUR_TIP};
  vec3 tipHi = ${FUR_TIPHI};
  vec3 col = mix(deep, mid, smoothstep(0.0, 0.62, vT));
  col = mix(col, tip, smoothstep(0.38, 1.0, vT) * (0.35 + 0.65 * vTone));
  /* slow drifts of tone so the pile never reads as flat velvet */
  col *= 0.62 + 0.72 * vTone;
  col *= vShade;
  col *= 1.0 - vDark * 0.55;
  vec3 N = normalize(vN);
  /* self-shadowing inside the pile: the deeper down a blade, the less sky
     reaches it. Without this the fur reads as astroturf. */
  vec3 lit = litSurface(N, col, mix(0.40, 1.10, smoothstep(0.0, 0.88, vT)) * (0.70 + 0.52 * vTone));
  /* The sunlit crown is added AFTER the pile shading. Folded into the
     albedo it would come back out at the same value as everything else;
     only the last quarter of a blade is in the open, and it is the whole
     top decile of the tonal range. */
  lit += tipHi * smoothstep(0.68, 1.0, vT) * vTone
       * (0.30 + 0.70 * max(dot(N, uKeyDir), 0.0)) * 0.95;
  /* low sun burning through the blade */
  vec3 V = normalize(cameraPosition - vW);
  lit += col * uKeyCol * pow(max(dot(V, -uKeyDir), 0.0), 2.2) * 0.55 * vT;
  gl_FragColor = vec4(aerial(lit, vH), uAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/* ---- survey cage: gold rim riding the wavefront, with a fading trail ---- */

const WIRE_VERT = /* glsl */ `
varying vec3 vW;
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const WIRE_FRAG = /* glsl */ `
uniform vec3 uScanO;
uniform float uScanR, uWire;
varying vec3 vW;
void main(){
  float d = distance(vW, uScanO);
  float rim = exp(-pow((d - uScanR) / 135.0, 2.0));
  float trail = smoothstep(uScanR, uScanR - 950.0, d);
  float a = (rim * 1.6 + trail * 0.34) * uWire;
  if (a < 0.012) discard;
  gl_FragColor = vec4(vec3(0.90, 0.62, 0.26), min(a, 0.82));
}
`;

/* ---- ambient motes: flight integrated from uTime, one uniform per frame ---- */

const MOTE_VERT = /* glsl */ `
attribute vec4 seed;
uniform float uTime, uSize, uScale;
varying float vFade;
void main(){
  float ph = seed.x, sp = seed.y, am = seed.z;
  vec3 p = position;
  p.x += sin(uTime * sp * 0.35 + ph) * 34.0 * am;
  /* one long rise, wrapped; the band fade hides the wrap */
  float climb = mod(uTime * 11.0 * sp + ph * 60.0, 1500.0) - 750.0;
  p.y += climb;
  p.z += cos(uTime * sp * 0.28 + ph) * 24.0 * am;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * seed.w * (uScale / max(-mv.z, 1.0));
  float edge = 1.0 - abs(climb) / 750.0;
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.7 + sp * 1.6) + ph * 3.1);
  vFade = clamp(edge * 3.0, 0.0, 1.0) * twinkle;
  gl_Position = projectionMatrix * mv;
}
`;

const MOTE_FRAG = /* glsl */ `
uniform sampler2D uMap;
varying float vFade;
void main(){
  vec4 t = texture2D(uMap, gl_PointCoord);
  gl_FragColor = vec4(t.rgb, t.a * vFade * 0.52);
}
`;

/* ---- spore trail: ring-buffer pool, flight integrated in the shader ---- */

const SPRAY_VERT = /* glsl */ `
attribute vec3 aVel;
attribute float aBirth;
attribute vec2 aRnd;
uniform float uTime, uSize, uScale, uLife;
varying float vA;
void main(){
  float age = uTime - aBirth;
  if (age < 0.0 || age > uLife) { vA = 0.0; gl_PointSize = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  float u = age / uLife;
  /* drag on the launch velocity, a slow lift, and a little wander */
  vec3 p = position + aVel * age * (1.0 - 0.34 * u)
         + vec3(sin(aRnd.y * 6.28 + age * 2.6) * 22.0 * u, 46.0 * age, 0.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * aRnd.x * (uScale / max(-mv.z, 1.0)) * (0.45 + 0.55 * (1.0 - u));
  vA = smoothstep(0.0, 0.09, u) * (1.0 - smoothstep(0.40, 1.0, u));
  gl_Position = projectionMatrix * mv;
}
`;

const SPRAY_FRAG = /* glsl */ `
uniform sampler2D uMap;
varying float vA;
void main(){
  vec4 t = texture2D(uMap, gl_PointCoord);
  gl_FragColor = vec4(t.rgb, t.a * vA * 0.85);
}
`;

/* ==================================================================== *
 * deterministic noise - the same root grows on every reload
 * ==================================================================== */

type Rng = () => number;

function makeRng(): Rng {
  let a = 0x3f9a1c7b;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rand(rng: Rng, lo: number, hi: number): number {
  return lo + (hi - lo) * rng();
}
function sstep(a: number, b: number, x: number): number {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/* Integer hash, not sin(): the lattice is only ever queried at whole
   coordinates, and Math.sin costs more than everything else the builder
   does put together. */
function hash2(x: number, y: number): number {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  const t = a + (b - a) * ux;
  return t + (c + (d - c) * ux - t) * uy;
}
/** Rotate each octave as well as scaling it, so the lattice never resolves. */
function fbm2(x: number, y: number): number {
  let s = 0;
  let amp = 0.5;
  for (let i = 0; i < 4; i++) {
    s += amp * vnoise(x, y);
    const nx = 0.8 * x + 0.6 * y;
    const ny = -0.6 * x + 0.8 * y;
    x = nx * 2.07 + 3.1;
    y = ny * 2.07 - 1.7;
    amp *= 0.5;
  }
  return s / 0.9375;
}

/* ==================================================================== *
 * limbs - a tube swept along an authored centreline, its upper flank
 * pushed out by however deep the hyphal cushion lies there
 * ==================================================================== */

interface Frames {
  pts: Vector3[];
  tans: Vector3[];
  nrms: Vector3[];
}

interface Limb {
  segs: number;
  radial: number;
  vScale: number;
  sink: number;
  rw: (t: number) => number;
  moss: (t: number) => number;
  blade: (t: number) => number;
  fr: Frames;
  len: number;
  /** Tessellation output, freed after planting. */
  grid: Float32Array | null;
  gnrm: Float32Array | null;
  gcaps: Float32Array | null;
}

/** Fractional artwork coords -> local space, origin at the box centre. */
function makeP(aspect: number): (fx: number, fy: number, z?: number) => Vector3 {
  const bh = BOXW / aspect;
  return (fx, fy, z = 0) => new Vector3((fx - 0.5) * BOXW, (0.5 - fy) * bh, z);
}

/** Parallel-transport frames: no twist, no pole flip along the curve. */
function transportFrames(curve: CatmullRomCurve3, segs: number): Frames {
  const pts: Vector3[] = [];
  const tans: Vector3[] = [];
  const nrms: Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    pts.push(curve.getPointAt(i / segs));
    tans.push(curve.getTangentAt(i / segs).normalize());
  }
  const t0 = tans[0]!;
  const ref = Math.abs(t0.y) < 0.9 ? UP : new Vector3(1, 0, 0);
  nrms.push(new Vector3().crossVectors(t0, ref).normalize());
  for (let i = 1; i <= segs; i++) {
    const prev = tans[i - 1]!;
    const cur = tans[i]!;
    const axis = new Vector3().crossVectors(prev, cur);
    const n = nrms[i - 1]!.clone();
    if (axis.lengthSq() > 1e-12) {
      axis.normalize();
      n.applyAxisAngle(axis, Math.acos(Math.min(1, Math.max(-1, prev.dot(cur)))));
    }
    nrms.push(n.normalize());
  }
  return { pts, tans, nrms };
}

/* How furry a point on the rind is. Driven by how far the surface faces the
   light rather than by the tube's own parameters: the arch turns through
   the vertical, and any "up" defined on the cross-section goes degenerate
   there. Two noise fields ride on top: a fine one frays the fur line so it
   never reads as a stripe, and a slow one opens bald patches of bare rind.
   Both are sampled in local box space, so neighbouring limbs share the
   same weather. */
function furCap(p: Vector3, n: Vector3, steep: number): number {
  const upness = n.y + n.z * (0.1 + 0.42 * steep) - n.x * (0.05 + 0.45 * steep);
  const fray = fbm2(p.x * 2.3 + 4.4, p.z * 2.3 - p.y * 1.9) - 0.5;
  const tongue = fbm2(p.x * 0.95 + 21.0, p.z * 0.95 - p.y * 0.8) - 0.5;
  const patch = fbm2(p.x * 0.52 + 9.3, p.z * 0.52 + p.y * 0.44);
  const c = sstep(0.16, 0.7, upness + fray * 0.4 + tongue * 0.52);
  /* No floor under the patch term: the cushion has to go properly bald in
     places or the rind never gets seen, and the rind is half of what makes
     the root read as an organism rather than topiary. */
  return c * sstep(0.1, 0.5, patch);
}
/* Lumpiness of the cushion itself. Mycelium is never a smooth offset:
   without this the tube reads as an extruded pipe with fur painted on. */
function furLump(p: Vector3): number {
  return (
    0.66 +
    0.48 * fbm2(p.x * 2.4 - 2.2, p.z * 2.4 + p.y * 2.0) +
    0.18 * fbm2(p.x * 7.3 + 5.1, p.z * 7.3 - p.y * 4.4) -
    0.09
  );
}

/** Piecewise-linear lookup over an authored table. */
function table(vals: number[]): (t: number) => number {
  return (t) => {
    const x = Math.min(Math.max(t, 0), 1) * (vals.length - 1);
    const i = Math.min(vals.length - 2, Math.floor(x));
    return vals[i]! + (vals[i + 1]! - vals[i]!) * (x - i);
  };
}

/** Low-frequency radius wobble so the tubes never read as lathed pipes. */
function knot(t: number, a: number, b: number): number {
  return 1 + a * Math.sin(t * 23.0 + 1.3) + b * Math.sin(t * 57.0 + 0.4) + b * 0.5 * Math.sin(t * 103.0 + 2.2);
}

interface LimbSpec {
  segs: number;
  radial: number;
  vScale: number;
  sink?: number;
  /** Half-height of the fur-plus-rind band, sampled along the run. Split
      0.52 rind / 0.88 cushion, the section the reference measured. */
  rt?: number[];
  rw?: (t: number) => number;
  moss?: (t: number) => number;
  blade?: (t: number) => number;
}

function makeLimb(
  P: (fx: number, fy: number, z?: number) => Vector3,
  pts: readonly (readonly [number, number, number])[],
  spec: LimbSpec,
): Limb {
  const v3s = pts.map((q) => P(q[0], q[1], q[2]));
  const curve = new CatmullRomCurve3(v3s, false, "centripetal", 0.5);
  let rw = spec.rw;
  let moss = spec.moss;
  if (spec.rt) {
    const rt = table(spec.rt);
    rw = (t) => rt(t) * 0.52 * knot(t, 0.05, 0.024);
    moss = (t) => rt(t) * 0.88;
  }
  if (!rw || !moss) throw new RangeError("limb needs rw and moss, or an rt table");
  const m = moss;
  return {
    segs: spec.segs,
    radial: spec.radial,
    vScale: spec.vScale,
    sink: spec.sink ?? 0,
    rw,
    moss: m,
    /* Hypha length rides the cushion depth; the offset keeps a short fuzz
       alive even where the cushion thins, so bald edges stay fibrous. */
    blade: spec.blade ?? ((t) => m(t) * 0.055 + 0.012),
    fr: transportFrames(curve, spec.segs),
    len: curve.getLength(),
    grid: null,
    gnrm: null,
    gcaps: null,
  };
}

/* frame/surface scratch: build-time only, single-threaded */
const _fp = new Vector3();
const _ft = new Vector3();
const _fn = new Vector3();
const _fb = new Vector3();

function limbFrame(L: Limb, t: number): void {
  const f = Math.min(Math.max(t, 0), 1) * L.segs;
  const i = Math.min(L.segs - 1, Math.floor(f));
  const a = f - i;
  _fp.copy(L.fr.pts[i]!).lerp(L.fr.pts[i + 1]!, a);
  /* Authored points sit on the MIDLINE of the silhouette, but the silhouette
     is asymmetric: bare rind below, rind plus cushion above. The tube's own
     axis is half a cushion lower. */
  if (L.sink) _fp.y -= L.moss(t) * L.sink;
  _ft.copy(L.fr.tans[i]!).lerp(L.fr.tans[i + 1]!, a).normalize();
  _fn.copy(L.fr.nrms[i]!).lerp(L.fr.nrms[i + 1]!, a);
  _fn.addScaledVector(_ft, -_fn.dot(_ft)).normalize();
  _fb.crossVectors(_ft, _fn).normalize();
}

/** The finished surface: rind radius plus the cushion sitting on it. */
function limbSurface(L: Limb, t: number, th: number, outP: Vector3, outN: Vector3): number {
  limbFrame(L, t);
  const steep = Math.min(1, Math.abs(_ft.y) * 1.15);
  const c = Math.cos(th);
  const s = Math.sin(th);
  outN.set(_fn.x * c + _fb.x * s, _fn.y * c + _fb.y * s, _fn.z * c + _fb.z * s).normalize();
  const rw = L.rw(t);
  outP.copy(_fp).addScaledVector(outN, rw);
  const cap = furCap(outP, outN, steep);
  const d = rw + L.moss(t) * cap * furLump(outP);
  outP.copy(_fp).addScaledVector(outN, d);
  return cap;
}

interface ShellBag {
  pos: number[];
  nor: number[];
  inf: number[];
  idx: number[];
}
interface FurBag {
  off: number[];
  nrm: number[];
  rnd: number[];
  aux: number[];
}

/* Build the (segs+1) x (radial+1) grid, then take the normal from the grid
   itself so the displacement is lit, not the tube. */
function tessellate(L: Limb, bag: ShellBag): void {
  const S = L.segs;
  const R = L.radial;
  const base = bag.pos.length / 3;
  const grid = new Float32Array((S + 1) * (R + 1) * 3);
  const gnrm = new Float32Array((S + 1) * (R + 1) * 3);
  const caps = new Float32Array((S + 1) * (R + 1));
  const p = new Vector3();
  const n = new Vector3();

  for (let i = 0; i <= S; i++) {
    for (let j = 0; j <= R; j++) {
      const cap = limbSurface(L, i / S, (j / R) * TAU, p, n);
      const k = (i * (R + 1) + j) * 3;
      grid[k] = p.x;
      grid[k + 1] = p.y;
      grid[k + 2] = p.z;
      caps[i * (R + 1) + j] = cap;
    }
  }

  const a = new Vector3();
  const b = new Vector3();
  const du = new Vector3();
  const dv = new Vector3();
  const get = (i2: number, j2: number, out: Vector3): Vector3 => {
    i2 = Math.min(S, Math.max(0, i2));
    j2 = (j2 + R) % R; /* theta wraps: no seam in the normals */
    const q = (i2 * (R + 1) + j2) * 3;
    return out.set(grid[q]!, grid[q + 1]!, grid[q + 2]!);
  };

  for (let i = 0; i <= S; i++) {
    for (let j = 0; j <= R; j++) {
      get(i + 1, j, a);
      get(i - 1, j, b);
      du.subVectors(a, b);
      get(i, j + 1, a);
      get(i, j - 1, b);
      dv.subVectors(a, b);
      n.crossVectors(dv, du);
      if (n.lengthSq() < 1e-12) limbSurface(L, i / S, (j / R) * TAU, p, n);
      else n.normalize();
      const k = (i * (R + 1) + j) * 3;
      bag.pos.push(grid[k]!, grid[k + 1]!, grid[k + 2]!);
      bag.nor.push(n.x, n.y, n.z);
      /* u is a triangle wave so the rind noise mirrors instead of seaming */
      bag.inf.push(1 - Math.abs(2 * (j / R) - 1), (i / S) * L.vScale, caps[i * (R + 1) + j]!);
      gnrm[k] = n.x;
      gnrm[k + 1] = n.y;
      gnrm[k + 2] = n.z;
    }
  }
  for (let i = 0; i < S; i++) {
    for (let j = 0; j < R; j++) {
      const q0 = base + i * (R + 1) + j;
      const q1 = q0 + R + 1;
      bag.idx.push(q0, q1, q0 + 1, q1, q1 + 1, q0 + 1);
    }
  }
  /* the fur is planted straight onto this grid, so hand it over */
  L.grid = grid;
  L.gnrm = gnrm;
  L.gcaps = caps;
}

/* Blades planted straight onto the shell grid. Sampling the grid is O(1)
   per blade and guarantees the fur sits exactly on the surface that gets
   drawn. Cells are drawn in proportion to area x cushion^2 by binary
   search over a CDF, so density follows the cushion rather than the
   tube's parameterisation. */
function plantBlades(L: Limb, count: number, bag: FurBag, rng: Rng): number {
  const S = L.segs;
  const R = L.radial;
  const grid = L.grid;
  const gn = L.gnrm;
  const caps = L.gcaps;
  if (!grid || !gn || !caps) return 0;
  const cells = S * R;
  const cdf = new Float64Array(cells);
  let total = 0;

  for (let i = 0; i < S; i++) {
    for (let j = 0; j < R; j++) {
      const q00 = (i * (R + 1) + j) * 3;
      const q10 = q00 + 3;
      const q01 = ((i + 1) * (R + 1) + j) * 3;
      const ax = grid[q10]! - grid[q00]!;
      const ay = grid[q10 + 1]! - grid[q00 + 1]!;
      const az = grid[q10 + 2]! - grid[q00 + 2]!;
      const bx = grid[q01]! - grid[q00]!;
      const by = grid[q01 + 1]! - grid[q00 + 1]!;
      const bz = grid[q01 + 2]! - grid[q00 + 2]!;
      const cx = ay * bz - az * by;
      const cy = az * bx - ax * bz;
      const cz = ax * by - ay * bx;
      const area = Math.sqrt(cx * cx + cy * cy + cz * cz);
      const cap =
        0.25 *
        (caps[i * (R + 1) + j]! + caps[i * (R + 1) + j + 1]! + caps[(i + 1) * (R + 1) + j]! + caps[(i + 1) * (R + 1) + j + 1]!);
      total += area * cap * cap;
      cdf[i * R + j] = total;
    }
  }
  if (total <= 0) return 0;

  let planted = 0;
  for (let b = 0; b < count; b++) {
    const target = rng() * total;
    let lo = 0;
    let hi = cells - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid]! < target) lo = mid + 1;
      else hi = mid;
    }
    const i = (lo / R) | 0;
    const j = lo - i * R;
    const u = rng();
    const v = rng();

    const i0 = i * (R + 1) + j;
    const i1 = i0 + 1;
    const i2 = i0 + R + 1;
    const i3 = i2 + 1;
    const w0 = (1 - u) * (1 - v);
    const w1 = u * (1 - v);
    const w2 = (1 - u) * v;
    const w3 = u * v;
    const cap2 = caps[i0]! * w0 + caps[i1]! * w1 + caps[i2]! * w2 + caps[i3]! * w3;
    if (cap2 < 0.05) continue;

    const p0 = i0 * 3;
    const p1 = i1 * 3;
    const p2 = i2 * 3;
    const p3 = i3 * 3;
    const px = grid[p0]! * w0 + grid[p1]! * w1 + grid[p2]! * w2 + grid[p3]! * w3;
    const py = grid[p0 + 1]! * w0 + grid[p1 + 1]! * w1 + grid[p2 + 1]! * w2 + grid[p3 + 1]! * w3;
    const pz = grid[p0 + 2]! * w0 + grid[p1 + 2]! * w1 + grid[p2 + 2]! * w2 + grid[p3 + 2]! * w3;
    /* The grid normal is the CUSHION's normal, lumps and all. Standing the
       fur on the smooth cross-section normal instead would throw away every
       bump the displacement just built. */
    const nx = gn[p0]! * w0 + gn[p1]! * w1 + gn[p2]! * w2 + gn[p3]! * w3;
    const ny = gn[p0 + 1]! * w0 + gn[p1 + 1]! * w1 + gn[p2 + 1]! * w2 + gn[p3 + 1]! * w3;
    const nz = gn[p0 + 2]! * w0 + gn[p1 + 2]! * w1 + gn[p2 + 2]! * w2 + gn[p3 + 2]! * w3;
    const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

    bag.off.push(px, py, pz);
    bag.nrm.push(nx / nl, ny / nl, nz / nl);
    /* About one blade in sixteen is a long stray. Uniform-length fur cuts a
       hard edge against the background; the strays make the silhouette read
       as mycelium rather than a hedge trimmed with shears. */
    const stray = rng() < 0.06 ? rand(rng, 1.25, 1.55) : 1.0;
    bag.rnd.push(
      rng() * TAU /* yaw */,
      L.blade((i + v) / S) * (0.45 + 0.6 * cap2) * (0.58 + 0.5 * rng()) * stray,
      (rng() - 0.5) * 1.15 /* lean */,
      rng() /* per-blade tone */,
    );
    /* two scales of clumping: broad cushions, and the tufts inside them */
    bag.aux.push(fbm2(px * 0.85 + 17.0, pz * 0.85 - py * 0.7) * 0.62 + fbm2(px * 5.6 - 3.3, pz * 5.6 + py * 2.1) * 0.38);
    planted++;
  }
  return planted;
}

/* Offshoots: short procedural forks. The root is a root, not a tree; they
   exist to break the tube's silhouette, not to build a canopy. */
function makeOffshoot(rng: Rng, start: Vector3, dir: Vector3, len: number, r0: number): Limb {
  const side = new Vector3().crossVectors(dir, UP);
  if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
  side.normalize();
  const up = new Vector3().crossVectors(side, dir).normalize();
  const bow = rand(rng, 0.1, 0.46);
  const kink = rand(rng, -0.26, 0.26);
  const node = (f: number, u2: number, k: number): Vector3 =>
    start.clone().addScaledVector(dir, len * f).addScaledVector(up, len * u2).addScaledVector(side, len * k);
  const pts = [start.clone(), node(0.32, bow * 0.3, kink * 0.7), node(0.68, bow * 0.85, kink * 0.24), node(1.0, bow, kink * 0.44)];
  const curve = new CatmullRomCurve3(pts, false, "centripetal", 0.5);
  const r1 = r0 * 0.52;
  const rr = (t: number): number => r0 + (r1 - r0) * t;
  return {
    segs: 16,
    radial: 9,
    vScale: len * 7,
    sink: 0,
    /* Draw the last few percent down to a point: tubes are open-ended, and
       a twig that simply stops shows a flat hollow cap hanging in the air. */
    rw: (t) => rr(t) * (1 - 0.86 * sstep(0.9, 1.0, t)),
    moss: (t) => rr(t) * 0.95 * (1 - 0.55 * t),
    blade: (t) => rr(t) * 0.22 * (1 - 0.55 * t) + 0.02,
    fr: transportFrames(curve, 16),
    len: curve.getLength(),
    grid: null,
    gnrm: null,
    gcaps: null,
  };
}

/* ==================================================================== *
 * the two roots. Composition brief, in box fractions that layout() maps
 * roughly one-to-one onto the wide viewport: a limb rises from the lower
 * left, crests near x 0.35 and comes back down inside the frame; a crown
 * mound carries the fur under the crest; a thick ground root bleeds off
 * the left and bottom edges; thin strands leave the frame. Everything
 * stays left of x 0.45 below y 0.45, where the hero copy sits.
 * ==================================================================== */

function buildNearLimbs(): Limb[] {
  const P = makeP(NEAR_ASPECT);
  const limbs: Limb[] = [];

  /* the ground root: enters at the left edge, runs under the crown and
     dives off the bottom edge, thinning as it goes */
  limbs.push(
    makeLimb(
      P,
      [
        [-0.08, 0.7, -0.4],
        [0.02, 0.76, -0.1],
        [0.12, 0.8, 0.15],
        [0.24, 0.84, 0.3],
        [0.34, 0.9, 0.22],
        [0.42, 0.99, 0.05],
        [0.46, 1.08, -0.1],
      ],
      {
        segs: 200,
        radial: 24,
        vScale: 22,
        /* deepest cushion under the crown, tapering into the exit */
        rt: [0.44, 0.5, 0.54, 0.52, 0.45, 0.38, 0.32],
        sink: 0.5,
      },
    ),
  );

  /* The arch is two legs fused at the apex, not one bent hoop: the crown
     of an arch built as a single tube goes degenerate in the transport
     frame right where it matters most. Ascending leg first: it lifts out
     of the crown mass and crests at about a third of the frame width. */
  const legUpRw = table([0.28, 0.265, 0.25, 0.235, 0.215, 0.195]);
  const legUpMoss = table([0.24, 0.23, 0.215, 0.2, 0.185, 0.17]);
  limbs.push(
    makeLimb(
      P,
      [
        [0.08, 0.87, 0.3],
        [0.12, 0.72, 0.34],
        [0.17, 0.56, 0.34],
        [0.235, 0.41, 0.28],
        [0.3, 0.29, 0.18],
        [0.355, 0.245, 0.06],
      ],
      {
        segs: 120,
        radial: 18,
        vScale: 22,
        rw: (t) => legUpRw(t) * knot(t, 0.05, 0.022),
        moss: legUpMoss,
      },
    ),
  );

  /* descending leg: interpenetrates the first at the apex, bows a little
     to the right and lands back in the crown, fully inside the frame */
  const legDnRw = table([0.2, 0.205, 0.215, 0.225, 0.24, 0.255, 0.27]);
  const legDnMoss = table([0.17, 0.165, 0.16, 0.155, 0.15, 0.145, 0.14]);
  limbs.push(
    makeLimb(
      P,
      [
        [0.335, 0.25, 0.04],
        [0.39, 0.255, -0.04],
        [0.405, 0.33, -0.1],
        [0.415, 0.45, -0.12],
        [0.4, 0.59, -0.09],
        [0.385, 0.73, -0.02],
        [0.35, 0.87, 0.08],
        [0.33, 0.97, 0.15],
      ],
      {
        segs: 130,
        radial: 18,
        vScale: 22,
        rw: (t) => legDnRw(t) * knot(t, 0.05, 0.022),
        moss: legDnMoss,
      },
    ),
  );

  /* the crown mound: short, thick, in front, under the crest */
  limbs.push(
    makeLimb(
      P,
      [
        [0.04, 0.92, 0.35],
        [0.12, 0.83, 0.45],
        [0.21, 0.78, 0.44],
        [0.3, 0.8, 0.3],
        [0.38, 0.87, 0.12],
      ],
      {
        segs: 110,
        radial: 20,
        vScale: 18,
        rt: [0.38, 0.48, 0.52, 0.45, 0.35, 0.27],
        sink: 0.5,
      },
    ),
  );

  /* one thin hyphal strand off the crest, exiting through the right edge
     high above the copy: the fibre that says mycelium, not driftwood */
  limbs.push(
    makeLimb(
      P,
      [
        [0.36, 0.28, 0.0],
        [0.48, 0.235, -0.1],
        [0.62, 0.19, -0.18],
        [0.78, 0.155, -0.22],
        [0.95, 0.115, -0.3],
        [1.07, 0.09, -0.38],
      ],
      {
        segs: 110,
        radial: 12,
        vScale: 16,
        rw: (t) => 0.075 * (1 - 0.3 * t) * knot(t, 0.06, 0.03),
        moss: (t) => 0.09 * (1 - 0.4 * t),
      },
    ),
  );

  /* and one out of the crown, off the lower left corner */
  limbs.push(
    makeLimb(
      P,
      [
        [0.16, 0.82, 0.5],
        [0.1, 0.9, 0.52],
        [0.03, 0.97, 0.5],
        [-0.05, 1.06, 0.45],
      ],
      {
        segs: 60,
        radial: 10,
        vScale: 10,
        rw: (t) => 0.06 * (1 - 0.25 * t) * knot(t, 0.06, 0.03),
        moss: (t) => 0.075 * (1 - 0.4 * t),
      },
    ),
  );

  return limbs;
}

function buildFarLimbs(): Limb[] {
  const P = makeP(FAR_ASPECT);
  return [
    makeLimb(
      P,
      [
        [-0.05, 0.66, -0.3],
        [0.08, 0.56, -0.05],
        [0.22, 0.48, 0.18],
        [0.36, 0.44, 0.26],
        [0.5, 0.49, 0.12],
        [0.64, 0.58, -0.08],
        [0.78, 0.56, 0.06],
        [0.92, 0.47, 0.18],
        [1.05, 0.4, 0.28],
      ],
      {
        segs: 200,
        radial: 18,
        vScale: 26,
        rt: [0.4, 0.45, 0.5, 0.52, 0.48, 0.5, 0.54, 0.56, 0.6, 0.64, 0.68],
        sink: 0.5,
      },
    ),
  ];
}

/** The blade: four rungs pinched to a point. 8 vertices, 6 triangles. */
function bladeGeometry(): InstancedBufferGeometry {
  const SEGS = 3;
  const verts: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= SEGS; i++) {
    const t = i / SEGS;
    const w = 0.5 * (1 - t * t);
    verts.push(-w, t, 0, w, t, 0);
    uvs.push(0, t, 1, t);
  }
  verts[verts.length - 6] = 0;
  verts[verts.length - 3] = 0;
  for (let i = 0; i < SEGS; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const g = new InstancedBufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(verts, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  return g;
}

/** Soft radial sprite baked once into a canvas. */
function radialTexture(size: number, stops: readonly (readonly [number, string])[]): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const s of stops) grad.addColorStop(s[0], s[1]);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  const t = new CanvasTexture(c);
  t.minFilter = LinearFilter;
  /* the gradient is authored in sRGB; tell the sampler so */
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* ==================================================================== *
 * mount
 * ==================================================================== */

interface SprayState {
  pos: Float32Array;
  vel: Float32Array;
  birth: Float32Array;
  rnd: Float32Array;
  head: number;
  idle: number;
  dirty: boolean;
  attrs: { pos: BufferAttribute; vel: BufferAttribute; birth: BufferAttribute; rnd: BufferAttribute };
  last: Vector3;
  at: Vector3;
  step: Vector3;
}

interface Ctx {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  near: Group;
  far: Group;
  shells: Mesh[];
  uTime: { value: number };
  uScanO: { value: Vector3 };
  uScanR: { value: number };
  uScanOn: { value: number };
  uWire: { value: number };
  uMouseNear: { value: Vector3 };
  uMouseFar: { value: Vector3 };
  moteU: { uSize: { value: number }; uScale: { value: number } };
  sprayU: { uSize: { value: number }; uScale: { value: number } };
  spray: SprayState;
  cages: LineSegments[];
  wireMat: ShaderMaterial | null;
  scanMax: number;
  W: number;
  H: number;
}

export function mountStage(canvas: HTMLCanvasElement, host: HTMLElement): StageHandle {
  const existing = mountedHandles.get(canvas);
  if (existing) return existing;

  const pointer = initPointer();

  let destroyed = false;
  let ctx: Ctx | null = null;
  let inView = false;
  let scanPending = false;
  let scanning = false;
  /** Pulse start, wall-clock ms. See frame(): the bus clamps dt. */
  let scanT0 = 0;
  /** Reduced motion renders exactly one designed still, then stops. */
  let needStill = true;
  let pointerLive = false;

  /* Every GPU resource lands in one of these; destroy() drains them. */
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];

  const raycaster = new Raycaster();
  const ndc = new Vector2();
  /* One fixed plane per root group, plus the spray's, all facing camera.
     Plane constant: n.p + c = 0, so a plane at z = Z has c = -Z. */
  const nearPlane = new Plane(new Vector3(0, 0, 1), 0);
  const farPlane = new Plane(new Vector3(0, 0, 1), -FAR_Z);
  const sprayPlane = new Plane(new Vector3(0, 0, 1), -120);
  const hitNear = new Vector3();
  const hitFar = new Vector3();
  const tmpLocal = new Vector3();

  const rnd = (lo: number, hi: number): number => lo + (hi - lo) * Math.random();

  /* ---- observers: the gates that let an unseen hero cost nothing ---- */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) inView = e.isIntersecting;
    },
    { threshold: 0.02 },
  );
  io.observe(host);

  const ro = new ResizeObserver(() => {
    if (ctx) layout(ctx);
  });
  ro.observe(host);

  /* ---- layout: pin the roots to the CSS pixel grid ---- */
  function layout(c: Ctx): void {
    const W = host.clientWidth;
    const H = host.clientHeight;
    if (!W || !H) return;
    c.W = W;
    c.H = H;
    c.renderer.setSize(W, H, false);
    /* solved so one world unit is one CSS pixel at z = 0 */
    c.camera.fov = (2 * Math.atan(H / 2 / DIST) * 180) / Math.PI;
    c.camera.aspect = W / H;
    c.camera.updateProjectionMatrix();

    const narrow = W < 760;
    const portrait = !narrow && H > W;

    /* Near root: the arch crest (frac 0.355, 0.245 of its box) pins near
       the top-left third of the hero, so the authored fractions land about
       one-to-one on a wide viewport. Portrait viewports stack the copy
       full-width below the fold line, so the box shrinks and rides high,
       above the text. Narrow screens grow the box past the viewport so the
       root bleeds off the edges instead of shrinking to a trinket. */
    const wf = narrow ? 1.9 : portrait ? 0.85 : 0.95;
    const boxW = Math.min(Math.max(W * wf, narrow ? 700 : 640), 1720);
    const s = boxW / BOXW;
    /* crest pin, local units: frac (0.355, 0.245) of the near box */
    const pinX = (0.355 - 0.5) * BOXW;
    const pinY = (0.5 - 0.245) * (BOXW / NEAR_ASPECT);
    const px = narrow ? W * 0.46 : W * 0.34;
    const py = narrow ? H * 0.3 : portrait ? H * 0.17 : H * 0.26;
    c.near.scale.setScalar(s);
    c.near.position.set(px - W / 2 - pinX * s, H / 2 - py - pinY * s, 0);

    /* Far ridge: pushed back, scaled by k so its apparent size and pin both
       survive the perspective shrink. It is atmosphere, not a second subject.
       At 0.62 of the box and fog 0.88 it read as a hard-edged brown stain in
       the top corner, so it is smaller now and sits on a horizon line rather
       than in a corner. */
    const kz = (DIST - FAR_Z) / DIST;
    const fs = ((boxW * 0.46) / BOXW) * kz;
    /* crest pin, local units: frac (0.40, 0.50) of the far box */
    const fpinX = (0.4 - 0.5) * BOXW;
    const fpinY = (0.5 - 0.5) * (BOXW / FAR_ASPECT);
    const fx = W * 0.78;
    const fy = H * 0.18;
    c.far.scale.setScalar(fs);
    c.far.position.set((fx - W / 2) * kz - fpinX * fs, (H / 2 - fy) * kz - fpinY * fs, FAR_Z);
    c.scene.updateMatrixWorld(true);

    /* pulse origin: outside the silhouette, lower left, in front */
    c.uScanO.value.set(-W / 2 - 160, -H / 2 + 90, 140);
    c.scanMax = Math.hypot(W, H) * 1.3 + 900;

    /* mimic three's own sizeAttenuation: gl_PointSize = size * (scale / -z)
       with scale = half the drawing buffer height */
    const half = c.renderer.getDrawingBufferSize(new Vector2()).y * 0.5;
    c.moteU.uScale.value = half;
    c.sprayU.uScale.value = half;
    c.moteU.uSize.value = Math.max(5, 9 * (W / 1600));
    c.sprayU.uSize.value = Math.max(7, 13 * (W / 1600));

    needStill = true;
  }

  /* ---- camera pose: the unequal-layer split ---- */
  function pose(c: Ctx, p: PointerState): void {
    c.camera.position.x = -p.nx * 26;
    c.camera.position.y = p.ny * 16;
    c.camera.lookAt(c.camera.position.x * 0.42, c.camera.position.y * 0.42, 0);
  }

  /* ---- survey cage ---- */
  function buildCages(c: Ctx): void {
    const mat = new ShaderMaterial({
      uniforms: { uScanO: c.uScanO, uScanR: c.uScanR, uWire: c.uWire },
      vertexShader: WIRE_VERT,
      fragmentShader: WIRE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: AdditiveBlending,
    });
    c.wireMat = mat;
    for (const shell of c.shells) {
      const cage = new LineSegments(new WireframeGeometry(shell.geometry), mat);
      cage.frustumCulled = false;
      cage.renderOrder = 5;
      shell.parent?.add(cage);
      c.cages.push(cage);
    }
  }

  function disposeCages(c: Ctx): void {
    for (const cage of c.cages) {
      cage.parent?.remove(cage);
      cage.geometry.dispose();
    }
    c.cages.length = 0;
    if (c.wireMat) {
      c.wireMat.dispose();
      c.wireMat = null;
    }
  }

  /* ---- cursor -> the plane each root stands in, in its own space ---- */
  function applyMouse(g: Group, u: { value: Vector3 }, hit: Vector3 | null, dt: number): void {
    if (!hit) {
      u.value.set(AWAY, AWAY, AWAY);
      return;
    }
    tmpLocal.copy(hit);
    g.worldToLocal(tmpLocal);
    if (u.value.x > 999) {
      u.value.copy(tmpLocal);
      return;
    }
    /* frame-rate independent smoothing: the same feel at 60 and 120 Hz */
    u.value.lerp(tmpLocal, 1 - Math.pow(0.0002, dt));
  }

  function updateMouse(c: Ctx, dt: number, p: PointerState): void {
    let hasNear = false;
    let hasFar = false;
    pointerLive = !Number.isNaN(p.cx) && !Number.isNaN(p.cy);
    if (pointerLive) {
      /* The host sits at the top of the document, so client to host space is
         a scroll shift, not a rect read: no layout thrash per frame. */
      ndc.set((p.cx / c.W) * 2 - 1, -((p.cy + window.scrollY) / c.H) * 2 + 1);
      raycaster.setFromCamera(ndc, c.camera);
      hasNear = raycaster.ray.intersectPlane(nearPlane, hitNear) !== null;
      hasFar = raycaster.ray.intersectPlane(farPlane, hitFar) !== null;
    }
    applyMouse(c.near, c.uMouseNear, hasNear ? hitNear : null, dt);
    applyMouse(c.far, c.uMouseFar, hasFar ? hitFar : null, dt);
  }

  /* ---- spore trail: emit by pointer DISTANCE, not by time ---- */
  function spawnSpray(c: Ctx, at: Vector3): void {
    const s = c.spray;
    const i = s.head;
    s.head = (s.head + 1) % SPRAY_N;
    const o = i * 3;
    s.pos[o] = at.x + rnd(-15, 15);
    s.pos[o + 1] = at.y + rnd(-15, 15);
    s.pos[o + 2] = at.z + rnd(-45, 45);
    s.vel[o] = rnd(-38, 38);
    s.vel[o + 1] = rnd(2, 64);
    s.vel[o + 2] = rnd(-26, 26);
    s.birth[i] = c.uTime.value;
    s.rnd[i * 2] = rnd(0.5, 1.15);
    s.rnd[i * 2 + 1] = Math.random();
    s.dirty = true;
  }

  function emitSpray(c: Ctx, dt: number): void {
    const s = c.spray;
    if (!pointerLive || raycaster.ray.intersectPlane(sprayPlane, s.at) === null) {
      s.last.x = AWAY; /* re-entering must not lay a streak */
      return;
    }
    if (s.last.x > 9000) {
      s.last.copy(s.at);
      return;
    }
    /* one mote per 7 world units of travel, spread along the segment the
       pointer covered, capped so a teleport cannot flush the whole pool */
    const d = s.at.distanceTo(s.last);
    const n = Math.min(14, Math.floor(d / 7));
    for (let k = 1; k <= n; k++) {
      s.step.lerpVectors(s.last, s.at, k / n);
      spawnSpray(c, s.step);
    }
    if (n > 0) {
      s.last.copy(s.at);
      s.idle = 0;
    } else {
      s.idle += dt;
      /* a resting hand trickles; it does not pump */
      if (s.idle > 0.055) {
        spawnSpray(c, s.at);
        s.idle = 0;
      }
    }
    if (s.dirty) {
      s.attrs.pos.needsUpdate = true;
      s.attrs.vel.needsUpdate = true;
      s.attrs.birth.needsUpdate = true;
      s.attrs.rnd.needsUpdate = true;
      s.dirty = false;
    }
  }

  /* ---- per-frame, called by the shared pointer bus ---- */
  function frame(dt: number, p: PointerState): void {
    const c = ctx;
    if (!c || destroyed) return;
    if (document.hidden || !inView) return;

    if (p.reduced) {
      /* Designed still: no pulse, no wind (uWind is 0), no spray, the bus's
         authored off-centre pose. One frame, then nothing until a resize. */
      if (needStill) {
        pose(c, p);
        c.renderer.render(c.scene, c.camera);
        needStill = false;
      }
      return;
    }

    c.uTime.value += dt;
    const t = c.uTime.value;

    pose(c, p);
    c.near.rotation.y = p.nx * 0.055;
    c.near.rotation.x = p.ny * 0.026;
    /* slow breathing, under the threshold where it reads as wobble */
    c.near.rotation.z = Math.sin(t * 0.22) * 0.0022;
    c.far.rotation.y = p.nx * 0.03;

    /* The pulse waits for the first visible frame: a background tab gets no
       rAF, and the hero must not have already finished its entrance when
       the tab is finally opened. */
    if (scanPending) {
      scanPending = false;
      scanning = true;
      scanT0 = performance.now();
      c.uScanR.value = 0;
      c.uWire.value = 0;
      buildCages(c);
    }
    if (scanning) {
      /* Wall clock, not summed dt: the bus clamps dt to 1/30 s, so on a
         slow GPU the summed clock falls behind real time and the cage
         never burns off. The pulse must end on schedule regardless. */
      const e = Math.min(1, (performance.now() - scanT0) / (SCAN_DUR * 1000));
      c.uScanR.value = (1 - Math.pow(1 - e, 1.35)) * c.scanMax;
      /* the cage snaps on, rides the front, then burns off behind it */
      c.uWire.value = Math.min(1, e / 0.06) * (1 - sstep(0.72, 1.0, e));
      if (e >= 1) {
        scanning = false;
        c.uScanOn.value = 0;
        c.uWire.value = 0;
        disposeCages(c);
      }
    }

    updateMouse(c, dt, p);
    emitSpray(c, dt);
    c.renderer.render(c.scene, c.camera);
  }

  const detachFrame = subscribe(frame);

  /* ---- build, deferred two frames so the CSS entrance is not frozen by
          geometry growth and shader compile ---- */
  let raf1 = 0;
  let raf2 = 0;

  function build(): void {
    if (destroyed) return;

    const narrow = window.innerWidth < 760;
    const small = narrow || window.innerWidth * window.innerHeight < 620000;
    let bladesNear = small ? 45000 : 130000;
    let bladesFar = small ? 14000 : 40000;
    const q = /[?&]blades=(\d+)/.exec(window.location.search);
    const qn = q?.[1];
    if (qn) {
      bladesNear = Number(qn);
      bladesFar = Math.round(bladesNear * 0.2);
    }

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: !small });
    } catch {
      /* No WebGL. The hero copy survives; the canvas leaves the flow. */
      canvas.remove();
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    const camera = new PerspectiveCamera(40, 1, 10, 8000);
    camera.position.set(0, 0, DIST);

    /* shared uniforms: one write moves every material */
    const uTime = { value: 0 };
    const uWind = { value: pointer.reduced ? 0 : 1 };
    const uScanO = { value: new Vector3(-900, -260, 240) };
    const uScanR = { value: 0 };
    const uScanOn = { value: 0 };
    const uWire = { value: 0 };
    const uMouseNear = { value: new Vector3(AWAY, AWAY, AWAY) };
    const uMouseFar = { value: new Vector3(AWAY, AWAY, AWAY) };

    const rng = makeRng();

    function lightUniforms(o: {
      boxH: number;
      haze: number;
      fog: number;
      hazeLift: number;
      mouse: { value: Vector3 };
      mouseR: number;
    }): Record<string, { value: unknown }> {
      return {
        uTime,
        uWind,
        uKeyDir: { value: KEY_DIR.clone() },
        uKeyCol: { value: KEY_COL.clone() },
        uFillDir: { value: FILL_DIR.clone() },
        uFillCol: { value: FILL_COL.clone() },
        uAmbCol: { value: AMB_COL.clone() },
        uHazeCol: { value: HAZE_COL.clone() },
        uHaze: { value: o.haze },
        uHazeLift: { value: o.hazeLift },
        uFog: { value: o.fog },
        uAlpha: { value: 1.0 },
        uBoxH: { value: o.boxH },
        uScanO,
        uScanR,
        uScanOn,
        uMouse: o.mouse,
        uMouseR: { value: o.mouseR },
      };
    }

    /* one root: rind shell + instanced fur, under a single group */
    function assembleRoot(
      limbs: Limb[],
      o: {
        aspect: number;
        haze: number;
        fog: number;
        hazeLift: number;
        blades: number;
        order: number;
        mouse: { value: Vector3 };
        mouseR: number;
      },
    ): { group: Group; shell: Mesh } {
      const group = new Group();
      const uni = lightUniforms({
        boxH: BOXW / o.aspect,
        haze: o.haze,
        fog: o.fog,
        hazeLift: o.hazeLift,
        mouse: o.mouse,
        mouseR: o.mouseR,
      });

      const bag: ShellBag = { pos: [], nor: [], inf: [], idx: [] };
      for (const L of limbs) tessellate(L, bag);
      const geo = new BufferGeometry();
      geo.setAttribute("position", new Float32BufferAttribute(bag.pos, 3));
      geo.setAttribute("normal", new Float32BufferAttribute(bag.nor, 3));
      geo.setAttribute("inf", new Float32BufferAttribute(bag.inf, 3));
      geo.setIndex(bag.idx);
      geometries.push(geo);
      const rindMat = new ShaderMaterial({
        uniforms: uni,
        vertexShader: RIND_VERT,
        fragmentShader: RIND_FRAG,
        side: DoubleSide,
      });
      materials.push(rindMat);
      const shell = new Mesh(geo, rindMat);
      shell.frustumCulled = false;
      shell.renderOrder = o.order;
      group.add(shell);

      /* fur: blades per limb in proportion to its arclength */
      const fur: FurBag = { off: [], nrm: [], rnd: [], aux: [] };
      let total = 0;
      for (const L of limbs) total += L.len;
      for (const L of limbs) plantBlades(L, Math.round((o.blades * L.len) / total), fur, rng);
      const bg = bladeGeometry();
      bg.setAttribute("offset", new InstancedBufferAttribute(new Float32Array(fur.off), 3));
      bg.setAttribute("nrm", new InstancedBufferAttribute(new Float32Array(fur.nrm), 3));
      bg.setAttribute("rnd", new InstancedBufferAttribute(new Float32Array(fur.rnd), 4));
      bg.setAttribute("aux", new InstancedBufferAttribute(new Float32Array(fur.aux), 1));
      bg.instanceCount = fur.off.length / 3;
      geometries.push(bg);
      const furMat = new ShaderMaterial({
        uniforms: uni,
        vertexShader: HYPHAE_VERT,
        fragmentShader: HYPHAE_FRAG,
        side: DoubleSide,
      });
      materials.push(furMat);
      const blades = new Mesh(bg, furMat);
      blades.frustumCulled = false;
      blades.renderOrder = o.order + 0.1;
      group.add(blades);

      /* free the tessellation grids: planting was their last reader */
      for (const L of limbs) {
        L.grid = null;
        L.gnrm = null;
        L.gcaps = null;
      }
      return { group, shell };
    }

    /* ---- near root, plus procedural offshoots seeded on its limbs ---- */
    const nearLimbs = buildNearLimbs();
    const hp = new Vector3();
    const hn = new Vector3();
    const shoots: Limb[] = [];
    for (let i = 0; i < 10 && shoots.length < 3; i++) {
      const r = rng();
      const src = nearLimbs[r < 0.5 ? 0 : r < 0.8 ? 1 : 3]!;
      const t = rand(rng, 0.08, 0.92);
      limbSurface(src, t, rng() * TAU, hp, hn);
      /* a shoot on the camera-away underside reads as a floating twig */
      if (hn.y < -0.35) continue;
      limbFrame(src, t);
      const dir = hn
        .clone()
        .multiplyScalar(rand(rng, 0.5, 1.2))
        .addScaledVector(_ft, rand(rng, -0.6, 1.5))
        .addScaledVector(UP, rand(rng, -0.5, 0.55))
        .normalize();
      /* seat the base under the surface so the joint never shows a gap */
      hp.addScaledVector(hn, -src.rw(t) * 0.55);
      shoots.push(makeOffshoot(rng, hp.clone(), dir, rand(rng, 0.8, 1.5), src.rw(t) * rand(rng, 0.24, 0.4)));
    }

    const nearRoot = assembleRoot(nearLimbs.concat(shoots), {
      aspect: NEAR_ASPECT,
      haze: 0.14,
      fog: 0.0,
      hazeLift: 0.2,
      blades: bladesNear,
      order: 2,
      mouse: uMouseNear,
      mouseR: 1.2,
    });
    scene.add(nearRoot.group);

    /* ---- far ridge: same builder, pushed back and washed into dark air ---- */
    const farRoot = assembleRoot(buildFarLimbs(), {
      aspect: FAR_ASPECT,
      haze: 0.16,
      /* 0.88 left about 15 percent of the lit rind showing, which on this dark
         page read as a solid brown mass rather than as distance. */
      fog: 0.96,
      /* 1.0: distant air lifts its darks all the way, so the ridge carries no
         silhouette of its own and only shifts the value of the air. */
      hazeLift: 1.0,
      blades: bladesFar,
      order: 0,
      mouse: uMouseFar,
      mouseR: 1.4,
    });
    scene.add(farRoot.group);

    /* ---- ambient motes: spores adrift, animated wholly from uTime ---- */
    const sprite = radialTexture(64, [
      [0, "rgba(255,246,228,1)"],
      [0.35, "rgba(228,178,98,0.55)"],
      [1, "rgba(228,178,98,0)"],
    ]);
    textures.push(sprite);

    const MOTES = small ? 1000 : 3000;
    const mpos = new Float32Array(MOTES * 3);
    const mseed = new Float32Array(MOTES * 4);
    for (let i = 0; i < MOTES; i++) {
      mpos[i * 3] = (rng() - 0.5) * 3400;
      mpos[i * 3 + 1] = (rng() - 0.5) * 1500;
      mpos[i * 3 + 2] = -380 + rng() * 1000;
      mseed[i * 4] = rng() * TAU; /* phase */
      mseed[i * 4 + 1] = 0.25 + rng() * 0.9; /* speed */
      mseed[i * 4 + 2] = 0.4 + rng() * 1.4; /* sway */
      /* power-law sizes: a few big soft ones, a great many specks */
      mseed[i * 4 + 3] = 0.7 + 1.05 * Math.pow(rng(), 2.2);
    }
    const moteGeo = new BufferGeometry();
    moteGeo.setAttribute("position", new BufferAttribute(mpos, 3));
    moteGeo.setAttribute("seed", new BufferAttribute(mseed, 4));
    geometries.push(moteGeo);
    const moteU = { uSize: { value: 9 }, uScale: { value: 440 } };
    const moteMat = new ShaderMaterial({
      uniforms: { uTime, uMap: { value: sprite }, uSize: moteU.uSize, uScale: moteU.uScale },
      vertexShader: MOTE_VERT,
      fragmentShader: MOTE_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: AdditiveBlending,
    });
    materials.push(moteMat);
    const motes = new Points(moteGeo, moteMat);
    motes.frustumCulled = false;
    motes.renderOrder = 6;
    scene.add(motes);

    /* ---- spore trail pool: four typed arrays behind a ring head ---- */
    const spos = new Float32Array(SPRAY_N * 3);
    const svel = new Float32Array(SPRAY_N * 3);
    const sbirth = new Float32Array(SPRAY_N);
    const srnd = new Float32Array(SPRAY_N * 2);
    sbirth.fill(-999);
    const sprayGeo = new BufferGeometry();
    const aPos = new BufferAttribute(spos, 3);
    const aVel = new BufferAttribute(svel, 3);
    const aBirth = new BufferAttribute(sbirth, 1);
    const aRnd = new BufferAttribute(srnd, 2);
    sprayGeo.setAttribute("position", aPos);
    sprayGeo.setAttribute("aVel", aVel);
    sprayGeo.setAttribute("aBirth", aBirth);
    sprayGeo.setAttribute("aRnd", aRnd);
    geometries.push(sprayGeo);
    const sprayU = { uSize: { value: 13 }, uScale: { value: 440 } };
    const sprayMat = new ShaderMaterial({
      uniforms: {
        uTime,
        uMap: { value: sprite },
        uSize: sprayU.uSize,
        uScale: sprayU.uScale,
        uLife: { value: SPRAY_LIFE },
      },
      vertexShader: SPRAY_VERT,
      fragmentShader: SPRAY_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });
    materials.push(sprayMat);
    const sprayPts = new Points(sprayGeo, sprayMat);
    sprayPts.frustumCulled = false;
    sprayPts.renderOrder = 7;
    scene.add(sprayPts);

    const c: Ctx = {
      renderer,
      scene,
      camera,
      near: nearRoot.group,
      far: farRoot.group,
      shells: [nearRoot.shell, farRoot.shell],
      uTime,
      uScanO,
      uScanR,
      uScanOn,
      uWire,
      uMouseNear,
      uMouseFar,
      moteU,
      sprayU,
      spray: {
        pos: spos,
        vel: svel,
        birth: sbirth,
        rnd: srnd,
        head: 0,
        idle: 0,
        dirty: false,
        attrs: { pos: aPos, vel: aVel, birth: aBirth, rnd: aRnd },
        last: new Vector3(AWAY, 0, 0),
        at: new Vector3(),
        step: new Vector3(),
      },
      cages: [],
      wireMat: null,
      scanMax: 2400,
      W: 1,
      H: 1,
    };
    ctx = c;
    layout(c);

    if (!pointer.reduced) {
      /* arm the pulse; the first visible frame starts it */
      uScanOn.value = 1;
      scanPending = true;
    }

    /* Paint once here rather than waiting on the loop, so a tab that gets
       no rAF still shows a composed hero when it is finally looked at.
       Under reduced motion this IS the one designed still. */
    if (!document.hidden) {
      pose(c, pointer);
      renderer.render(scene, camera);
      if (pointer.reduced) needStill = false;
    }
  }

  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(build);
  });

  /* ---- teardown ---- */
  const handle: StageHandle = {
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      detachFrame();
      io.disconnect();
      ro.disconnect();
      mountedHandles.delete(canvas);
      const c = ctx;
      ctx = null;
      if (!c) return;
      disposeCages(c);
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
      c.renderer.dispose();
    },
  };
  mountedHandles.set(canvas, handle);
  return handle;
}
