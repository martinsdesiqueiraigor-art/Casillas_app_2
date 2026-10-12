// quiz-g71.js — Questões do quiz da aula G71 (somente dados).
// CAS22-BIB-APRENDER-PILOTO-01 · protótipo isolado.
//
// Todas as questões são DIDÁTICAS e estão em rascunho (reviewState 'draft').
// Não há questões de interpretação de código: a sintaxe do G71 ainda não foi
// verificada (ver aula-g71.js). Cada questão aponta para a seção da aula que
// sustenta a resposta.
//
// tipo 'multipla': opcoes[] + correta (id)
// tipo 'ordenar':  itens[] na ordem de apresentação + ordem (ids na ordem certa)
// figura (opcional): { tipo: 'regioes' } desenha a peça com regiões A, B e C.

export const quizG71 = {
  id: 'g71',
  aulaRef: 'g71',
  titulo: 'Quiz · Desbaste longitudinal (G71)',
  reviewState: 'draft',
  nota: 'Quiz conceitual da aula G71 para FANUC 0i-TD / ROMI G/GL/GLM. Conceitos aprovados pelo PO; questões não avaliam a execução de um programa específico.',
  questoes: [
    {
      id: 'finalidade',
      tipo: 'multipla',
      tema: 'Finalidade do desbaste',
      enunciado: 'Qual é a finalidade do desbaste?',
      opcoes: [
        { id: 'a', texto: 'Dar o acabamento final da superfície.' },
        { id: 'b', texto: 'Remover a maior parte do material em passes, deixando uma camada para o acabamento.' },
        { id: 'c', texto: 'Conferir o diâmetro da peça depois da usinagem.' },
        { id: 'd', texto: 'Abrir a rosca da peça.' },
      ],
      correta: 'b',
      explicacao: 'O desbaste tira a maior parte do material, rápido e em camadas. A forma final e a qualidade da superfície ficam para o acabamento.',
      referencia: { secao: 'visao', texto: 'Aula G71 · Visão geral' },
      reviewState: 'draft',
    },
    {
      id: 'regiao-sobremetal',
      tipo: 'multipla',
      tema: 'Interpretação visual',
      enunciado: 'Na figura, qual região representa o sobremetal de acabamento?',
      figura: { tipo: 'regioes' },
      opcoes: [
        { id: 'A', texto: 'Região A' },
        { id: 'B', texto: 'Região B' },
        { id: 'C', texto: 'Região C' },
      ],
      correta: 'A',
      explicacao: 'A região A é a camada fina que acompanha o perfil: o sobremetal, removido no acabamento. B é a camada de um passe de desbaste. C é a própria peça.',
      referencia: { secao: 'trajetoria', texto: 'Aula G71 · Trajetória (sobremetal "Com")' },
      reviewState: 'draft',
    },
    {
      id: 'profundidade-passes',
      tipo: 'multipla',
      tema: 'Interpretação visual',
      enunciado: 'No modelo da aula, o que acontece com o número de passes quando a profundidade por passe aumenta?',
      opcoes: [
        { id: 'a', texto: 'Aumenta.' },
        { id: 'b', texto: 'Diminui.' },
        { id: 'c', texto: 'Não muda.' },
      ],
      correta: 'b',
      explicacao: 'Camadas mais grossas removem o mesmo material em menos passes. Experimente na aba Trajetória. A profundidade adequada depende de ferramenta, material, máquina e fixação.',
      referencia: { secao: 'trajetoria', texto: 'Aula G71 · Trajetória' },
      reviewState: 'draft',
    },
    {
      id: 'sequencia',
      tipo: 'ordenar',
      tema: 'Sequência geral',
      enunciado: 'Coloque as etapas na ordem geral de usinagem desta peça.',
      itens: [
        { id: 'acabar', texto: 'Acabar seguindo o perfil final' },
        { id: 'desenho', texto: 'Interpretar o desenho' },
        { id: 'medir', texto: 'Medir a peça' },
        { id: 'desbastar', texto: 'Desbastar em passes' },
        { id: 'simular', texto: 'Simular o programa' },
      ],
      ordem: ['desenho', 'simular', 'desbastar', 'acabar', 'medir'],
      explicacao: 'Primeiro se entende o desenho; o programa é simulado antes de ir para a máquina; o desbaste vem antes do acabamento; a medição confirma o resultado.',
      referencia: { secao: 'mapa', texto: 'Mapa Do Desenho à Peça · etapas 1 a 6' },
      reviewState: 'draft',
    },
    {
      id: 'aproximacao',
      tipo: 'multipla',
      tema: 'Cuidados de programação',
      enunciado: 'De onde a ferramenta deve partir para iniciar o desbaste?',
      opcoes: [
        { id: 'a', texto: 'De um ponto em contato com a face da peça.' },
        { id: 'b', texto: 'De um ponto de aproximação fora do material.' },
        { id: 'c', texto: 'Do centro da peça.' },
      ],
      correta: 'b',
      explicacao: 'Partir de fora do bruto evita colisão no início do movimento. A posição exata segue o manual da máquina e o procedimento da empresa.',
      referencia: { secao: 'cuidados', texto: 'Aula G71 · Cuidados' },
      reviewState: 'draft',
    },
    {
      id: 'variante',
      tipo: 'multipla',
      tema: 'Cuidados de programação',
      enunciado: 'Antes de usar o ciclo de desbaste em outra máquina, o que é preciso conferir?',
      opcoes: [
        { id: 'a', texto: 'Nada: o ciclo funciona igual em todos os controles.' },
        { id: 'b', texto: 'Só a rotação máxima da máquina.' },
        { id: 'c', texto: 'No manual do controle, o formato do comando e a unidade de cada parâmetro.' },
      ],
      correta: 'c',
      explicacao: 'Formato e unidades variam entre controles e modelos. O manual da máquina é a referência; não presuma compatibilidade.',
      referencia: { secao: 'cuidados', texto: 'Aula G71 · Cuidados · Variante errada' },
      reviewState: 'draft',
    },
    {
      id: 'calculadora',
      tipo: 'multipla',
      tema: 'Cuidados de programação',
      enunciado: 'Uma calculadora mostra um bloco de desbaste com valores prontos. Como tratar esses valores?',
      opcoes: [
        { id: 'a', texto: 'Usar direto na máquina, porque foram calculados.' },
        { id: 'b', texto: 'Conferir no manual e no procedimento da empresa antes de usar.' },
        { id: 'c', texto: 'Trocar só o avanço e executar.' },
      ],
      correta: 'b',
      explicacao: 'Valores prontos não substituem a revisão. Confira formato, unidades e limites no manual e simule antes de executar.',
      referencia: { secao: 'sintaxe', texto: 'Aula G71 · Sintaxe (nota sobre a calculadora)' },
      reviewState: 'draft',
    },
    {
      id: 'simular',
      tipo: 'multipla',
      tema: 'Cuidados de programação',
      enunciado: 'O programa de desbaste está pronto. Qual é o próximo passo antes de executar na máquina?',
      opcoes: [
        { id: 'a', texto: 'Simular o programa e procurar colisões.' },
        { id: 'b', texto: 'Executar direto com avanço máximo.' },
        { id: 'c', texto: 'Apagar o sobremetal para ganhar tempo.' },
      ],
      correta: 'a',
      explicacao: 'A simulação ajuda a encontrar colisões e movimentos inesperados antes que aconteçam na máquina.',
      referencia: { secao: 'mapa', texto: 'Mapa Do Desenho à Peça · etapa 4' },
      reviewState: 'draft',
    },
  ],
};
