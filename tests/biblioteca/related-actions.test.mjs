import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRelatedActions } from '../../js/modules/biblioteca/relatedActions.js';
import { findBibliotecaReferences } from '../../js/modules/biblioteca/consultorBridge.js';

test('nao inventa links para a ficha demonstrativa atual', () => {
  const refs = findBibliotecaReferences('Micrômetro');
  assert.ok(refs.length > 0);
  assert.deepEqual(refs[0].actions, []);
});
test('somente destinos explicitamente verificados sao oferecidos', () => {
  const actions = resolveRelatedActions([
    {kind:'calculator', target:'potencia', label:'Potência de corte', verified:true, evidence:'Vinculo tecnico revisado na ficha'},
    {kind:'guide', target:'guia', label:'Guia CNC', verified:true},
    {kind:'calculator', target:'trig', verified:false},
    {kind:'calculator', target:'nao-existe', verified:true},
    {kind:'guide', target:'http://externo', verified:true},
    {kind:'calculator', target:'potencia', verified:true},
    {kind:'calculator', target:'tol', verified:true, evidence:'   '},
    {kind:'calculator', target:'furos', verified:true, evidence:'Associacao revisada'},
    {kind:'calculator', target:'furos', verified:true, evidence:'Associacao revisada'},
  ]);
  assert.deepEqual(actions, [
    {label:'Potência de corte', hash:'#/modulo/potencia'},
    {label:'Abrir recurso relacionado', hash:'#/modulo/furos'},
  ]);
});
