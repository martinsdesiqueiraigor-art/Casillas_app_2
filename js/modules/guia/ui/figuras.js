// @ts-check
// Ilustrações do Guia em SVG. Conceituais, ampliadas e sem escala real.
import { svg } from './dom.js';

const CORES = { peca: '#16304d', borda: '#4aa3ff', laranja: '#ff7a1a', fundo: '#1c2e44', escuro: '#060a0f', mudo: '#93a4b6', aco: '#3a4b5e' };

/** @param {number} x @param {number} y @param {string} texto @param {Record<string,string|number>} [extra] */
function texto(x, y, texto, extra = {}) {
  return svg('text', { x, y, fill: CORES.mudo, 'font-size': 11, ...extra }, texto);
}

/** Eixo escalonado com trecho roscado (visão geral). */
export function ilustracaoEixo() {
  const fios = Array.from({ length: 15 }, (_, i) => svg('path', { d: `M${186 + i * 6.4} 62V108` }));
  return svg('svg', { viewBox: '0 0 360 170', role: 'img', 'aria-label': 'Eixo escalonado com trecho roscado', class: 'gx-fig' },
    svg('line', { x1: 12, y1: 85, x2: 348, y2: 85, stroke: CORES.aco, 'stroke-dasharray': '7 6' }),
    svg('path', { d: 'M24 26H64V34H78V50H118V58L130 58V50L172 50V58H180V112H172V120H130V112H118V120H78V136H64V144H24Z', fill: CORES.peca, stroke: CORES.borda }),
    svg('path', { d: 'M64 34V136M78 50V120M118 50V120M172 50V120', stroke: CORES.borda, opacity: '.55', fill: 'none' }),
    svg('path', { d: 'M180 60V110', stroke: CORES.borda, fill: 'none' }),
    svg('path', { d: 'M180 62H280V108H180Z', fill: CORES.peca, stroke: CORES.borda }),
    svg('g', { stroke: CORES.borda, fill: 'none', opacity: '.85' }, ...fios),
    svg('path', { d: 'M280 70H330V100H280Z', fill: CORES.peca, stroke: CORES.borda }),
    texto(348, 160, 'Ilustração conceitual', { 'text-anchor': 'end', 'font-size': 10 }));
}

/** @param {number} x @param {number} y */
function ferramenta(x, y) {
  return svg('polygon', {
    points: `${x},${y} ${x + 22},${y - 6} ${x + 22},${y - 30} ${x + 58},${y - 30} ${x + 58},${y - 8} ${x + 30},${y + 4}`,
    fill: '#6b5a2a', stroke: '#ffb35c'
  });
}

function peca() {
  return [
    svg('rect', { x: 30, y: 52, width: 40, height: 46, fill: CORES.aco }),
    svg('rect', { x: 70, y: 62, width: 190, height: 36, fill: CORES.peca, stroke: CORES.borda }),
    svg('line', { x1: 12, y1: 98, x2: 348, y2: 98, stroke: CORES.aco, 'stroke-dasharray': '6 5' })
  ];
}

/** Miniaturas dos três passos do exemplo (aproximação, passes, retirada). @param {number} indice */
export function miniaturaPasso(indice) {
  const base = peca();
  /** @type {SVGElement[]} */
  let extra;
  if (indice === 0) {
    extra = [ferramenta(290, 34),
      svg('path', { d: 'M300 20H190', stroke: CORES.laranja, 'stroke-dasharray': '5 4', fill: 'none' }),
      svg('path', { d: 'M196 15l-8 5 8 5', stroke: CORES.laranja, fill: 'none' }),
      texto(12, 20, 'Ferramenta fora do material')];
  } else if (indice === 1) {
    extra = [svg('g', { stroke: CORES.borda, fill: 'none' },
      svg('path', { d: 'M150 62l5 -8 5 8M162 62l5 -8 5 8M174 62l5 -8 5 8M186 62l5 -8 5 8M198 62l5 -8 5 8M210 62l5 -8 5 8' })),
      svg('path', { d: 'M250 40H100', stroke: CORES.borda, 'stroke-width': 2.5 }),
      ferramenta(240, 48),
      texto(12, 20, 'Passes do ciclo sobre o perfil')];
  } else {
    extra = [svg('path', { d: 'M290 40V14H320', stroke: CORES.laranja, 'stroke-dasharray': '5 4', fill: 'none' }),
      ferramenta(290, 44),
      texto(12, 20, 'Retirada para a posição segura')];
  }
  return svg('svg', { viewBox: '0 0 360 110', role: 'img', 'aria-label': `Ilustração do passo ${indice + 1}`, class: 'gx-fig' }, ...base, ...extra);
}

