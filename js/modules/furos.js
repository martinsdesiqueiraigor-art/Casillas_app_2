// furos.js (module) — UI do módulo Furação Circular

import { calcularFuros, distanciaEntreFuros } from '../calc/furos.js';
import { formatNumber, parseInput, createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k of Object.keys(attrs)) el.setAttribute(k, String(attrs[k]));
  return el;
}

function desenharFuros(res) {
  const S = 260, cx = S / 2, cy = S / 2;
  const maxR = 95;
  const svg = svgEl('svg', { viewBox: `0 0 ${S} ${S}`, xmlns: SVG_NS });

  const raio = res && res.R > 0 ? Math.min(maxR, 60 + Math.min(35, res.R / 2)) : 80;
  const rFuro = 6;

  // Círculo externo
  svg.appendChild(svgEl('circle', {
    cx, cy, r: raio + rFuro + 6, class: 'outer'
  }));

  // Círculo de passo
  svg.appendChild(svgEl('circle', {
    cx, cy, r: raio, class: 'inner'
  }));

  if (res && Array.isArray(res.furos)) {
    // Furos
    res.furos.forEach((f) => {
      const px = cx + raio * Math.cos(f.anguloRad);
      const py = cy - raio * Math.sin(f.anguloRad);
      svg.appendChild(svgEl('circle', { cx: px, cy: py, r: rFuro, class: 'hole' }));

      // número do furo
      const t = svgEl('text', {
        x: px, y: py - rFuro - 3, 'text-anchor': 'middle'
      });
      t.textContent = String(f.indice);
      svg.appendChild(t);
    });
  }

  // Centro
  svg.appendChild(svgEl('circle', { cx, cy, r: 2, fill: '#8b949e' }));

  return svg;
}

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

function getVal(id) {
  const el = document.getElementById(id);
  return el ? parseInput(el.value) : NaN;
}

function renderTabela(res) {
  const wrap = createElementSafe('div', { class: 'table-wrap' });
  const table = createElementSafe('table', { class: 'data-table' });
  const thead = createElementSafe('thead');
  const trh = createElementSafe('tr');
  ['#', 'Ângulo (°)', 'X (mm)', 'Y (mm)'].forEach((h) => {
    trh.appendChild(createElementSafe('th', { text: h }));
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = createElementSafe('tbody');
  res.furos.forEach((f) => {
    const tr = createElementSafe('tr');
    tr.appendChild(createElementSafe('td', { text: String(f.indice) }));
    tr.appendChild(createElementSafe('td', { text: formatNumber(f.anguloGraus, 3) }));
    tr.appendChild(createElementSafe('td', { text: formatNumber(f.x, 3) }));
    tr.appendChild(createElementSafe('td', { text: formatNumber(f.y, 3) }));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Furação Circular', '⚫');

  const card = createElementSafe('div', { class: 'card' });
  card.appendChild(createElementSafe('h2', { class: 'card-title', text: '⚫ Furação Circular' }));

  card.appendChild(inputGroup('Diâmetro do círculo de furos (mm)', 'furos-D'));
  card.appendChild(inputGroup('Número de furos (n)', 'furos-n'));
  card.appendChild(inputGroup('Ângulo inicial (°) — opcional', 'furos-a'));

  card.appendChild(createElementSafe('button', {
    type: 'button', class: 'btn btn-primary', text: 'Calcular',
    onclick: calcular
  }));

  const svgWrap = createElementSafe('div', { class: 'furos-svg-wrap' });
  svgWrap.appendChild(desenharFuros(null));
  card.appendChild(svgWrap);

  const resultWrap = createElementSafe('div');
  card.appendChild(resultWrap);

  container.appendChild(card);

  function calcular() {
    const D = getVal('furos-D');
    const n = getVal('furos-n');
    let a = getVal('furos-a');
    if (!Number.isFinite(a)) a = 0;

    if (!Number.isFinite(D) || D <= 0) { showToast('Diâmetro inválido', 'warning'); return; }
    if (!Number.isInteger(n) || n < 2) { showToast('n deve ser inteiro ≥ 2', 'warning'); return; }

    const res = calcularFuros(D, n, a);
    if (!res) { showToast('Dados inválidos', 'error'); return; }

    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);
    resultWrap.appendChild(resultRow('Diâmetro', formatNumber(D, 3) + ' mm'));
    resultWrap.appendChild(resultRow('Raio', formatNumber(res.R, 3) + ' mm'));
    resultWrap.appendChild(resultRow('Número de furos', String(n)));
    resultWrap.appendChild(resultRow('Passo angular', formatNumber(res.passoAngular, 4) + '°', true));
    resultWrap.appendChild(resultRow('Ângulo inicial', formatNumber(a, 4) + '°'));
    resultWrap.appendChild(resultRow('Corda entre furos', formatNumber(distanciaEntreFuros(D, n), 4) + ' mm'));
    resultWrap.appendChild(renderTabela(res));

    while (svgWrap.firstChild) svgWrap.removeChild(svgWrap.firstChild);
    svgWrap.appendChild(desenharFuros(res));

    updateKPIs([
      { label: 'Furos', value: String(n) },
      { label: 'Passo', value: formatNumber(res.passoAngular, 2) + '°' },
      { label: 'Corda', value: formatNumber(distanciaEntreFuros(D, n), 2) + ' mm' }
    ]);
    showToast('Furação calculada', 'success');
  }

  updateKPIs([
    { label: 'Furos', value: '—' },
    { label: 'Passo', value: '—' },
    { label: 'Corda', value: '—' }
  ]);
}
