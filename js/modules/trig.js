// trig.js (module) — UI do módulo Trigonometria
// Renderiza formulário, SVG dinâmico e resultados.

import {
  resolverPorCatetos,
  resolverPorHipotenusaAngulo,
  resolverPorCatetoOpostoAngulo,
  resolverPorCatetoAdjAngulo
} from '../calc/trig.js';
import { formatNumber, parseInput, createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
let currentMode = 'catetos';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k of Object.keys(attrs)) {
    el.setAttribute(k, String(attrs[k]));
  }
  return el;
}

function desenharTriangulo(res) {
  const W = 300, H = 220;
  const pad = 30;
  const svg = svgEl('svg', {
    viewBox: `0 0 ${W} ${H}`,
    xmlns: SVG_NS,
    role: 'img',
    'aria-label': 'Triângulo retângulo'
  });

  if (!res) {
    const txt = svgEl('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle' });
    txt.textContent = 'Aguardando dados...';
    svg.appendChild(txt);
    return svg;
  }

  const { catetoOposto, catetoAdjacente } = res;
  const maxVal = Math.max(catetoOposto, catetoAdjacente, 1);
  const scale = Math.min((W - 2 * pad) / maxVal, (H - 2 * pad) / maxVal);

  const baseLen = catetoAdjacente * scale;
  const altLen = catetoOposto * scale;

  const x0 = pad;
  const y0 = H - pad;
  const x1 = x0 + baseLen;
  const y1 = y0 - altLen;
  const x2 = x1;
  const y2 = y0;

  // Preenchimento
  const poly = svgEl('polygon', {
    points: `${x0},${y0} ${x1},${y1} ${x2},${y2}`,
    class: 'shape-fill'
  });
  svg.appendChild(poly);

  // Hipotenusa
  const hip = svgEl('line', { x1: x0, y1: y0, x2: x1, y2: y1, class: 'shape-line' });
  svg.appendChild(hip);

  // Cateto adjacente
  const catAdj = svgEl('line', { x1: x0, y1: y0, x2: x2, y2: y2, class: 'shape-line' });
  svg.appendChild(catAdj);

  // Cateto oposto
  const catOposto = svgEl('line', { x1: x1, y1: y1, x2: x2, y2: y2, class: 'shape-line' });
  svg.appendChild(catOposto);

  // Arco do ângulo alfa (na base esquerda)
  const arcR = 30;
  const arc = svgEl('path', {
    d: `M ${x0 + arcR} ${y0} A ${arcR} ${arcR} 0 0 0 ${x0 + arcR * Math.cos(res.alfaRad)} ${y0 - arcR * Math.sin(res.alfaRad)}`,
    class: 'shape-angle'
  });
  svg.appendChild(arc);

  // Rótulos
  const labelHip = svgEl('text', {
    x: (x0 + x1) / 2 - 12,
    y: (y0 + y1) / 2 - 6
  });
  labelHip.textContent = `h=${formatNumber(res.hipotenusa, 2)}`;
  svg.appendChild(labelHip);

  const labelAdj = svgEl('text', { x: (x0 + x2) / 2 - 15, y: y0 + 16 });
  labelAdj.textContent = `ca=${formatNumber(catetoAdjacente, 2)}`;
  svg.appendChild(labelAdj);

  const labelOposto = svgEl('text', { x: x1 + 6, y: (y1 + y2) / 2 });
  labelOposto.textContent = `co=${formatNumber(catetoOposto, 2)}`;
  svg.appendChild(labelOposto);

  const labelAlfa = svgEl('text', { x: x0 + arcR + 4, y: y0 - 6 });
  labelAlfa.textContent = `α=${formatNumber(res.alfaGraus, 1)}°`;
  svg.appendChild(labelAlfa);

  return svg;
}

function resultRow(label, value) {
  return createElementSafe('div', { class: 'result-row' }, [
    createElementSafe('span', { class: 'result-label', text: label }),
    createElementSafe('span', { class: 'result-value', text: value })
  ]);
}

function renderResultado(res) {
  const wrap = createElementSafe('div');
  if (!res) {
    wrap.appendChild(createElementSafe('p', { class: 'result-hint', text: 'Preencha os campos para calcular.' }));
    return wrap;
  }
  wrap.appendChild(resultRow('Cateto oposto (co)', formatNumber(res.catetoOposto, 4) + ' mm'));
  wrap.appendChild(resultRow('Cateto adjacente (ca)', formatNumber(res.catetoAdjacente, 4) + ' mm'));
  wrap.appendChild(resultRow('Hipotenusa (h)', formatNumber(res.hipotenusa, 4) + ' mm'));
  wrap.appendChild(resultRow('Ângulo α', formatNumber(res.alfaGraus, 4) + '°'));
  wrap.appendChild(resultRow('Ângulo β', formatNumber(res.betaGraus, 4) + '°'));
  wrap.appendChild(resultRow('sen α', formatNumber(res.seno, 6)));
  wrap.appendChild(resultRow('cos α', formatNumber(res.cosseno, 6)));
  wrap.appendChild(resultRow('tan α', formatNumber(res.tangente, 6)));
  return wrap;
}

