// potencia.js (module) — UI do módulo Potência de Corte

import {
  calcularRPM, potenciaTorneamento, potenciaFresamento,
  potenciaFuração, potenciaRoscamento
} from '../calc/potencia.js';
import { formatNumber, parseInput, createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

let currentOp = 'torneamento';

function resultRow(label, value, primary = false) {
  return createElementSafe('div', { class: primary ? 'result-row result-row--primary' : 'result-row' }, [
    createElementSafe('span', { class: 'result-label', text: label }),
    createElementSafe('span', { class: 'result-value', text: value })
  ]);
}

function inputGroup(label, id, placeholder) {
  const g = createElementSafe('div', { class: 'input-group' }, [
    createElementSafe('label', { for: id, text: label })
  ]);
  const wrap = createElementSafe('div', { class: 'input-with-clear' }, [
    createElementSafe('input', {
      id, class: 'input', type: 'text', inputmode: 'decimal',
      placeholder: placeholder || '0', autocomplete: 'off', spellcheck: 'false'
    }),
    createElementSafe('button', {
      type: 'button', class: 'clear-btn', 'aria-label': 'Limpar', text: '✕',
      onclick: () => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }
      }
    })
  ]);
  g.appendChild(wrap);
  return g;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? parseInput(el.value) : NaN;
}

