/**
 * Generador de plantillas extra para SDE Cabina (Halloween, Navidad, Neon,
 * Graduacion negro/oro).
 *
 * Es el gemelo en Node de tools/generar_plantillas.py: escribe lo mismo
 * (background.svg, overlay.svg, preview.svg, template.json + catalog.json)
 * pero se puede correr en la maquina de la cabina, que no tiene Python.
 * Estas 6 plantillas viven SOLO aqui; las demas siguen en el script .py.
 *
 * Uso:  node tools/generar_plantillas_extra.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 600;
const H = 1800;
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'templates',
);

const wrap = (body, w = W, h = H) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
  `viewBox="0 0 ${W} ${H}">\n${body}\n</svg>\n`;

const rad = (deg) => (deg * Math.PI) / 180;
const n1 = (v) => Number(v).toFixed(1);
const n2 = (v) => Number(v).toFixed(2);

/** PRNG determinista (mulberry32) para que cada corrida escriba lo mismo. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r, lo, hi) => lo + (hi - lo) * r();
const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];

// ---------------------------------------------------------------- utilidades
function sparkles(seed, colors, count = 180, rmin = 0.8, rmax = 3.2, ymin = 0, ymax = H,
                  opacity = [0.25, 0.9]) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const x = between(r, 0, W);
    const y = between(r, ymin, ymax);
    const rr = between(r, rmin, rmax);
    const c = pick(r, colors);
    const o = between(r, opacity[0], opacity[1]);
    out.push(`<circle cx="${n1(x)}" cy="${n1(y)}" r="${n2(rr)}" fill="${c}" opacity="${n2(o)}"/>`);
  }
  return `<g>${out.join('')}</g>`;
}

function stars4(seed, color, count = 40, ymin = 0, ymax = H, smin = 3, smax = 9, opacity = 0.9) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const x = between(r, 0, W);
    const y = between(r, ymin, ymax);
    const s = between(r, smin, smax);
    const o = between(r, opacity * 0.45, opacity);
    const d =
      `M0,${-s} C${n1(s * 0.18)},${n1(-s * 0.22)} ${n1(s * 0.22)},${n1(-s * 0.18)} ${s},0 ` +
      `C${n1(s * 0.22)},${n1(s * 0.18)} ${n1(s * 0.18)},${n1(s * 0.22)} 0,${s} ` +
      `C${n1(-s * 0.18)},${n1(s * 0.22)} ${n1(-s * 0.22)},${n1(s * 0.18)} ${-s},0 ` +
      `C${n1(-s * 0.22)},${n1(-s * 0.18)} ${n1(-s * 0.18)},${n1(-s * 0.22)} 0,${-s}Z`;
    out.push(`<path transform="translate(${n1(x)},${n1(y)})" d="${d}" fill="${color}" opacity="${n2(o)}"/>`);
  }
  return `<g>${out.join('')}</g>`;
}

const goldDefs = (p, c1 = '#F7E08A', c2 = '#D4AF37', c3 = '#9C7A16') =>
  `<linearGradient id="${p}gold" x1="0" y1="0" x2="1" y2="1">` +
  `<stop offset="0%" stop-color="${c1}"/><stop offset="45%" stop-color="${c2}"/>` +
  `<stop offset="100%" stop-color="${c3}"/></linearGradient>`;

function frameLines(rects, stroke, width = 1.5, opacity = 0.5, inset = -6) {
  const out = rects.map(([x, y, w, h]) =>
    `<rect x="${x + inset}" y="${y + inset}" width="${w - inset * 2}" height="${h - inset * 2}" ` +
    `fill="none" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}"/>`);
  return `<g>${out.join('')}</g>`;
}

/** Cajas grises con silueta recortada, para el preview. */
function photoBoxes(rects, stroke = null, sw = 4) {
  const tones = ['#E8E8E8', '#DCDCDC', '#D0D0D0'];
  const out = [];
  rects.forEach(([x, y, w, h], i) => {
    const cid = `pc${i}`;
    const cx = x + w / 2;
    out.push(`<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`);
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${tones[i % 3]}"/>`);
    out.push(`<g clip-path="url(#${cid})" fill="#C4C4C4">` +
      `<circle cx="${cx}" cy="${Math.round(y + h * 0.4)}" r="${Math.round(h * 0.13)}"/>` +
      `<ellipse cx="${cx}" cy="${Math.round(y + h * 1.02)}" rx="${Math.round(h * 0.27)}" ry="${Math.round(h * 0.24)}"/></g>`);
    if (stroke) {
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" ` +
        `stroke="${stroke}" stroke-width="${sw}"/>`);
    }
  });
  return `<g>${out.join('')}</g>`;
}

// ---------------------------------------------------------------- adornos
/** Banderines colgando de una cuerda curva. */
function bunting(x0, y0, x1, y1, sag, colors, n = 8, fw = 42, fh = 56, rope = '#6B4E2E', rw = 2.4) {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + sag;
  const out = [`<path d="M${x0},${y0} Q${mx},${my} ${x1},${y1}" stroke="${rope}" ` +
    `stroke-width="${rw}" fill="none" opacity="0.9"/>`];
  for (let i = 0; i < n; i += 1) {
    const t = (i + 0.5) / n;
    const px = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t ** 2 * x1;
    const py = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t ** 2 * y1;
    const dx = 2 * (1 - t) * (mx - x0) + 2 * t * (x1 - mx);
    const dy = 2 * (1 - t) * (my - y0) + 2 * t * (y1 - my);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    out.push(`<g transform="translate(${n1(px)},${n1(py)}) rotate(${n1(ang)})">` +
      `<path d="M${-fw / 2},0 L${fw / 2},0 L0,${fh} Z" fill="${colors[i % colors.length]}" opacity="0.95"/>` +
      `<path d="M${-fw / 2},0 L${fw / 2},0" stroke="#00000022" stroke-width="2"/></g>`);
  }
  return `<g>${out.join('')}</g>`;
}

