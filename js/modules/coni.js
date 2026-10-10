// coni.js (module) — UI do módulo Conicidade (interface 2.1)

import {
  calcularPorDdL,
  calcularPorDAlphaL,
  calcularPorDdAlpha
} from '../calc/coni.js';
import { formatNumber, parseInput } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';
import { h, svg } from './guia/ui/dom.js';
import { topBar, segTabs, field, markErrors, alertBox, resultPanel } from './ui/calcKit.js';

let currentMode = 'DdL';

const MODES = [
  { key: 'DdL', label: 'D · d · L' },
  { key: 'DAlphaL', label: 'd · α · L' },
  { key: 'DdAlpha', label: 'D · d · α' }
];

const SUBS = {
  DdL: 'Informe os dois diâmetros e o comprimento para achar o ângulo.',
  DAlphaL: 'Informe d, o ângulo total e L para achar o diâmetro maior.',
  DdAlpha: 'Informe D, d e o ângulo total para achar o comprimento.'
};

const FIELDS = {
  DdL: [['D', 'Diâmetro maior (D)', 'mm'], ['d', 'Diâmetro menor (d)', 'mm'], ['L', 'Comprimento (L)', 'mm']],
  DAlphaL: [['d', 'Diâmetro menor (d)', 'mm'], ['a', 'Ângulo total (α)', '°'], ['L', 'Comprimento (L)', 'mm']],
  DdAlpha: [['D', 'Diâmetro maior (D)', 'mm'], ['d', 'Diâmetro menor (d)', 'mm'], ['a', 'Ângulo total (α)', '°']]
};

/** Figura do cone com as cotas. */
function criarFigura() {
  const t = (x, y, id, anchor) => svg('text', { x, y, id, 'text-anchor': anchor || 'start', class: 'ck-fig-txt' });
  const cone = svg('polygon', { class: 'ck-fig-body', points: '70,35 250,60 250,110 70,135' });
  const el = h('div', { class: 'ck-fig', role: 'img', 'aria-label': 'Cone com diâmetro maior D, diâmetro menor d e comprimento L' },
    svg('svg', { viewBox: '0 0 340 170', 'aria-hidden': 'true' },
      svg('line', { class: 'ck-fig-ax', x1: 20, y1: 85, x2: 300, y2: 85 }), cone,
      svg('line', { class: 'ck-fig-dim', x1: 56, y1: 35, x2: 56, y2: 135 }),
      svg('path', { class: 'ck-fig-dim', d: 'M52 41l4-6 4 6M52 129l4 6 4-6' }), t(4, 90, 'ck-fD'),
      svg('line', { class: 'ck-fig-dim', x1: 272, y1: 60, x2: 272, y2: 110 }),
      svg('path', { class: 'ck-fig-dim', d: 'M268 66l4-6 4 6M268 104l4 6 4-6' }), t(272, 50, 'ck-fd', 'middle'),
      svg('line', { class: 'ck-fig-dim', x1: 70, y1: 152, x2: 250, y2: 152 }),
      svg('path', { class: 'ck-fig-dim', d: 'M76 148l-6 4 6 4M244 148l6 4-6 4' }), t(160, 167, 'ck-fL', 'middle')));
  /** @param {number} D @param {number} d @param {number} L @param {boolean} ok */
  function atualizar(D, d, L, ok) {
    const hs = ok && D > 0 ? Math.min(70, Math.max(2, 70 * d / D)) : 50;
    cone.setAttribute('points', `70,${85 - 35} 250,${85 - hs / 2} 250,${85 + hs / 2} 70,${85 + 35}`);
    const set = (id, rot, v) => { const n = el.querySelector('#' + id); if (n) n.textContent = Number.isFinite(v) ? rot + ' = ' + formatNumber(v, 3) : rot; };
    set('ck-fD', 'D', D); set('ck-fd', 'd', d); set('ck-fL', 'L', L);
  }
  return { el, atualizar };
}

