/**
 * Adornos SVG extra de la PANTALLA (no de la tira impresa).
 *
 * Es el gemelo en Node de tools/generar_deco_pantalla.py: misma composición
 * floral (racimos de esquina + guirnalda con hueco al centro), pero se puede
 * correr en la máquina de la cabina, que no tiene Python. Los juegos de abajo
 * viven SOLO aquí; los originales (boda, jardín, borgoña, lila, tropical)
 * siguen en el script .py.
 *
 * Además de flores trae tres composiciones nuevas:
 *   globos   arco orgánico de globos (fiestas)
 *   picado   guirnalda de papel picado (fiesta mexicana)
 *   reino    trenza dorada, sol, linternas y torre (XV, inspirado en xv_008)
 *
 * Salida: public/deco/<variante>-{top-left,top-right,bottom-left,
 *         bottom-right,garland}.svg  -> se usan desde styles.css.
 *
 * Uso:  node tools/generar_deco_extra.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'deco');
fs.mkdirSync(OUT, { recursive: true });

const PETALO = 'M0,0 C-0.58,-0.30 -0.66,-1.02 0,-1.28 C0.66,-1.02 0.58,-0.30 0,0 Z';

const f0 = (v) => Number(v).toFixed(0);
const f1 = (v) => Number(v).toFixed(1);
const f2 = (v) => Number(v).toFixed(2);
const rad = (deg) => (deg * Math.PI) / 180;

/** PRNG determinista (mulberry32) para que cada corrida escriba lo mismo. */
function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.uniform = (lo, hi) => lo + (hi - lo) * next();
  next.choice = (arr) => arr[Math.floor(next() * arr.length) % arr.length];
  next.shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  return next;
}

// ── variantes ────────────────────────────────────────────────────────
// Cada paleta: [claro, medio, oscuro, corazón]. Roles:
//   p1 flor principal · p2 secundaria · p3 acento · p4 acento fuerte
const FLORALES = {
  // XV Rosa Palo & Oro
  'xv-rosa-oro': {
    paletas: {
      p1: ['#FFFFFF', '#FBF3F1', '#EFDCD8', '#D9BEB8'],
      p2: ['#FCE4EA', '#F5C2CF', '#E79AAF', '#C97790'],
      p3: ['#FFEDE3', '#F9D3C2', '#EDB29C', '#CE8E78'],
      p4: ['#F7C6D9', '#EC96B8', '#D66D96', '#B04C74'],
    },
    hojas: ['#8FA68A', '#A7BBA1', '#6F8A6A', '#98AE92'],
    hojaGrad: ['#AFC3A9', '#6F8A6A'], vena: '#5B7457',
    metal: '#D4AF37', gyp: '#FFFFFF',
  },
  // XV Azul Cielo & Plata
  'xv-azul': {
    paletas: {
      p1: ['#FFFFFF', '#F3F7FB', '#DCE6F0', '#BCCBDB'],
      p2: ['#E3F0FB', '#C2DDF3', '#98C2E6', '#6F9FCC'],
      p3: ['#EEF1FA', '#D5DCF2', '#B2BDE3', '#8C99C8'],
      p4: ['#DDF1F6', '#B5E0EB', '#86C6D8', '#5DA4BA'],
    },
    hojas: ['#8FA7A6', '#A9BDBB', '#6F8987', '#9AB1AF'],
    hojaGrad: ['#B0C4C2', '#6F8987'], vena: '#5A7270',
    metal: '#B9C3CE', gyp: '#FFFFFF',
  },
  // XV Esmeralda & Oro (oscuro)
  'xv-esmeralda': {
    paletas: {
      p1: ['#FFFFFF', '#F4F1EA', '#E1DACB', '#C4B99F'],
      p2: ['#FBEBC8', '#EFD49A', '#D8B66B', '#B08E45'],
      p3: ['#F8E1DC', '#EDC3BA', '#D9A197', '#B97E74'],
      p4: ['#CDEBDD', '#9ED3BC', '#6DB598', '#4A9477'],
    },
    hojas: ['#2F6B55', '#3F8469', '#1F4F3E', '#357560'],
    hojaGrad: ['#4C9275', '#1C4A3A'], vena: '#153A2D',
    metal: '#E2C25C', gyp: '#FFF8E8',
  },
  // Boda Azul Polvo (dusty blue + eucalipto)
  'boda-azul': {
    paletas: {
      p1: ['#FFFFFF', '#F5F7F9', '#DFE5EB', '#C3CDD7'],
      p2: ['#E6EEF5', '#C9D8E6', '#A5BDD3', '#7F9CB8'],
      p3: ['#F4F1EC', '#E4DDD2', '#CBBFAE', '#A99A86'],
      p4: ['#D9E4EE', '#B4C8DA', '#8BA8C2', '#6786A4'],
    },
    hojas: ['#7F9C98', '#98B2AE', '#627E7A', '#8AA6A2'],
    hojaGrad: ['#A3BCB8', '#5E7A76'], vena: '#4B6562',
    metal: '#B9A36A', gyp: '#FFFFFF',
  },
  // Boda Boho Terracota (con plumas de pampa)
  'boda-terracota': {
    paletas: {
      p1: ['#FFF8F0', '#F6E6D6', '#E7CDB3', '#CFAE8D'],
      p2: ['#F2B597', '#DE8B66', '#C0673F', '#94482A'],
      p3: ['#FCE0CC', '#F4C1A0', '#E3A077', '#C27D55'],
      p4: ['#F5DDA6', '#E8C074', '#CFA04B', '#A77C2F'],
    },
    hojas: ['#8A8F5C', '#A2A673', '#6B7045', '#959A66'],
    hojaGrad: ['#A9AD7A', '#666B41'], vena: '#50552F',
    metal: '#B98A3E', gyp: '#FFF6EA', pampa: '#E9D6B4',
  },
  // Boda Noche Azul & Oro (oscuro)
  'boda-noche': {
    paletas: {
      p1: ['#FFFFFF', '#F6F4EE', '#E2DDD0', '#C4BCA8'],
      p2: ['#FBEFD5', '#F1D9A6', '#DDBB74', '#B8934A'],
      p3: ['#E3E9F6', '#C4D0EA', '#9DAED6', '#7587B8'],
      p4: ['#FFFDF8', '#F3EDE1', '#DDD2BE', '#BCAE93'],
    },
    hojas: ['#4F6E6A', '#62847F', '#3A5552', '#58796F'],
    hojaGrad: ['#6E918B', '#35504C'], vena: '#27403D',
    metal: '#E2C25C', gyp: '#FFFFFF',
  },
  // Fiesta Mexicana: flores de papel en colores vivos (guirnalda = papel picado)
  'fiesta-mexicana': {
    paletas: {
      p1: ['#FF7AB8', '#F0288A', '#C8106A', '#940A4E'],
      p2: ['#FFC266', '#FF9A1F', '#E07400', '#A85400'],
      p3: ['#FFF08A', '#FFD93D', '#E8B90C', '#B88E00'],
      p4: ['#C9A0FF', '#9D5CF0', '#7432CF', '#521F99'],
    },
    hojas: ['#2FA35A', '#46BE70', '#1E7D42', '#39AD63'],
    hojaGrad: ['#5ACB7F', '#1B7040'], vena: '#145A32',
    metal: '#FFB000', gyp: '#FFF6DC',
  },
};

