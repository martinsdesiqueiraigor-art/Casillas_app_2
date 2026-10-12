// Testes isolados da Biblioteca Técnica (CAS22-BIB-INTEGRATION-FASE-01): busca, rotas e dados.
// Executar: node --test tests/biblioteca/
import { test } from 'node:test';
import assert from 'node:assert/strict';

const M = '../../js/modules/biblioteca/';
const { fold, terms, buildIndex, search, highlightSegments, filterTopics } = await import(M + 'search.js');
const { normalizeRoute, parentOf, toPath, parsePath, isValidId, isHomologated, TAB_IDS, SHEET_TABS } = await import(M + 'routes.js');
const { categories, sheets, REVIEW_STATES, TOPIC_STATUS } = await import(M + 'data.js');

const DATA = { categories, sheets };
const INDEX = buildIndex(categories, sheets, TOPIC_STATUS);
const SHEET = 'micrometro-externo-fundamentos';

/* ------------------------------------------------------- normalização */

test('fold remove acentos e caixa preservando o comprimento', () => {
  assert.equal(fold('MICRÔMETRO Paquímetro ç Ã'), 'micrometro paquimetro c a');
  for (const s of ['Relógio comparador', 'TOLERÂNCIA', 'açaí', 'İstanbul']) assert.equal(Array.from(fold(s)).length, Array.from(s).length, s);
  assert.equal(fold(null), '');
  assert.equal(fold(undefined), '');
  assert.equal(fold(42), '42');
});

test('terms separa por espaços e ignora vazios', () => {
  assert.deepEqual(terms('  Micrômetro   EXTERNO '), ['micrometro', 'externo']);
  assert.deepEqual(terms(''), []);
  assert.deepEqual(terms('   '), []);
});

/* --------------------------------------------------------------- busca */

test('busca ignora caixa e acentos', () => {
  for (const q of ['micrometro', 'MICRÔMETRO', 'Micrômetro', 'mIcRoMeTrO']) {
    const r = search(INDEX, q);
    assert.ok(r.length >= 1, q);
    assert.equal(r[0].type, 'ficha', q);
    assert.deepEqual(r[0].route, { name: 'ficha', id: SHEET }, q);
  }
});

test('termo no conteúdo abre a ficha na aba correspondente', () => {
  const casos = { paralaxe: 'cuidados', catraca: 'visao', limpe: 'uso', fabricante: 'visao', estojo: 'cuidados' };
  for (const [q, tab] of Object.entries(casos)) {
    const ficha = search(INDEX, q).find((r) => r.type === 'ficha');
    assert.ok(ficha, q);
    assert.equal(ficha.route.tab, tab, q);
    assert.match(ficha.where, /\S/, q);
  }
});

test('busca por área, assunto e vários termos', () => {
  assert.ok(search(INDEX, 'rosca').some((r) => r.type === 'area' && r.route.id === 'roscas'));
  assert.ok(search(INDEX, 'relogio').some((r) => r.type === 'assunto' && r.route.id === 'metrologia'));
  const multi = search(INDEX, 'tolerancia desenho');
  assert.ok(multi.some((r) => r.title === 'Leitura de tolerâncias no desenho'));
  assert.ok(multi.every((r) => /toler/.test(fold(r.title + r.sub)) || r.where));
});

test('busca vazia ou sem correspondência devolve lista vazia', () => {
  assert.deepEqual(search(INDEX, ''), []);
  assert.deepEqual(search(INDEX, '   '), []);
  assert.deepEqual(search(INDEX, 'zzzz'), []);
  assert.deepEqual(search(INDEX, '<script>alert(1)</script>'), []);
});

test('resultados ordenados: título antes de conteúdo; fichas antes de assuntos e áreas', () => {
  const r = search(INDEX, 'medicao');
  for (let i = 1; i < r.length; i++) assert.ok(r[i - 1].score <= r[i].score);
  const rank = { ficha: 0, assunto: 1, area: 2 };
  const inTitle = r.filter((x) => x.score < 10);
  for (let i = 1; i < inTitle.length; i++) assert.ok(rank[inTitle[i - 1].type] <= rank[inTitle[i].type]);
});

test('busca não altera o índice nem devolve referências mutáveis às rotas', () => {
  const r = search(INDEX, 'paralaxe');
  r[0].route.tab = 'xxx';
  assert.equal(search(INDEX, 'paralaxe')[0].route.tab, 'cuidados');
});

