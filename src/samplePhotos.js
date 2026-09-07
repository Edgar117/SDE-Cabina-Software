/**
 * Fotos de muestra para las vistas previas.
 *
 * Se dibujan en canvas (nada de archivos ni internet: la cabina trabaja
 * offline). Se resuelven como retratos a contraluz: gente en penumbra contra
 * una luz de fondo, con halo en el contorno, bokeh, desenfoque y grano. Es
 * el recurso que mejor se lee como fotografía real, porque no hay rasgos
 * dibujados que delaten la ilustración, y deja ver de inmediato cómo va a
 * quedar la tira impresa.
 */

const W = 640;
const H = 480;

const AMBIENTES = [
  { luz: '#FFD9A0', medio: '#C98A55', fondo: '#3A2A22', halo: 'rgba(255,214,150,0.75)' },
  { luz: '#CFE4FF', medio: '#6E8FB8', fondo: '#1F2A38', halo: 'rgba(200,226,255,0.7)' },
  { luz: '#FFC6D9', medio: '#B4718C', fondo: '#33202B', halo: 'rgba(255,198,217,0.72)' },
];

function lienzo() {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
}

function rnd(semilla) {
  let s = semilla >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Telón oscuro con la fuente de luz detrás de la gente y bokeh. */
function fondo(ctx, amb, semilla) {
  ctx.fillStyle = amb.fondo;
  ctx.fillRect(0, 0, W, H);

  const luz = ctx.createRadialGradient(W * 0.5, H * 0.42, 10, W * 0.5, H * 0.5, W * 0.62);
  luz.addColorStop(0, amb.luz);
  luz.addColorStop(0.35, amb.medio);
  luz.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = luz;
  ctx.fillRect(0, 0, W, H);

  // bokeh: círculos difusos de luz, como guirnaldas fuera de foco
  const r = rnd(semilla);
  for (let i = 0; i < 26; i += 1) {
    const x = r() * W;
    const y = r() * H * 0.85;
    const rad = 6 + r() * 26;
    const a = 0.05 + r() * 0.16;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(255,236,200,${a * 1.6})`);
    g.addColorStop(0.7, `rgba(255,226,180,${a * 0.6})`);
    g.addColorStop(1, 'rgba(255,220,170,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // suelo
  const piso = ctx.createLinearGradient(0, H * 0.72, 0, H);
  piso.addColorStop(0, 'rgba(0,0,0,0)');
  piso.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = piso;
  ctx.fillRect(0, H * 0.68, W, H * 0.32);
}

/**
 * Silueta de una persona: cabeza, cuello y torso con hombros; `pelo` cambia
 * el perfil de la cabeza y `pose` levanta un brazo o hace la V.
 */
function silueta(ctx, { x, y, r, pelo = 'corto', pose = 'normal' }) {
  ctx.beginPath();

  // torso con hombros caídos
  ctx.moveTo(x - r * 2.3, H);
  ctx.bezierCurveTo(x - r * 2.15, y + r * 2.5, x - r * 1.5, y + r * 1.5, x - r * 0.62, y + r * 1.05);
  ctx.lineTo(x - r * 0.42, y + r * 0.72);
  // cabeza
  ctx.bezierCurveTo(x - r * 1.02, y + r * 0.5, x - r * 1.02, y - r * 1.05, x, y - r * 1.12);
  ctx.bezierCurveTo(x + r * 1.02, y - r * 1.05, x + r * 1.02, y + r * 0.5, x + r * 0.42, y + r * 0.72);
  ctx.lineTo(x + r * 0.62, y + r * 1.05);
  ctx.bezierCurveTo(x + r * 1.5, y + r * 1.5, x + r * 2.15, y + r * 2.5, x + r * 2.3, H);
  ctx.closePath();
  ctx.fill();

  if (pelo === 'largo') {
    // el cabello se dibuja solapado con la cabeza para que la silueta salga
    // de una pieza (si van separados quedan huecos de luz entre medias)
    ctx.beginPath();
    ctx.ellipse(x, y - r * 0.45, r * 1.1, r * 1.0, 0, 0, Math.PI * 2);
    ctx.fill();
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + dir * r * 0.35, y - r * 0.75);
      ctx.quadraticCurveTo(x + dir * r * 1.34, y + r * 0.35, x + dir * r * 1.02, y + r * 1.85);
      ctx.quadraticCurveTo(x + dir * r * 0.8, y + r * 2.02, x + dir * r * 0.6, y + r * 1.45);
      ctx.quadraticCurveTo(x + dir * r * 0.52, y + r * 0.35, x + dir * r * 0.25, y - r * 0.45);
      ctx.closePath();
      ctx.fill();
    }
  } else if (pelo === 'rizado') {
    for (const [dx, dy, rr] of [[-0.72, -0.72, 0.5], [-0.3, -1.02, 0.52], [0.3, -1.02, 0.52],
      [0.72, -0.72, 0.5], [0, -0.85, 0.6]]) {
      ctx.beginPath();
      ctx.arc(x + r * dx, y + r * dy, r * rr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (pose === 'brazo') {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = r * 0.52;
    ctx.beginPath();
    ctx.moveTo(x + r * 1.7, y + r * 2.9);
    ctx.quadraticCurveTo(x + r * 2.5, y + r * 1.3, x + r * 1.95, y + r * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + r * 1.9, y - r * 0.2, r * 0.28, r * 0.34, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  if (pose === 'paz') {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = r * 0.44;
    ctx.beginPath();
    ctx.moveTo(x + r * 1.6, y + r * 2.7);
    ctx.quadraticCurveTo(x + r * 2.0, y + r * 1.5, x + r * 1.5, y + r * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + r * 1.44, y + r * 0.68, r * 0.3, r * 0.36, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // dos dedos en V, cortos: a contraluz se leen sin dibujar la mano entera
    ctx.lineWidth = r * 0.19;
    ctx.beginPath();
    ctx.moveTo(x + r * 1.36, y + r * 0.52);
    ctx.lineTo(x + r * 1.22, y + r * 0.06);
    ctx.moveTo(x + r * 1.54, y + r * 0.52);
    ctx.lineTo(x + r * 1.7, y + r * 0.1);
    ctx.stroke();
  }
}

const GENTE = [
  [{ x: W * 0.5, y: H * 0.36, r: 46, pelo: 'largo' }],
  [
    { x: W * 0.35, y: H * 0.4, r: 40, pelo: 'largo', pose: 'paz' },
    { x: W * 0.66, y: H * 0.37, r: 42, pelo: 'corto' },
  ],
  [{ x: W * 0.5, y: H * 0.35, r: 46, pelo: 'rizado', pose: 'brazo' }],
];

function pintarGente(ctx, variante, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  for (const p of GENTE[variante]) silueta(ctx, p);
}

function vineta(ctx) {
  const v = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.3, W / 2, H / 2, H * 0.95);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

/** Grano fino de sensor. */
function grano(ctx, semilla, fuerza = 0.05) {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  let s = semilla >>> 0;
  for (let i = 0; i < d.length; i += 4) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const n = ((s >>> 24) - 128) * fuerza;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function tomaDeMuestra(variante) {
  const amb = AMBIENTES[variante % AMBIENTES.length];
  const semilla = 4021 + variante * 613;

  const base = lienzo();
  const b = base.getContext('2d');
  fondo(b, amb, semilla);

  // halo: la misma silueta en claro y desenfocada, para el contraluz
  const halo = lienzo();
  const hl = halo.getContext('2d');
  pintarGente(hl, variante, amb.halo);

  // cuerpo en penumbra
  const cuerpo = lienzo();
  const cp = cuerpo.getContext('2d');
  pintarGente(cp, variante, 'rgba(24,16,14,0.94)');

  const out = lienzo();
  const o = out.getContext('2d');
  o.drawImage(base, 0, 0);
  o.filter = 'blur(9px)';
  o.drawImage(halo, 0, 0);
  o.filter = 'blur(2.4px)';
  o.drawImage(cuerpo, 0, 0);
  o.filter = 'none';

  // un toque de luz que roza los hombros
  const roce = o.createLinearGradient(0, H * 0.2, W, H * 0.9);
  roce.addColorStop(0, 'rgba(255,222,178,0.10)');
  roce.addColorStop(1, 'rgba(20,30,60,0.12)');
  o.fillStyle = roce;
  o.fillRect(0, 0, W, H);

  vineta(o);
  grano(o, semilla);

  return out.toDataURL('image/jpeg', 0.92);
}

// ---------------------------------------------------------------- fotos reales
// Si el operador deja fotos suyas en public/samples/ (1, 2 y 3, en jpg/jpeg/
// png/webp), las vistas previas las usan en vez de las siluetas dibujadas.
// Son archivos locales, así que la cabina sigue funcionando sin internet.
const CARPETA_MUESTRAS = 'samples';
const EXTENSIONES = ['jpg', 'jpeg', 'png', 'webp'];

function existe(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

async function rutaDe(n) {
  for (const ext of EXTENSIONES) {
    const src = `${import.meta.env?.BASE_URL || '/'}${CARPETA_MUESTRAS}/${n}.${ext}`;
    // eslint-disable-next-line no-await-in-loop
    if (await existe(src)) return src;
  }
  return null;
}

async function fotosDelOperador() {
  const rutas = await Promise.all([rutaDe(1), rutaDe(2), rutaDe(3)]);
  return rutas.every(Boolean) ? rutas : null;
}

let cache = null;

/**
 * Tres tomas de muestra (se resuelven una sola vez por sesión): las fotos que
 * el operador haya puesto en public/samples/ o, si no hay, las dibujadas.
 */
export async function getSamplePhotos() {
  if (cache) return cache;
  cache = (await fotosDelOperador())
    || [tomaDeMuestra(0), tomaDeMuestra(1), tomaDeMuestra(2)];
  return cache;
}
