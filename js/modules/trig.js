// trig.js (module) — UI do módulo Trigonometria (interface 2.1)

import {
  resolverPorCatetos,
  resolverPorHipotenusaAngulo,
  resolverPorCatetoOpostoAngulo,
  resolverPorCatetoAdjAngulo
} from '../calc/trig.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { h, svg } from './guia/ui/dom.js';
import { mountCalc, copiar } from './ui/calcKit.js';

let currentMode = 'catetos';

const MODES = [
  { key: 'catetos', label: '2 catetos', sub: 'Informe os dois catetos para achar a hipotenusa e os ângulos.',
    fields: [['trig-co', 'Cateto oposto (co)', 'mm'], ['trig-ca', 'Cateto adjacente (ca)', 'mm']] },
  { key: 'hip-ang', label: 'h + α', sub: 'Informe a hipotenusa e o ângulo α para achar os catetos.',
    fields: [['trig-h', 'Hipotenusa (h)', 'mm'], ['trig-a', 'Ângulo (α)', '°']] },
  { key: 'co-ang', label: 'co + α', sub: 'Informe o cateto oposto e o ângulo α.',
    fields: [['trig-co', 'Cateto oposto (co)', 'mm'], ['trig-a', 'Ângulo (α)', '°']] },
  { key: 'ca-ang', label: 'ca + α', sub: 'Informe o cateto adjacente e o ângulo α.',
    fields: [['trig-ca', 'Cateto adjacente (ca)', 'mm'], ['trig-a', 'Ângulo (α)', '°']] }
];

/** Triângulo retângulo que acompanha o resultado. */
function criarFigura() {
  const raiz = h('div', { role: 'img', 'aria-label': 'Triângulo retângulo com catetos, hipotenusa e ângulo α' });
  /** @param {any} r */
  function update(r) {
    const W = 340, H = 190, pad = 34;
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
    if (!r) {
      s.appendChild(svg('polygon', { class: 'ck-fig-body', points: '40,150 290,150 290,50', opacity: '0.45' }));
      s.appendChild(svg('text', { x: 165, y: 175, 'text-anchor': 'middle', class: 'ck-fig-txt', text: 'Preencha os campos' }));
      raiz.replaceChildren(s);
      return;
    }
    const maxVal = Math.max(r.catetoOposto, r.catetoAdjacente, 1e-9);
    const sc = Math.min((W - 2 * pad - 30) / maxVal, (H - 2 * pad) / maxVal);
    const x0 = pad, y0 = H - pad, x1 = x0 + r.catetoAdjacente * sc, y1 = y0 - r.catetoOposto * sc;
    const R = 26;
    s.append(
      svg('polygon', { class: 'ck-fig-body', points: `${x0},${y0} ${x1},${y1} ${x1},${y0}` }),
      svg('path', { class: 'ck-fig-dim', d: `M ${x0 + R} ${y0} A ${R} ${R} 0 0 0 ${x0 + R * Math.cos(r.alfaRad)} ${y0 - R * Math.sin(r.alfaRad)}` }),
      svg('text', { x: (x0 + x1) / 2, y: y0 + 18, 'text-anchor': 'middle', class: 'ck-fig-txt', text: 'ca = ' + formatNumber(r.catetoAdjacente, 2) }),
      svg('text', { x: x1 + 6, y: (y0 + y1) / 2 + 4, class: 'ck-fig-txt', text: 'co = ' + formatNumber(r.catetoOposto, 2) }),
      svg('text', { x: (x0 + x1) / 2 - 8, y: (y0 + y1) / 2 - 8, 'text-anchor': 'end', class: 'ck-fig-txt', text: 'h = ' + formatNumber(r.hipotenusa, 2) }),
      svg('text', { x: x0 + R + 6, y: y0 - 6, class: 'ck-fig-txt', text: 'α = ' + formatNumber(r.alfaGraus, 1) + '°' }));
    raiz.replaceChildren(s);
  }
  update(null);
  return { el: raiz, update };
}

export function render(container) {
  updateHeader('Trigonometria', '');
  mountCalc(container, {
    title: 'Trigonometria',
    initialMode: currentMode,
    onMode: (key) => { currentMode = key; },
    figure: criarFigura,
    modes: MODES.map((m) => ({ key: m.key, label: m.label, sub: m.sub, fields: m.fields.map(([id, label, unit]) => ({ id, label, unit })) })),
    compute(mode, v) {
      const m = MODES.find((x) => x.key === mode);
      const ids = m.fields.map((f) => f[0]);
      if (ids.some((id) => Number.isNaN(v[id]))) return null;
      const neg = ids.filter((id) => v[id] <= 0);
      if (neg.length) return { error: 'Use valores maiores que zero.', ids: neg };
      if (mode !== 'catetos' && v['trig-a'] >= 90) return { error: 'O ângulo α deve ficar entre 0° e 90°.', ids: ['trig-a'] };
      const r = mode === 'catetos' ? resolverPorCatetos(v['trig-co'], v['trig-ca'])
        : mode === 'hip-ang' ? resolverPorHipotenusaAngulo(v['trig-h'], v['trig-a'])
          : mode === 'co-ang' ? resolverPorCatetoOpostoAngulo(v['trig-co'], v['trig-a'])
            : resolverPorCatetoAdjAngulo(v['trig-ca'], v['trig-a']);
      if (!r) return { error: 'Não foi possível calcular com esses valores. Confira os campos.', ids };
      const kpis = [
        { label: 'Hipotenusa (h)', value: formatNumber(r.hipotenusa, 4), unit: 'mm', main: true },
        { label: 'Ângulo α', value: formatNumber(r.alfaGraus, 3), unit: '°' },
        { label: 'Ângulo β', value: formatNumber(r.betaGraus, 3), unit: '°' }
      ];
      const details = [
        ['Cateto oposto (co)', formatNumber(r.catetoOposto, 4) + ' mm'],
        ['Cateto adjacente (ca)', formatNumber(r.catetoAdjacente, 4) + ' mm'],
        ['sen α', formatNumber(r.seno, 6)], ['cos α', formatNumber(r.cosseno, 6)], ['tan α', formatNumber(r.tangente, 6)]
      ];
      return { kpis, details, figure: r, copy: copiar('Trigonometria', kpis, details) };
    }
  });
}
