// CAS22-BIB-FICHA-02 — Rascunho da ficha de Paquímetro.
// Garante que o rascunho está completo, demonstrativo, sem conteúdo técnico
// inventado e isolado: fora de sheets, da busca, dos contadores, do Consultor
// e das rotas públicas. Também verifica a compatibilidade de `procedure`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const M = '../../js/modules/biblioteca/';
const { categories, sheets, draftSheets, REVIEW_STATES, TOPIC_STATUS } = await import(M + 'data.js');
const { buildIndex, search, procedureText, fold } = await import(M + 'search.js');
const { normalizeRoute, parsePath, toPath, isHomologated, isValidId } = await import(M + 'routes.js');
const { findBibliotecaReferences } = await import(M + 'consultorBridge.js');
const { resolveRelatedActions } = await import(M + 'relatedActions.js');

const ID = 'paquimetro-fundamentos';
const DRAFT = draftSheets[ID];
const MICRO = sheets['micrometro-externo-fundamentos'];
const PUBLIC = { categories, sheets };

/** Todas as strings de um objeto, em profundidade. */
function strings(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
}

/* ------------------------------------------------------------ conteúdo */

test('rascunho existe, é demonstrativo e não homologado', () => {
  assert.ok(DRAFT, 'draftSheets.paquimetro-fundamentos');
  assert.equal(DRAFT.id, ID);
  assert.ok(isValidId(DRAFT.id));
  assert.equal(DRAFT.reviewState, 'demo');
  assert.ok(Object.hasOwn(REVIEW_STATES, DRAFT.reviewState));
  assert.match(DRAFT.version, /demo/);
  assert.equal(isHomologated(DRAFT), false);
  assert.equal(DRAFT.categoryId, 'metrologia');
  assert.equal(DRAFT.topicId, 'paquimetro');
  assert.equal(DRAFT.review.reviewer, 'Pendente');
});

test('estrutura equivalente à ficha do Micrômetro (mesmos campos de primeiro nível)', () => {
  const expected = Object.keys(MICRO).filter((k) => k !== 'procedure');
  for (const k of expected) assert.ok(Object.hasOwn(DRAFT, k), `campo ausente: ${k}`);
  assert.ok(Array.isArray(DRAFT.procedures) && DRAFT.procedures.length >= 4, 'procedimentos em blocos');
  for (const b of DRAFT.procedures) {
    assert.equal(typeof b.title, 'string');
    assert.ok(b.title.trim());
    assert.ok(Array.isArray(b.steps) && b.steps.length > 0, b.title);
  }
  const titles = DRAFT.procedures.map((b) => b.title);
  for (const t of ['Preparação', 'Medida externa', 'Medida interna', 'Profundidade', 'Ressalto', 'Leitura e registro']) assert.ok(titles.includes(t), t);
  assert.ok(DRAFT.cautions.some((c) => c.kind === 'alerta'));
  assert.ok(DRAFT.cautions.filter((c) => c.kind === 'erro').length >= 5);
  assert.ok(DRAFT.conservation.length > 0);
  assert.equal(DRAFT.consultorExamples.length, 3);
});

test('termos técnicos presentes (terminologia não omitida)', () => {
  const text = fold(strings(DRAFT).join(' '));
  for (const term of ['escala principal', 'cursor', 'encostos', 'orelhas', 'haste de profundidade', 'nonio', 'ressalto', 'impulsor', 'trava', 'paralaxe', 'profundidade', 'furos'])
    assert.ok(text.includes(term), term);
});

