// poly.js (module) — UI do módulo Polígonos Regulares (interface 2.1)

import { calcularPoligono, calcularPorLado, calcularPorApotema, gerarPontos } from '../calc/poly.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { h, svg } from './guia/ui/dom.js';
import { mountCalc, copiar } from './ui/calcKit.js';

let currentMode = 'R';

const MODES = [
  { key: 'R', label: 'n + R', sub: 'Informe o número de lados e o raio circunscrito.', campo: ['poly-R', 'Raio circunscrito (R)'] },
  { key: 'a', label: 'n + lado', sub: 'Informe o número de lados e o comprimento do lado.', campo: ['poly-a', 'Comprimento do lado (a)'] },
  { key: 'ap', label: 'n + apótema', sub: 'Informe o número de lados e o apótema.', campo: ['poly-ap', 'Apótema'] }
];

function criarFigura() {
  const raiz = h('div', { role: 'img', 'aria-label': 'Polígono regular inscrito em circunferência' });
  /** @param {{n:number}|null} r */
  function update(r) {
    const S = 220, cx = S / 2, cy = S / 2, raio = 85;
    const s = svg('svg', { viewBox: `0 0 ${S} ${S}`, 'aria-hidden': 'true', style: 'max-height:220px' });
    s.appendChild(svg('circle', { cx, cy, r: raio, class: 'ck-fig-ax', fill: 'none' }));
    if (r && r.n >= 3) {
      const pts = gerarPontos(r.n, cx, cy, raio);
      s.appendChild(svg('polygon', { class: 'ck-fig-body', points: pts.map((p) => p.x + ',' + p.y).join(' ') }));
      for (const p of pts) s.appendChild(svg('line', { class: 'ck-fig-ax', x1: cx, y1: cy, x2: p.x, y2: p.y }));
    } else {
      s.appendChild(svg('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', class: 'ck-fig-txt', text: 'n ≥ 3' }));
    }
    s.appendChild(svg('circle', { cx, cy, r: 3, fill: '#ff7a1a' }));
    raiz.replaceChildren(s);
  }
  update(null);
  return { el: raiz, update };
}

export function render(container) {
  updateHeader('Polígonos', '');
  mountCalc(container, {
    title: 'Polígonos regulares',
    initialMode: currentMode,
    onMode: (key) => { currentMode = key; },
    figure: criarFigura,
    modes: MODES.map((m) => ({
      key: m.key, label: m.label, sub: m.sub,
      fields: [{ id: 'poly-n', label: 'Número de lados (n)', unit: 'lados' }, { id: m.campo[0], label: m.campo[1], unit: 'mm' }]
    })),
    compute(mode, v) {
      const m = MODES.find((x) => x.key === mode);
      const id = m.campo[0], n = v['poly-n'], x = v[id];
      if (Number.isNaN(n) || Number.isNaN(x)) return null;
      if (!Number.isInteger(n) || n < 3) return { error: 'O número de lados deve ser um inteiro maior ou igual a 3.', ids: ['poly-n'] };
      if (x <= 0) return { error: 'Use valores maiores que zero.', ids: [id] };
      const r = mode === 'R' ? calcularPoligono(n, x) : mode === 'a' ? calcularPorLado(n, x) : calcularPorApotema(n, x);
      if (!r) return { error: 'Não foi possível calcular com esses valores. Confira os campos.', ids: ['poly-n', id] };
      const kpis = [
        { label: 'Lado (a)', value: formatNumber(r.lado, 4), unit: 'mm', main: true },
        { label: 'Apótema', value: formatNumber(r.apotema, 3), unit: 'mm' },
        { label: 'Área', value: formatNumber(r.area, 2), unit: 'mm²' }
      ];
      const details = [
        ['Número de lados (n)', String(r.n)],
        ['Raio circunscrito (R)', formatNumber(r.R, 4) + ' mm'],
        ['Ângulo interno', formatNumber(r.anguloInternoGraus, 4) + '°'],
        ['Ângulo central', formatNumber(r.anguloCentralGraus, 4) + '°'],
        ['Soma dos ângulos', formatNumber(r.somaAngulosInternos, 2) + '°'],
        ['Perímetro', formatNumber(r.perimetro, 4) + ' mm']
      ];
      return { kpis, details, figure: r, copy: copiar('Polígono regular (n = ' + r.n + ')', kpis, details) };
    }
  });
}
