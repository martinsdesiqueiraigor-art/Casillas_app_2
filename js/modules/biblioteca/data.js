// data.js — Conteúdo demonstrativo da Biblioteca Técnica.
// Origem: protótipo aprovado CAS22-BIB-PROTOTYPE-02 (conteúdo sem alterações).
//
// IMPORTANTE: todo o conteúdo abaixo é DEMONSTRATIVO e NÃO HOMOLOGADO.
// Não contém normas, tolerâncias, valores de precisão ou referências técnicas
// reais. Os campos de referência estão propositalmente marcados como pendentes.
//
// Estrutura: categories[] -> topics[] -> (opcional) sheetId -> sheets[sheetId]
// Identificadores: minúsculas, dígitos e hífen (validados em routes.js).

/** Estados de validação de uma ficha (rastreabilidade). */
export const REVIEW_STATES = {
  demo: {
    label: 'Demonstração',
    tone: 'warn',
    description: 'Conteúdo ilustrativo para avaliar a interface. Não usar como referência técnica.',
  },
  draft: {
    label: 'Rascunho',
    tone: 'muted',
    description: 'Em elaboração. Ainda sem revisão técnica.',
  },
  review: {
    label: 'Em revisão',
    tone: 'info',
    description: 'Conteúdo completo aguardando revisão técnica independente.',
  },
  validated: {
    label: 'Validado',
    tone: 'ok',
    description: 'Revisado e vinculado a fontes documentais rastreáveis.',
  },
};

/** Estado de disponibilidade de um assunto. */
export const TOPIC_STATUS = {
  available: 'Ficha disponível',
  planned: 'Em preparação',
};

export const categories = [
  {
    id: 'metrologia',
    title: 'Metrologia e medição',
    eyebrow: 'Área em destaque',
    short: 'Instrumentos, leitura e cuidados na medição de peças.',
    description:
      'Fundamentos de uso dos instrumentos de medição presentes na oficina: princípio de funcionamento, leitura, cuidados e erros comuns.',
    icon: 'gauge',
    tier: 'featured',
    topics: [
      {
        id: 'micrometro-externo',
        title: 'Micrômetro externo',
        summary: 'Partes, princípio de funcionamento, leitura e cuidados.',
        status: 'available',
        sheetId: 'micrometro-externo-fundamentos',
      },
      {
        id: 'paquimetro',
        title: 'Paquímetro',
        summary: 'Medições externas, internas e de profundidade.',
        status: 'planned',
      },
      {
        id: 'relogio-comparador',
        title: 'Relógio comparador',
        summary: 'Medição por comparação e verificação de batimento.',
        status: 'planned',
      },
      {
        id: 'rugosidade-superficial',
        title: 'Rugosidade superficial',
        summary: 'Conceitos de acabamento e como ele é avaliado.',
        status: 'planned',
      },
    ],
  },
  {
    id: 'roscas',
    title: 'Roscas',
    short: 'Nomenclatura, perfis e roscamento.',
    description: 'Nomenclatura, tipos de perfil e conceitos de roscamento aplicados ao torno e ao centro de usinagem.',
    icon: 'thread',
    tier: 'secondary',
    topics: [
      { id: 'nomenclatura-roscas', title: 'Nomenclatura de roscas', summary: 'Termos básicos usados no desenho e na oficina.', status: 'planned' },
    ],
  },
  {
    id: 'tolerancias',
    title: 'Tolerâncias',
    short: 'Ajustes, limites e leitura em desenho.',
    description: 'Como interpretar tolerâncias e ajustes indicados em desenho técnico.',
    icon: 'tolerance',
    tier: 'secondary',
    topics: [
      { id: 'leitura-tolerancias', title: 'Leitura de tolerâncias no desenho', summary: 'Como interpretar as indicações de limite.', status: 'planned' },
    ],
  },
  {
    id: 'programacao-cnc',
    title: 'Programação CNC',
    short: 'Estrutura de programa e funções.',
    description: 'Estrutura de programas, funções preparatórias e auxiliares. Complementa o Guia CNC.',
    icon: 'code',
    tier: 'secondary',
    topics: [
      { id: 'estrutura-programa', title: 'Estrutura de um programa CNC', summary: 'Cabeçalho, blocos e encerramento.', status: 'planned' },
    ],
  },
  {
    id: 'normas-manuais',
    title: 'Normas e manuais',
    short: 'Acervo documental de referência.',
    description: 'Índice dos documentos de referência que fundamentam as fichas. Os documentos serão vinculados após homologação.',
    icon: 'doc',
    tier: 'secondary',
    topics: [],
  },
  {
    id: 'processos',
    title: 'Processos de usinagem',
    short: 'Torneamento, fresamento e furação.',
    description: 'Visão geral dos processos de usinagem por remoção de cavaco.',
    icon: 'lathe',
    tier: 'other',
    topics: [],
  },
  {
    id: 'ferramentas',
    title: 'Ferramentas e parâmetros de corte',
    short: 'Seleção de ferramentas e conceitos de corte.',
    description: 'Conceitos sobre ferramentas, insertos e parâmetros de corte. Complementa as Calculadoras.',
    icon: 'tool',
    tier: 'other',
    topics: [],
  },
  {
    id: 'materiais',
    title: 'Materiais',
    short: 'Famílias de materiais e usinabilidade.',
    description: 'Famílias de materiais e conceitos de usinabilidade.',
    icon: 'cube',
    tier: 'other',
    topics: [],
  },
];

