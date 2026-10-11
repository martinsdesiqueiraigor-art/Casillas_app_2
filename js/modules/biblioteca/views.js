// views.js — Telas da Biblioteca Técnica (aparência da Iteração 02).
// Cada função devolve nós DOM; nenhum dado é interpretado como HTML.
// A navegação é por delegação no controlador (index.js):
//   ROUTES (WeakMap) guarda a rota de cada botão de navegação;
//   data-action / data-tab / data-tab-go / data-planned / data-suggest marcam as demais ações.

import { h, icon, art } from './dom.js';
import { SHEET_TABS, TAB_IDS, isHomologated } from './routes.js';
import { search, highlightSegments } from './search.js';

/** Rota associada a cada elemento de navegação. */
export const ROUTES = new WeakMap();

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** Botão que navega para uma rota interna. */
function nav(route, props, ...children) {
  const el = h('button', { type: 'button', ...props }, ...children);
  ROUTES.set(el, route);
  return el;
}

function backBar(label) {
  return h('div', { class: 'cbib-topbar' },
    h('button', { type: 'button', class: 'cbib-iconbtn', 'data-action': 'back', 'aria-label': 'Voltar' }, icon('back')),
    h('span', { class: 'cbib-topbar__label' }, label));
}

function stateBadge(states, key, extra) {
  const s = Object.prototype.hasOwnProperty.call(states, key) ? states[key] : states.demo;
  return h('span', { class: `cbib-badge cbib-badge--${s.tone}` }, extra ? `${s.label} · ${extra}` : s.label);
}

function screenTitle(text, cls = 'cbib-page-title cbib-page-title--lg') {
  return h('h2', { class: cls, tabindex: '-1', 'data-screen-title': '' }, text);
}

function countAvailable(cat) { return cat.topics.filter((t) => t.status === 'available').length; }
function availabilityLabel(cat) {
  const total = cat.topics.length;
  const ok = countAvailable(cat);
  if (!total) return 'Fichas em preparação';
  if (!ok) return `${plural(total, 'assunto', 'assuntos')} · em preparação`;
  return `${ok} de ${plural(total, 'assunto', 'assuntos')} com ficha`;
}

function searchField({ id, placeholder, value = '', label, extraClass = '', withClear = false, filter }) {
  const input = h('input', {
    id, class: 'cbib-search__input', type: 'search', placeholder, autocomplete: 'off', enterkeyhint: 'search',
    spellcheck: 'false', maxlength: '120',
    // Mantém o teclado nativo: js/keyboard.js liga o teclado numérico a input[inputmode].
    'data-native-keyboard': '1',
    'data-filter': filter,
  });
  input.value = value;
  return h('form', { class: `cbib-search ${extraClass}`.trim(), role: 'search', 'data-search': id },
    h('label', { class: 'cbib-sr-only', for: id }, label),
    icon('search', 'cbib-search__icon'),
    input,
    withClear ? h('button', { type: 'button', class: 'cbib-iconbtn cbib-iconbtn--sm cbib-search__clear', 'data-action': 'clear', 'aria-label': 'Limpar busca', hidden: !value }, icon('close')) : null);
}

/* ------------------------------------------------------------------ home */

