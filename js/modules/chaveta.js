// chaveta.js (module) — UI do módulo Chaveta DIN 6885

import {
  dimensionarPorEixo,
  verificarCisalhamento,
  verificarEsmagamento,
  comprimentoMinCisalhamento
} from '../calc/chaveta.js';
import { formatNumber, parseInput, createElementSafe, showToast } from '../utils.js';
import { updateKPIs, updateHeader } from '../state.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k of Object.keys(attrs)) el.setAttribute(k, String(attrs[k]));
  return el;
}

function desenharChaveta(dim) {
  const S = 300, H = 130;
  const svg = svgEl('svg', { viewBox: `0 0 ${S} ${H}`, xmlns: SVG_NS });

  // Eixo (bloco)
  const shaftY = 30;
  const shaftH = 70;
  svg.appendChild(svgEl('rect', {
    x: 20, y: shaftY, width: 260, height: shaftH,
    class: 'shaft', rx: 6
  }));

  if (dim) {
    // Chaveta (retângulo laranja no topo do eixo)
    const kw = Math.min(180, 60 + dim.b * 4);
    const kh = Math.min(30, 8 + dim.h * 2);
    const kx = (S - kw) / 2;
    const ky = shaftY - kh / 2;
    svg.appendChild(svgEl('rect', {
      x: kx, y: ky, width: kw, height: kh,
      class: 'key', rx: 3
    }));

    const t1 = svgEl('text', { x: kx + kw / 2, y: ky - 6, 'text-anchor': 'middle' });
    t1.textContent = `${dim.b} × ${dim.h}`;
    svg.appendChild(t1);

    const t2 = svgEl('text', { x: 20, y: H - 8 });
    t2.textContent = `Faixa eixo: ${dim.faixaEixo.min}–${dim.faixaEixo.max} mm`;
    svg.appendChild(t2);
  } else {
    const t = svgEl('text', { x: S / 2, y: H / 2, 'text-anchor': 'middle' });
    t.textContent = 'Informe o diâmetro do eixo';
    svg.appendChild(t);
  }

  return svg;
}

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
  updateHeader('Chaveta DIN 6885', '🔧');

  const card = createElementSafe('div', { class: 'card' });
  card.appendChild(createElementSafe('h2', { class: 'card-title', text: '🔧 Chaveta DIN 6885' }));

  card.appendChild(inputGroup('Diâmetro do eixo (mm)', 'ch-d'));
  card.appendChild(inputGroup('Torque transmitido (N·m)', 'ch-t', '50'));
  card.appendChild(inputGroup('Comprimento da chaveta L (mm)', 'ch-L', '30'));
  card.appendChild(inputGroup('τ admissível (N/mm²)', 'ch-tau', '60'));
  card.appendChild(inputGroup('σ admissível (N/mm²)', 'ch-sigma', '100'));

  card.appendChild(createElementSafe('button', {
    type: 'button', class: 'btn btn-primary', text: 'Calcular',
    onclick: calcular
  }));

  const svgWrap = createElementSafe('div', { class: 'chaveta-svg-wrap' });
  svgWrap.appendChild(desenharChaveta(null));
  card.appendChild(svgWrap);

  const resultWrap = createElementSafe('div');
  card.appendChild(resultWrap);

  container.appendChild(card);

  function calcular() {
    const d = getVal('ch-d');
    if (!Number.isFinite(d) || d <= 0) { showToast('Diâmetro inválido', 'warning'); return; }

    const dim = dimensionarPorEixo(d);
    if (!dim) { showToast('Fora da tabela DIN 6885 (6–230 mm)', 'error'); return; }

    const torque = getVal('ch-t');
    const L = getVal('ch-L');
    const tau = getVal('ch-tau');
    const sigma = getVal('ch-sigma');

    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);

    // Dimensões
    resultWrap.appendChild(resultRow('Largura b', formatNumber(dim.b, 2) + ' mm'));
    resultWrap.appendChild(resultRow('Altura h', formatNumber(dim.h, 2) + ' mm'));
    resultWrap.appendChild(resultRow('Profundidade no eixo t1', formatNumber(dim.t1, 2) + ' mm'));
    resultWrap.appendChild(resultRow('Profundidade no cubo t2', formatNumber(dim.t2, 2) + ' mm'));
    resultWrap.appendChild(resultRow('Faixa do eixo', `${dim.faixaEixo.min}–${dim.faixaEixo.max} mm`));
    resultWrap.appendChild(resultRow('Comprimento sugerido (mm)',
      formatNumber(dim.comprimentoMin, 1) + ' – ' + formatNumber(dim.comprimentoMax, 1), true));

    // Verificações
    if (Number.isFinite(torque) && torque > 0 && Number.isFinite(L) && L > 0) {
      const cis = verificarCisalhamento(torque, d, dim.b, L, Number.isFinite(tau) ? tau : 60);
      const esm = verificarEsmagamento(torque, d, L, dim.t1, Number.isFinite(sigma) ? sigma : 100);
      const Lmin = comprimentoMinCisalhamento(torque, d, dim.b, Number.isFinite(tau) ? tau : 60);

      if (cis) {
        resultWrap.appendChild(resultRow('τ atuante', formatNumber(cis.tensaoCisalhamento, 2) + ' N/mm²'));
        resultWrap.appendChild(resultRow('Coef. segurança (cis.)', formatNumber(cis.coeficienteSeguranca, 2)));
        resultWrap.appendChild(resultRow('Aprovação (cis.)', cis.aprovado ? 'OK' : 'NÃO'));
      }
      if (esm) {
        resultWrap.appendChild(resultRow('σ atuante', formatNumber(esm.tensaoEsmagamento, 2) + ' N/mm²'));
        resultWrap.appendChild(resultRow('Coef. segurança (esm.)', formatNumber(esm.coeficienteSeguranca, 2)));
        resultWrap.appendChild(resultRow('Aprovação (esm.)', esm.aprovado ? 'OK' : 'NÃO'));
      }
      if (Number.isFinite(Lmin)) {
        resultWrap.appendChild(resultRow('L mínimo (cisalhamento)', formatNumber(Lmin, 2) + ' mm'));
      }
    }

    while (svgWrap.firstChild) svgWrap.removeChild(svgWrap.firstChild);
    svgWrap.appendChild(desenharChaveta(dim));

    updateKPIs([
      { label: 'b × h',  value: `${dim.b}×${dim.h}` },
      { label: 't1',     value: formatNumber(dim.t1, 2) + ' mm' },
      { label: 'L min',  value: formatNumber(dim.comprimentoMin, 1) + ' mm' }
    ]);
    showToast('Chaveta dimensionada', 'success');
  }

  updateKPIs([
    { label: 'b × h', value: '—' },
    { label: 't1', value: '—' },
    { label: 'L min', value: '—' }
  ]);
}