/** Calabaza; face=true dibuja la cara tallada. */
function pumpkin(x, y, s, body = '#E8801F', mid = '#D06A12', dark = '#A94F09',
                 stem = '#5E7A2E', face = false) {
  const out = [
    `<ellipse cx="0" cy="0" rx="26" ry="22" fill="${body}"/>`,
    `<ellipse cx="-13" cy="0" rx="12" ry="21" fill="${mid}" opacity="0.85"/>`,
    `<ellipse cx="13" cy="0" rx="12" ry="21" fill="${mid}" opacity="0.85"/>`,
    `<ellipse cx="0" cy="0" rx="10" ry="22" fill="${body}"/>`,
    `<path d="M-2,-21 C-3,-30 -8,-33 -12,-35 C-6,-36 -1,-32 0,-24 ` +
    `C2,-31 7,-35 13,-34 C7,-31 3,-28 3,-21Z" fill="${stem}"/>`,
  ];
  if (face) {
    out.push(`<g fill="${dark}">` +
      '<path d="M-14,-6 L-5,-6 L-9.5,-13Z"/>' +
      '<path d="M14,-6 L5,-6 L9.5,-13Z"/>' +
      '<path d="M-15,4 L-9,9 L-4,4 L0,9 L4,4 L9,9 L15,4 C11,14 -11,14 -15,4Z"/></g>');
  }
  return `<g transform="translate(${x},${y}) scale(${s})">${out.join('')}</g>`;
}

const ghost = (x, y, s, fill = '#FFFFFF', eye = '#3A3350', op = 0.95, rot = 0) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" opacity="${op}">` +
  `<path d="M0,-26 C15,-26 24,-14 24,0 L24,22 L17,15 L10,23 L3,15 ` +
  `L-4,23 L-11,15 L-18,23 L-24,15 L-24,0 C-24,-14 -15,-26 0,-26Z" fill="${fill}"/>` +
  `<ellipse cx="-8" cy="-6" rx="3.4" ry="4.6" fill="${eye}"/>` +
  `<ellipse cx="8" cy="-6" rx="3.4" ry="4.6" fill="${eye}"/>` +
  `<ellipse cx="0" cy="5" rx="3.6" ry="4.4" fill="${eye}" opacity="0.8"/></g>`;

const bat = (x, y, s, fill = '#1A1622', rot = 0, op = 0.95) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" fill="${fill}" opacity="${op}">` +
  '<path d="M0,-3 C-5,-11 -13,-14 -20,-11 C-18,-8 -19,-4 -23,-2 ' +
  'C-16,-1 -12,3 -9,8 C-7,4 -4,2 0,2 C4,2 7,4 9,8 C12,3 16,-1 23,-2 ' +
  'C19,-4 18,-8 20,-11 C13,-14 5,-11 0,-3Z"/>' +
  '<ellipse cx="0" cy="-1" rx="4" ry="5.4"/>' +
  '<path d="M-3.6,-5.6 L-2,-9 L-0.4,-5.6Z"/>' +
  '<path d="M3.6,-5.6 L2,-9 L0.4,-5.6Z"/></g>';

function cobweb(x, y, s, stroke, rot = 0, w = 1.6, op = 0.6) {
  const arcs = [22, 40, 58, 76, 94]
    .map((r) => `<path d="M${r},0 A${r},${r} 0 0 1 0,${r}" fill="none"/>`).join('');
  const rays = [0, 22, 45, 68, 90]
    .map((a) => `<line x1="0" y1="0" x2="${n1(94 * Math.cos(rad(a)))}" y2="${n1(94 * Math.sin(rad(a)))}"/>`)
    .join('');
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" stroke="${stroke}" ` +
    `stroke-width="${w}" opacity="${op}" fill="none">${arcs}${rays}</g>`;
}

function spider(x, y, s, fill = '#1A1622', drop = 0, stroke = null) {
  const legs = [[-16, -2], [-18, 6], [-16, 14], [-12, 20], [16, -2], [18, 6], [16, 14], [12, 20]]
    .map(([dx, dy]) => `<path d="M0,0 C${Math.round(dx * 0.6)},-6 ${dx},${dy - 4} ${Math.round(dx * 1.15)},${dy}" fill="none"/>`)
    .join('');
  const line = drop
    ? `<line x1="0" y1="${-drop}" x2="0" y2="-10" stroke="${stroke || fill}" stroke-width="1.2" opacity="0.7"/>`
    : '';
  return `<g transform="translate(${x},${y}) scale(${s})">${line}` +
    `<g stroke="${fill}" stroke-width="2.2" stroke-linecap="round">${legs}</g>` +
    `<ellipse cx="0" cy="4" rx="10" ry="11" fill="${fill}"/>` +
    `<circle cx="0" cy="-7" r="6" fill="${fill}"/>` +
    '<circle cx="-2.4" cy="-8" r="1.5" fill="#F5F0C8"/>' +
    '<circle cx="2.4" cy="-8" r="1.5" fill="#F5F0C8"/></g>';
}

const candle = (x, y, s, wax = '#F2E6CE', wax2 = '#DCCBA8', flame = '#F5B93A') =>
  `<g transform="translate(${x},${y}) scale(${s})">` +
  `<rect x="-7" y="-26" width="14" height="34" rx="3" fill="${wax}"/>` +
  `<rect x="2" y="-26" width="5" height="34" rx="2" fill="${wax2}"/>` +
  `<path d="M-7,-24 C-4,-18 -3,-14 -6,-9 L-7,-9Z" fill="${wax2}" opacity="0.8"/>` +
  '<line x1="0" y1="-26" x2="0" y2="-31" stroke="#4A4038" stroke-width="1.6"/>' +
  `<path d="M0,-46 C6,-38 5,-31 0,-31 C-5,-31 -6,-38 0,-46Z" fill="${flame}"/>` +
  '<path d="M0,-40 C2.6,-36 2.2,-32 0,-32 C-2.2,-32 -2.6,-36 0,-40Z" fill="#FFF3C4"/></g>';

function holly(x, y, s, leaf1 = '#2E6B3A', leaf2 = '#3F8A4B', berry = '#C0272D', rot = 0) {
  const lf = 'M0,0 C10,-9 22,-7 26,0 C22,3 24,9 20,12 C16,9 10,13 6,10 C3,13 -2,10 0,0Z';
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">` +
    `<path d="${lf}" fill="${leaf1}" transform="rotate(-24)"/>` +
    `<path d="${lf}" fill="${leaf2}" transform="rotate(26)"/>` +
    `<circle cx="-4" cy="2" r="4.4" fill="${berry}"/>` +
    '<circle cx="3" cy="6" r="3.8" fill="#D9403F"/>' +
    `<circle cx="-1" cy="10" r="3.4" fill="${berry}"/></g>`;
}