export function homeView({ data }) {
  const { categories, REVIEW_STATES } = data;
  const featured = categories.find((c) => c.tier === 'featured');
  const secondary = categories.filter((c) => c.tier === 'secondary');
  const others = categories.filter((c) => c.tier === 'other');

  return [
    h('section', { class: 'cbib-hero cbib-hero--home', 'aria-label': 'Biblioteca Técnica' },
      h('span', { class: 'cbib-kicker' }, 'Acervo técnico'),
      screenTitle('Biblioteca', 'cbib-page-title'),
      h('p', { class: 'cbib-display' }, 'Conhecimento para aplicar na prática.'),
      searchField({ id: 'cbib-home-search', placeholder: 'Buscar documentos e assuntos...', label: 'Buscar na Biblioteca' })),

    h('section', { class: 'cbib-block cbib-block--areas', 'aria-labelledby': 'cbib-areas-title' },
      h('div', { class: 'cbib-section-head' },
        h('h3', { id: 'cbib-areas-title', class: 'cbib-eyebrow' }, 'Áreas de conhecimento'),
        h('span', { class: 'cbib-section-head__meta' }, `${categories.length} áreas`)),

      featured ? nav({ name: 'categoria', id: featured.id }, { class: 'cbib-feature' },
        h('span', { class: 'cbib-feature__top' },
          h('span', { class: 'cbib-feature__eyebrow' }, featured.eyebrow || 'Área em destaque'),
          h('span', { class: 'cbib-badge cbib-badge--ok' }, availabilityLabel(featured))),
        art('micrometer'),
        h('span', { class: 'cbib-feature__body' },
          h('span', { class: 'cbib-feature__title' }, featured.title),
          h('span', { class: 'cbib-feature__text' }, featured.short),
          h('span', { class: 'cbib-feature__topics' }, featured.topics.map((t) => h('span', { class: 'cbib-feature__topic' }, t.title)))),
        h('span', { class: 'cbib-feature__cta' }, 'Abrir área', icon('arrow'))) : null,

      h('div', { class: 'cbib-grid' },
        secondary.map((c) => nav({ name: 'categoria', id: c.id }, { class: 'cbib-card' },
          h('span', { class: 'cbib-card__icon' }, icon(c.icon)),
          h('span', { class: 'cbib-card__title' }, c.title),
          h('span', { class: 'cbib-card__text' }, c.short),
          h('span', { class: 'cbib-card__meta' }, availabilityLabel(c))))),

      h('h3', { class: 'cbib-subhead' }, 'Outras áreas'),
      h('ul', { class: 'cbib-rows' },
        others.map((c) => h('li', null, nav({ name: 'categoria', id: c.id }, { class: 'cbib-row' },
          h('span', { class: 'cbib-row__icon' }, icon(c.icon)),
          h('span', { class: 'cbib-row__main' },
            h('span', { class: 'cbib-row__title' }, c.title),
            h('span', { class: 'cbib-row__sub' }, c.short)),
          icon('chev', 'cbib-row__chev')))))),

    h('section', { class: 'cbib-block', 'aria-labelledby': 'cbib-trace-title' },
      h('h3', { class: 'cbib-eyebrow' }, 'Leitura técnica'),
      h('article', { class: 'cbib-trust' },
        h('div', { class: 'cbib-trust__head' },
          h('span', { class: 'cbib-trust__icon' }, icon('shield')),
          h('h4', { id: 'cbib-trace-title', class: 'cbib-trust__title' }, 'Conteúdo com rastreabilidade')),
        h('p', { class: 'cbib-trust__lead' }, 'Cada ficha mostra de onde vem a informação, quem revisou e em que estado está. Você sabe o que pode aplicar e o que ainda está em validação.'),
        h('ul', { class: 'cbib-trust__list' },
          [['source', 'Fontes documentais', 'Manuais e normas vinculados a cada ficha.'],
            ['history', 'Revisões versionadas', 'Histórico de versões, autor e revisor técnico.'],
            ['check', 'Estados de validação', 'Indicados no topo de cada ficha.']]
            .map(([i, t, d]) => h('li', null, icon(i), h('div', null, h('b', null, t), h('span', null, d))))),
        h('div', { class: 'cbib-trust__states', 'aria-label': 'Estados de validação' },
          Object.keys(REVIEW_STATES).map((k) => stateBadge(REVIEW_STATES, k))))),

    h('p', { class: 'cbib-footnote' }, 'Biblioteca Técnica em preparação. O conteúdo exibido é demonstrativo e não homologado.'),
  ];
}

/* ------------------------------------------------------------- categoria */

export function topicRow(t, topicStatus) {
  const ok = t.status === 'available' && t.sheetId;
  const main = h('span', { class: 'cbib-row__main' },
    h('span', { class: 'cbib-row__title' }, t.title),
    h('span', { class: 'cbib-row__sub' }, t.summary),
    h('span', { class: `cbib-status${ok ? ' cbib-status--ok' : ''}` }, ok ? icon('check') : null, topicStatus[t.status] || topicStatus.planned));
  return h('li', null, ok
    ? nav({ name: 'ficha', id: t.sheetId }, { class: 'cbib-row cbib-row--topic' }, main, icon('chev', 'cbib-row__chev'))
    : h('button', { type: 'button', class: 'cbib-row cbib-row--topic cbib-row--planned', 'data-planned': t.title }, main));
}

