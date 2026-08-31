import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import {
  loadBranding,
  saveBranding,
  cheerMessages,
  finalCheerMessage,
} from './branding.js';
import {
  renderStrip,
  renderPrintSheet,
  PRINT_WIDTH_CM,
  PRINT_HEIGHT_CM,
} from './stripRenderer.js';
import {
  dataUrlToBlob,
  makeSessionId,
  sleep,
  downloadBlob,
} from './utils.js';
import { themes, getTheme, applyTheme } from './themes.js';
import { listStripTemplates, getStripTemplate } from './stripTemplates.js';
import { renderAllStripPreviews } from './stripPreview.js';

const PHOTO_COUNT = 3;
const COUNTDOWN_STEP_MS = 2000;
const COUNTDOWN_PREP_MS = 1200;
const CAPTURE_PREVIEW_MS = 2500;
const CHEER_DISPLAY_MS = 2800;
const PAUSE_BETWEEN_PHOTOS_MS = 600;

const screens = {
  welcome: document.getElementById('screen-welcome'),
  camera: document.getElementById('screen-camera'),
  review: document.getElementById('screen-review'),
};

const video = document.getElementById('video');
const captureCanvas = document.getElementById('capture-canvas');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownPrep = document.getElementById('countdown-prep');
const countdownNumber = document.getElementById('countdown-number');
const capturePreviewOverlay = document.getElementById('capture-preview-overlay');
const capturePreviewImg = document.getElementById('capture-preview-img');
const cheerOverlay = document.getElementById('cheer-overlay');
const cheerText = document.getElementById('cheer-text');
const flashOverlay = document.getElementById('flash-overlay');
const photoProgress = document.getElementById('photo-progress');
const photoCurrent = document.getElementById('photo-current');
const cameraHint = document.getElementById('camera-hint');
const btnStartPhotos = document.getElementById('btn-start-photos');
const stripPreview = document.getElementById('strip-preview');
const folderStatus = document.getElementById('folder-status');
const saveStatus = document.getElementById('save-status');
const individualPhotos = document.getElementById('individual-photos');
const inputHeaderText = document.getElementById('input-header-text');
const inputFooterText = document.getElementById('input-footer-text');
const inputFooterHashtag = document.getElementById('input-footer-hashtag');
const inputFooterPhone = document.getElementById('input-footer-phone');
const selectTheme = document.getElementById('select-theme');
const stripTemplateSelect = document.getElementById('select-strip-template');
const stripTemplateDesc = document.getElementById('strip-template-desc');
const stripTemplateGrid = document.getElementById('strip-template-grid');
const stripPreviewStatus = document.getElementById('strip-preview-status');
const inputLogo = document.getElementById('input-logo');
const logoPreview = document.getElementById('logo-preview');
const inputStripBackground = document.getElementById('input-strip-background');
const stripBgPreview = document.getElementById('strip-bg-preview');
const stripBgPreviewWrap = document.getElementById('strip-bg-preview-wrap');
const btnRemoveStripBg = document.getElementById('btn-remove-strip-bg');
const photoRail = document.getElementById('photo-rail');

let mediaStream = null;
let capturedPhotos = [];
let stripDataUrl = null;
let printSheetDataUrl = null;
let pdfBlob = null;
let isCapturing = false;
let sessionId = null;
let outputDirHandle = null;
let sessionDirHandle = null;
let branding = loadBranding();

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove('active'));
  screens[name].classList.add('active');
  document.body.classList.toggle('app-welcome', name === 'welcome');
  document.body.classList.toggle('app-booth', name !== 'welcome');
}

function supportsFolderPicker() {
  return typeof window.showDirectoryPicker === 'function';
}

function updateFolderStatus() {
  if (!folderStatus) return;
  if (outputDirHandle) {
    folderStatus.textContent = `Guardando en: ${outputDirHandle.name}`;
    folderStatus.classList.add('ready');
  } else {
    folderStatus.textContent =
      'Sin carpeta: las fotos solo se descargan al final en ZIP/PDF.';
    folderStatus.classList.remove('ready');
  }
}

function updateStripBackgroundPreview() {
  if (!stripBgPreview || !stripBgPreviewWrap) return;
  if (branding.stripBackgroundDataUrl) {
    stripBgPreview.src = branding.stripBackgroundDataUrl;
    stripBgPreviewWrap.classList.remove('hidden');
  } else {
    stripBgPreview.removeAttribute('src');
    stripBgPreviewWrap.classList.add('hidden');
  }
}