const bauble = (x, y, s, fill, shine = '#FFFFFF', cap = '#C9A227') =>
  `<g transform="translate(${x},${y}) scale(${s})">` +
  `<line x1="0" y1="-30" x2="0" y2="-16" stroke="${cap}" stroke-width="1.4" opacity="0.8"/>` +
  `<rect x="-4" y="-18" width="8" height="6" rx="1.6" fill="${cap}"/>` +
  `<circle cx="0" cy="0" r="13" fill="${fill}"/>` +
  '<path d="M-13,-2 C-6,4 6,4 13,-2" stroke="#FFFFFF" stroke-width="1.6" fill="none" opacity="0.45"/>' +
  `<ellipse cx="-4.6" cy="-5" rx="3.2" ry="4.4" fill="${shine}" opacity="0.5" ` +
  'transform="rotate(-25 -4.6 -5)"/></g>';

function xmasTree(x, y, s, dark = '#1E5B32', mid = '#2E7A42', light = '#3F9455',
                  trunk = '#7A5230', star = '#E8C24A') {
  const out = [
    `<rect x="-9" y="52" width="18" height="26" rx="3" fill="${trunk}"/>`,
    `<path d="M0,-72 L40,-16 L-40,-16Z" fill="${light}"/>`,
    `<path d="M0,-40 L52,22 L-52,22Z" fill="${mid}"/>`,
    `<path d="M0,-6 L64,58 L-64,58Z" fill="${dark}"/>`,
    `<path d="M0,-84 l6,13 14,2 -10,10 3,14 -13,-7 -13,7 3,-14 -10,-10 14,-2Z" fill="${star}"/>`,
  ];
  const baubles = [[-18, -22, '#D2413F'], [16, -6, '#E8C24A'], [-26, 14, '#E8C24A'],
    [24, 30, '#D2413F'], [-6, 40, '#C9D6E8'], [38, 48, '#D2413F']];
  baubles.forEach(([bx, by, c]) => {
    out.push(`<circle cx="${bx}" cy="${by}" r="5.4" fill="${c}"/>`);
    out.push(`<circle cx="${bx - 1.6}" cy="${by - 1.8}" r="1.5" fill="#FFFFFF" opacity="0.6"/>`);
  });
  return `<g transform="translate(${x},${y}) scale(${s})">${out.join('')}</g>`;
}

function snowflake(x, y, s, color = '#FFFFFF', op = 0.8, rot = 0) {
  const arm = '<line x1="0" y1="0" x2="0" y2="-16"/>' +
    '<line x1="0" y1="-9" x2="-5" y2="-14"/>' +
    '<line x1="0" y1="-9" x2="5" y2="-14"/>';
  let arms = '';
  for (let a = 0; a < 360; a += 60) arms += `<g transform="rotate(${a})">${arm}</g>`;
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})" stroke="${color}" ` +
    `stroke-width="1.6" stroke-linecap="round" opacity="${op}">${arms}</g>`;
}

function snowfall(seed, count = 170, color = '#FFFFFF', ymin = 0, ymax = H) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const x = between(r, 0, W);
    const y = between(r, ymin, ymax);
    const rr = between(r, 1.0, 3.4);
    const o = between(r, 0.25, 0.8);
    out.push(`<circle cx="${n1(x)}" cy="${n1(y)}" r="${n2(rr)}" fill="${color}" opacity="${n2(o)}"/>`);
  }
  return `<g>${out.join('')}</g>`;
}

const gift = (x, y, s, box = '#C0272D', ribbon = '#E8C24A', rot = 0) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">` +
  `<rect x="-24" y="-16" width="48" height="34" rx="2" fill="${box}"/>` +
  `<rect x="-27" y="-24" width="54" height="10" rx="2" fill="${box}" opacity="0.85"/>` +
  `<rect x="-5" y="-24" width="10" height="42" fill="${ribbon}"/>` +
  `<rect x="-27" y="-6" width="54" height="7" fill="${ribbon}" opacity="0.9"/>` +
  `<path d="M0,-24 C-14,-30 -18,-40 -8,-40 C-2,-40 0,-30 0,-24 ` +
  `C0,-30 2,-40 8,-40 C18,-40 14,-30 0,-24Z" fill="${ribbon}"/></g>`;

const scrollDiploma = (x, y, s, paper = '#F3E4BE', shade = '#DCC492', ribbon = '#C0272D', rot = 0) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">` +
  `<rect x="-34" y="-11" width="68" height="22" rx="4" fill="${paper}"/>` +
  `<rect x="-34" y="-11" width="68" height="6" rx="3" fill="${shade}" opacity="0.55"/>` +
  `<ellipse cx="-34" cy="0" rx="6" ry="12" fill="${shade}"/>` +
  `<ellipse cx="34" cy="0" rx="6" ry="12" fill="${shade}"/>` +
  `<rect x="-5" y="-13" width="10" height="26" rx="2" fill="${ribbon}"/>` +
  `<path d="M0,10 L-8,22 L-1,20 L2,26 L8,16Z" fill="${ribbon}" opacity="0.9"/></g>`;

const gradCap = (x, y, s, gold, dark) =>
  `<g transform="translate(${x},${y}) scale(${s})">` +
  `<path d="M0,-16 L52,2 L0,20 L-52,2Z" fill="${gold}"/>` +
  `<path d="M-30,9 L-30,30 C-30,40 30,40 30,30 L30,9 L0,22Z" fill="${dark}"/>` +
  `<path d="M52,2 L52,34" stroke="${gold}" stroke-width="2.6" fill="none"/>` +
  `<circle cx="52" cy="38" r="5" fill="${gold}"/>` +
  `<path d="M52,42 L48,58 M52,42 L52,60 M52,42 L56,58" stroke="${gold}" stroke-width="2"/></g>`;

/** Birrete de linea (line art) con borla colgante, como el de la referencia. */
function gradCapOutline(x, y, s, gold, sw = 3) {
  const flecos = [-8, -4, 0, 4, 8]
    .map((dx) => `<path d="M${dx * 0.35},8 L${dx},26"/>`).join('');
  return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${gold}" ` +
    `stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">` +
    // tabla del birrete
    '<path d="M0,-20 L60,4 L0,28 L-60,4Z"/>' +
    // copa
    '<path d="M-31,14 L-31,36 C-31,49 31,49 31,36 L31,14"/>' +
    // boton central
    `<circle cx="0" cy="4" r="3.4" fill="${gold}"/>` +
    // cordon y borla
    '<path d="M60,4 C62,14 60,22 58,28"/>' +
    `<g transform="translate(58,28)"><circle cx="0" cy="4" r="4.4" fill="${gold}" stroke="none"/>` +
    `<g stroke-width="${sw * 0.72}">${flecos}</g></g></g>`;
}

