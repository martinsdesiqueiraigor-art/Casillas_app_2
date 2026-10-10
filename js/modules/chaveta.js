// chaveta.js (module) — UI do módulo Chaveta DIN 6885 (interface 2.1)

import {
  dimensionarPorEixo, verificarCisalhamento, verificarEsmagamento, comprimentoMinCisalhamento
} from '../calc/chaveta.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { h, svg } from './guia/ui/dom.js';
import { mountCalc, copiar } from './ui/calcKit.js';

function criarFigura() {
  const raiz = h('div', { role: 'img', 'aria-label': 'Chaveta no rasgo do eixo' });
  /** @param {any} dim */
  function update(dim) {
    const S = 300, H = 130, shaftY = 36;
    const s = svg('svg', { viewBox: `0 0 ${S} ${H}`, 'aria-hidden': 'true' });
    s.appendChild(svg('rect', { x: 20, y: shaftY, width: 260, height: 70, rx: 6, class: 'ck-fig-body', style: 'stroke:#4aa3ff' }));
    if (dim) {
      const kw = Math.min(180, 60 + dim.b * 4), kh = Math.min(30, 8 + dim.h * 2), kx = (S - kw) / 2, ky = shaftY - kh / 2;
      s.append(
        svg('rect', { x: kx, y: ky, width: kw, height: kh, rx: 3, class: 'ck-fig-body' }),
        svg('text', { x: kx + kw / 2, y: ky - 6, 'text-anchor': 'middle', class: 'ck-fig-txt', text: dim.b + ' × ' + dim.h }),
        svg('text', { x: 20, y: H - 8, class: 'ck-fig-txt', text: 'Faixa do eixo: ' + dim.faixaEixo.min + '–' + dim.faixaEixo.max + ' mm' }));
    } else {
      s.appendChild(svg('text', { x: S / 2, y: H / 2 + 10, 'text-anchor': 'middle', class: 'ck-fig-txt', text: 'Informe o diâmetro do eixo' }));
    }
    raiz.replaceChildren(s);
  }
  update(null);
  return { el: raiz, update };
}

export function render(container) {
  updateHeader('Chaveta DIN 6885', '');
  mountCalc(container, {
    title: 'Chaveta DIN 6885',
    figure: criarFigura,
    note: 'Verificação simplificada. Confirme com a norma e com o projeto.',
    modes: [{
      key: 'ch', label: 'Chaveta', sub: 'Informe o diâmetro do eixo. Torque e comprimento ativam a verificação de tensões.',
      fields: [
        { id: 'ch-d', label: 'Diâmetro do eixo', unit: 'mm' },
        { id: 'ch-t', label: 'Torque (opcional)', unit: 'N·m', placeholder: '50' },
        { id: 'ch-L', label: 'Comprimento da chaveta (L)', unit: 'mm', placeholder: '30' },
        { id: 'ch-tau', label: 'τ admissível (opcional)', unit: 'N/mm²', placeholder: '60' },
        { id: 'ch-sigma', label: 'σ admissível (opcional)', unit: 'N/mm²', placeholder: '100' }
      ]
    }],
    compute(_mode, v) {
      const d = v['ch-d'];
      if (Number.isNaN(d)) return null;
      if (d <= 0) return { error: 'O diâmetro deve ser maior que zero.', ids: ['ch-d'] };
      const dim = dimensionarPorEixo(d);
      if (!dim) return { error: 'Diâmetro fora da tabela DIN 6885 (6 a 230 mm).', ids: ['ch-d'] };
      const torque = v['ch-t'], L = v['ch-L'];
      const tau = Number.isFinite(v['ch-tau']) ? v['ch-tau'] : 60;
      const sigma = Number.isFinite(v['ch-sigma']) ? v['ch-sigma'] : 100;
      const kpis = [
        { label: 'Chaveta b × h', value: dim.b + ' × ' + dim.h, unit: 'mm', main: true },
        { label: 'Profundidade no eixo (t1)', value: formatNumber(dim.t1, 2), unit: 'mm' },
        { label: 'Comprimento sugerido', value: formatNumber(dim.comprimentoMin, 1) + ' – ' + formatNumber(dim.comprimentoMax, 1), unit: 'mm' }
      ];
      const details = [
        ['Largura b', formatNumber(dim.b, 2) + ' mm'], ['Altura h', formatNumber(dim.h, 2) + ' mm'],
        ['Profundidade no cubo (t2)', formatNumber(dim.t2, 2) + ' mm'],
        ['Faixa do eixo', dim.faixaEixo.min + '–' + dim.faixaEixo.max + ' mm']
      ];
      if (Number.isFinite(torque) && torque > 0 && Number.isFinite(L) && L > 0) {
        const cis = verificarCisalhamento(torque, d, dim.b, L, tau);
        const esm = verificarEsmagamento(torque, d, L, dim.t1, sigma);
        const Lmin = comprimentoMinCisalhamento(torque, d, dim.b, tau);
        if (cis) details.push(['τ atuante', formatNumber(cis.tensaoCisalhamento, 2) + ' N/mm²'], ['Coef. de segurança (cisalhamento)', formatNumber(cis.coeficienteSeguranca, 2)], ['Cisalhamento', cis.aprovado ? 'Aprovado' : 'Reprovado']);
        if (esm) details.push(['σ atuante', formatNumber(esm.tensaoEsmagamento, 2) + ' N/mm²'], ['Coef. de segurança (esmagamento)', formatNumber(esm.coeficienteSeguranca, 2)], ['Esmagamento', esm.aprovado ? 'Aprovado' : 'Reprovado']);
        if (Number.isFinite(Lmin)) details.push(['L mínimo (cisalhamento)', formatNumber(Lmin, 2) + ' mm']);
      }
      return { kpis, details, figure: dim, copy: copiar('Chaveta DIN 6885 (eixo ' + formatNumber(d, 1) + ' mm)', kpis, details) };
    }
  });
}