function syncBrandingFromForm(refreshPreviews = true) {
  branding.headerText = inputHeaderText.value.trim() || 'SDE Eventos';
  branding.footerText = inputFooterText.value.trim() || '¡Gracias por celebrar con nosotros!';
  branding.footerHashtag = inputFooterHashtag.value.trim() || '#SDE Eventos';
  branding.footerPhone = inputFooterPhone.value.trim() || '99-92-15-90-77';
  if (selectTheme?.value) {
    branding.themeId = selectTheme.value;
    const theme = getTheme(branding.themeId);
    branding.themeId = theme.id;
  }
  if (stripTemplateSelect?.value) {
    branding.stripTemplateId = stripTemplateSelect.value;
  }
  saveBranding(branding);
  updateStageBranding();
  updateStripTemplateDesc();
  if (refreshPreviews) scheduleStripPreviewRefresh();
}

let previewRefreshTimer = null;
let previewGeneration = 0;

function chooseStripTemplate(templateId) {
  branding.stripTemplateId = templateId;
  if (stripTemplateSelect) stripTemplateSelect.value = templateId;
  saveBranding(branding);
  updateStripTemplateDesc();
  highlightSelectedStripCard();
}

function highlightSelectedStripCard() {
  if (!stripTemplateGrid) return;
  stripTemplateGrid.querySelectorAll('.strip-template-card').forEach((card) => {
    const selected = card.dataset.templateId === branding.stripTemplateId;
    card.querySelector('.strip-template-highlight')?.classList.toggle('hidden', !selected);
    const check = card.querySelector('.strip-template-check');
    check?.classList.toggle('hidden', !selected);
    check?.classList.toggle('flex', selected);
    const inner = card.querySelector('.strip-template-inner');
    inner?.classList.toggle('border-2', selected);
    inner?.classList.toggle('border-primary', selected);
    inner?.classList.toggle('border', !selected);
    inner?.classList.toggle('border-outline-variant', !selected);
    const name = card.querySelector('.strip-template-name');
    name?.classList.toggle('text-primary', selected);
    name?.classList.toggle('font-bold', selected);
    name?.classList.toggle('text-on-surface-variant', !selected);
  });
}

function buildStripTemplateGrid() {
  if (!stripTemplateGrid) return;
  stripTemplateGrid.innerHTML = '';
  listStripTemplates().forEach((tpl) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'strip-template-card flex-none w-32 snap-start group cursor-pointer relative text-left';
    btn.dataset.templateId = tpl.id;
    btn.title = tpl.description || tpl.name;

    const highlight = document.createElement('div');
    highlight.className =
      'strip-template-highlight absolute inset-0 bg-primary/10 rounded-lg scale-[1.03] transition-transform z-0 hidden';

    const inner = document.createElement('div');
    inner.className =
      'strip-template-inner relative z-10 bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden h-48 flex flex-col items-center p-2 group-hover:border-primary/50 group-hover:shadow-md transition-all';

    const check = document.createElement('div');
    check.className =
      'strip-template-check absolute top-2 right-2 bg-primary text-on-primary rounded-full w-6 h-6 items-center justify-center z-20 shadow-sm hidden';
    check.innerHTML =
      '<span class="material-symbols-outlined text-sm" style="font-variation-settings: \'FILL\' 1">check</span>';

    const skeleton = document.createElement('div');
    skeleton.className = 'strip-thumb-skeleton';

    const img = document.createElement('img');
    img.className = 'w-full h-full object-contain';
    img.alt = `Vista previa ${tpl.name}`;
    img.hidden = true;

    const label = document.createElement('p');
    label.className =
      'strip-template-name text-center font-label-sm text-label-sm text-on-surface-variant mt-3 group-hover:text-primary transition-colors';
    label.textContent = tpl.name;

    inner.appendChild(check);
    inner.appendChild(skeleton);
    inner.appendChild(img);
    btn.appendChild(highlight);
    btn.appendChild(inner);
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      chooseStripTemplate(tpl.id);
    });

    stripTemplateGrid.appendChild(btn);
  });
  highlightSelectedStripCard();
}

function setPreviewImage(templateId, dataUrl) {
  if (!stripTemplateGrid) return;
  const card = stripTemplateGrid.querySelector(`[data-template-id="${templateId}"]`);
  if (!card) return;
  const img = card.querySelector('img');
  const skeleton = card.querySelector('.strip-thumb-skeleton');
  if (img) {
    img.src = dataUrl;
    img.hidden = false;
  }
  if (skeleton) skeleton.remove();
}

