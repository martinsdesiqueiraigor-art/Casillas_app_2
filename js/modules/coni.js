// coni.js (module) — UI do módulo Conicidade

import {
  calcularPorDdL,
  calcularPorDAlphaL,
  calcularPorDdAlpha
} from '../calc/coni.js';
import { formatNumber, parseInput, createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

let currentMode = 'DdL';

function resultRow(label, value, primary = false) {
  return createElementSafe('div', { class: primary ? 'result-row result-row--primary' : 'result-row' }, [
    createElementSafe('span', { class: 'result-label', text: label }),
    createElementSafe('span', { class: 'result-value', text: value })
  ]);
}

function inputGroup(label, id) {
  const group = createElementSafe('div', { class: 'input-group' }, [
    createElementSafe('label', { for: id, text: label })
  ]);
  const wrap = createElementSafe('div', { class: 'input-with-clear' }, [
    createElementSafe('input', {
      id, class: 'input', type: 'text', inputmode: 'decimal',
      placeholder: '0', autocomplete: 'off', spellcheck: 'false'
    }),
    createElementSafe('button', {
      type: 'button', class: 'clear-btn', 'aria-label': 'Limpar', text: '✕',
      onclick: () => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }
      }
    })
  ]);
  group.appendChild(wrap);
  return group;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? parseInput(el.value) : NaN;
}

function renderResults(res) {
  const wrap = createElementSafe('div');
  if (!res) {
    wrap.appendChild(createElementSafe('p', { class: 'result-hint', text: 'Preencha os campos e calcule.' }));
    return wrap;
  }
  wrap.appendChild(resultRow('Diâmetro maior D', formatNumber(res.D, 4) + ' mm'));
  wrap.appendChild(resultRow('Diâmetro menor d', formatNumber(res.d, 4) + ' mm'));
  wrap.appendChild(resultRow('Comprimento L', formatNumber(res.L, 4) + ' mm'));
  wrap.appendChild(resultRow('Ângulo total α', formatNumber(res.anguloGraus, 4) + '°', true));
  wrap.appendChild(resultRow('Ângulo ½α', formatNumber(res.anguloMeioGraus, 4) + '°'));
  wrap.appendChild(resultRow('Conicidade C', formatNumber(res.conicidade, 6)));
  wrap.appendChild(resultRow('Relação', '1 : ' + formatNumber(res.relacao1ParaX, 4), true));
  wrap.appendChild(resultRow('Inclinação (D-d)/2', formatNumber(res.inclinacao, 4) + ' mm'));
  return wrap;
}

export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Conicidade', '📏');

  const card = createElementSafe('div', { class: 'card' });
  card.appendChild(createElementSafe('h2', { class: 'card-title', text: '📏 Conicidade' }));

  const modesWrap = createElementSafe('div', { class: 'rosca-tabs' });
  const modes = [
    { key: 'DdL',     label: 'D, d, L → α' },
    { key: 'DAlphaL', label: 'd, α, L → D' },
    { key: 'DdAlpha', label: 'D, d, α → L' }
  ];
  modes.forEach((m) => {
    const btn = createElementSafe('button', {
      type: 'button',
      class: 'rosca-tab' + (currentMode === m.key ? ' active' : ''),
      text: m.label,
      onclick: (ev) => {
        currentMode = m.key;
        ev.target.parentElement.querySelectorAll('.rosca-tab').forEach((t) => t.classList.remove('active'));
        ev.target.classList.add('active');
        renderFields();
      }
    });
    modesWrap.appendChild(btn);
  });
  card.appendChild(modesWrap);

  const fieldsWrap = createElementSafe('div');
  card.appendChild(fieldsWrap);

  card.appendChild(createElementSafe('button', {
    type: 'button', class: 'btn btn-primary', text: 'Calcular',
    onclick: calcular
  }));

  const resultWrap = createElementSafe('div');
  resultWrap.appendChild(renderResults(null));
  card.appendChild(resultWrap);

  container.appendChild(card);

  function renderFields() {
    while (fieldsWrap.firstChild) fieldsWrap.removeChild(fieldsWrap.firstChild);
    if (currentMode === 'DdL') {
      fieldsWrap.appendChild(inputGroup('Diâmetro maior D (mm)', 'coni-D'));
      fieldsWrap.appendChild(inputGroup('Diâmetro menor d (mm)', 'coni-d'));
      fieldsWrap.appendChild(inputGroup('Comprimento L (mm)', 'coni-L'));
    } else if (currentMode === 'DAlphaL') {
      fieldsWrap.appendChild(inputGroup('Diâmetro menor d (mm)', 'coni-d'));
      fieldsWrap.appendChild(inputGroup('Ângulo α (°)', 'coni-a'));
      fieldsWrap.appendChild(inputGroup('Comprimento L (mm)', 'coni-L'));
    } else if (currentMode === 'DdAlpha') {
      fieldsWrap.appendChild(inputGroup('Diâmetro maior D (mm)', 'coni-D'));
      fieldsWrap.appendChild(inputGroup('Diâmetro menor d (mm)', 'coni-d'));
      fieldsWrap.appendChild(inputGroup('Ângulo α (°)', 'coni-a'));
    }
  }

  function calcular() {
    let res = null;
    if (currentMode === 'DdL') {
      const D = getVal('coni-D'), d = getVal('coni-d'), L = getVal('coni-L');
      if (![D, d, L].every(Number.isFinite)) { showToast('Preencha D, d e L', 'warning'); return; }
      res = calcularPorDdL(D, d, L);
    } else if (currentMode === 'DAlphaL') {
      const d = getVal('coni-d'), a = getVal('coni-a'), L = getVal('coni-L');
      if (![d, a, L].every(Number.isFinite)) { showToast('Preencha d, α e L', 'warning'); return; }
      res = calcularPorDAlphaL(d, a, L);
    } else {
      const D = getVal('coni-D'), d = getVal('coni-d'), a = getVal('coni-a');
      if (![D, d, a].every(Number.isFinite)) { showToast('Preencha D, d e α', 'warning'); return; }
      res = calcularPorDdAlpha(D, d, a);
    }

    if (!res) { showToast('Dados inválidos (D deve ser maior que d)', 'error'); return; }

    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);
    resultWrap.appendChild(renderResults(res));

    updateKPIs([
      { label: 'α',        value: formatNumber(res.anguloGraus, 3) + '°' },
      { label: 'C',        value: formatNumber(res.conicidade, 5) },
      { label: 'Relação',  value: '1:' + formatNumber(res.relacao1ParaX, 2) }
    ]);
    showToast('Conicidade calculada', 'success');
  }

  renderFields();
  updateKPIs([
    { label: 'α', value: '—' },
    { label: 'C', value: '—' },
    { label: 'Relação', value: '—' }
  ]);
}