export function categoryView({ data }, route) {
  const cat = data.categories.find((c) => c.id === route.id);
  const total = cat.topics.length;
  const ok = countAvailable(cat);

  return [
    backBar('Biblioteca'),
    h('section', { class: 'cbib-hero cbib-hero--sub' },
      h('span', { class: 'cbib-eyebrow cbib-eyebrow--accent' }, icon(cat.icon), 'Área de conhecimento'),
      screenTitle(cat.title),
      h('p', { class: 'cbib-lede cbib-lede--sm' }, cat.description),
      h('p', { class: 'cbib-counts', 'aria-label': `${plural(total, 'assunto', 'assuntos')}, ${plural(ok, 'ficha disponível', 'fichas disponíveis')}` },
        h('span', { 'aria-hidden': 'true' }, h('b', null, String(total)), total === 1 ? ' assunto' : ' assuntos'),
        h('span', { class: 'cbib-counts__ok', 'aria-hidden': 'true' }, h('b', null, String(ok)), ok === 1 ? ' ficha disponível' : ' fichas disponíveis')),
      total ? searchField({ id: 'cbib-cat-search', placeholder: `Buscar em ${cat.title.toLowerCase()}...`, label: 'Buscar nesta área', extraClass: 'cbib-search--sm', filter: cat.id }) : null),

    h('section', { class: 'cbib-block cbib-block--list', 'aria-label': 'Assuntos' },
      total ? [
        h('div', { class: 'cbib-section-head' },
          h('h3', { class: 'cbib-eyebrow' }, 'Assuntos'),
          h('span', { class: 'cbib-section-head__meta', id: 'cbib-cat-count', 'aria-live': 'polite' }, plural(total, 'item', 'itens'))),
        h('ul', { class: 'cbib-rows', id: 'cbib-topic-list' }, cat.topics.map((t) => topicRow(t, data.TOPIC_STATUS))),
        h('div', { class: 'cbib-empty', id: 'cbib-topic-empty', hidden: true },
          h('p', { class: 'cbib-empty__title' }, 'Nenhum assunto encontrado'),
          h('p', { class: 'cbib-empty__text' }, 'Tente outro termo ou busque em toda a Biblioteca.'),
          nav({ name: 'busca', q: '' }, { class: 'cbib-btn cbib-btn--ghost', id: 'cbib-topic-empty-all' }, icon('search'), 'Buscar em toda a Biblioteca')),
      ] : h('div', { class: 'cbib-empty' },
        h('span', { class: 'cbib-empty__icon' }, icon('layers')),
        h('p', { class: 'cbib-empty__title' }, 'Fichas em preparação'),
        h('p', { class: 'cbib-empty__text' }, 'Esta área ainda não tem fichas publicadas. Elas aparecem aqui depois da revisão técnica.'))),
  ];
}

/* ------------------------------------------------------------------ ficha */

function psec(title, ...children) {
  return h('section', { class: 'cbib-psec' }, h('h3', { class: 'cbib-psec__h' }, title), ...children);
}

function identList(rows, compact = false) {
  return h('dl', { class: `cbib-ident${compact ? ' cbib-ident--compact' : ''}` },
    rows.map(([k, v, mono]) => h('div', null, h('dt', null, k), h('dd', { class: mono ? 'cbib-mono' : null }, v))));
}

/**
 * Destino de um assunto relacionado: só navega quando o assunto está disponível
 * e a ficha dele existe nos dados exibidos. Caso contrário, devolve null e a
 * linha continua como "em preparação" (comportamento anterior, sem mudança).
 */
export function relatedSheetId(topicId, data) {
  if (typeof topicId !== 'string') return null;
  for (const c of data.categories) {
    const t = c.topics.find((x) => x.id === topicId);
    if (!t) continue;
    const ok = t.status === 'available' && typeof t.sheetId === 'string'
      && Object.prototype.hasOwnProperty.call(data.sheets, t.sheetId);
    return ok ? t.sheetId : null;
  }
  return null;
}

function relatedTopicRow(r, data) {
  const sheetId = relatedSheetId(r.target, data);
  const main = (status) => h('span', { class: 'cbib-row__main' },
    h('span', { class: 'cbib-row__title' }, r.label),
    h('span', { class: 'cbib-row__sub' }, `${r.hint} · ${status}`));
  if (sheetId) {
    return nav({ name: 'ficha', id: sheetId }, { class: 'cbib-row cbib-row--compact' },
      h('span', { class: 'cbib-row__icon' }, icon('doc')),
      main(data.TOPIC_STATUS.available),
      icon('chev', 'cbib-row__chev'));
  }
  return h('button', { type: 'button', class: 'cbib-row cbib-row--compact', 'data-planned': r.label },
    h('span', { class: 'cbib-row__icon' }, icon('doc')),
    main(data.TOPIC_STATUS.planned));
}

