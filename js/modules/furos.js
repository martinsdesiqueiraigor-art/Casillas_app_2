// furos.js (module) — UI do módulo Furação Circular (interface 2.1)

import { calcularFuros, distanciaEntreFuros } from '../calc/furos.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { h, svg } from './guia/ui/dom.js';
import { mountCalc, copiar } from './ui/calcKit.js';

function criarFigura() {
  const raiz = h('div', { role: 'img', 'aria-label': 'Círculo de furos numerados' });
  /** @param {any} r */
  function update(r) {
    const S = 240, cx = S / 2, cy = S / 2, raio = 82, rf = 7;
    const s = svg('svg', { viewBox: `0 0 ${S} ${S}`, 'aria-hidden': 'true', style: 'max-height:240px' });
    s.append(svg('circle', { cx, cy, r: raio, class: 'ck-fig-ax', fill: 'none' }), svg('circle', { cx, cy, r: 2.5, fill: '#93a4b6' }));
    if (r && Array.isArray(r.furos)) {
      for (const f of r.furos) {
        const px = cx + raio * Math.cos(f.anguloRad), py = cy - raio * Math.sin(f.anguloRad);
        s.append(svg('circle', { cx: px, cy: py, r: rf, class: 'ck-fig-body' }),
          svg('text', { x: px, y: py - rf - 4, 'text-anchor': 'middle', class: 'ck-fig-txt', text: String(f.indice) }));
      }
    }
    raiz.replaceChildren(s);
  }
  update(null);
  return { el: raiz, update };
}

export function render(container) {
  updateHeader('Furação Circular', '');
  mountCalc(container, {
    title: 'Furação circular',
    figure: criarFigura,
    modes: [{
      key: 'furos', label: 'Furos', sub: 'Informe o diâmetro do círculo e o número de furos. O ângulo inicial é opcional.',
      fields: [
        { id: 'furos-D', label: 'Diâmetro do círculo', unit: 'mm' },
        { id: 'furos-n', label: 'Número de furos (n)', unit: 'furos' },
        { id: 'furos-a', label: 'Ângulo inicial (opcional)', unit: '°' }
      ]
    }],
    compute(_mode, v) {
      const D = v['furos-D'], n = v['furos-n'];
      const a = Number.isNaN(v['furos-a']) ? 0 : v['furos-a'];
      if (Number.isNaN(D) || Number.isNaN(n)) return null;
      if (D <= 0) return { error: 'O diâmetro deve ser maior que zero.', ids: ['furos-D'] };
      if (!Number.isInteger(n) || n < 2) return { error: 'O número de furos deve ser um inteiro maior ou igual a 2.', ids: ['furos-n'] };
      const r = calcularFuros(D, n, a);
      if (!r) return { error: 'Não foi possível calcular com esses valores. Confira os campos.', ids: ['furos-D', 'furos-n', 'furos-a'] };
      const corda = distanciaEntreFuros(D, n);
      const kpis = [
        { label: 'Passo angular', value: formatNumber(r.passoAngular, 4), unit: '°', main: true },
        { label: 'Furos', value: String(n) },
        { label: 'Corda entre furos', value: formatNumber(corda, 3), unit: 'mm' }
      ];
      const details = [
        ['Diâmetro', formatNumber(D, 3) + ' mm'], ['Raio', formatNumber(r.R, 3) + ' mm'],
        ['Ângulo inicial', formatNumber(a, 4) + '°']
      ];
      const table = {
        title: 'Coordenadas dos furos', head: ['#', 'Ângulo (°)', 'X (mm)', 'Y (mm)'],
        rows: r.furos.map((f) => [String(f.indice), formatNumber(f.anguloGraus, 3), formatNumber(Math.abs(f.x) < 1e-9 ? 0 : f.x, 3), formatNumber(Math.abs(f.y) < 1e-9 ? 0 : f.y, 3)])
      };
      const linhas = table.rows.map((l) => l.join('  ')).join('\n');
      return { kpis, details, table, figure: r, copy: copiar('Furação circular', kpis, details) + '\n' + table.head.join('  ') + '\n' + linhas };
    }
  });
}
