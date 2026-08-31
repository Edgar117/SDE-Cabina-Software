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
import { renderActiveTemplatePreview } from './stripPreview.js';
import { initTemplatesPanel } from './templatesPanel.js';

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
const progressDots = document.getElementById('progress-dots');
const cameraHint = document.getElementById('camera-hint');
const btnStartPhotos = document.getElementById('btn-start-photos');
const stripPreview = document.getElementById('strip-preview');
const folderStatus = document.getElementById('folder-status');
const saveStatus = document.getElementById('save-status');
const individualPhotos = document.getElementById('individual-photos');
const inputHeaderText = document.getElementById('input-header-text');
const inputSubtitleText = document.getElementById('input-subtitle-text');
const inputEventLabel = document.getElementById('input-event-label');
const inputFooterText = document.getElementById('input-footer-text');
const inputFooterHashtag = document.getElementById('input-footer-hashtag');
const inputFooterPhone = document.getElementById('input-footer-phone');
const selectTheme = document.getElementById('select-theme');
const inputLogo = document.getElementById('input-logo');
const logoPreview = document.getElementById('logo-preview');
const configStripPreview = document.getElementById('config-strip-preview');
const configPreviewStatus = document.getElementById('config-preview-status');
const photoRail = document.getElementById('photo-rail');

let templatesPanelApi = null;

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

function syncBrandingFromForm(refreshPreviews = true) {
  branding.headerText = inputHeaderText.value.trim() || 'SDE Eventos';
  branding.subtitleText = inputSubtitleText?.value.trim() || '';
  branding.eventLabel = inputEventLabel?.value.trim() || '';
  branding.footerText = inputFooterText.value.trim() || '¡Gracias por celebrar con nosotros!';
  branding.footerHashtag = inputFooterHashtag.value.trim() || '#SDE Eventos';
  branding.footerPhone = inputFooterPhone.value.trim() || '99-92-15-90-77';
  if (selectTheme?.value) {
    branding.themeId = selectTheme.value;
    const theme = getTheme(branding.themeId);
    branding.themeId = theme.id;
  }
  saveBranding(branding);
  updateStageBranding();
  if (refreshPreviews) scheduleStripPreviewRefresh();
  templatesPanelApi?.scheduleLivePreview();
}

let previewRefreshTimer = null;

async function updateConfigStripPreview() {
  if (!configStripPreview) return;
  if (configPreviewStatus) {
    configPreviewStatus.textContent = 'Generando vista previa...';
    configPreviewStatus.classList.add('loading');
  }
  try {
    const dataUrl = await renderActiveTemplatePreview(branding);
    configStripPreview.src = dataUrl;
    configStripPreview.classList.remove('hidden');
    if (configPreviewStatus) {
      configPreviewStatus.textContent = 'Vista previa — plantilla JSON activa';
    }
  } catch (err) {
    console.error(err);
    if (configPreviewStatus) configPreviewStatus.textContent = 'No se pudo generar la vista previa';
  } finally {
    configPreviewStatus?.classList.remove('loading');
  }
}

async function refreshStripPreviews() {
  syncBrandingFromForm(false);
  await updateConfigStripPreview();
  templatesPanelApi?.scheduleLivePreview();
}

function scheduleStripPreviewRefresh() {
  clearTimeout(previewRefreshTimer);
  previewRefreshTimer = setTimeout(() => refreshStripPreviews(), 600);
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
    // el primer slot va marcado como "el que sigue" para guiar la mirada
    slot.className = i === 0 ? 'rail-slot empty next' : 'rail-slot empty';
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
      if (i === capturedPhotos.length) slot.classList.add('next');
      slot.innerHTML = `<span>${i + 1}</span>`;
    }
    photoRail.appendChild(slot);
  }
}

function updateProgressDots(currentIndex) {
  if (!progressDots) return;
  const dots = progressDots.querySelectorAll('.progress-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('done', i < currentIndex);
    dot.classList.toggle('active', i === currentIndex);
  });
}

function setCaptureState(state) {
  document.body.dataset.capture = state;
}

function toggleIniciarButton(show) {
  btnStartPhotos.classList.toggle('hidden', !show);
}

function applyBrandingToForm() {
  if (!branding.templateMode) branding.templateMode = 'json';
  if (!branding.jsonTemplateId) branding.jsonTemplateId = 'xv_001';
  populateThemeSelect();
  scheduleStripPreviewRefresh();
  inputHeaderText.value = branding.headerText;
  inputSubtitleText.value = branding.subtitleText || '';
  if (inputEventLabel) inputEventLabel.value = branding.eventLabel || '';
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
  setCaptureState('idle');
  updateProgressDots(0);
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
  setCaptureState('counting');
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
  setCaptureState('shooting');
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
  setCaptureState('counting');
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
    updateProgressDots(i);
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
  setCaptureState('done');
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
inputSubtitleText?.addEventListener('input', syncBrandingFromForm);
inputEventLabel?.addEventListener('input', syncBrandingFromForm);
inputFooterText.addEventListener('input', syncBrandingFromForm);
inputFooterHashtag.addEventListener('input', syncBrandingFromForm);
inputFooterPhone.addEventListener('input', syncBrandingFromForm);

selectTheme?.addEventListener('change', () => {
  applyThemeFromSelect(true);
  syncBrandingFromForm();
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
    templatesPanelApi?.scheduleLivePreview();
  };
  reader.readAsDataURL(file);
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

  templatesPanelApi = initTemplatesPanel({
    branding,
    saveBranding,
    onTemplateApplied: (templateId) => {
      branding.templateMode = 'json';
      branding.jsonTemplateId = templateId;
      scheduleStripPreviewRefresh();
    },
    scheduleStripPreviewRefresh,
  });

  window.focus();
  document.body.focus();
});
