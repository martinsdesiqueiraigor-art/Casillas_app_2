// @ts-check
// Banco canonico carregado de JSON, compartilhado pelo Guia e Consultor.
import { deepFreeze } from './deepFreeze.js';
import { validateBank } from './adapter.js';
const url = new URL('../../../dados/ciclos-cnc.json', import.meta.url);
async function carregar() {
  if (typeof process !== 'undefined' && !!process.versions?.node) {
    const { readFile } = await import('node:fs/promises');
    return JSON.parse(await readFile(url, 'utf8'));
  }
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error('Falha ao carregar banco CNC: ' + resposta.status);
  return resposta.json();
}
const dados = await carregar();
if (dados.schema_version !== 1) throw new Error('Versao de banco CNC nao suportada');
validateBank(dados.ciclos);
/** @type {import('./types.js').Cycle[]} */
export const bancoCiclosCNC = deepFreeze(dados.ciclos);
