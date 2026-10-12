// aula-g71.js — Conteúdo da aula-piloto G71 (somente dados).
// CAS22-BIB-APRENDER-PILOTO-01 · protótipo isolado, não integrado ao app.
//
// G71 ainda não consta do banco canônico do Guia CNC.
// A sintaxe abaixo foi fornecida e revisada pelo PO para FANUC 0i-TD / ROMI.
// U do primeiro bloco em RAIO (decisão mais recente, substitui diâmetro).
// U do segundo bloco em DIÂMETRO. Não há programa numérico executável nesta aula.
// Não usar valores fixos da calculadora como referência técnica.

export const SECTION_STATES = {
  rascunho: {
    label: 'Rascunho didático',
    tone: 'muted',
    texto: 'Conceitos gerais, ainda sem revisão técnica. Não usar como referência de programação.',
  },
  'em-revisao': {
    label: 'Em revisão técnica',
    tone: 'warn',
    texto: 'Conteúdo aguardando fonte verificada e revisão. Nada é exibido até lá.',
  },
  'nao-localizado': {
    label: 'Não localizado',
    tone: 'warn',
    texto: 'O G71 não consta do banco canônico do Guia CNC. Sem fonte, não há conteúdo para exibir.',
  },
  'aprovado-po': {
    label: 'Conceitos aprovados pelo PO',
    tone: 'ok',
    texto: 'Revisão técnica declarada pelo Product Owner para esta variante. Não equivale à conferência documental independente de um programa específico.',
  },
  validado: {
    label: 'Validado',
    tone: 'ok',
    texto: 'Revisado e vinculado a fonte documental.',
  },
};

export const ABAS_AULA = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'trajetoria', label: 'Trajetória' },
  { id: 'sintaxe', label: 'Sintaxe' },
  { id: 'exemplo', label: 'Exemplo' },
  { id: 'cuidados', label: 'Cuidados' },
  { id: 'praticar', label: 'Praticar' },
];