const GLOBOS = {
  'globos-rosa': {
    paletas: {
      p1: ['#FFE6EE', '#F9C4D4', '#EE9DB5', '#CF7A95'],
      p2: ['#FFFFFF', '#F7F2EF', '#E6DDD8', '#C9BDB6'],
      p3: ['#F8D8C8', '#E7B09A', '#C98A72', '#A0664F'],
      p4: ['#FFF4C2', '#EFCF6A', '#C9A227', '#8A6A10'],
    },
    hojas: ['#7F9C98', '#98B2AE', '#627E7A', '#8AA6A2'],
    hojaGrad: ['#A3BCB8', '#5E7A76'], vena: '#4B6562',
    metal: '#D4AF37', gyp: '#FFFFFF', follaje: true,
  },
  'globos-glam': {
    paletas: {
      p1: ['#6A6A6A', '#2A2A2A', '#121212', '#000000'],
      p2: ['#FFF4C2', '#EFCF6A', '#C9A227', '#8A6A10'],
      p3: ['#FFF8EA', '#F2E2C2', '#D9C08E', '#B39A62'],
      p4: ['#FFFFFF', '#EFEFEF', '#D2D2D2', '#A8A8A8'],
    },
    hojas: ['#C9A227', '#E2C25C', '#8A6A10', '#D4AF37'],
    hojaGrad: ['#F1D77A', '#8A6A10'], vena: '#6E5410',
    metal: '#F0C64E', gyp: '#FFF4D0', follaje: false,
  },
};

// XV "Noche en el Reino": inspirado en la tira xv_008, en versión de gala
// nocturna (oro fino, flores blancas y lila tenue, linternas encendidas)
const REINO = {
  paletas: {
    p1: ['#FFFFFF', '#F7F3F8', '#E4DBE8', '#C6B8CF'],
    p2: ['#F1E8FA', '#DCCDEE', '#BFA9DC', '#9C84C0'],
    p3: ['#FBF1EC', '#F0DCD4', '#DCBFB4', '#BB9C90'],
    p4: ['#FFF7E6', '#F6E6C2', '#E3C995', '#C2A568'],
  },
  hojas: ['#4E6A62', '#5F7C73', '#3C554E', '#577168'],
  hojaGrad: ['#6D8A80', '#34504A'], vena: '#2A413B',
  metal: '#E9C46A', gyp: '#FFF8EC',
  flores: ['#FFFFFF', '#FFFFFF', '#E6DAF5', '#F4E6D8'],
};