/** Trazo curvo doble tipo destello, para acompañar un titulo. */
function swash(x, y, s, gold, flip = 1, sw = 2.4) {
  return `<g transform="translate(${x},${y}) scale(${flip * s},${s})" fill="none" ` +
    `stroke="${gold}" stroke-width="${sw}" stroke-linecap="round">` +
    '<path d="M0,0 C14,-10 30,-11 44,-6"/>' +
    '<path d="M4,12 C16,5 28,4 38,7"/></g>';
}

const neonDefs = (p, blur = 6) =>
  `<filter id="${p}glow" x="-70%" y="-70%" width="240%" height="240%">` +
  `<feGaussianBlur stdDeviation="${blur}" result="b1"/>` +
  `<feGaussianBlur stdDeviation="${Math.round(blur * 2.4)}" result="b2"/>` +
  '<feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="b1"/>' +
  '<feMergeNode in="SourceGraphic"/></feMerge></filter>';

const neonStar = (x, y, s, color, sw = 2.6) =>
  `<g transform="translate(${x},${y}) scale(${s})" stroke="${color}" stroke-width="${sw}" ` +
  'fill="none" stroke-linecap="round">' +
  '<path d="M0,-12 L0,12 M-12,0 L12,0 M-8,-8 L8,8 M8,-8 L-8,8"/></g>';

function confetti(seed, colors, count = 90, ymin = 0, ymax = H, op = [0.5, 1.0]) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const x = between(r, 0, W);
    const y = between(r, ymin, ymax);
    const w = between(r, 4, 11);
    const h = between(r, 3, 6);
    const a = between(r, 0, 360);
    const c = pick(r, colors);
    const o = between(r, op[0], op[1]);
    out.push(`<rect x="${n1(-w / 2)}" y="${n1(-h / 2)}" width="${n1(w)}" height="${n1(h)}" rx="1.4" ` +
      `fill="${c}" opacity="${n2(o)}" transform="translate(${n1(x)},${n1(y)}) rotate(${Math.round(a)})"/>`);
  }
  return `<g>${out.join('')}</g>`;
}

// ================================================================ LAYOUTS
const LAY_A = [[45, 150, 510, 352], [45, 522, 510, 352], [45, 894, 510, 352]];

const TEMPLATES = [];
const add = (t) => TEMPLATES.push(t);

// ---------------------------------------------------------------- GRADUACION 002
// Paleta pedida por el cliente: bronce rosado en vez del dorado clásico.
const GRAD_BASE = '#A78466';
const GRAD_CLARO = '#D3B79C';
const GRAD_OSCURO = '#6F5540';
const GRAD_TEXTO = '#C4A183';

