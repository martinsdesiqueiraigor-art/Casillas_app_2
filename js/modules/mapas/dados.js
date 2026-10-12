/**
 * Casillas Mapas — Conjunto de dados: "Do Desenho à Peça"
 *
 * Este arquivo contém SOMENTE conteúdo. Nenhuma lógica de apresentação.
 * Para criar outro mapa, copie este arquivo, altere o conteúdo e passe
 * o novo objeto para criarMapa().
 *
 * CONTEÚDO DEMONSTRATIVO — PENDENTE DE REVISÃO TÉCNICA.
 * Baseado no infográfico de referência "Do Desenho à Peça".
 * Foram omitidos de propósito: parâmetros de corte, valores de offset,
 * comandos CNC e procedimentos específicos de software ou máquina.
 *
 * Campos de cada etapa:
 *   id        (obrigatório) identificador único, sem espaços
 *   numero    (obrigatório) número exibido
 *   titulo    (obrigatório)
 *   icone     (obrigatório) nome de um ícone do registro em mapa.js
 *   cor       (obrigatório) cor de identificação da etapa (hex)
 *   resumo    (obrigatório) uma ou duas frases
 *   selo      (opcional)    { texto, tipo: "critico" | "atencao" }
 *   detalhes  (opcional)    lista de parágrafos curtos
 *   checklist (opcional)    lista de itens (texto)
 *   dica      (opcional)    texto curto
 *   alerta    (opcional)    texto curto
 */