// ── primitivas (mismas que el .py) ───────────────────────────────────
const wrap = (defs, body, w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
  `viewBox="0 0 ${w} ${h}">\n<defs>${defs}</defs>\n${body}\n</svg>\n`;

const espejo = (body, w, flip) =>
  flip ? `<g transform="translate(${w},0) scale(-1,1)">${body}</g>` : body;

function defsDe(v, uid) {
  const out = [];
  for (const [name, [c1, c2, c3, c4]] of Object.entries(v.paletas)) {
    [[c1, c2], [c2, c3], [c3, c4]].forEach(([a, b], i) => {
      out.push(`<radialGradient id="${uid}${name}${i}" cx="50%" cy="78%" r="78%">` +
        `<stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></radialGradient>`);
    });
    // Globo: brillo arriba a la izquierda, como látex inflado
    out.push(`<radialGradient id="${uid}${name}g" cx="36%" cy="30%" r="78%">` +
      `<stop offset="0%" stop-color="${c1}"/><stop offset="42%" stop-color="${c2}"/>` +
      `<stop offset="84%" stop-color="${c3}"/><stop offset="100%" stop-color="${c4}"/></radialGradient>`);
  }
  const [g1, g2] = v.hojaGrad;
  out.push(`<linearGradient id="${uid}hoja" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0%" stop-color="${g1}"/><stop offset="100%" stop-color="${g2}"/></linearGradient>`);
  return out.join('');
}

function rosa(v, uid, x, y, s, name, seed = 0, rot = 0) {
  const r = rng(seed + 1);
  const g = [`<g transform="translate(${f1(x)},${f1(y)}) rotate(${rot}) scale(${f2(s)})">`,
    '<ellipse cx="0" cy="2" rx="15" ry="13" fill="#5A4636" opacity="0.12"/>'];
  for (const [n, radio, offset, capa] of [[7, 15.5, 0, 0], [6, 10.5, 26, 1], [5, 6.4, 52, 2]]) {
    for (let i = 0; i < n; i += 1) {
      const a = offset + i * (360 / n) + r.uniform(-4, 4);
      const rr = radio * r.uniform(0.93, 1.07);
      g.push(`<path d="${PETALO}" transform="rotate(${f0(a)}) scale(${f1(rr)})" ` +
        `fill="url(#${uid}${name}${capa})" stroke="rgba(70,50,40,0.10)" stroke-width="0.06"/>`);
    }
  }
  const [, , c3, c4] = v.paletas[name];
  g.push(`<circle r="3.6" fill="${c3}"/>`);
  g.push(`<path d="M0,2.6 C2.6,-1 3.6,-3.6 0,-5.2 C-3.6,-3.6 -2.6,-1 0,2.6Z" fill="${c4}" opacity="0.85"/>`);
  g.push('<path d="M-4,-6 C-1,-9 2,-9 5,-6" fill="none" stroke="#FFFFFF" stroke-width="0.9" opacity="0.32"/>');
  g.push('</g>');
  return g.join('');
}

function capullo(v, uid, x, y, s, name, rot = 0) {
  const c3 = v.paletas[name][2];
  return `<g transform="translate(${f0(x)},${f0(y)}) rotate(${rot}) scale(${f2(s)})">` +
    `<path d="M0,10 C-7,4 -7,-8 0,-12 C7,-8 7,4 0,10Z" fill="url(#${uid}${name}0)"/>` +
    `<path d="M0,9 C-3,3 -3,-7 0,-11" fill="none" stroke="${c3}" stroke-width="1.1" opacity="0.7"/>` +
    `<path d="M-5,9 C-2,14 2,14 5,9 L0,13Z" fill="${v.hojas[0]}"/></g>`;
}

function hoja(v, uid, x, y, s, rot = 0, color = null) {
  const fill = color || `url(#${uid}hoja)`;
  return `<g transform="translate(${f0(x)},${f0(y)}) rotate(${f1(rot)}) scale(${f2(s)})">` +
    `<path d="M0,0 C9,-11 22,-8 24,4 C16,14 4,11 0,0Z" fill="${fill}"/>` +
    `<path d="M1,1 C9,0 17,3 23,4" fill="none" stroke="${v.vena}" stroke-width="0.8" opacity="0.45"/></g>`;
}

function rama(v, uid, x, y, s, rot, largo = 7, color = null) {
  const fill = color || `url(#${uid}hoja)`;
  const out = [`<g transform="translate(${f0(x)},${f0(y)}) rotate(${rot}) scale(${f2(s)})">`,
    `<path d="M0,0 C${largo * 6},-4 ${largo * 10},-8 ${largo * 15},-14" fill="none" ` +
    `stroke="${v.hojas[0]}" stroke-width="2" opacity="0.8"/>`];
  for (let i = 0; i < largo; i += 1) {
    const px = 15 * (i + 1) - 8;
    const py = -1.2 * i;
    const rr = 8.5 - i * 0.55;
    out.push(`<ellipse cx="${f0(px)}" cy="${f0(py - 8)}" rx="${f1(rr)}" ry="${f1(rr * 0.82)}" fill="${fill}" opacity="0.92"/>`);
    out.push(`<ellipse cx="${f0(px)}" cy="${f0(py + 8)}" rx="${f1(rr)}" ry="${f1(rr * 0.82)}" fill="${fill}" opacity="0.78"/>`);
  }
  out.push('</g>');
  return out.join('');
}

function nube(v, seed, cx, cy, n, spread) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const a = r.uniform(0, Math.PI * 2);
    const d = r.uniform(0, spread);
    out.push(`<circle cx="${f0(cx + Math.cos(a) * d)}" cy="${f0(cy + Math.sin(a) * d * 0.75)}" ` +
      `r="${f1(r.uniform(1.6, 3.4))}" fill="${v.gyp}" opacity="${f2(r.uniform(0.55, 0.95))}"/>`);
  }
  return out.join('');
}