export const aulaG71 = {
  id: 'g71',
  codigo: 'G71',
  titulo: 'Desbaste longitudinal',
  subtitulo: 'Aula-piloto · Programação CNC · Torno',
  versao: '0.3-sintaxe-po',
  reviewState: 'draft',
  nivel: 'Introdutório',
  duracao: '8 min',
  variante: {
    // Registrado no catálogo de referência anterior do Guia, com estado "vazio".
    texto: 'FANUC 0i-TD · ROMI G/GL/GLM',
    detalhe: 'Conceitos técnicos aprovados pelo Product Owner. A validação declarada para máquina real não identifica um programa completo específico; a aula continua didática.',
  },
  // Ligação prevista com o Guia CNC (ciclo inexistente no banco canônico).
  guia: {
    cicloRef: 'fanuc_torno_g71',
    estado: 'nao-localizado',
    texto: 'Quando o G71 for cadastrado e revisado no banco do Guia CNC, este botão abrirá a ficha correspondente.',
  },

  secoes: {
    visao: {
      estado: 'aprovado-po',
      finalidade:
        'Desbastar é remover a maior parte do material do bruto em passes sucessivos, antes do acabamento. No desbaste longitudinal, cada passe corta ao longo do eixo da peça e reduz o diâmetro em uma camada.',
      aplicacao:
        'Peças torneadas com vários diâmetros, como eixos escalonados, em que muito material precisa sair antes de dar a forma final.',
      conceitos: [
        { id: 'bruto', termo: 'Bruto', texto: 'O material como chega à máquina, antes de qualquer corte.' },
        { id: 'perfil', termo: 'Perfil final', texto: 'A forma da peça definida pelo desenho, que o acabamento deve atingir.' },
        { id: 'passe', termo: 'Passe de desbaste', texto: 'Cada corte ao longo do eixo que remove uma camada de material.' },
        { id: 'profundidade', termo: 'Profundidade por passe', texto: 'A espessura da camada removida em cada passe. No primeiro bloco G71, o endereço U representa essa profundidade em raio, conforme revisão do PO.' },
        { id: 'sobremetal', termo: 'Sobremetal de acabamento', texto: 'A camada deixada de propósito sobre o perfil para ser removida no acabamento.' },
        { id: 'acabamento', termo: 'Acabamento', texto: 'O passe que segue o perfil final e remove o sobremetal.' },
        { id: 'aproximacao', termo: 'Ponto de aproximação', texto: 'A posição fora do material de onde a ferramenta parte e para onde retorna.' },
      ],
      nota: 'Revisão do PO: FANUC 0i-TD / ROMI G/GL/GLM, G71 em dois blocos; U do primeiro bloco em raio e U do segundo bloco em diâmetro; R de retorno transversal; P/Q delimitam o perfil; W é sobremetal em Z e F é avanço; G70 realiza o acabamento. A representação gráfica continua conceitual.',
      fontes: [
        { texto: 'Catálogo de referência anterior do Guia CNC (docs/interface-2.1/telas/guia-cnc-g76-novo.html): G71 "Desbaste longitudinal", Fanuc, torno, estado "vazio".', estado: 'localizada' },
        { texto: 'Manual de programação do controle (modelo e capítulo).', estado: 'pendente' },
      ],
    },

    trajetoria: {
      estado: 'rascunho',
      aviso: 'Animação conceitual: os passes, retornos e acabamento não representam a trajetória exata do FANUC 0i-TD. A confirmação técnica do PO não transforma esta simulação em percurso executável.',
    },

    sintaxe: {
      estado: 'aprovado-po',
      confirmar: [
        'Confirmado pelo PO: FANUC 0i-TD, ROMI G/GL/GLM e formato G71 de dois blocos.',
        'Confirmado pelo PO: U do primeiro bloco em raio; R como recuo transversal em X; P/Q delimitam o perfil.',
        'Confirmado pelo PO: U do segundo bloco em diâmetro; W é sobremetal em Z; F é avanço de corte.',
        'Sobremetal U do segundo bloco: positivo para externo e negativo para interno, conforme material fornecido.',
        'Ainda sem trecho do manual recuperado: restrições do perfil, regras adicionais de R/W e detalhes do G70.',
      ],
      blocos: ['G71 U.. R..', 'G71 P.. Q.. U.. W.. F..'],
      mapaConceitos: [
        { conceito: 'Profundidade por passe', endereco: 'U · 1º bloco · em raio' },
        { conceito: 'Recuo transversal X', endereco: 'R · 1º bloco' },
        { conceito: 'Início e fim do perfil', endereco: 'P / Q · 2º bloco' },
        { conceito: 'Sobremetal em X', endereco: 'U · 2º bloco · em diâmetro' },
        { conceito: 'Sobremetal em Z', endereco: 'W · 2º bloco' },
        { conceito: 'Avanço de corte', endereco: 'F · 2º bloco' },
      ],
      calculadora:
        'A calculadora Programação CNC do app gera um bloco de desbaste com valores fixos. Esses valores não foram revisados e não são referência para esta aula.',
    },

    exemplo: {
      estado: 'aprovado-po',
      etapas: [
        { titulo: 'Desenho e perfil P/Q', texto: 'Identifique o perfil final no desenho. Os endereços P e Q apontam, respectivamente, para os blocos de início e fim dessa descrição.' },
        { titulo: 'Primeiro bloco G71', texto: 'U define a profundidade de corte por passada em raio. R define o recuo transversal da ferramenta no retorno.' },
        { titulo: 'Segundo bloco G71', texto: 'P/Q identificam o perfil; U reserva sobremetal em X por diâmetro; W reserva sobremetal em Z; F define o avanço de corte.' },
        { titulo: 'Desbaste e acabamento', texto: 'O G71 realiza os passes de desbaste conforme o perfil programado. O acabamento com G70 é uma etapa posterior, cuja sintaxe específica deve ser consultada no Guia CNC e no manual.' },
        { titulo: 'Conferência antes da execução', texto: 'Confira perfil, aproximação, sinais, valores e limites no manual e simule. Esta aula não fornece programa completo nem coordenadas executáveis.' },
      ],
    },

    cuidados: {
      estado: 'rascunho',
      erros: [
        { titulo: 'Variante errada', texto: 'Formato e unidades dos parâmetros mudam entre controles e modelos. Use sempre o manual da sua máquina.' },
        { titulo: 'Perfil diferente do desenho', texto: 'Se o perfil programado não corresponder ao desenho, a peça sai errada, mesmo com o desbaste bem feito.' },
        { titulo: 'Sobremetal incompatível', texto: 'Sobremetal demais sobrecarrega o acabamento; de menos pode não limpar a superfície. Defina conforme a ferramenta e o procedimento da empresa.' },
        { titulo: 'Aproximação dentro do material', texto: 'A ferramenta deve partir de um ponto fora do bruto. Confira a posição antes de executar.' },
      ],
      alertas: [
        'Simule o programa antes de executar na máquina.',
        'Não copie valores de exemplos, calculadoras ou desta aula sem revisão técnica.',
        'Siga o procedimento de segurança da empresa e do fabricante da máquina.',
      ],
    },
  },
};