/** Procedimentos em blocos ({ title, steps }) quando a ficha os tiver; senão null (usa `procedure`). */
export function procedureBlocks(s) {
  if (!Array.isArray(s.procedures)) return null;
  const blocks = s.procedures.filter((b) => b && typeof b.title === 'string' && Array.isArray(b.steps) && b.steps.length);
  return blocks.length ? blocks : null;
}

function panelVisao(s, cat, data) {
  const st = data.REVIEW_STATES[s.reviewState] || data.REVIEW_STATES.demo;
  return [
    psec('Resumo técnico', h('p', { class: 'cbib-sheet__lead' }, s.summary)),
    psec('Identificação da ficha', identList([
      ['Código', s.code, true], ['Área', cat.title], ['Assunto', s.title],
      ['Versão', s.version, true], ['Estado', st.label], ['Nível', s.level]])),
    psec('Conceitos fundamentais', h('dl', { class: 'cbib-terms' },
      s.concepts.map((c) => h('div', null, h('dt', null, c.term), h('dd', null, c.text))))),
    psec('Princípio de funcionamento', h('div', { class: 'cbib-callout' }, h('p', null, s.principle))),
    psec('Relacionados', h('ul', { class: 'cbib-rows' },
      (s.related || []).filter((r) => r.kind === 'topic').map((r) => h('li', null, relatedTopicRow(r, data))),
      h('li', null, nav({ name: 'categoria', id: cat.id }, { class: 'cbib-row cbib-row--compact' },
        h('span', { class: 'cbib-row__icon' }, icon(cat.icon)),
        h('span', { class: 'cbib-row__main' },
          h('span', { class: 'cbib-row__title' }, 'Ver todos os assuntos'),
          h('span', { class: 'cbib-row__sub' }, cat.title)),
        icon('chev', 'cbib-row__chev'))))),
  ];
}

function panelUso(s) {
  const figs = (s.illustrations || []).map((f) => [f, art(f.id)]).filter(([, svg]) => svg);
  return [
    figs.map(([f, svg]) => h('figure', { class: 'cbib-figure' }, svg, h('figcaption', null, f.caption))),
    psec('Procedimento geral',
      procedureBlocks(s)
        ? procedureBlocks(s).map((b) => h('section', { class: 'cbib-proc' },
          h('h4', { class: 'cbib-proc__h' }, b.title),
          h('ol', { class: 'cbib-steps' }, b.steps.map((p) => h('li', null, p)))))
        : h('ol', { class: 'cbib-steps' }, (s.procedure || []).map((p) => h('li', null, p))),
      h('p', { class: 'cbib-hint' }, 'Sequência geral. Siga sempre o manual do instrumento e o procedimento da sua empresa.')),
    figs.length ? null : h('p', { class: 'cbib-hint' }, 'Nenhuma ilustração disponível para esta ficha.'),
  ];
}

function panelCuidados(s) {
  const errors = s.cautions.filter((c) => c.kind !== 'alerta');
  const alerts = s.cautions.filter((c) => c.kind === 'alerta');
  return [
    h('section', { class: 'cbib-psec' },
      h('h3', { class: 'cbib-psec__h' }, 'Erros comuns ', h('span', { class: 'cbib-psec__count' }, String(errors.length))),
      h('ul', { class: 'cbib-cautions' }, errors.map((c) => h('li', null, h('b', null, c.title), h('span', null, c.text))))),
    alerts.length ? psec('Alertas', h('ul', { class: 'cbib-cautions cbib-cautions--alert' },
      alerts.map((c) => h('li', null, icon('alert'), h('div', null, h('b', null, c.title), h('span', null, c.text)))))) : null,
    s.conservation?.length ? psec('Conservação e utilização', h('ul', { class: 'cbib-checklist' },
      s.conservation.map((t) => h('li', null, icon('check'), h('span', null, t))))) : null,
  ];
}

