// @ts-check
// Tela de um ciclo do Guia CNC (design 2.1): abas Visão geral, Trajetória, Parâmetros, Exemplo e Cuidados.
// Dados: banco canônico (abas referencia/exemplo) + conteúdo estendido schema_version 2 (rascunho em revisão).
import { h, icon } from './dom.js';
import { ilustracaoEixo, miniaturaPasso, figuraCorte, figuraTrajetoria } from './figuras.js';
import { calcularPasses, formatarMm } from '../trajetoria.js';
import { CONTEUDO_V2 } from '../conteudo2.js';
import { showToast } from '../../../utils.js';

const STATUS = { em_revisao: ['Em revisão técnica', ''], revisado: ['Revisado', 'ok'] };
const NOME_ROTULO = { visao: 'Visão geral', trajetoria: 'Trajetória', referencia: 'Parâmetros', exemplo: 'Exemplo', cuidados: 'Cuidados' };
const ICONE_ABA = { visao: 'doc', trajetoria: 'path', referencia: 'gear', exemplo: 'bars', cuidados: 'warn' };

/** @param {string} texto */
async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    showToast('Copiado!', 'success');
  } catch {
    showToast('Não foi possível copiar', 'error');
  }
}

/** Realça letras de código G (G, M, P, Q, R, X, Z, F, S, T, U) seguidas de número. @param {string} linha */
function realcar(linha) {
  const frag = document.createDocumentFragment();
  let ultimo = 0;
  for (const m of linha.matchAll(/\b([GMPQRXZFSTU])(?=[\d(\-.])/g)) {
    const i = m.index ?? 0;
    if (i > ultimo) frag.append(document.createTextNode(linha.slice(ultimo, i)));
    frag.append(h('span', { class: 'gx-a', text: m[1] }));
    ultimo = i + 1;
  }
  frag.append(document.createTextNode(linha.slice(ultimo)));
  return frag;
}

/** @param {string} texto @param {string} [rotulo] */
function botaoCopiar(texto, rotulo = 'Copiar', mini = false) {
  return h('button', {
    type: 'button', class: mini ? 'gx-cp gx-cp-mini' : 'gx-cp', text: rotulo,
    'aria-label': mini ? 'Copiar linha' : rotulo, onclick: () => { void copiar(texto); }
  });
}

/** @param {string} texto @param {() => void} [aoClicar] */
function aviso(texto, aoClicar) {
  const conteudo = [icon('warn', 20), h('span', { text: texto }), aoClicar ? icon('chev', 20) : null];
  return aoClicar
    ? h('button', { type: 'button', class: 'gx-alert', onclick: aoClicar }, ...conteudo)
    : h('div', { class: 'gx-alert gx-alert-static' }, ...conteudo);
}

/** @param {string} nomeIcone @param {string} titulo @param {string|null} sub @param {() => void} aoClicar @param {boolean} [principal] */
function linha(nomeIcone, titulo, sub, aoClicar, principal = false) {
  return h('button', { type: 'button', class: principal ? 'gx-irow gx-irow-main' : 'gx-irow', onclick: aoClicar },
    icon(/** @type {any} */ (nomeIcone), 24),
    sub ? h('span', {}, titulo, h('small', { text: sub })) : h('span', { text: titulo }),
    h('span', { class: 'gx-go' }, icon('chev', 20)));
}

/**
 * @param {HTMLElement} container
 * @param {import('../types.js').Cycle} cycle
 * @param {import('../types.js').Target} target alvo resolvido (aba/acordeão)
 * @param {string|null} abaInicial aba pedida na rota, ou null para a primeira
 */
export function renderCycleView(container, cycle, target, abaInicial) {
  const extra = CONTEUDO_V2.ciclos[cycle.meta.id] || null;
  const abaBanco = (/** @type {string} */ id) => cycle.abas.find((a) => a.id === id);
  const refer = abaBanco('referencia');
  const exemplo = abaBanco('exemplo');

  /** @type {string[]} */
  const abas = [];
  if (extra) abas.push('visao', 'trajetoria');
  if (refer) abas.push('referencia');
  if (exemplo) abas.push('exemplo');
  if (extra) abas.push('cuidados');

  const view = h('article', { class: 'gx-cycle' });
  const painel = /** @type {Record<string, HTMLElement>} */ ({});
  const botoes = /** @type {Record<string, HTMLElement>} */ ({});
  let ativa = abas.includes(abaInicial || '') ? /** @type {string} */ (abaInicial) : abas[0];
  /** @type {ReturnType<typeof setInterval>|null} */
  let relogio = null;
  let passeAtual = 1;
  let parametroSel = '';

  function pararReproducao() {
    if (relogio) clearInterval(relogio);
    relogio = null;
    const b = view.querySelector('[data-play]');
    if (b) b.textContent = 'Reproduzir';
  }

  /** @param {string} id */
  function irPara(id) {
    if (!painel[id]) return;
    if (id !== 'trajetoria') pararReproducao();
    ativa = id;
    for (const k of abas) {
      painel[k].hidden = k !== id;
      botoes[k].setAttribute('aria-selected', String(k === id));
    }
    botoes[id].scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }

  // ─── Cabeçalho ───
  const st = extra ? STATUS[extra.status] : null;
  view.append(h('div', { class: 'gx-head' },
    h('span', { class: 'gx-bar' }),
    h('div', { class: 'gx-head-text' },
      h('h2', { text: cycle.meta.codigo.toUpperCase() }),
      h('small', { text: cycle.meta.titulo }),
      st ? h('span', { class: `gx-rev ${st[1]}`, text: st[0] }) : null,
      extra ? h('small', { class: 'gx-variante', text: extra.variante }) : null)));
  if (extra) view.append(h('div', { class: 'gx-pad' }, aviso('Confira a variante do controle.', () => irPara('cuidados'))));

  // ─── Abas ───
  const lista = h('div', { class: 'gx-tabs', role: 'tablist', 'aria-label': 'Seções do ciclo' });
  for (const id of abas) {
    const b = h('button', {
      type: 'button', role: 'tab', class: 'gx-tab', 'aria-selected': String(id === ativa),
      dataset: { action: `tab-${id}` }, onclick: () => irPara(id)
    }, icon(/** @type {any} */ (ICONE_ABA[/** @type {keyof typeof ICONE_ABA} */ (id)]), 22), h('span', { text: NOME_ROTULO[/** @type {keyof typeof NOME_ROTULO} */ (id)] }));
    botoes[id] = b;
    lista.append(b);
  }
  view.append(lista);

  const calcLinha = () => extra && linha('calc', 'Calculadora relacionada', extra.calc, () => {
    window.dispatchEvent(new CustomEvent('casillas:navigate-module', { detail: { key: extra.calcKey } }));
  });
  const linhaCuidados = () => linha('warn', 'Cuidados', 'Erros comuns e limitações', () => irPara('cuidados'));

  // ─── Visão geral ───
  if (extra) {
    const detalhe = h('div', { class: 'gx-box', hidden: true });
    let detalheAberto = '';
    /** @param {string} chave @param {string[]} itens @param {boolean} marcador */
    const alternar = (chave, itens, marcador) => {
      if (detalheAberto === chave && !detalhe.hidden) { detalhe.hidden = true; return; }
      detalheAberto = chave;
      detalhe.replaceChildren(...itens.map((x) => h('p', { text: (marcador ? '• ' : '') + x })));
      detalhe.hidden = false;
    };
    painel.visao = h('div', { class: 'gx-panel', 'data-tab-id': 'visao' },
      h('div', { class: 'gx-ctx' }, ...extra.contexto.map((c) => h('span', { text: c }))),
      h('div', { class: 'gx-box gx-apl' },
        h('div', { class: 'gx-apl-t' }, icon('target', 30), h('div', {}, h('h3', { text: 'Aplicação' }), h('p', { text: extra.aplicacao }))),
        h('figure', {}, ilustracaoEixo())),
      linha('clip', 'Pré-condições', null, () => alternar('pre', extra.precond, true)),
      linha('info', 'Observações', null, () => alternar('obs', extra.obs, true)),
      linha('book', 'Fonte e revisão', 'Revisão técnica pendente.', () => alternar('fonte', [extra.fonte, 'Revisão técnica pendente.'], false)),
      detalhe,
      linha('doc', 'Ver parâmetros', null, () => irPara('referencia'), true),
      linhaCuidados(),
      calcLinha());
  }

  // ─── Trajetória ───
  if (extra) {
    const passes = calcularPasses(extra.traj);
    const total = passes.length;
    const area = h('div', { class: 'gx-tjv' });
    const slider = /** @type {HTMLInputElement} */ (h('input', {
      type: 'range', class: 'gx-slider', min: 1, max: Math.max(total, 1), value: 1, 'aria-label': 'Número do passe'
    }));
    const desenhar = () => {
      if (!total) { area.replaceChildren(h('p', { class: 'gx-muted', text: 'Sem dados de passes para este ciclo.' })); return; }
      passeAtual = Math.min(Math.max(passeAtual, 1), total);
      const p = passes[passeAtual - 1];
      slider.value = String(passeAtual);
      area.replaceChildren(
        h('div', { class: 'gx-pass' },
          h('div', {}, h('small', { text: 'Passe' }), h('b', {}, String(passeAtual), h('i', { text: ` de ${total}` }))),
          h('span', { class: p.tipo === 'acabamento' ? 'gx-tag gx-tag-fin' : 'gx-tag', text: p.tipo === 'acabamento' ? 'Acabamento' : 'Desbaste' })),
        h('div', { class: 'gx-kpis' },
          h('div', {}, h('small', { text: 'Profundidade acumulada' }), h('b', { text: `${formatarMm(p.d)} mm` })),
          h('div', {}, h('small', { text: 'Este passe remove' }), h('b', { text: p.inc ? `${formatarMm(p.inc)} mm` : 'nada (alívio)' }))),
        h('figure', {}, figuraCorte(extra.traj, passes, passeAtual)),
        h('figure', {}, figuraTrajetoria(passes, passeAtual)));
    };
    const reproduzir = () => {
      if (relogio) { pararReproducao(); return; }
      if (passeAtual >= total) passeAtual = 1;
      const botao = view.querySelector('[data-play]');
      if (botao) botao.textContent = 'Pausar';
      const passo = () => {
        if (!view.isConnected) { pararReproducao(); return; }
        desenhar();
        if (passeAtual >= total) { pararReproducao(); return; }
        passeAtual++;
      };
      passo();
      relogio = setInterval(passo, 700);
    };
    slider.addEventListener('input', () => { pararReproducao(); passeAtual = Number(slider.value); desenhar(); });
    const t = extra.traj;
    painel.trajetoria = h('div', { class: 'gx-panel', 'data-tab-id': 'trajetoria', hidden: true },
      h('div', { class: 'gx-player' },
        h('button', { type: 'button', class: 'gx-pbtn', 'aria-label': 'Passe anterior', onclick: () => { pararReproducao(); passeAtual--; desenhar(); } }, '‹'),
        h('button', { type: 'button', class: 'gx-pbtn gx-pbtn-play', 'data-play': '1', onclick: reproduzir }, 'Reproduzir'),
        h('button', { type: 'button', class: 'gx-pbtn', 'aria-label': 'Próximo passe', onclick: () => { pararReproducao(); passeAtual++; desenhar(); } }, '›')),
      slider,
      area,
      h('div', { class: 'gx-legend' },
        h('span', {}, h('i', { class: 'gx-l-bl' }), 'Corte'),
        h('span', {}, h('i', { class: 'gx-l-or' }), 'Aproximação e retorno'),
        h('span', {}, h('i', { class: 'gx-l-dash' }), 'Perfil final')),
      aviso('Divisão dos passes estimada por √n, respeitando Q(Δdmin) e R(d). O cálculo real do controle pode diferir.', () => irPara('cuidados')),
      h('div', { class: 'gx-box' },
        h('small', { class: 'gx-muted', text: 'Dados do exemplo' }),
        h('div', { class: 'gx-ctx' },
          h('span', { text: `P(k) ${formatarMm(t.k)}` }), h('span', { text: `Q(Δd) ${formatarMm(t.dd)}` }),
          h('span', { text: `Q(Δdmin) ${formatarMm(t.dmin)}` }), h('span', { text: `R(d) ${formatarMm(t.d)}` }),
          h('span', { text: `${t.m} passes de acabamento` }))),
      linha('doc', 'Ver parâmetros', null, () => irPara('referencia'), true),
      calcLinha());
    desenhar();
  }

  // ─── Parâmetros (aba "referencia" do banco) ───
  if (refer) {
    const abrirSintaxe = !target.accordionId || target.accordionId === 'sintaxe' || target.tabId !== 'referencia';
    const sintaxeBanco = refer.acordeoes?.find((a) => a.id === 'sintaxe');
    const paramsBanco = refer.acordeoes?.find((a) => a.id === 'parametros');
    const explicacao = h('div', { class: 'gx-pe' });
    const pintarExplicacao = () => {
      for (const b of view.querySelectorAll('[data-p]')) b.setAttribute('aria-pressed', String(/** @type {HTMLElement} */ (b).dataset.p === parametroSel));
      if (!extra || !parametroSel) {
        explicacao.replaceChildren(h('p', { class: 'gx-muted', text: extra ? 'Toque num parâmetro do código ou da lista para ver a explicação.' : '' }));
        return;
      }
      const p = extra.params.find((x) => x[0] === parametroSel);
      const e = extra.exp[parametroSel];
      if (!p || !e) { explicacao.replaceChildren(); return; }
      explicacao.replaceChildren(
        h('h3', {}, h('code', { text: p[0] }), ` ${p[1]}`),
        h('p', { text: e[0] }),
        h('p', { class: 'gx-muted', text: `${p[2]}. ${e[1]}` }));
    };
    /** @param {string} chave */
    const escolher = (chave) => { parametroSel = parametroSel === chave ? '' : chave; pintarExplicacao(); };

    /** Quebra a sintaxe em tokens: letra + (grupos) viram botões. @param {string} texto */
    const tokens = (texto) => {
      const frag = [];
      for (const palavra of texto.split(' ')) {
        const m = palavra.match(/^([A-Z])((?:\([^)]+\))+)$/);
        if (!m) { frag.push(h('span', { class: 'gx-tk gx-tk-g', text: palavra })); continue; }
        (m[2].match(/\([^)]+\)/g) || []).forEach((g, i) => {
          const chave = m[1] + g;
          frag.push(h('button', { type: 'button', class: 'gx-tk', 'data-p': chave, 'aria-pressed': 'false', text: i ? g : chave, onclick: () => escolher(chave) }));
        });
      }
      return frag;
    };

    const blocosSintaxe = extra
      ? extra.sintaxe.map(([rotulo, txt]) => h('div', { class: 'gx-sx' }, h('span', { class: 'gx-lbl', text: rotulo }), h('div', { class: 'gx-toks' }, ...tokens(txt)), botaoCopiar(txt)))
      : [h('div', { class: 'gx-sx' }, h('pre', { text: sintaxeBanco?.texto || '' }), botaoCopiar(sintaxeBanco?.texto || ''))];
    const sintaxeDet = h('details', { class: 'gx-det', 'data-accordion-id': 'sintaxe' }, h('summary', { text: 'Sintaxe' }), h('div', { class: 'gx-det-body' }, ...blocosSintaxe));
    /** @type {HTMLDetailsElement} */ (sintaxeDet).open = abrirSintaxe;

    const listaParams = extra
      ? extra.params.map((p) => h('button', { type: 'button', class: 'gx-pcard', 'data-p': p[0], 'aria-pressed': 'false', onclick: () => escolher(p[0]) },
        h('code', { text: p[0] }), h('span', {}, p[1], h('small', { text: p[2] }))))
      : (paramsBanco?.parametros || []).map((p) => h('div', { class: 'gx-pcard gx-pcard-static' }, h('code', { text: p.nome }), h('span', { text: p.desc })));
    const paramsDet = h('details', { class: 'gx-det', 'data-accordion-id': 'parametros' }, h('summary', { text: 'Parâmetros' }),
      h('div', { class: 'gx-det-body' }, extra ? explicacao : null, h('div', { class: 'gx-plist' }, ...listaParams)));
    /** @type {HTMLDetailsElement} */ (paramsDet).open = target.accordionId === 'parametros' || !!extra;

    painel.referencia = h('div', { class: 'gx-panel', 'data-tab-id': 'referencia', hidden: ativa !== 'referencia' },
      extra ? aviso(extra.avisoMicron) : null,
      sintaxeDet, paramsDet,
      extra ? linha('bars', 'Ver exemplo comentado', null, () => irPara('exemplo'), true) : null,
      extra ? linhaCuidados() : null);
    if (extra) pintarExplicacao();
  }

  // ─── Exemplo ───
  if (exemplo) {
    const programa = extra ? extra.cod : (exemplo.bloco_gcode || []).join('\n');
    const bloco = h('div', { class: 'gx-sx' },
      h('span', { class: 'gx-lbl', text: 'Programa completo' }),
      h('pre', {}, ...programa.split('\n').flatMap((l, i, arr) => [realcar(l), i < arr.length - 1 ? document.createTextNode('\n') : null].filter(Boolean))),
      botaoCopiar(programa, 'Copiar programa'));
    const passos = extra ? extra.passos.map((p, i) => h('details', { class: 'gx-step', open: i === 0 },
      h('summary', {}, h('i', { text: String(i + 1) }), p.t),
      h('div', { class: 'gx-lines' },
        miniaturaPasso(i),
        ...p.l.map((l) => h('div', { class: 'gx-ln' },
          h('div', { class: 'gx-line' }, h('code', {}, realcar(l[0])), l[1]),
          botaoCopiar(l[0], 'Copiar', true))),
        botaoCopiar(p.l.map((l) => l[0]).join('\n'), 'Copiar passo')))) : [];
    painel.exemplo = h('div', { class: 'gx-panel', 'data-tab-id': 'exemplo', hidden: ativa !== 'exemplo' },
      extra ? h('div', { class: 'gx-ctx' }, h('span', { text: 'Rosca externa · passo 2,5' }), ...extra.contexto.map((c) => h('span', { text: c }))) : null,
      bloco,
      extra ? aviso('Valores de exemplo. Ajuste ao seu material, ferramenta e máquina.', () => irPara('cuidados')) : null,
      ...passos,
      extra ? linhaCuidados() : null,
      calcLinha());
  }

  // ─── Cuidados ───
  if (extra) {
    /** @param {string} titulo @param {string[]} itens @param {boolean} [aberto] */
    const bloco = (titulo, itens, aberto = false) => h('details', { class: 'gx-det', open: aberto },
      h('summary', { text: titulo }), h('div', { class: 'gx-det-body' }, ...itens.map((x) => h('p', { class: 'gx-muted', text: `• ${x}` }))));
    painel.cuidados = h('div', { class: 'gx-panel', 'data-tab-id': 'cuidados', hidden: true },
      h('div', { class: 'gx-warn', text: 'Confira controle, variante e pré-condições antes de rodar.' }),
      bloco('Erros comuns', extra.cuid.erros, true),
      bloco('Limitações do exemplo', extra.cuid.lim),
      bloco('Fonte documental', [extra.fonte]),
      bloco('Revisão técnica', [extra.cuid.rev]),
      calcLinha());
  }

  for (const id of abas) view.append(painel[id]);
  if (ativa) irPara(ativa);
  container.append(view);
}