function destellos(v, seed, n, w, h) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i += 1) {
    out += `<circle cx="${f0(r.uniform(0, w))}" cy="${f0(r.uniform(0, h))}" r="${f1(r.uniform(1.1, 3.0))}" ` +
      `fill="${v.metal}" opacity="${f2(r.uniform(0.25, 0.65))}"/>`;
  }
  return out;
}

/** n puntos [x, y, ángulo°] sobre una curva cúbica. */
function bezier([p0, p1, p2, p3], n) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const t = i / Math.max(n - 1, 1);
    const mt = 1 - t;
    const x = mt ** 3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t ** 3 * p3[0];
    const y = mt ** 3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t ** 3 * p3[1];
    const dx = 3 * mt * mt * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
    const dy = 3 * mt * mt * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    pts.push([x, y, (Math.atan2(dy, dx) * 180) / Math.PI]);
  }
  return pts;
}

function confeti(v, seed, n, w, h) {
  const r = rng(seed);
  const cols = [...Object.values(v.paletas).map((p) => p[1]), v.metal];
  let out = '';
  for (let i = 0; i < n; i += 1) {
    const x = r.uniform(0, w);
    const y = r.uniform(0, h);
    out += `<rect x="${f0(x)}" y="${f0(y)}" width="${f1(r.uniform(4, 9))}" height="${f1(r.uniform(2, 4))}" ` +
      `rx="1" fill="${r.choice(cols)}" opacity="${f2(r.uniform(0.5, 0.9))}" ` +
      `transform="rotate(${f0(r.uniform(0, 180))} ${f0(x)} ${f0(y)})"/>`;
  }
  return out;
}

// ── pampa (boho) ─────────────────────────────────────────────────────
function pampa(v, x, y, s, rot, seed) {
  const r = rng(seed);
  const out = [`<g transform="translate(${f0(x)},${f0(y)}) rotate(${rot}) scale(${f2(s)})">`,
    '<path d="M0,0 C30,-4 70,-14 118,-34" fill="none" stroke="#CDB58C" stroke-width="1.6"/>'];
  for (let i = 0; i < 46; i += 1) {
    const t = 0.25 + (0.75 * i) / 45;
    const px = 118 * t;
    const py = -34 * t * t;
    const L = 16 * Math.sin(Math.PI * Math.min(t * 1.05, 1)) + 4;
    for (const sgn of [-1, 1]) {
      const a = rad(sgn * r.uniform(38, 62) - 14);
      out.push(`<path d="M${f1(px)},${f1(py)} q${f1(L * 0.5 * Math.cos(a))},${f1(L * 0.5 * Math.sin(a) - 2)} ` +
        `${f1(L * Math.cos(a))},${f1(L * Math.sin(a))}" fill="none" stroke="${v.pampa}" ` +
        `stroke-width="${f1(r.uniform(1.6, 2.8))}" stroke-linecap="round" opacity="${f2(r.uniform(0.55, 0.9))}"/>`);
    }
  }
  out.push('</g>');
  return out.join('');
}

const pampasTop = (v) => (v.pampa
  ? pampa(v, -10, 150, 1.5, -48, 1) + pampa(v, 30, 10, 1.3, 30, 2) + pampa(v, 120, -6, 1.1, 64, 3)
  : '');

const pampasBottom = (v, h) => (v.pampa
  ? `<g transform="translate(0,${h}) scale(1,-1)">${pampa(v, -10, 120, 1.4, -40, 4)}${pampa(v, 40, 0, 1.2, 36, 5)}</g>`
  : '');

// ── composición floral (igual que el .py) ────────────────────────────
function clusterTop(v, flip = false, w = 460, h = 400) {
  const u = 'a';
  const body = [pampasTop(v),
    rama(v, u, -20, 34, 1.5, 22, 8), rama(v, u, 6, 6, 1.35, 55, 7),
    rama(v, u, 78, -18, 1.35, 80, 6), rama(v, u, 176, -20, 1.15, 100, 6),
    hoja(v, u, 150, 150, 2.2, 45), hoja(v, u, 66, 214, 2.0, 100),
    hoja(v, u, 232, 84, 1.8, 12), hoja(v, u, 22, 128, 1.9, 150),
    nube(v, 5, 196, 176, 26, 48), nube(v, 6, 40, 236, 18, 36),
    rosa(v, u, 92, 108, 2.6, 'p1', 1, -12),
    rosa(v, u, 176, 66, 2.1, 'p3', 2, 20),
    rosa(v, u, 48, 190, 1.9, 'p2', 3, 8),
    rosa(v, u, 138, 196, 1.6, 'p4', 4, -25),
    rosa(v, u, 226, 148, 1.45, 'p1', 5, 15),
    capullo(v, u, 20, 58, 1.5, 'p3', -30),
    capullo(v, u, 252, 40, 1.3, 'p2', 40),
    capullo(v, u, 100, 262, 1.3, 'p4', 200),
    `<g>${destellos(v, 9, 24, w, h)}</g>`].join('');
  return wrap(defsDe(v, u), espejo(body, w, flip), w, h);
}

