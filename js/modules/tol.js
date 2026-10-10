// tol.js (module) — UI do módulo Tolerâncias ISO 286 (interface 2.1)

import { calcularTolerancia, listarClasses, analisarAjuste } from '../calc/tol.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { mountCalc, copiar } from './ui/calcKit.js';

let currentTab = 'simples';

export function render(container) {
  updateHeader('Tolerâncias ISO', '');
  const classes = listarClasses();
  const op = (lista) => lista.map((c) => ({ value: c.key, label: c.label }));
  const furos = classes.filter((c) => c.tipo === 'furo');
  const eixos = classes.filter((c) => c.tipo === 'eixo');

  mountCalc(container, {
    title: 'Tolerâncias ISO 286',
    initialMode: currentTab,
    onMode: (key) => { currentTab = key; },
    note: 'Valores da ISO 286. Confira a faixa de medida e o ajuste na norma.',
    modes: [
      { key: 'simples', label: 'Tolerância', sub: 'Informe a dimensão nominal e a classe para ver os limites.',
        fields: [{ id: 'tol-nom', label: 'Dimensão nominal', unit: 'mm' }, { id: 'tol-classe', label: 'Classe', options: op(classes) }] },
      { key: 'ajuste', label: 'Ajuste', sub: 'Informe a dimensão nominal, o furo e o eixo para ver a folga.',
        fields: [{ id: 'tol-nom', label: 'Dimensão nominal', unit: 'mm' }, { id: 'tol-furo', label: 'Furo', options: op(furos) }, { id: 'tol-eixo', label: 'Eixo', options: op(eixos) }] }
    ],
    compute(mode, v) {
      const nom = v['tol-nom'];
      if (Number.isNaN(nom)) return null;
      if (nom <= 0) return { error: 'A dimensão nominal deve ser maior que zero.', ids: ['tol-nom'] };
      if (mode === 'simples') {
        const r = calcularTolerancia(nom, '', v['tol-classe']);
        if (!r) return { error: 'Classe não suportada para essa faixa de medida.', ids: ['tol-nom', 'tol-classe'] };
        const kpis = [
          { label: 'Tolerância', value: formatNumber(r.tolerancia, 4), unit: 'mm', main: true },
          { label: 'Mínimo', value: formatNumber(r.minimo, 4), unit: 'mm' },
          { label: 'Máximo', value: formatNumber(r.maximo, 4), unit: 'mm' }
        ];
        const details = [
          ['Classe', r.classe], ['Descrição', r.descricao], ['Nominal', formatNumber(r.nominal, 4) + ' mm'],
          ['Afastamento inferior (ei)', formatNumber(r.ei, 2) + ' µm'], ['Afastamento superior (es)', formatNumber(r.es, 2) + ' µm'],
          ['Tolerância', formatNumber(r.toleranciaUm, 2) + ' µm']
        ];
        return { kpis, details, copy: copiar('Tolerância ' + r.classe + ' (' + formatNumber(r.nominal, 3) + ' mm)', kpis, details) };
      }
      const r = analisarAjuste(nom, v['tol-furo'], v['tol-eixo']);
      if (!r) return { error: 'Ajuste não suportado para essa medida.', ids: ['tol-nom', 'tol-furo', 'tol-eixo'] };
      const kpis = [
        { label: 'Tipo de ajuste', value: r.tipoAjuste, main: true },
        { label: 'Folga mínima', value: formatNumber(r.folgaMin, 4), unit: 'mm' },
        { label: 'Folga máxima', value: formatNumber(r.folgaMax, 4), unit: 'mm' }
      ];
      const details = [
        ['Furo ' + r.furo.classe, formatNumber(r.furo.minimo, 4) + ' / ' + formatNumber(r.furo.maximo, 4) + ' mm'],
        ['Eixo ' + r.eixo.classe, formatNumber(r.eixo.minimo, 4) + ' / ' + formatNumber(r.eixo.maximo, 4) + ' mm']
      ];
      return { kpis, details, copy: copiar('Ajuste ' + r.furo.classe + '/' + r.eixo.classe + ' (' + formatNumber(nom, 3) + ' mm)', kpis, details) };
    }
  });
}
