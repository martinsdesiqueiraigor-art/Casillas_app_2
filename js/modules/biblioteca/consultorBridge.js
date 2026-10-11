// Fase 3: ponte de consulta local entre Consultor e Biblioteca.
// Retorna somente localizadores de fichas, nunca respostas tecnicas inferidas.
import { categories, sheets, TOPIC_STATUS } from './data.js';
import { buildIndex, search } from './search.js';
import { isHomologated, toPath } from './routes.js';
import { resolveRelatedActions } from './relatedActions.js';

const index = buildIndex(categories, sheets, TOPIC_STATUS);

/** @param {string} question @param {number} [limit] */
export function findBibliotecaReferences(question, limit = 3) {
  const q = String(question ?? '').trim();
  if (!q) return [];
  const cap = Number.isFinite(limit) ? Math.max(0, Math.min(10, Math.trunc(limit))) : 3;
  return search(index, q)
    .filter(item => item.type === 'ficha' && Object.hasOwn(sheets, item.route.id))
    .slice(0, cap)
    .map(item => ({
      title: item.title,
      subtitle: item.sub,
      // Trecho literal da ficha, sem gerar instruções ou extrapolar conteúdo.
      excerpt: String(sheets[item.route.id].summary || ''),
      reviewState: sheets[item.route.id].reviewState,
      actions: resolveRelatedActions(sheets[item.route.id].related),
      route: { ...item.route },
      hash: '#/biblioteca/' + toPath(item.route),
      homologated: isHomologated(sheets[item.route.id]),
    }));
}