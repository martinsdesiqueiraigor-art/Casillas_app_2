// index.js — Biblioteca Técnica (CAS22-BIB-INTEGRATION-FASE-01).
//
// Módulo isolado, ainda NÃO registrado em js/app.js. Segue o contrato dos
// módulos do Casillas: render(container, accessStatus, ctx) monta a tela
// dentro do contêiner recebido (#app-content).
//
// - Navegação interna por pilha em memória; não lê nem escreve window.location
//   e não registra hashchange/popstate (o roteador do app continua sendo o único).
// - CSS próprio (biblioteca.css), com escopo .cbib, carregado uma vez.
// - Listeners por delegação na raiz do módulo. O único listener global (scroll,
//   para recolher o botão do Consultor) se desliga sozinho quando o app troca de
//   módulo, porque o app não chama nenhuma função de desmontagem.
// - Sem rede: dados e busca são locais.

import { categories, sheets, REVIEW_STATES, TOPIC_STATUS } from './data.js';
import { buildIndex, filterTopics } from './search.js';
import { normalizeRoute, parentOf, TAB_IDS, isValidId, isHomologated } from './routes.js';
import { h, append } from './dom.js';
import {
  ROUTES, homeView, categoryView, sheetView, consultorView, searchView, notFoundView,
  panelContent, resultsContent, countLabel, topicRow,
} from './views.js';

const DATA = Object.freeze({ categories, sheets, REVIEW_STATES, TOPIC_STATUS });
const INDEX = buildIndex(categories, sheets, TOPIC_STATUS);
const CTX = Object.freeze({ data: DATA, index: INDEX });

/**
 * Última aba aberta por ficha.
 * Política: vale enquanto a página do app estiver aberta (recarregar ou fechar
 * o app limpa), guarda no máximo MAX_REMEMBERED fichas (descarta a mais antiga)
 * e pode ser zerada com clearSessionMemory() — por exemplo, ao sair da conta (Fase 2).
 */
const lastTab = new Map();
const MAX_REMEMBERED = 50;
function rememberTab(id, tab) {
  lastTab.delete(id);
  lastTab.set(id, tab);
  while (lastTab.size > MAX_REMEMBERED) lastTab.delete(lastTab.keys().next().value);
}
/** Esquece as abas lembradas (uso previsto: troca de usuário ou saída da conta). */
export function clearSessionMemory() {
  lastTab.clear();
}

const STYLE_ID = 'cbib-styles';
/** Prazo para o CSS carregar. Depois disso a tela aparece mesmo assim (nunca fica invisível). */
export const STYLE_TIMEOUT_MS = 3000;

/**
 * Carrega biblioteca.css uma única vez e chama onReady exatamente uma vez:
 * quando o CSS aplica, quando falha ou quando o prazo acaba.
 * Até lá a raiz fica oculta; no pior caso aparece sem estilo, nunca fica invisível.
 */
function ensureStyles(onReady) {
  let link = /** @type {HTMLLinkElement|null} */ (document.getElementById(STYLE_ID));
  if (!link) {
    link = document.createElement('link');
    link.id = STYLE_ID;
    link.rel = 'stylesheet';
    link.href = new URL('./biblioteca.css', import.meta.url).href;
    const el = link;
    el.addEventListener('load', () => { el.dataset.state = 'loaded'; }, { once: true });
    el.addEventListener('error', () => {
      el.dataset.state = 'error';
      console.warn('[Biblioteca] Não foi possível carregar biblioteca.css; exibindo sem estilo.');
    }, { once: true });
    document.head.append(link);
  }
  let fired = false;
  let timer = 0;
  const done = () => {
    if (fired) return;
    fired = true;
    clearTimeout(timer);
    onReady();
  };
  if (link.dataset.state || link.sheet) { done(); return; }
  link.addEventListener('load', done, { once: true });
  link.addEventListener('error', done, { once: true });
  timer = window.setTimeout(() => {
    if (!fired) console.warn('[Biblioteca] biblioteca.css não carregou no prazo; exibindo a tela mesmo assim.');
    done();
  }, STYLE_TIMEOUT_MS);
}

/** Controladores montados, para desmontagem explícita (unmount). */
const MOUNTED = new WeakMap();

const VIEWS = {
  home: homeView,
  categoria: categoryView,
  ficha: sheetView,
  consultor: consultorView,
  busca: searchView,
  notfound: notFoundView,
};

