/**
 * Casillas Mapas — Componente de mapa técnico interativo
 *
 * Uso:
 *   import { criarMapa } from "./js/mapa.js";
 *   import { mapaDoDesenhoAPeca } from "./js/dados.js";
 *   const mapa = criarMapa(document.querySelector("#mapa"), mapaDoDesenhoAPeca);
 *
 * Retorna: { abrirEtapa(id), fecharEtapas(), destruir() }
 *
 * Sem dependências externas. Todo o markup recebe o prefixo "cm-".
 * O estado dos checklists vive apenas na memória da página.
 */

/* ------------------------------------------------------------------ */
/* Ícones (traço simples, herdam a cor via currentColor)               */
/* ------------------------------------------------------------------ */

const ICONES = {
  desenho:
    '<rect x="3" y="3" width="12" height="12" rx="1"/><path d="M3 7h12M7 3v12M10 10h2v2h-2z"/><path d="M14 13l4-2 3 1.5v4.5l-4 2-3-1.5z"/><path d="M14 13l3 1.5 4-2M17 14.5V19"/>',
  prancheta:
    '<rect x="4" y="4" width="13" height="17" rx="1.5"/><path d="M8 3h5v3H8z"/><path d="M7 10l1.2 1.2L10.5 9M7 15l1.2 1.2 2.3-2.2M12.5 10.5H14M12.5 15.5H14"/><circle cx="18" cy="17" r="3.2"/><path d="M18 15.5V17l1 .8"/>',
  programacao:
    '<rect x="2.5" y="4" width="19" height="13" rx="1.5"/><path d="M9 20h6M12 17v3"/><path d="M9.5 8.5L7 10.5l2.5 2M14.5 8.5l2.5 2-2.5 2M12.8 8l-1.6 5"/>',
  simulacao:
    '<rect x="2.5" y="4" width="19" height="13" rx="1.5"/><path d="M9 20h6M12 17v3"/><path d="M8 13.5l4-2 4 2M8 13.5V10l4-2 4 2v3.5M12 11.5V8"/>',
  maquina:
    '<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 17h18M9 3v4h6V3M12 7v4"/><path d="M11 11h2l-.5 2h-1z"/><path d="M7 15h10"/>',
  paquimetro:
    '<path d="M3 6h18v3H3z"/><path d="M5 9v8l2-2V9M14 9v6h3V9"/><path d="M8 6v1.5M11 6v1.5M14 6v1.5M17 6v1.5"/><circle cx="18" cy="18" r="3"/><path d="M16.8 18l.9.9 1.6-1.7"/>',
  pasta:
    '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h6.5A1.5 1.5 0 0 1 19 8.5V11"/><path d="M3 6.5V18a1.5 1.5 0 0 0 1.5 1.5H11"/><rect x="13" y="11" width="8" height="10" rx="1"/><path d="M15 14h4M15 16.5h4M15 19h2"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  dica:
    '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  alerta: '<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  limpar: '<path d="M4 4v6h6"/><path d="M5.5 15a7.5 7.5 0 1 0 1.8-7.8L4 10"/>'
};