function inputGroup(label, id, placeholder) {
  const group = createElementSafe('div', { class: 'input-group' }, [
    createElementSafe('label', { for: id, text: label })
  ]);
  const wrap = createElementSafe('div', { class: 'input-with-clear' }, [
    createElementSafe('input', {
      id,
      class: 'input',
      type: 'text',
      inputmode: 'decimal',
      placeholder: placeholder || '0',
      autocomplete: 'off',
      spellcheck: 'false'
    }),
    createElementSafe('button', {
      type: 'button',
      class: 'clear-btn',
      'aria-label': 'Limpar',
      text: '✕',
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

export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);

  updateHeader('Trigonometria', '📐');

  const card = createElementSafe('div', { class: 'card' });
  card.appendChild(createElementSafe('h2', { class: 'card-title', text: 'Trigonometria' }));

  // Seleção de modo
  const modesWrap = createElementSafe('div', { class: 'rosca-tabs' });
  const modes = [
    { key: 'catetos',   label: '2 Catetos' },
    { key: 'hip-ang',   label: 'Hipotenusa + α' },
    { key: 'co-ang',    label: 'Cateto oposto + α' },
    { key: 'ca-ang',    label: 'Cateto adj. + α' }
  ];

  modes.forEach((m) => {
    const btn = createElementSafe('button', {
      type: 'button',
      class: 'rosca-tab' + (currentMode === m.key ? ' active' : ''),
      text: m.label,
      'data-mode': m.key,
      onclick: (ev) => {
        currentMode = m.key;
        const tabs = ev.target.parentElement.querySelectorAll('.rosca-tab');
        tabs.forEach((t) => t.classList.remove('active'));
        ev.target.classList.add('active');
        renderFields();
      }
    });
    modesWrap.appendChild(btn);
  });
  card.appendChild(modesWrap);

  const fieldsWrap = createElementSafe('div', { id: 'trig-fields' });
  card.appendChild(fieldsWrap);

  const btnCalc = createElementSafe('button', {
    type: 'button',
    class: 'btn btn-primary',
    text: 'Calcular',
    onclick: calcular
  });
  card.appendChild(btnCalc);

  const svgWrap = createElementSafe('div', { class: 'trig-svg-wrap' });
  svgWrap.appendChild(desenharTriangulo(null));
  card.appendChild(svgWrap);

  const resultWrap = createElementSafe('div', { id: 'trig-result' });
  resultWrap.appendChild(renderResultado(null));
  card.appendChild(resultWrap);

  container.appendChild(card);

  function renderFields() {
    while (fieldsWrap.firstChild) fieldsWrap.removeChild(fieldsWrap.firstChild);
    if (currentMode === 'catetos') {
      fieldsWrap.appendChild(inputGroup('Cateto oposto (mm)', 'trig-co'));
      fieldsWrap.appendChild(inputGroup('Cateto adjacente (mm)', 'trig-ca'));
    } else if (currentMode === 'hip-ang') {
      fieldsWrap.appendChild(inputGroup('Hipotenusa (mm)', 'trig-h'));
      fieldsWrap.appendChild(inputGroup('Ângulo α (°)', 'trig-a'));
    } else if (currentMode === 'co-ang') {
      fieldsWrap.appendChild(inputGroup('Cateto oposto (mm)', 'trig-co'));
      fieldsWrap.appendChild(inputGroup('Ângulo α (°)', 'trig-a'));
    } else if (currentMode === 'ca-ang') {
      fieldsWrap.appendChild(inputGroup('Cateto adjacente (mm)', 'trig-ca'));
      fieldsWrap.appendChild(inputGroup('Ângulo α (°)', 'trig-a'));
    }
  }

  function calcular() {
    let res = null;
    if (currentMode === 'catetos') {
      const co = getVal('trig-co');
      const ca = getVal('trig-ca');
      if (!Number.isFinite(co) || !Number.isFinite(ca)) {
        showToast('Preencha os dois catetos', 'warning');
        return;
      }
      res = resolverPorCatetos(co, ca);
    } else if (currentMode === 'hip-ang') {
      const h = getVal('trig-h');
      const a = getVal('trig-a');
      if (!Number.isFinite(h) || !Number.isFinite(a)) {
        showToast('Preencha hipotenusa e ângulo', 'warning');
        return;
      }
      res = resolverPorHipotenusaAngulo(h, a);
    } else if (currentMode === 'co-ang') {
      const co = getVal('trig-co');
      const a = getVal('trig-a');
      if (!Number.isFinite(co) || !Number.isFinite(a)) {
        showToast('Preencha cateto e ângulo', 'warning');
        return;
      }
      res = resolverPorCatetoOpostoAngulo(co, a);
    } else if (currentMode === 'ca-ang') {
      const ca = getVal('trig-ca');
      const a = getVal('trig-a');
      if (!Number.isFinite(ca) || !Number.isFinite(a)) {
        showToast('Preencha cateto e ângulo', 'warning');
        return;
      }
      res = resolverPorCatetoAdjAngulo(ca, a);
    }

    if (!res) {
      showToast('Dados inválidos', 'error');
      return;
    }

    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);
    resultWrap.appendChild(renderResultado(res));

    while (svgWrap.firstChild) svgWrap.removeChild(svgWrap.firstChild);
    svgWrap.appendChild(desenharTriangulo(res));

    updateKPIs([
      { label: 'Hipotenusa', value: formatNumber(res.hipotenusa, 2) + ' mm' },
      { label: 'Ângulo α',   value: formatNumber(res.alfaGraus, 2) + '°' },
      { label: 'Ângulo β',   value: formatNumber(res.betaGraus, 2) + '°' }
    ]);
    showToast('Cálculo realizado', 'success');
  }

  renderFields();
  updateKPIs([
    { label: 'Co', value: '—' },
    { label: 'Ca', value: '—' },
    { label: 'Hip', value: '—' }
  ]);
}
