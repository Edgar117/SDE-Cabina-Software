import { loadImage } from './utils.js';
import { getStripColors } from './themes.js';
import { getStripTemplate } from './stripTemplates.js';

/** Impresión: hoja 10×15 cm, dos strips de 5×15 cm */
const PRINT_DPI = 300;
export const PRINT_WIDTH_CM = 10;
export const PRINT_HEIGHT_CM = 15;
export const STRIP_WIDTH_CM = 5;
export const STRIP_HEIGHT_CM = 15;

function cmToPx(cm) {
  return Math.round((cm / 2.54) * PRINT_DPI);
}

const STRIP_WIDTH = cmToPx(STRIP_WIDTH_CM);
const STRIP_HEIGHT = cmToPx(STRIP_HEIGHT_CM);
const PRINT_PAGE_WIDTH = cmToPx(PRINT_WIDTH_CM);
const PRINT_PAGE_HEIGHT = cmToPx(PRINT_HEIGHT_CM);
const PHOTO_COUNT = 3;

function resolveColors(branding, template) {
  const base = template.colors || getStripColors(branding);
  return {
    ...base,
    accent: branding.accentColor || base.accent,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function formatDate(style = 'short') {
  const d = new Date();
  if (style === 'dots') {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}·${pad(d.getMonth() + 1)}·${String(d.getFullYear()).slice(-2)}`;
  }
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function drawImageCover(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawContactFooter(ctx, w, y, footerH, branding, colors, dateStyle) {
  const accent = colors.accent;
  const small = Math.round(w * 0.038);

  ctx.fillStyle = accent;
  ctx.font = `600 ${Math.round(w * 0.042)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(branding.footerText || '', w / 2, y + 48, w - 90);

  ctx.font = `600 ${small}px Georgia, serif`;
  ctx.fillText(branding.footerHashtag || '#SDE Eventos', w / 2, y + 88, w - 70);
  ctx.fillText(branding.footerPhone || '99-92-15-90-77', w / 2, y + 118, w - 70);

  ctx.fillStyle = colors.dateColor;
  ctx.font = `${Math.round(w * 0.034)}px Georgia, serif`;
  ctx.fillText(formatDate(dateStyle), w / 2, y + footerH - 24, w - 70);
}

async function drawLogo(ctx, w, y, branding) {
  if (!branding.logoDataUrl) return 0;
  try {
    const logo = await loadImage(branding.logoDataUrl);
    const logoH = 48;
    const logoW = Math.min(logo.width * (logoH / logo.height), 100);
    ctx.drawImage(logo, w / 2 - logoW / 2, y, logoW, logoH);
    return logoH + 12;
  } catch {
    return 0;
  }
}

function calcLayout(headerH = 200, footerH = 200, gap = 18) {
  const margin = 20;
  const photoAreaTop = headerH + margin;
  const photoAreaBottom = STRIP_HEIGHT - footerH - margin;
  const photoAreaH = photoAreaBottom - photoAreaTop;
  const slotH = (photoAreaH - gap * (PHOTO_COUNT - 1)) / PHOTO_COUNT;
  const padX = Math.round(STRIP_WIDTH * 0.07);
  const photoW = STRIP_WIDTH - padX * 2;
  return { headerH, footerH, gap, photoAreaTop, photoAreaBottom, photoAreaH, slotH, padX, photoW, margin };
}

async function drawPhotoAreaBackground(ctx, branding, L) {
  if (!branding.stripBackgroundDataUrl) return;
  try {
    const bg = await loadImage(branding.stripBackgroundDataUrl);
    const top = L.photoAreaTop;
    const height = L.photoAreaBottom - top;
    drawImageCover(ctx, bg, 0, top, STRIP_WIDTH, height);
  } catch {
    /* fondo opcional */
  }
}

/* —— Fondos decorativos —— */
function drawDamaskPattern(ctx, w, h, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 40; i++) {
    const x = (i * 137) % w;
    const y = (i * 89) % h;
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.arc(x, y, 18 + (i % 12), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMapGrid(ctx, w, h) {
  ctx.strokeStyle = 'rgba(74, 122, 116, 0.2)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawGlitter(ctx, w, h) {
  for (let i = 0; i < 80; i++) {
    const x = (i * 97) % w;
    const y = (i * 53) % h;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + (i % 5) * 0.08})`;
    ctx.fillRect(x, y, 2 + (i % 3), 2 + (i % 3));
  }
}

function drawPhotoStandard(ctx, img, x, y, w, h, colors) {
  const pad = 6;
  ctx.fillStyle = colors.photoBg;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
  ctx.save();
  roundRect(ctx, x + pad, y + pad, w - pad * 2, h - pad * 2, 4);
  ctx.clip();
  drawImageCover(ctx, img, x + pad, y + pad, w - pad * 2, h - pad * 2);
  ctx.restore();
}

function drawPhotoGoldFrame(ctx, img, x, y, w, h) {
  ctx.fillStyle = '#1a1008';
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 5;
  roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 3);
  ctx.stroke();
  ctx.strokeStyle = '#f0d78c';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 10, y + 10, w - 20, h - 20, 2);
  ctx.stroke();
  ctx.save();
  roundRect(ctx, x + 14, y + 14, w - 28, h - 28, 2);
  ctx.clip();
  drawImageCover(ctx, img, x + 14, y + 14, w - 28, h - 28);
  ctx.restore();
}

function drawPhotoWhiteBorder(ctx, img, x, y, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.save();
  const inset = 8;
  ctx.beginPath();
  ctx.rect(x + inset, y + inset, w - inset * 2, h - inset * 2);
  ctx.clip();
  drawImageCover(ctx, img, x + inset, y + inset, w - inset * 2, h - inset * 2);
  ctx.restore();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
}

/* —— Plantillas —— */
async function layoutClasico(ctx, images, branding, colors) {
  const L = calcLayout();
  ctx.fillStyle = colors.stripBg;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

  const margin = 14;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 5;
  roundRect(ctx, margin, margin, STRIP_WIDTH - margin * 2, STRIP_HEIGHT - margin * 2, 10);
  ctx.stroke();

  const gradH = ctx.createLinearGradient(0, 0, 0, L.headerH);
  gradH.addColorStop(0, colors.headerTop);
  gradH.addColorStop(1, colors.headerBottom);
  ctx.fillStyle = gradH;
  ctx.fillRect(margin + 8, margin + 8, STRIP_WIDTH - margin * 2 - 16, L.headerH - 8);

  const fy = STRIP_HEIGHT - L.footerH - margin;
  const gradF = ctx.createLinearGradient(0, fy, 0, STRIP_HEIGHT - margin);
  gradF.addColorStop(0, colors.footerTop);
  gradF.addColorStop(1, colors.footerBottom);
  ctx.fillStyle = gradF;
  ctx.fillRect(margin + 8, fy, STRIP_WIDTH - margin * 2 - 16, L.footerH - 8);

  const logoOff = await drawLogo(ctx, STRIP_WIDTH, margin + 20, branding);
  ctx.fillStyle = colors.accent;
  ctx.font = `bold ${Math.round(STRIP_WIDTH * 0.065)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(branding.headerText || '', STRIP_WIDTH / 2, margin + 50 + logoOff, STRIP_WIDTH - 80);

  drawContactFooter(ctx, STRIP_WIDTH, fy, L.footerH, branding, colors, 'short');

  await drawPhotoAreaBackground(ctx, branding, L);

  images.forEach((img, i) => {
    const y = L.photoAreaTop + i * (L.slotH + L.gap);
    drawPhotoStandard(ctx, img, L.padX, y, L.photoW, L.slotH, colors);
  });
}

async function layoutRomantico(ctx, images, branding, colors) {
  const L = calcLayout(180, 200);
  ctx.fillStyle = colors.stripBg;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
  drawDamaskPattern(ctx, STRIP_WIDTH, STRIP_HEIGHT, '#e8b4b8');

  ctx.fillStyle = colors.headerTop;
  ctx.fillRect(0, 0, STRIP_WIDTH, L.headerH);
  ctx.font = `italic ${Math.round(STRIP_WIDTH * 0.055)}px Georgia, serif`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText('♥  ♥  ♥', STRIP_WIDTH / 2, 36);
  ctx.font = `italic bold ${Math.round(STRIP_WIDTH * 0.068)}px Georgia, serif`;
  ctx.fillText(branding.headerText || '', STRIP_WIDTH / 2, 95, STRIP_WIDTH - 60);

  const fy = STRIP_HEIGHT - L.footerH;
  ctx.fillStyle = colors.footerTop;
  ctx.fillRect(0, fy, STRIP_WIDTH, L.footerH);
  drawContactFooter(ctx, STRIP_WIDTH, fy, L.footerH, branding, colors, 'short');

  await drawPhotoAreaBackground(ctx, branding, L);

  images.forEach((img, i) => {
    const y = L.photoAreaTop + i * (L.slotH + L.gap);
    drawPhotoWhiteBorder(ctx, img, L.padX, y, L.photoW, L.slotH);
    ctx.strokeStyle = '#e8b4b8';
    ctx.lineWidth = 3;
    roundRect(ctx, L.padX - 2, y - 2, L.photoW + 4, L.slotH + 4, 6);
    ctx.stroke();
  });
}

async function layoutElegante(ctx, images, branding, colors) {
  const L = calcLayout(160, 190);
  ctx.fillStyle = colors.stripBg;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 50);
  ctx.lineTo(STRIP_WIDTH - 40, 50);
  ctx.stroke();

  ctx.font = `italic ${Math.round(STRIP_WIDTH * 0.062)}px Georgia, serif`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(branding.headerText || '', STRIP_WIDTH / 2, 110, STRIP_WIDTH - 50);

  const fy = STRIP_HEIGHT - L.footerH;
  ctx.fillStyle = colors.footerTop;
  ctx.fillRect(0, fy, STRIP_WIDTH, L.footerH);
  drawContactFooter(ctx, STRIP_WIDTH, fy, L.footerH, branding, colors, 'short');

  await drawPhotoAreaBackground(ctx, branding, L);

  images.forEach((img, i) => {
    const y = L.photoAreaTop + i * (L.slotH + L.gap);
    drawPhotoWhiteBorder(ctx, img, L.padX + 4, y, L.photoW - 8, L.slotH);
  });
}

async function layoutVintage(ctx, images, branding, colors) {
  const L = calcLayout(150, 180);
  ctx.fillStyle = colors.stripBg;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
  drawMapGrid(ctx, STRIP_WIDTH, STRIP_HEIGHT);

  const bannerH = 70;
  const bx = 30;
  roundRect(ctx, bx, 28, STRIP_WIDTH - 60, bannerH, 8);
  ctx.fillStyle = colors.headerTop;
  ctx.fill();
  ctx.font = `bold ${Math.round(STRIP_WIDTH * 0.055)}px Georgia, serif`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(branding.headerText || '', STRIP_WIDTH / 2, 68, STRIP_WIDTH - 80);

  const fy = STRIP_HEIGHT - L.footerH;
  ctx.fillStyle = colors.footerTop;
  ctx.fillRect(0, fy, STRIP_WIDTH, L.footerH);
  ctx.fillStyle = colors.dateColor;
  ctx.font = `bold ${Math.round(STRIP_WIDTH * 0.06)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(formatDate('dots'), STRIP_WIDTH / 2, fy + 50);
  ctx.font = `${Math.round(STRIP_WIDTH * 0.038)}px Georgia, serif`;
  ctx.fillText(branding.footerHashtag || '', STRIP_WIDTH / 2, fy + 95, STRIP_WIDTH - 60);
  ctx.fillText(branding.footerPhone || '', STRIP_WIDTH / 2, fy + 125, STRIP_WIDTH - 60);
  ctx.font = `italic ${Math.round(STRIP_WIDTH * 0.04)}px Georgia, serif`;
  ctx.fillText(branding.footerText || '', STRIP_WIDTH / 2, fy + 160, STRIP_WIDTH - 60);

  await drawPhotoAreaBackground(ctx, branding, L);

  images.forEach((img, i) => {
    const y = L.photoAreaTop + i * (L.slotH + L.gap);
    drawPhotoWhiteBorder(ctx, img, L.padX, y, L.photoW, L.slotH);
  });
}

async function layoutXv(ctx, images, branding, colors) {
  const L = calcLayout(200, 210);
  const splitY = STRIP_HEIGHT - L.footerH;

  ctx.fillStyle = '#f8e0ec';
  ctx.fillRect(0, 0, STRIP_WIDTH, splitY);
  ctx.fillStyle = colors.footerTop;
  ctx.fillRect(0, splitY, STRIP_WIDTH, L.footerH);

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc((i * 73) % STRIP_WIDTH, (i * 41) % 200, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = `italic bold ${Math.round(STRIP_WIDTH * 0.075)}px Georgia, serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(196,61,122,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText(branding.headerText || '', STRIP_WIDTH / 2, 120, STRIP_WIDTH - 50);
  ctx.shadowBlur = 0;

  ctx.font = `bold ${Math.round(STRIP_WIDTH * 0.05)}px Georgia, serif`;
  ctx.fillText(branding.footerText || '', STRIP_WIDTH / 2, splitY + 55, STRIP_WIDTH - 50);
  ctx.font = `${Math.round(STRIP_WIDTH * 0.038)}px Georgia, serif`;
  ctx.fillText(branding.footerHashtag || '', STRIP_WIDTH / 2, splitY + 100);
  ctx.fillText(branding.footerPhone || '', STRIP_WIDTH / 2, splitY + 135);
  ctx.fillText(formatDate('short'), STRIP_WIDTH / 2, splitY + 175);

  await drawPhotoAreaBackground(ctx, branding, L);

  images.forEach((img, i) => {
    const y = L.photoAreaTop + i * (L.slotH + L.gap);
    drawPhotoStandard(ctx, img, L.padX, y, L.photoW, L.slotH, {
      ...colors,
      photoBg: '#fff',
      accent: '#c43d7a',
    });
  });
}

async function layoutMarcos(ctx, images, branding, colors) {
  const L = calcLayout(120, 200);
  ctx.fillStyle = colors.stripBg;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

  ctx.font = `bold ${Math.round(STRIP_WIDTH * 0.055)}px Georgia, serif`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(branding.headerText || '', STRIP_WIDTH / 2, 75, STRIP_WIDTH - 50);

  const fy = STRIP_HEIGHT - L.footerH;
  ctx.fillStyle = colors.footerTop;
  ctx.fillRect(0, fy, STRIP_WIDTH, L.footerH);
  drawContactFooter(ctx, STRIP_WIDTH, fy, L.footerH, branding, { ...colors, accent: '#d4af37' }, 'short');

  await drawPhotoAreaBackground(ctx, branding, L);

  images.forEach((img, i) => {
    const y = L.photoAreaTop + i * (L.slotH + L.gap);
    drawPhotoGoldFrame(ctx, img, L.padX, y, L.photoW, L.slotH);
  });
}

async function layoutGlitter(ctx, images, branding, colors) {
  const L = calcLayout(130, 185);
  const grad = ctx.createLinearGradient(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
  grad.addColorStop(0, '#f0d0c0');
  grad.addColorStop(0.5, '#e8b8a0');
  grad.addColorStop(1, '#d8a890');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);
  drawGlitter(ctx, STRIP_WIDTH, STRIP_HEIGHT);

  ctx.font = `bold ${Math.round(STRIP_WIDTH * 0.058)}px Georgia, serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.fillText(branding.headerText || '', STRIP_WIDTH / 2, 80, STRIP_WIDTH - 50);
  ctx.shadowBlur = 0;

  const fy = STRIP_HEIGHT - L.footerH;
  ctx.fillStyle = 'rgba(90,60,40,0.75)';
  ctx.fillRect(0, fy, STRIP_WIDTH, L.footerH);
  drawContactFooter(ctx, STRIP_WIDTH, fy, L.footerH, branding, { ...colors, accent: '#ffffff', dateColor: '#f0e0d0' }, 'short');

  await drawPhotoAreaBackground(ctx, branding, L);

  images.forEach((img, i) => {
    const y = L.photoAreaTop + i * (L.slotH + L.gap);
    drawPhotoWhiteBorder(ctx, img, L.padX, y, L.photoW, L.slotH);
  });
}

async function layoutFiesta(ctx, images, branding, colors) {
  const L = calcLayout(150, 200);
  ctx.fillStyle = colors.stripBg;
  ctx.fillRect(0, 0, STRIP_WIDTH, STRIP_HEIGHT);

  const border = 12;
  ctx.strokeStyle = colors.borderInner;
  ctx.lineWidth = border;
  ctx.strokeRect(border / 2, border / 2, STRIP_WIDTH - border, STRIP_HEIGHT - border);

  ctx.fillStyle = colors.headerTop;
  ctx.fillRect(border, border, STRIP_WIDTH - border * 2, L.headerH - border);
  ctx.font = `bold ${Math.round(STRIP_WIDTH * 0.058)}px Georgia, serif`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText(branding.headerText || '', STRIP_WIDTH / 2, 85, STRIP_WIDTH - 70);

  const fy = STRIP_HEIGHT - L.footerH;
  const gradF = ctx.createLinearGradient(0, fy, 0, STRIP_HEIGHT);
  gradF.addColorStop(0, colors.footerTop);
  gradF.addColorStop(1, colors.footerBottom);
  ctx.fillStyle = gradF;
  ctx.fillRect(border, fy, STRIP_WIDTH - border * 2, L.footerH - border);
  drawContactFooter(ctx, STRIP_WIDTH, fy, L.footerH, branding, colors, 'short');

  await drawPhotoAreaBackground(ctx, branding, L);

  images.forEach((img, i) => {
    const y = L.photoAreaTop + i * (L.slotH + L.gap);
    drawPhotoStandard(ctx, img, L.padX, y, L.photoW, L.slotH, colors);
  });
}

const LAYOUTS = {
  clasico: layoutClasico,
  romantico: layoutRomantico,
  elegante: layoutElegante,
  vintage: layoutVintage,
  xv: layoutXv,
  marcos: layoutMarcos,
  glitter: layoutGlitter,
  fiesta: layoutFiesta,
};

export async function renderStrip(capturedPhotos, branding) {
  const template = getStripTemplate(branding.stripTemplateId);
  const colors = resolveColors(branding, template);
  const canvas = document.createElement('canvas');
  canvas.width = STRIP_WIDTH;
  canvas.height = STRIP_HEIGHT;
  const ctx = canvas.getContext('2d');

  const images = await Promise.all(capturedPhotos.map(loadImage));
  const layoutFn = LAYOUTS[template.id] || layoutClasico;
  await layoutFn(ctx, images, branding, colors);

  return canvas.toDataURL('image/jpeg', 0.95);
}

export async function renderPrintSheet(stripDataUrl) {
  const canvas = document.createElement('canvas');
  canvas.width = PRINT_PAGE_WIDTH;
  canvas.height = PRINT_PAGE_HEIGHT;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, PRINT_PAGE_WIDTH, PRINT_PAGE_HEIGHT);

  const stripImg = await loadImage(stripDataUrl);
  ctx.drawImage(stripImg, 0, 0, STRIP_WIDTH, STRIP_HEIGHT);
  ctx.drawImage(stripImg, STRIP_WIDTH, 0, STRIP_WIDTH, STRIP_HEIGHT);

  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(STRIP_WIDTH, 0);
  ctx.lineTo(STRIP_WIDTH, PRINT_PAGE_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  return canvas.toDataURL('image/jpeg', 0.95);
}

export const PRINT_WIDTH_IN = PRINT_WIDTH_CM / 2.54;
export const PRINT_HEIGHT_IN = PRINT_HEIGHT_CM / 2.54;
export const STRIP_WIDTH_IN = STRIP_WIDTH_CM / 2.54;
export const STRIP_HEIGHT_IN = STRIP_HEIGHT_CM / 2.54;
