// quiz.js — Motor de exercícios da área Aprender (funções puras, sem DOM).
// CAS22-BIB-APRENDER-PILOTO-01 · testável em Node, sem rede nem armazenamento.
//
// O estado é um objeto simples; cada função devolve um novo estado.

/** @typedef {{id:string,tipo:'multipla'|'ordenar',opcoes?:{id:string}[],correta?:string,itens?:{id:string}[],ordem?:string[],explicacao:string}} Questao */
/** @typedef {{questoes:Questao[], indice:number, respostas:Record<string,{resposta:any,correta:boolean}>}} EstadoQuiz */

/**
 * @param {Questao[]} questoes
 * @param {{apenas?: string[]}} [opcoes] apenas = ids das questões a incluir (para "revisar só os erros")
 * @returns {EstadoQuiz}
 */
export function iniciarQuiz(questoes, opcoes = {}) {
  const lista = Array.isArray(opcoes.apenas) ? questoes.filter((q) => opcoes.apenas.includes(q.id)) : questoes.slice();
  return { questoes: lista, indice: 0, respostas: {} };
}

/** Confere uma resposta sem alterar o estado. */
export function conferir(questao, resposta) {
  if (!questao) return false;
  if (questao.tipo === 'multipla') return typeof resposta === 'string' && resposta === questao.correta;
  if (questao.tipo === 'ordenar') {
    return Array.isArray(resposta) && Array.isArray(questao.ordem)
      && resposta.length === questao.ordem.length
      && resposta.every((id, i) => id === questao.ordem[i]);
  }
  return false;
}

/**
 * Registra a resposta da questão atual. Uma questão respondida não muda mais
 * (para refazer, inicie o quiz de novo).
 * @param {EstadoQuiz} estado
 */
export function responder(estado, resposta) {
  const q = estado.questoes[estado.indice];
  if (!q || estado.respostas[q.id]) return estado;
  const correta = conferir(q, resposta);
  return { ...estado, respostas: { ...estado.respostas, [q.id]: { resposta, correta } } };
}

/** @param {EstadoQuiz} estado */
export function avancar(estado) {
  return { ...estado, indice: Math.min(estado.indice + 1, estado.questoes.length) };
}

/** @param {EstadoQuiz} estado */
export function terminou(estado) {
  return estado.indice >= estado.questoes.length;
}

/** @param {EstadoQuiz} estado */
export function resultado(estado) {
  const total = estado.questoes.length;
  const acertos = estado.questoes.filter((q) => estado.respostas[q.id]?.correta).length;
  const erros = estado.questoes.filter((q) => estado.respostas[q.id] && !estado.respostas[q.id].correta).map((q) => q.id);
  return { total, acertos, erros };
}

/** Move um item de uma lista de ordenação (para botões subir/descer). */
export function mover(lista, indice, delta) {
  const destino = indice + delta;
  if (indice < 0 || indice >= lista.length || destino < 0 || destino >= lista.length) return lista.slice();
  const copia = lista.slice();
  const [item] = copia.splice(indice, 1);
  copia.splice(destino, 0, item);
  return copia;
}

/** Validação dos dados de um quiz. Retorna a lista de problemas (vazia = ok). */
export function validarQuiz(quiz) {
  const problemas = [];
  const ids = new Set();
  for (const q of quiz?.questoes || []) {
    if (!q.id || ids.has(q.id)) problemas.push(`id inválido ou repetido: ${q.id}`);
    ids.add(q.id);
    if (!q.explicacao) problemas.push(`${q.id}: sem explicação`);
    if (!q.referencia?.texto) problemas.push(`${q.id}: sem referência`);
    if (!q.reviewState) problemas.push(`${q.id}: sem estado de revisão`);
    if (q.tipo === 'multipla' && !(q.opcoes || []).some((o) => o.id === q.correta)) problemas.push(`${q.id}: resposta correta não está nas opções`);
    if (q.tipo === 'ordenar') {
      const itens = (q.itens || []).map((i) => i.id).sort().join();
      if (itens !== (q.ordem || []).slice().sort().join()) problemas.push(`${q.id}: ordem não corresponde aos itens`);
    }
    if (!['multipla', 'ordenar'].includes(q.tipo)) problemas.push(`${q.id}: tipo desconhecido`);
  }
  return problemas;
}
