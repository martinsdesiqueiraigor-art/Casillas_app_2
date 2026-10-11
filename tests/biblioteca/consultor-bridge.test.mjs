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