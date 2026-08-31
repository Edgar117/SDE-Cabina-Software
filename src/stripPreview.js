import { renderStrip } from './stripRenderer.js';
import { listStripTemplates } from './stripTemplates.js';

let placeholderPhotos = null;

function makePlaceholderPhoto(hue, variant) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, `hsl(${hue}, 35%, ${62 + variant * 5}%)`);
  grad.addColorStop(1, `hsl(${hue}, 28%, ${48 + variant * 4}%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.ellipse(320, 165 + variant * 8, 55, 65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(260, 230 + variant * 6, 120, 140);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export function getPlaceholderPhotos() {
  if (!placeholderPhotos) {
    placeholderPhotos = [
      makePlaceholderPhoto(25, 0),
      makePlaceholderPhoto(200, 1),
      makePlaceholderPhoto(340, 2),
    ];
  }
  return placeholderPhotos;
}

export async function renderStripTemplatePreview(templateId, branding) {
  const previewBranding = { ...branding, stripTemplateId: templateId };
  return renderStrip(getPlaceholderPhotos(), previewBranding);
}

export async function renderAllStripPreviews(branding, onPreviewReady) {
  const templates = listStripTemplates();
  const results = {};

  for (const tpl of templates) {
    results[tpl.id] = await renderStripTemplatePreview(tpl.id, branding);
    if (onPreviewReady) onPreviewReady(tpl.id, results[tpl.id]);
  }

  return results;
}