function panelFontes(s, cat, data) {
  const st = data.REVIEW_STATES[s.reviewState] || data.REVIEW_STATES.demo;
  return [
    psec('Estado de homologação', h('div', { class: 'cbib-review' },
      h('div', { class: 'cbib-review__now' }, stateBadge(data.REVIEW_STATES, s.reviewState, isHomologated(s) ? '' : 'não homologada'), h('p', null, st.description)),
      h('ol', { class: 'cbib-track', 'aria-label': 'Etapas de validação. Nenhuma etapa concluída.' },
        ['draft', 'review', 'validated'].map((k) => h('li', { class: 'cbib-track__step' }, h('span', { class: 'cbib-track__dot' }), data.REVIEW_STATES[k].label))))),
    psec('Referências documentais',
      h('ul', { class: 'cbib-refs' }, s.references.map((r) => h('li', null,
        h('span', { class: 'cbib-refs__icon' }, icon('doc')),
        h('span', { class: 'cbib-refs__main' }, h('b', null, r.label), h('span', null, r.note)),
        h('span', { class: 'cbib-badge cbib-badge--muted' }, 'Pendente')))),
      h('p', { class: 'cbib-hint' }, 'Nenhuma referência foi vinculada nesta demonstração. Na versão homologada, cada item aponta para o documento e o trecho de origem.')),
    psec('Autoria', identList([['Autor', s.review.author], ['Revisor técnico', s.review.reviewer], ['Última revisão', s.review.updated]], true)),
    psec('Versão e histórico',
      identList([['Versão atual', s.version, true]], true),
      h('ul', { class: 'cbib-history' }, s.review.history.map((x) => h('li', null, h('span', { class: 'cbib-mono' }, `v${x.version}`), x.note)))),
  ];
}

const PANELS = { visao: panelVisao, uso: panelUso, cuidados: panelCuidados, fontes: panelFontes };

/** Conteúdo do painel da aba (usado na troca de aba sem redesenhar a tela). */
export function panelContent({ data }, s, tab) {
  const cat = data.categories.find((c) => c.id === s.categoryId);
  const next = SHEET_TABS[TAB_IDS.indexOf(tab) + 1];
  return [
    PANELS[tab](s, cat, data),
    next ? h('button', { type: 'button', class: 'cbib-next', 'data-tab-go': next.id },
      h('span', null, h('small', null, 'Próxima seção'), next.label), icon('arrow')) : null,
  ];
}

/** Aviso exibido em toda ficha não homologada (derivado do estado, não fixo no texto). */
function unhomologatedNotice(s, data) {
  if (isHomologated(s)) return null;
  const known = Object.prototype.hasOwnProperty.call(data.REVIEW_STATES, s.reviewState);
  const lead = !known || s.reviewState === 'demo' ? 'Demonstração não homologada.' : `${data.REVIEW_STATES[s.reviewState].label}: conteúdo não homologado.`;
  return h('div', { class: 'cbib-notice cbib-notice--compact', role: 'note', 'data-unhomologated': '' },
    icon('alert'),
    h('p', null, h('b', null, lead), ' Não use como referência técnica nem para aprovar peças.'));
}

export function sheetView(ctx, route) {
  const { data } = ctx;
  const s = data.sheets[route.id];
  const cat = data.categories.find((c) => c.id === s.categoryId);
  const tab = route.tab;

  const panel = h('div', { class: 'cbib-panel', id: 'cbib-sheet-panel', role: 'tabpanel', 'aria-labelledby': `cbib-tab-${tab}`, tabindex: '0' },
    panelContent(ctx, s, tab));

  return [
    backBar(cat ? cat.title : 'Biblioteca'),
    h('article', { class: 'cbib-sheet', 'data-sheet': s.id },
      h('header', { class: 'cbib-sheet__header' },
        h('div', { class: 'cbib-sheet__chips' },
          h('span', { class: 'cbib-code' }, s.code),
          stateBadge(data.REVIEW_STATES, s.reviewState, isHomologated(s) ? '' : 'não homologada')),
        screenTitle(s.title),
        h('p', { class: 'cbib-sheet__subtitle' }, s.subtitle),
        h('p', { class: 'cbib-sheet__meta' },
          h('span', null, s.level), h('span', null, `${s.readingTime} de leitura`), h('span', { class: 'cbib-mono' }, `v${s.version}`))),
      unhomologatedNotice(s, data),
      h('div', { class: 'cbib-tabs', role: 'tablist', 'aria-label': 'Seções da ficha' },
        SHEET_TABS.map((t) => h('button', {
          type: 'button', role: 'tab', id: `cbib-tab-${t.id}`,
          class: `cbib-tabs__tab${t.id === tab ? ' cbib-is-on' : ''}`,
          'aria-selected': String(t.id === tab), 'aria-controls': 'cbib-sheet-panel',
          tabindex: t.id === tab ? '0' : '-1', 'data-tab': t.id,
        }, icon(t.icon), h('span', null, t.label)))),
      panel),
    nav({ name: 'consultor', id: s.id }, { class: 'cbib-fab', 'aria-label': 'Perguntar ao Consultor sobre esta ficha' }, icon('chat'), h('span', null, 'Consultor')),
  ];
}

