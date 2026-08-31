const STORAGE_KEY = 'cabina-branding';

export const defaultBranding = {
  themeId: 'teatro',
  stripTemplateId: 'clasico',
  headerText: 'SDE Eventos',
  subtitleText: 'Valeria',
  eventLabel: '',
  footerText: '¡Gracias por celebrar con nosotros!',
  footerHashtag: '#SDE Eventos',
  footerPhone: '99-92-15-90-77',
  logoDataUrl: null,
  stripBackgroundDataUrl: null,
  jsonTemplateId: 'xv_001',
  templateMode: 'json',
  accentColor: '#d4af37',
};

export function loadBranding() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultBranding };
    return { ...defaultBranding, ...JSON.parse(raw) };
  } catch {
    return { ...defaultBranding };
  }
}

export function saveBranding(branding) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
}

export const cheerMessages = [
  '¡Saliste genial! Aquí viene la siguiente',
  '¡Increíble! Una foto más...',
  '¡Perfecto! Ya casi terminamos...',
];

export const finalCheerMessage = '¡Listo! Preparando tus fotos...';