/**
 * Dados usados por uma montagem. Sem previewSheet, são os dados publicados.
 * Com previewSheet (só a página de teste usa), a ficha de rascunho é acrescentada
 * às fichas navegáveis DESTA montagem, para abri-la por rota direta.
 * A busca (INDEX), as categorias e os contadores continuam os publicados:
 * o rascunho não aparece em listas, resultados nem no Consultor.
 * Ficha inválida, homologada ou com id de ficha publicada é ignorada.
 */
function previewData(sheet) {
  if (!sheet || typeof sheet !== 'object') return DATA;
  const id = sheet.id;
  const ok = isValidId(id) && !Object.prototype.hasOwnProperty.call(sheets, id)
    && !isHomologated(sheet) && Object.prototype.hasOwnProperty.call(REVIEW_STATES, sheet.reviewState)
    && categories.some((c) => c.id === sheet.categoryId);
  if (!ok) {
    console.warn('[Biblioteca] previewSheet ignorada: ficha de rascunho inválida.');
    return DATA;
  }
  return Object.freeze({ categories, sheets: Object.freeze({ ...sheets, [id]: sheet }), REVIEW_STATES, TOPIC_STATUS });
}

/**
 * Monta a Biblioteca Técnica no contêiner.
 * @param {HTMLElement} container
 * @param {{ initialRoute?: object, onRouteChange?: (route: object) => void, previewSheet?: object }} [options]
 *   onRouteChange: gancho para a Fase 2 sincronizar com o roteador do app.
 *   previewSheet: ficha de rascunho para a página de teste (não usar no app).
 */
