/**
 * Temas de PANTALLA (la UI de la cabina) + colores de la tira "builtin".
 *
 * Cada tema define:
 *   strip -> colores del generador de tira clásico (no plantillas JSON)
 *   ui    -> tokens de diseño que se vuelcan como variables CSS
 *
 * Tokens de ui:
 *   mood        'dark' | 'light'  -> decide contrastes globales
 *   deco        estilo decorativo animado (ver styles.css, body[data-deco])
 *   stageBg     fondo del escenario
 *   curtainDeep color base/fallback del body
 *   gold        color de acento principal
 *   goldLight   acento claro (texto destacado)
 *   ink         color de texto principal
 *   inkSoft     color de texto secundario
 *   frameBorder borde del marco de video
 *   frameGlow   halo del marco de video
 *   scrim       velo de los overlays (cuenta regresiva / mensajes)
 *   slotIdle    fondo de los slots vacíos de la tira lateral
 *   btnInner/btnOuter  degradado del botón INICIAR
 *   foldOpacity opacidad de los pliegues laterales
 *   vignette    intensidad del viñeteado sobre el video (0-1)
 *   fontDisplay tipografía de títulos
 *   fontScript  tipografía del saludo grande
 */

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS = "'Manrope', 'Segoe UI', system-ui, sans-serif";
const SCRIPT = "'Dancing Script', 'Segoe Script', cursive";

