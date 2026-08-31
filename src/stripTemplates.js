export const stripTemplates = {
  clasico: {
    id: 'clasico',
    name: 'Clásico SDE',
    description: 'Header/footer oscuro con marco dorado',
    colors: null,
  },
  romantico: {
    id: 'romantico',
    name: 'Boda romántica',
    description: 'Rosa suave, corazones y tipografía cursiva',
    colors: {
      headerTop: '#e8b4b8',
      headerBottom: '#d4989e',
      footerTop: '#d4989e',
      footerBottom: '#c08088',
      stripBg: '#fdf5f2',
      photoBg: '#ffffff',
      borderInner: '#c9a0a8',
      accent: '#8b5a4a',
      dateColor: '#a07070',
    },
  },
  elegante: {
    id: 'elegante',
    name: 'Boda elegante',
    description: 'Tonos arena/crema, estilo minimal',
    colors: {
      headerTop: '#d4c4a8',
      headerBottom: '#c4b090',
      footerTop: '#c4b090',
      footerBottom: '#b8a080',
      stripBg: '#ebe0d0',
      photoBg: '#f8f4ee',
      borderInner: '#a89070',
      accent: '#6b5344',
      dateColor: '#8b7355',
    },
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage / viaje',
    description: 'Verde menta con estilo mapa antiguo',
    colors: {
      headerTop: '#5a9a94',
      headerBottom: '#4a8a84',
      footerTop: '#4a8a84',
      footerBottom: '#3a7a74',
      stripBg: '#c8ddd8',
      photoBg: '#ffffff',
      borderInner: '#4a7a74',
      accent: '#ffffff',
      dateColor: '#3a5a54',
    },
  },
  xv: {
    id: 'xv',
    name: 'XV años festivo',
    description: 'Rosa arriba y turquesa abajo',
    colors: {
      headerTop: '#c43d7a',
      headerBottom: '#a02860',
      footerTop: '#2a9898',
      footerBottom: '#1a7878',
      stripBg: '#f8e0ec',
      photoBg: '#ffffff',
      borderInner: '#a02860',
      accent: '#ffffff',
      dateColor: '#ffffff',
    },
  },
  marcos: {
    id: 'marcos',
    name: 'Marcos dorados',
    description: 'Fondo claro con marco tipo portarretrato',
    colors: {
      headerTop: '#2a2018',
      headerBottom: '#1a1008',
      footerTop: '#1a1008',
      footerBottom: '#2a2018',
      stripBg: '#faf8f5',
      photoBg: '#1a1008',
      borderInner: '#8b6914',
      accent: '#d4af37',
      dateColor: '#8b7355',
    },
  },
  glitter: {
    id: 'glitter',
    name: 'Glitter rosa oro',
    description: 'Fondo brillante rosa-dorado',
    colors: {
      headerTop: '#b88868',
      headerBottom: '#986848',
      footerTop: '#986848',
      footerBottom: '#786038',
      stripBg: '#e8c8b0',
      photoBg: '#ffffff',
      borderInner: '#c9a070',
      accent: '#ffffff',
      dateColor: '#5a4030',
    },
  },
  fiesta: {
    id: 'fiesta',
    name: 'Fiesta / banner',
    description: 'Borde morado y pie tipo póster',
    colors: {
      headerTop: '#6b2a8c',
      headerBottom: '#4a1a6c',
      footerTop: '#e85d4a',
      footerBottom: '#c43d2a',
      stripBg: '#f0e8f8',
      photoBg: '#ffffff',
      borderInner: '#6b2a8c',
      accent: '#ffffff',
      dateColor: '#ffffff',
    },
  },
};

export function getStripTemplate(id) {
  return stripTemplates[id] || stripTemplates.clasico;
}

export function listStripTemplates() {
  return Object.values(stripTemplates);
}