function clusterBottom(v, flip = false, w = 420, h = 340) {
  const u = 'b';
  const body = [pampasBottom(v, h),
    `<g transform="translate(0,${h}) scale(1,-1)">`,
    rama(v, u, -16, 26, 1.4, 20, 7), rama(v, u, 34, 0, 1.25, 58, 6),
    rama(v, u, 132, -12, 1.1, 86, 6), '</g>',
    hoja(v, u, 110, 214, 2.1, 215), hoja(v, u, 34, 258, 1.9, 300),
    hoja(v, u, 186, 262, 1.7, 250),
    nube(v, 15, 150, 236, 22, 42),
    rosa(v, u, 74, 240, 2.4, 'p1', 11, 14),
    rosa(v, u, 152, 282, 2.0, 'p3', 12, -18),
    rosa(v, u, 26, 296, 1.7, 'p2', 13, 30),
    rosa(v, u, 112, 190, 1.4, 'p4', 14, -6),
    capullo(v, u, 200, 224, 1.3, 'p3', 150),
    `<g>${destellos(v, 19, 16, w, h)}</g>`].join('');
  return wrap(defsDe(v, u), espejo(body, w, flip), w, h);
}

/** Guirnalda superior CON HUECO AL CENTRO para el título. */
function garland(v, w = 1600, h = 170) {
  const u = 'c';
  const r = rng(77);
  const g = [];
  for (const [x0, x1, curva] of [[0, w * 0.34, 1], [w * 0.66, w, -1]]) {
    const span = x1 - x0;
    g.push(`<path d="M${f0(x0)},${curva > 0 ? 40 : 78} ` +
      `C${f0(x0 + span * 0.35)},${curva > 0 ? 92 : 30} ${f0(x0 + span * 0.65)},${curva > 0 ? 34 : 96} ` +
      `${f0(x1)},${curva > 0 ? 80 : 42}" fill="none" stroke="${v.hojas[0]}" stroke-width="2.6" opacity="0.6"/>`);
    for (let i = 0; i < 16; i += 1) {
      const t = (i + 0.5) / 16;
      const x = x0 + span * t;
      const y = curva > 0 ? 40 + 40 * Math.sin(t * Math.PI * 1.6) : 78 - 34 * Math.sin(t * Math.PI * 1.6);
      g.push(hoja(v, u, x, y, r.uniform(1.3, 2.1), r.uniform(0, 360), r.choice(v.hojas)));
    }
    [0.16, 0.44, 0.74].forEach((t, k) => {
      const x = x0 + span * t;
      const y = curva > 0 ? 52 + 30 * Math.sin(t * Math.PI * 1.6) : 72 - 26 * Math.sin(t * Math.PI * 1.6);
      g.push(rosa(v, u, x, y, 1.6, ['p1', 'p3', 'p2'][k], 100 + k, f0(r.uniform(-25, 25))));
    });
    g.push(nube(v, 200 + Math.round(x0), x0 + span * 0.6, 62, 16, 40));
  }
  return wrap(defsDe(v, u), g.join(''), w, h);
}

// ── globos ───────────────────────────────────────────────────────────
function globo(uid, x, y, r, name) {
  const hx = -r * 0.36;
  const hy = -r * 0.4;
  return `<g transform="translate(${f1(x)},${f1(y)})">` +
    `<circle r="${f1(r)}" fill="url(#${uid}${name}g)" stroke="rgba(0,0,0,0.07)" stroke-width="0.8"/>` +
    `<ellipse cx="${f1(hx)}" cy="${f1(hy)}" rx="${f1(r * 0.2)}" ry="${f1(r * 0.11)}" ` +
    `transform="rotate(-38 ${f1(hx)} ${f1(hy)})" fill="#FFFFFF" opacity="0.6"/></g>`;
}

/** Arco orgánico: globos grandes sobre la curva y chicos rellenando huecos. */
function arco(uid, curva, n, rmin, rmax, seed) {
  const r = rng(seed);
  const nombres = ['p1', 'p2', 'p3', 'p4'];
  const grandes = [];
  const chicos = [];
  for (const [x, y] of bezier(curva, n)) {
    for (let k = 0; k < 2; k += 1) {
      grandes.push(globo(uid, x + r.uniform(-rmax * 0.5, rmax * 0.5), y + r.uniform(-rmax * 0.5, rmax * 0.5),
        r.uniform(rmin, rmax), r.choice(nombres)));
    }
    if (r() < 0.8) {
      chicos.push(globo(uid, x + r.uniform(-rmax, rmax), y + r.uniform(-rmax, rmax),
        r.uniform(rmin * 0.35, rmin * 0.6), r.choice(nombres)));
    }
  }
  return r.shuffle(grandes).join('') + chicos.join('');
}

