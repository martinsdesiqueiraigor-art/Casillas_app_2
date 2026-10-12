// routes.js — Rotas da área Aprender (relativas a '#/biblioteca/aprender').
// CAS22-BIB-APRENDER-PILOTO-01 · funções puras.
//
//   ''                      → { name: 'home' }
//   'area/<id>'             → { name: 'area', id }
//   'aula/<id>?aba=<aba>'   → { name: 'aula', id, aba }
//   'quiz/<id>'             → { name: 'quiz', id }
//   'mapa/<id>'             → { name: 'mapa', id }
// Qualquer outra coisa      → { name: 'notfound' }

export const PREFIXO = 'aprender';
const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** @param {unknown} id */
export function idValido(id) {
  return typeof id === 'string' && ID_RE.test(id);
}

/**
 * @param {string} caminho texto após '#/biblioteca/aprender' (com ou sem '/')
 * @param {{areas:string[], aulas:string[], quizzes:string[], mapas:string[], abas:string[]}} conhecidos
 */
export function lerCaminho(caminho, conhecidos) {
  try {
    const texto = String(caminho || '').replace(/^\/+/, '');
    if (!texto) return { name: 'home' };
    const [base, query = ''] = texto.split('?');
    const partes = base.split('/').filter(Boolean);
    if (partes.length !== 2 || !idValido(partes[1])) return { name: 'notfound' };
    const [tipo, id] = partes;
    if (tipo === 'area' && conhecidos.areas.includes(id)) return { name: 'area', id };
    if (tipo === 'quiz' && conhecidos.quizzes.includes(id)) return { name: 'quiz', id };
    if (tipo === 'mapa' && conhecidos.mapas.includes(id)) return { name: 'mapa', id };
    if (tipo === 'aula' && conhecidos.aulas.includes(id)) {
      const aba = new URLSearchParams(query).get('aba');
      return { name: 'aula', id, aba: conhecidos.abas.includes(aba || '') ? aba : conhecidos.abas[0] };
    }
    return { name: 'notfound' };
  } catch {
    return { name: 'notfound' };
  }
}

/** @returns {string} caminho relativo a '#/biblioteca/aprender' */
export function paraCaminho(rota) {
  switch (rota?.name) {
    case 'area': return `area/${rota.id}`;
    case 'aula': return `aula/${rota.id}${rota.aba ? `?aba=${rota.aba}` : ''}`;
    case 'quiz': return `quiz/${rota.id}`;
    case 'mapa': return `mapa/${rota.id}`;
    default: return '';
  }
}

/** Hash completo no padrão do app. */
export function paraHash(rota) {
  const c = paraCaminho(rota);
  return `#/biblioteca/${PREFIXO}${c ? `/${c}` : ''}`;
}

/** Tela-pai, para o Voltar quando não há histórico. */
export function pai(rota) {
  switch (rota?.name) {
    case 'aula':
    case 'quiz': return { name: 'area', id: 'cnc' };
    case 'mapa': return { name: 'area', id: 'mapas' };
    default: return { name: 'home' };
  }
}
