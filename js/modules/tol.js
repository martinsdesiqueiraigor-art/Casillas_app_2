// tol.js (module) — UI do módulo Tolerâncias ISO 286

import { calcularTolerancia, listarClasses, analisarAjuste } from '../calc/tol.js';
import { formatNumber, parseInput, createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

let currentTab = 'simples';

function resultRow(label, value, primary = false) {
  return createElementSafe('div', { class: primary ? 'result-row result-row--primary' : 'result-row' }, [
    createElementSafe('span', { class: 'result-label', text: label }),
    createElementSafe('span', { class: 'result-value', text: value })
  ]);
}

function inputGroup(label, id) {
  const g = createElementSafe('div', { class: 'input-group' }, [
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
  g.appendChild(wrap);
  return g;
}

function selectGroup(label, id, options) {
  const g = createElementSafe('div', { class: 'input-group' }, [
    createElementSafe('label', { for: id, text: label })
  ]);
  const sel = createElementSafe('select', { id, class: 'input' });
  options.forEach((o) => sel.appendChild(createElementSafe('option', { value: o.value, text: o.label })));
  g.appendChild(sel);
  return g;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? parseInput(el.value) : NaN;
}

export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Tolerâncias ISO', '📊');

  const classes = listarClasses();

  const card = createElementSafe('div', { class: 'card' });
  card.appendChild(createElementSafe('h2', { class: 'card-title', text: 'Tolerâncias ISO 286' }));

  const tabs = createElementSafe('div', { class: 'rosca-tabs' });
  const tabList = [
    { key: 'simples', label: 'Tolerância' },
    { key: 'ajuste',  label: 'Ajuste' }
  ];
  tabList.forEach((t) => {
    const btn = createElementSafe('button', {
      type: 'button',
      class: 'rosca-tab' + (currentTab === t.key ? ' active' : ''),
      text: t.label,
      onclick: (ev) => {
        currentTab = t.key;
        ev.target.parentElement.querySelectorAll('.rosca-tab').forEach((b) => b.classList.remove('active'));
        ev.target.classList.add('active');
        renderFields();
      }
    });
    tabs.appendChild(btn);
  });
  card.appendChild(tabs);

  const fieldsWrap = createElementSafe('div');
  card.appendChild(fieldsWrap);

  card.appendChild(createElementSafe('button', {
    type: 'button', class: 'btn btn-primary', text: 'Calcular',
    onclick: calcular
  }));

  const resultWrap = createElementSafe('div');
  card.appendChild(resultWrap);

  container.appendChild(card);

  function renderFields() {
    while (fieldsWrap.firstChild) fieldsWrap.removeChild(fieldsWrap.firstChild);

    if (currentTab === 'simples') {
      fieldsWrap.appendChild(inputGroup('Dimensão nominal (mm)', 'tol-nom'));
      fieldsWrap.appendChild(selectGroup('Classe',
        'tol-classe',
        classes.map((c) => ({ value: c.key, label: c.label }))));
    } else {
      fieldsWrap.appendChild(inputGroup('Dimensão nominal (mm)', 'tol-nom'));
      const furos = classes.filter((c) => c.tipo === 'furo');
      const eixos = classes.filter((c) => c.tipo === 'eixo');
      fieldsWrap.appendChild(selectGroup('Furo',
        'tol-furo',
        furos.map((c) => ({ value: c.key, label: c.label }))));
      fieldsWrap.appendChild(selectGroup('Eixo',
        'tol-eixo',
        eixos.map((c) => ({ value: c.key, label: c.label }))));
    }
  }

  function calcular() {
    const nom = getVal('tol-nom');
    if (!Number.isFinite(nom) || nom <= 0) { showToast('Dimensão nominal inválida', 'warning'); return; }

    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);

    if (currentTab === 'simples') {
      const sel = fieldsWrap.querySelector('#tol-classe');
      if (!sel) return;
      const res = calcularTolerancia(nom, '', sel.value);
      if (!res) { showToast('Classe não suportada para esta faixa', 'error'); return; }
      resultWrap.appendChild(resultRow('Classe', res.classe));
      resultWrap.appendChild(resultRow('Descrição', res.descricao));
      resultWrap.appendChild(resultRow('Nominal', formatNumber(res.nominal, 4) + ' mm'));
      resultWrap.appendChild(resultRow('Af. inferior (ei)', formatNumber(res.ei, 2) + ' µm'));
      resultWrap.appendChild(resultRow('Af. superior (es)', formatNumber(res.es, 2) + ' µm'));
      resultWrap.appendChild(resultRow('Mínimo', formatNumber(res.minimo, 4) + ' mm'));
      resultWrap.appendChild(resultRow('Máximo', formatNumber(res.maximo, 4) + ' mm'));
      resultWrap.appendChild(resultRow('Tolerância', formatNumber(res.tolerancia, 4) + ' mm', true));
      resultWrap.appendChild(resultRow('Tolerância (µm)', formatNumber(res.toleranciaUm, 2)));

      updateKPIs([
        { label: 'Mín', value: formatNumber(res.minimo, 3) },
        { label: 'Máx', value: formatNumber(res.maximo, 3) },
        { label: 'Tol', value: formatNumber(res.toleranciaUm, 0) + 'µm' }
      ]);
    } else {
      const selF = fieldsWrap.querySelector('#tol-furo');
      const selE = fieldsWrap.querySelector('#tol-eixo');
      if (!selF || !selE) return;
      const res = analisarAjuste(nom, selF.value, selE.value);
      if (!res) { showToast('Ajuste não suportado', 'error'); return; }
      resultWrap.appendChild(resultRow('Furo', res.furo.classe));
      resultWrap.appendChild(resultRow('  Mín / Máx (mm)',
        formatNumber(res.furo.minimo, 4) + ' / ' + formatNumber(res.furo.maximo, 4)));
      resultWrap.appendChild(resultRow('Eixo', res.eixo.classe));
      resultWrap.appendChild(resultRow('  Mín / Máx (mm)',
        formatNumber(res.eixo.minimo, 4) + ' / ' + formatNumber(res.eixo.maximo, 4)));
      resultWrap.appendChild(resultRow('Folga mínima (mm)', formatNumber(res.folgaMin, 4)));
      resultWrap.appendChild(resultRow('Folga máxima (mm)', formatNumber(res.folgaMax, 4)));
      resultWrap.appendChild(resultRow('Tipo de ajuste', res.tipoAjuste, true));

      updateKPIs([
        { label: 'Folga mín', value: formatNumber(res.folgaMin, 3) },
        { label: 'Folga máx', value: formatNumber(res.folgaMax, 3) },
        { label: 'Ajuste', value: res.tipoAjuste }
      ]);
    }

    showToast('Cálculo de tolerância concluído', 'success');
  }

  renderFields();
  updateKPIs([
    { label: 'Mín', value: '—' },
    { label: 'Máx', value: '—' },
    { label: 'Tol', value: '—' }
  ]);
}