function globosTop(v, flip = false, w = 460, h = 400) {
  const u = 'a';
  const body = [
    v.follaje ? rama(v, u, -10, 250, 1.4, -30, 7) + rama(v, u, 170, 10, 1.3, 20, 7) +
      hoja(v, u, 60, 200, 2.0, 60) + hoja(v, u, 210, 70, 1.9, 150) : '',
    arco(u, [[-30, 390], [10, 150], [120, 20], [440, -30]], 13, 26, 46, 3),
    `<g>${confeti(v, 8, 26, w, h)}${destellos(v, 9, 22, w, h)}</g>`].join('');
  return wrap(defsDe(v, u), espejo(body, w, flip), w, h);
}

function globosBottom(v, flip = false, w = 420, h = 340) {
  const u = 'b';
  const body = [
    v.follaje ? rama(v, u, 120, 330, 1.3, -20, 6) + hoja(v, u, 40, 150, 1.9, 250) : '',
    arco(u, [[-30, 40], [20, 220], [120, 330], [410, 370]], 11, 24, 42, 13),
    `<g>${confeti(v, 18, 18, w, h)}${destellos(v, 19, 14, w, h)}</g>`].join('');
  return wrap(defsDe(v, u), espejo(body, w, flip), w, h);
}

/** Arco superior en dos tramos: el centro queda libre para el título. */
function globosGarland(v, w = 1600, h = 170) {
  const u = 'c';
  const g = [
    arco(u, [[-20, 20], [180, 40], [380, 80], [w * 0.34, 44]], 14, 16, 30, 41),
    arco(u, [[w * 0.66, 44], [w - 380, 80], [w - 180, 40], [w + 20, 20]], 14, 16, 30, 42),
    `<g>${confeti(v, 43, 30, w * 0.3, h)}</g>`,
    `<g transform="translate(${f0(w * 0.7)},0)">${confeti(v, 44, 30, w * 0.3, h)}</g>`];
  return wrap(defsDe(v, u), g.join(''), w, h);
}

// ── papel picado ─────────────────────────────────────────────────────
const PICADO = ['#F0288A', '#FF9A1F', '#FFD93D', '#2FA35A', '#9D5CF0', '#1FB5C9'];

/** Banderita: rectángulo con fleco en V y calados (evenodd = huecos). */
function banderita(x, y, rot, color, fw = 62, fh = 78) {
  let zig = '';
  for (let i = 1; i <= 8; i += 1) zig += ` L${f1(fw - (i * fw) / 8)},${i % 2 ? fh : fh - 8}`;
  const cx = fw / 2;
  const cy = fh * 0.44;
  const circulos = [[12, 13], [fw - 12, 13], [12, fh - 24], [fw - 12, fh - 24]]
    .map(([px, py]) => `M${px + 4},${py} a4,4 0 1,0 -8,0 a4,4 0 1,0 8,0 Z `).join('');
  const huecos = `M${cx},${f1(cy - 15)} L${cx + 11},${f1(cy)} L${cx},${f1(cy + 15)} L${cx - 11},${f1(cy)} Z ` +
    circulos + `M${cx - 3},${fh - 18} h6 v5 h-6 Z M${cx - 3},9 h6 v5 h-6 Z`;
  return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) translate(${-fw / 2},0)">` +
    `<path d="M0,0 H${fw} V${fh - 8}${zig} Z ${huecos}" fill="${color}" fill-rule="evenodd" opacity="0.94"/></g>`;
}

function picadoGarland(w = 1600, h = 170) {
  const r = rng(5);
  const g = [];
  [[-10, w * 0.35], [w * 0.65, w + 10]].forEach(([x0, x1], tramo) => {
    const curva = [[x0, 10], [x0 + (x1 - x0) * 0.3, 62], [x0 + (x1 - x0) * 0.7, 62], [x1, 10]];
    g.push(`<path d="M${f0(x0)},10 C${f0(curva[1][0])},62 ${f0(curva[2][0])},62 ${f0(x1)},10" ` +
      'fill="none" stroke="#6B4A2A" stroke-width="1.6" opacity="0.7"/>');
    const pts = bezier(curva, Math.floor((x1 - x0) / 70)).slice(1, -1);
    pts.forEach(([x, y, ang], k) => {
      g.push(banderita(x, y - 2, ang * 0.35 + r.uniform(-3, 3), PICADO[(k + tramo * 3) % PICADO.length]));
    });
  });
  return wrap('', g.join(''), w, h);
}

// ── reino de noche: cordón dorado, emblema de sol, linternas y torre ──
// Estilo de gala: oro en trazo fino, poco elemento y mucho brillo cálido.
function defsReino(v, uid) {
  return defsDe(v, uid) +
    `<linearGradient id="${uid}oro" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFF1C4"/>` +
    '<stop offset="50%" stop-color="#E9C46A"/><stop offset="100%" stop-color="#B8903A"/></linearGradient>' +
    `<linearGradient id="${uid}lin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF0C2"/>` +
    '<stop offset="55%" stop-color="#F6C065"/><stop offset="100%" stop-color="#D98A3A"/></linearGradient>' +
    `<radialGradient id="${uid}halo"><stop offset="0%" stop-color="#FFBE6A" stop-opacity="0.55"/>` +
    '<stop offset="45%" stop-color="#FFBE6A" stop-opacity="0.18"/>' +
    '<stop offset="100%" stop-color="#FFBE6A" stop-opacity="0"/></radialGradient>' +
    `<linearGradient id="${uid}torre" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4A3178"/>` +
    '<stop offset="100%" stop-color="#231339"/></linearGradient>';
}