export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Conicidade', '');

  const sub = h('p', { class: 'ck-sub' });
  const form = h('form', { class: 'ck-form', novalidate: true, onsubmit: (e) => e.preventDefault() });
  const figura = criarFigura();
  const aviso = alertBox();
  const painel = resultPanel('Confira o resultado com o desenho da peça.');
  const saved = {};

  const tabs = segTabs(MODES, currentMode, (key) => { currentMode = key; montar(); });

  container.append(h('div', { class: 'ck-view' }, topBar('Conicidade'), sub, tabs, figura.el, form, aviso.el, painel.el));

  function montar() {
    sub.textContent = SUBS[currentMode];
    const fs = FIELDS[currentMode];
    const campos = fs.map(([k, label, unit]) => field({
      id: 'coni-' + k, label, unit,
      value: (saved[currentMode] || {})[k] || '',
      onInput: () => {
        const el = /** @type {HTMLInputElement} */ (document.getElementById('coni-' + k));
        (saved[currentMode] = saved[currentMode] || {})[k] = el.value;
        calcular();
      }
    }));
    form.replaceChildren(h('div', { class: 'ck-row' }, campos[0], campos[1]), campos[2]);
    calcular();
  }

  function val(k) { const el = /** @type {HTMLInputElement|null} */ (document.getElementById('coni-' + k)); return el ? parseInput(el.value) : NaN; }

  function vazio() {
    painel.hide();
    updateKPIs([{ label: 'α', value: '—' }, { label: 'C', value: '—' }, { label: 'Relação', value: '—' }]);
  }

  function falha(msg, ids) { aviso.show(msg); markErrors(ids); vazio(); }

  function calcular() {
    aviso.hide(); markErrors([]);
    const ks = FIELDS[currentMode].map((f) => f[0]);
    const v = Object.fromEntries(ks.map((k) => [k, val(k)]));
    const D = v.D ?? NaN, d = v.d ?? NaN, L = v.L ?? NaN;
    figura.atualizar(D, d, L, false);
    if (ks.some((k) => Number.isNaN(v[k]))) { vazio(); return; }
    const neg = ks.filter((k) => v[k] <= 0);
    if (neg.length) return falha('Use valores maiores que zero.', neg.map((k) => 'coni-' + k));
    let res;
    if (currentMode === 'DdL') {
      if (D <= d) return falha('O diâmetro menor (d) deve ser menor que o maior (D).', ['coni-D', 'coni-d']);
      res = calcularPorDdL(D, d, L);
    } else if (currentMode === 'DAlphaL') {
      if (v.a >= 180) return falha('O ângulo total deve ser menor que 180°.', ['coni-a']);
      res = calcularPorDAlphaL(d, v.a, L);
    } else {
      if (D <= d) return falha('O diâmetro menor (d) deve ser menor que o maior (D).', ['coni-D', 'coni-d']);
      if (v.a >= 180) return falha('O ângulo total deve ser menor que 180°.', ['coni-a']);
      res = calcularPorDdAlpha(D, d, v.a);
    }
    if (!res) return falha('Não foi possível calcular com esses valores. Confira os campos.', ks.map((k) => 'coni-' + k));

    figura.atualizar(res.D, res.d, res.L, true);
    const relacao = '1 : ' + formatNumber(res.relacao1ParaX, 2);
    const principal = currentMode === 'DAlphaL'
      ? { label: 'Diâmetro maior (D)', value: formatNumber(res.D, 3), unit: 'mm', main: true }
      : currentMode === 'DdAlpha'
        ? { label: 'Comprimento (L)', value: formatNumber(res.L, 3), unit: 'mm', main: true }
        : null;
    const kpis = [
      ...(principal ? [principal] : []),
      { label: 'Conicidade', value: relacao },
      { label: 'Ângulo total (α)', value: formatNumber(res.anguloGraus, 3), unit: '°' }
    ];
    const details = [
      ['Semi-ângulo (α/2)', formatNumber(res.anguloMeioGraus, 4) + '°'],
      ['Diferença D − d', formatNumber(res.diferencaDiametros, 3) + ' mm'],
      ['Conicidade C = (D − d) / L', formatNumber(res.conicidade, 6)],
      ['Inclinação (D − d) / 2', formatNumber(res.inclinacao, 4) + ' mm']
    ];
    painel.show({
      kpis, details,
      copy: `Conicidade (D ${formatNumber(res.D, 3)}, d ${formatNumber(res.d, 3)}, L ${formatNumber(res.L, 3)})\n`
        + kpis.map((k) => `${k.label}: ${k.value}${k.unit ? ' ' + k.unit : ''}`).join('\n') + '\n'
        + details.map((r) => `${r[0]}: ${r[1]}`).join('\n')
    });
    updateKPIs([
      { label: 'α', value: formatNumber(res.anguloGraus, 3) + '°' },
      { label: 'C', value: formatNumber(res.conicidade, 5) },
      { label: 'Relação', value: relacao }
    ]);
  }

  montar();
}
