import {
  listJsonTemplates,
  getJsonTemplateById,
} from './jsonTemplates/loader.js';
import {
  renderAllJsonTemplatePreviews,
  renderActiveTemplatePreview,
} from './stripPreview.js';

const CATEGORY_LABELS = {
  cumpleanos: 'Cumpleaños',
  boda: 'Boda',
  xv: 'XV Años',
  xv_anos: 'XV Años',
  corporativo: 'Corporativo',
  general: 'General',
};

export function initTemplatesPanel({
  branding,
  saveBranding,
  onTemplateApplied,
  scheduleStripPreviewRefresh,
}) {
  const panel = document.getElementById('panel-templates');
  const navButtons = document.querySelectorAll('[data-admin-panel]');
  const grid = document.getElementById('json-templates-grid');
  const previewImg = document.getElementById('json-template-live-preview');
  const previewStatus = document.getElementById('json-template-preview-status');
  const detailName = document.getElementById('json-template-detail-name');
  const detailDesc = document.getElementById('json-template-detail-desc');
  const detailCategory = document.getElementById('json-template-detail-category');
  const detailPath = document.getElementById('json-template-detail-path');
  const btnUseTemplate = document.getElementById('btn-use-json-template');
  const btnRefreshPreview = document.getElementById('btn-refresh-json-preview');

  if (!panel || !grid) return;

  let templates = [];
  let selectedId = branding.jsonTemplateId || null;
  let previewTimer = null;

  function setActivePanel(panelId) {
    document.querySelectorAll('.admin-panel').forEach((el) => {
      el.classList.toggle('hidden', el.id !== `panel-${panelId}`);
    });
    navButtons.forEach((btn) => {
      const isActive = btn.dataset.adminPanel === panelId;
      btn.classList.toggle('nav-link-active', isActive);
      btn.classList.toggle('nav-link-idle', !isActive);
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
    if (panelId === 'templates') refreshTemplatesPanel();
  }

  function highlightSelectedCard() {
    grid.querySelectorAll('.json-template-card').forEach((card) => {
      const isSelected = card.dataset.templateId === selectedId;
      card.querySelector('.json-template-highlight')?.classList.toggle('hidden', !isSelected);
      card.querySelector('.json-template-check')?.classList.toggle('hidden', !isSelected);
      card.querySelector('.json-template-check')?.classList.toggle('flex', isSelected);
      const inner = card.querySelector('.json-template-inner');
      inner?.classList.toggle('border-2', isSelected);
      inner?.classList.toggle('border-primary', isSelected);
      inner?.classList.toggle('border', !isSelected);
      inner?.classList.toggle('border-outline-variant', !isSelected);
    });
  }

  async function updateLivePreview() {
    if (!selectedId || !previewImg) return;
    if (previewStatus) {
      previewStatus.textContent = 'Generando vista previa...';
      previewStatus.classList.add('loading');
    }
    try {
      const previewBranding = { ...branding, templateMode: 'json', jsonTemplateId: selectedId };
      const dataUrl = await renderActiveTemplatePreview(previewBranding);
      previewImg.src = dataUrl;
      previewImg.classList.remove('hidden');
      if (previewStatus) previewStatus.textContent = 'Vista previa con tus textos actuales';
    } catch (err) {
      console.error(err);
      if (previewStatus) previewStatus.textContent = 'Error al generar la vista previa';
    } finally {
      previewStatus?.classList.remove('loading');
    }
  }

  function scheduleLivePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => updateLivePreview(), 400);
  }

  async function updateDetail() {
    if (!selectedId) {
      detailName.textContent = 'Selecciona una plantilla';
      detailDesc.textContent = '';
      detailCategory.textContent = '';
      detailPath.textContent = '';
      previewImg?.classList.add('hidden');
      return;
    }

    const entry = templates.find((t) => t.id === selectedId);
    if (!entry) return;

    try {
      const pack = await getJsonTemplateById(selectedId);
      detailName.textContent = pack.definition.name || entry.name;
      detailDesc.textContent = pack.definition.description || '';
      detailCategory.textContent = CATEGORY_LABELS[entry.category] || entry.category;
      detailPath.textContent = `public/templates/${entry.folder}/template.json`;
    } catch {
      detailName.textContent = entry.name;
      detailDesc.textContent = '';
      detailCategory.textContent = CATEGORY_LABELS[entry.category] || entry.category;
      detailPath.textContent = `public/templates/${entry.folder}/template.json`;
    }

    scheduleLivePreview();
  }

  function selectTemplate(templateId) {
    selectedId = templateId;
    highlightSelectedCard();
    updateDetail();
  }

  function applySelectedTemplate() {
    if (!selectedId) return;
    branding.templateMode = 'json';
    branding.jsonTemplateId = selectedId;
    saveBranding(branding);
    highlightSelectedCard();
    if (onTemplateApplied) onTemplateApplied(selectedId);
    if (scheduleStripPreviewRefresh) scheduleStripPreviewRefresh();
    scheduleLivePreview();
  }

  async function buildGrid() {
    grid.innerHTML = '';
    if (previewStatus) previewStatus.textContent = 'Cargando plantillas...';

    try {
      templates = await listJsonTemplates();
    } catch (err) {
      console.error(err);
      grid.innerHTML =
        '<p class="font-label-sm text-label-sm text-outline">No se pudieron cargar las plantillas.</p>';
      return;
    }

    for (const tpl of templates) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className =
        'json-template-card flex-none w-36 snap-start group cursor-pointer relative text-left';
      card.dataset.templateId = tpl.id;

      card.innerHTML = `
        <div class="json-template-highlight absolute inset-0 bg-primary/10 rounded-lg scale-[1.03] transition-transform z-0 hidden"></div>
        <div class="json-template-inner relative z-10 bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden h-52 flex flex-col items-center p-2 group-hover:border-primary/50 group-hover:shadow-md transition-all">
          <div class="json-template-check absolute top-2 right-2 bg-primary text-on-primary rounded-full w-6 h-6 items-center justify-center z-20 shadow-sm hidden">
            <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1">check</span>
          </div>
          <img src="${tpl.previewUrl}" alt="${tpl.name}" class="w-full h-full object-contain bg-white rounded" loading="lazy" />
        </div>
        <p class="json-template-name text-center font-label-sm text-label-sm text-on-surface-variant mt-2 group-hover:text-primary transition-colors">${tpl.name}</p>
        <p class="text-center font-label-sm text-label-sm text-outline text-[10px] uppercase tracking-wide">${CATEGORY_LABELS[tpl.category] || tpl.category}</p>
      `;

      card.addEventListener('click', () => selectTemplate(tpl.id));
      card.addEventListener('dblclick', () => {
        selectTemplate(tpl.id);
        applySelectedTemplate();
      });

      grid.appendChild(card);
    }

    highlightSelectedCard();
    if (!selectedId && templates.length > 0) {
      selectTemplate(branding.jsonTemplateId || templates[0].id);
    } else {
      updateDetail();
    }

    if (previewStatus) previewStatus.textContent = '';

    renderAllJsonTemplatePreviews(
      { ...branding, templateMode: 'json', jsonTemplateId: selectedId },
      (templateId, dataUrl) => {
        const card = grid.querySelector(`[data-template-id="${templateId}"] img`);
        if (card) card.src = dataUrl;
      }
    ).catch(console.error);
  }

  async function refreshTemplatesPanel() {
    await buildGrid();
  }

  navButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.classList.contains('nav-link-disabled')) return;
      setActivePanel(btn.dataset.adminPanel);
    });
  });

  btnUseTemplate?.addEventListener('click', applySelectedTemplate);
  btnRefreshPreview?.addEventListener('click', () => updateLivePreview());

  return {
    setActivePanel,
    refreshTemplatesPanel,
    scheduleLivePreview,
    applySelectedTemplate,
    getSelectedId: () => selectedId,
  };
}
