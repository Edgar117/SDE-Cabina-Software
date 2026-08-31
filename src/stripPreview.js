import { renderStrip } from './stripRenderer.js';
import { listStripTemplates } from './stripTemplates.js';
import { listJsonTemplates } from './jsonTemplates/loader.js';

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
  const previewBranding = { ...branding, stripTemplateId: templateId, templateMode: 'builtin' };
  return renderStrip(getPlaceholderPhotos(), previewBranding);
}

export async function renderJsonTemplatePreviewForId(templateId, branding) {
  const previewBranding = {
    ...branding,
    templateMode: 'json',
    jsonTemplateId: templateId,
  };
  return renderStrip(getPlaceholderPhotos(), previewBranding);
}

export async function renderAllStripPreviews(branding, onPreviewReady) {
  const results = {};

  if (branding.templateMode === 'json' && branding.jsonTemplateId) {
    const dataUrl = await renderJsonTemplatePreviewForId(branding.jsonTemplateId, branding);
    results[branding.jsonTemplateId] = dataUrl;
    if (onPreviewReady) onPreviewReady(branding.jsonTemplateId, dataUrl);
    return results;
  }

  const templates = listStripTemplates();
  for (const tpl of templates) {
    results[tpl.id] = await renderStripTemplatePreview(tpl.id, branding);
    if (onPreviewReady) onPreviewReady(tpl.id, results[tpl.id]);
  }

  return results;
}

export async function renderAllJsonTemplatePreviews(branding, onPreviewReady) {
  const templates = await listJsonTemplates();
  const results = {};

  for (const tpl of templates) {
    results[tpl.id] = await renderJsonTemplatePreviewForId(tpl.id, branding);
    if (onPreviewReady) onPreviewReady(tpl.id, results[tpl.id]);
  }

  return results;
}

export async function renderActiveTemplatePreview(branding) {
  if (branding.templateMode === 'json' && branding.jsonTemplateId) {
    return renderJsonTemplatePreviewForId(branding.jsonTemplateId, branding);
  }
  return renderStripTemplatePreview(branding.stripTemplateId || 'clasico', branding);
}