/** Emblema de sol en línea dorada fina (el sol del reino, versión joya). */
function sol(uid, x, y, s) {
  let rayos = '';
  for (let i = 0; i < 24; i += 1) {
    const largo = i % 2 === 0 ? 30 : 23;
    rayos += `<path d="M0,-19 L0,-${largo}" transform="rotate(${i * 15})"/>`;
  }
  return `<g transform="translate(${f0(x)},${f0(y)}) scale(${f2(s)})" opacity="0.95">` +
    `<circle r="30" fill="url(#${uid}halo)"/>` +
    `<g stroke="url(#${uid}oro)" stroke-width="1.3" stroke-linecap="round">${rayos}</g>` +
    `<circle r="15" fill="none" stroke="url(#${uid}oro)" stroke-width="1.4"/>` +
    `<circle r="10.5" fill="none" stroke="#E9C46A" stroke-width="0.7" opacity="0.7"/>` +
    `<circle r="5" fill="url(#${uid}oro)"/></g>`;
}

function linterna(uid, x, y, s, rot = 0) {
  return `<g transform="translate(${f0(x)},${f0(y)}) rotate(${f1(rot)}) scale(${f2(s)})">` +
    `<circle r="44" fill="url(#${uid}halo)"/>` +
    `<path d="M-11,-13 L11,-13 L8.5,13 L-8.5,13Z" fill="url(#${uid}lin)"/>` +
    '<ellipse cx="0" cy="4" rx="4.5" ry="6.5" fill="#FFFBE6" opacity="0.75"/>' +
    '<rect x="-12" y="-15.5" width="24" height="3" rx="1.2" fill="#6B4020"/>' +
    '<rect x="-9" y="12.5" width="18" height="2.4" rx="1" fill="#6B4020"/></g>';
}

function linternas(uid, seed, n, w, h, smin = 0.45, smax = 0.8) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i += 1) {
    out += linterna(uid, r.uniform(20, w - 20), r.uniform(20, h - 20), r.uniform(smin, smax), r.uniform(-6, 6));
  }
  return out;
}

/** Cordón dorado trenzado: eslabones finos alternados sobre la curva. */
function trenza(uid, curva, n) {
  return bezier(curva, n).map(([x, y, a], i) => {
    const lado = i % 2 ? 1 : -1;
    const cx = x - Math.sin(rad(a)) * 1.8 * lado;
    const cy = y + Math.cos(rad(a)) * 1.8 * lado;
    return `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="7.5" ry="3.2" ` +
      `transform="rotate(${f0(a + 40 * lado)} ${f1(cx)} ${f1(cy)})" ` +
      `fill="url(#${uid}oro)" stroke="#9C7630" stroke-width="0.5"/>`;
  }).join('');
}

function florecita(x, y, s, color, centro = '#E9C46A') {
  let petalos = '';
  for (let k = 0; k < 5; k += 1) petalos += `<ellipse cy="-7" rx="4.4" ry="7.2" transform="rotate(${k * 72})"/>`;
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${f2(s)})">` +
    `<g fill="${color}" stroke="rgba(60,40,90,0.25)" stroke-width="0.6">${petalos}</g>` +
    `<circle r="2.8" fill="${centro}"/></g>`;
}

function floresEn(v, curva, n, seed, smin = 0.7, smax = 1.1) {
  const r = rng(seed);
  return bezier(curva, n).map(([x, y]) =>
    florecita(x + r.uniform(-5, 5), y + r.uniform(-5, 5), r.uniform(smin, smax), r.choice(v.flores))).join('');
}

/** Estrellitas de 4 puntas: el cielo de la noche. */
function estrellas(seed, n, w, h) {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < n; i += 1) {
    const s = r.uniform(0.35, 1);
    out += `<path d="M0,-6 L1.1,-1.1 L6,0 L1.1,1.1 L0,6 L-1.1,1.1 L-6,0 L-1.1,-1.1Z" ` +
      `transform="translate(${f0(r.uniform(0, w))},${f0(r.uniform(0, h))}) scale(${f2(s)})" ` +
      `fill="${r() < 0.5 ? '#FFFFFF' : '#F6DB94'}" opacity="${f2(r.uniform(0.45, 0.95))}"/>`;
  }
  return out;
}