async function refreshStripPreviews() {
  if (!stripTemplateGrid) return;
  const generation = ++previewGeneration;

  if (stripPreviewStatus) {
    stripPreviewStatus.textContent = 'Generando vistas previa...';
    stripPreviewStatus.classList.add('loading');
  }

  stripTemplateGrid.querySelectorAll('.strip-template-card').forEach((card) => {
    const inner = card.querySelector('.strip-template-inner');
    const img = card.querySelector('img');
    if (img) {
      img.hidden = true;
      img.removeAttribute('src');
    }
    if (inner && !inner.querySelector('.strip-thumb-skeleton')) {
      const skeleton = document.createElement('div');
      skeleton.className = 'strip-thumb-skeleton';
      const check = inner.querySelector('.strip-template-check');
      if (check?.nextSibling) {
        inner.insertBefore(skeleton, check.nextSibling);
      } else {
        inner.appendChild(skeleton);
      }
    }
  });

  syncBrandingFromForm(false);

  await renderAllStripPreviews(branding, (templateId, dataUrl) => {
    if (generation !== previewGeneration) return;
    setPreviewImage(templateId, dataUrl);
  });

  if (generation !== previewGeneration) return;

  if (stripPreviewStatus) {
    stripPreviewStatus.textContent = 'Clic en una plantilla para seleccionarla';
    stripPreviewStatus.classList.remove('loading');
  }
}

function scheduleStripPreviewRefresh() {
  clearTimeout(previewRefreshTimer);
  previewRefreshTimer = setTimeout(() => refreshStripPreviews(), 600);
}

function updateStripTemplateDesc() {
  if (!stripTemplateDesc) return;
  const tpl = getStripTemplate(branding.stripTemplateId || 'clasico');
  stripTemplateDesc.textContent = tpl.description || '';
}

function populateStripTemplateSelect() {
  if (!stripTemplateSelect) return;
  stripTemplateSelect.innerHTML = '';
  listStripTemplates().forEach((tpl) => {
    const opt = document.createElement('option');
    opt.value = tpl.id;
    opt.textContent = tpl.name;
    stripTemplateSelect.appendChild(opt);
  });
  stripTemplateSelect.value = branding.stripTemplateId || 'clasico';
  updateStripTemplateDesc();
  buildStripTemplateGrid();
  refreshStripPreviews();
}

function applyThemeFromSelect(updateTexts = false) {
  const theme = getTheme(selectTheme.value);
  branding.themeId = theme.id;
  branding.accentColor = theme.strip.accent;
  applyTheme(theme.id);

  if (updateTexts) {
    inputHeaderText.value = theme.headerTextDefault;
    inputFooterText.value = theme.footerTextDefault;
    branding.headerText = theme.headerTextDefault;
    branding.footerText = theme.footerTextDefault;
    if (folderStatus) {
      folderStatus.textContent = `Plantilla "${theme.name}" aplicada`;
      folderStatus.classList.add('ready');
    }
  }

  saveBranding(branding);
  updateStageBranding();
}

function populateThemeSelect() {
  if (!selectTheme) return;
  selectTheme.innerHTML = '';
  Object.values(themes).forEach((theme) => {
    const opt = document.createElement('option');
    opt.value = theme.id;
    opt.textContent = theme.name;
    selectTheme.appendChild(opt);
  });
  selectTheme.value = branding.themeId || 'teatro';
}

function updateStageBranding() {
  document.querySelectorAll('[data-brand-header]').forEach((el) => {
    el.textContent = branding.headerText;
  });
  document.querySelectorAll('[data-brand-hashtag]').forEach((el) => {
    el.textContent = branding.footerHashtag || '#SDE Eventos';
  });
  document.querySelectorAll('[data-brand-phone]').forEach((el) => {
    el.textContent = branding.footerPhone || '99-92-15-90-77';
  });
}

function clearPhotoRail() {
  if (!photoRail) return;
  photoRail.innerHTML = '';
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const slot = document.createElement('div');
    slot.className = 'rail-slot empty';
    slot.innerHTML = `<span>${i + 1}</span>`;
    photoRail.appendChild(slot);
  }
}

