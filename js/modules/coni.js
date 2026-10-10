// coni.js (module) — UI do módulo Conicidade (interface 2.1)

import {
  calcularPorDdL,
  calcularPorDAlphaL,
  calcularPorDdAlpha
} from '../calc/coni.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { h, svg } from './guia/ui/dom.js';
import { mountCalc, copiar } from './ui/calcKit.js';

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
  const el = h('div', { role: 'img', 'aria-label': 'Cone com diâmetro maior D, diâmetro menor d e comprimento L' },
    svg('svg', { viewBox: '0 0 340 170', 'aria-hidden': 'true' },
      svg('line', { class: 'ck-fig-ax', x1: 20, y1: 85, x2: 300, y2: 85 }), cone,
      svg('line', { class: 'ck-fig-dim', x1: 56, y1: 35, x2: 56, y2: 135 }),
      svg('path', { class: 'ck-fig-dim', d: 'M52 41l4-6 4 6M52 129l4 6 4-6' }), t(4, 90, 'ck-fD'),
      svg('line', { class: 'ck-fig-dim', x1: 272, y1: 60, x2: 272, y2: 110 }),
      svg('path', { class: 'ck-fig-dim', d: 'M268 66l4-6 4 6M268 104l4 6 4-6' }), t(272, 50, 'ck-fd', 'middle'),
      svg('line', { class: 'ck-fig-dim', x1: 70, y1: 152, x2: 250, y2: 152 }),
      svg('path', { class: 'ck-fig-dim', d: 'M76 148l-6 4 6 4M244 148l6 4-6 4' }), t(160, 167, 'ck-fL', 'middle')));
  /** @param {{D:number,d:number,L:number}|null} r */
  function atualizar(r) {
    const ok = !!r, D = r ? r.D : NaN, d = r ? r.d : NaN, L = r ? r.L : NaN;
    const hs = ok && D > 0 ? Math.min(70, Math.max(2, 70 * d / D)) : 50;
    cone.setAttribute('points', `70,${85 - 35} 250,${85 - hs / 2} 250,${85 + hs / 2} 70,${85 + 35}`);
    const set = (id, rot, v) => { const n = el.querySelector('#' + id); if (n) n.textContent = Number.isFinite(v) ? rot + ' = ' + formatNumber(v, 3) : rot; };
    set('ck-fD', 'D', D); set('ck-fd', 'd', d); set('ck-fL', 'L', L);
  }
  return { el, update: atualizar };
}

export function render(container) {
  updateHeader('Conicidade', '');
  mountCalc(container, {
    title: 'Conicidade',
    initialMode: currentMode,
    onMode: (key) => { currentMode = key; },
    figure: criarFigura,
    modes: MODES.map((m) => ({
      key: m.key, label: m.label, sub: SUBS[m.key],
      fields: FIELDS[m.key].map(([k, label, unit]) => ({ id: 'coni-' + k, label, unit }))
    })),
    compute(mode, v) {
      const g = (k) => v['coni-' + k];
      const ks = FIELDS[mode].map((f) => f[0]);
      if (ks.some((k) => Number.isNaN(g(k)))) return null;
      const neg = ks.filter((k) => g(k) <= 0).map((k) => 'coni-' + k);
      if (neg.length) return { error: 'Use valores maiores que zero.', ids: neg };
      const D = g('D'), d = g('d'), L = g('L'), a = g('a');
      if ((mode === 'DdL' || mode === 'DdAlpha') && D <= d) return { error: 'O diâmetro menor (d) deve ser menor que o maior (D).', ids: ['coni-D', 'coni-d'] };
      if (mode !== 'DdL' && a >= 180) return { error: 'O ângulo total deve ser menor que 180°.', ids: ['coni-a'] };
      const res = mode === 'DdL' ? calcularPorDdL(D, d, L) : mode === 'DAlphaL' ? calcularPorDAlphaL(d, a, L) : calcularPorDdAlpha(D, d, a);
      if (!res) return { error: 'Não foi possível calcular com esses valores. Confira os campos.', ids: ks.map((k) => 'coni-' + k) };
      const relacao = '1 : ' + formatNumber(res.relacao1ParaX, 2);
      const principal = mode === 'DAlphaL'
        ? [{ label: 'Diâmetro maior (D)', value: formatNumber(res.D, 3), unit: 'mm', main: true }]
        : mode === 'DdAlpha' ? [{ label: 'Comprimento (L)', value: formatNumber(res.L, 3), unit: 'mm', main: true }] : [];
      const kpis = [...principal, { label: 'Conicidade', value: relacao }, { label: 'Ângulo total (α)', value: formatNumber(res.anguloGraus, 3), unit: '°' }];
      const details = [
        ['Semi-ângulo (α/2)', formatNumber(res.anguloMeioGraus, 4) + '°'],
        ['Diferença D − d', formatNumber(res.diferencaDiametros, 3) + ' mm'],
        ['Conicidade C = (D − d) / L', formatNumber(res.conicidade, 6)],
        ['Inclinação (D − d) / 2', formatNumber(res.inclinacao, 4) + ' mm']
      ];
      return { kpis, details, figure: res, copy: copiar('Conicidade (D ' + formatNumber(res.D, 3) + ', d ' + formatNumber(res.d, 3) + ', L ' + formatNumber(res.L, 3) + ')', kpis, details) };
    }
  });
}
