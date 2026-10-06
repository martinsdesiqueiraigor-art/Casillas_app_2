// @ts-check
// guia.js (module) — UI do módulo Guia de Programação CNC
// Consulta rápida de códigos e ciclos (Siemens e Fanuc)
// Conteúdo local canônico, migrado estruturalmente de dados/guia_cnc.json.

import { bancoCiclosCNC } from './guia/bancoCiclosCNC.js';
import { toLegacy } from './guia/adapter.js';
import { GuiaManager } from './guia/GuiaManager.js';
import { renderCycle } from './guia/renderers/blocks.js';
import { parseRoute } from '../core/router.js';
import { createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

// ═══════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════
let dadosCache = null;
let filtroTexto = '';
let filtroMaquina = '';
let filtroComando = '';
let debounceTimer = null;

// ═══════════════════════════════════════════════════════════
// CARREGAR DADOS
// ═══════════════════════════════════════════════════════════
async function carregarDados() {
  if (!dadosCache) dadosCache = { versao: '2.0', itens: bancoCiclosCNC.map(toLegacy) };
  return dadosCache;
}

// ═══════════════════════════════════════════════════════════
// FILTRAR
// ═══════════════════════════════════════════════════════════
function filtrarItens(itens) {
  const texto = filtroTexto.trim().toLowerCase();

  return itens.filter((item) => {
    // Filtro de máquina
    if (filtroMaquina && item.maquina !== filtroMaquina) return false;

    // Filtro de comando
    if (filtroComando && item.comando !== filtroComando) return false;

    // Filtro de texto (busca em código, título, categoria, tags)
    if (texto) {
      const campos = [
        item.codigo || '',
        item.titulo || '',
        item.categoria || '',
        item.comando || '',
        item.maquina || '',
        ...(item.tags || [])
      ].join(' ').toLowerCase();

      if (!campos.includes(texto)) return false;
    }

    return true;
  });
}

// ═══════════════════════════════════════════════════════════
// RENDER — CARD
// ═══════════════════════════════════════════════════════════
function renderCard(item) {
  const card = createElementSafe('div', { class: 'guia-card' });

  // Header: badges
  const header = createElementSafe('div', { class: 'guia-card-header' }, [
    createElementSafe('span', {
      class: `guia-badge guia-badge-${item.comando.toLowerCase()}`,
      text: item.comando
    }),
    createElementSafe('span', { class: 'guia-badge guia-badge-maquina', text: item.maquina }),
    createElementSafe('span', { class: 'guia-badge guia-badge-categoria', text: item.categoria })
  ]);
  card.appendChild(header);

  // Título
  const titulo = createElementSafe('h3', { class: 'guia-card-titulo' });
  titulo.appendChild(createElementSafe('span', { class: 'guia-card-codigo', text: item.codigo }));
  titulo.appendChild(document.createTextNode(' — ' + item.titulo));
  card.appendChild(titulo);

  // Sintaxe sempre visível para consulta rápida
  card.appendChild(createElementSafe('div', { class: 'guia-label', text: 'Sintaxe' }));
  const sintaxe = createElementSafe('pre', { class: 'guia-code guia-code-resumo' });
  sintaxe.textContent = item.sintaxe || '';
  card.appendChild(sintaxe);

  // Detalhes ficam recolhidos por padrão para reduzir rolagem no celular
  const detalhesId = `guia-detalhes-${item.id}`;
  const detalhes = createElementSafe('div', {
    id: detalhesId,
    class: 'guia-detalhes hidden'
  });

  if (item.parametros && item.parametros.length > 0) {
    detalhes.appendChild(createElementSafe('div', { class: 'guia-label', text: 'Parâmetros principais' }));
    const params = createElementSafe('ul', { class: 'guia-params' });
    item.parametros.forEach((p) => {
      const li = createElementSafe('li', {});
      li.appendChild(createElementSafe('span', { class: 'guia-param-nome', text: p.nome }));
      li.appendChild(createElementSafe('span', { class: 'guia-param-desc', text: ' — ' + p.desc }));
      params.appendChild(li);
    });
    detalhes.appendChild(params);
  }

  if (item.exemplo) {
    detalhes.appendChild(createElementSafe('div', { class: 'guia-label', text: 'Exemplo prático' }));
    const exemplo = createElementSafe('pre', { class: 'guia-code guia-code-exemplo' });
    exemplo.textContent = item.exemplo;
    detalhes.appendChild(exemplo);
  }
  card.appendChild(detalhes);

  const acoes = createElementSafe('div', { class: 'guia-card-acoes' });
  const btnDetalhes = createElementSafe('button', {
    type: 'button',
    class: 'guia-btn-detalhes',
    text: 'Ver detalhes',
    'aria-expanded': 'false',
    'aria-controls': detalhesId,
    onclick: () => {
      const expandido = btnDetalhes.getAttribute('aria-expanded') === 'true';
      detalhes.classList.toggle('hidden', expandido);
      btnDetalhes.setAttribute('aria-expanded', String(!expandido));
      btnDetalhes.textContent = expandido ? 'Ver detalhes' : 'Recolher';
    }
  });
  acoes.appendChild(btnDetalhes);

  const btnCopiar = createElementSafe('button', {
    type: 'button',
    class: 'guia-btn-copiar',
    text: '📋 Copiar',
    onclick: async () => {
      try {
        const texto = `${item.codigo} — ${item.titulo}\n\n${item.sintaxe}\n\nExemplo:\n${item.exemplo || ''}`;
        await navigator.clipboard.writeText(texto);
        showToast('Código copiado!', 'success');
      } catch {
        showToast('Não foi possível copiar', 'error');
      }
    }
  });
  acoes.appendChild(btnCopiar);
  card.appendChild(acoes);

  return card;
}

// ═══════════════════════════════════════════════════════════
// RENDER — LISTA DE RESULTADOS
// ═══════════════════════════════════════════════════════════
function renderResultados(container, itens) {
  // Limpa
  while (container.firstChild) container.removeChild(container.firstChild);

  if (itens.length === 0) {
    // Mensagem "nenhum resultado"
    const vazio = createElementSafe('div', {
      class: 'guia-vazio',
      role: 'status',
      'aria-live': 'polite'
    });
    vazio.appendChild(createElementSafe('div', { class: 'guia-vazio-icon', text: '😕' }));
    vazio.appendChild(createElementSafe('h3', { text: 'Nenhum resultado encontrado' }));
    vazio.appendChild(createElementSafe('p', {
      text: 'Tente outra palavra-chave, ou fale conosco para tirar dúvidas sobre programação CNC.'
    }));

    const btns = createElementSafe('div', { class: 'guia-vazio-btns' });
    btns.appendChild(createElementSafe('button', {
      type: 'button',
      class: 'btn btn-primary',
      text: '💬 Falar no WhatsApp',
      onclick: () => {
        const msg = encodeURIComponent('Olá! Preciso de ajuda com programação CNC.');
        window.open(`https://wa.me/5519996816755?text=${msg}`, '_blank');
      }
    }));
    btns.appendChild(createElementSafe('button', {
      type: 'button',
      class: 'btn btn-outline',
      text: '🗑️ Limpar filtros',
      onclick: () => {
        filtroTexto = '';
        filtroMaquina = '';
        filtroComando = '';
        const input = /** @type {HTMLInputElement|null} */ (document.getElementById('guia-busca'));
        const selMaq = /** @type {HTMLSelectElement|null} */ (document.getElementById('guia-maquina'));
        const selCmd = /** @type {HTMLSelectElement|null} */ (document.getElementById('guia-comando'));
        if (input) input.value = '';
        if (selMaq) selMaq.value = '';
        if (selCmd) selCmd.value = '';
        // Recarrega
        aplicarFiltro(container);
      }
    }));
    vazio.appendChild(btns);
    container.appendChild(vazio);
    return;
  }

  // Renderiza cada card
  itens.forEach((item) => {
    container.appendChild(renderCard(item));
  });
}

// ═══════════════════════════════════════════════════════════
// APLICAR FILTRO
// ═══════════════════════════════════════════════════════════
async function aplicarFiltro(containerResultados) {
  const dados = await carregarDados();
  const itens = filtrarItens(dados.itens || []);
  renderResultados(containerResultados, itens);

  // Atualiza contador
  const contador = document.getElementById('guia-contador');
  if (contador) {
    contador.textContent = `${itens.length} de ${dados.itens.length} ciclos`;
  }

  // Atualiza KPIs
  updateKPIs([
    { label: 'Resultados', value: String(itens.length) },
    { label: 'Total', value: String(dados.itens.length) },
    { label: 'Guia', value: dados.versao || '1.0' }
  ]);
}

// ═══════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ═══════════════════════════════════════════════════════════
/** @param {HTMLElement} container */
export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Guia de Programação', '📖');

  const manager = new GuiaManager();
  const hash = window.location.hash;
  if (hash.startsWith('#/guia/')) {
    const target = manager.resolveTarget(parseRoute(hash));
    if (target) {
      const cycle = manager.lookup(target.cycleId);
      if (cycle) renderCycle(container, cycle, target);
      const back = document.createElement('button');
      back.type = 'button'; back.className = 'btn btn-outline'; back.textContent = 'Voltar à lista';
      back.addEventListener('click', () => { window.location.hash = '#/guia'; });
      container.append(back);
      return;
    }
    showToast('Destino do Guia inválido. Exibindo a lista local.', 'warning');
    window.history.replaceState(null, '', '#/guia');
  }

  // ─── Cabeçalho ───
  const card = createElementSafe('div', { class: 'card' });

  const header = createElementSafe('div', { class: 'guia-header' });
  header.appendChild(createElementSafe('h2', {
    class: 'guia-titulo',
    text: '📖 Guia de Programação CNC'
  }));
  header.appendChild(createElementSafe('p', {
    class: 'guia-subtitulo',
    text: 'Manual de consulta rápida de códigos e ciclos'
  }));
  card.appendChild(header);

  // ─── Filtros ───
  const filtros = createElementSafe('div', { class: 'guia-filtros' });

  // Busca
  const buscaGroup = createElementSafe('div', { class: 'guia-filtro-group guia-filtro-busca' });
  buscaGroup.appendChild(createElementSafe('label', { for: 'guia-busca', text: '🔍 Buscar' }));
  const inputBusca = createElementSafe('input', {
    type: 'text',
    id: 'guia-busca',
    class: 'input',
    placeholder: 'Ex: G76, CYCLE97, Rosca...',
    autocomplete: 'off',
    spellcheck: 'false',
    'data-native-keyboard': '1'
  });
  inputBusca.addEventListener('input', (ev) => {
    filtroTexto = inputBusca.value;
    // Debounce de 200ms
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      aplicarFiltro(containerResultados);
    }, 200);
  });
  buscaGroup.appendChild(inputBusca);
  filtros.appendChild(buscaGroup);

  // Força o inputmode correto (o keyboard.js pode ter aplicado 'none')
  setTimeout(() => {
    const el = document.getElementById('guia-busca');
    if (el) {
      el.setAttribute('inputmode', 'text');
      el.removeAttribute('data-kbd-bound');
      el.dataset.nativeKeyboard = '1';
    }
  }, 200);

  // Select Máquina
  const maqGroup = createElementSafe('div', { class: 'guia-filtro-group' });
  maqGroup.appendChild(createElementSafe('label', { for: 'guia-maquina', text: '🏭 Máquina' }));
  const selMaq = createElementSafe('select', { id: 'guia-maquina', class: 'input' });
  ['Todas', 'Torno', 'Centro de Usinagem'].forEach((opt) => {
    const value = opt === 'Todas' ? '' : opt;
    selMaq.appendChild(createElementSafe('option', { value, text: opt }));
  });
  selMaq.addEventListener('change', (ev) => {
    filtroMaquina = selMaq.value;
    aplicarFiltro(containerResultados);
  });
  maqGroup.appendChild(selMaq);
  filtros.appendChild(maqGroup);

  // Select Comando
  const cmdGroup = createElementSafe('div', { class: 'guia-filtro-group' });
  cmdGroup.appendChild(createElementSafe('label', { for: 'guia-comando', text: '⚙️ Comando' }));
  const selCmd = createElementSafe('select', { id: 'guia-comando', class: 'input' });
  ['Todos', 'Siemens', 'Fanuc'].forEach((opt) => {
    const value = opt === 'Todos' ? '' : opt;
    selCmd.appendChild(createElementSafe('option', { value, text: opt }));
  });
  selCmd.addEventListener('change', (ev) => {
    filtroComando = selCmd.value;
    aplicarFiltro(containerResultados);
  });
  cmdGroup.appendChild(selCmd);
  filtros.appendChild(cmdGroup);

  card.appendChild(filtros);

  // ─── Contador ───
  const contador = createElementSafe('div', { class: 'guia-contador-wrap' });
  contador.appendChild(createElementSafe('span', {
    id: 'guia-contador',
    class: 'guia-contador',
    role: 'status',
    'aria-live': 'polite',
    text: 'Carregando...'
  }));
  card.appendChild(contador);

  container.appendChild(card);

  // ─── Container de Resultados ───
  const containerResultados = createElementSafe('div', { class: 'guia-resultados' });
  container.appendChild(containerResultados);

  // ─── Carrega dados iniciais ───
  aplicarFiltro(containerResultados);

  // ─── NÃO vincula o container inteiro ao teclado customizado ───
  // O Guia só tem filtros de texto/select — o teclado nativo é melhor.
  // Se um dia houver inputs numéricos, vincular individualmente.
}
