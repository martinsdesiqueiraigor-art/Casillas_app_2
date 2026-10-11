// Ponte de referencias locais: somente fichas publicadas, sem inferencia tecnica.
// A busca geral da Biblioteca permanece independente deste roteamento.
import { categories, sheets, TOPIC_STATUS } from './data.js';
import { buildIndex, fold, terms } from './search.js';
import { isHomologated, toPath } from './routes.js';
import { resolveRelatedActions } from './relatedActions.js';

const index = buildIndex(categories, sheets, TOPIC_STATUS).filter(item => item.type === 'ficha');
const cncMarkers = /\b(?:g\d{1,3}(?:\.\d+)?|m\d{1,3}|fanuc|siemens|mazatrol|mazak|mach\d*|cnc|torno|fresadora|fresamento|usinagem|roscamento|furacao|ciclo|ciclos|rosca|roscas)\b/u;
const instrumentMarkers = /\b(?:micrometro|paquimetro|metrologia|medicao|medir|instrumento|instrumentos)\b/u;

/** Correspondencia por palavras completas, sem acento e sem diferenca de caixa. */
function hasWord(text, word) {
  return new RegExp('(^|[^a-z0-9])' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^a-z0-9])', 'u').test(text);
}

/** @param {string} question @param {number} [limit] */
export function findBibliotecaReferences(question, limit = 3) {
  const q = String(question ?? '').trim();
  if (!q) return [];
  const cap = Number.isFinite(limit) ? Math.max(0, Math.min(10, Math.trunc(limit))) : 3;
  if (!cap) return [];
  const normalized = fold(q);
  // Marcadores CNC tem prioridade, exceto quando o instrumento e explicitamente solicitado.
  if (cncMarkers.test(normalized) && !instrumentMarkers.test(normalized)) return [];
  const tokens = terms(q).filter(t => /[a-z0-9]/.test(t));
  if (!tokens.length) return [];
  return index
    .filter(item => Object.hasOwn(sheets, item.route.id) && (tokens.every(t => hasWord(item.fAll, t)) || (instrumentMarkers.test(normalized) && tokens.some(t => instrumentMarkers.test(t) && hasWord(item.fTitle, t)))))
    .sort((a, b) => Number(tokens.every(t => hasWord(b.fTitle, t))) - Number(tokens.every(t => hasWord(a.fTitle, t))))
    .slice(0, cap)
    .map(item => ({
      title: item.title,
      subtitle: item.sub,
      excerpt: String(sheets[item.route.id].summary || ''),
      reviewState: sheets[item.route.id].reviewState,
      actions: resolveRelatedActions(sheets[item.route.id].related),
      route: { ...item.route },
      hash: '#/biblioteca/' + toPath(item.route),
      homologated: isHomologated(sheets[item.route.id]),
    }));
}

/**
 * Identifica somente instrumentos de metrologia explicitamente nomeados
 * e registrados como planejados no catalogo publico. Nao consulta fichas em rascunho.
 * @param {string} question
 * @returns {{ title: string, status: 'planned' } | null}
 */
export function findPlannedMetrologyTopic(question) {
  const q = fold(String(question ?? '').trim());
  if (!q) return null;
  const category = categories.find(c => c.id === 'metrologia');
  if (!category) return null;
  for (const topic of category.topics) {
    if (topic.status !== 'planned' || topic.sheetId) continue;
    const name = fold(topic.title);
    if (hasWord(q, name)) return { title: topic.title, status: 'planned' };
  }
  return null;
}
