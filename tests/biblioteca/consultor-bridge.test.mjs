import test from 'node:test';
import assert from 'node:assert/strict';
import { findBibliotecaReferences } from '../../js/modules/biblioteca/consultorBridge.js';

test('consulta vazia nao retorna referencias', () => {
  assert.deepEqual(findBibliotecaReferences(''), []);
});
test('consulta local retorna apenas fichas com rota navegavel e estado', () => {
  const found = findBibliotecaReferences('Micrômetro');
  assert.ok(found.length > 0);
  for (const item of found) {
    assert.equal(item.route.name, 'ficha');
    assert.match(item.hash, /^#\/biblioteca\/ficha\//);
    assert.equal(typeof item.homologated, 'boolean');
    assert.equal(typeof item.excerpt, 'string');
    assert.ok(item.excerpt.length > 0);
    assert.equal(item.reviewState, 'demo');
  }
});
test('limite de resultados e consulta sem correspondencia', () => {
  assert.equal(findBibliotecaReferences('micrometro', 0).length, 0);
  assert.deepEqual(findBibliotecaReferences('termo-sem-correspondencia-xy99'), []);
});
test('consultas CNC nao sao desviadas para a Biblioteca', () => {
  for (const q of ['rosca', 'rosca torno fanuc', 'G76', 'G71', 'fanuc', 'torno fanuc', 'FURAÇÃO centro de usinagem SIEMENS', 'profunda', 'fuso roscado CNC']) {
    assert.deepEqual(findBibliotecaReferences(q), [], q);
  }
});
test('metrologia explicita continua acessivel com acentos e caixa variados', () => {
  for (const q of ['Micrômetro', 'MICROMETRO', 'micrometro', 'paralaxe', 'medir com micrômetro no torno']) {
    assert.ok(findBibliotecaReferences(q).some(x => x.route.id === 'micrometro-externo-fundamentos'), q);
  }
});
test('rascunho de Paquimetro nao e exposto pela ponte', () => {
  for (const q of ['paquimetro', 'PAQUÍMETRO', 'profundidade']) {
    assert.ok(findBibliotecaReferences(q).some(x => x.route.id === 'paquimetro-fundamentos'), q);
  }
});

test('assuntos de metrologia planejados sao detectados sem publicar rascunhos', async () => {
  const { findPlannedMetrologyTopic } = await import('../../js/modules/biblioteca/consultorBridge.js');
  assert.equal(findPlannedMetrologyTopic('Paquímetro'), null);
  assert.equal(findPlannedMetrologyTopic('como usar PAQUIMETRO?'), null);
  assert.equal(findPlannedMetrologyTopic('Relógio comparador')?.status, 'planned');
  assert.equal(findPlannedMetrologyTopic('micrometro'), null);
  assert.equal(findPlannedMetrologyTopic('rosca'), null);
  assert.equal(findPlannedMetrologyTopic('G76 Fanuc'), null);
  assert.equal(findPlannedMetrologyTopic('profundidade'), null);
});