test('highlightSegments marca os termos sem montar HTML', () => {
  const segs = highlightSegments('Micrômetro externo — Fundamentos', 'MICROMETRO fund');
  assert.equal(segs.map((s) => s.text).join(''), 'Micrômetro externo — Fundamentos');
  assert.deepEqual(segs.filter((s) => s.mark).map((s) => s.text), ['Micrômetro', 'Fund']);
  assert.deepEqual(highlightSegments('<b>x</b>', 'b'), [
    { text: '<', mark: false }, { text: 'b', mark: true }, { text: '>x</', mark: false }, { text: 'b', mark: true }, { text: '>', mark: false },
  ]);
  assert.deepEqual(highlightSegments('', 'a'), []);
});

test('filterTopics filtra assuntos da área', () => {
  const met = categories.find((c) => c.id === 'metrologia');
  assert.equal(filterTopics(met.topics, 'PAQUIM').length, 1);
  assert.equal(filterTopics(met.topics, 'relógio').length, 1);
  assert.equal(filterTopics(met.topics, 'xyz').length, 0);
  assert.equal(filterTopics(met.topics, '').length, 4);
});

/* --------------------------------------------------------------- rotas */

test('rotas válidas são normalizadas', () => {
  assert.deepEqual(normalizeRoute({ name: 'home' }, DATA), { name: 'home' });
  assert.deepEqual(normalizeRoute({ name: 'categoria', id: 'metrologia' }, DATA), { name: 'categoria', id: 'metrologia' });
  assert.deepEqual(normalizeRoute({ name: 'ficha', id: SHEET }, DATA), { name: 'ficha', id: SHEET, tab: 'visao' });
  for (const tab of TAB_IDS) assert.equal(normalizeRoute({ name: 'ficha', id: SHEET, tab }, DATA).tab, tab);
  assert.equal(normalizeRoute({ name: 'ficha', id: SHEET }, DATA, () => 'fontes').tab, 'fontes');
  assert.equal(normalizeRoute({ name: 'ficha', id: SHEET, tab: 'uso' }, DATA, () => 'fontes').tab, 'uso');
  assert.deepEqual(normalizeRoute({ name: 'consultor', id: SHEET }, DATA), { name: 'consultor', id: SHEET });
  assert.deepEqual(normalizeRoute({ name: 'busca', q: 'abc' }, DATA), { name: 'busca', q: 'abc' });
});

test('identificadores e rotas inválidas viram notfound sem lançar exceção', () => {
  const bad = [
    { name: 'categoria', id: 'inexistente' }, { name: 'categoria', id: '../etc' }, { name: 'categoria', id: '<img src=x onerror=alert(1)>' },
    { name: 'categoria' }, { name: 'categoria', id: 42 }, { name: 'categoria', id: 'A'.repeat(500) },
    { name: 'ficha', id: '__proto__' }, { name: 'ficha', id: 'constructor' }, { name: 'ficha', id: 'tostring' }, { name: 'ficha', id: 'hasownproperty' },
    { name: 'ficha', id: 'nao-existe' }, { name: 'consultor', id: 'x' }, { name: 'admin' }, { name: '__proto__' },
  ];
  for (const r of bad) assert.deepEqual(normalizeRoute(r, DATA), { name: 'notfound' }, JSON.stringify(r).slice(0, 60));
});

test('aba inválida usa a padrão; entradas estranhas não lançam', () => {
  assert.equal(normalizeRoute({ name: 'ficha', id: SHEET, tab: 'xyz' }, DATA).tab, 'visao');
  assert.equal(normalizeRoute({ name: 'ficha', id: SHEET, tab: '__proto__' }, DATA, () => 'hack').tab, 'visao');
  for (const r of [null, undefined, 'texto', 7, [], { name: 'busca', q: { x: 1 } }]) assert.doesNotThrow(() => normalizeRoute(r, DATA));
  assert.equal(normalizeRoute({ name: 'busca', q: 'x'.repeat(1000) }, DATA).q.length, 120);
  assert.equal(normalizeRoute({ name: 'busca', q: { x: 1 } }, DATA).q, '');
  assert.deepEqual(normalizeRoute({ name: 'categoria', id: 'metrologia' }, null), { name: 'notfound' }, 'dados ausentes não lançam');
});

test('tela-pai sem histórico', () => {
  assert.deepEqual(parentOf({ name: 'ficha', id: SHEET }, DATA), { name: 'categoria', id: 'metrologia' });
  assert.deepEqual(parentOf({ name: 'consultor', id: SHEET }, DATA), { name: 'ficha', id: SHEET });
  assert.deepEqual(parentOf({ name: 'categoria', id: 'roscas' }, DATA), { name: 'home' });
  assert.deepEqual(parentOf({ name: 'ficha', id: 'nao-existe' }, DATA), { name: 'home' });
});

