// calcKit.js — componentes da interface 2.1 para as calculadoras.
// Só textContent e atributos (sem innerHTML). Não contém cálculo.
import { h, svg } from '../guia/ui/dom.js';

const ICON_PATHS = {
  back: ['M15 6l-6 6 6 6'],
  warn: ['M12 3l10 18H2z', 'M12 10v5M12 18v.5'],
  ok: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z', 'M8 12l3 3 5-6'],
  copy: ['M9 9h11v11H9z', 'M5 15V6a2 2 0 0 1 2-2h9'],
  x: ['M6 6l12 12M18 6L6 18']
};

/** @param {string} name @param {number} [size] */
export function kitIcon(name, size = 24) {
  const el = svg('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', class: 'ck-ico' });
  for (const d of ICON_PATHS[name] || []) el.appendChild(svg('path', { d }));
  return el;
}

/** Topo da tela: voltar + título. @param {string} title */
export function topBar(title) {
  return h('div', { class: 'ck-top' },
    h('button', {
      type: 'button', class: 'ck-iconbtn', 'aria-label': 'Voltar às calculadoras',
      onclick: () => window.dispatchEvent(new CustomEvent('casillas:navigate-module', { detail: { key: 'calculadoras' } }))
    }, kitIcon('back')),
    h('h1', { class: 'ck-h1', text: title }));
}

/**
 * Abas de modo. @param {{key:string,label:string}[]} modes @param {string} current @param {(key:string)=>void} onSelect
 */
export function segTabs(modes, current, onSelect) {
  const wrap = h('div', { class: 'ck-tabs', role: 'tablist', 'aria-label': 'Modo de cálculo' });
  const buttons = modes.map((m) => h('button', {
    type: 'button', role: 'tab', class: 'ck-tab', text: m.label, 'aria-selected': m.key === current ? 'true' : 'false',
    onclick: () => {
      for (const b of buttons) b.setAttribute('aria-selected', b === btn(m.key) ? 'true' : 'false');
      onSelect(m.key);
    },
    dataset: { key: m.key }
  }));
  /** @param {string} key */
  function btn(key) { return buttons.find((b) => b.dataset.key === key); }
  buttons.forEach((b) => wrap.appendChild(b));
  return wrap;
}

/**
 * Campo numérico com unidade. @param {{id:string,label:string,unit?:string,prefix?:string,value?:string,onInput?:()=>void}} o
 */
export function field(o) {
  const input = h('input', { id: o.id, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', placeholder: '0', 'data-native-keyboard': '1' });
  if (o.value) /** @type {HTMLInputElement} */ (input).value = o.value;
  if (o.onInput) input.addEventListener('input', o.onInput);
  const box = h('span', { class: 'ck-fld' },
    o.prefix ? h('span', { class: 'ck-pre', text: o.prefix }) : null,
    input,
    o.unit ? h('span', { class: 'ck-unit', text: o.unit }) : null);
  return h('label', { class: 'ck-field' }, h('span', { text: o.label }), box);
}

/** Marca campos com erro. @param {string[]} ids */
export function markErrors(ids) {
  for (const el of document.querySelectorAll('.ck-fld')) el.classList.remove('ck-err');
  for (const id of ids) document.getElementById(id)?.closest('.ck-fld')?.classList.add('ck-err');
}

/** Alerta de erro de validação. */
export function alertBox() {
  const text = h('span');
  const el = h('div', { class: 'ck-alert', role: 'alert', hidden: true }, kitIcon('warn', 20), text);
  return {
    el,
    /** @param {string} msg */
    show(msg) { text.textContent = msg; el.hidden = false; },
    hide() { el.hidden = true; }
  };
}

/** Painel de resultados com KPIs, detalhes e copiar. */
export function resultPanel(note) {
  const body = h('div');
  const copyLabel = h('span', { text: 'Copiar resultado' });
  /** @type {{text:string}} */
  const state = { text: '' };
  const copyBtn = h('button', {
    type: 'button', class: 'ck-btn ck-btn-out',
    onclick: async () => {
      if (!state.text) return;
      let ok = false;
      try { await navigator.clipboard.writeText(state.text); ok = true; } catch { ok = false; }
      copyLabel.textContent = ok ? 'Copiado' : 'Não foi possível copiar';
      window.setTimeout(() => { copyLabel.textContent = 'Copiar resultado'; }, 1800);
    }
  }, kitIcon('copy', 20), copyLabel);
  const el = h('section', { class: 'ck-res', 'aria-live': 'polite', hidden: true },
    h('h2', { class: 'ck-res-h' }, kitIcon('ok', 18), h('span', { text: 'Resultados' })),
    body, copyBtn,
    note ? h('p', { class: 'ck-note', text: note }) : null);
  return {
    el,
    hide() { el.hidden = true; state.text = ''; },
    /** @param {{kpis:{label:string,value:string,unit?:string,main?:boolean}[],details?:[string,string][],copy:string}} d */
    show(d) {
      body.replaceChildren(
        h('div', { class: 'ck-kpis' }, ...d.kpis.map((k) => h('div', { class: 'ck-kpi' + (k.main ? ' ck-kpi-main' : '') },
          h('small', { text: k.label }),
          h('b', { text: k.value }, k.unit ? h('span', { text: ' ' + k.unit }) : null)))),
        d.details && d.details.length
          ? h('details', { class: 'ck-det', open: true }, h('summary', { text: 'Resultados detalhados' }),
            ...d.details.map(([l, v]) => h('div', { class: 'ck-rw' }, h('span', { text: l }), h('b', { text: v }))))
          : null);
      state.text = d.copy;
      el.hidden = false;
    }
  };
}
