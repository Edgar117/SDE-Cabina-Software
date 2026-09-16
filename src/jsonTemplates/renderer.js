import { loadImage } from '../utils.js';
import { getJsonTemplateById } from './loader.js';

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

function resolveBinding(binding, branding) {
  const map = {
    headerText: branding.headerText || 'SDE Eventos',
    subtitleText: branding.subtitleText || '',
    eventLabel: branding.eventLabel || '',
    footerText: branding.footerText || '',
    footerHashtag: branding.footerHashtag || '',
    footerPhone: branding.footerPhone || '',
    date: formatDate(),
  };
  return map[binding] ?? '';
}

function resolveText(element, branding) {
  if (element.binding) {
    const value = resolveBinding(element.binding, branding);
    return value || element.text || '';
  }
  return element.text || '';
}

function scale(value, from, to) {
  return (value / from) * to;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r ?? 0, w / 2, h / 2);
  if (radius <= 0) {
    ctx.rect(x, y, w, h);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawImageFit(ctx, img, x, y, w, h, fit = 'cover') {
  if (fit === 'contain') {
    const scaleFactor = Math.min(w / img.width, h / img.height);
    const dw = img.width * scaleFactor;
    const dh = img.height * scaleFactor;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    return;
  }

  const scaleFactor = Math.max(w / img.width, h / img.height);
  const sw = w / scaleFactor;
  const sh = h / scaleFactor;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function photoIndexFromId(id) {
  const match = String(id || '').match(/(\d+)/);
  return match ? Math.max(0, Number(match[1]) - 1) : 0;
}

function drawPhotoPlaceholder(ctx, x, y, w, h, radius) {
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

async function loadTemplateImage(baseUrl, filename) {
  return loadImage(`${baseUrl}/${filename}`, { crossOrigin: 'anonymous' });
}

async function drawLogoElement(ctx, element, context, branding) {
  if (!branding.logoDataUrl) return;

  try {
    const img = await loadImage(branding.logoDataUrl);
    const sx = (v) => scale(v, context.srcW, context.outW);
    const sy = (v) => scale(v, context.srcH, context.outH);

    const config = element || { x: 300, y: 20, width: 140, height: 68, align: 'center' };
    const anchorX = sx(config.x ?? 300);
    const y = sy(config.y ?? 28);
    let w = sx(config.width ?? 100);
    let h = sy(config.height ?? 48);

    if (config.fit !== 'stretch') {
      const aspect = img.width / img.height;
      const boxAspect = w / h;
      if (aspect > boxAspect) {
        h = w / aspect;
      } else {
        w = h * aspect;
      }
    }

    let x = anchorX;
    const align = config.align || 'left';
    if (align === 'center') x = anchorX - w / 2;
    if (align === 'right') x = anchorX - w;

    ctx.drawImage(img, x, y, w, h);
  } catch (err) {
    console.warn('Logo no cargado:', err.message);
  }
}

async function drawElement(ctx, element, context) {
  const { branding, photos, baseUrl, outW, outH } = context;
  const sx = (v) => scale(v, context.srcW, outW);
  const sy = (v) => scale(v, context.srcH, outH);

  switch (element.type) {
    case 'background': {
      if (element.color) {
        ctx.fillStyle = element.color;
        ctx.fillRect(0, 0, outW, outH);
        break;
      }
      if (element.src) {
        try {
          const img = await loadTemplateImage(baseUrl, element.src);
          ctx.drawImage(img, 0, 0, outW, outH);
        } catch (err) {
          console.warn(`Fondo no cargado (${element.src}):`, err.message);
        }
      }
      break;
    }
    case 'photo': {
      const index = photoIndexFromId(element.id);
      const photo = photos[index];
      const x = sx(element.x);
      const y = sy(element.y);
      const w = sx(element.width);
      const h = sy(element.height);
      const radius = sx(element.radius || 0);

      if (!photo) {
        drawPhotoPlaceholder(ctx, x, y, w, h, radius);
        if (element.border) {
          ctx.strokeStyle = element.border;
          ctx.lineWidth = sx(element.borderWidth || 3);
          roundRect(ctx, x, y, w, h, radius);
          ctx.stroke();
        }
        break;
      }

      try {
        const img = await loadImage(photo);
        ctx.save();
        roundRect(ctx, x, y, w, h, radius);
        ctx.clip();
        drawImageFit(ctx, img, x, y, w, h, element.fit || 'cover');
        ctx.restore();

        if (element.border) {
          ctx.strokeStyle = element.border;
          ctx.lineWidth = sx(element.borderWidth || 3);
          roundRect(ctx, x, y, w, h, radius);
          ctx.stroke();
        }
      } catch (err) {
        console.warn(`Foto no cargada (${element.id}):`, err.message);
        drawPhotoPlaceholder(ctx, x, y, w, h, radius);
      }
      break;
    }
    case 'overlay': {
      if (!element.src) break;
      try {
        const img = await loadTemplateImage(baseUrl, element.src);
        const x = sx(element.x ?? 0);
        const y = sy(element.y ?? 0);
        const w = sx(element.width ?? context.srcW);
        const h = sy(element.height ?? context.srcH);
        ctx.drawImage(img, x, y, w, h);
      } catch (err) {
        console.warn(`Overlay no cargado (${element.src}):`, err.message);
      }
      break;
    }
    case 'logo':
    case 'text':
      break;
    default:
      break;
  }
}

function drawTextElement(ctx, element, context) {
  const { branding, outW } = context;
  const sx = (v) => scale(v, context.srcW, outW);
  const sy = (v) => scale(v, context.srcH, context.outH);

  const text = resolveText(element, branding);
  if (!text) return;

  const x = sx(element.x);
  const y = sy(element.y);
  const size = sy(element.size || 24);
  const weight = element.weight === 'bold' ? 'bold ' : '';
  const style = element.style === 'italic' ? 'italic ' : '';

  ctx.save();
  ctx.font = `${style}${weight}${size}px ${element.font || 'Georgia, serif'}`;
  ctx.fillStyle = element.color || '#000000';
  ctx.textAlign = element.align || 'left';
  ctx.textBaseline = 'middle';

  if (element.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = sy(4);
  }

  if (element.background) {
    const metrics = ctx.measureText(text);
    const pad = sx(element.padding || 12);
    const boxW = metrics.width + pad * 2;
    const boxH = size + pad * 1.2;
    let boxX = x;
    if (element.align === 'center') boxX = x - boxW / 2;
    if (element.align === 'right') boxX = x - boxW;
    ctx.fillStyle = element.background;
    roundRect(ctx, boxX, y - boxH / 2, boxW, boxH, sx(element.radius || 8));
    ctx.fill();
    ctx.fillStyle = element.color || '#000000';
  }

  let letterSpacing = element.letterSpacing ? sx(element.letterSpacing) : 0;
  const maxWidth = element.maxWidth ? sx(element.maxWidth) : outW - sx(40);

  // El texto lo escribe el usuario, así que puede ser mucho más largo de lo
  // que la plantilla previó. Antes se desbordaba (el camino con letterSpacing
  // ignoraba maxWidth) o se deformaba (fillText comprime horizontalmente).
  // Aquí se reduce el tamaño de letra —y el tracking, en proporción— hasta
  // que quepa, que es lo que se ve bien impreso.
  let fontSize = size;
  const setFont = (px) => {
    ctx.font = `${style}${weight}${px}px ${element.font || 'Georgia, serif'}`;
  };
  const anchoDe = (spacing) =>
    ctx.measureText(text).width + (text.length > 1 ? (text.length - 1) * spacing : 0);

  if (maxWidth > 0) {
    const minSize = size * 0.5;
    let ancho = anchoDe(letterSpacing);
    while (ancho > maxWidth && fontSize > minSize) {
      fontSize = Math.max(minSize, fontSize - Math.max(1, fontSize * 0.04));
      letterSpacing = element.letterSpacing ? sx(element.letterSpacing) * (fontSize / size) : 0;
      setFont(fontSize);
      ancho = anchoDe(letterSpacing);
    }
  }

  if (letterSpacing > 0 && text.length > 1 && element.align === 'center') {
    const chars = Array.from(text);
    const totalWidth =
      chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0) +
      (chars.length - 1) * letterSpacing;
    let startX = x - totalWidth / 2;
    for (const char of chars) {
      const charWidth = ctx.measureText(char).width;
      ctx.fillText(char, startX + charWidth / 2, y);
      startX += charWidth + letterSpacing;
    }
  } else {
    if (letterSpacing > 0) ctx.letterSpacing = `${letterSpacing}px`;
    ctx.fillText(text, x, y, maxWidth);
  }

  ctx.restore();
}

export async function renderJsonTemplateStrip(
  capturedPhotos,
  branding,
  outputWidth,
  outputHeight
) {
  const templateId = branding.jsonTemplateId;
  if (!templateId) throw new Error('Sin plantilla JSON seleccionada');

  const pack = await getJsonTemplateById(templateId);
  if (!pack?.definition) throw new Error(`Plantilla no encontrada: ${templateId}`);

  const { definition, baseUrl } = pack;
  const srcW = definition.canvas?.width || 600;
  const srcH = definition.canvas?.height || 1800;
  const outW = outputWidth;
  const outH = outputHeight;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');

  const context = {
    branding,
    photos: capturedPhotos,
    baseUrl,
    srcW,
    srcH,
    outW,
    outH,
    scaleX: outW / srcW,
    scaleY: outH / srcH,
  };

  const elements = definition.elements || [];

  if (document.fonts?.load) {
    // `fonts.ready` no basta: una fuente que la página aún no ha usado no está
    // "cargando", así que ready resuelve al instante y la primera tira de la
    // sesión se dibujaba con la letra de respaldo. Se pide cada fuente (con su
    // grosor, estilo y el texto real, para que baje el subset con ñ y acentos).
    await Promise.all(
      elements
        .filter((el) => el.type === 'text' && el.font)
        .map((el) => {
          const weight = el.weight === 'bold' ? 'bold ' : '';
          const style = el.style === 'italic' ? 'italic ' : '';
          const muestra = resolveText(el, branding) || 'Aa';
          return document.fonts
            .load(`${style}${weight}${el.size || 24}px ${el.font}`, muestra)
            .catch(() => null);
        }),
    );
    await document.fonts.ready;
  }
  const textElements = [];
  const logoElements = [];

  for (const element of elements) {
    if (element.type === 'text') {
      textElements.push(element);
      continue;
    }
    if (element.type === 'logo') {
      logoElements.push(element);
      continue;
    }
    await drawElement(ctx, element, context);
  }

  if (logoElements.length > 0) {
    for (const element of logoElements) {
      await drawLogoElement(ctx, element, context, branding);
    }
  } else if (branding.logoDataUrl) {
    await drawLogoElement(ctx, null, context, branding);
  }

  for (const element of textElements) {
    drawTextElement(ctx, element, context);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}

export async function renderJsonTemplatePreview(branding, photos, outputWidth, outputHeight) {
  return renderJsonTemplateStrip(photos, branding, outputWidth, outputHeight);
}