function updatePhotoRail() {
  if (!photoRail) return;
  photoRail.innerHTML = '';
  for (let i = 0; i < PHOTO_COUNT; i++) {
    const slot = document.createElement('div');
    slot.className = 'rail-slot';
    if (capturedPhotos[i]) {
      slot.classList.add('filled');
      const img = document.createElement('img');
      img.src = capturedPhotos[i];
      img.alt = `Foto ${i + 1}`;
      slot.appendChild(img);
    } else {
      slot.classList.add('empty');
      slot.innerHTML = `<span>${i + 1}</span>`;
    }
    photoRail.appendChild(slot);
  }
}

function toggleIniciarButton(show) {
  btnStartPhotos.classList.toggle('hidden', !show);
}

function applyBrandingToForm() {
  populateThemeSelect();
  populateStripTemplateSelect();
  inputHeaderText.value = branding.headerText;
  inputFooterText.value = branding.footerText;
  inputFooterHashtag.value = branding.footerHashtag || '#SDE Eventos';
  inputFooterPhone.value = branding.footerPhone || '99-92-15-90-77';
  if (selectTheme) selectTheme.value = branding.themeId || 'teatro';
  applyTheme(branding.themeId || 'teatro');
  if (branding.logoDataUrl) {
    logoPreview.src = branding.logoDataUrl;
    logoPreview.classList.remove('hidden');
  } else {
    logoPreview.classList.add('hidden');
  }
  updateStripBackgroundPreview();
}

async function pickOutputFolder() {
  if (!supportsFolderPicker()) {
    alert(
      'Tu navegador no permite elegir carpeta automática. Usa Chrome o Edge. Podrás descargar un ZIP con todas las fotos al final.'
    );
    return;
  }
  try {
    outputDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    updateFolderStatus();
  } catch (err) {
    if (err.name !== 'AbortError') console.error(err);
  }
}

async function ensureSessionFolder() {
  if (!outputDirHandle || !sessionId) return null;
  sessionDirHandle = await outputDirHandle.getDirectoryHandle(sessionId, {
    create: true,
  });
  return sessionDirHandle;
}

