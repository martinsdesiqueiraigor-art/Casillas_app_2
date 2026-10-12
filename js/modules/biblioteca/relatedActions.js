// Destinos relacionados devem ser declarados na ficha e permitidos pelo roteador.
// Nao inferir calculadora ou controle CNC a partir de palavras semelhantes.
const CALCULATORS = new Set(['trig','coni','poly','furos','rosca','tol','potencia','chaveta','conicpad','prog']);

/** @param {unknown} related */
export function resolveRelatedActions(related) {
  if (!Array.isArray(related)) return [];
  const actions = [];
  const seen = new Set();
  for (const entry of related) {
    if (!entry || typeof entry !== 'object' || entry.verified !== true || typeof entry.evidence !== 'string' || !entry.evidence.trim()) continue;
    let hash = '';
    if (entry.kind === 'calculator' && typeof entry.target === 'string' && CALCULATORS.has(entry.target)) {
      hash = '#/modulo/' + entry.target;
    }
    // O Guia CNC exige alvo técnico específico (controle/ciclo/variante).
    // Não oferecer navegação genérica como se fosse ficha correspondente.
    if (!hash || seen.has(hash)) continue;
    seen.add(hash);
    actions.push({ label: typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : 'Abrir recurso relacionado', hash });
  }
  return actions;
}