/* -------------------------------------------------------------- consultor */

export function consultorView({ data }, route) {
  const s = data.sheets[route.id];
  const st = data.REVIEW_STATES[s.reviewState] || data.REVIEW_STATES.demo;
  return [
    backBar('Ficha técnica'),
    h('section', { class: 'cbib-hero cbib-hero--sub' },
      h('span', { class: 'cbib-badge cbib-badge--info cbib-badge--lg' }, 'Integração demonstrativa'),
      screenTitle('Perguntar ao Consultor'),
      h('p', { class: 'cbib-lede' }, 'Como a ficha técnica será entregue ao Consultor como contexto. Nesta fase não há conexão com o Consultor real e nenhuma resposta é gerada.')),
    h('section', { class: 'cbib-block', 'aria-labelledby': 'cbib-flow-title' },
      h('h3', { id: 'cbib-flow-title', class: 'cbib-eyebrow' }, 'Fluxo'),
      h('ol', { class: 'cbib-flow' },
        h('li', { class: 'cbib-flow__step' }, h('span', { class: 'cbib-flow__icon' }, icon('doc')),
          h('div', null, h('b', null, 'Ficha técnica'), h('span', null, `${s.code} · ${s.title}`))),
        h('li', { class: 'cbib-flow__arrow', 'aria-hidden': 'true' }, icon('down')),
        h('li', { class: 'cbib-flow__step cbib-flow__step--accent' }, h('span', { class: 'cbib-flow__icon' }, icon('chat')),
          h('div', null, h('b', null, 'Consultor'), h('span', null, 'Recebe a pergunta junto com a ficha aberta'))),
        h('li', { class: 'cbib-flow__arrow', 'aria-hidden': 'true' }, icon('down')),
        h('li', { class: 'cbib-flow__step cbib-flow__step--blue' }, h('span', { class: 'cbib-flow__icon' }, icon('layers')),
          h('div', null, h('b', null, 'Contexto da ficha'), h('span', null, 'Resposta limitada ao conteúdo e às fontes da ficha'))))),
    h('section', { class: 'cbib-block', 'aria-labelledby': 'cbib-ctx-title' },
      h('h3', { id: 'cbib-ctx-title', class: 'cbib-eyebrow' }, 'Prévia da tela do Consultor'),
      h('div', { class: 'cbib-consult' },
        h('div', { class: 'cbib-consult__ctx' },
          h('span', { class: 'cbib-consult__ctx-label' }, 'Contexto anexado'),
          h('div', { class: 'cbib-consult__ctx-card' },
            h('span', { class: 'cbib-refs__icon' }, icon('doc')),
            h('span', { class: 'cbib-refs__main' }, h('b', null, `${s.title} — ${s.subtitle}`), h('span', { class: 'cbib-mono' }, `${s.code} · v${s.version} · ${st.label}`)))),
        h('p', { class: 'cbib-consult__label' }, 'Perguntas de exemplo'),
        h('div', { class: 'cbib-chips' }, (s.consultorExamples || []).map((q) => h('button', { type: 'button', class: 'cbib-chip', 'data-action': 'demo-question' }, q))),
        h('div', { class: 'cbib-consult__input', 'aria-disabled': 'true' },
          h('span', null, 'Disponível após a integração'),
          h('span', { class: 'cbib-consult__send' }, icon('arrow')))),
      h('div', { class: 'cbib-notice cbib-notice--info', role: 'note' },
        icon('alert'),
        h('p', null, h('b', null, 'Demonstração.'), ' Esta tela não envia perguntas, não acessa o Consultor atual e não gera respostas.')),
      h('button', { type: 'button', class: 'cbib-btn cbib-btn--ghost', 'data-action': 'back' }, icon('back'), 'Voltar à ficha')),
  ];
}

