// index.js — Área Aprender da Biblioteca (controlador e telas).
// CAS22-BIB-APRENDER-PILOTO-01 · protótipo isolado, não integrado ao app.
//
// Contrato (mesmo estilo de mountBiblioteca):
//   mountAprender(container, { initialRoute, onRouteChange, onBack, onOpenConsultar })
//   → { navigate(route), syncRoute(route), getRoute(), destroy() }
// - onRouteChange(route, 'push'|'replace') pede ao app que atualize o histórico.
// - onBack() devolve true se o app voltou pelo histórico do navegador.
// - onOpenConsultar(route) abre uma rota da área Consultar (fichas de Metrologia).
// O módulo não lê nem escreve window.location e não usa armazenamento.

import { h, icon } from '../dom.js';
import { sheets, REVIEW_STATES } from '../data.js';
import { AREAS, MAPAS } from './catalogo.js';
import { aulaG71, ABAS_AULA, SECTION_STATES } from './aula-g71.js';
import { quizG71 } from './quiz-g71.js';
import { iniciarQuiz, responder, avancar, terminou, resultado, mover, conferir } from './quiz.js';
import { PROFUNDIDADES, SOBREMETAIS, calcularPasses } from './trajetoria.js';
import { desenharPeca, s } from './desenho.js';
import { lerCaminho, paraCaminho, pai } from './routes.js';
import { criarMapa } from '../../mapas/mapa.js';
import { mapaDoDesenhoAPeca } from '../../mapas/dados.js';

const AULAS = { g71: aulaG71 };
const QUIZZES = { g71: quizG71 };
const MAPA_DADOS = { 'desenho-peca': mapaDoDesenhoAPeca };

export const CONHECIDOS = {
  areas: AREAS.map((a) => a.id),
  aulas: Object.keys(AULAS),
  quizzes: Object.keys(QUIZZES),
  mapas: Object.keys(MAPAS),
  abas: ABAS_AULA.map((a) => a.id),
};

/** Converte o texto após '#/biblioteca/aprender' em rota. */
export function parsePath(caminho) {
  return lerCaminho(caminho, CONHECIDOS);
}
export const toPath = paraCaminho;

/* ------------------------------------------------------------- estilos */

function garantirCss(id, href) {
  let link = /** @type {HTMLLinkElement|null} */ (document.getElementById(id));
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.append(link);
  }
  return link;
}

/** Carrega biblioteca.css (tokens --cbib-*), aprender.css e mapas.css. Nunca deixa a tela invisível. */
function garantirEstilos(pronto) {
  const links = [
    garantirCss('cbib-styles', new URL('../biblioteca.css', import.meta.url).href),
    garantirCss('capr-styles', new URL('./aprender.css', import.meta.url).href),
    garantirCss('cm-styles', new URL('../../mapas/mapas.css', import.meta.url).href),
  ];
  let restantes = links.filter((l) => !(l.sheet || l.dataset.state)).length;
  let feito = false;
  const fim = () => { if (!feito) { feito = true; clearTimeout(t); pronto(); } };
  const t = setTimeout(fim, 3000);
  if (!restantes) { fim(); return; }
  for (const l of links) {
    if (l.sheet || l.dataset.state) continue;
    const um = () => { l.dataset.state = 'loaded'; if (--restantes <= 0) fim(); };
    l.addEventListener('load', um, { once: true });
    l.addEventListener('error', um, { once: true });
  }
}

/* --------------------------------------------- seletor Consultar | Aprender */

/**
 * Seletor de área da Biblioteca. Usado no topo de Aprender e, na página de
 * teste, acima da tela inicial de Consultar (sem editar o módulo Consultar).
 * @param {'consultar'|'aprender'} ativo @param {(area:'consultar'|'aprender') => void} aoEscolher
 */
export function seletorBiblioteca(ativo, aoEscolher) {
  // Garante o CSS do seletor também quando só a área Consultar está montada.
  garantirCss('capr-styles', new URL('./aprender.css', import.meta.url).href);
  const botao = (id, rotulo, ic) => {
    const b = h('button', { type: 'button', class: 'capr-switch__btn', 'aria-pressed': String(ativo === id), 'data-area': id }, icon(ic), h('span', {}, rotulo));
    b.addEventListener('click', () => { if (ativo !== id) aoEscolher(id); });
    return b;
  };
  return h('nav', { class: 'capr-switch', 'aria-label': 'Áreas da Biblioteca' },
    botao('consultar', 'Consultar', 'search'),
    botao('aprender', 'Aprender', 'layers'));
}

/* ------------------------------------------------------------- ícones */

