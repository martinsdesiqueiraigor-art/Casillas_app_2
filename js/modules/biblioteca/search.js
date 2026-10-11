// search.js — Busca local da Biblioteca Técnica. Funções puras, sem DOM e sem rede.

/** Remove acentos e normaliza caixa, mantendo 1 caractere de saída por caractere de entrada. */
export function foldChar(c) {
  return c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() || c;
}

/** @param {unknown} s */
export function fold(s) {
  return Array.from(String(s ?? ''), foldChar).join('');
}

/** @param {unknown} query @returns {string[]} */
export function terms(query) {
  return fold(query).split(/\s+/).filter(Boolean);
}

/**
 * Monta o índice de busca a partir dos dados.
 * Cada entrada aponta para uma rota interna do módulo ({ name, id, tab? }).
 */
export function buildIndex(categories, sheets, topicStatus) {
  /** @type {any[]} */
  const idx = [];
  const categoryById = (id) => categories.find((c) => c.id === id);

  for (const c of categories) {
    idx.push({
      type: 'area', title: c.title, sub: c.short, icon: c.icon,
      route: { name: 'categoria', id: c.id },
      sections: [{ name: 'Descrição', text: `${c.short} ${c.description}` }],
    });
    for (const t of c.topics) {
      if (t.sheetId) continue; // a ficha representa o assunto
      idx.push({
        type: 'assunto', title: t.title, sub: `${c.title} · ${topicStatus[t.status] ?? ''}`, icon: c.icon,
        route: { name: 'categoria', id: c.id },
        sections: [{ name: 'Resumo', text: t.summary }],
      });
    }
  }

  for (const s of Object.values(sheets)) {
    const cat = categoryById(s.categoryId);
    idx.push({
      type: 'ficha', title: `${s.title} — ${s.subtitle}`, sub: `${s.code} · ${cat ? cat.title : ''}`, icon: 'doc',
      state: s.reviewState,
      route: { name: 'ficha', id: s.id },
      // tab: aba da ficha aberta quando o termo é encontrado naquela seção
      sections: [
        { name: 'Visão geral · Resumo técnico', tab: 'visao', text: s.summary },
        { name: 'Visão geral · Conceitos', tab: 'visao', text: s.concepts.map((c) => `${c.term} ${c.text}`).join(' ') + ' ' + s.principle },
        { name: 'Utilização · Procedimento', tab: 'uso', text: s.procedure.join(' ') },
        { name: 'Cuidados', tab: 'cuidados', text: [...s.cautions.map((c) => `${c.title} ${c.text}`), ...(s.conservation || [])].join(' ') },
        { name: 'Fontes e revisão', tab: 'fontes', text: s.references.map((r) => r.label).join(' ') },
      ],
    });
  }

  for (const e of idx) {
    e.fTitle = fold(e.title);
    e.fSections = e.sections.map((x) => fold(x.text));
    e.fAll = [e.fTitle, fold(e.sub), ...e.fSections].join(' ');
  }
  return idx;
}

const TYPE_RANK = { ficha: 0, assunto: 1, area: 2 };

/**
 * Busca: todos os termos precisam aparecer (sem acento e sem caixa).
 * Resultados com o termo no título vêm primeiro; depois fichas, assuntos e áreas.
 */
export function search(index, query) {
  const ts = terms(query);
  if (!ts.length) return [];
  const out = [];
  for (const e of index) {
    if (!ts.every((t) => e.fAll.includes(t))) continue;
    const inTitle = ts.every((t) => e.fTitle.includes(t));
    let where = null;
    let route = { ...e.route };
    if (!inTitle) {
      const i = e.fSections.findIndex((txt) => ts.some((t) => txt.includes(t)));
      if (i >= 0) {
        where = e.sections[i].name;
        if (e.sections[i].tab) route = { ...route, tab: e.sections[i].tab };
      }
    }
    out.push({ type: e.type, title: e.title, sub: e.sub, icon: e.icon, state: e.state, route, where, score: (inTitle ? 0 : 10) + TYPE_RANK[e.type] });
  }
  return out.sort((a, b) => a.score - b.score);
}

/**
 * Divide o texto em trechos marcados e não marcados, para destacar os termos
 * sem montar HTML. @returns {{ text: string, mark: boolean }[]}
 */
export function highlightSegments(text, query) {
  const ts = terms(query);
  const chars = Array.from(String(text ?? ''));
  const f = chars.map(foldChar).join('');
  const mark = new Array(chars.length).fill(false);
  for (const t of ts) {
    let i = f.indexOf(t);
    while (i >= 0) { for (let k = i; k < i + t.length && k < mark.length; k++) mark[k] = true; i = f.indexOf(t, i + 1); }
  }
  const segs = [];
  chars.forEach((c, i) => {
    const last = segs[segs.length - 1];
    if (last && last.mark === mark[i]) last.text += c;
    else segs.push({ text: c, mark: mark[i] });
  });
  return segs;
}

/** Filtra assuntos de uma categoria (busca dentro da área). */
export function filterTopics(topics, query) {
  const ts = terms(query);
  return topics.filter((t) => ts.every((term) => fold(`${t.title} ${t.summary}`).includes(term)));
}
