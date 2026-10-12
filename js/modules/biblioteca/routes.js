// routes.js — Rotas internas da Biblioteca Técnica (sem tocar no hash do app).
//
// Uma rota é um objeto simples:
//   { name: 'home' }
//   { name: 'categoria', id }
//   { name: 'ficha', id, tab }          tab: visao | uso | cuidados | fontes
//   { name: 'busca', q }
//   { name: 'consultor', id }           demonstração do fluxo Ficha → Consultor
//   { name: 'notfound' }
//
// toPath/parsePath convertem a rota em texto ('ficha/<id>?aba=uso') para que a
// Fase 2 possa ligar o módulo ao roteador do app. Nesta fase nada lê ou escreve
// window.location.

export const SHEET_TABS = [
  { id: 'visao', label: 'Visão geral', icon: 'layers' },
  { id: 'uso', label: 'Utilização', icon: 'gauge' },
  { id: 'cuidados', label: 'Cuidados', icon: 'alert' },
  { id: 'fontes', label: 'Fontes e revisão', icon: 'source' },
];
export const TAB_IDS = SHEET_TABS.map((t) => t.id);

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const MAX_QUERY = 120;

/** @param {unknown} id */
export function isValidId(id) {
  return typeof id === 'string' && ID_RE.test(id);
}

/**
 * Valida e completa uma rota contra os dados. Nunca lança exceção:
 * qualquer entrada inválida vira { name: 'notfound' }.
 * @param {any} route
 * @param {{ categories: any[], sheets: Record<string, any> }} data
 * @param {(id: string) => string | undefined} [rememberedTab]
 */
export function normalizeRoute(route, data, rememberedTab) {
  try {
    if (!route || typeof route !== 'object') return { name: 'home' };
    switch (route.name) {
      case 'home':
      case undefined:
        return { name: 'home' };
      case 'categoria':
        return isValidId(route.id) && data.categories.some((c) => c.id === route.id)
          ? { name: 'categoria', id: route.id }
          : { name: 'notfound' };
      case 'ficha':
      case 'consultor': {
        if (!isValidId(route.id) || !Object.prototype.hasOwnProperty.call(data.sheets, route.id)) return { name: 'notfound' };
        if (route.name === 'consultor') return { name: 'consultor', id: route.id };
        const tab = TAB_IDS.includes(route.tab) ? route.tab : (rememberedTab?.(route.id) || 'visao');
        return { name: 'ficha', id: route.id, tab: TAB_IDS.includes(tab) ? tab : 'visao' };
      }
      case 'busca':
        return { name: 'busca', q: typeof route.q === 'string' ? route.q.slice(0, MAX_QUERY) : '' };
      default:
        return { name: 'notfound' };
    }
  } catch {
    return { name: 'notfound' };
  }
}

/** Tela-pai, usada quando não há histórico interno. */
export function parentOf(route, data) {
  if (route.name === 'ficha') {
    const s = data.sheets[route.id];
    return s ? { name: 'categoria', id: s.categoryId } : { name: 'home' };
  }
  if (route.name === 'consultor') return { name: 'ficha', id: route.id };
  return { name: 'home' };
}

/** @returns {string} caminho relativo ao módulo, para uso futuro no roteador do app. */
export function toPath(route) {
  switch (route?.name) {
    case 'categoria': return `categoria/${route.id}`;
    case 'ficha': return `ficha/${route.id}${route.tab ? `?aba=${route.tab}` : ''}`;
    case 'consultor': return `consultor/${route.id}`;
    case 'busca': return route.q ? `busca?q=${encodeURIComponent(route.q)}` : 'busca';
    default: return '';
  }
}

/** Converte texto em rota (sem validar contra os dados; use normalizeRoute depois). Nunca lança. */
export function parsePath(path) {
  try {
    const [p, qs = ''] = String(path ?? '').replace(/^[#/]+/, '').split('?');
    const parts = p.split('/').filter(Boolean);
    const params = new URLSearchParams(qs);
    const id = parts[1] ? decodeURIComponent(parts[1]) : undefined;
    switch (parts[0]) {
      case undefined: return { name: 'home' };
      case 'categoria': return { name: 'categoria', id };
      case 'ficha': return { name: 'ficha', id, tab: params.get('aba') || undefined };
      case 'consultor': return { name: 'consultor', id };
      case 'busca': return { name: 'busca', q: params.get('q') || '' };
      default: return { name: 'notfound' };
    }
  } catch {
    return { name: 'notfound' };
  }
}

/**
 * Uma ficha só é tratada como homologada quando o estado é "validated" E todas
 * as referências estão vinculadas. Qualquer outro caso (demonstração, rascunho,
 * revisão, estado desconhecido ou referência pendente) exibe o aviso de
 * conteúdo não homologado.
 */
export function isHomologated(sheet) {
  if (!sheet || sheet.reviewState !== 'validated') return false;
  const refs = Array.isArray(sheet.references) ? sheet.references : [];
  return refs.length > 0 && refs.every((ref) => ref && ref.status === 'linked');
}
