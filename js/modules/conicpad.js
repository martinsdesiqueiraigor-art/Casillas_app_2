// conicpad.js (module) — UI do módulo Conicidades Padrão (interface 2.1)

import { CONICIDADES } from '../data/conicidades.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { mountCalc, copiar } from './ui/calcKit.js';

let currentGrupo = 'morse';

const GRUPOS = [
  { key: 'morse', label: 'Morse' },
  { key: 'jarno', label: 'Jarno' },
  { key: 'bs', label: 'Brown & Sharpe' }
];

export function render(container) {
  updateHeader('Conicidades Padrão', '');
  mountCalc(container, {
    title: 'Conicidades padrão',
    initialMode: currentGrupo,
    onMode: (key) => { currentGrupo = key; },
    note: 'Valores de tabela. Confira na norma do seu cone.',
    modes: GRUPOS.map((g) => ({
      key: g.key, label: g.label, sub: 'Escolha o cone para ver as medidas.',
      fields: [{ id: 'conic-sel', label: 'Conicidade', options: (CONICIDADES[g.key] || []).map((c) => ({ value: c.nome, label: c.nome })) }]
    })),
    compute(mode, v) {
      const itens = CONICIDADES[mode] || [];
      const it = itens.find((c) => c.nome === v['conic-sel']);
      if (!it) return null;
      const kpis = [
        { label: 'Relação de conicidade', value: it.relacao, main: true },
        { label: 'Diâmetro menor (d)', value: formatNumber(it.d, 4), unit: 'mm' },
        { label: 'Diâmetro maior (D)', value: formatNumber(it.D, 4), unit: 'mm' },
        { label: 'Comprimento (L)', value: formatNumber(it.L, 3), unit: 'mm' }
      ];
      const details = [['Diferença D − d', formatNumber(it.D - it.d, 4) + ' mm']];
      const table = {
        title: 'Todos os cones', head: ['Nome', 'd', 'D', 'L', 'Relação'],
        rows: itens.map((c) => [c.nome, formatNumber(c.d, 3), formatNumber(c.D, 3), formatNumber(c.L, 1), c.relacao])
      };
      return { kpis, details, table, copy: copiar('Conicidade padrão ' + it.nome, kpis, details) };
    }
  });
}