const grad002Bg = (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#141414"/><stop offset="50%" stop-color="#0A0A0A"/>
      <stop offset="100%" stop-color="#121212"/>
    </linearGradient>
    ${goldDefs(p, GRAD_CLARO, GRAD_BASE, GRAD_OSCURO)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${p}bg)"/>
  ${sparkles(9101, [GRAD_BASE, GRAD_CLARO], 90, 0.6, 2.0, 0, H, [0.12, 0.45])}`;

const grad002Ov = (p) => {
  const rays = [[140, 96, -26, 14], [150, 128, -30, 4], [162, 62, -20, 22],
    [460, 96, 26, 14], [450, 128, 30, 4], [438, 62, 20, 22]]
    .map(([x, y1, dx, dy]) => `<line x1="${x}" y1="${y1}" x2="${x + dx}" y2="${y1 - dy}"/>`).join('');
  return `
  <defs>${goldDefs(p, GRAD_CLARO, GRAD_BASE, GRAD_OSCURO)}</defs>
  ${frameLines(LAY_A, `url(#${p}gold)`, 2.2, 0.9, -10)}
  ${gradCapOutline(300, 58, 1.1, `url(#${p}gold)`, 3)}
  <g stroke="url(#${p}gold)" stroke-width="3" stroke-linecap="round" opacity="0.85">${rays}</g>
  <g opacity="0.9">
    ${swash(60, 1392, 0.8, `url(#${p}gold)`, 1)}
    ${swash(540, 1392, 0.8, `url(#${p}gold)`, -1)}
  </g>
  <g fill="url(#${p}gold)" opacity="0.8">
    <circle cx="84" cy="1376" r="3.4"/><circle cx="112" cy="1424" r="2.4"/>
    <circle cx="74" cy="1462" r="2.8"/><circle cx="136" cy="1358" r="2"/>
    <circle cx="516" cy="1376" r="3.4"/><circle cx="488" cy="1424" r="2.4"/>
    <circle cx="526" cy="1462" r="2.8"/><circle cx="464" cy="1358" r="2"/>
  </g>
  <g stroke="${GRAD_TEXTO}" stroke-width="2.6" stroke-linecap="round">
    <line x1="150" y1="1522" x2="266" y2="1522"/>
    <line x1="334" y1="1522" x2="450" y2="1522"/>
  </g>
  ${gradCap(300, 1518, 0.42, `url(#${p}gold)`, '#0A0A0A')}
  ${scrollDiploma(486, 1706, 1.25, '#E7D6C4', GRAD_BASE, GRAD_BASE, -22)}
  <g fill="url(#${p}gold)" opacity="0.75">
    <circle cx="96" cy="1668" r="4"/><circle cx="122" cy="1700" r="2.6"/>
    <circle cx="88" cy="1716" r="3"/><circle cx="140" cy="1662" r="2.2"/>
  </g>`;
};

add({
  id: 'graduacion_002',
  category: 'graduacion',
  name: 'Graduación — Negro y Bronce',
  description: "Negro elegante en bronce rosado, con birrete de línea, 'Graduación' en script, el nombre del graduado y diploma",
  rects: LAY_A,
  bg: grad002Bg,
  ov: grad002Ov,
  photo: { radius: 0, border: GRAD_BASE, borderWidth: 5 },
  previewStroke: GRAD_BASE,
  logo: { x: 300, y: 1766, width: 104, height: 32 },
  texts: [
    // arriba el título en script (editable desde "Etiqueta del evento"; si se
    // deja vacío dice Graduación) y bajo el separador el nombre del graduado
    { binding: 'eventLabel', text: 'Graduación', x: 300, y: 1400,
      font: "'Dancing Script', cursive", size: 78, color: GRAD_TEXTO,
      align: 'center', weight: 'bold', maxWidth: 460 },
    { binding: 'subtitleText', text: '', x: 300, y: 1600,
      font: "'Playfair Display', Georgia, serif", size: 28, color: GRAD_TEXTO,
      align: 'center', weight: 'bold', letterSpacing: 5, maxWidth: 450 },
    { binding: 'footerText', text: '', x: 300, y: 1652,
      font: 'Manrope, Arial, sans-serif', size: 15, color: GRAD_BASE,
      align: 'center', maxWidth: 420 },
    { binding: 'date', x: 300, y: 1694,
      font: "'Playfair Display', Georgia, serif", size: 19, color: GRAD_BASE, align: 'center' },
    { binding: 'footerPhone', text: '', x: 300, y: 1730,
      font: 'Manrope, Arial, sans-serif', size: 13, color: GRAD_OSCURO, align: 'center',
      maxWidth: 300 },
  ],
});

// ---------------------------------------------------------------- HALLOWEEN 001
const hall001Bg = (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#2B1233"/><stop offset="45%" stop-color="#1A0C22"/>
      <stop offset="100%" stop-color="#2E1418"/>
    </linearGradient>
    <radialGradient id="${p}moon" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#FFF4CE"/><stop offset="70%" stop-color="#F2D98A"/>
      <stop offset="100%" stop-color="#E8C46A"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${p}bg)"/>
  <circle cx="470" cy="132" r="66" fill="url(#${p}moon)" opacity="0.28"/>
  ${sparkles(9201, ['#F2A93B', '#F5D98A', '#B06CD6'], 160, 0.6, 2.4, 0, H, [0.15, 0.6])}
  ${stars4(9202, '#F5D98A', 22, 0, H, 3, 8, 0.5)}`;

const hall001Ov = () => `
  ${cobweb(0, 0, 1.05, '#C9B7D6', 0, 1.5, 0.45)}
  ${cobweb(600, 0, 1.05, '#C9B7D6', 90, 1.5, 0.45)}
  ${frameLines(LAY_A, '#F2A93B', 2.0, 0.75, -10)}
  ${bat(96, 122, 1.5, '#0E0713', -12)}
  ${bat(150, 88, 1.0, '#0E0713', 10, 0.85)}
  ${bat(200, 132, 0.8, '#0E0713', -6, 0.7)}
  ${spider(524, 122, 0.95, '#0E0713', 108, '#C9B7D6')}
  ${bat(64, 1288, 1.2, '#0E0713', 8, 0.9)}
  ${bat(536, 1288, 1.0, '#0E0713', -14, 0.9)}
  <g stroke="#F2A93B" stroke-width="1.4" opacity="0.85">
    <line x1="168" y1="1560" x2="256" y2="1560"/>
    <line x1="344" y1="1560" x2="432" y2="1560"/>
  </g>
  ${bat(300, 1560, 0.7, '#F2A93B')}
  ${pumpkin(76, 1730, 1.55, '#E8801F', '#D06A12', '#5A2A06', '#5E7A2E', true)}
  ${pumpkin(158, 1754, 1.05, '#F09A34', '#DA7C18', '#5A2A06', '#5E7A2E', true)}
  ${pumpkin(524, 1730, 1.55, '#E8801F', '#D06A12', '#5A2A06', '#5E7A2E', true)}
  ${pumpkin(442, 1754, 1.05, '#F09A34', '#DA7C18', '#5A2A06', '#5E7A2E', true)}
  ${candle(230, 1756, 0.9, '#F2E6CE', '#D8C4A0', '#F2A93B')}
  ${candle(370, 1756, 0.9, '#F2E6CE', '#D8C4A0', '#F2A93B')}
  ${ghost(300, 1756, 0.95, '#F4F0FA', '#2B1233', 0.92)}`;

add({
  id: 'halloween_001',
  category: 'halloween',
  name: 'Halloween — Noche de Calabazas',
  description: 'Morado noche con luna, murciélagos, telarañas y calabazas talladas',
  rects: LAY_A,
  bg: hall001Bg,
  ov: hall001Ov,
  photo: { radius: 0, border: '#F2A93B', borderWidth: 5 },
  previewStroke: '#F2A93B',
  logo: { x: 300, y: 64, width: 112, height: 40 },
  texts: [
    { binding: 'subtitleText', text: 'Halloween', x: 300, y: 1400,
      font: "'Dancing Script', cursive", size: 74, color: '#F2A93B',
      align: 'center', weight: 'bold', maxWidth: 470 },
    { binding: 'eventLabel', text: 'DULCE O TRUCO', x: 300, y: 1492,
      font: 'Manrope, Arial, sans-serif', size: 25, color: '#E6D6F2',
      align: 'center', weight: 'bold', letterSpacing: 7, maxWidth: 450 },
    { binding: 'date', x: 300, y: 1600,
      font: "'Playfair Display', Georgia, serif", size: 20, color: '#C9B7D6', align: 'center' },
    { binding: 'footerText', text: '', x: 300, y: 1638,
      font: 'Manrope, Arial, sans-serif', size: 14, color: '#C9B7D6', align: 'center' },
    { binding: 'footerPhone', text: '', x: 300, y: 1668,
      font: 'Manrope, Arial, sans-serif', size: 13, color: '#A995B8', align: 'center' },
  ],
});

// ---------------------------------------------------------------- HALLOWEEN 002
const hall002Bg = (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#FFFDF9"/><stop offset="50%" stop-color="#FBF3EA"/>
      <stop offset="100%" stop-color="#F6E9DC"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${p}bg)"/>
  ${sparkles(9301, ['#E8CDB4', '#D8C2E0', '#F0D9C4'], 130, 0.8, 2.6, 0, H, [0.2, 0.5])}`;

const hall002Ov = () => `
  ${cobweb(0, 4, 0.85, '#D9C3AE', 0, 1.4, 0.55)}
  ${cobweb(600, 4, 0.85, '#D9C3AE', 90, 1.4, 0.55)}
  ${bunting(-20, 74, 620, 74, 40, ['#F2CBA8', '#D9C2E8', '#F5DFC7', '#C9B3DE', '#F0BE9A'], 10, 44, 58, '#C6A98E', 2.2)}
  ${frameLines(LAY_A, '#D9A87F', 1.8, 0.8, -10)}
  ${bat(212, 1290, 0.75, '#B79B86', -10, 0.75)}
  ${bat(250, 1258, 0.55, '#B79B86', 12, 0.6)}
  ${bat(384, 1288, 0.65, '#B79B86', 8, 0.7)}
  ${spider(500, 128, 0.8, '#8A7360', 96, '#C7B2A0')}
  <g stroke="#D9A87F" stroke-width="1.4" opacity="0.85">
    <line x1="168" y1="1524" x2="256" y2="1524"/>
    <line x1="344" y1="1524" x2="432" y2="1524"/>
  </g>
  ${ghost(300, 1524, 0.62, '#FFFFFF', '#B08A6A', 1)}
  ${ghost(246, 1722, 1.28, '#FFFFFF', '#C08E68', 0.98, -6)}
  ${pumpkin(360, 1724, 1.5, '#F7C9A4', '#EDB489', '#C98A5E', '#B9C79A', true)}
  ${pumpkin(452, 1748, 1.0, '#FADCC2', '#F0C6A4', '#C98A5E', '#B9C79A', true)}
  ${pumpkin(140, 1748, 1.1, '#FADCC2', '#F0C6A4', '#C98A5E', '#B9C79A', true)}
  ${candle(72, 1730, 0.9, '#FFFFFF', '#EFE0CE', '#F2C05A')}
  ${candle(528, 1730, 0.9, '#FFFFFF', '#EFE0CE', '#F2C05A')}`;

add({
  id: 'halloween_002',
  category: 'halloween',
  name: 'Halloween — Pastel Fantasmas',
  description: 'Fondo claro con banderines pastel, telarañas suaves, fantasmas y calabazas',
  rects: LAY_A,
  bg: hall002Bg,
  ov: hall002Ov,
  photo: { radius: 0, border: '#D9A87F', borderWidth: 5 },
  previewStroke: '#D9A87F',
  logo: { x: 300, y: 34, width: 110, height: 34 },
  texts: [
    { binding: 'subtitleText', text: 'Halloween Party', x: 300, y: 1392,
      font: "'Dancing Script', cursive", size: 66, color: '#B5764A',
      align: 'center', weight: 'bold', maxWidth: 470 },
    { binding: 'eventLabel', text: 'RECUERDO DE HALLOWEEN', x: 300, y: 1466,
      font: 'Manrope, Arial, sans-serif', size: 21, color: '#8A7360',
      align: 'center', weight: 'bold', letterSpacing: 5, maxWidth: 460 },
    { binding: 'date', x: 300, y: 1580,
      font: "'Playfair Display', Georgia, serif", size: 20, color: '#A88B72', align: 'center' },
    { binding: 'footerText', text: '', x: 300, y: 1620,
      font: 'Manrope, Arial, sans-serif', size: 14, color: '#A88B72', align: 'center' },
    { binding: 'footerPhone', text: '', x: 300, y: 1654,
      font: 'Manrope, Arial, sans-serif', size: 13, color: '#B79B86', align: 'center' },
  ],
});

// ---------------------------------------------------------------- NAVIDAD 001
const nav001Bg = (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="#FDF6E3"/><stop offset="50%" stop-color="#F7EDD6"/>
      <stop offset="100%" stop-color="#F1E4C9"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${p}bg)"/>
  ${sparkles(9401, ['#D2413F', '#2E6B3A', '#E8C24A'], 110, 0.8, 2.4, 0, H, [0.12, 0.4])}`;

const nav001Ov = () => `
  ${bunting(-20, 70, 620, 70, 42, ['#C0272D', '#2E6B3A', '#E8C24A', '#D2413F', '#3F8A4B'], 10, 44, 58, '#8A6A3A', 2.4)}
  ${frameLines(LAY_A, '#2E6B3A', 3.0, 0.85, -10)}
  ${frameLines(LAY_A, '#C0272D', 1.4, 0.8, -16)}
  ${holly(70, 148, 1.15, '#2E6B3A', '#3F8A4B', '#C0272D', -18)}
  ${holly(530, 148, 1.15, '#2E6B3A', '#3F8A4B', '#C0272D', 198)}
  ${holly(70, 1272, 1.0, '#2E6B3A', '#3F8A4B', '#C0272D', 24)}
  ${holly(530, 1272, 1.0, '#2E6B3A', '#3F8A4B', '#C0272D', 156)}
  <g stroke="#C0272D" stroke-width="1.6" opacity="0.85">
    <line x1="164" y1="1548" x2="252" y2="1548"/>
    <line x1="348" y1="1548" x2="436" y2="1548"/>
  </g>
  ${holly(300, 1544, 0.55, '#2E6B3A', '#3F8A4B', '#C0272D', 0)}
  ${xmasTree(300, 1716, 0.92)}
  ${gift(84, 1748, 1.15, '#C0272D', '#E8C24A', -6)}
  ${gift(516, 1748, 1.15, '#2E6B3A', '#E8C24A', 6)}
  ${bauble(176, 1704, 1.15, '#D2413F')}
  ${bauble(424, 1704, 1.15, '#E8C24A')}
  ${snowflake(44, 1620, 1.3, '#C0272D', 0.55)}
  ${snowflake(556, 1620, 1.3, '#2E6B3A', 0.55)}`;

add({
  id: 'navidad_001',
  category: 'navidad',
  name: 'Navidad — Clásica Rojo y Verde',
  description: 'Papel crema con banderines, acebo, esferas, árbol y regalos',
  rects: LAY_A,
  bg: nav001Bg,
  ov: nav001Ov,
  photo: { radius: 0, border: '#2E6B3A', borderWidth: 6 },
  previewStroke: '#2E6B3A',
  logo: { x: 300, y: 32, width: 110, height: 32 },
  texts: [
    { binding: 'subtitleText', text: 'Feliz Navidad', x: 300, y: 1398,
      font: "'Dancing Script', cursive", size: 70, color: '#C0272D',
      align: 'center', weight: 'bold', maxWidth: 470 },
    { binding: 'eventLabel', text: 'CHRISTMAS PARTY', x: 300, y: 1478,
      font: 'Manrope, Arial, sans-serif', size: 24, color: '#2E6B3A',
      align: 'center', weight: 'bold', letterSpacing: 6, maxWidth: 450 },
    { binding: 'date', x: 300, y: 1520,
      font: "'Playfair Display', Georgia, serif", size: 20, color: '#8A6A3A', align: 'center' },
    { binding: 'footerText', text: '', x: 300, y: 1584,
      font: 'Manrope, Arial, sans-serif', size: 14, color: '#7A5E36', align: 'center' },
    { binding: 'footerPhone', text: '', x: 300, y: 1618,
      font: 'Manrope, Arial, sans-serif', size: 13, color: '#8A6A3A', align: 'center' },
  ],
});

// ---------------------------------------------------------------- NAVIDAD 002
const nav002Bg = (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0%" stop-color="#0F2A4A"/><stop offset="45%" stop-color="#0A1E38"/>
      <stop offset="100%" stop-color="#12304F"/>
    </linearGradient>
    ${goldDefs(p, '#F6E4A8', '#D8B44A', '#9A7A1E')}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${p}bg)"/>
  ${snowfall(9501, 200, '#FFFFFF')}
  ${stars4(9502, '#F6E4A8', 26, 0, 900, 3, 9, 0.7)}
  <g fill="none" stroke="url(#${p}gold)" stroke-width="1" opacity="0.35">
    <rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="6"/>
  </g>`;

const nav002Ov = (p) => `
  <defs>${goldDefs(p, '#F6E4A8', '#D8B44A', '#9A7A1E')}</defs>
  ${frameLines(LAY_A, `url(#${p}gold)`, 2.0, 0.85, -10)}
  ${snowflake(60, 118, 2.0, '#EAF2FF', 0.85)}
  ${snowflake(300, 88, 1.5, '#F6E4A8', 0.7, 18)}
  ${snowflake(540, 118, 2.0, '#EAF2FF', 0.85, 24)}
  ${snowflake(52, 1300, 1.5, '#EAF2FF', 0.7)}
  ${snowflake(548, 1300, 1.5, '#EAF2FF', 0.7, 30)}
  <g stroke="url(#${p}gold)" stroke-width="1.4" opacity="0.9">
    <line x1="168" y1="1544" x2="256" y2="1544"/>
    <line x1="344" y1="1544" x2="432" y2="1544"/>
  </g>
  ${snowflake(300, 1544, 0.9, '#F6E4A8', 0.95)}
  ${xmasTree(300, 1706, 0.85, '#123D28', '#1B5636', '#246B44', '#5C3F26', '#F6E4A8')}
  ${bauble(150, 1690, 1.2, '#C0272D', '#FFFFFF', '#D8B44A')}
  ${bauble(200, 1730, 0.9, '#D8B44A', '#FFFFFF', '#D8B44A')}
  ${bauble(450, 1690, 1.2, '#1B5636', '#FFFFFF', '#D8B44A')}
  ${bauble(400, 1730, 0.9, '#C0272D', '#FFFFFF', '#D8B44A')}
  ${gift(70, 1750, 1.1, '#C0272D', '#D8B44A', -5)}
  ${gift(530, 1750, 1.1, '#1B5636', '#D8B44A', 5)}`;

add({
  id: 'navidad_002',
  category: 'navidad',
  name: 'Navidad — Noche Nevada',
  description: 'Azul noche con nieve, copos, esferas y árbol iluminado en dorado',
  rects: LAY_A,
  bg: nav002Bg,
  ov: nav002Ov,
  photo: { radius: 4, border: '#D8B44A', borderWidth: 4 },
  previewStroke: '#D8B44A',
  logo: { x: 300, y: 64, width: 116, height: 40 },
  texts: [
    { binding: 'subtitleText', text: 'Feliz Navidad', x: 300, y: 1400,
      font: "'Dancing Script', cursive", size: 72, color: '#F6E4A8',
      align: 'center', weight: 'bold', maxWidth: 470 },
    { binding: 'eventLabel', text: 'NOCHEBUENA', x: 300, y: 1480,
      font: "'Playfair Display', Georgia, serif", size: 26, color: '#EAF2FF',
      align: 'center', weight: 'bold', letterSpacing: 8, maxWidth: 450 },
    { binding: 'date', x: 300, y: 1518,
      font: "'Playfair Display', Georgia, serif", size: 20, color: '#B9CBE4', align: 'center' },
    { binding: 'footerText', text: '', x: 300, y: 1584,
      font: 'Manrope, Arial, sans-serif', size: 14, color: '#A8BCD8', align: 'center' },
    { binding: 'footerPhone', text: '', x: 300, y: 1620,
      font: 'Manrope, Arial, sans-serif', size: 13, color: '#A8BCD8', align: 'center' },
  ],
});

// ---------------------------------------------------------------- NEON 001
const neon001Bg = (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#12021F"/><stop offset="50%" stop-color="#080110"/>
      <stop offset="100%" stop-color="#16021C"/>
    </linearGradient>
    <linearGradient id="${p}nl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF3FB4"/><stop offset="40%" stop-color="#9B5CFF"/>
      <stop offset="70%" stop-color="#31E6FF"/><stop offset="100%" stop-color="#4BFF9A"/>
    </linearGradient>
    ${neonDefs(p, 7)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${p}bg)"/>
  <g filter="url(#${p}glow)" opacity="0.55">
    <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="26" fill="none"
          stroke="url(#${p}nl)" stroke-width="7"/>
  </g>
  ${sparkles(9601, ['#FF3FB4', '#31E6FF', '#9B5CFF', '#4BFF9A', '#FFFFFF'], 220, 0.7, 2.8, 0, H, [0.3, 0.95])}
  ${confetti(9602, ['#FF3FB4', '#31E6FF', '#9B5CFF', '#4BFF9A', '#FFE24B'], 70, 0, H, [0.35, 0.85])}`;

const neon001Ov = (p) => `
  <defs>
    <linearGradient id="${p}nl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF3FB4"/><stop offset="40%" stop-color="#9B5CFF"/>
      <stop offset="70%" stop-color="#31E6FF"/><stop offset="100%" stop-color="#4BFF9A"/>
    </linearGradient>
    ${neonDefs(p, 6)}
  </defs>
  <g filter="url(#${p}glow)">
    ${frameLines(LAY_A, '#31E6FF', 3.2, 0.95, -10)}
  </g>
  <g filter="url(#${p}glow)" opacity="0.95">
    ${neonStar(70, 118, 1.5, '#FF3FB4')}
    ${neonStar(530, 118, 1.2, '#31E6FF')}
    ${neonStar(300, 1296, 1.0, '#4BFF9A')}
    ${neonStar(66, 1620, 1.3, '#9B5CFF')}
    ${neonStar(534, 1620, 1.3, '#FFE24B')}
  </g>
  <g filter="url(#${p}glow)" opacity="0.9">
    <path d="M120,1540 L480,1540" stroke="url(#${p}nl)" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M150,1372 L450,1372" stroke="url(#${p}nl)" stroke-width="2.4" stroke-linecap="round" opacity="0.7"/>
  </g>
  <g filter="url(#${p}glow)" opacity="0.85">
    <path d="M52,1720 C92,1690 124,1748 164,1712" stroke="#FF3FB4" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M436,1712 C476,1748 508,1690 548,1720" stroke="#31E6FF" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>`;

add({
  id: 'neon_001',
  category: 'neon',
  name: 'Fiesta Neón — Glow Party',
  description: 'Negro con marcos neón, destellos y confeti fluorescente',
  rects: LAY_A,
  bg: neon001Bg,
  ov: neon001Ov,
  photo: { radius: 6, border: '#31E6FF', borderWidth: 4 },
  previewStroke: '#31E6FF',
  logo: { x: 300, y: 64, width: 120, height: 42 },
  texts: [
    { binding: 'subtitleText', text: 'Neon Party', x: 300, y: 1440,
      font: "'Dancing Script', cursive", size: 76, color: '#FF6BC9',
      align: 'center', weight: 'bold', maxWidth: 470, shadow: true },
    { binding: 'eventLabel', text: 'GLOW & DANCE', x: 300, y: 1600,
      font: 'Manrope, Arial, sans-serif', size: 25, color: '#5BEBFF',
      align: 'center', weight: 'bold', letterSpacing: 8, maxWidth: 450, shadow: true },
    { binding: 'date', x: 300, y: 1656,
      font: 'Manrope, Arial, sans-serif', size: 20, color: '#B98CFF', align: 'center' },
    { binding: 'footerText', text: '', x: 300, y: 1700,
      font: 'Manrope, Arial, sans-serif', size: 14, color: '#8FE3C4', align: 'center' },
    { binding: 'footerPhone', text: '', x: 300, y: 1734,
      font: 'Manrope, Arial, sans-serif', size: 13, color: '#9EA8D8', align: 'center' },
  ],
});

// ================================================================ ESCRITURA
const PREVIEW_SAMPLE = {
  subtitleText: 'Nombre',
  eventLabel: 'EVENTO',
  headerText: 'EVENTO',
  date: '15 mar 2026',
  footerText: '',
  footerHashtag: '',
  footerPhone: '',
};

function previewTextNodes(texts) {
  const out = [];
  for (const t of texts) {
    let label = t.text || PREVIEW_SAMPLE[t.binding] || '';
    if (t.binding === 'date') label = PREVIEW_SAMPLE.date;
    if (!label) continue;
    label = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const anchor = { center: 'middle', right: 'end', left: 'start' }[t.align || 'left'] || 'start';
    const font = (t.font || 'serif').replace(/"/g, "'");
    const ls = t.letterSpacing ? ` letter-spacing="${t.letterSpacing}"` : '';
    const weight = t.weight === 'bold' ? ' font-weight="bold"' : '';
    const size = t.size || 24;
    out.push(`<text x="${t.x}" y="${Math.round(t.y + size * 0.34)}" text-anchor="${anchor}" ` +
      `font-family="${font}" font-size="${size}" fill="${t.color || '#000'}"${weight}${ls}>${label}</text>`);
  }
  return `<g>${out.join('')}</g>`;
}

function buildTemplate(t) {
  const folder = path.join(ROOT, t.id);
  fs.mkdirSync(folder, { recursive: true });

  const bgSvg = wrap(t.bg('b'));
  const ovSvg = wrap(t.ov('o'));
  const prevSvg = wrap(
    t.bg('pa') +
    photoBoxes(t.rects, t.previewStroke, t.photo.borderWidth || 3) +
    t.ov('pb') +
    previewTextNodes(t.texts),
    200,
    600,
  );

  fs.writeFileSync(path.join(folder, 'background.svg'), bgSvg, 'utf8');
  fs.writeFileSync(path.join(folder, 'overlay.svg'), ovSvg, 'utf8');
  fs.writeFileSync(path.join(folder, 'preview.svg'), prevSvg, 'utf8');

  const elements = [{ type: 'background', src: 'background.svg' }];
  t.rects.forEach(([x, y, w, h], i) => {
    const el = { type: 'photo', id: `photo${i + 1}`, x, y, width: w, height: h,
      fit: 'cover', radius: t.photo.radius || 0 };
    if (t.photo.border) {
      el.border = t.photo.border;
      el.borderWidth = t.photo.borderWidth || 3;
    }
    elements.push(el);
  });
  elements.push({ type: 'overlay', src: 'overlay.svg', x: 0, y: 0, width: W, height: H });
  if (t.logo) elements.push({ type: 'logo', align: 'center', ...t.logo });
  for (const tx of t.texts) elements.push({ type: 'text', ...tx });

  const definition = {
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    canvas: { width: W, height: H },
    elements,
  };
  fs.writeFileSync(path.join(folder, 'template.json'),
    `${JSON.stringify(definition, null, 2)}\n`, 'utf8');
  return definition;
}

function updateCatalog(defs) {
  const file = path.join(ROOT, 'catalog.json');
  const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
  const existing = new Map(catalog.templates.map((e) => [e.id, e]));
  for (const d of defs) {
    existing.set(d.id, {
      id: d.id, folder: d.id, name: d.name, category: d.category, preview: 'preview.svg',
    });
  }
  const order = ['xv_anos', 'boda', 'cumpleanos', 'graduacion', 'navidad',
    'halloween', 'neon', 'corporativo', 'general'];
  const rank = (c) => (order.includes(c) ? order.indexOf(c) : 99);
  catalog.templates = [...existing.values()].sort(
    (a, b) => rank(a.category) - rank(b.category) || a.id.localeCompare(b.id),
  );
  fs.writeFileSync(file, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  return catalog;
}

const defs = TEMPLATES.map(buildTemplate);
const cat = updateCatalog(defs);
for (const d of defs) console.log('OK', d.id, '-', d.name);
console.log('Catalogo:', cat.templates.length, 'plantillas');
