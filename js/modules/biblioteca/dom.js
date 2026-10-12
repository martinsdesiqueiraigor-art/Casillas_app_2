// dom.js — Criação de DOM sem HTML de dados.
//
// Texto de dados entra sempre como nó de texto (textContent). As únicas
// marcações interpretadas são os ícones e ilustrações SVG estáticos deste
// arquivo, escritos pelo desenvolvedor, sem dados de usuário ou de URL
// (mesmo critério de js/app.js para ICONS).

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * h('div', { class: 'x', 'aria-label': 'y', dataset: { a: '1' } }, 'texto', filho)
 * Atributos null/undefined/false são ignorados; true vira atributo vazio.
 * Strings e números entre os filhos viram nós de texto.
 */
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = String(v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'text') el.textContent = String(v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  append(el, children);
  return el;
}

/** Acrescenta filhos; strings viram texto, null/false são ignorados. */
export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/* -------------------------------------------------------------- ícones */

const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  gauge: '<path d="M3 7h10v4H3zM13 8.5h5M18 6.5v6M18 9.5h3M6 11v6M10 11v6"/>',
  thread: '<path d="M8 3v18M16 3v18M8 5l8 3M8 9l8 3M8 13l8 3M8 17l8 3"/>',
  tolerance: '<path d="M4 8h16M4 16h16M12 4v8M8 8h8M9 20h6"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  lathe: '<rect x="3" y="8" width="12" height="8" rx="1"/><path d="M15 12h6M6 8V5M6 19v-3"/>',
  tool: '<path d="M12 3l8 9-8 9-8-9z"/><circle cx="12" cy="12" r="2.5"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  source: '<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4l3 2"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h.01"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
};