export const mapaDoDesenhoAPeca = {
  id: "desenho-peca",
  titulo: "Do Desenho à Peça",
  subtitulo: "Fluxo técnico de fabricação",
  fluxoResumo: ["Planejamento", "Programação", "Simulação", "Produção"],
  fluxoResultado: "Peça pronta",
  aviso: "Conteúdo demonstrativo — pendente de revisão técnica.",
  avisoChecklist:
    "Checklist didático. Marcar os itens não representa aprovação ou validação de processo.",
  rodape:
    "A sequência é uma representação didática de um fluxo de fabricação e não substitui os procedimentos específicos da empresa, da máquina ou do cliente.",

  etapas: [
    {
      id: "engenharia",
      numero: 1,
      titulo: "Engenharia",
      icone: "desenho",
      cor: "#58a6ff",
      resumo: "Reunir e conferir a documentação técnica da peça antes de qualquer decisão de fabricação.",
      detalhes: [
        "O desenho 2D costuma trazer cotas, tolerâncias, acabamentos e notas. O modelo 3D é usado como base geométrica para a programação.",
        "Verifique se a revisão dos documentos é a mesma e se não há informações em conflito entre eles."
      ],
      checklist: [
        "Desenho 2D disponível (PDF/DWG)",
        "Modelo 3D disponível (STEP, Parasolid, SAT)",
        "Especificação técnica recebida",
        "Revisão do desenho identificada"
      ],
      dica: "Confira se o desenho 2D e o modelo 3D batem antes de começar."
    },
    {
      id: "planejamento",
      numero: 2,
      titulo: "Planejamento",
      icone: "prancheta",
      cor: "#3fb950",
      resumo: "Definir como a peça será feita: sequência de operações, fixação, referência e ferramentas.",
      detalhes: [
        "A folha de processo (roteiro) organiza as operações e serve de referência para quem programa e para quem opera.",
        "Os parâmetros de corte dependem de material, ferramenta, máquina e fixação. Consulte o fabricante da ferramenta e o procedimento da empresa."
      ],
      checklist: [
        "Folha de processo (roteiro) elaborada",
        "Ponto zero da peça definido",
        "Lista de ferramentas preparada",
        "Parâmetros de corte definidos com fonte confiável"
      ],
      dica: "Planeje antes de programar."
    },
    {
      id: "programacao",
      numero: 3,
      titulo: "Programação",
      icone: "programacao",
      cor: "#f0883e",
      resumo: "Transformar o planejamento em percurso de ferramenta no CAM, seguindo a ordem definida.",
      selo: { texto: "Ordem importa", tipo: "atencao" },
      detalhes: [
        "No CAM, o modelo é importado, o bruto é definido e as geometrias a usinar são reconhecidas.",
        "As operações são criadas na sequência do roteiro, normalmente do desbaste ao acabamento. O fluxo exato depende do software e da peça."
      ],
      checklist: [
        "Modelo importado e orientado",
        "Bruto (stock) definido",
        "Geometrias a usinar reconhecidas",
        "Operações criadas na ordem do roteiro"
      ],
      dica: "Siga a ordem das operações definida no planejamento."
    },
    {
      id: "simulacao",
      numero: 4,
      titulo: "Simulação",
      icone: "simulacao",
      cor: "#bc8cff",
      resumo: "Simular o programa, procurar colisões e só então gerar e revisar o código NC.",
      selo: { texto: "Crítico", tipo: "critico" },
      detalhes: [
        "A simulação mostra o percurso da ferramenta sobre o bruto e ajuda a encontrar colisões, sobras de material e movimentos inesperados.",
        "Depois de gerado, o código NC deve ser revisado: cabeçalho, ferramentas chamadas e coerência com a folha de processo."
      ],
      checklist: [
        "Programa simulado",
        "Colisões verificadas",
        "Código NC gerado",
        "Cabeçalho e ferramentas revisados"
      ],
      dica: "Nunca pule a simulação.",
      alerta: "A simulação só é tão fiel quanto os dados cadastrados de máquina, ferramentas, fixação e bruto. Divergências podem não aparecer na tela."
    },
    {
      id: "setup-producao",
      numero: 5,
      titulo: "Setup e Produção",
      icone: "maquina",
      cor: "#39c5cf",
      resumo: "Preparar a máquina com as informações do programa e acompanhar o início da produção.",
      detalhes: [
        "O operador precisa receber a lista de ferramentas, a forma de fixação e a referência de zero usadas na programação.",
        "A primeira peça é o momento de confirmar se o que foi planejado e simulado corresponde à realidade da máquina."
      ],
      checklist: [
        "Lista de ferramentas entregue ao operador",
        "Fixação da peça conferida",
        "Corretores de ferramenta conferidos",
        "Primeira peça acompanhada"
      ],
      dica: "Acompanhe a primeira peça.",
      alerta: "Siga sempre o procedimento de setup e as regras de segurança da empresa e do fabricante da máquina."
    },
    {
      id: "inspecao",
      numero: 6,
      titulo: "Inspeção",
      icone: "paquimetro",
      cor: "#e3b341",
      resumo: "Medir as características importantes e decidir se a peça segue ou se o processo para.",
      detalhes: [
        "Cotas críticas podem ser medidas com paquímetro ou micrômetro, conforme a tolerância. O acabamento pode ser verificado com rugosímetro.",
        "O instrumento e o método de medição devem ser adequados à tolerância exigida no desenho."
      ],
      checklist: [
        "Cotas críticas medidas",
        "Acabamento verificado",
        "Peça dentro do especificado → liberar",
        "Peça fora do especificado → parar e corrigir"
      ],
      dica: "Repita a medição quando a leitura estiver perto do limite da tolerância.",
      alerta: "A liberação da peça segue o plano de inspeção e os critérios da empresa ou do cliente."
    },
    {
      id: "registro",
      numero: 7,
      titulo: "Registro e Rastreabilidade",
      icone: "pasta",
      cor: "#ff7b72",
      resumo: "Guardar o que foi usado e o que foi medido, para refazer a peça ou investigar um problema.",
      detalhes: [
        "Programa final, folha de processo e resultados de medição formam o histórico da peça.",
        "Não conformidades registradas ajudam a corrigir a causa e a não repetir o erro. O prazo de guarda segue a política da empresa."
      ],
      checklist: [
        "Programa NC final arquivado",
        "Folha de processo arquivada",
        "Resultados de medição registrados",
        "Não conformidades registradas (RNC)"
      ],
      dica: "Arquivar tudo permite refazer a peça sem começar do zero."
    }
  ]
};
