const CATALOG_URL = '/templates/catalog.json';
const templateCache = new Map();

export async function loadCatalog() {
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error('No se pudo cargar el catálogo de plantillas');
  return res.json();
}

export function getTemplateBaseUrl(folder) {
  return `/templates/${folder}`;
}

export function resolveTemplateAsset(folder, filename) {
  return `${getTemplateBaseUrl(folder)}/${filename}`;
}

export async function loadTemplateDefinition(folder) {
  const url = resolveTemplateAsset(folder, 'template.json');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se encontró template.json en ${folder}`);
  const data = await res.json();
  templateCache.set(folder, data);
  return data;
}

export async function getJsonTemplateById(id) {
  const catalog = await loadCatalog();
  const entry = catalog.templates.find((t) => t.id === id);
  if (!entry) return null;

  const definition = await loadTemplateDefinition(entry.folder);
  return {
    ...entry,
    definition,
    baseUrl: getTemplateBaseUrl(entry.folder),
  };
}

export async function listJsonTemplates() {
  const catalog = await loadCatalog();
  return catalog.templates.map((entry) => ({
    ...entry,
    previewUrl: resolveTemplateAsset(entry.folder, entry.preview || 'preview.svg'),
    templateUrl: resolveTemplateAsset(entry.folder, 'template.json'),
  }));
}

export function clearTemplateCache() {
  templateCache.clear();
}