export function render(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
  updateHeader('Potência de Corte', '⚡');

  const card = createElementSafe('div', { class: 'card' });
  card.appendChild(createElementSafe('h2', { class: 'card-title', text: 'Potência de Corte' }));

  const tabs = createElementSafe('div', { class: 'rosca-tabs' });
  const tabList = [
    { key: 'torneamento', label: 'Torneamento' },
    { key: 'fresamento',  label: 'Fresamento' },
    { key: 'furacao',     label: 'Furação' },
    { key: 'roscamento',  label: 'Roscamento' }
  ];
  tabList.forEach((t) => {
    const btn = createElementSafe('button', {
      type: 'button',
      class: 'rosca-tab' + (currentOp === t.key ? ' active' : ''),
      text: t.label,
      onclick: (ev) => {
        currentOp = t.key;
        ev.target.parentElement.querySelectorAll('.rosca-tab').forEach((b) => b.classList.remove('active'));
        ev.target.classList.add('active');
        renderFields();
      }
    });
    tabs.appendChild(btn);
  });
  card.appendChild(tabs);

  const fieldsWrap = createElementSafe('div');
  card.appendChild(fieldsWrap);

  card.appendChild(createElementSafe('button', {
    type: 'button', class: 'btn btn-primary', text: 'Calcular',
    onclick: calcular
  }));

  const resultWrap = createElementSafe('div');
  card.appendChild(resultWrap);

  container.appendChild(card);

  function renderFields() {
    while (fieldsWrap.firstChild) fieldsWrap.removeChild(fieldsWrap.firstChild);

    if (currentOp === 'torneamento') {
      fieldsWrap.appendChild(inputGroup('Profundidade ap (mm)', 'p-ap'));
      fieldsWrap.appendChild(inputGroup('Avanço f (mm/rev)', 'p-f'));
      fieldsWrap.appendChild(inputGroup('Velocidade de corte Vc (m/min)', 'p-vc'));
      fieldsWrap.appendChild(inputGroup('Força específica Kc (N/mm²)', 'p-kc', '2000'));
      fieldsWrap.appendChild(inputGroup('Eficiência (0–1)', 'p-eff', '0.8'));
    } else if (currentOp === 'fresamento') {
      fieldsWrap.appendChild(inputGroup('Profundidade ap (mm)', 'p-ap'));
      fieldsWrap.appendChild(inputGroup('Largura ae (mm)', 'p-ae'));
      fieldsWrap.appendChild(inputGroup('Avanço da mesa Vf (mm/min)', 'p-vf'));
      fieldsWrap.appendChild(inputGroup('Força específica Kc (N/mm²)', 'p-kc', '2000'));
      fieldsWrap.appendChild(inputGroup('Eficiência (0–1)', 'p-eff', '0.8'));
    } else if (currentOp === 'furacao') {
      fieldsWrap.appendChild(inputGroup('Diâmetro d (mm)', 'p-d'));
      fieldsWrap.appendChild(inputGroup('Avanço f (mm/rev)', 'p-f'));
      fieldsWrap.appendChild(inputGroup('Velocidade de corte Vc (m/min)', 'p-vc'));
      fieldsWrap.appendChild(inputGroup('Força específica Kc (N/mm²)', 'p-kc', '2000'));
      fieldsWrap.appendChild(inputGroup('Eficiência (0–1)', 'p-eff', '0.8'));
    } else {
      fieldsWrap.appendChild(inputGroup('Diâmetro d (mm)', 'p-d'));
      fieldsWrap.appendChild(inputGroup('Passo P (mm)', 'p-passo', '1.5'));
      fieldsWrap.appendChild(inputGroup('Rotação n (rpm)', 'p-n'));
      fieldsWrap.appendChild(inputGroup('Força específica Kc (N/mm²)', 'p-kc', '2000'));
      fieldsWrap.appendChild(inputGroup('Eficiência (0–1)', 'p-eff', '0.8'));
    }
  }

  function getEff() {
    const e = getVal('p-eff');
    return Number.isFinite(e) && e > 0 && e <= 1 ? e : 0.8;
  }

  function calcular() {
    let res = null;

    if (currentOp === 'torneamento') {
      const ap = getVal('p-ap'), f = getVal('p-f'), vc = getVal('p-vc'), kc = getVal('p-kc');
      if (![ap, f, vc, kc].every(Number.isFinite)) { showToast('Preencha ap, f, Vc, Kc', 'warning'); return; }
      res = potenciaTorneamento(ap, f, vc, kc, getEff());
    } else if (currentOp === 'fresamento') {
      const ap = getVal('p-ap'), ae = getVal('p-ae'), vf = getVal('p-vf'), kc = getVal('p-kc');
      if (![ap, ae, vf, kc].every(Number.isFinite)) { showToast('Preencha ap, ae, Vf, Kc', 'warning'); return; }
      res = potenciaFresamento(ap, ae, vf, kc, getEff());
    } else if (currentOp === 'furacao') {
      const d = getVal('p-d'), f = getVal('p-f'), vc = getVal('p-vc'), kc = getVal('p-kc');
      if (![d, f, vc, kc].every(Number.isFinite)) { showToast('Preencha d, f, Vc, Kc', 'warning'); return; }
      res = potenciaFuração(d, f, vc, kc, getEff());
    } else {
      const d = getVal('p-d'), passo = getVal('p-passo'), n = getVal('p-n'), kc = getVal('p-kc');
      if (![d, passo, n, kc].every(Number.isFinite)) { showToast('Preencha d, P, n, Kc', 'warning'); return; }
      res = potenciaRoscamento(d, passo, n, kc, getEff());
    }

    if (!res) { showToast('Dados inválidos', 'error'); return; }

    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);
    resultWrap.appendChild(resultRow('Operação', res.operacao));
    if (Number.isFinite(res.rpm)) resultWrap.appendChild(resultRow('Rotação sugerida', formatNumber(res.rpm, 1) + ' rpm'));
    if (Number.isFinite(res.forcaCorte)) resultWrap.appendChild(resultRow('Força de corte', formatNumber(res.forcaCorte, 1) + ' N'));
    if (Number.isFinite(res.forca)) resultWrap.appendChild(resultRow('Força', formatNumber(res.forca, 1) + ' N'));
    if (Number.isFinite(res.torque)) resultWrap.appendChild(resultRow('Torque', formatNumber(res.torque, 3) + ' N·m'));
    if (Number.isFinite(res.taxaRemocao)) resultWrap.appendChild(resultRow('Taxa de remoção', formatNumber(res.taxaRemocao, 2) + ' cm³/min'));
    resultWrap.appendChild(resultRow('Potência de corte', formatNumber(res.potenciaCorte, 4) + ' kW'));
    resultWrap.appendChild(resultRow('Potência no motor', formatNumber(res.potenciaMotor, 4) + ' kW', true));
    resultWrap.appendChild(resultRow('Eficiência aplicada', formatNumber(res.eficiencia, 2)));

    updateKPIs([
      { label: 'P corte', value: formatNumber(res.potenciaCorte, 3) + ' kW' },
      { label: 'P motor', value: formatNumber(res.potenciaMotor, 3) + ' kW' },
      { label: 'η',       value: formatNumber(res.eficiencia, 2) }
    ]);
    showToast('Potência calculada', 'success');
  }

  renderFields();
  updateKPIs([
    { label: 'P corte', value: '—' },
    { label: 'P motor', value: '—' },
    { label: 'η', value: '—' }
  ]);
}