export const sheets = {
  'micrometro-externo-fundamentos': {
    id: 'micrometro-externo-fundamentos',
    code: 'BIB-MET-001',
    categoryId: 'metrologia',
    topicId: 'micrometro-externo',
    title: 'Micrômetro externo',
    subtitle: 'Fundamentos de medição',
    version: '0.1-demo',
    reviewState: 'demo',
    level: 'Introdutório',
    readingTime: '4 min',

    summary:
      'O micrômetro externo mede dimensões externas, como diâmetros e espessuras, convertendo o giro de um fuso roscado em deslocamento linear. Esta ficha apresenta suas partes, o princípio de funcionamento e uma rotina geral de uso.',

    concepts: [
      { term: 'Arco', text: 'Estrutura em forma de “C” que sustenta as demais partes. Deve ser segurado pelo isolamento térmico, quando houver.' },
      { term: 'Batente fixo e fuso', text: 'As duas faces de medição. A peça fica entre elas; o fuso avança ou recua ao girar o tambor.' },
      { term: 'Bainha', text: 'Parte fixa com a escala principal, lida a partir da borda do tambor.' },
      { term: 'Tambor', text: 'Parte giratória com escala circular, que complementa a leitura da bainha.' },
      { term: 'Catraca ou fricção', text: 'Limita a força aplicada no contato, para que as medições sejam feitas sempre com força semelhante.' },
      { term: 'Trava', text: 'Fixa o fuso na posição, permitindo retirar o instrumento e fazer a leitura com calma.' },
    ],

    principle:
      'A cada volta completa do tambor, o fuso avança uma distância igual ao passo de sua rosca. A escala do tambor divide essa volta em partes iguais. A resolução e a faixa de medição variam conforme o modelo e devem ser consultadas no manual do fabricante.',

    procedure: [
      'Limpe as faces de medição e a superfície da peça.',
      'Verifique o zero do instrumento conforme o procedimento indicado pelo fabricante.',
      'Abra o fuso um pouco além da dimensão a medir.',
      'Posicione a peça entre o batente e o fuso, alinhada ao eixo de medição.',
      'Aproxime o fuso pelo tambor e finalize o contato pela catraca.',
      'Leia a escala da bainha e some a leitura do tambor.',
      'Registre o valor e repita a medição para confirmar.',
    ],

    // kind: 'erro' (erro comum de medição) | 'alerta' (risco ao instrumento ou uso inadequado)
    cautions: [
      { kind: 'erro', title: 'Força excessiva', text: 'Apertar pelo tambor em vez da catraca altera a leitura e pode danificar o instrumento.' },
      { kind: 'erro', title: 'Temperatura', text: 'Instrumento e peça devem estar em temperatura semelhante. Evite segurar o arco por muito tempo com a mão.' },
      { kind: 'erro', title: 'Sujeira nas faces', text: 'Cavaco, óleo ou poeira entre as faces e a peça falseiam a medida.' },
      { kind: 'erro', title: 'Paralaxe', text: 'Ler a escala em ângulo pode deslocar a leitura. Olhe de frente para a linha de referência.' },
      { kind: 'erro', title: 'Desalinhamento', text: 'A peça inclinada entre as faces resulta em uma medida maior que a real.' },
      { kind: 'alerta', title: 'Uso indevido', text: 'O micrômetro não deve ser usado como grampo, alavanca ou calibrador de passa/não-passa.' },
    ],

    // Recomendações gerais, sem valores. Demonstrativas, como o restante da ficha.
    conservation: [
      'Limpe o instrumento depois do uso e guarde-o no estojo.',
      'Guarde com as faces de medição levemente afastadas e sem a trava acionada.',
      'Evite quedas e impactos. Após uma queda, separe o instrumento para verificação.',
      'Mantenha longe de cavaco, fluido de corte e fontes de calor.',
      'Siga o plano de verificação e calibração definido pela empresa.',
    ],

    // Ilustrações disponíveis para a aba Utilização. 'parts' = esquema de identificação das partes.
    illustrations: [
      { id: 'parts', caption: 'Esquema de identificação das partes. Ilustração demonstrativa, fora de escala.' },
    ],

    references: [
      { label: 'Manual do fabricante do instrumento', status: 'pending', note: 'A vincular na homologação' },
      { label: 'Norma técnica aplicável', status: 'pending', note: 'A definir pelo revisor técnico' },
      { label: 'Procedimento interno de metrologia', status: 'pending', note: 'A definir' },
    ],

    review: {
      author: 'Equipe Casillas (demonstração)',
      reviewer: 'Pendente',
      updated: '—',
      history: [
        { version: '0.1-demo', note: 'Conteúdo demonstrativo criado para o protótipo de interface.' },
      ],
    },

    related: [
      { kind: 'consultor', label: 'Perguntar ao Consultor', hint: 'Usa esta ficha como contexto' },
      { kind: 'topic', label: 'Paquímetro', target: 'paquimetro', hint: 'Mesma área' },
      { kind: 'topic', label: 'Relógio comparador', target: 'relogio-comparador', hint: 'Mesma área' },
    ],

    consultorExamples: [
      'Como faço a leitura combinando bainha e tambor?',
      'Por que devo usar a catraca no final do contato?',
      'Quais erros mais alteram a medida?',
    ],
  },
};
