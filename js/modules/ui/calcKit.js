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
 * Campo numérico com unidade. @param {{id:string,label:string,unit?:string,prefix?:string,value?:string,placeholder?:string,onInput?:()=>void}} o
 */
export function field(o) {
  const input = h('input', { id: o.id, type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', placeholder: o.placeholder || '0', 'data-native-keyboard': '1' });
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
    /** @param {{kpis:{label:string,value:string,unit?:string,main?:boolean}[],details?:[string,string][],table?:{title:string,head:string[],rows:string[][]},copy:string}} d */
    show(d) {
      body.replaceChildren(...[
        h('div', { class: 'ck-kpis' }, ...d.kpis.map((k) => h('div', { class: 'ck-kpi' + (k.main ? ' ck-kpi-main' : '') },
          h('small', { text: k.label }),
          h('b', { text: k.value }, k.unit ? h('span', { text: ' ' + k.unit }) : null)))),
        d.details && d.details.length
          ? h('details', { class: 'ck-det', open: true }, h('summary', { text: 'Resultados detalhados' }),
            ...d.details.map(([l, v]) => h('div', { class: 'ck-rw' }, h('span', { text: l }), h('b', { text: v }))))
          : null,
        d.table
          ? h('details', { class: 'ck-det', open: true }, h('summary', { text: d.table.title }),
            h('div', { class: 'ck-tablewrap' }, h('table', { class: 'ck-table' },
              h('thead', {}, h('tr', {}, ...d.table.head.map((t) => h('th', { text: t })))),
              h('tbody', {}, ...d.table.rows.map((r) => h('tr', {}, ...r.map((c) => h('td', { text: c }))))))))
          : null].filter(Boolean));
      state.text = d.copy;
      el.hidden = false;
    }
  };
}

/**
 * Tela de calculadora completa (interface 2.1). Calcula ao digitar.
 * cfg.modes: [{key,label,sub,fields:[{id,label,unit,prefix,options}]}] (um modo sem abas se houver só um)
 * cfg.compute(modeKey, v) → null (incompleto) | {error,ids} | {kpis,details,copy,figure}
 * `v` mapeia id → número (NaN se vazio) ou texto (campos com `options`).
 * @param {HTMLElement} container
 * @param {{title:string,modes:{key:string,label:string,sub?:string,fields:{id:string,label:string,unit?:string,prefix?:string,placeholder?:string,options?:{value:string,label:string}[],value?:string}[]}[],figure?:()=>{el:Element,update:(r:any)=>void},compute:(mode:string,v:Record<string,any>)=>any,note?:string,initialMode?:string,onMode?:(key:string)=>void}} cfg
 */
export function mountCalc(container, cfg) {
  while (container.firstChild) container.removeChild(container.firstChild);
  let mode = cfg.initialMode && cfg.modes.some((m) => m.key === cfg.initialMode) ? cfg.initialMode : cfg.modes[0].key;
  /** @type {Record<string,Record<string,string>>} */
  const saved = {};
  const sub = h('p', { class: 'ck-sub' });
  const form = h('form', { class: 'ck-form', novalidate: true, onsubmit: (e) => e.preventDefault() });
  const fig = cfg.figure ? cfg.figure() : null;
  const aviso = alertBox();
  const dica = h('div', { class: 'ck-hint', hidden: true });
  const painel = resultPanel(cfg.note || 'Confira o resultado com o desenho da peça.');
  const parts = [topBar(cfg.title), sub];
  if (cfg.modes.length > 1) {
    parts.push(segTabs(cfg.modes.map((m) => ({ key: m.key, label: m.label })), mode, (key) => { mode = key; if (cfg.onMode) cfg.onMode(key); montar(); }));
  }
  if (fig) parts.push(h('div', { class: 'ck-fig' }, fig.el));
  parts.push(form, dica, aviso.el, painel.el);
  container.append(h('div', { class: 'ck-view' }, ...parts));

  function modo() { return /** @type {NonNullable<typeof cfg.modes[0]>} */ (cfg.modes.find((m) => m.key === mode)); }

  function montar() {
    const m = modo();
    sub.textContent = m.sub || '';
    sub.hidden = !m.sub;
    const salvo = saved[mode] || (saved[mode] = {});
    const campos = m.fields.map((f) => {
      if (f.options) {
        const sel = h('select', { id: f.id, class: 'ck-select' }, ...f.options.map((o) => h('option', { value: o.value, text: o.label })));
        /** @type {HTMLSelectElement} */ (sel).value = salvo[f.id] ?? f.value ?? f.options[0].value;
        sel.addEventListener('change', () => { salvo[f.id] = /** @type {HTMLSelectElement} */ (sel).value; calcular(); });
        return h('label', { class: 'ck-field' }, h('span', { text: f.label }), h('span', { class: 'ck-fld' }, sel));
      }
      return field({ id: f.id, label: f.label, unit: f.unit, prefix: f.prefix, placeholder: f.placeholder, value: salvo[f.id] ?? f.value ?? '', onInput: () => {
        salvo[f.id] = /** @type {HTMLInputElement} */ (document.getElementById(f.id)).value;
        calcular();
      } });
    });
    /** @type {Element[]} */
    const linhas = [];
    for (let i = 0; i < campos.length; i += 2) {
      linhas.push(i + 1 < campos.length ? h('div', { class: 'ck-row' }, campos[i], campos[i + 1]) : campos[i]);
    }
    form.replaceChildren(...linhas);
    calcular();
  }

  function valores() {
    /** @type {Record<string,any>} */
    const v = {};
    for (const f of modo().fields) {
      const el = /** @type {HTMLInputElement|HTMLSelectElement|null} */ (document.getElementById(f.id));
      if (!el) { v[f.id] = NaN; continue; }
      if (f.options) v[f.id] = el.value;
      else { const s = String(el.value).trim().replace(',', '.'); const n = s === '' ? NaN : Number(s); v[f.id] = Number.isFinite(n) ? n : NaN; }
    }
    return v;
  }

  function calcular() {
    aviso.hide(); markErrors([]);
    const r = cfg.compute(mode, valores());
    dica.hidden = true;
    if (r && r.hint) { dica.className = 'ck-hint ck-hint-' + r.hint.tone; dica.textContent = r.hint.text; dica.hidden = false; }
    if (!r) { painel.hide(); if (fig) fig.update(null); return; }
    if (r.error) { aviso.show(r.error); markErrors(r.ids || []); painel.hide(); if (fig) fig.update(null); return; }
    if (fig) fig.update(r.figure ?? null);
    painel.show(r);
  }

  montar();
}

/** Texto para copiar: título, KPIs e detalhes. */
export function copiar(titulo, kpis, details) {
  return [titulo, ...kpis.map((k) => k.label + ': ' + k.value + (k.unit ? ' ' + k.unit : '')), ...(details || []).map((r) => r[0] + ': ' + r[1])].join('\n');
}