const ICONES_EXTRA = {
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  prev: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  up: 'M6 15l6-6 6 6',
  down: 'M6 9l6 6 6-6',
  quiz: 'M9.1 9a3 3 0 1 1 4.2 2.7c-.8.4-1.3 1.1-1.3 2v.3M12 17h.01',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
  lesson: 'M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4zM20 5h-4a2 2 0 0 0-2 2',
  reset: 'M4 4v6h6M5.5 15a7.5 7.5 0 1 0 1.8-7.8L4 10',
};
function ic(nome) {
  return s('svg', { viewBox: '0 0 24 24', class: 'cbib-icon capr-ic', fill: nome === 'play' || nome === 'pause' ? 'currentColor' : 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' },
    s('path', { d: ICONES_EXTRA[nome] }));
}

/* ------------------------------------------------------------- utilidades de tela */

function selo(tom, texto) {
  return h('span', { class: `cbib-badge cbib-badge--${tom}` }, texto);
}
function seloRevisao(reviewState) {
  const st = REVIEW_STATES[reviewState] || REVIEW_STATES.demo;
  const texto = reviewState === 'validated' ? st.label : `${st.label} · não homologada`;
  return selo(st.tone, texto);
}
function faixaEstado(estado) {
  const st = SECTION_STATES[estado];
  if (!st) return null;
  return h('div', { class: `capr-estado capr-estado--${st.tone}`, role: 'note' },
    selo(st.tone, st.label), h('p', {}, st.texto));
}
function botaoVoltar(texto) {
  return h('button', { type: 'button', class: 'capr-voltar', 'data-action': 'voltar' }, icon('back'), h('span', {}, texto));
}
function tituloTela(texto, cls = 'capr-titulo') {
  return h('h2', { class: cls, tabindex: '-1', 'data-foco': '1' }, texto);
}

function itemInfo(item) {
  if (item.tipo === 'ficha') {
    const f = sheets[item.fichaId];
    if (!f) return null;
    return { titulo: f.title, sub: `Ficha · ${f.readingTime || ''} · abre em Consultar`, estado: f.reviewState, rota: { area: 'consultar', name: 'ficha', id: f.id }, icone: 'doc' };
  }
  if (item.tipo === 'aula') {
    const a = AULAS[item.id];
    return { titulo: `${a.codigo} · ${a.titulo}`, sub: `Aula · ${a.duracao}`, estado: a.reviewState, rota: { name: 'aula', id: a.id, aba: 'visao' }, iconeExtra: 'lesson' };
  }
  if (item.tipo === 'quiz') {
    const q = QUIZZES[item.id];
    return { titulo: q.titulo, sub: `${q.questoes.length} questões · exercícios`, estado: q.reviewState, rota: { name: 'quiz', id: q.id }, iconeExtra: 'quiz' };
  }
  if (item.tipo === 'mapa') {
    const m = MAPAS[item.id];
    return { titulo: m.titulo, sub: `Mapa técnico · ${m.resumo}`, estado: m.reviewState, rota: { name: 'mapa', id: m.id }, iconeExtra: 'map' };
  }
  return null;
}

function linhaItem(item) {
  if (item.tipo === 'planejado') {
    return h('li', { class: 'capr-item is-planejado' },
      h('span', { class: 'capr-item__ic' }, icon('doc')),
      h('span', { class: 'capr-item__txt' },
        h('span', { class: 'capr-item__titulo' }, item.titulo),
        item.resumo ? h('span', { class: 'capr-item__sub' }, item.resumo) : null),
      selo('muted', 'Em preparação'));
  }
  const info = itemInfo(item);
  if (!info) return null;
  return h('li', {},
    h('button', { type: 'button', class: 'capr-item', 'data-action': 'abrir', 'data-rota': JSON.stringify(info.rota) },
      h('span', { class: 'capr-item__ic' }, info.iconeExtra ? ic(info.iconeExtra) : icon(info.icone)),
      h('span', { class: 'capr-item__txt' },
        h('span', { class: 'capr-item__titulo' }, info.titulo),
        h('span', { class: 'capr-item__sub' }, info.sub),
        h('span', { class: 'capr-item__estado' }, seloRevisao(info.estado))),
      h('span', { class: 'capr-item__seta' }, icon('chev'))));
}

/* ------------------------------------------------------------- telas */

function telaHome() {
  const contagem = (a) => {
    const disp = a.itens.filter((i) => i.tipo !== 'planejado').length;
    const prep = a.itens.length - disp;
    if (!disp) return `${prep} assuntos em preparação`;
    return `${disp} disponíve${disp > 1 ? 'is' : 'l'}${prep ? ` · ${prep} em preparação` : ''}`;
  };
  return [
    h('section', { class: 'cbib-hero cbib-hero--home capr-hero' },
      h('span', { class: 'cbib-kicker' }, 'Biblioteca educativa'),
      tituloTela('Aprender', 'cbib-page-title capr-page-title'),
      h('p', { class: 'cbib-display capr-display' }, 'Estude no seu ritmo, na ordem que quiser.')),
    h('section', { class: 'capr-bloco', 'aria-labelledby': 'capr-areas' },
      h('h3', { id: 'capr-areas', class: 'cbib-eyebrow capr-eyebrow' }, 'Áreas'),
      h('ul', { class: 'capr-areas' },
        AREAS.map((a) => h('li', {},
          h('button', { type: 'button', class: 'capr-area', 'data-action': 'abrir', 'data-rota': JSON.stringify({ name: 'area', id: a.id }) },
            h('span', { class: 'capr-area__ic' }, icon(a.icone)),
            h('span', { class: 'capr-area__txt' },
              h('span', { class: 'capr-area__titulo' }, a.titulo),
              h('span', { class: 'capr-area__resumo' }, a.resumo),
              h('span', { class: 'capr-area__conta' }, contagem(a))),
            h('span', { class: 'capr-item__seta' }, icon('chev'))))))),
    trilhaBloco(AREAS.find((a) => a.trilha)),
    h('p', { class: 'capr-rodape' }, 'Protótipo da área Aprender. Todo o conteúdo está em rascunho ou demonstração, pendente de revisão técnica.'),
  ];
}

function trilhaBloco(area) {
  if (!area?.trilha) return null;
  const passos = area.trilha.passos.map((p) => {
    const [tipo, id] = p.split(':');
    return itemInfo({ tipo, id });
  }).filter(Boolean);
  return h('details', { class: 'capr-trilha capr-trilha--recolhida' },
    h('summary', { class: 'capr-trilha__titulo' }, area.trilha.titulo),
    h('ol', { class: 'capr-trilha__lista' },
      passos.map((info, i) => h('li', {},
        h('button', { type: 'button', class: 'capr-trilha__passo', 'data-action': 'abrir', 'data-rota': JSON.stringify(info.rota) },
          h('span', { class: 'capr-trilha__num' }, String(i + 1)),
          h('span', {}, info.titulo))))),
    h('p', { class: 'capr-nota' }, area.trilha.nota));
}

function telaArea(rota) {
  const a = AREAS.find((x) => x.id === rota.id);
  return [
    botaoVoltar('Aprender'),
    h('section', { class: 'capr-cab' },
      h('span', { class: 'cbib-kicker' }, 'Aprender'),
      tituloTela(a.titulo),
      h('p', { class: 'capr-lede' }, a.resumo)),
    a.id === 'cnc' ? trilhaBloco(a) : null,
    h('ul', { class: 'capr-itens' }, a.itens.map(linhaItem)),
    a.nota ? h('p', { class: 'capr-nota' }, a.nota) : null,
  ];
}

/* --------------------------------------------------------------- aula */

function telaAula(rota, ui) {
  const a = AULAS[rota.id];
  const abas = h('div', { class: 'capr-abas', role: 'tablist', 'aria-label': 'Seções da aula' },
    ABAS_AULA.map((t) => h('button', {
      type: 'button', role: 'tab', class: 'capr-aba', id: `capr-aba-${t.id}`,
      'aria-selected': String(t.id === rota.aba), 'aria-controls': 'capr-painel', tabindex: t.id === rota.aba ? '0' : '-1',
      'data-action': 'aba', 'data-aba': t.id,
    }, t.label)));
  const painel = h('div', { class: 'capr-painel', id: 'capr-painel', role: 'tabpanel', 'aria-labelledby': `capr-aba-${rota.aba}` },
    PAINEIS[rota.aba](a, ui));
  return [
    botaoVoltar('Programação CNC'),
    h('section', { class: 'capr-cab' },
      tituloTela(`${a.codigo} — ${a.titulo}`),
      h('p', { class: 'capr-meta' }, h('span', {}, a.variante.texto))),
    abas,
    painel,
    h('div', { class: 'capr-acoes' },
      rota.aba === 'praticar' ? null : h('button', { type: 'button', class: 'capr-btn capr-btn--primario', 'data-action': 'abrir', 'data-rota': JSON.stringify({ name: 'quiz', id: a.id }) }, ic('quiz'), h('span', {}, 'Fazer exercícios')),
      h('button', { type: 'button', class: 'capr-btn', disabled: true, 'aria-describedby': 'capr-guia-nota' }, icon('doc'), h('span', {}, 'Abrir no Guia CNC')),
      h('p', { class: 'capr-nota', id: 'capr-guia-nota' }, `${SECTION_STATES[a.guia.estado].label} no banco do Guia CNC. ${a.guia.texto}`)),
  ];
}

const PAINEIS = {
  visao(a) {
    const v = a.secoes.visao;
    return [
      h('h3', { class: 'capr-h3' }, 'Finalidade'),
      h('p', { class: 'capr-texto' }, v.finalidade),
      h('h3', { class: 'capr-h3' }, 'Aplicação'),
      h('p', { class: 'capr-texto' }, v.aplicacao),
      h('figure', { class: 'capr-figura' },
        desenharPeca({ modo: 'ilustracao', profundidade: 5, sobremetal: 2, titulo: 'Ilustração: bruto, peça, sobremetal e ponto de aproximação' }).svg,
        h('figcaption', {}, 'Ilustração didática, fora de escala, sem cotas.')),
      h('h3', { class: 'capr-h3' }, 'Conceitos'),
      h('dl', { class: 'capr-conceitos' }, v.conceitos.map((c) => [h('dt', {}, c.termo), h('dd', {}, c.texto)])),
      h('details', { class: 'capr-revisao' },
        h('summary', {}, 'Fontes e revisão técnica'),
        faixaEstado(v.estado),
        h('p', { class: 'capr-nota' }, v.nota),
        blocoFontes(v.fontes)),
    ];
  },

  trajetoria(a, ui) {
    const t = a.secoes.trajetoria;
    const prof = PROFUNDIDADES.find((p) => p.id === ui.profundidade);
    const sob = SOBREMETAIS.find((p) => p.id === ui.sobremetal);
    const { svg, total } = desenharPeca({ modo: 'trajetoria', profundidade: prof.valor, sobremetal: sob.valor, passe: ui.passe, destaque: ui.destaque, titulo: 'Trajetória didática dos passes de desbaste' });
    const fase = ui.passe === 0 ? 'Antes do primeiro passe'
      : ui.passe <= total ? `Passe ${ui.passe} de ${total}`
      : 'Acabamento: a ferramenta segue o perfil final';
    const grupo = (rotulo, nome, opcoes, atual) => h('div', { class: 'capr-opcao' },
      h('span', { class: 'capr-opcao__rot', id: `capr-rot-${nome}` }, rotulo),
      h('div', { class: 'capr-seg', role: 'radiogroup', 'aria-labelledby': `capr-rot-${nome}` },
        opcoes.map((o) => h('button', { type: 'button', role: 'radio', class: 'capr-seg__btn', 'aria-checked': String(o.id === atual), 'data-action': nome, 'data-valor': o.id }, o.label))));
    const conceitos = a.secoes.visao.conceitos;
    const sel = conceitos.find((c) => c.id === ui.destaque);
    return [
      faixaEstado(t.estado),
      h('div', { class: 'capr-controles' },
        grupo('Profundidade por passe', 'profundidade', PROFUNDIDADES, ui.profundidade),
        grupo('Sobremetal de acabamento', 'sobremetal', SOBREMETAIS, ui.sobremetal)),
      h('figure', { class: 'capr-figura capr-figura--traj' }, svg),
      h('div', { class: 'capr-player' },
        h('button', { type: 'button', class: 'capr-iconbtn', 'data-action': 'passe-ant', 'aria-label': 'Passe anterior', disabled: ui.passe === 0 }, ic('prev')),
        h('button', { type: 'button', class: 'capr-iconbtn capr-iconbtn--play', 'data-action': 'play', 'aria-label': ui.tocando ? 'Pausar' : 'Reproduzir', 'aria-pressed': String(!!ui.tocando) }, ic(ui.tocando ? 'pause' : 'play')),
        h('button', { type: 'button', class: 'capr-iconbtn', 'data-action': 'passe-prox', 'aria-label': 'Próximo passe', disabled: ui.passe > total }, ic('next')),
        h('p', { class: 'capr-player__fase', 'aria-live': 'polite' }, fase,
          h('span', { class: 'capr-player__conta' }, `${total} passes de desbaste`))),
      h('div', { class: 'capr-legenda', 'aria-hidden': 'true' },
        h('span', {}, h('i', { class: 'capr-leg capr-leg--estoque' }), 'Material a remover'),
        h('span', {}, h('i', { class: 'capr-leg capr-leg--passe' }), 'Passe atual'),
        h('span', {}, h('i', { class: 'capr-leg capr-leg--sobremetal' }), 'Sobremetal'),
        h('span', {}, h('i', { class: 'capr-leg capr-leg--peca' }), 'Peça')),
      h('h3', { class: 'capr-h3' }, 'Explore os conceitos'),
      h('p', { class: 'capr-nota' }, 'Toque em um conceito para destacá-lo no desenho.'),
      h('div', { class: 'capr-chips', role: 'group', 'aria-label': 'Conceitos' },
        conceitos.map((c) => h('button', { type: 'button', class: 'capr-chip', 'aria-pressed': String(c.id === ui.destaque), 'data-action': 'destaque', 'data-valor': c.id }, c.termo))),
      sel ? h('div', { class: 'capr-conceito', 'aria-live': 'polite' }, h('strong', {}, sel.termo), h('p', {}, sel.texto),
        sel.id === 'sobremetal' && ui.sobremetal === 'sem' ? h('p', { class: 'capr-nota' }, 'Escolha Sobremetal "Com" para vê-lo no desenho.') : null) : null,
      h('p', { class: 'capr-aviso' }, icon('alert'), h('span', {}, t.aviso)),
    ];
  },

  sintaxe(a) {
    const v = a.secoes.sintaxe;
    return [
      h('div', { class: 'capr-pendente', role: 'note' },
        h('p', { class: 'capr-pendente__titulo' }, 'Como ler o G71'),
        h('pre', { class: 'capr-gcode', 'aria-label': 'Sintaxe G71 em dois blocos' }, v.blocos.join('\n')),
        h('p', {}, '1º bloco: U é profundidade por passe em raio; R é o recuo transversal em X.'),
        h('p', {}, '2º bloco: P/Q delimitam o perfil; U é sobremetal em X por diâmetro; W é sobremetal em Z; F é avanço.')),
      h('details', { class: 'capr-revisao' },
        h('summary', {}, 'Fontes, revisão e pontos pendentes'),
        faixaEstado(v.estado),
        h('ul', { class: 'capr-lista' }, v.confirmar.map((x) => h('li', {}, x)))),
      h('h3', { class: 'capr-h3' }, 'Conceitos da aula e parâmetros do controle'),
      h('p', { class: 'capr-nota' }, 'Mapeamento conceitual: confirmações do PO e informações secundárias estão identificadas separadamente.'),
      h('table', { class: 'capr-tabela' },
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Conceito'), h('th', { scope: 'col' }, 'Parâmetro no controle'))),
        h('tbody', {}, v.mapaConceitos.map((m) => h('tr', {}, h('td', {}, m.conceito), h('td', {}, m.endereco || 'A confirmar'))))),
      h('div', { class: 'capr-alerta', role: 'note' }, icon('alert'), h('p', {}, v.calculadora)),
    ];
  },

  exemplo(a) {
    const v = a.secoes.exemplo;
    return [
      h('div', { class: 'capr-pendente', role: 'note' },
        h('p', { class: 'capr-pendente__titulo' }, 'Sequência didática G71 + G70'),
        h('p', {}, 'Exemplo de lógica de programação, sem coordenadas ou valores executáveis. O programa específico declarado validado pelo PO não foi disponibilizado.')),
      h('h3', { class: 'capr-h3' }, 'Estrutura do ciclo — sem valores executáveis'),
      h('pre', { class: 'capr-gcode', 'aria-label': 'Estrutura didática G71' }, a.secoes.sintaxe.blocos.join('\n')),
      h('h3', { class: 'capr-h3' }, 'Entenda cada etapa'),
      h('ol', { class: 'capr-lista' }, v.etapas.map((e) => h('li', {}, h('strong', {}, e.titulo), h('p', {}, e.texto)))),
      h('details', { class: 'capr-revisao' }, h('summary', {}, 'Revisão técnica e limites do exemplo'), faixaEstado(v.estado), h('p', { class: 'capr-nota' }, 'A estrutura é didática e não substitui a ficha do Guia CNC nem o manual do controle.')),
    ];
  },

  cuidados(a) {
    const v = a.secoes.cuidados;
    return [
      faixaEstado(v.estado),
      h('h3', { class: 'capr-h3' }, 'Erros comuns'),
      h('ul', { class: 'capr-erros' }, v.erros.map((e) => h('li', {}, h('strong', {}, e.titulo), h('p', {}, e.texto)))),
      h('h3', { class: 'capr-h3' }, 'Alertas'),
      h('ul', { class: 'capr-alertas' }, v.alertas.map((x) => h('li', {}, icon('alert'), h('span', {}, x)))),
    ];
  },

  praticar(a) {
    const q = QUIZZES[a.id];
    return [
      h('div', { class: 'capr-pratica' },
        h('span', { class: 'capr-pratica__ic' }, ic('quiz')),
        h('div', {},
          h('h3', { class: 'capr-h3 capr-h3--sem' }, 'Quiz da aula'),
          h('p', { class: 'capr-texto' }, `${q.questoes.length} questões sobre finalidade, interpretação visual, sequência e cuidados. Explicação depois de cada resposta.`),
          h('button', { type: 'button', class: 'capr-btn capr-btn--primario', 'data-action': 'abrir', 'data-rota': JSON.stringify({ name: 'quiz', id: q.id }) }, h('span', {}, 'Começar o quiz')))),
      h('p', { class: 'capr-nota' }, q.nota),
      h('div', { class: 'capr-pratica' },
        h('span', { class: 'capr-pratica__ic' }, ic('map')),
        h('div', {},
          h('h3', { class: 'capr-h3 capr-h3--sem' }, 'Veja o fluxo completo'),
          h('p', { class: 'capr-texto' }, 'O mapa Do Desenho à Peça mostra onde o desbaste entra no processo de fabricação.'),
          h('button', { type: 'button', class: 'capr-btn', 'data-action': 'abrir', 'data-rota': JSON.stringify({ name: 'mapa', id: 'desenho-peca' }) }, h('span', {}, 'Abrir o mapa')))),
    ];
  },
};

function blocoFontes(fontes) {
  return h('section', { class: 'capr-fontes', 'aria-label': 'Fontes' },
    h('h3', { class: 'capr-h3' }, 'Fontes'),
    h('ul', {}, fontes.map((f) => h('li', {},
      selo(f.estado === 'localizada' ? 'info' : 'warn', f.estado === 'localizada' ? 'Localizada' : 'Pendente'),
      h('span', {}, f.texto)))));
}

/* --------------------------------------------------------------- quiz */

function telaQuiz(rota, ui) {
  const quiz = QUIZZES[rota.id];
  const st = ui.quiz;
  const cab = [
    botaoVoltar('Aula G71'),
    h('section', { class: 'capr-cab capr-cab--quiz' },
      h('div', { class: 'capr-cab__selos' }, seloRevisao(quiz.reviewState)),
      tituloTela(quiz.titulo)),
  ];
  if (terminou(st)) {
    const r = resultado(st);
    return [...cab,
      h('section', { class: 'capr-resultado', 'aria-live': 'polite' },
        h('p', { class: 'capr-resultado__num' }, `${r.acertos} de ${r.total}`),
        h('p', { class: 'capr-texto' }, r.acertos === r.total ? 'Você acertou todas.' : 'Revise as explicações e tente de novo.'),
        h('div', { class: 'capr-acoes' },
          h('button', { type: 'button', class: 'capr-btn capr-btn--primario', 'data-action': 'refazer' }, ic('reset'), h('span', {}, 'Refazer o quiz')),
          r.erros.length ? h('button', { type: 'button', class: 'capr-btn', 'data-action': 'refazer-erros' }, h('span', {}, `Revisar só os erros (${r.erros.length})`)) : null,
          h('button', { type: 'button', class: 'capr-btn', 'data-action': 'abrir', 'data-rota': JSON.stringify({ name: 'aula', id: quiz.aulaRef, aba: 'visao' }) }, h('span', {}, 'Voltar à aula')))),
      h('p', { class: 'capr-nota' }, quiz.nota)];
  }
  const q = st.questoes[st.indice];
  const resp = st.respostas[q.id];
  const progresso = h('div', { class: 'capr-progresso' },
    h('span', {}, `Questão ${st.indice + 1} de ${st.questoes.length}`),
    h('span', { class: 'capr-progresso__barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(st.questoes.length), 'aria-valuenow': String(st.indice + 1), 'aria-label': 'Progresso do quiz' },
      h('i', { style: `width:${Math.round(((st.indice + 1) / st.questoes.length) * 100)}%` })));

  let corpo;
  if (q.tipo === 'multipla') {
    corpo = h('div', { class: 'capr-opcoes', role: 'group', 'aria-labelledby': 'capr-enunciado' },
      q.opcoes.map((o) => {
        let cls = 'capr-resp';
        if (resp) {
          if (o.id === q.correta) cls += ' is-certa';
          else if (o.id === resp.resposta) cls += ' is-errada';
        }
        return h('button', { type: 'button', class: cls, 'data-action': 'responder', 'data-valor': o.id, disabled: !!resp, 'aria-pressed': resp ? String(o.id === resp.resposta) : null },
          h('span', { class: 'capr-resp__letra' }, o.id.toUpperCase()), h('span', {}, o.texto));
      }));
  } else {
    const ordem = resp ? resp.resposta : ui.ordem;
    corpo = h('ol', { class: 'capr-ordem', 'aria-labelledby': 'capr-enunciado' },
      ordem.map((id, i) => {
        const item = q.itens.find((x) => x.id === id);
        const certo = resp ? q.ordem[i] === id : null;
        return h('li', { class: 'capr-ordem__item' + (certo === true ? ' is-certa' : certo === false ? ' is-errada' : '') },
          h('span', { class: 'capr-ordem__num' }, String(i + 1)),
          h('span', { class: 'capr-ordem__txt' }, item.texto),
          resp ? null : h('span', { class: 'capr-ordem__btns' },
            h('button', { type: 'button', class: 'capr-iconbtn capr-iconbtn--sm', 'data-action': 'subir', 'data-indice': String(i), 'aria-label': `Subir: ${item.texto}`, disabled: i === 0 }, ic('up')),
            h('button', { type: 'button', class: 'capr-iconbtn capr-iconbtn--sm', 'data-action': 'descer', 'data-indice': String(i), 'aria-label': `Descer: ${item.texto}`, disabled: i === ordem.length - 1 }, ic('down'))));
      }));
  }

  const certaTexto = q.tipo === 'ordenar'
    ? h('ol', { class: 'capr-ordem-certa' }, q.ordem.map((id) => h('li', {}, q.itens.find((x) => x.id === id).texto)))
    : null;
  const retorno = resp ? h('section', { class: 'capr-retorno ' + (resp.correta ? 'is-certa' : 'is-errada'), 'aria-live': 'polite', tabindex: '-1', 'data-retorno': '1' },
    h('p', { class: 'capr-retorno__titulo' }, resp.correta ? 'Correto' : 'Não é essa'),
    h('p', {}, q.explicacao),
    !resp.correta && certaTexto ? [h('p', { class: 'capr-nota' }, 'Ordem esperada:'), certaTexto] : null,
    h('p', { class: 'capr-retorno__ref' }, `Referência: ${q.referencia.texto} · `, seloRevisao(q.reviewState))) : null;

  return [...cab,
    progresso,
    h('section', { class: 'capr-questao' },
      h('span', { class: 'cbib-kicker' }, q.tema),
      h('p', { class: 'capr-enunciado', id: 'capr-enunciado' }, q.enunciado),
      q.figura ? h('figure', { class: 'capr-figura' }, desenharPeca({ modo: 'regioes', profundidade: 5, sobremetal: 2, titulo: 'Desenho da peça com as regiões A, B e C' }).svg) : null,
      corpo,
      !resp && q.tipo === 'ordenar' ? h('button', { type: 'button', class: 'capr-btn capr-btn--primario', 'data-action': 'conferir-ordem' }, h('span', {}, 'Conferir ordem')) : null,
      retorno,
      resp ? h('button', { type: 'button', class: 'capr-btn capr-btn--primario', 'data-action': 'proxima' }, h('span', {}, st.indice + 1 < st.questoes.length ? 'Próxima questão' : 'Ver resultado'), ic('next')) : null),
  ];
}

/* --------------------------------------------------------------- mapa */

function telaMapa(rota, ui) {
  const alvo = h('section', { class: 'capr-mapa', 'aria-label': 'Mapa técnico' });
  ui.montarMapa = () => {
    ui.mapa = criarMapa(alvo, MAPA_DADOS[rota.id], { usarHash: false });
  };
  return [botaoVoltar('Mapas Técnicos'), alvo];
}

function telaNaoEncontrada() {
  return [
    botaoVoltar('Aprender'),
    h('section', { class: 'capr-cab' }, tituloTela('Conteúdo não encontrado'), h('p', { class: 'capr-lede' }, 'O endereço não corresponde a nenhum item da área Aprender.')),
  ];
}

/* ------------------------------------------------------------- controlador */

const TELAS = { home: telaHome, area: telaArea, aula: telaAula, quiz: telaQuiz, mapa: telaMapa, notfound: telaNaoEncontrada };

export function mountAprender(container, opcoes = {}) {
  const { onRouteChange = () => {}, onBack = () => false, onOpenConsultar = () => {} } = opcoes;
  const raiz = h('div', { class: 'cbib capr', 'data-screen': 'home' });
  raiz.style.visibility = 'hidden';
  container.append(raiz);

  let rota = normalizar(opcoes.initialRoute);
  let timer = 0;
  const ui = {
    profundidade: 'media', sobremetal: 'com', passe: 0, destaque: null, tocando: false,
    quiz: null, quizId: null, ordem: [], mapa: null, montarMapa: null,
  };

  function normalizar(r) {
    if (!r || !TELAS[r.name]) return { name: 'home' };
    return r;
  }

  function pararPlay() {
    if (timer) clearInterval(timer);
    timer = 0;
    ui.tocando = false;
  }

  function prepararQuiz(id, apenas) {
    ui.quiz = iniciarQuiz(QUIZZES[id].questoes, apenas ? { apenas } : {});
    ui.quizId = id;
    prepararOrdem();
  }
  function prepararOrdem() {
    const q = ui.quiz?.questoes[ui.quiz.indice];
    ui.ordem = q?.tipo === 'ordenar' ? q.itens.map((i) => i.id) : [];
  }

  function desenhar({ focar = true } = {}) {
    if (ui.mapa) { ui.mapa.destruir(); ui.mapa = null; }
    if (rota.name === 'quiz' && (ui.quizId !== rota.id || !ui.quiz)) prepararQuiz(rota.id);
    raiz.dataset.screen = rota.name;
    const topo = rota.name === 'home' ? seletorBiblioteca('aprender', (area) => { if (area === 'consultar') onOpenConsultar({ name: 'home' }); }) : null;
    raiz.replaceChildren(...[topo, ...TELAS[rota.name](rota, ui)].flat(Infinity).filter(Boolean));
    if (ui.montarMapa && rota.name === 'mapa') { ui.montarMapa(); ui.montarMapa = null; }
    if (focar) {
      const alvo = raiz.querySelector('[data-foco]');
      if (alvo) alvo.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }

  /** Redesenha só o painel da aula (trajetória e abas), sem perder a rolagem. */
  function redesenharPainel() {
    const painel = raiz.querySelector('#capr-painel');
    if (!painel || rota.name !== 'aula') return desenhar({ focar: false });
    const ativo = document.activeElement;
    const chave = ativo && raiz.contains(ativo) ? [ativo.getAttribute('data-action'), ativo.getAttribute('data-valor')] : null;
    painel.replaceChildren(...PAINEIS[rota.aba](AULAS[rota.id], ui).flat(Infinity).filter(Boolean));
    if (chave) {
      const igual = painel.querySelector(`[data-action="${chave[0]}"]${chave[1] ? `[data-valor="${chave[1]}"]` : ''}`);
      if (igual) igual.focus({ preventScroll: true });
    }
  }

  function navegar(nova, modo = 'push') {
    pararPlay();
    if (nova.area === 'consultar') { onOpenConsultar(nova); return; }
    const anterior = rota;
    rota = normalizar(nova);
    if (rota.name === 'quiz' && (anterior.name !== 'quiz' || anterior.id !== rota.id)) prepararQuiz(rota.id);
    if (rota.name === 'aula' && anterior.name === 'aula' && anterior.id === rota.id) {
      // Troca de aba: substitui a entrada do histórico.
      onRouteChange(rota, 'replace');
      desenhar({ focar: false });
      raiz.querySelector(`#capr-aba-${rota.aba}`)?.focus({ preventScroll: true });
      return;
    }
    onRouteChange(rota, modo);
    desenhar();
  }

  function voltar() {
    pararPlay();
    if (onBack()) return;
    navegar(pai(rota));
  }

  function tocar() {
    if (ui.tocando) { pararPlay(); redesenharPainel(); return; }
    const total = () => calcularPasses({
      profundidade: PROFUNDIDADES.find((p) => p.id === ui.profundidade).valor,
      sobremetal: SOBREMETAIS.find((p) => p.id === ui.sobremetal).valor,
    }).passes.length;
    if (ui.passe > total()) ui.passe = 0;
    ui.tocando = true;
    redesenharPainel();
    timer = window.setInterval(() => {
      ui.passe += 1;
      if (ui.passe > total()) { ui.passe = total() + 1; pararPlay(); }
      redesenharPainel();
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1400 : 900);
  }

  function aoClicar(ev) {
    const alvo = ev.target.closest('[data-action]');
    if (!alvo || !raiz.contains(alvo) || alvo.disabled) return;
    const acao = alvo.getAttribute('data-action');
    const valor = alvo.getAttribute('data-valor');
    switch (acao) {
      case 'voltar': voltar(); break;
      case 'abrir': navegar(JSON.parse(alvo.getAttribute('data-rota'))); break;
      case 'aba': navegar({ name: 'aula', id: rota.id, aba: alvo.getAttribute('data-aba') }); break;
      case 'profundidade': ui.profundidade = valor; ui.passe = 0; pararPlay(); redesenharPainel(); break;
      case 'sobremetal': ui.sobremetal = valor; ui.passe = 0; pararPlay(); redesenharPainel(); break;
      case 'destaque': ui.destaque = ui.destaque === valor ? null : valor; redesenharPainel(); break;
      case 'passe-ant': pararPlay(); ui.passe = Math.max(0, ui.passe - 1); redesenharPainel(); break;
      case 'passe-prox': pararPlay(); ui.passe += 1; redesenharPainel(); break;
      case 'play': tocar(); break;
      case 'responder': ui.quiz = responder(ui.quiz, valor); redesenharQuiz(); break;
      case 'subir': ui.ordem = mover(ui.ordem, Number(alvo.getAttribute('data-indice')), -1); redesenharQuiz(`[data-action="subir"][data-indice="${Math.max(0, Number(alvo.getAttribute('data-indice')) - 1)}"]`); break;
      case 'descer': ui.ordem = mover(ui.ordem, Number(alvo.getAttribute('data-indice')), 1); redesenharQuiz(`[data-action="descer"][data-indice="${Number(alvo.getAttribute('data-indice')) + 1}"]`); break;
      case 'conferir-ordem': ui.quiz = responder(ui.quiz, ui.ordem.slice()); redesenharQuiz(); break;
      case 'proxima': ui.quiz = avancar(ui.quiz); prepararOrdem(); desenhar(); break;
      case 'refazer': prepararQuiz(rota.id); desenhar(); break;
      case 'refazer-erros': prepararQuiz(rota.id, resultado(ui.quiz).erros); desenhar(); break;
      default: break;
    }
  }

  function redesenharQuiz(seletorFoco) {
    desenhar({ focar: false });
    const foco = (seletorFoco && raiz.querySelector(seletorFoco)) || raiz.querySelector('[data-retorno]');
    if (foco) foco.focus({ preventScroll: !!seletorFoco });
    else raiz.querySelector('[data-action="subir"], [data-action="descer"]')?.focus({ preventScroll: true });
  }

  // Setas entre as abas da aula (padrão de tablist).
  function aoTeclar(ev) {
    const aba = ev.target.closest('[role="tab"]');
    if (!aba || !raiz.contains(aba)) return;
    const ids = ABAS_AULA.map((a) => a.id);
    const i = ids.indexOf(aba.getAttribute('data-aba'));
    let j = -1;
    if (ev.key === 'ArrowRight') j = (i + 1) % ids.length;
    else if (ev.key === 'ArrowLeft') j = (i - 1 + ids.length) % ids.length;
    else if (ev.key === 'Home') j = 0;
    else if (ev.key === 'End') j = ids.length - 1;
    if (j < 0) return;
    ev.preventDefault();
    navegar({ name: 'aula', id: rota.id, aba: ids[j] });
  }

  raiz.addEventListener('click', aoClicar);
  raiz.addEventListener('keydown', aoTeclar);

  garantirEstilos(() => { raiz.style.visibility = ''; });
  desenhar({ focar: false });

  return {
    navigate: (r) => navegar(r),
    /** Sincroniza com o histórico do navegador (Voltar do Android) sem empilhar. */
    syncRoute(r) {
      pararPlay();
      const nova = normalizar(r);
      if (nova.name === 'quiz' && (rota.name !== 'quiz' || rota.id !== nova.id)) prepararQuiz(nova.id);
      rota = nova;
      desenhar();
    },
    getRoute: () => ({ ...rota }),
    destroy() {
      pararPlay();
      if (ui.mapa) ui.mapa.destruir();
      raiz.removeEventListener('click', aoClicar);
      raiz.removeEventListener('keydown', aoTeclar);
      raiz.remove();
    },
  };
}

// Exportados para testes.
export { conferir };