/** La torre en silueta nocturna, con su ventana encendida y aguja dorada. */
function torre(uid, x, y, s) {
  return `<g transform="translate(${f0(x)},${f0(y)}) scale(${f2(s)})">` +
    `<path d="M-18,0 L-15,-190 L15,-190 L18,0Z" fill="url(#${uid}torre)"/>` +
    `<path d="M-30,-186 L30,-186 L28,-250 L-28,-250Z" fill="url(#${uid}torre)"/>` +
    '<path d="M-36,-248 L0,-320 L36,-248Z" fill="#2E1A4C"/>' +
    '<path d="M-36,-248 L0,-320 L36,-248" fill="none" stroke="#E9C46A" stroke-width="1.2" opacity="0.6"/>' +
    '<path d="M0,-320 L0,-340" stroke="#E9C46A" stroke-width="1.4"/>' +
    `<circle cx="0" cy="-224" r="30" fill="url(#${uid}halo)"/>` +
    '<path d="M-9,-232 a9,9 0 0,1 18,0 v15 h-18Z" fill="#FFD98A"/>' +
    '</g>';
}

function reinoTop(v, flip = false, w = 460, h = 400) {
  const u = 'a';
  // El cordón cae por la orilla, como el cabello desde la torre
  const braid = [[36, -10], [56, 90], [18, 190], [30, 330]];
  const body = [
    `<g>${estrellas(7, 26, w, h)}</g>`,
    rama(v, u, -10, 30, 1.2, 30, 7), hoja(v, u, 140, 96, 1.6, 40), hoja(v, u, 70, 170, 1.5, 110),
    trenza(u, braid, 52),
    floresEn(v, braid, 6, 3),
    rosa(v, u, 100, 64, 1.8, 'p1', 1, -12), rosa(v, u, 156, 34, 1.3, 'p2', 2, 20),
    rosa(v, u, 62, 118, 1.25, 'p1', 3, 8),
    sol(u, 238, 48, 0.8),
    linterna(u, 190, 190, 0.7, -4), linterna(u, 300, 120, 0.5, 5)].join('');
  return wrap(defsReino(v, u), espejo(body, w, flip), w, h);
}

function reinoBottom(v, flip = false, w = 420, h = 340) {
  const u = 'b';
  const body = [
    `<g>${estrellas(flip ? 21 : 20, 18, w, h - 80)}</g>`,
    // Solo la esquina derecha lleva torre (con flip queda del lado derecho)
    flip ? torre(u, 40, h + 6, 0.95) : '',
    linternas(u, flip ? 18 : 17, 3, w, h - 90, 0.5, 0.85),
    hoja(v, u, 120, 304, 1.7, 215), hoja(v, u, 40, 294, 1.6, 300),
    rosa(v, u, 150, 314, 1.5, 'p1', 12, -18),
    florecita(206, 306, 1.1, '#FFFFFF'), florecita(96, 326, 1.0, '#E6DAF5')].join('');
  return wrap(defsReino(v, u), espejo(body, w, flip), w, h);
}

function reinoGarland(v, w = 1600, h = 170) {
  const u = 'c';
  // Un solo festón por lado, más alto y ligero: el título respira
  const izq = [[-20, 22], [200, 84], [420, 20], [w * 0.33, 52]];
  const der = [[w * 0.67, 52], [w - 420, 20], [w - 200, 84], [w + 20, 22]];
  const g = [
    `<g>${estrellas(55, 22, w * 0.32, h)}</g>`,
    `<g transform="translate(${f0(w * 0.68)},0)">${estrellas(56, 22, w * 0.32, h)}</g>`,
    trenza(u, izq, 90), trenza(u, der, 90),
    floresEn(v, izq, 7, 51), floresEn(v, der, 7, 52),
    sol(u, w * 0.33 + 30, 52, 0.62), sol(u, w * 0.67 - 30, 52, 0.62)];
  return wrap(defsReino(v, u), g.join(''), w, h);
}

// ── generación ───────────────────────────────────────────────────────
function juego(prefix, v, [top, bottom, gar]) {
  return {
    [`${prefix}-top-left.svg`]: top(v),
    [`${prefix}-top-right.svg`]: top(v, true),
    [`${prefix}-bottom-left.svg`]: bottom(v),
    [`${prefix}-bottom-right.svg`]: bottom(v, true),
    [`${prefix}-garland.svg`]: gar(v),
  };
}

const todo = {};
for (const [prefix, v] of Object.entries(FLORALES)) {
  Object.assign(todo, juego(prefix, v, [clusterTop, clusterBottom, garland]));
}
// Fiesta mexicana: esquinas florales + guirnalda de papel picado
todo['fiesta-mexicana-garland.svg'] = picadoGarland();
for (const [prefix, v] of Object.entries(GLOBOS)) {
  Object.assign(todo, juego(prefix, v, [globosTop, globosBottom, globosGarland]));
}
Object.assign(todo, juego('xv-reino', REINO, [reinoTop, reinoBottom, reinoGarland]));

let total = 0;
for (const [name, svg] of Object.entries(todo).sort(([a], [b]) => a.localeCompare(b))) {
  fs.writeFileSync(path.join(OUT, name), svg, 'utf8');
  total += svg.length;
  console.log('OK', `public/deco/${name}`, `(${Math.floor(svg.length / 1024)} KB)`);
}
console.log(`\n${Object.keys(todo).length} archivos, ${Math.floor(total / 1024)} KB en total`);
