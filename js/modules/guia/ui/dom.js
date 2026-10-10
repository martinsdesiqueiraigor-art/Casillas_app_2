// @ts-check
// Helpers de DOM do Guia. Só textContent e atributos: nenhum HTML é interpretado.

const SVG_NS = 'http://www.w3.org/2000/svg';

/** @typedef {Record<string, string|number|boolean|null|undefined|((ev:Event)=>void)|Record<string,string>>} Props */
/** @typedef {Node|string|null|undefined|false} Child */

/** @param {Element} el @param {Props} props */
function applyProps(el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.setAttribute('class', String(value));
    else if (key === 'text') el.textContent = String(value);
    else if (key === 'dataset' && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) /** @type {HTMLElement} */ (el).dataset[k] = String(v);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), /** @type {EventListener} */ (value));
    } else el.setAttribute(key, value === true ? '' : String(value));
  }
}

/** @param {Element} el @param {Child[]} children */
function appendChildren(el, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
}

/** @param {string} tag @param {Props} [props] @param {...Child} children */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  applyProps(el, props);
  appendChildren(el, children);
  return el;
}

/** @param {string} tag @param {Props} [props] @param {...Child} children */
export function svg(tag, props = {}, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  applyProps(el, props);
  appendChildren(el, children);
  return el;
}

/** Ícones de linha (caminhos estáticos do desenvolvedor). */
const ICON_PATHS = {
  doc: 'M7 3h7l4 4v14H7z M14 3v4h4M10 12h5M10 16h5',
  path: 'M4 18c4 0 3-12 8-12s3 12 8 12',
  gear: 'M12 2l1.5 2.5 3-.5 1 2.8 2.7 1.4-.8 3 .8 3-2.7 1.4-1 2.8-3-.5L12 22l-1.5-2.5-3 .5-1-2.8-2.7-1.4.8-3-.8-3 2.7-1.4 1-2.8 3 .5z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  bars: 'M6 20V11M12 20V5M18 20v-7',
  clip: 'M6 4h12v17H6z M9 4h6v3H9zM9 12h6M9 16h6',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 11v6M12 7.5v.5',
  book: 'M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z',
  target: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M12 2v3M12 19v3M2 12h3M19 12h3',
  chev: 'M9 6l6 6-6 6',
  warn: 'M12 3l10 18H2z M12 10v5M12 18v.5',
  search: 'M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M20 20l-4-4',
  layers: 'M12 3l9 5-9 5-9-5z M3 13l9 5 9-5',
  lathe: 'M4 6v12M4 12h14M18 8v8',
  thread: 'M4 7c4-3 12 0 16-3M4 12c4-3 12 0 16-3M4 17c4-3 12 0 16-3',
  calc: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01'
};

/** @param {keyof typeof ICON_PATHS} name @param {number} [size] */
export function icon(name, size = 22) {
  return svg('svg', { viewBox: '0 0 24 24', width: size, height: size, class: 'gx-i', 'aria-hidden': 'true' },
    svg('path', { d: ICON_PATHS[name] }));
}
