// poly.js (module) — UI do módulo Polígonos Regulares

import {
  calcularPoligono,
  calcularPorLado,
  calcularPorApotema,
  gerarPontos
} from '../calc/poly.js';
import { formatNumber, parseInput, createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
let currentMode = 'R';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k of Object.keys(attrs)) el.setAttribute(k, String(attrs[k]));
  return el;
}

function desenharPoligono(n, R) {
  const S = 260;
  const cx = S / 2, cy = S / 2;
  const raio = R && R > 0 ? Math.min(100, R * 2) : 90;

  const svg = svgEl('svg', { viewBox: `0 0 ${S} ${S}`, xmlns: SVG_NS });

  if (!Number.isInteger(n) || n < 3) {
    const t = svgEl('text', { x: cx, y: cy, 'text-anchor': 'middle' });
    t.textContent = 'n ≥ 3';
    svg.appendChild(t);
    return svg;
  }

  const pts = gerarPontos(n, cx, cy, raio);
  const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(' ');

  const poly = svgEl('polygon', { points: pointsStr, class: 'poly-shape' });
  svg.appendChild(poly);

  // Raios para os vértices (linhas tracejadas)
  pts.forEach((p) => {
    const ln = svgEl('line', {
      x1: cx, y1: cy, x2: p.x, y2: p.y, class: 'poly-radius'
    });
    svg.appendChild(ln);
  });

  // Centro
  const c = svgEl('circle', { cx, cy, r: 3, fill: '#f0883e' });
  svg.appendChild(c);

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

function renderResults(res) {
  const wrap = createElementSafe('div');
  if (!res) {
    wrap.appendChild(createElementSafe('p', { class: 'result-hint', text: 'Preencha os campos e calcule.' }));
    return wrap;
  }
  wrap.appendChild(resultRow('Número de lados (n)', String(res.n)));
  wrap.appendChild(resultRow('Raio circunscrito (R)', formatNumber(res.R, 4) + ' mm'));
  wrap.appendChild(resultRow('Lado (a)', formatNumber(res.lado, 4) + ' mm', true));
  wrap.appendChild(resultRow('Apótema', formatNumber(res.apotema, 4) + ' mm'));
  wrap.appendChild(resultRow('Ângulo interno', formatNumber(res.anguloInternoGraus, 4) + '°'));
  wrap.appendChild(resultRow('Ângulo central', formatNumber(res.anguloCentralGraus, 4) + '°'));
  wrap.appendChild(resultRow('Soma dos ângulos', formatNumber(res.somaAngulosInternos, 2) + '°'));
  wrap.appendChild(resultRow('Perímetro', formatNumber(res.perimetro, 4) + ' mm'));
  wrap.appendChild(resultRow('Área', formatNumber(res.area, 4) + ' mm²'));
  return wrap;
}

export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Polígonos', '⬡');

  const card = createElementSafe('div', { class: 'card' });
  card.appendChild(createElementSafe('h2', { class: 'card-title', text: 'Polígonos Regulares' }));

  const modesWrap = createElementSafe('div', { class: 'rosca-tabs' });
  const modes = [
    { key: 'R',  label: 'n + R' },
    { key: 'a',  label: 'n + lado' },
    { key: 'ap', label: 'n + apótema' }
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

  const svgWrap = createElementSafe('div', { class: 'poly-svg-wrap' });
  svgWrap.appendChild(desenharPoligono(0, 0));
  card.appendChild(svgWrap);

  const resultWrap = createElementSafe('div');
  resultWrap.appendChild(renderResults(null));
  card.appendChild(resultWrap);

  container.appendChild(card);

  function renderFields() {
    while (fieldsWrap.firstChild) fieldsWrap.removeChild(fieldsWrap.firstChild);
    fieldsWrap.appendChild(inputGroup('Número de lados (n ≥ 3)', 'poly-n'));
    if (currentMode === 'R') fieldsWrap.appendChild(inputGroup('Raio circunscrito R (mm)', 'poly-R'));
    else if (currentMode === 'a') fieldsWrap.appendChild(inputGroup('Comprimento do lado (mm)', 'poly-a'));
    else if (currentMode === 'ap') fieldsWrap.appendChild(inputGroup('Apótema (mm)', 'poly-ap'));
  }

  function calcular() {
    const n = getVal('poly-n');
    if (!Number.isInteger(n) || n < 3) { showToast('n deve ser inteiro ≥ 3', 'warning'); return; }

    let res = null;
    if (currentMode === 'R') {
      const R = getVal('poly-R');
      if (!Number.isFinite(R) || R <= 0) { showToast('Informe o raio', 'warning'); return; }
      res = calcularPoligono(n, R);
    } else if (currentMode === 'a') {
      const a = getVal('poly-a');
      if (!Number.isFinite(a) || a <= 0) { showToast('Informe o lado', 'warning'); return; }
      res = calcularPorLado(n, a);
    } else {
      const ap = getVal('poly-ap');
      if (!Number.isFinite(ap) || ap <= 0) { showToast('Informe o apótema', 'warning'); return; }
      res = calcularPorApotema(n, ap);
    }

    if (!res) { showToast('Dados inválidos', 'error'); return; }

    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);
    resultWrap.appendChild(renderResults(res));

    while (svgWrap.firstChild) svgWrap.removeChild(svgWrap.firstChild);
    svgWrap.appendChild(desenharPoligono(n, res.R));

    updateKPIs([
      { label: 'Lado',     value: formatNumber(res.lado, 3) + ' mm' },
      { label: 'Apótema',  value: formatNumber(res.apotema, 3) + ' mm' },
      { label: 'Área',     value: formatNumber(res.area, 1) + ' mm²' }
    ]);
    showToast('Polígono calculado', 'success');
  }

  renderFields();
  updateKPIs([
    { label: 'Lado', value: '—' },
    { label: 'Apótema', value: '—' },
    { label: 'Área', value: '—' }
  ]);
}
