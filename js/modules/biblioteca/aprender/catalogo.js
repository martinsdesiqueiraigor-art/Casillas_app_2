// catalogo.js — Áreas e itens da Biblioteca Educativa (área Aprender).
// CAS22-BIB-APRENDER-PILOTO-01 · protótipo isolado, não integrado ao app.
//
// Somente dados. Metrologia NÃO duplica as fichas: guarda apenas o id da
// ficha da área Consultar (js/modules/biblioteca/data.js), e o título e o
// estado de revisão são lidos de lá em tempo de execução (ver index.js).
//
// tipo: 'ficha' (abre a área Consultar) | 'aula' | 'quiz' | 'mapa'
// status: 'disponivel' | 'em-preparacao'

export const AREAS = [
  {
    id: 'metrologia',
    titulo: 'Metrologia',
    resumo: 'Instrumentos de medição: leitura, uso e cuidados.',
    icone: 'gauge',
    itens: [
      { tipo: 'ficha', fichaId: 'micrometro-externo-fundamentos', status: 'disponivel' },
      { tipo: 'ficha', fichaId: 'paquimetro-fundamentos', status: 'disponivel' },
    ],
    nota: 'As fichas abrem na área Consultar. Não há cópia do conteúdo.',
  },
  {
    id: 'cnc',
    titulo: 'Programação CNC',
    resumo: 'Ciclos explicados com trajetória, exercícios e trilha opcional.',
    icone: 'code',
    itens: [
      { tipo: 'aula', id: 'g71', status: 'disponivel' },
      { tipo: 'quiz', id: 'g71', status: 'disponivel' },
    ],
    trilha: {
      titulo: 'Trilha sugerida: desbaste no torno',
      passos: ['aula:g71', 'quiz:g71', 'mapa:desenho-peca'],
      nota: 'Opcional. Qualquer item pode ser aberto diretamente.',
    },
  },
  {
    id: 'mapas',
    titulo: 'Mapas Técnicos',
    resumo: 'Processos por etapas, com acesso direto a cada mapa.',
    icone: 'layers',
    itens: [
      { tipo: 'mapa', id: 'desenho-peca', status: 'disponivel' },
    ],
  },
];

/** Mapas técnicos disponíveis. O conteúdo vem de js/modules/mapas/dados.js. */
export const MAPAS = {
  'desenho-peca': {
    id: 'desenho-peca',
    titulo: 'Do Desenho à Peça',
    resumo: 'Fluxo técnico de fabricação em 7 etapas.',
    reviewState: 'demo',
  },
};