/* ------------------------------------------------------------------ busca */

const TYPE_LABEL = { ficha: 'Fichas técnicas', assunto: 'Assuntos', area: 'Áreas' };
const SUGGESTIONS = ['micrômetro', 'catraca', 'paralaxe', 'roscas', 'tolerancia'];

export function countLabel(index, q) {
  if (!q.trim()) return '';
  const n = search(index, q).length;
  return n ? plural(n, 'resultado', 'resultados') : 'Nenhum resultado';
}

export function resultsContent({ data, index }, q) {
  if (!q.trim()) {
    return [
      h('div', { class: 'cbib-section-head' }, h('h3', { class: 'cbib-eyebrow' }, 'Sugestões')),
      h('div', { class: 'cbib-chips' }, SUGGESTIONS.map((s) => h('button', { type: 'button', class: 'cbib-chip', 'data-suggest': s }, icon('search'), s))),
      h('p', { class: 'cbib-hint' }, 'A busca ignora acentos e maiúsculas e procura em títulos, resumos e no conteúdo das fichas.'),
    ];
  }
  const res = search(index, q);
  if (!res.length) {
    return h('div', { class: 'cbib-empty' },
      h('span', { class: 'cbib-empty__icon' }, icon('search')),
      h('p', { class: 'cbib-empty__title' }, `Nenhum resultado para “${q.trim()}”`),
      h('p', { class: 'cbib-empty__text' }, 'Confira a grafia, use menos palavras ou tente um termo mais geral, como “medição”.'));
  }
  return ['ficha', 'assunto', 'area'].map((type) => {
    const list = res.filter((r) => r.type === type);
    if (!list.length) return null;
    return [
      h('div', { class: 'cbib-section-head' }, h('h3', { class: 'cbib-eyebrow' }, TYPE_LABEL[type]), h('span', { class: 'cbib-section-head__meta' }, String(list.length))),
      h('ul', { class: 'cbib-rows' }, list.map((r) => h('li', null, nav(r.route, { class: 'cbib-row' },
        h('span', { class: `cbib-row__icon${type === 'ficha' ? ' cbib-row__icon--accent' : ''}` }, icon(r.icon)),
        h('span', { class: 'cbib-row__main' },
          h('span', { class: 'cbib-row__title' }, highlightSegments(r.title, q).map((seg) => (seg.mark ? h('mark', null, seg.text) : seg.text))),
          h('span', { class: 'cbib-row__sub' }, r.sub),
          r.where ? h('span', { class: 'cbib-row__where' }, `Encontrado em: ${r.where}`) : null,
          r.state ? stateBadge(data.REVIEW_STATES, r.state) : null),
        icon('chev', 'cbib-row__chev'))))),
    ];
  });
}

export function searchView(ctx, route) {
  return [
    h('div', { class: 'cbib-topbar cbib-topbar--search' },
      h('button', { type: 'button', class: 'cbib-iconbtn', 'data-action': 'back', 'aria-label': 'Voltar' }, icon('back')),
      searchField({ id: 'cbib-q', placeholder: 'Buscar documentos e assuntos...', value: route.q, label: 'Buscar documentos e assuntos', extraClass: 'cbib-search--bar', withClear: true })),
    screenTitle('Busca na Biblioteca', 'cbib-sr-only'),
    h('p', { class: 'cbib-result-count', id: 'cbib-result-count', 'aria-live': 'polite' }, countLabel(ctx.index, route.q)),
    h('section', { class: 'cbib-block cbib-block--tight', id: 'cbib-results' }, resultsContent(ctx, route.q)),
  ];
}

/* --------------------------------------------------------------- notfound */

export function notFoundView() {
  return [
    backBar('Biblioteca'),
    h('div', { class: 'cbib-empty cbib-empty--page' },
      h('h2', { class: 'cbib-empty__title', tabindex: '-1', 'data-screen-title': '' }, 'Conteúdo não encontrado'),
      h('p', { class: 'cbib-empty__text' }, 'O item que você tentou abrir não existe na Biblioteca.'),
      nav({ name: 'home' }, { class: 'cbib-btn cbib-btn--ghost' }, 'Ir para a Biblioteca')),
  ];
}
