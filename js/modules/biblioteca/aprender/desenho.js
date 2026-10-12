// desenho.js — Desenho SVG da peça e dos passes (modelo didático).
// CAS22-BIB-APRENDER-PILOTO-01 · elementos criados com createElementNS,
// sem HTML interpretado. Cores vêm do CSS (classes capr-svg-*), com os
// tokens --cbib-* da Biblioteca.

import { PECA, calcularPasses } from './trajetoria.js';

const NS = 'http://www.w3.org/2000/svg';

/** @param {string} tag @param {Record<string, string|number|null|undefined|false>} [attrs] @param {...(Node|string|null|false)} filhos */
export function s(tag, attrs = {}, ...filhos) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) el.setAttribute(k, String(v));
  for (const f of filhos.flat()) if (f != null && f !== false) el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  return el;
}

const X = (z) => 330 - z * 2.8;
const Y = (r) => 180 - r * 4.6;
const EIXO = 180;

/** Polígono da metade superior de um perfil em degraus. */
function poligono(degraus, comprimento) {
  const pts = [[X(0), EIXO]];
  for (const d of degraus) {
    pts.push([X(d.zIni), Y(d.r)]);
    pts.push([X(d.zFim), Y(d.r)]);
  }
  pts.push([X(comprimento), EIXO]);
  return pts.map((p) => p.map((v) => Math.round(v * 10) / 10).join(',')).join(' ');
}

/** Caminho do acabamento: segue o perfil da face direita até a placa. */
function caminhoPerfil(degraus) {
  const partes = [`M${X(-6)} ${Y(degraus[0].r)}`];
  for (const d of degraus.slice(0, -1)) {
    partes.push(`L${X(d.zIni)} ${Y(d.r)}`, `L${X(d.zFim)} ${Y(d.r)}`);
  }
  const ultimo = degraus[degraus.length - 1];
  partes.push(`L${X(ultimo.zIni)} ${Y(ultimo.r)}`);
  return partes.join(' ');
}

function rotulo(x, y, texto, ancora = 'start', cls = 'capr-svg-rotulo') {
  return s('text', { x, y, 'text-anchor': ancora, class: cls }, texto);
}

/**
 * @param {{
 *   modo: 'trajetoria'|'ilustracao'|'regioes',
 *   profundidade?: number, sobremetal?: number,
 *   passe?: number,            // 0 = antes do primeiro passe; n+1 = acabamento concluído
 *   destaque?: string|null,
 *   titulo?: string,
 * }} o
 */
