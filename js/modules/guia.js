// @ts-check
// guia.js (module) — Guia CNC: lista com busca e filtros + tela do ciclo.
// Conteúdo local canônico (bancoCiclosCNC) e conteúdo estendido schema_version 2 (rascunho em revisão).

import { bancoCiclosCNC } from './guia/bancoCiclosCNC.js';
import { toLegacy } from './guia/adapter.js';
import { GuiaManager } from './guia/GuiaManager.js';
import { renderCycleView } from './guia/ui/cycleView.js';
import { CONTEUDO_V2 } from './guia/conteudo2.js';
import { h, icon } from './guia/ui/dom.js';
import { parseRoute, encodeRoute } from '../core/router.js';
import { showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

const WHATSAPP_AJUDA = 'https://wa.me/5519996816755?text=' + encodeURIComponent('Olá! Preciso de ajuda com programação CNC.');

let dadosCache = null;

/** Normaliza para busca sem acento e sem caixa. @param {string} texto */
function normalizar(texto) {
  return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

async function carregarDados() {
  if (!dadosCache) dadosCache = { versao: '2.0', itens: bancoCiclosCNC.map(toLegacy) };
  return dadosCache;
}

/** @param {{id:string,comando:string,maquina:string,categoria:string,codigo:string,titulo:string,tags:string[]}[]} itens @param {{texto:string,controle:string,maquina:string,operacao:string}} f */
function filtrar(itens, f) {
  const texto = normalizar(f.texto.trim());
  return itens.filter((item) => {
    if (f.controle && item.comando !== f.controle) return false;
    if (f.maquina && item.maquina !== f.maquina) return false;
    if (f.operacao && item.categoria !== f.operacao) return false;
    if (!texto) return true;
    return normalizar([item.codigo, item.titulo, item.categoria, item.comando, item.maquina, ...(item.tags || [])].join(' ')).includes(texto);
  });
}

/** @param {{id:string,codigo:string,titulo:string,comando:string,maquina:string,categoria:string}} item @returns {HTMLElement} */
function cartao(item) {
  const extra = CONTEUDO_V2.ciclos[item.id];
  return h('button', {
    type: 'button', class: 'gx-card', 'aria-label': `Abrir ${item.codigo} — ${item.titulo}`,
    onclick: () => { window.location.hash = encodeRoute({ cycleId: item.id }); }
  },
    h('span', { class: 'gx-card-main' },
      h('span', { class: 'gx-card-code', text: item.codigo }),
      h('span', { class: 'gx-card-title', text: item.titulo }),
      h('span', { class: 'gx-chips' },
        h('span', { class: `gx-chip gx-chip-${item.comando.toLowerCase()}`, text: item.comando }),
        h('span', { class: 'gx-chip', text: item.maquina }),
        h('span', { class: 'gx-chip', text: item.categoria }),
        extra ? h('span', { class: 'gx-chip gx-chip-rev', text: 'Em revisão técnica' }) : null)),
    h('span', { class: 'gx-go' }, icon('chev', 22)));
}

/** @param {HTMLElement} container */
export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Guia CNC', '📖');

  const manager = new GuiaManager();
  const hash = window.location.hash;

  // ─── Rota de ciclo: #/guia/<id>?tab=…&acc=… ───
  if (hash.startsWith('#/guia/')) {
    const pedido = parseRoute(hash);
    const target = manager.resolveTarget(pedido);
    const cycle = target ? manager.lookup(target.cycleId) : null;
    if (target && cycle) {
      const voltar = h('button', {
        type: 'button', class: 'gx-back',
        onclick: () => { window.location.hash = '#/guia'; }
      }, h('span', { 'aria-hidden': 'true', text: '‹' }), 'Voltar à lista');
      container.append(h('div', { class: 'gx-view' }, voltar));
      renderCycleView(/** @type {HTMLElement} */ (container.firstElementChild), cycle, target, pedido?.tabId || null);
      updateKPIs([
        { label: 'Ciclo', value: cycle.meta.codigo.toUpperCase() },
        { label: 'Controle', value: cycle.meta.controlador === 'fanuc' ? 'Fanuc' : 'Siemens' },
        { label: 'Guia', value: '2.0' }
      ]);
      return;
    }
    showToast('Destino do Guia inválido. Exibindo a lista local.', 'warning');
    window.history.replaceState(null, '', '#/guia');
  }

  // ─── Lista ───
  const filtros = { texto: '', controle: '', maquina: '', operacao: '' };
  const resultados = h('div', { class: 'gx-results' });
  const contador = h('p', { id: 'guia-contador', class: 'gx-count', role: 'status', 'aria-live': 'polite', text: 'Carregando...' });

  const busca = /** @type {HTMLInputElement} */ (h('input', {
    type: 'search', id: 'guia-busca', class: 'input gx-search', placeholder: 'Buscar código ou ciclo',
    'aria-label': 'Buscar no Guia CNC', autocomplete: 'off', spellcheck: 'false', 'data-native-keyboard': '1'
  }));

  /** @param {string} id @param {string} rotulo @param {string[]} opcoes @param {string} vazio @param {(v:string)=>void} aoMudar */
  const seletor = (id, rotulo, opcoes, vazio, aoMudar) => {
    const sel = /** @type {HTMLSelectElement} */ (h('select', { id, class: 'input gx-select', 'aria-label': rotulo },
      h('option', { value: '', text: vazio }), ...opcoes.map((o) => h('option', { value: o, text: o }))));
    sel.addEventListener('change', () => { aoMudar(sel.value); void atualizar(); });
    return sel;
  };

  async function atualizar() {
    const dados = await carregarDados();
    const itens = filtrar(dados.itens, filtros);
    contador.textContent = `${itens.length} de ${dados.itens.length} ciclos`;
    if (!itens.length) {
      resultados.replaceChildren(h('div', { class: 'gx-empty', role: 'status' },
        h('strong', { text: 'Nenhum ciclo encontrado' }),
        h('span', { text: 'Tente outra palavra-chave ou mude os filtros. Se preferir, fale com a gente.' }),
        h('button', { type: 'button', class: 'btn btn-outline', text: 'Limpar filtros', onclick: limpar }),
        h('button', { type: 'button', class: 'btn btn-primary', text: 'Falar no WhatsApp', onclick: () => window.open(WHATSAPP_AJUDA, '_blank', 'noopener') })));
    } else {
      resultados.replaceChildren(...itens.map((it) => cartao(it)));
    }
    updateKPIs([
      { label: 'Resultados', value: String(itens.length) },
      { label: 'Total', value: String(dados.itens.length) },
      { label: 'Guia', value: dados.versao || '2.0' }
    ]);
  }

  const selControle = seletor('guia-comando', 'Controle', ['Fanuc', 'Siemens'], 'Controle', (v) => { filtros.controle = v; });
  const selMaquina = seletor('guia-maquina', 'Máquina', ['Torno', 'Centro de Usinagem'], 'Máquina', (v) => { filtros.maquina = v; });
  const selOperacao = seletor('guia-operacao', 'Operação', ['Rosca', 'Furação'], 'Operação', (v) => { filtros.operacao = v; });

  function limpar() {
    filtros.texto = ''; filtros.controle = ''; filtros.maquina = ''; filtros.operacao = '';
    busca.value = ''; selControle.value = ''; selMaquina.value = ''; selOperacao.value = '';
    void atualizar();
  }

  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let debounce;
  busca.addEventListener('input', () => {
    filtros.texto = busca.value;
    clearTimeout(debounce);
    debounce = setTimeout(() => { void atualizar(); }, 200);
  });

  container.append(h('div', { class: 'gx-view' },
    h('h2', { class: 'gx-title', text: 'Guia CNC' }),
    h('div', { class: 'gx-searchbox' }, icon('search', 22), busca),
    h('div', { class: 'gx-filters' }, selControle, selMaquina, selOperacao),
    contador,
    resultados));

  // O teclado numérico do app pode ter aplicado inputmode="none": a busca usa o teclado nativo.
  setTimeout(() => {
    busca.setAttribute('inputmode', 'text');
    busca.removeAttribute('data-kbd-bound');
  }, 200);

  void atualizar();
}