function svg(nome, classe = "cm-icone") {
  const corpo = ICONES[nome] || ICONES.desenho;
  return `<svg class="${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${corpo}</svg>`;
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

function esc(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function movimentoReduzido() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function validarDados(dados) {
  const avisos = [];
  if (!dados || typeof dados !== "object") return ["dados ausentes"];
  if (!dados.id) avisos.push("mapa sem 'id'");
  if (!dados.titulo) avisos.push("mapa sem 'titulo'");
  if (!Array.isArray(dados.etapas) || dados.etapas.length === 0) {
    avisos.push("mapa sem 'etapas'");
    return avisos;
  }
  const ids = new Set();
  dados.etapas.forEach((e, i) => {
    ["id", "numero", "titulo", "icone", "cor", "resumo"].forEach((campo) => {
      if (e[campo] === undefined || e[campo] === "") avisos.push(`etapa ${i + 1}: falta '${campo}'`);
    });
    if (ids.has(e.id)) avisos.push(`etapa ${i + 1}: id repetido '${e.id}'`);
    ids.add(e.id);
    if (e.icone && !ICONES[e.icone]) avisos.push(`etapa ${i + 1}: ícone desconhecido '${e.icone}'`);
  });
  return avisos;
}

/* ------------------------------------------------------------------ */
/* Montagem do markup                                                  */
/* ------------------------------------------------------------------ */

function htmlCabecalho(d, idTitulo) {
  const fluxo = (d.fluxoResumo || [])
    .map((p) => `<li>${esc(p)}</li>`)
    .join("");
  return `
    <header class="cm-cabecalho">
      <p class="cm-selo-demo" role="note">${svg("alerta", "cm-icone cm-icone--p")}<span>${esc(d.aviso)}</span></p>
      <h1 class="cm-titulo" id="${idTitulo}">${esc(d.titulo)}</h1>
      ${d.subtitulo ? `<p class="cm-subtitulo">${esc(d.subtitulo)}</p>` : ""}
      ${
        fluxo
          ? `<ol class="cm-fluxo" aria-label="Resumo do fluxo">${fluxo}${
              d.fluxoResultado ? `<li class="cm-fluxo__fim">${esc(d.fluxoResultado)}</li>` : ""
            }</ol>`
          : ""
      }
    </header>`;
}

function htmlNavegacao(d, pre) {
  const itens = d.etapas
    .map(
      (e) => `
      <li>
        <button type="button" class="cm-nav__botao" data-cm-ir="${esc(e.id)}"
          style="--cm-cor:${esc(e.cor)}" aria-controls="${pre}-${esc(e.id)}"
          aria-label="Etapa ${esc(e.numero)}: ${esc(e.titulo)}">
          <span class="cm-nav__num">${esc(e.numero)}</span>
        </button>
      </li>`
    )
    .join("");
  return `
    <nav class="cm-nav" aria-label="Navegação rápida pelas etapas">
      <ol class="cm-nav__lista">${itens}</ol>
    </nav>`;
}

function htmlEtapa(e, d, pre, ultima) {
  const id = `${pre}-${e.id}`;
  const detalhes = (e.detalhes || []).map((p) => `<p>${esc(p)}</p>`).join("");
  const selo = e.selo
    ? `<span class="cm-selo cm-selo--${esc(e.selo.tipo || "atencao")}">${esc(e.selo.texto)}</span>`
    : "";
  const total = (e.checklist || []).length;

  const checklist = total
    ? `
      <section class="cm-checklist" aria-labelledby="${id}-chk">
        <div class="cm-checklist__topo">
          <h3 class="cm-bloco-titulo" id="${id}-chk">Checklist</h3>
          <span class="cm-contador" data-cm-contador aria-live="polite">0/${total}</span>
        </div>
        <ul class="cm-checklist__lista">
          ${e.checklist
            .map(
              (item, i) => `
            <li>
              <label class="cm-item">
                <input type="checkbox" class="cm-item__caixa" data-cm-check>
                <span class="cm-item__marca" aria-hidden="true">${svg("check", "cm-icone cm-icone--marca")}</span>
                <span class="cm-item__texto">${esc(item)}</span>
              </label>
            </li>`
            )
            .join("")}
        </ul>
        <div class="cm-checklist__rodape">
          <p class="cm-nota">${esc(d.avisoChecklist || "")}</p>
          <button type="button" class="cm-limpar" data-cm-limpar>${svg("limpar", "cm-icone cm-icone--p")}<span>Limpar</span></button>
        </div>
      </section>`
    : "";

  const dica = e.dica
    ? `<aside class="cm-destaque cm-destaque--dica" aria-label="Dica">${svg("dica")}<div><strong>Dica</strong><p>${esc(e.dica)}</p></div></aside>`
    : "";
  const alerta = e.alerta
    ? `<aside class="cm-destaque cm-destaque--alerta" aria-label="Alerta técnico">${svg("alerta")}<div><strong>Alerta técnico</strong><p>${esc(e.alerta)}</p></div></aside>`
    : "";

  return `
    <li class="cm-etapa${ultima ? " cm-etapa--ultima" : ""}" id="${id}" data-cm-etapa="${esc(e.id)}" style="--cm-cor:${esc(e.cor)}">
      <div class="cm-trilho" aria-hidden="true">
        <span class="cm-no"><span class="cm-no__num">${esc(e.numero)}</span>${svg("check", "cm-icone cm-no__ok")}</span>
        ${ultima ? "" : '<span class="cm-conector"></span>'}
      </div>
      <article class="cm-card">
        <h2 class="cm-card__h">
          <button type="button" class="cm-card__botao" id="${id}-btn" aria-expanded="false" aria-controls="${id}-painel">
            <span class="cm-card__icone">${svg(e.icone)}</span>
            <span class="cm-card__textos">
              <span class="cm-card__linha">
                <span class="cm-card__num">Etapa ${esc(e.numero)}</span>
                ${selo}
              </span>
              <span class="cm-card__titulo">${esc(e.titulo)}</span>
            </span>
            <span class="cm-card__seta">${svg("chevron")}</span>
            <span class="cm-card__resumo">${esc(e.resumo)}</span>
          </button>
        </h2>
        <div class="cm-painel" id="${id}-painel" role="region" aria-labelledby="${id}-btn" inert>
          <div class="cm-painel__dentro">
            <div class="cm-painel__conteudo">
              ${detalhes ? `<div class="cm-detalhes">${detalhes}</div>` : ""}
              ${checklist}
              ${dica}
              ${alerta}
            </div>
          </div>
        </div>
      </article>
    </li>`;
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export function criarMapa(raiz, dados, opcoes = {}) {
  const { usarHash = true } = opcoes;

  if (!raiz) throw new Error("criarMapa: elemento raiz não encontrado.");
  const avisos = validarDados(dados);
  if (avisos.length) console.warn("[Casillas Mapas] Problemas nos dados:", avisos);
  if (!dados || !Array.isArray(dados.etapas)) return null;

  const pre = `cm-${dados.id || "mapa"}`;
  const idTitulo = `${pre}-titulo`;
  const etapas = dados.etapas;

  raiz.classList.add("cm-mapa");
  raiz.setAttribute("aria-labelledby", idTitulo);
  raiz.innerHTML = `
    ${htmlCabecalho(dados, idTitulo)}
    ${htmlNavegacao(dados, pre)}
    <ol class="cm-etapas">
      ${etapas.map((e, i) => htmlEtapa(e, dados, pre, i === etapas.length - 1)).join("")}
    </ol>
    ${dados.rodape ? `<footer class="cm-rodape"><p>${esc(dados.rodape)}</p></footer>` : ""}
  `;

  const elEtapa = (id) => raiz.querySelector(`[data-cm-etapa="${CSS.escape(id)}"]`);
  const botoesNav = [...raiz.querySelectorAll("[data-cm-ir]")];
  let abertaId = null;
  let temporizadorRolagem = 0;
  const DURACAO_MS = 220; // igual a --cm-duracao no CSS

  function definirAberta(el, aberta) {
    const botao = el.querySelector(".cm-card__botao");
    const painel = el.querySelector(".cm-painel");
    el.classList.toggle("cm-etapa--aberta", aberta);
    botao.setAttribute("aria-expanded", String(aberta));
    if (aberta) painel.removeAttribute("inert");
    else painel.setAttribute("inert", "");
  }

  function marcarNavSelecionada(id) {
    botoesNav.forEach((b) => b.classList.toggle("cm-nav__botao--aberta", b.dataset.cmIr === id));
  }

  function rolarPara(el) {
    el.scrollIntoView({ behavior: movimentoReduzido() ? "auto" : "smooth", block: "start" });
  }

  function atualizarHash(id) {
    if (!usarHash) return;
    const novo = id ? `#${pre}-${id}` : location.pathname + location.search;
    history.replaceState(null, "", novo);
  }

  function abrirEtapa(id, { rolar = true, focar = false } = {}) {
    const el = elEtapa(id);
    if (!el) return;
    if (abertaId && abertaId !== id) {
      const anterior = elEtapa(abertaId);
      if (anterior) definirAberta(anterior, false);
    }
    definirAberta(el, true);
    abertaId = id;
    marcarNavSelecionada(id);
    atualizarHash(id);
    if (rolar) {
      // Espera a sanfona terminar de abrir/fechar para rolar até a posição final
      clearTimeout(temporizadorRolagem);
      temporizadorRolagem = setTimeout(() => rolarPara(el), movimentoReduzido() ? 0 : DURACAO_MS + 30);
    }
    if (focar) el.querySelector(".cm-card__botao").focus({ preventScroll: true });
  }

  function fecharEtapas() {
    if (!abertaId) return;
    const el = elEtapa(abertaId);
    if (el) definirAberta(el, false);
    abertaId = null;
    marcarNavSelecionada(null);
    atualizarHash(null);
  }

  function atualizarChecklist(el) {
    const caixas = [...el.querySelectorAll("[data-cm-check]")];
    const feitos = caixas.filter((c) => c.checked).length;
    const contador = el.querySelector("[data-cm-contador]");
    if (contador) contador.textContent = `${feitos}/${caixas.length}`;
    const completa = caixas.length > 0 && feitos === caixas.length;
    el.classList.toggle("cm-etapa--completa", completa);
    const id = el.dataset.cmEtapa;
    const nav = botoesNav.find((b) => b.dataset.cmIr === id);
    if (nav) nav.classList.toggle("cm-nav__botao--completa", completa);
  }

  /* --- eventos (delegação no elemento raiz) --- */

  function aoClicar(ev) {
    const cabec = ev.target.closest(".cm-card__botao");
    if (cabec && raiz.contains(cabec)) {
      const el = cabec.closest("[data-cm-etapa]");
      const id = el.dataset.cmEtapa;
      if (abertaId === id) fecharEtapas();
      else abrirEtapa(id);
      return;
    }
    const nav = ev.target.closest("[data-cm-ir]");
    if (nav && raiz.contains(nav)) {
      abrirEtapa(nav.dataset.cmIr, { focar: true });
      return;
    }
    const limpar = ev.target.closest("[data-cm-limpar]");
    if (limpar && raiz.contains(limpar)) {
      const el = limpar.closest("[data-cm-etapa]");
      el.querySelectorAll("[data-cm-check]").forEach((c) => (c.checked = false));
      atualizarChecklist(el);
    }
  }

  function aoMudar(ev) {
    if (ev.target.matches("[data-cm-check]")) {
      atualizarChecklist(ev.target.closest("[data-cm-etapa]"));
    }
  }

  // Setas esquerda/direita, Home e End movem o foco na navegação rápida
  function aoTeclarNav(ev) {
    const atual = ev.target.closest("[data-cm-ir]");
    if (!atual) return;
    const i = botoesNav.indexOf(atual);
    let alvo = null;
    if (ev.key === "ArrowRight") alvo = botoesNav[(i + 1) % botoesNav.length];
    else if (ev.key === "ArrowLeft") alvo = botoesNav[(i - 1 + botoesNav.length) % botoesNav.length];
    else if (ev.key === "Home") alvo = botoesNav[0];
    else if (ev.key === "End") alvo = botoesNav[botoesNav.length - 1];
    if (alvo) {
      ev.preventDefault();
      alvo.focus();
      alvo.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function aoMudarHash() {
    const alvo = location.hash.slice(1);
    if (!alvo.startsWith(`${pre}-`)) return;
    const id = alvo.slice(pre.length + 1);
    if (elEtapa(id) && id !== abertaId) abrirEtapa(id);
  }

  raiz.addEventListener("click", aoClicar);
  raiz.addEventListener("change", aoMudar);
  const navEl = raiz.querySelector(".cm-nav");
  navEl.addEventListener("keydown", aoTeclarNav);
  if (usarHash) window.addEventListener("hashchange", aoMudarHash);

  /* --- etapa visível: destaca na navegação rápida --- */

  let observador = null;
  if ("IntersectionObserver" in window) {
    const visiveis = new Map();
    observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => visiveis.set(en.target.dataset.cmEtapa, en.isIntersecting ? en.boundingClientRect.top : null));
        let melhor = null;
        let menorTopo = Infinity;
        visiveis.forEach((topo, id) => {
          if (topo !== null && topo < menorTopo) {
            menorTopo = topo;
            melhor = id;
          }
        });
        botoesNav.forEach((b) => {
          const ativo = b.dataset.cmIr === melhor;
          b.classList.toggle("cm-nav__botao--visivel", ativo);
          if (ativo) b.setAttribute("aria-current", "step");
          else b.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-90px 0px -55% 0px", threshold: 0 }
    );
    raiz.querySelectorAll("[data-cm-etapa]").forEach((el) => observador.observe(el));
  }

  /* --- estado inicial --- */

  raiz.querySelectorAll("[data-cm-etapa]").forEach(atualizarChecklist);
  if (usarHash) {
    const alvo = location.hash.slice(1);
    if (alvo.startsWith(`${pre}-`)) {
      const id = alvo.slice(pre.length + 1);
      if (elEtapa(id)) abrirEtapa(id, { rolar: true });
    }
  }
  // Ativa as transições só depois do primeiro desenho, para não animar o estado inicial
  requestAnimationFrame(() => raiz.classList.add("cm-mapa--pronto"));

  function destruir() {
    clearTimeout(temporizadorRolagem);
    raiz.removeEventListener("click", aoClicar);
    raiz.removeEventListener("change", aoMudar);
    navEl.removeEventListener("keydown", aoTeclarNav);
    if (usarHash) window.removeEventListener("hashchange", aoMudarHash);
    if (observador) observador.disconnect();
    raiz.innerHTML = "";
    raiz.classList.remove("cm-mapa", "cm-mapa--pronto");
    raiz.removeAttribute("aria-labelledby");
  }

  return { abrirEtapa: (id) => abrirEtapa(id), fecharEtapas, destruir };
}