export function desenharPeca(o) {
  const profundidade = o.profundidade ?? 5;
  const sobremetal = o.sobremetal ?? 2;
  const { passes, perfil } = calcularPasses({ profundidade, sobremetal });
  const n = passes.length;
  const passe = o.modo === 'trajetoria' ? Math.max(0, Math.min(o.passe ?? 0, n + 1)) : (o.modo === 'regioes' ? 1 : n);
  const acabado = o.modo === 'trajetoria' && passe === n + 1;
  const d = o.destaque || null;
  const L = PECA.comprimento;
  const R = PECA.raioBruto;

  const svg = s('svg', {
    viewBox: '0 0 360 214', class: 'capr-desenho', role: 'img',
    'aria-label': o.titulo || 'Desenho didático da peça e dos passes de desbaste',
  });

  // Placa (fixação) e linha de centro.
  svg.append(
    s('rect', { x: 18, y: Y(R + 6), width: X(L) - 18, height: EIXO - Y(R + 6), rx: 3, class: 'capr-svg-placa' }),
    s('line', { x1: 10, y1: EIXO, x2: 350, y2: EIXO, class: 'capr-svg-centro' }),
  );

  // Material do bruto ainda não removido.
  svg.append(s('rect', {
    x: X(L), y: Y(R), width: X(0) - X(L), height: EIXO - Y(R),
    class: 'capr-svg-estoque' + (d === 'bruto' ? ' is-destaque' : ''),
  }));

  // Passes já executados: material removido.
  passes.forEach((p, i) => {
    const feito = i + 1 < passe || (o.modo !== 'trajetoria' && o.modo !== 'regioes') || acabado;
    const atual = o.modo === 'trajetoria' ? i + 1 === passe : (o.modo === 'regioes' && i === 0);
    if (!feito && !atual) return;
    svg.append(s('rect', {
      x: X(p.zFim), y: Y(p.yAnterior), width: X(0) - X(p.zFim), height: Y(p.y) - Y(p.yAnterior),
      class: atual ? 'capr-svg-passe' + (d === 'passe' || o.modo === 'regioes' ? ' is-destaque' : '') : 'capr-svg-removido',
    }));
  });

  // Sobremetal (perfil deslocado) e peça.
  if (sobremetal > 0 && !acabado) {
    svg.append(s('polygon', { points: poligono(perfil, L), class: 'capr-svg-sobremetal' + (d === 'sobremetal' ? ' is-destaque' : '') }));
  }
  svg.append(s('polygon', { points: poligono(PECA.degraus, L), class: 'capr-svg-peca' + (d === 'perfil' ? ' is-destaque' : '') }));

  // Contorno do bruto.
  svg.append(s('rect', {
    x: X(L), y: Y(R), width: X(0) - X(L), height: EIXO - Y(R),
    class: 'capr-svg-contorno' + (d === 'bruto' ? ' is-destaque' : ''),
  }));

  // Ponto de aproximação.
  const ax = X(-8), ay = Y(R + 4);
  if (o.modo !== 'regioes') svg.append(s('circle', { cx: ax, cy: ay, r: d === 'aproximacao' ? 6 : 4, class: 'capr-svg-aprox' + (d === 'aproximacao' ? ' is-destaque' : '') }));

  // Trajetória do passe atual (trajetoria) ou do acabamento.
  if (o.modo === 'trajetoria' && passe >= 1 && passe <= n) {
    const p = passes[passe - 1];
    svg.append(
      s('path', { d: `M${ax} ${ay} L${ax} ${Y(p.y)} L${X(0) + 4} ${Y(p.y)}`, class: 'capr-svg-rapido' }),
      s('path', { d: `M${X(0) + 4} ${Y(p.y)} L${X(p.zFim)} ${Y(p.y)}`, class: 'capr-svg-corte', 'marker-end': 'url(#capr-seta)' }),
    );
    if (d === 'profundidade' || d === 'passe') {
      const xm = X(0) + 14;
      svg.append(
        s('path', { d: `M${xm - 4} ${Y(p.yAnterior)} H${xm + 4} M${xm} ${Y(p.yAnterior)} V${Y(p.y)} M${xm - 4} ${Y(p.y)} H${xm + 4}`, class: 'capr-svg-cota' }),
      );
    }
  }
  if ((o.modo === 'trajetoria' && acabado) || d === 'acabamento') {
    svg.append(s('path', { d: caminhoPerfil(PECA.degraus), class: 'capr-svg-acabamento', 'marker-end': 'url(#capr-seta)' }));
  }

  svg.prepend(s('defs', {}, s('marker', { id: 'capr-seta', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' },
    s('path', { d: 'M0 0L10 5L0 10z', class: 'capr-svg-seta' }))));

  if (o.modo === 'ilustracao') {
    svg.append(
      rotulo(X(L) + 4, Y(R) - 8, 'Bruto (contorno tracejado)'),
      rotulo(X(12), Y(6), 'Peça'),
      rotulo(X(12), Y(PECA.degraus[0].r + sobremetal) - 6, 'Sobremetal', 'middle'),
      rotulo(ax - 10, ay + 4, 'Aproximação', 'end'),
      rotulo(34, 202, 'Placa', 'middle'),
      rotulo(340, 202, 'Z0', 'end', 'capr-svg-rotulo capr-svg-rotulo--fraco'),
    );
  }

  if (o.modo === 'regioes') {
    const p1 = passes[0];
    const marcas = [
      { letra: 'A', x: X(3), y: Y(PECA.degraus[0].r + sobremetal / 2), lx: 346, ly: Y(PECA.degraus[0].r) + 26 },
      { letra: 'B', x: X(p1.zFim / 2), y: (Y(p1.y) + Y(p1.yAnterior)) / 2, lx: X(p1.zFim / 2), ly: Y(R) - 16 },
      { letra: 'C', x: X(55), y: Y(10), lx: X(55), ly: Y(10) },
    ];
    for (const m of marcas) {
      if (m.letra !== 'C') svg.append(s('line', { x1: m.x, y1: m.y, x2: m.lx, y2: m.ly, class: 'capr-svg-guia' }));
      svg.append(
        s('circle', { cx: m.lx, cy: m.ly, r: 10, class: 'capr-svg-letra' }),
        s('text', { x: m.lx, y: m.ly + 4.5, 'text-anchor': 'middle', class: 'capr-svg-letra-txt' }, m.letra),
      );
    }
  }

  return { svg, passes, total: n };
}
