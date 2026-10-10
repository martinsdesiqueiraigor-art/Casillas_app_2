// conicpad.js (module) — UI do módulo Conicidades Padrão (Morse, Jarno, B&S)

import { CONICIDADES } from '../data/conicidades.js';
import { formatNumber, createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

let currentGrupo = 'morse';

function resultRow(label, value, primary = false) {
  return createElementSafe('div', { class: primary ? 'result-row result-row--primary' : 'result-row' }, [
    createElementSafe('span', { class: 'result-label', text: label }),
    createElementSafe('span', { class: 'result-value', text: value })
  ]);
}

function renderTabela(itens) {
  const wrap = createElementSafe('div', { class: 'table-wrap' });
  const table = createElementSafe('table', { class: 'data-table' });
  const thead = createElementSafe('thead');
  const trh = createElementSafe('tr');
  ['Nome', 'd (mm)', 'D (mm)', 'L (mm)', 'Relação'].forEach((h) => {
    trh.appendChild(createElementSafe('th', { text: h }));
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = createElementSafe('tbody');
  itens.forEach((c) => {
    const tr = createElementSafe('tr');
    tr.appendChild(createElementSafe('td', { text: c.nome }));
    tr.appendChild(createElementSafe('td', { text: formatNumber(c.d, 3) }));
    tr.appendChild(createElementSafe('td', { text: formatNumber(c.D, 3) }));
    tr.appendChild(createElementSafe('td', { text: formatNumber(c.L, 1) }));
    tr.appendChild(createElementSafe('td', { text: c.relacao }));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Conicidades Padrão', '🎯');

  const card = createElementSafe('div', { class: 'card' });
  card.appendChild(createElementSafe('h2', { class: 'card-title', text: '🎯 Conicidades Padrão' }));

  // Tabs
  const tabs = createElementSafe('div', { class: 'rosca-tabs' });
  const tabList = [
    { key: 'morse', label: 'Morse' },
    { key: 'jarno', label: 'Jarno' },
    { key: 'bs',    label: 'Brown & Sharpe' }
  ];
  tabList.forEach((t) => {
    const btn = createElementSafe('button', {
      type: 'button',
      class: 'rosca-tab' + (currentGrupo === t.key ? ' active' : ''),
      text: t.label,
      onclick: (ev) => {
        currentGrupo = t.key;
        ev.target.parentElement.querySelectorAll('.rosca-tab').forEach((b) => b.classList.remove('active'));
        ev.target.classList.add('active');
        renderLista();
      }
    });
    tabs.appendChild(btn);
  });
  card.appendChild(tabs);

  // Seleção da conicidade
  const selectWrap = createElementSafe('div', { class: 'input-group' }, [
    createElementSafe('label', { for: 'conic-sel', text: 'Selecione a conicidade' })
  ]);
  const sel = createElementSafe('select', { id: 'conic-sel', class: 'input' });
  selectWrap.appendChild(sel);
  card.appendChild(selectWrap);

  // Tabela
  const listaWrap = createElementSafe('div');
  card.appendChild(listaWrap);

  // Resultados
  const resultWrap = createElementSafe('div');
  card.appendChild(resultWrap);

  container.appendChild(card);

  function renderLista() {
    const itens = CONICIDADES[currentGrupo] || [];

    // Popula select
    while (sel.firstChild) sel.removeChild(sel.firstChild);
    itens.forEach((c) => {
      sel.appendChild(createElementSafe('option', { value: c.nome, text: c.nome }));
    });

    // Preenche tabela
    while (listaWrap.firstChild) listaWrap.removeChild(listaWrap.firstChild);
    listaWrap.appendChild(renderTabela(itens));

    // Ao mudar seleção, mostra detalhes
    sel.onchange = () => mostrarDetalhe(sel.value);
    mostrarDetalhe(sel.value);
  }

  function mostrarDetalhe(nome) {
    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);
    const itens = CONICIDADES[currentGrupo] || [];
    const item = itens.find((c) => c.nome === nome);
    if (!item) return;

    resultWrap.appendChild(createElementSafe('h3',
      { class: 'card-title', text: item.nome, style: { marginTop: '12px' } }));
    resultWrap.appendChild(resultRow('Diâmetro menor d', formatNumber(item.d, 4) + ' mm'));
    resultWrap.appendChild(resultRow('Diâmetro maior D', formatNumber(item.D, 4) + ' mm'));
    resultWrap.appendChild(resultRow('Comprimento L', formatNumber(item.L, 3) + ' mm'));
    resultWrap.appendChild(resultRow('Relação de conicidade', item.relacao, true));
    const dif = item.D - item.d;
    resultWrap.appendChild(resultRow('Diferença (D - d)', formatNumber(dif, 4) + ' mm'));

    updateKPIs([
      { label: 'd', value: formatNumber(item.d, 2) + 'mm' },
      { label: 'D', value: formatNumber(item.D, 2) + 'mm' },
      { label: 'L', value: formatNumber(item.L, 1) + 'mm' }
    ]);
  }

  renderLista();
  showToast('Conicidades padrão carregadas', 'info');
}
