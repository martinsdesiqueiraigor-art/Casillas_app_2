// rosca.js (module) — UI do módulo Roscas (interface 2.1)

import {
  PASSOS_METRICA, PASSOS_UNC, PASSOS_UNF, PASSOS_BSW,
  calcularMetrica, calcularPolegada, medidaSobre3Rolos, faixaRolo
} from '../calc/rosca.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { mountCalc, copiar } from './ui/calcKit.js';

let currentTab = 'metrica';

const TABELAS = { unc: PASSOS_UNC, unf: PASSOS_UNF, bsw: PASSOS_BSW };
const TIPOS = { unc: 'UNC', unf: 'UNF', bsw: 'BSW' };
const TIPO_FAIXA = { metrica: 'metrica', unc: 'unc', unf: 'unf', bsw: 'whitworth' };

const MODES = [
  { key: 'metrica', label: 'Métrica', sub: 'Escolha a rosca métrica. O diâmetro do rolo é opcional.' },
  { key: 'unc', label: 'UNC', sub: 'Escolha a rosca UNC (polegada, passo grosso).' },
  { key: 'unf', label: 'UNF', sub: 'Escolha a rosca UNF (polegada, passo fino).' },
  { key: 'bsw', label: 'Whitworth', sub: 'Escolha a rosca Whitworth (BSW).' }
];

function opcoes(key) {
  if (key === 'metrica') return Object.keys(PASSOS_METRICA).map((k) => ({ value: k, label: k + ' × ' + PASSOS_METRICA[k].passo }));
  return Object.keys(TABELAS[key]).map((k) => ({ value: k, label: k + '" × ' + TABELAS[key][k].tpi + ' TPI' }));
}

export function render(container) {
  updateHeader('Roscas', '');
  mountCalc(container, {
    title: 'Roscas',
    initialMode: currentTab,
    onMode: (key) => { currentTab = key; },
    note: 'Valores de tabela. Confira a norma e a tolerância da sua rosca.',
    modes: MODES.map((m) => ({
      key: m.key, label: m.label, sub: m.sub,
      fields: [
        { id: 'rosca-sel', label: m.key === 'metrica' ? 'Rosca métrica' : 'Rosca em polegada', options: opcoes(m.key) },
        { id: 'rosca-rolo', label: 'Diâmetro do rolo (opcional)', unit: 'mm' }
      ]
    })),
    compute(mode, v) {
      const key = v['rosca-sel'];
      let r, passo;
      if (mode === 'metrica') {
        const spec = PASSOS_METRICA[key];
        if (!spec) return null;
        r = calcularMetrica(spec.d, spec.passo);
        passo = spec.passo;
      } else {
        const spec = TABELAS[mode][key];
        if (!spec) return null;
        r = calcularPolegada(spec.d, spec.tpi, TIPOS[mode]);
        passo = 25.4 / spec.tpi;
      }
      if (!r) return { error: 'Não foi possível calcular essa rosca.', ids: ['rosca-sel'] };
      const dw = v['rosca-rolo'];
      let rolos = null, hint;
      const faixa = faixaRolo(passo, TIPO_FAIXA[mode]);
      if (faixa) {
        const base = 'Ideal: ' + faixa.ideal.toFixed(3) + ' mm · Faixa: ' + faixa.min.toFixed(3) + ' a ' + faixa.max.toFixed(3) + ' mm';
        const st = Number.isFinite(dw) && dw > 0 ? faixa.classificar(dw) : null;
        hint = st === 'ideal' ? { tone: 'ok', text: base + '. Rolo dentro da faixa ideal.' }
          : st === 'aviso' ? { tone: 'warn', text: base + '. Rolo fora da faixa ideal; pode haver erro de ±0,02 mm.' }
            : st === 'invalido' ? { tone: 'bad', text: base + '. Rolo muito fora da faixa; o resultado provavelmente está incorreto.' }
              : { tone: 'info', text: base };
      }
      if (Number.isFinite(dw) && dw > 0) rolos = medidaSobre3Rolos(r.d2, r.passo, dw, r.angulo);
      const kpis = [
        { label: 'Diâmetro interno (d1)', value: formatNumber(r.d1, 4), unit: 'mm', main: true },
        { label: 'Passo (P)', value: formatNumber(r.passo, 4), unit: 'mm' },
        { label: 'Diâmetro médio (d2)', value: formatNumber(r.d2, 4), unit: 'mm' }
      ];
      if (rolos) kpis.push({ label: 'Medida sobre 3 rolos (M)', value: formatNumber(rolos.M, 4), unit: 'mm', main: true });
      const details = [
        ['Tipo', r.tipo], ['Ângulo do filete', formatNumber(r.angulo, 1) + '°'],
        ['Diâmetro nominal (d)', formatNumber(r.d, 4) + ' mm'],
        ['Altura H', formatNumber(r.H, 4) + ' mm'], ['Altura h1', formatNumber(r.h1, 4) + ' mm']
      ];
      if (Number.isFinite(r.d3) && r.d3 !== r.d1) details.push(['Diâmetro de fundo (d3)', formatNumber(r.d3, 4) + ' mm']);
      if (Number.isFinite(r.tpi)) details.push(['Fios por polegada (TPI)', String(r.tpi)]);
      return { kpis, details, hint, copy: copiar('Rosca ' + key, kpis, details) };
    }
  });
}
