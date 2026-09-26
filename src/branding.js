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

/**
 * Mensajes entre fotos. Van por turno (una bolsa por hueco entre fotos) para
 * que el texto siempre cuadre: "una foto más" solo sale antes de la última.
 * En cada sesión se elige uno al azar de cada bolsa.
 */
export const cheerMessages = [
  // Después de la 1ª foto (faltan 2)
  [
    '¡Saliste genial! Aquí viene la siguiente',
    '¡Qué foto! Vamos por otra...',
    '¡Wow, qué estilo! Prepárense para la segunda',
    '¡Eso! Ahora una pose diferente...',
    '¡Hermosos! Sigan así...',
    '¡Me encanta! Ahora la más divertida...',
    '¡Muy bien! Cambien de pose...',
    '¡Qué sonrisas! Aquí viene otra...',
    '¡De portada! Vamos con la segunda',
    '¡Increíble! Ahora hagan su mejor cara chistosa',
  ],
  // Después de la 2ª foto (falta la última)
  [
    '¡Increíble! Una foto más...',
    '¡Perfecto! Ya casi terminamos...',
    '¡Última foto! Denlo todo...',
    '¡Van muy bien! Solo falta una...',
    '¡Guapísimos! La última y nos vamos...',
    '¡Qué equipo! Una más para cerrar...',
    '¡Genial! La última, ¡con todo!',
    '¡Wow! Guarden lo mejor para esta...',
    '¡Casi listo! Una última sonrisa...',
    '¡Espectacular! Ahora un abrazo grupal...',
  ],
];

export const finalCheerMessages = [
  '¡Listo! Preparando tus fotos...',
  '¡Quedaron increíbles! Preparando tus fotos...',
  '¡Terminamos! Armando tu tira...',
  '¡Gracias! Tus fotos ya casi están...',
  '¡Qué sesión! Preparando tus recuerdos...',
];

let ultimoMensaje = null;

/** Elige al azar sin repetir el último mensaje mostrado. */
export function pickMessage(pool) {
  const opciones = pool.length > 1 ? pool.filter((m) => m !== ultimoMensaje) : pool;
  ultimoMensaje = opciones[Math.floor(Math.random() * opciones.length)];
  return ultimoMensaje;
}