test('sem valores, unidades, normas ou referências inventadas', () => {
  // Metadados de identificação e histórico (código, versão, tempo de leitura, notas de revisão) ficam fora da verificação.
  const ignore = new Set([DRAFT.code, DRAFT.version, DRAFT.readingTime, ...DRAFT.review.history.flatMap((x) => [x.version, x.note])]);
  const text = strings(DRAFT).filter((x) => !ignore.has(x)).join('\n');
  assert.doesNotMatch(text, /\d/, 'nenhum número no conteúdo');
  assert.doesNotMatch(text, /\b(ISO|DIN|ABNT|NBR|NM|ASME|ANSI|JIS|VIM)\b/, 'nenhuma norma citada');
  // ('um' fica de fora: em português é artigo. Sem números, nenhuma unidade pode quantificar algo.)
  assert.doesNotMatch(text, /\b(mm|cm|pol|polegadas?|milímetros?|centésimos?|milésimos?)\b|µm|"/i, 'nenhuma unidade');
  for (const r of DRAFT.references) assert.equal(r.status, 'pending', r.label);
});

test('sem ações verificadas nem vínculos com Calculadoras ou Guia CNC', () => {
  for (const r of DRAFT.related) {
    assert.notEqual(r.verified, true);
    assert.equal(r.evidence, undefined);
    assert.ok(['consultor', 'topic'].includes(r.kind), r.kind);
  }
  assert.deepEqual(resolveRelatedActions(DRAFT.related), []);
});

test('ilustração própria registrada', async () => {
  const src = readFileSync(new URL(M + 'dom.js', import.meta.url), 'utf8');
  for (const f of DRAFT.illustrations) assert.match(src, new RegExp(`'${f.id}':\\s*\``), f.id);
  const svg = src.slice(src.indexOf("'paquimetro-partes'"), src.indexOf('</svg>', src.indexOf("'paquimetro-partes'")));
  assert.doesNotMatch(svg.replace(/<[^>]+>/g, (tag) => (tag.startsWith('<text') ? tag.replace(/"[^"]*"/g, '""') : '')), /\d/, 'sem cotas nos rótulos');
  assert.match(svg, /role="img"/);
  assert.match(svg, /aria-label="Esquema do paquímetro/);
});

/* ------------------------------------------------------------ isolamento */

test('rascunho fora das fichas publicadas e assunto ainda em preparação', () => {
  assert.equal(Object.hasOwn(sheets, ID), true);
  const met = categories.find((c) => c.id === 'metrologia');
  const topic = met.topics.find((t) => t.id === 'paquimetro');
  assert.equal(topic.status, 'available');
  assert.equal(topic.sheetId, ID);
  assert.equal(met.topics.filter((t) => t.status === 'available').length, 2, 'contador: 1 ficha disponível');
  for (const id of Object.keys(draftSheets)) assert.equal(sheets[id].reviewState, 'demo', id);
});

test('busca pública não encontra o rascunho', () => {
  const index = buildIndex(categories, sheets, TOPIC_STATUS);
  assert.equal(index.some((e) => e.type === 'ficha' && e.route.id === ID), true);
  for (const q of ['paquimetro', 'PAQUÍMETRO', 'nonio', 'orelhas', 'haste de profundidade', 'ressalto', 'impulsor', 'BIB-MET-002'])
    assert.equal(search(index, q).some((r) => r.route.name === 'ficha' && r.route.id === ID), true, q);
});

test('Consultor não recebe o rascunho', () => {
  const queries = ['paquimetro', 'Paquímetro', 'nônio', 'orelhas', 'ressalto', 'haste de profundidade'];
  for (const q of queries) assert.equal(findBibliotecaReferences(q, 10).some((r) => r.route.id === ID), true, q);
});

test('rotas públicas não abrem o rascunho', () => {
  for (const r of [{ name: 'ficha', id: ID }, { name: 'ficha', id: ID, tab: 'uso' }, { name: 'consultor', id: ID }])
    assert.equal(normalizeRoute(r, PUBLIC).name, r.name, JSON.stringify(r));
  for (const p of [`ficha/${ID}`, `ficha/${ID}?aba=cuidados`, `consultor/${ID}`])
    assert.equal(normalizeRoute(parsePath(p), PUBLIC).name, p.startsWith('consultor/') ? 'consultor' : 'ficha', p);
});

test('código do app e da integração não referencia rascunhos', () => {
  const root = new URL('../../', import.meta.url);
  const walk = (dir) => readdirSync(new URL(dir, root), { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(`${dir}${e.name}/`) : [`${dir}${e.name}`]));
  const files = walk('js/').filter((f) => f.endsWith('.js') && f !== 'js/modules/biblioteca/data.js');
  for (const f of [...files, 'service-worker.js', 'index.html']) {
    assert.doesNotMatch(readFileSync(new URL(f, root), 'utf8'), /draftSheets/, f);
  }
});

/* ------------------------------------------------------------ pré-visualização */

test('na pré-visualização, a ficha abre por rota direta e as abas são válidas', () => {
  const preview = { categories, sheets: { ...sheets, [ID]: DRAFT } };
  for (const tab of ['visao', 'uso', 'cuidados', 'fontes'])
    assert.deepEqual(normalizeRoute({ name: 'ficha', id: ID, tab }, preview), { name: 'ficha', id: ID, tab });
  assert.deepEqual(normalizeRoute(parsePath(toPath({ name: 'ficha', id: ID, tab: 'uso' })), preview), { name: 'ficha', id: ID, tab: 'uso' });
});

test('quando publicada, a busca indexará os blocos de procedimento e abrirá a aba certa', () => {
  const index = buildIndex(categories, { ...sheets, [ID]: DRAFT }, TOPIC_STATUS);
  const find = (q) => search(index, q).find((r) => r.route.id === ID);
  assert.ok(find('paquimetro'));
  assert.equal(find('nonio').route.tab, 'visao');
  assert.equal(find('impulsor').route.tab, 'visao');
  assert.equal(find('corda').route.tab, 'cuidados');
  assert.equal(find('zeragem').route.tab, 'uso');
});

/* ------------------------------------------------------------ compatibilidade */

test('procedureText: Micrômetro (lista simples) inalterado; blocos incluem títulos e passos', () => {
  assert.equal(procedureText(MICRO), MICRO.procedure.join(' '));
  assert.equal(MICRO.procedures, undefined, 'Micrômetro continua com procedure');
  const t = procedureText(DRAFT);
  for (const b of DRAFT.procedures) {
    assert.ok(t.includes(b.title));
    for (const s of b.steps) assert.ok(t.includes(s));
  }
  assert.equal(procedureText({}), '');
  assert.equal(procedureText({ procedures: [null, { title: 'x' }] }), '');
});