export const themes = {
  teatro: {
    id: 'teatro',
    name: 'Teatro / SDE Eventos',
    headerTextDefault: 'SDE Eventos',
    footerTextDefault: '¡Gracias por celebrar con nosotros!',
    strip: {
      headerTop: '#8b0a1a', headerBottom: '#5c0610',
      footerTop: '#5c0610', footerBottom: '#8b0a1a',
      stripBg: '#f8f4ef', photoBg: '#2a0810',
      borderInner: '#1a1a22', accent: '#d4af37', dateColor: '#c9a86c',
    },
    ui: {
      mood: 'dark', deco: 'curtain',
      stageBg:
        'radial-gradient(ellipse 70% 55% at 50% 8%, rgba(255,215,140,0.20) 0%, transparent 60%),' +
        'radial-gradient(ellipse 120% 80% at 12% 50%, rgba(0,0,0,0.55) 0%, transparent 58%),' +
        'radial-gradient(ellipse 120% 80% at 88% 50%, rgba(0,0,0,0.55) 0%, transparent 58%),' +
        'repeating-linear-gradient(90deg, #4d0714 0px, #6e0f1e 7px, #8b1530 14px, #5c0818 21px, #941828 28px, #4d0714 35px)',
      curtainDeep: '#3d0510',
      gold: '#e0bb4d', goldLight: '#ffe9a8',
      ink: '#fff6e6', inkSoft: 'rgba(255,240,214,0.72)',
      frameBorder: '#f3e2b4', frameGlow: 'rgba(224,187,77,0.45)',
      scrim: 'rgba(45,4,14,0.80)', slotIdle: 'rgba(30,3,10,0.62)',
      btnInner: '#e0324f', btnOuter: '#5c0610',
      foldOpacity: 0.62, vignette: 0.35,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  boda: {
    id: 'boda',
    name: 'Boda Premium',
    headerTextDefault: 'Nuestra Boda',
    footerTextDefault: 'Con amor, gracias por acompañarnos',
    strip: {
      headerTop: '#a08060', headerBottom: '#6b5344',
      footerTop: '#6b5344', footerBottom: '#a08060',
      stripBg: '#fdf8f3', photoBg: '#3d3228',
      borderInner: '#8b7355', accent: '#c9a227', dateColor: '#9a7b5a',
    },
    ui: {
      mood: 'light', deco: 'floral',
      stageBg:
        'radial-gradient(ellipse 70% 48% at 50% 0%, rgba(255,255,255,0.95) 0%, transparent 62%),' +
        'radial-gradient(ellipse 55% 40% at 4% 96%, rgba(243,206,206,0.55) 0%, transparent 66%),' +
        'radial-gradient(ellipse 55% 40% at 96% 96%, rgba(243,206,206,0.50) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(255,252,246,0.85) 0%, transparent 70%),' +
        'linear-gradient(152deg, #fdf7f0 0%, #f7e8dc 28%, #efd9c6 58%, #e2c3ab 100%)',
      curtainDeep: '#efdfcd',
      gold: '#9E7714', goldLight: '#f2dda4',
      ink: '#4A3324', inkSoft: 'rgba(74,51,36,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(158,119,20,0.38)',
      scrim: 'rgba(58,40,28,0.80)', slotIdle: 'rgba(255,255,255,0.62)',
      btnInner: '#e8c368', btnOuter: '#8d6712',
      foldOpacity: 0.10, vignette: 0.16,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  xv: {
    id: 'xv',
    name: 'XV Años Premium',
    headerTextDefault: 'Mis XV Años',
    footerTextDefault: '¡Gracias por celebrar conmigo!',
    strip: {
      headerTop: '#9b1b6e', headerBottom: '#5c0d42',
      footerTop: '#5c0d42', footerBottom: '#9b1b6e',
      stripBg: '#fdf5fa', photoBg: '#2a0820',
      borderInner: '#4a1035', accent: '#e8c878', dateColor: '#c9a0b8',
    },
    ui: {
      mood: 'dark', deco: 'filigree',
      stageBg:
        'radial-gradient(ellipse 85% 60% at 50% 12%, rgba(232,120,180,0.38) 0%, transparent 62%),' +
        'radial-gradient(ellipse 60% 45% at 85% 88%, rgba(232,200,120,0.18) 0%, transparent 65%),' +
        'linear-gradient(172deg, #340620 0%, #6b1248 38%, #93195e 68%, #4a0a34 100%)',
      curtainDeep: '#25041a',
      gold: '#f0cd84', goldLight: '#fff0c8',
      ink: '#fff2f8', inkSoft: 'rgba(255,235,246,0.72)',
      frameBorder: '#f7e2b8', frameGlow: 'rgba(240,205,132,0.50)',
      scrim: 'rgba(46,6,32,0.82)', slotIdle: 'rgba(36,4,25,0.60)',
      btnInner: '#e0518f', btnOuter: '#5c0d42',
      foldOpacity: 0.40, vignette: 0.32,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'fiesta-infantil': {
    id: 'fiesta-infantil',
    name: 'Fiesta Infantil',
    headerTextDefault: 'Mi Cumpleaños',
    footerTextDefault: '¡Gracias por festejar conmigo!',
    strip: {
      headerTop: '#ff8c42', headerBottom: '#e85d4a',
      footerTop: '#e85d4a', footerBottom: '#ff8c42',
      stripBg: '#fffaf5', photoBg: '#2a4060',
      borderInner: '#5a8ab0', accent: '#ff6b9d', dateColor: '#7eb8d8',
    },
    ui: {
      mood: 'light', deco: 'confetti',
      stageBg:
        'radial-gradient(ellipse 90% 55% at 50% 0%, #fff8e2 0%, transparent 62%),' +
        'linear-gradient(160deg, #fff4e0 0%, #ffe6ef 40%, #e4f3fb 100%)',
      curtainDeep: '#fdeede',
      gold: '#e0417f', goldLight: '#ffd98e',
      ink: '#3f2c46', inkSoft: 'rgba(63,44,70,0.66)',
      frameBorder: '#ffffff', frameGlow: 'rgba(224,65,127,0.35)',
      scrim: 'rgba(58,36,66,0.78)', slotIdle: 'rgba(255,255,255,0.66)',
      btnInner: '#ffc247', btnOuter: '#f0762c',
      foldOpacity: 0, vignette: 0.14,
      fontDisplay: SANS, fontScript: SANS,
    },
  },

  'fiesta-moderna': {
    id: 'fiesta-moderna',
    name: 'Fiesta Moderna',
    headerTextDefault: '¡Fiesta!',
    footerTextDefault: '¡Gracias por festejar con nosotros!',
    strip: {
      headerTop: '#4a2a8c', headerBottom: '#1a0a40',
      footerTop: '#1a0a40', footerBottom: '#4a2a8c',
      stripBg: '#0f0a28', photoBg: '#0a0618',
      borderInner: '#2a1a60', accent: '#00e5ff', dateColor: '#7a6aaa',
    },
    ui: {
      mood: 'dark', deco: 'neon',
      stageBg:
        'radial-gradient(circle at 18% 82%, rgba(255,0,140,0.30) 0%, transparent 46%),' +
        'radial-gradient(circle at 82% 18%, rgba(0,214,255,0.26) 0%, transparent 46%),' +
        'linear-gradient(158deg, #07072b 0%, #180a52 42%, #2f1c72 72%, #0c0a2c 100%)',
      curtainDeep: '#07061c',
      gold: '#2ff0ff', goldLight: '#ffe95c',
      ink: '#f2f6ff', inkSoft: 'rgba(215,225,255,0.70)',
      frameBorder: '#2ff0ff', frameGlow: 'rgba(47,240,255,0.60)',
      scrim: 'rgba(9,7,38,0.85)', slotIdle: 'rgba(12,10,44,0.66)',
      btnInner: '#8b45ff', btnOuter: '#1a0a40',
      foldOpacity: 0, vignette: 0.30,
      fontDisplay: SANS, fontScript: SANS,
    },
  },

  corporativo: {
    id: 'corporativo',
    name: 'Corporativo / Formal',
    headerTextDefault: 'SDE Eventos',
    footerTextDefault: 'Gracias por su participación',
    strip: {
      headerTop: '#1e3a5f', headerBottom: '#0f1f33',
      footerTop: '#0f1f33', footerBottom: '#1e3a5f',
      stripBg: '#f4f6f8', photoBg: '#0f1a28',
      borderInner: '#1a2a40', accent: '#8ba4c4', dateColor: '#6a8499',
    },
    ui: {
      mood: 'dark', deco: 'grid',
      stageBg:
        'radial-gradient(ellipse 75% 50% at 50% 0%, rgba(79,209,197,0.16) 0%, transparent 60%),' +
        'linear-gradient(180deg, #0d1b2e 0%, #16304e 52%, #1f3f63 100%)',
      curtainDeep: '#091522',
      gold: '#4fd1c5', goldLight: '#d6e6f5',
      ink: '#eef4fb', inkSoft: 'rgba(220,233,246,0.68)',
      frameBorder: '#cfe0f0', frameGlow: 'rgba(79,209,197,0.42)',
      scrim: 'rgba(9,21,34,0.84)', slotIdle: 'rgba(12,26,42,0.66)',
      btnInner: '#2f7dbf', btnOuter: '#0f1f33',
      foldOpacity: 0.30, vignette: 0.26,
      fontDisplay: SANS, fontScript: SANS,
    },
  },

  /* ————— Temas nuevos ————— */

  salvia: {
    id: 'salvia',
    name: 'Verde Salvia & Dorado',
    headerTextDefault: 'Nuestra Celebración',
    footerTextDefault: '¡Gracias por celebrar con nosotros!',
    strip: {
      headerTop: '#8fae8a', headerBottom: '#5f7d5c',
      footerTop: '#5f7d5c', footerBottom: '#8fae8a',
      stripBg: '#f4f8f2', photoBg: '#2c3a2a',
      borderInner: '#7f9d7b', accent: '#c9a227', dateColor: '#6f8c6b',
    },
    ui: {
      mood: 'light', deco: 'botanical',
      stageBg:
        'radial-gradient(ellipse 85% 55% at 50% 0%, #ffffff 0%, transparent 62%),' +
        'linear-gradient(158deg, #eef5ec 0%, #dcebd8 38%, #cadfc6 70%, #b9d3b4 100%)',
      curtainDeep: '#dbeada',
      gold: '#9c7c1c', goldLight: '#eadfae',
      ink: '#33452F', inkSoft: 'rgba(51,69,47,0.66)',
      frameBorder: '#ffffff', frameGlow: 'rgba(156,124,28,0.38)',
      scrim: 'rgba(38,54,36,0.80)', slotIdle: 'rgba(255,255,255,0.58)',
      btnInner: '#e2c977', btnOuter: '#8d6f14',
      foldOpacity: 0.10, vignette: 0.16,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'negro-oro': {
    id: 'negro-oro',
    name: 'Negro & Oro (Art Decó)',
    headerTextDefault: 'Nuestra Boda',
    footerTextDefault: 'Gracias por acompañarnos',
    strip: {
      headerTop: '#1c1c1c', headerBottom: '#0b0b0b',
      footerTop: '#0b0b0b', footerBottom: '#1c1c1c',
      stripBg: '#111111', photoBg: '#000000',
      borderInner: '#4a3d16', accent: '#d4af37', dateColor: '#bfa35a',
    },
    ui: {
      mood: 'dark', deco: 'artdeco',
      stageBg:
        'radial-gradient(ellipse 70% 50% at 50% 4%, rgba(212,175,55,0.16) 0%, transparent 62%),' +
        'linear-gradient(168deg, #1e1c17 0%, #100f0c 45%, #07070a 100%)',
      curtainDeep: '#08080a',
      gold: '#e2c25c', goldLight: '#fbf0c4',
      ink: '#f7f2e2', inkSoft: 'rgba(240,232,208,0.66)',
      frameBorder: '#e2c25c', frameGlow: 'rgba(226,194,92,0.45)',
      scrim: 'rgba(8,8,10,0.86)', slotIdle: 'rgba(20,18,14,0.72)',
      btnInner: '#e2c25c', btnOuter: '#6d5410',
      foldOpacity: 0.45, vignette: 0.38,
      fontDisplay: SERIF, fontScript: SERIF,
    },
  },

  'neon-retro': {
    id: 'neon-retro',
    name: 'Neón Retro (Synthwave)',
    headerTextDefault: '¡Fiesta!',
    footerTextDefault: '¡Gracias por venir!',
    strip: {
      headerTop: '#ff2e88', headerBottom: '#7a1050',
      footerTop: '#7a1050', footerBottom: '#ff2e88',
      stripBg: '#120a24', photoBg: '#08040f',
      borderInner: '#3a1f6b', accent: '#3df5ff', dateColor: '#b48ce0',
    },
    ui: {
      mood: 'dark', deco: 'retrogrid',
      stageBg:
        'radial-gradient(ellipse 60% 42% at 50% 62%, rgba(255,46,136,0.42) 0%, transparent 60%),' +
        'radial-gradient(ellipse 90% 40% at 50% 100%, rgba(61,245,255,0.22) 0%, transparent 60%),' +
        'linear-gradient(180deg, #180a33 0%, #2b0f4d 40%, #55145c 72%, #1a0730 100%)',
      curtainDeep: '#120726',
      gold: '#3df5ff', goldLight: '#ff8ad0',
      ink: '#fdf3ff', inkSoft: 'rgba(240,220,255,0.70)',
      frameBorder: '#ff53a8', frameGlow: 'rgba(255,83,168,0.62)',
      scrim: 'rgba(18,7,38,0.86)', slotIdle: 'rgba(24,10,48,0.68)',
      btnInner: '#ff2e88', btnOuter: '#5a0f52',
      foldOpacity: 0, vignette: 0.30,
      fontDisplay: SANS, fontScript: SANS,
    },
  },

  'boda-jardin': {
    id: 'boda-jardin',
    name: 'Boda Jardín (verde y blanco)',
    headerTextDefault: 'Nuestra Boda',
    footerTextDefault: 'Gracias por acompañarnos',
    strip: {
      headerTop: '#7FA877', headerBottom: '#4F7449',
      footerTop: '#4F7449', footerBottom: '#7FA877',
      stripBg: '#F7FAF5', photoBg: '#2C3E29',
      borderInner: '#6E9668', accent: '#B08F2C', dateColor: '#5F8459',
    },
    ui: {
      mood: 'light', deco: 'floral-jardin',
      stageBg:
        'radial-gradient(ellipse 70% 48% at 50% 0%, rgba(255,255,255,0.96) 0%, transparent 62%),' +
        'radial-gradient(ellipse 55% 40% at 4% 96%, rgba(196,224,190,0.55) 0%, transparent 66%),' +
        'radial-gradient(ellipse 55% 40% at 96% 96%, rgba(196,224,190,0.50) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(255,255,252,0.9) 0%, transparent 70%),' +
        'linear-gradient(152deg, #FBFDF8 0%, #EFF6EA 30%, #DFEDD8 62%, #CBE0C2 100%)',
      curtainDeep: '#E4F0DE',
      gold: '#8A6E14', goldLight: '#EFE3AE',
      ink: '#2F4429', inkSoft: 'rgba(47,68,41,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(138,110,20,0.34)',
      scrim: 'rgba(34,50,30,0.80)', slotIdle: 'rgba(255,255,255,0.66)',
      btnInner: '#DCC978', btnOuter: '#7C6210',
      foldOpacity: 0.10, vignette: 0.16,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'boda-borgona': {
    id: 'boda-borgona',
    name: 'Boda Borgoña (vino y oro)',
    headerTextDefault: 'Nuestra Boda',
    footerTextDefault: 'Gracias por acompañarnos',
    strip: {
      headerTop: '#8E1E38', headerBottom: '#4E0C1E',
      footerTop: '#4E0C1E', footerBottom: '#8E1E38',
      stripBg: '#FBF3E8', photoBg: '#2A0812',
      borderInner: '#6B1028', accent: '#D4AF37', dateColor: '#9B5A63',
    },
    ui: {
      mood: 'dark', deco: 'floral-borgona',
      stageBg:
        'radial-gradient(ellipse 70% 50% at 50% 4%, rgba(212,175,55,0.20) 0%, transparent 62%),' +
        'radial-gradient(ellipse 60% 46% at 8% 96%, rgba(142,30,56,0.55) 0%, transparent 66%),' +
        'radial-gradient(ellipse 60% 46% at 92% 96%, rgba(142,30,56,0.50) 0%, transparent 66%),' +
        'linear-gradient(166deg, #3A0A18 0%, #24060F 46%, #14040A 100%)',
      curtainDeep: '#180509',
      gold: '#E0BE58', goldLight: '#FBEEC2',
      ink: '#FBF1E4', inkSoft: 'rgba(245,228,210,0.70)',
      frameBorder: '#F0DFB4', frameGlow: 'rgba(224,190,88,0.48)',
      scrim: 'rgba(24,5,12,0.85)', slotIdle: 'rgba(38,9,18,0.66)',
      btnInner: '#C0304C', btnOuter: '#4E0C1E',
      foldOpacity: 0.42, vignette: 0.34,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'xv-lila': {
    id: 'xv-lila',
    name: 'XV Lila & Plata',
    headerTextDefault: 'Mis XV Años',
    footerTextDefault: '¡Gracias por celebrar conmigo!',
    strip: {
      headerTop: '#B99CDD', headerBottom: '#7C5FA8',
      footerTop: '#7C5FA8', footerBottom: '#B99CDD',
      stripBg: '#F8F4FD', photoBg: '#2E2340',
      borderInner: '#9678C0', accent: '#9AA6B4', dateColor: '#7C6A9B',
    },
    ui: {
      mood: 'light', deco: 'floral-lila',
      stageBg:
        'radial-gradient(ellipse 70% 48% at 50% 0%, rgba(255,255,255,0.96) 0%, transparent 62%),' +
        'radial-gradient(ellipse 58% 42% at 6% 96%, rgba(211,192,238,0.60) 0%, transparent 66%),' +
        'radial-gradient(ellipse 58% 42% at 94% 96%, rgba(211,192,238,0.54) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(255,253,255,0.9) 0%, transparent 70%),' +
        'linear-gradient(152deg, #FCFAFF 0%, #F2EAFB 30%, #E4D8F5 62%, #D2C1EC 100%)',
      curtainDeep: '#EAE0F7',
      gold: '#6C5A96', goldLight: '#EDE6F8',
      ink: '#3B2D55', inkSoft: 'rgba(59,45,85,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(108,90,150,0.34)',
      scrim: 'rgba(45,34,64,0.80)', slotIdle: 'rgba(255,255,255,0.68)',
      btnInner: '#B79BE0', btnOuter: '#6144A0',
      foldOpacity: 0.10, vignette: 0.16,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'xv-turquesa': {
    id: 'xv-turquesa',
    name: 'XV Turquesa & Oro',
    headerTextDefault: 'Mis XV Años',
    footerTextDefault: '¡Gracias por celebrar conmigo!',
    strip: {
      headerTop: '#159C9C', headerBottom: '#0A5F63',
      footerTop: '#0A5F63', footerBottom: '#159C9C',
      stripBg: '#F0FAFA', photoBg: '#062E33',
      borderInner: '#0E7C80', accent: '#E8C878', dateColor: '#4E8E92',
    },
    ui: {
      mood: 'dark', deco: 'filigree',
      stageBg:
        'radial-gradient(ellipse 82% 58% at 50% 10%, rgba(38,190,190,0.38) 0%, transparent 62%),' +
        'radial-gradient(ellipse 60% 44% at 84% 90%, rgba(232,200,120,0.20) 0%, transparent 65%),' +
        'linear-gradient(172deg, #04353C 0%, #0A5F63 40%, #0E8288 70%, #063E45 100%)',
      curtainDeep: '#032A31',
      gold: '#F0CD84', goldLight: '#FFF1CC',
      ink: '#EEFBFA', inkSoft: 'rgba(220,246,244,0.72)',
      frameBorder: '#F7E7BC', frameGlow: 'rgba(240,205,132,0.50)',
      scrim: 'rgba(4,32,38,0.84)', slotIdle: 'rgba(5,42,48,0.62)',
      btnInner: '#18B3B3', btnOuter: '#064247',
      foldOpacity: 0.34, vignette: 0.30,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'fiesta-tropical': {
    id: 'fiesta-tropical',
    name: 'Fiesta Tropical',
    headerTextDefault: '¡Fiesta!',
    footerTextDefault: '¡Gracias por festejar con nosotros!',
    strip: {
      headerTop: '#F2603A', headerBottom: '#146B55',
      footerTop: '#146B55', footerBottom: '#F2603A',
      stripBg: '#FFF8EC', photoBg: '#0B3C31',
      borderInner: '#1F8A70', accent: '#F5B73C', dateColor: '#2C7F6C',
    },
    ui: {
      mood: 'light', deco: 'tropical',
      stageBg:
        'radial-gradient(ellipse 70% 46% at 50% 0%, rgba(255,255,255,0.94) 0%, transparent 62%),' +
        'radial-gradient(ellipse 58% 44% at 4% 94%, rgba(60,191,158,0.42) 0%, transparent 66%),' +
        'radial-gradient(ellipse 58% 44% at 96% 94%, rgba(255,209,102,0.48) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(255,253,246,0.92) 0%, transparent 70%),' +
        'linear-gradient(150deg, #FFFCF2 0%, #FEF3DC 32%, #E7F5EC 66%, #CFEDDF 100%)',
      curtainDeep: '#EAF6EE',
      gold: '#B7761C', goldLight: '#FFE6AC',
      ink: '#14453A', inkSoft: 'rgba(20,69,58,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(183,118,28,0.36)',
      scrim: 'rgba(14,52,44,0.80)', slotIdle: 'rgba(255,255,255,0.66)',
      btnInner: '#FF9A4D', btnOuter: '#C24A18',
      foldOpacity: 0.08, vignette: 0.16,
      fontDisplay: SANS, fontScript: SANS,
    },
  },

  'fiesta-disco': {
    id: 'fiesta-disco',
    name: 'Fiesta Disco (negro y oro)',
    headerTextDefault: '¡Fiesta!',
    footerTextDefault: '¡Gracias por festejar con nosotros!',
    strip: {
      headerTop: '#2A2418', headerBottom: '#0D0B07',
      footerTop: '#0D0B07', footerBottom: '#2A2418',
      stripBg: '#141210', photoBg: '#050505',
      borderInner: '#5A4A18', accent: '#F0C64E', dateColor: '#BFA35A',
    },
    ui: {
      mood: 'dark', deco: 'disco',
      stageBg:
        'radial-gradient(ellipse 62% 44% at 50% 2%, rgba(255,214,102,0.32) 0%, transparent 60%),' +
        'radial-gradient(ellipse 70% 46% at 50% 100%, rgba(160,120,30,0.28) 0%, transparent 64%),' +
        'linear-gradient(170deg, #241E12 0%, #131009 44%, #08070A 100%)',
      curtainDeep: '#0A0906',
      gold: '#F0C64E', goldLight: '#FFF0BE',
      ink: '#FCF5E2', inkSoft: 'rgba(245,235,208,0.68)',
      frameBorder: '#F0C64E', frameGlow: 'rgba(240,198,78,0.55)',
      scrim: 'rgba(10,9,6,0.86)', slotIdle: 'rgba(26,22,12,0.70)',
      btnInner: '#F0C64E', btnOuter: '#6E5210',
      foldOpacity: 0.40, vignette: 0.36,
      fontDisplay: SANS, fontScript: SANS,
    },
  },

  graduacion: {
    id: 'graduacion',
    name: 'Graduación',
    headerTextDefault: 'Generación',
    footerTextDefault: '¡Felicidades, lo lograste!',
    strip: {
      headerTop: '#16294d', headerBottom: '#0b1730',
      footerTop: '#0b1730', footerBottom: '#16294d',
      stripBg: '#f2f5fa', photoBg: '#0b1730',
      borderInner: '#26406e', accent: '#d4af37', dateColor: '#8fa4c6',
    },
    ui: {
      mood: 'dark', deco: 'stars',
      stageBg:
        'radial-gradient(ellipse 80% 55% at 50% 6%, rgba(212,175,55,0.18) 0%, transparent 62%),' +
        'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(38,64,110,0.55) 0%, transparent 65%),' +
        'linear-gradient(176deg, #16294d 0%, #0e1c38 45%, #0a1329 100%)',
      curtainDeep: '#08101f',
      gold: '#e3c163', goldLight: '#fbeec0',
      ink: '#eef3fb', inkSoft: 'rgba(215,228,246,0.68)',
      frameBorder: '#e3c163', frameGlow: 'rgba(227,193,99,0.45)',
      scrim: 'rgba(8,16,31,0.85)', slotIdle: 'rgba(12,24,45,0.66)',
      btnInner: '#e3c163', btnOuter: '#6a5316',
      foldOpacity: 0.32, vignette: 0.30,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  /* ————— Juegos extra (adornos: tools/generar_deco_extra.mjs) ————— */

  'xv-reino': {
    id: 'xv-reino',
    name: 'XV Noche en el Reino',
    headerTextDefault: 'Mis XV Años',
    footerTextDefault: '¡Gracias por celebrar conmigo!',
    strip: {
      headerTop: '#4B2E83', headerBottom: '#2A1848',
      footerTop: '#2A1848', footerBottom: '#4B2E83',
      stripBg: '#F8F3FB', photoBg: '#1C1030',
      borderInner: '#4B2E83', accent: '#E9C46A', dateColor: '#B8A2D8',
    },
    ui: {
      mood: 'dark', deco: 'floral-reino',
      // Noche de gala: cielo morado profundo, último brillo cálido en el horizonte
      stageBg:
        'radial-gradient(ellipse 60% 38% at 50% 0%, rgba(233,196,106,0.16) 0%, transparent 62%),' +
        'radial-gradient(ellipse 80% 40% at 50% 104%, rgba(255,170,110,0.22) 0%, transparent 66%),' +
        'radial-gradient(ellipse 36% 30% at 10% 70%, rgba(255,190,106,0.12) 0%, transparent 70%),' +
        'radial-gradient(ellipse 36% 30% at 90% 64%, rgba(255,190,106,0.10) 0%, transparent 70%),' +
        'linear-gradient(180deg, #1E1236 0%, #2E1A50 38%, #432667 72%, #5A3272 100%)',
      curtainDeep: '#170C2A',
      gold: '#E9C46A', goldLight: '#FFEDBE',
      ink: '#FBF4FF', inkSoft: 'rgba(236,224,248,0.72)',
      frameBorder: '#F3E2B4', frameGlow: 'rgba(233,196,106,0.46)',
      scrim: 'rgba(24,12,44,0.85)', slotIdle: 'rgba(30,16,54,0.62)',
      btnInner: '#8E6CC4', btnOuter: '#2E1A50',
      foldOpacity: 0.30, vignette: 0.32,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'xv-rosa-oro': {
    id: 'xv-rosa-oro',
    name: 'XV Rosa Palo & Oro',
    headerTextDefault: 'Mis XV Años',
    footerTextDefault: '¡Gracias por celebrar conmigo!',
    strip: {
      headerTop: '#E79AAF', headerBottom: '#B0607A',
      footerTop: '#B0607A', footerBottom: '#E79AAF',
      stripBg: '#FDF5F6', photoBg: '#3A1E28',
      borderInner: '#C97790', accent: '#D4AF37', dateColor: '#B07A8A',
    },
    ui: {
      mood: 'light', deco: 'floral-rosa-oro',
      stageBg:
        'radial-gradient(ellipse 70% 48% at 50% 0%, rgba(255,255,255,0.96) 0%, transparent 62%),' +
        'radial-gradient(ellipse 58% 42% at 6% 96%, rgba(245,194,207,0.60) 0%, transparent 66%),' +
        'radial-gradient(ellipse 58% 42% at 94% 96%, rgba(245,194,207,0.54) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(255,253,252,0.9) 0%, transparent 70%),' +
        'linear-gradient(152deg, #FFFAFA 0%, #FCEDEF 30%, #F7DCE2 62%, #EFC6D1 100%)',
      curtainDeep: '#F8E4E8',
      gold: '#A4801C', goldLight: '#F6E4AE',
      ink: '#5A2E3C', inkSoft: 'rgba(90,46,60,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(164,128,28,0.36)',
      scrim: 'rgba(70,36,48,0.80)', slotIdle: 'rgba(255,255,255,0.66)',
      btnInner: '#EFA3BA', btnOuter: '#B0607A',
      foldOpacity: 0.10, vignette: 0.16,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'xv-azul': {
    id: 'xv-azul',
    name: 'XV Azul Cielo & Plata',
    headerTextDefault: 'Mis XV Años',
    footerTextDefault: '¡Gracias por celebrar conmigo!',
    strip: {
      headerTop: '#98C2E6', headerBottom: '#5A86B4',
      footerTop: '#5A86B4', footerBottom: '#98C2E6',
      stripBg: '#F4F8FD', photoBg: '#1E2C40',
      borderInner: '#6F9FCC', accent: '#9AA6B4', dateColor: '#6A86A6',
    },
    ui: {
      mood: 'light', deco: 'floral-azul-xv',
      stageBg:
        'radial-gradient(ellipse 70% 48% at 50% 0%, rgba(255,255,255,0.96) 0%, transparent 62%),' +
        'radial-gradient(ellipse 58% 42% at 6% 96%, rgba(194,221,243,0.62) 0%, transparent 66%),' +
        'radial-gradient(ellipse 58% 42% at 94% 96%, rgba(194,221,243,0.56) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(253,254,255,0.9) 0%, transparent 70%),' +
        'linear-gradient(152deg, #FAFCFF 0%, #EAF3FB 30%, #D8E8F6 62%, #C1D9EF 100%)',
      curtainDeep: '#E2EEF8',
      gold: '#4F6F94', goldLight: '#E6EEF7',
      ink: '#233B58', inkSoft: 'rgba(35,59,88,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(79,111,148,0.34)',
      scrim: 'rgba(30,48,72,0.80)', slotIdle: 'rgba(255,255,255,0.68)',
      btnInner: '#8DBBE3', btnOuter: '#3F6C9C',
      foldOpacity: 0.10, vignette: 0.16,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'xv-esmeralda': {
    id: 'xv-esmeralda',
    name: 'XV Esmeralda & Oro',
    headerTextDefault: 'Mis XV Años',
    footerTextDefault: '¡Gracias por celebrar conmigo!',
    strip: {
      headerTop: '#1F6B53', headerBottom: '#0C3B2D',
      footerTop: '#0C3B2D', footerBottom: '#1F6B53',
      stripBg: '#F4F8F4', photoBg: '#06231A',
      borderInner: '#16553F', accent: '#E2C25C', dateColor: '#5E8C79',
    },
    ui: {
      mood: 'dark', deco: 'floral-esmeralda',
      stageBg:
        'radial-gradient(ellipse 70% 50% at 50% 4%, rgba(226,194,92,0.20) 0%, transparent 62%),' +
        'radial-gradient(ellipse 60% 46% at 8% 96%, rgba(31,107,83,0.55) 0%, transparent 66%),' +
        'radial-gradient(ellipse 60% 46% at 92% 96%, rgba(31,107,83,0.50) 0%, transparent 66%),' +
        'linear-gradient(166deg, #0E3F31 0%, #082A20 46%, #041812 100%)',
      curtainDeep: '#041A13',
      gold: '#E2C25C', goldLight: '#FBEEC2',
      ink: '#F3FAF5', inkSoft: 'rgba(222,240,230,0.70)',
      frameBorder: '#F0DFB4', frameGlow: 'rgba(226,194,92,0.48)',
      scrim: 'rgba(4,26,19,0.85)', slotIdle: 'rgba(8,40,30,0.66)',
      btnInner: '#2F8C6B', btnOuter: '#0C3B2D',
      foldOpacity: 0.40, vignette: 0.34,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'boda-azul': {
    id: 'boda-azul',
    name: 'Boda Azul Polvo',
    headerTextDefault: 'Nuestra Boda',
    footerTextDefault: 'Gracias por acompañarnos',
    strip: {
      headerTop: '#A5BDD3', headerBottom: '#6786A4',
      footerTop: '#6786A4', footerBottom: '#A5BDD3',
      stripBg: '#F7F9FB', photoBg: '#26323F',
      borderInner: '#7F9CB8', accent: '#B9A36A', dateColor: '#6F8AA4',
    },
    ui: {
      mood: 'light', deco: 'floral-azul',
      stageBg:
        'radial-gradient(ellipse 70% 48% at 50% 0%, rgba(255,255,255,0.96) 0%, transparent 62%),' +
        'radial-gradient(ellipse 55% 40% at 4% 96%, rgba(201,216,230,0.60) 0%, transparent 66%),' +
        'radial-gradient(ellipse 55% 40% at 96% 96%, rgba(201,216,230,0.54) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(254,255,255,0.9) 0%, transparent 70%),' +
        'linear-gradient(152deg, #FBFCFD 0%, #EEF3F7 30%, #DDE7EF 62%, #C8D6E3 100%)',
      curtainDeep: '#E6EDF3',
      gold: '#8C7432', goldLight: '#EEE3BE',
      ink: '#2E3F52', inkSoft: 'rgba(46,63,82,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(140,116,50,0.32)',
      scrim: 'rgba(36,50,66,0.80)', slotIdle: 'rgba(255,255,255,0.68)',
      btnInner: '#A5BDD3', btnOuter: '#4F6E8E',
      foldOpacity: 0.10, vignette: 0.16,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'boda-terracota': {
    id: 'boda-terracota',
    name: 'Boda Boho Terracota',
    headerTextDefault: 'Nuestra Boda',
    footerTextDefault: 'Gracias por acompañarnos',
    strip: {
      headerTop: '#DE8B66', headerBottom: '#94482A',
      footerTop: '#94482A', footerBottom: '#DE8B66',
      stripBg: '#FCF6EE', photoBg: '#3A2218',
      borderInner: '#C0673F', accent: '#CFA04B', dateColor: '#A8704F',
    },
    ui: {
      mood: 'light', deco: 'floral-terracota',
      stageBg:
        'radial-gradient(ellipse 70% 48% at 50% 0%, rgba(255,252,246,0.96) 0%, transparent 62%),' +
        'radial-gradient(ellipse 55% 40% at 4% 96%, rgba(222,139,102,0.40) 0%, transparent 66%),' +
        'radial-gradient(ellipse 55% 40% at 96% 96%, rgba(232,192,116,0.40) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(255,250,242,0.9) 0%, transparent 70%),' +
        'linear-gradient(152deg, #FFFAF3 0%, #F8EBDD 30%, #F0D8C2 62%, #E4C0A0 100%)',
      curtainDeep: '#F2E2D2',
      gold: '#9A5A2C', goldLight: '#F4DDB8',
      ink: '#4E2E1E', inkSoft: 'rgba(78,46,30,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(192,103,63,0.32)',
      scrim: 'rgba(66,38,24,0.80)', slotIdle: 'rgba(255,255,255,0.62)',
      btnInner: '#E39A74', btnOuter: '#94482A',
      foldOpacity: 0.10, vignette: 0.16,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'boda-noche': {
    id: 'boda-noche',
    name: 'Boda Noche Azul & Oro',
    headerTextDefault: 'Nuestra Boda',
    footerTextDefault: 'Gracias por acompañarnos',
    strip: {
      headerTop: '#1E2F55', headerBottom: '#0C162E',
      footerTop: '#0C162E', footerBottom: '#1E2F55',
      stripBg: '#F7F5EF', photoBg: '#070D1C',
      borderInner: '#23386A', accent: '#E2C25C', dateColor: '#8C9AC0',
    },
    ui: {
      mood: 'dark', deco: 'floral-noche',
      stageBg:
        'radial-gradient(ellipse 70% 50% at 50% 4%, rgba(226,194,92,0.18) 0%, transparent 62%),' +
        'radial-gradient(ellipse 60% 46% at 8% 96%, rgba(44,66,120,0.55) 0%, transparent 66%),' +
        'radial-gradient(ellipse 60% 46% at 92% 96%, rgba(44,66,120,0.50) 0%, transparent 66%),' +
        'linear-gradient(166deg, #17264A 0%, #0D1834 46%, #070E20 100%)',
      curtainDeep: '#070E20',
      gold: '#E2C25C', goldLight: '#FBEEC2',
      ink: '#F4F6FB', inkSoft: 'rgba(222,228,244,0.70)',
      frameBorder: '#F0DFB4', frameGlow: 'rgba(226,194,92,0.46)',
      scrim: 'rgba(7,14,32,0.86)', slotIdle: 'rgba(14,24,52,0.66)',
      btnInner: '#3A5494', btnOuter: '#0C162E',
      foldOpacity: 0.40, vignette: 0.34,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'fiesta-globos': {
    id: 'fiesta-globos',
    name: 'Fiesta Globos Rosa & Oro',
    headerTextDefault: '¡Fiesta!',
    footerTextDefault: '¡Gracias por festejar con nosotros!',
    strip: {
      headerTop: '#EE9DB5', headerBottom: '#C98A72',
      footerTop: '#C98A72', footerBottom: '#EE9DB5',
      stripBg: '#FFF8F8', photoBg: '#3A2228',
      borderInner: '#CF7A95', accent: '#C9A227', dateColor: '#B07A88',
    },
    ui: {
      mood: 'light', deco: 'globos-rosa',
      stageBg:
        'radial-gradient(ellipse 70% 48% at 50% 0%, rgba(255,255,255,0.96) 0%, transparent 62%),' +
        'radial-gradient(ellipse 58% 42% at 6% 96%, rgba(249,196,212,0.55) 0%, transparent 66%),' +
        'radial-gradient(ellipse 58% 42% at 94% 96%, rgba(239,207,106,0.30) 0%, transparent 66%),' +
        'linear-gradient(152deg, #FFFCFB 0%, #FDEFF2 34%, #F8E0E6 66%, #F1CFD8 100%)',
      curtainDeep: '#FBE8EC',
      gold: '#A87E14', goldLight: '#F7E3A6',
      ink: '#5A2A3A', inkSoft: 'rgba(90,42,58,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(201,162,39,0.38)',
      scrim: 'rgba(72,34,48,0.80)', slotIdle: 'rgba(255,255,255,0.66)',
      btnInner: '#F2A9BF', btnOuter: '#C0587A',
      foldOpacity: 0.06, vignette: 0.14,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'fiesta-glam': {
    id: 'fiesta-glam',
    name: 'Fiesta Glam (globos negro y oro)',
    headerTextDefault: '¡Fiesta!',
    footerTextDefault: '¡Gracias por festejar con nosotros!',
    strip: {
      headerTop: '#2A2418', headerBottom: '#0D0B07',
      footerTop: '#0D0B07', footerBottom: '#2A2418',
      stripBg: '#141210', photoBg: '#050505',
      borderInner: '#5A4A18', accent: '#F0C64E', dateColor: '#BFA35A',
    },
    ui: {
      mood: 'dark', deco: 'globos-glam',
      stageBg:
        'radial-gradient(ellipse 62% 44% at 50% 2%, rgba(255,214,102,0.22) 0%, transparent 60%),' +
        'radial-gradient(ellipse 70% 46% at 50% 100%, rgba(160,120,30,0.22) 0%, transparent 64%),' +
        'linear-gradient(170deg, #1F1B14 0%, #110F0B 44%, #070709 100%)',
      curtainDeep: '#0A0906',
      gold: '#F0C64E', goldLight: '#FFF0BE',
      ink: '#FCF5E2', inkSoft: 'rgba(245,235,208,0.68)',
      frameBorder: '#F7E7BC', frameGlow: 'rgba(240,198,78,0.50)',
      scrim: 'rgba(10,9,6,0.86)', slotIdle: 'rgba(26,22,12,0.70)',
      btnInner: '#F0C64E', btnOuter: '#6E5210',
      foldOpacity: 0.30, vignette: 0.34,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },

  'fiesta-mexicana': {
    id: 'fiesta-mexicana',
    name: 'Fiesta Mexicana (papel picado)',
    headerTextDefault: '¡Fiesta!',
    footerTextDefault: '¡Gracias por festejar con nosotros!',
    strip: {
      headerTop: '#F0288A', headerBottom: '#9D1E6A',
      footerTop: '#9D1E6A', footerBottom: '#F0288A',
      stripBg: '#FFF9EE', photoBg: '#2A1030',
      borderInner: '#C8106A', accent: '#FF9A1F', dateColor: '#2FA35A',
    },
    ui: {
      mood: 'light', deco: 'floral-mexicana',
      stageBg:
        'radial-gradient(ellipse 70% 46% at 50% 0%, rgba(255,255,255,0.94) 0%, transparent 62%),' +
        'radial-gradient(ellipse 58% 44% at 4% 94%, rgba(240,40,138,0.22) 0%, transparent 66%),' +
        'radial-gradient(ellipse 58% 44% at 96% 94%, rgba(255,154,31,0.28) 0%, transparent 66%),' +
        'radial-gradient(ellipse 50% 34% at 50% 52%, rgba(255,253,246,0.92) 0%, transparent 70%),' +
        'linear-gradient(150deg, #FFFCF4 0%, #FFF1DC 34%, #FDE3E8 68%, #F4D6F0 100%)',
      curtainDeep: '#FDEDE4',
      gold: '#C8106A', goldLight: '#FFE0A8',
      ink: '#4A1838', inkSoft: 'rgba(74,24,56,0.68)',
      frameBorder: '#ffffff', frameGlow: 'rgba(240,40,138,0.32)',
      scrim: 'rgba(66,20,50,0.80)', slotIdle: 'rgba(255,255,255,0.66)',
      btnInner: '#FF6FA8', btnOuter: '#B30F63',
      foldOpacity: 0.06, vignette: 0.14,
      fontDisplay: SERIF, fontScript: SCRIPT,
    },
  },
};

const LEGACY_THEME_MAP = {
  fiesta: 'fiesta-moderna',
};

export function getTheme(id) {
  const resolved = LEGACY_THEME_MAP[id] || id;
  return themes[resolved] || themes.teatro;
}

/** Tokens ui -> variables CSS (--kebab-case). */
const CSS_VARS = {
  stageBg: '--stage-bg',
  curtainDeep: '--curtain-deep',
  gold: '--gold',
  goldLight: '--gold-light',
  ink: '--ink',
  inkSoft: '--ink-soft',
  frameBorder: '--frame-border',
  frameGlow: '--frame-glow',
  scrim: '--scrim',
  slotIdle: '--slot-idle',
  btnInner: '--btn-inner',
  btnOuter: '--btn-outer',
  foldOpacity: '--fold-opacity',
  vignette: '--vignette',
  fontDisplay: '--font-display',
  fontScript: '--font-script',
};

export function applyTheme(themeId) {
  const theme = getTheme(themeId);
  const root = document.documentElement;

  for (const [key, cssVar] of Object.entries(CSS_VARS)) {
    const value = theme.ui[key];
    if (value !== undefined && value !== null) {
      root.style.setProperty(cssVar, String(value));
    }
  }

  document.body.dataset.theme = theme.id;
  document.body.dataset.deco = theme.ui.deco || 'none';
  document.body.dataset.mood = theme.ui.mood || 'dark';
  return theme;
}

export function listThemes() {
  return Object.values(themes);
}

export function getStripColors(branding) {
  const theme = getTheme(branding.themeId);
  return {
    ...theme.strip,
    accent: branding.accentColor || theme.strip.accent,
  };
}