export function mountBiblioteca(container, options = {}) {
  MOUNTED.get(container)?.destroy(); // remontagem no mesmo contêiner desliga a anterior
  const data = previewData(options.previewSheet);
  const ctx = data === DATA ? CTX : Object.freeze({ data, index: INDEX });
  const root = h('div', { class: 'cbib', 'data-screen': '' });
  const toast = h('div', { class: 'cbib-toast', role: 'status', 'aria-live': 'polite', hidden: true });
  const view = h('div', { class: 'cbib-view' });
  root.append(view, toast);
  // Oculta só até o CSS aplicar; ensureStyles garante a liberação (carregou, falhou ou prazo esgotado).
  root.style.visibility = 'hidden';
  container.replaceChildren(root);
  ensureStyles(() => {
    root.style.removeProperty('visibility');
    root.classList.add('cbib-is-ready');
  });

  const ac = new AbortController();
  /** @type {{ route: any, scrollY: number }[]} */
  const stack = [];
  let route = { name: 'home' };
  let toastTimer = 0;
  let lastY = 0;

  const remembered = (id) => lastTab.get(id);
  const isAlive = () => {
    if (root.isConnected) return true;
    destroy();
    return false;
  };

  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('cbib-is-on');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('cbib-is-on');
      toastTimer = window.setTimeout(() => { toast.hidden = true; }, 220);
    }, 2800);
  }
  function hideToast() {
    clearTimeout(toastTimer);
    toast.classList.remove('cbib-is-on');
    toast.hidden = true;
  }

  function draw({ focus = false, scrollY = null, historyMode = 'push' } = {}) {
    if (route.name === 'ficha') rememberTab(route.id, route.tab);
    const build = VIEWS[route.name] || notFoundView;
    let nodes;
    try {
      nodes = build(ctx, route);
    } catch (err) {
      console.error('[Biblioteca] Falha ao montar a tela', err);
      route = { name: 'notfound' };
      nodes = notFoundView();
    }
    view.replaceChildren();
    append(view, [nodes]);
    root.dataset.screen = route.name;
    hideToast();
    if (scrollY != null) window.scrollTo(0, scrollY);

    if (route.name === 'busca' && focus !== 'title') {
      const input = /** @type {HTMLInputElement|null} */ (view.querySelector('#cbib-q'));
      if (input && focus) {
        input.focus({ preventScroll: true });
        input.setSelectionRange(input.value.length, input.value.length);
      }
    } else if (focus) {
      /** @type {HTMLElement|null} */ (view.querySelector('[data-screen-title]'))?.focus({ preventScroll: true });
    }
    options.onRouteChange?.({ ...route }, historyMode);
  }

  /** Abre uma rota (empilha a atual para o Voltar). */
  function navigate(next, { replace = false } = {}) {
    if (!isAlive()) return;
    const target = normalizeRoute(next, data, remembered);
    if (!replace) stack.push({ route, scrollY: window.scrollY });
    route = target;
    draw({ focus: true, scrollY: 0, historyMode: replace ? 'silent' : 'push' });
  }

  /** Volta para a tela anterior; sem histórico, vai para a tela-pai. */
  function back() {
    if (!isAlive()) return;
    const prev = stack.pop();
    if (prev) {
      route = normalizeRoute(prev.route, data, remembered);
      draw({ focus: route.name === 'busca' ? 'title' : true, scrollY: prev.scrollY, historyMode: 'replace' });
    } else if (route.name !== 'home') {
      route = normalizeRoute(parentOf(route, data), data, remembered);
      draw({ focus: true, scrollY: 0, historyMode: 'replace' });
    }
  }

  /** Troca a aba da ficha sem redesenhar a tela. */
  function selectTab(tab, { focusTab = false } = {}) {
    if (route.name !== 'ficha' || !TAB_IDS.includes(tab)) return;
    const s = data.sheets[route.id];
    route = { ...route, tab };
    rememberTab(route.id, tab);
    view.querySelectorAll('[role="tab"]').forEach((b) => {
      const on = /** @type {HTMLElement} */ (b).dataset.tab === tab;
      b.setAttribute('aria-selected', String(on));
      b.setAttribute('tabindex', on ? '0' : '-1');
      b.classList.toggle('cbib-is-on', on);
      if (on && focusTab) /** @type {HTMLElement} */ (b).focus();
    });
    const panel = view.querySelector('#cbib-sheet-panel');
    if (panel) {
      panel.setAttribute('aria-labelledby', `cbib-tab-${tab}`);
      panel.replaceChildren();
      append(panel, [panelContent(ctx, s, tab)]);
    }
    const tabs = view.querySelector('.cbib-tabs');
    if (tabs && tabs.getBoundingClientRect().top < 0) tabs.scrollIntoView({ block: 'start' });
    options.onRouteChange?.({ ...route }, 'replace');
  }

  function updateSearch(q) {
    route = { name: 'busca', q: String(q).slice(0, 120) };
    const results = view.querySelector('#cbib-results');
    if (!results) return;
    results.replaceChildren();
    append(results, [resultsContent(ctx, route.q)]);
    const count = view.querySelector('#cbib-result-count');
    if (count) count.textContent = countLabel(INDEX, route.q);
    const clear = /** @type {HTMLElement|null} */ (view.querySelector('.cbib-search__clear'));
    if (clear) clear.hidden = !route.q;
    options.onRouteChange?.({ ...route }, 'replace');
  }

  function filterCategory(input) {
    const cat = data.categories.find((c) => c.id === input.dataset.filter);
    const list = view.querySelector('#cbib-topic-list');
    if (!cat || !list) return;
    const topics = filterTopics(cat.topics, input.value);
    list.replaceChildren(...topics.map((t) => topicRow(t, TOPIC_STATUS)));
    const empty = /** @type {HTMLElement|null} */ (view.querySelector('#cbib-topic-empty'));
    if (empty) empty.hidden = topics.length > 0;
    const count = view.querySelector('#cbib-cat-count');
    if (count) count.textContent = `${topics.length} ${topics.length === 1 ? 'item' : 'itens'}`;
    const all = view.querySelector('#cbib-topic-empty-all');
    if (all) ROUTES.set(all, { name: 'busca', q: input.value });
  }

  /* --------------------------------------------------------- eventos */
  const opts = { signal: ac.signal };

  root.addEventListener('click', (e) => {
    const t = /** @type {Element} */ (e.target);
    if (!(t instanceof Element)) return;

    const routeEl = t.closest('button, a');
    if (routeEl && ROUTES.has(routeEl)) { navigate(ROUTES.get(routeEl)); return; }

    const tabBtn = /** @type {HTMLElement|null} */ (t.closest('[role="tab"][data-tab]'));
    if (tabBtn) { selectTab(tabBtn.dataset.tab); return; }

    const tabGo = /** @type {HTMLElement|null} */ (t.closest('[data-tab-go]'));
    if (tabGo) { selectTab(tabGo.dataset.tabGo, { focusTab: true }); return; }

    const action = /** @type {HTMLElement|null} */ (t.closest('[data-action]'))?.dataset.action;
    if (action === 'back') {
      if (options.onBack?.() !== true) back();
      return;
    }
    if (action === 'clear') {
      const input = /** @type {HTMLInputElement|null} */ (view.querySelector('#cbib-q'));
      if (input) { input.value = ''; updateSearch(''); input.focus(); }
      return;
    }
    if (action === 'demo-question') {
      showToast('Demonstração: na versão final, o Consultor responderia usando esta ficha como contexto.');
      return;
    }

    const sug = /** @type {HTMLElement|null} */ (t.closest('[data-suggest]'));
    if (sug) {
      const input = /** @type {HTMLInputElement|null} */ (view.querySelector('#cbib-q'));
      if (input) { input.value = sug.dataset.suggest || ''; updateSearch(input.value); }
      return;
    }

    const planned = /** @type {HTMLElement|null} */ (t.closest('[data-planned]'));
    if (planned) showToast(`“${planned.dataset.planned}”: ficha em preparação.`);
  }, opts);

  // Campo da Biblioteca: ao receber foco, abre a tela de busca já com o foco (mesmo gesto do usuário).
  root.addEventListener('focusin', (e) => {
    if (/** @type {Element} */ (e.target).id === 'cbib-home-search') navigate({ name: 'busca', q: '' });
  }, opts);

  root.addEventListener('submit', (e) => {
    e.preventDefault(); // nenhum formulário do módulo envia dados
    const form = /** @type {HTMLElement} */ (e.target);
    if (form.dataset.search === 'cbib-home-search') navigate({ name: 'busca', q: '' });
    else /** @type {HTMLElement|null} */ (document.activeElement)?.blur?.(); // fecha o teclado e mostra os resultados
  }, opts);

  root.addEventListener('input', (e) => {
    const input = /** @type {HTMLInputElement} */ (e.target);
    if (input.id === 'cbib-q') updateSearch(input.value);
    else if (input.dataset.filter) filterCategory(input);
  }, opts);

  // Padrão WAI-ARIA de abas: setas, Home e End movem o foco e ativam a aba.
  root.addEventListener('keydown', (e) => {
    const tab = /** @type {HTMLElement|null} */ (/** @type {Element} */ (e.target).closest?.('[role="tab"][data-tab]'));
    if (!tab) return;
    const i = TAB_IDS.indexOf(tab.dataset.tab || '');
    const map = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: TAB_IDS.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    selectTab(TAB_IDS[(map[e.key] + TAB_IDS.length) % TAB_IDS.length], { focusTab: true });
  }, opts);

  // Botão do Consultor recolhe enquanto o leitor desce a ficha e volta ao subir ou no fim do texto.
  window.addEventListener('scroll', () => {
    if (!isAlive()) return;
    const fab = view.querySelector('.cbib-fab');
    const y = window.scrollY;
    if (fab && !fab.matches(':focus-visible')) {
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 8;
      if (y > lastY + 6 && y > 160 && !atEnd) fab.classList.add('cbib-is-away');
      else if (y < lastY - 6 || atEnd || y <= 160) fab.classList.remove('cbib-is-away');
    }
    lastY = y;
  }, { passive: true, signal: ac.signal });

  function destroy() {
    ac.abort();
    clearTimeout(toastTimer);
    if (MOUNTED.get(container) === controller) MOUNTED.delete(container);
  }

  route = normalizeRoute(options.initialRoute ?? { name: 'home' }, data, remembered);
  draw({ focus: false });

  const controller = {
    navigate,
    syncRoute(next) {
      if (!isAlive()) return;
      stack.length = 0;
      route = normalizeRoute(next, data, remembered);
      draw({ focus: false, historyMode: 'silent' });
    },
    back,
    selectTab,
    destroy,
    /** Rota atual (cópia). */
    getRoute: () => ({ ...route }),
    /** Profundidade da pilha interna (o Voltar do módulo tem para onde ir?). */
    canGoBack: () => stack.length > 0 || route.name !== 'home',
  };
  MOUNTED.set(container, controller);
  return controller;
}

/** Contrato dos módulos do Casillas (js/app.js → mod.render(content, accessStatus, ctx)). */
export function render(container) {
  return mountBiblioteca(container);
}

/**
 * Desmontagem explícita (para quando o app tiver esse passo).
 * Desliga listeners e temporizadores; o contêiner continua sendo do app.
 * Sem ela, o módulo se desliga sozinho ao detectar que saiu da tela.
 */
export function unmount(container) {
  MOUNTED.get(container)?.destroy();
}