async function saveBlobToFolder(dirHandle, filename, blob) {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function saveIndividualPhoto(dataUrl, index) {
  const blob = dataUrlToBlob(dataUrl);
  const filename = `foto-${index + 1}.jpg`;
  if (sessionDirHandle) {
    await saveBlobToFolder(sessionDirHandle, filename, blob);
  }
}

function buildPdfBlob() {
  if (!printSheetDataUrl) return null;

  const pdf = new jsPDF({
    unit: 'cm',
    format: [PRINT_WIDTH_CM, PRINT_HEIGHT_CM],
    orientation: 'portrait',
    compress: true,
  });

  pdf.addImage(printSheetDataUrl, 'JPEG', 0, 0, PRINT_WIDTH_CM, PRINT_HEIGHT_CM);
  return pdf.output('blob');
}

async function saveStripAndPdf() {
  if (!sessionDirHandle) return;

  if (stripDataUrl) {
    await saveBlobToFolder(sessionDirHandle, 'strip.jpg', dataUrlToBlob(stripDataUrl));
  }
  if (printSheetDataUrl) {
    await saveBlobToFolder(
      sessionDirHandle,
      'imprimir-2-strips.jpg',
      dataUrlToBlob(printSheetDataUrl)
    );
  }

  pdfBlob = buildPdfBlob();
  if (pdfBlob) {
    await saveBlobToFolder(sessionDirHandle, 'imprimir-2-strips.pdf', pdfBlob);
  }
}

function renderIndividualPhotos() {
  individualPhotos.innerHTML = '';
  capturedPhotos.forEach((dataUrl, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'photo-thumb';
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Foto ${index + 1}`;
    const label = document.createElement('div');
    label.className = 'photo-label';
    label.textContent = `Foto ${index + 1}`;
    wrap.appendChild(img);
    wrap.appendChild(label);
    individualPhotos.appendChild(wrap);
  });
}

function updateSaveStatus(message, isWarn = false) {
  saveStatus.textContent = message;
  saveStatus.classList.toggle('warn', isWarn);
}

async function initCamera() {
  if (mediaStream) return;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });
    video.srcObject = mediaStream;
  } catch (err) {
    console.error(err);
    alert(
      'No se pudo acceder a la cámara. Revisa permisos en el navegador y que ninguna otra app la esté usando.'
    );
    throw err;
  }
}

async function startSession() {
  syncBrandingFromForm();
  applyTheme(branding.themeId || 'teatro');
  await initCamera();
  capturedPhotos = [];
  stripDataUrl = null;
  printSheetDataUrl = null;
  pdfBlob = null;
  sessionId = null;
  sessionDirHandle = null;
  isCapturing = false;
  toggleIniciarButton(true);
  cameraHint.classList.remove('hidden');
  photoProgress.classList.add('hidden');
  saveStatus.textContent = '';
  individualPhotos.innerHTML = '';
  clearPhotoRail();
  showScreen('camera');
}

function captureFrame() {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  captureCanvas.width = vw;
  captureCanvas.height = vh;
  const ctx = captureCanvas.getContext('2d');

  ctx.translate(vw, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, vw, vh);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  return captureCanvas.toDataURL('image/jpeg', 0.92);
}

async function runCountdown(seconds) {
  countdownOverlay.classList.remove('hidden');
  countdownNumber.textContent = '';
  countdownPrep.classList.remove('hidden');
  await sleep(COUNTDOWN_PREP_MS);
  countdownPrep.classList.add('hidden');

  for (let i = seconds; i >= 1; i--) {
    countdownNumber.textContent = i;
    await sleep(COUNTDOWN_STEP_MS);
  }
  countdownOverlay.classList.add('hidden');
  countdownNumber.textContent = '';
}

async function showCapturePreview(dataUrl) {
  capturePreviewImg.src = dataUrl;
  capturePreviewOverlay.classList.remove('hidden');
  await sleep(CAPTURE_PREVIEW_MS);
  capturePreviewOverlay.classList.add('hidden');
  capturePreviewImg.src = '';
}

async function showCheer(message) {
  cheerText.textContent = message;
  cheerOverlay.classList.remove('hidden');
  await sleep(CHEER_DISPLAY_MS);
  cheerOverlay.classList.add('hidden');
}

function triggerFlash() {
  flashOverlay.classList.remove('hidden');
  flashOverlay.classList.add('flash');
  flashOverlay.addEventListener(
    'animationend',
    () => {
      flashOverlay.classList.remove('flash');
      flashOverlay.classList.add('hidden');
    },
    { once: true }
  );
}

async function capturePhotoSequence() {
  if (isCapturing) return;
  isCapturing = true;
  toggleIniciarButton(false);
  cameraHint.classList.add('hidden');
  photoProgress.classList.remove('hidden');
  capturedPhotos = [];
  clearPhotoRail();

  sessionId = makeSessionId();
  if (outputDirHandle) {
    try {
      await ensureSessionFolder();
    } catch (err) {
      console.error(err);
      sessionDirHandle = null;
    }
  }

  for (let i = 0; i < PHOTO_COUNT; i++) {
    photoCurrent.textContent = String(i + 1);
    await runCountdown(3);
    triggerFlash();
    const frame = captureFrame();
    if (frame) {
      capturedPhotos.push(frame);
      updatePhotoRail();
      await showCapturePreview(frame);
      try {
        await saveIndividualPhoto(frame, i);
      } catch (err) {
        console.error('Error guardando foto individual:', err);
      }
    }

    if (i < PHOTO_COUNT - 1) {
      await showCheer(cheerMessages[i]);
      await sleep(PAUSE_BETWEEN_PHOTOS_MS);
    }
  }

  photoProgress.classList.add('hidden');
  await showCheer(finalCheerMessage);

  try {
    await buildStrip();
    renderIndividualPhotos();

    try {
      await saveStripAndPdf();
      if (sessionDirHandle) {
        updateSaveStatus(
          `Sesión ${sessionId}: fotos + strip + PDF (2 copias) guardados en carpeta.`
        );
      } else {
        updateSaveStatus(
          'Fotos en memoria. Descarga el ZIP digital para enviarlas.',
          true
        );
      }
    } catch (err) {
      console.error(err);
      updateSaveStatus('Error al guardar en carpeta. Usa ZIP digital.', true);
    }
  } catch (err) {
    console.error('Error generando strip/PDF:', err);
    updateSaveStatus(
      'Error al generar el strip. Puedes descargar las fotos en ZIP.',
      true
    );
    renderIndividualPhotos();
  }

  showReview();
  isCapturing = false;
  toggleIniciarButton(true);
}

async function buildStrip() {
  stripDataUrl = await renderStrip(capturedPhotos, branding);
  printSheetDataUrl = await renderPrintSheet(stripDataUrl);
  stripPreview.src = printSheetDataUrl;
  try {
    pdfBlob = buildPdfBlob();
  } catch (err) {
    console.error('Error generando PDF en memoria:', err);
    pdfBlob = null;
  }
}

function showReview() {
  showScreen('review');
}

function retry() {
  startSession();
}

function downloadPdf() {
  if (!printSheetDataUrl) return;

  if (pdfBlob) {
    downloadBlob(pdfBlob, `cabina-imprimir-${sessionId || makeSessionId()}.pdf`);
    return;
  }

  const pdf = new jsPDF({
    unit: 'cm',
    format: [PRINT_WIDTH_CM, PRINT_HEIGHT_CM],
    orientation: 'portrait',
    compress: true,
  });
  pdf.addImage(printSheetDataUrl, 'JPEG', 0, 0, PRINT_WIDTH_CM, PRINT_HEIGHT_CM);
  pdf.save(`cabina-imprimir-${sessionId || makeSessionId()}.pdf`);
}

async function downloadSessionZip() {
  if (capturedPhotos.length === 0) return;

  const zip = new JSZip();
  const folderName = sessionId || makeSessionId();
  const folder = zip.folder(folderName);

  capturedPhotos.forEach((dataUrl, index) => {
    folder.file(`foto-${index + 1}.jpg`, dataUrlToBlob(dataUrl));
  });

  if (stripDataUrl) {
    folder.file('strip.jpg', dataUrlToBlob(stripDataUrl));
  }
  if (printSheetDataUrl) {
    folder.file('imprimir-2-strips.jpg', dataUrlToBlob(printSheetDataUrl));
  }

  const pdf = pdfBlob || buildPdfBlob();
  if (pdf) {
    folder.file('imprimir-2-strips.pdf', pdf);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `cabina-digital-${folderName}.zip`);
}

function handleKeydown(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const welcomeActive = screens.welcome.classList.contains('active');
  const cameraActive = screens.camera.classList.contains('active');
  const reviewActive = screens.review.classList.contains('active');

  if (e.code === 'Space') {
    e.preventDefault();
    if (welcomeActive) startSession();
    else if (cameraActive && !isCapturing) capturePhotoSequence();
    else if (reviewActive) retry();
  }

  if (e.code === 'Enter') {
    if (reviewActive) {
      e.preventDefault();
      downloadPdf();
    } else if (welcomeActive) {
      e.preventDefault();
      startSession();
    }
  }

  if (e.code === 'KeyD' && reviewActive) {
    e.preventDefault();
    downloadSessionZip();
  }
}

inputHeaderText.addEventListener('input', syncBrandingFromForm);
inputFooterText.addEventListener('input', syncBrandingFromForm);
inputFooterHashtag.addEventListener('input', syncBrandingFromForm);
inputFooterPhone.addEventListener('input', syncBrandingFromForm);

selectTheme?.addEventListener('change', () => {
  applyThemeFromSelect(true);
  syncBrandingFromForm();
});

stripTemplateSelect?.addEventListener('change', () => {
  chooseStripTemplate(stripTemplateSelect.value);
});

inputLogo.addEventListener('change', () => {
  const file = inputLogo.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    branding.logoDataUrl = reader.result;
    logoPreview.src = branding.logoDataUrl;
    logoPreview.classList.remove('hidden');
    saveBranding(branding);
    scheduleStripPreviewRefresh();
  };
  reader.readAsDataURL(file);
});

inputStripBackground?.addEventListener('change', () => {
  const file = inputStripBackground.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    branding.stripBackgroundDataUrl = reader.result;
    saveBranding(branding);
    updateStripBackgroundPreview();
    scheduleStripPreviewRefresh();
  };
  reader.readAsDataURL(file);
});

btnRemoveStripBg?.addEventListener('click', () => {
  branding.stripBackgroundDataUrl = null;
  if (inputStripBackground) inputStripBackground.value = '';
  saveBranding(branding);
  updateStripBackgroundPreview();
  scheduleStripPreviewRefresh();
});

document.getElementById('btn-start-welcome').addEventListener('click', () => startSession());
document.getElementById('btn-start-sidebar')?.addEventListener('click', () => startSession());
document.getElementById('btn-pick-folder').addEventListener('click', () => pickOutputFolder());
btnStartPhotos.addEventListener('click', () => capturePhotoSequence());
document.getElementById('btn-retry').addEventListener('click', () => retry());
document.getElementById('btn-download').addEventListener('click', () => downloadPdf());
document.getElementById('btn-download-zip').addEventListener('click', () => downloadSessionZip());

document.addEventListener('keydown', handleKeydown);

window.addEventListener('load', () => {
  showScreen('welcome');
  applyBrandingToForm();
  updateStageBranding();
  clearPhotoRail();
  updateFolderStatus();
  window.focus();
  document.body.focus();
});