test('toPath/parsePath (preparação para o roteador do app) fazem ida e volta e nunca lançam', () => {
  const routes = [
    { name: 'categoria', id: 'metrologia' }, { name: 'ficha', id: SHEET, tab: 'cuidados' },
    { name: 'consultor', id: SHEET }, { name: 'busca', q: 'micrômetro externo' },
  ];
  for (const r of routes) assert.deepEqual(normalizeRoute(parsePath(toPath(r)), DATA), normalizeRoute(r, DATA));
  assert.deepEqual(parsePath(''), { name: 'home' });
  assert.deepEqual(parsePath('#/xyz'), { name: 'notfound' });
  for (const p of ['categoria/%E0%A4%A', 'ficha/%', '%%%', null, undefined, 'busca?q=%ZZ']) assert.doesNotThrow(() => normalizeRoute(parsePath(p), DATA), String(p));
  assert.deepEqual(normalizeRoute(parsePath('categoria/%E0%A4%A'), DATA), { name: 'notfound' });
});

test('isValidId', () => {
  assert.ok(isValidId('micrometro-externo-fundamentos'));
  for (const id of ['', 'A', '-x', 'a b', 'a/b', 'a.b', null, 1, 'x'.repeat(65)]) assert.equal(isValidId(id), false, String(id));
});

/* --------------------------------------------------------------- dados */

test('dados: identificadores válidos e referências internas consistentes', () => {
  const ids = new Set();
  for (const c of categories) {
    assert.ok(isValidId(c.id), c.id); assert.ok(!ids.has(c.id)); ids.add(c.id);
    for (const t of c.topics) {
      assert.ok(isValidId(t.id), t.id);
      assert.ok(t.status in TOPIC_STATUS, t.id);
      if (t.sheetId) { assert.ok(Object.hasOwn(sheets, t.sheetId), t.sheetId); assert.equal(t.status, 'available'); }
    }
  }
  for (const [id, s] of Object.entries(sheets)) {
    assert.equal(s.id, id);
    assert.ok(categories.some((c) => c.id === s.categoryId));
    assert.ok(s.reviewState in REVIEW_STATES);
  }
  assert.equal(SHEET_TABS.length, 4);
});

test('dados: conteúdo demonstrativo identificado e sem referências ou valores técnicos inventados', () => {
  for (const s of Object.values(sheets)) {
    assert.equal(s.reviewState, 'demo', 'ficha deve permanecer demonstrativa');
    assert.match(s.version, /demo/);
    for (const r of s.references) assert.equal(r.status, 'pending', r.label);
    const strings = [];
    (function walk(v) { if (typeof v === 'string') strings.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })(s);
    const text = strings.filter((x) => x !== s.code && x !== s.version && x !== s.readingTime && !s.review.history.some((hh) => hh.version === x)).join('\n');
    assert.doesNotMatch(text, /\b(ISO|DIN|ABNT|NBR|ASME|ANSI|JIS)\s*[-\d]/, 'não citar normas');
    assert.doesNotMatch(text, /\d\s*(mm|µm|um|°C|ºC|N\b|kgf|in\b)|\d+[.,]\d+/, 'não citar valores com unidade');
  }
});

test('regra de homologação: só "validated" com todas as referências vinculadas', () => {
  const base = sheets[SHEET];
  assert.equal(isHomologated(base), false, 'ficha demonstrativa');
  for (const reviewState of ['demo', 'draft', 'review', 'xyz', undefined, '__proto__']) assert.equal(isHomologated({ ...base, reviewState }), false, String(reviewState));
  assert.equal(isHomologated({ ...base, reviewState: 'validated' }), false, 'validada com referências pendentes');
  assert.equal(isHomologated({ ...base, reviewState: 'validated', references: [] }), false, 'validada sem referências');
  assert.equal(isHomologated({ ...base, reviewState: 'validated', references: [{ status: 'linked' }, { status: 'pending' }] }), false);
  assert.equal(isHomologated({ ...base, reviewState: 'validated', references: [{ status: 'linked' }] }), true);
  for (const v of [null, undefined, {}, 'x']) assert.equal(isHomologated(v), false);
  for (const s of Object.values(sheets)) assert.equal(isHomologated(s), false, 'nenhuma ficha atual é homologada');
});
