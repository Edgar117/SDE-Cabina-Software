import { renderStrip } from './stripRenderer.js';
import { listStripTemplates } from './stripTemplates.js';
import { listJsonTemplates } from './jsonTemplates/loader.js';
import { getSamplePhotos } from './samplePhotos.js';

export async function renderStripTemplatePreview(templateId, branding) {
  const previewBranding = { ...branding, stripTemplateId: templateId, templateMode: 'builtin' };
  return renderStrip(await getSamplePhotos(), previewBranding);
}

export async function renderJsonTemplatePreviewForId(templateId, branding) {
  const previewBranding = {
    ...branding,
    templateMode: 'json',
    jsonTemplateId: templateId,
  };
  return renderStrip(await getSamplePhotos(), previewBranding);
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
