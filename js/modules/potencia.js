// potencia.js (module) — UI do módulo Potência de Corte (interface 2.1)

import {
  potenciaTorneamento, potenciaFresamento, potenciaFuração, potenciaRoscamento
} from '../calc/potencia.js';
import { formatNumber } from '../utils.js';
import { updateHeader } from '../state.js';
import { mountCalc, copiar } from './ui/calcKit.js';

let currentOp = 'torneamento';

const KC = { id: 'p-kc', label: 'Força específica (Kc)', unit: 'N/mm²', placeholder: '2000' };
const EFF = { id: 'p-eff', label: 'Eficiência (0 a 1, opcional)', placeholder: '0,8' };

const OPS = {
  torneamento: { label: 'Torneamento', sub: 'Informe ap, f, Vc e Kc para estimar a potência.',
    req: [{ id: 'p-ap', label: 'Profundidade (ap)', unit: 'mm' }, { id: 'p-f', label: 'Avanço (f)', unit: 'mm/rev' }, { id: 'p-vc', label: 'Velocidade de corte (Vc)', unit: 'm/min' }, KC],
    calc: (v, e) => potenciaTorneamento(v['p-ap'], v['p-f'], v['p-vc'], v['p-kc'], e) },
  fresamento: { label: 'Fresamento', sub: 'Informe ap, ae, Vf e Kc para estimar a potência.',
    req: [{ id: 'p-ap', label: 'Profundidade (ap)', unit: 'mm' }, { id: 'p-ae', label: 'Largura (ae)', unit: 'mm' }, { id: 'p-vf', label: 'Avanço da mesa (Vf)', unit: 'mm/min' }, KC],
    calc: (v, e) => potenciaFresamento(v['p-ap'], v['p-ae'], v['p-vf'], v['p-kc'], e) },
  furacao: { label: 'Furação', sub: 'Informe d, f, Vc e Kc para estimar a potência.',
    req: [{ id: 'p-d', label: 'Diâmetro (d)', unit: 'mm' }, { id: 'p-f', label: 'Avanço (f)', unit: 'mm/rev' }, { id: 'p-vc', label: 'Velocidade de corte (Vc)', unit: 'm/min' }, KC],
    calc: (v, e) => potenciaFuração(v['p-d'], v['p-f'], v['p-vc'], v['p-kc'], e) },
  roscamento: { label: 'Roscamento', sub: 'Informe d, P, n e Kc para estimar a potência.',
    req: [{ id: 'p-d', label: 'Diâmetro (d)', unit: 'mm' }, { id: 'p-passo', label: 'Passo (P)', unit: 'mm', placeholder: '1,5' }, { id: 'p-n', label: 'Rotação (n)', unit: 'rpm' }, KC],
    calc: (v, e) => potenciaRoscamento(v['p-d'], v['p-passo'], v['p-n'], v['p-kc'], e) }
};

export function render(container) {
  updateHeader('Potência de Corte', '');
  mountCalc(container, {
    title: 'Potência de corte',
    initialMode: currentOp,
    onMode: (key) => { currentOp = key; },
    note: 'Estimativa. Use os dados do fabricante da ferramenta e do material.',
    modes: Object.entries(OPS).map(([key, o]) => ({ key, label: o.label, sub: o.sub, fields: [...o.req, EFF] })),
    compute(mode, v) {
      const o = OPS[mode];
      const ids = o.req.map((f) => f.id);
      if (ids.some((id) => Number.isNaN(v[id]))) return null;
      const neg = ids.filter((id) => v[id] <= 0);
      if (neg.length) return { error: 'Use valores maiores que zero.', ids: neg };
      const e = Number.isFinite(v['p-eff']) && v['p-eff'] > 0 && v['p-eff'] <= 1 ? v['p-eff'] : 0.8;
      const r = o.calc(v, e);
      if (!r) return { error: 'Não foi possível calcular com esses valores. Confira os campos.', ids };
      const kpis = [
        { label: 'Potência no motor', value: formatNumber(r.potenciaMotor, 4), unit: 'kW', main: true },
        { label: 'Potência de corte', value: formatNumber(r.potenciaCorte, 4), unit: 'kW' },
        { label: 'Eficiência aplicada', value: formatNumber(r.eficiencia, 2) }
      ];
      const details = [['Operação', r.operacao]];
      if (Number.isFinite(r.rpm)) details.push(['Rotação sugerida', formatNumber(r.rpm, 1) + ' rpm']);
      if (Number.isFinite(r.forcaCorte)) details.push(['Força de corte', formatNumber(r.forcaCorte, 1) + ' N']);
      if (Number.isFinite(r.forca)) details.push(['Força', formatNumber(r.forca, 1) + ' N']);
      if (Number.isFinite(r.torque)) details.push(['Torque', formatNumber(r.torque, 3) + ' N·m']);
      if (Number.isFinite(r.taxaRemocao)) details.push(['Taxa de remoção', formatNumber(r.taxaRemocao, 2) + ' cm³/min']);
      return { kpis, details, copy: copiar('Potência de corte (' + o.label + ')', kpis, details) };
    }
  });
}