/**
 * Corte transversal do filete no passe atual (ampliado).
 * @param {import('../trajetoria.js').Trajetoria} t
 * @param {import('../trajetoria.js').Passe[]} passes @param {number} indice 1..N
 */
export function figuraCorte(t, passes, indice) {
  const escala = 80, cx = 180, y0 = 34;
  /** @param {number} d */
  const tri = (d) => {
    const alt = d / 1000 * escala, w = 0.577 * alt;
    return `${cx - w},${y0} ${cx + w},${y0} ${cx},${y0 + alt}`;
  };
  const atual = passes[indice - 1];
  const anterior = indice > 1 ? passes[indice - 2].d : 0;
  const ponta = y0 + atual.d / 1000 * escala;
  const feitos = passes.slice(0, indice - 1).map((p) =>
    svg('polygon', { points: tri(p.d), fill: 'none', stroke: CORES.borda, 'stroke-opacity': '.4' }));
  return svg('svg', { viewBox: '0 0 360 170', role: 'img', 'aria-label': `Corte transversal do filete no passe ${indice}`, class: 'gx-fig' },
    svg('rect', { x: 0, y: y0, width: 360, height: 170 - y0, fill: CORES.fundo }),
    svg('polygon', { points: tri(atual.d), fill: '#ff7a1a66' }),
    anterior ? svg('polygon', { points: tri(anterior), fill: CORES.escuro }) : null,
    ...feitos,
    svg('polygon', { points: tri(atual.d), fill: 'none', stroke: CORES.laranja, 'stroke-width': 2 }),
    svg('polygon', { points: tri(t.k), fill: 'none', stroke: '#eef3f8', 'stroke-dasharray': '4 4', 'stroke-opacity': '.6' }),
    svg('line', { x1: 0, x2: 360, y1: y0, y2: y0, stroke: CORES.mudo }),
    svg('polygon', { points: `${cx},${ponta} ${cx - 18},${ponta - 32} ${cx + 18},${ponta - 32}`, fill: CORES.laranja }),
    texto(8, 18, 'Corte transversal do filete (ampliado)'),
    texto(352, 164, 'Tracejado: perfil final', { 'text-anchor': 'end', 'font-size': 10 }));
}

/**
 * Vista lateral da trajetória da ferramenta no passe atual.
 * @param {import('../trajetoria.js').Passe[]} passes @param {number} indice 1..N
 */
export function figuraTrajetoria(passes, indice) {
  const atual = passes[indice - 1];
  const dy = atual.d / 1000 * 20, yc = 70 + dy;
  return svg('svg', { viewBox: '0 0 360 120', role: 'img', 'aria-label': `Trajetória da ferramenta no passe ${indice}`, class: 'gx-fig' },
    svg('rect', { x: 14, y: 40, width: 24, height: 76, fill: CORES.aco }),
    svg('rect', { x: 38, y: 70, width: 302, height: 46, fill: CORES.fundo }),
    svg('rect', { x: 80, y: 70, width: 240, height: dy, fill: CORES.escuro, stroke: CORES.borda, 'stroke-opacity': '.4' }),
    svg('path', { d: `M320 36V${yc}`, stroke: CORES.laranja, 'stroke-dasharray': '5 4', fill: 'none' }),
    svg('path', { d: `M320 ${yc}H80L66 48`, stroke: CORES.borda, 'stroke-width': 2.5, fill: 'none' }),
    svg('path', { d: 'M66 48V36H320', stroke: CORES.laranja, 'stroke-dasharray': '5 4', fill: 'none' }),
    svg('polygon', { points: `320,${yc} 310,${yc - 18} 330,${yc - 18}`, fill: CORES.laranja }),
    texto(8, 14, 'Vista lateral: trajetória da ferramenta'),
    texto(14, 34, 'Mandril', { 'font-size': 10 }),
    texto(130, 62, 'Corte com avanço F (para o mandril)', { fill: CORES.borda }),
    texto(130, 30, 'Retorno rápido', { fill: CORES.laranja }));
}