/* Ilustrações vetoriais próprias. Fora de escala, sem cotas. */
const ART = {
  // Micrômetro estilizado do card em destaque (decorativo).
  micrometer: `<svg xmlns="${SVG_NS}" viewBox="0 40 220 76" class="cbib-feature__art" aria-hidden="true">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M38 78 v10 a20 20 0 0 0 20 20 h34 a20 20 0 0 0 20-20 v-13" stroke="var(--cbib-line-strong)" stroke-width="10"/>
      <rect x="30" y="56" width="16" height="22" rx="2" stroke="var(--cbib-tx-2)" stroke-width="2.5"/>
      <rect x="62" y="60" width="16" height="14" rx="2" stroke="var(--cbib-or)" stroke-width="2.5"/>
      <path d="M46 67 h16" stroke="var(--cbib-or)" stroke-width="2.5" stroke-dasharray="2 3"/>
      <rect x="78" y="59" width="44" height="16" rx="2" stroke="var(--cbib-tx-2)" stroke-width="2.5"/>
      <path d="M86 75v-5M94 75v-7M102 75v-5M110 75v-7M118 75v-5" stroke="var(--cbib-tx-3)" stroke-width="2"/>
      <rect x="122" y="54" width="46" height="26" rx="4" stroke="var(--cbib-bl)" stroke-width="2.5"/>
      <path d="M132 54v26M142 54v26M152 54v26" stroke="var(--cbib-bl)" stroke-width="1.5" opacity=".55"/>
      <rect x="168" y="59" width="22" height="16" rx="3" stroke="var(--cbib-tx-2)" stroke-width="2.5"/>
      <path d="M190 67h14" stroke="var(--cbib-tx-3)" stroke-width="2.5"/>
    </g>
  </svg>`,
  // Esquema de identificação das partes (aba Utilização).
  parts: `<svg xmlns="${SVG_NS}" class="cbib-figure__svg" viewBox="0 22 232 112" role="img"
       aria-label="Esquema do micrômetro externo com as partes arco, batente, fuso, bainha, tambor e catraca">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M38 78 v10 a20 20 0 0 0 20 20 h34 a20 20 0 0 0 20-20 v-13" stroke="var(--cbib-line-strong)" stroke-width="10"/>
      <rect x="30" y="56" width="16" height="22" rx="2" stroke="var(--cbib-tx-2)" stroke-width="2.5"/>
      <rect x="62" y="60" width="16" height="14" rx="2" stroke="var(--cbib-or)" stroke-width="2.5"/>
      <rect x="78" y="59" width="44" height="16" rx="2" stroke="var(--cbib-tx-2)" stroke-width="2.5"/>
      <path d="M86 75v-5M94 75v-7M102 75v-5M110 75v-7M118 75v-5" stroke="var(--cbib-tx-3)" stroke-width="2"/>
      <rect x="122" y="54" width="46" height="26" rx="4" stroke="var(--cbib-bl)" stroke-width="2.5"/>
      <path d="M132 54v26M142 54v26M152 54v26" stroke="var(--cbib-bl)" stroke-width="1.5" opacity=".55"/>
      <rect x="168" y="59" width="22" height="16" rx="3" stroke="var(--cbib-tx-2)" stroke-width="2.5"/>
      <path d="M190 67h14" stroke="var(--cbib-tx-3)" stroke-width="2.5"/>
      <g stroke="var(--cbib-tx-3)" stroke-width="1" stroke-dasharray="2 2">
        <path d="M38 40v14M70 40v18M100 40v17M179 40v17M145 82v12M75 108v8"/>
      </g>
    </g>
    <g class="cbib-figure__labels" text-anchor="middle">
      <text x="38" y="36">Batente</text>
      <text x="70" y="36" class="cbib-is-or">Fuso</text>
      <text x="100" y="36">Bainha</text>
      <text x="179" y="36">Catraca</text>
      <text x="145" y="104" class="cbib-is-bl">Tambor</text>
      <text x="75" y="127">Arco</text>
    </g>
  </svg>`,
  // Esquema do paquímetro universal (aba Utilização da ficha BIB-MET-002, rascunho).
  // Fora de escala, sem cotas e sem valores; só identifica as partes.
  'paquimetro-partes': `<svg xmlns="${SVG_NS}" class="cbib-figure__svg" viewBox="0 8 264 132" role="img"
       aria-label="Esquema do paquímetro universal com as partes orelhas, encostos, escala principal, cursor, nônio, trava, impulsor e haste de profundidade">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="22" y="52" width="210" height="16" rx="2" stroke="var(--cbib-tx-2)" stroke-width="2.5"/>
      <path d="M40 52v5M52 52v5M64 52v5M76 52v5M88 52v5M100 52v8M112 52v5M124 52v5M136 52v5M148 52v5M160 52v8M172 52v5M184 52v5M196 52v5M208 52v5M220 52v8" stroke="var(--cbib-tx-3)" stroke-width="1.5"/>
      <path d="M22 68v44h8l10-30v-14" stroke="var(--cbib-line-strong)" stroke-width="3" fill="var(--cbib-surface-3)"/>
      <path d="M22 52v-22h6l4 22" stroke="var(--cbib-line-strong)" stroke-width="3" fill="var(--cbib-surface-3)"/>
      <rect x="84" y="46" width="48" height="28" rx="3" stroke="var(--cbib-bl)" stroke-width="2.5"/>
      <path d="M84 74v8l10 30h8v-38" stroke="var(--cbib-bl)" stroke-width="3" fill="var(--cbib-bl-soft)"/>
      <path d="M84 46l-4-16h6l6 16" stroke="var(--cbib-bl)" stroke-width="3" fill="var(--cbib-bl-soft)"/>
      <path d="M90 68v4M96 68v4M102 68v4M108 68v6M114 68v4M120 68v4M126 68v4" stroke="var(--cbib-or)" stroke-width="1.5"/>
      <circle cx="118" cy="40" r="4" stroke="var(--cbib-bl)" stroke-width="2"/>
      <path d="M118 44v2" stroke="var(--cbib-bl)" stroke-width="2"/>
      <path d="M120 74v6h10v-6" stroke="var(--cbib-bl)" stroke-width="2.5"/>
      <path d="M232 60h22" stroke="var(--cbib-bl)" stroke-width="2.5"/>
      <g stroke="var(--cbib-tx-3)" stroke-width="1" stroke-dasharray="2 2">
        <path d="M30 20v10M82 20v10M118 22v14M190 38v12M150 98l-38-26M150 116l-24-34M238 21l10 37M62 126l-28-16M62 126l34-14"/>
      </g>
    </g>
    <g class="cbib-figure__labels" text-anchor="middle">
      <text x="56" y="17">Orelhas</text>
      <text x="118" y="17">Trava</text>
      <text x="190" y="34">Escala principal</text>
      <text x="164" y="102" class="cbib-is-or">Nônio</text>
      <text x="164" y="120">Impulsor</text>
      <text x="262" y="17" class="cbib-is-bl" text-anchor="end">Haste de profundidade</text>
      <text x="62" y="136">Encostos</text>
      <text x="108" y="66" class="cbib-is-bl">Cursor</text>
    </g>
  </svg>`,
};

const cache = new Map();

/** Converte SVG estático em nó (com cache) e devolve uma cópia. */
function staticSvg(key, markup) {
  if (!cache.has(key)) {
    const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const root = doc.documentElement;
    if (root.nodeName !== 'svg') throw new Error(`SVG inválido: ${key}`);
    cache.set(key, document.importNode(root, true));
  }
  return /** @type {SVGElement} */ (cache.get(key).cloneNode(true));
}

/** Ícone de traço 24×24. Nome desconhecido devolve um SVG vazio (não lança). */
export function icon(name, cls = '') {
  const paths = ICON_PATHS[name] || '';
  const svg = staticSvg(`i:${name}`, `<svg xmlns="${SVG_NS}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`);
  svg.setAttribute('class', `cbib-i${cls ? ` ${cls}` : ''}`);
  return svg;
}

/** Ilustração estática por chave. Chave desconhecida devolve null. */
export function art(name) {
  return ART[name] ? staticSvg(`a:${name}`, ART[name]) : null;
}

export const ART_KEYS = Object.keys(ART);
