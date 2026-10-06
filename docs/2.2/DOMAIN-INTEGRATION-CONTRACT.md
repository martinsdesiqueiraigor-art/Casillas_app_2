# Contrato de integração entre domínios

Status: ações conceituais F0, sem novos eventos em runtime nesta missão. [Navegação](NAVIGATION-CONTRACT.md).

## Autoridade e infraestrutura

| Domínio | Autoridade |
| --- | --- |
| Guia CNC | Conhecimento técnico canônico dos ciclos |
| Programação CNC | Aplicação de ciclos/templates homologados |
| Calculadoras | Execução dos cálculos nos motores atuais |
| Biblioteca | Catálogo documental e proveniência |
| Consultor | Descoberta e encaminhamento local/determinístico |

Reutilizar `eventBus`, `router`, `loadModule` e bridge existente. `OPEN_GUIDE` é nome conceitual para **`EVT.GUIDE_OPEN` (`casillas:guide-open`)**, não um segundo evento.
Hoje EventBus e Target são tipados para Guia; as novas ações exigirão extensão discriminada de tipos, listeners e validação no mesmo mecanismo, mantendo o payload antigo. Não emitir payload genérico novo ao listener GUIDE_OPEN. O evento DOM `casillas:navigate-module` continua bridge para chaves conhecidas até retrofit explícito.

## Payload mínimo

| Ação conceitual | Obrigatório | Opcional permitido | Responsável pela validação |
| --- | --- | --- | --- |
| OPEN_GUIDE | `cycleId` | `tabId`, `accordionId` | GuiaManager existente |
| OPEN_CALCULATOR | `calculatorId` | `prefill` | Registro de módulos e contrato de entrada do motor |
| OPEN_LIBRARY_ITEM | `documentId` | Nenhum na V1 | Catálogo da Biblioteca e disponibilidade |
| OPEN_CNC_PROGRAMMING | `cycleId` | `variantId`, `prefill` | GuiaManager + aplicação/template homologado |
| OPEN_CONSULTOR | Nenhum | `operationId` | Vocabulário local de operações aprovado |

Uma ação transporta IDs e contexto estritamente necessário, nunca banco completo, manual, HTML, código executável, credencial, estado de licença, pergunta bruta ou histórico do Consultor. `operationId` é enum/ID de domínio cadastrado, não UUID de telemetria.
Abrir Programação sem ciclo é navegação simples para `#/calc/prog`, mantendo o módulo legado; não fabricar cycleId para cobrir templates existentes.

`prefill` é objeto de chaves permitidas pelo destino, até 12 entradas, com `{value: number, unit: string}` para grandezas. Números devem ser finitos e unidades do vocabulário do destino. Campos categóricos, se necessários, exigem enum no contrato específico futuro; não aceitar strings livres por conveniência.
O destino valida limites, sinal, obrigatoriedade e conversão de unidade pelo caminho existente. Rejeitar campo/unidade desconhecido e explicar; não aplicar parcialmente silenciosamente nem usar `value || default` para apagar zero válido. Não sobrescrever formulário editado sem decisão do usuário. Prefill não dispara geração/cálculo automaticamente nem afirma validade operacional.
Ao transferir valor calculado, enviar valor numérico do motor, nunca parsear texto arredondado da tela. Diagrama recebe o mesmo resultado; não recalcula.

## Fluxos e recusas

Fluxo futuro: Roscas → resultado do motor → OPEN_CNC_PROGRAMMING com `fanuc_torno_g76` e prefill compatível → template homologado → OPEN_GUIDE com o mesmo cycleId → fonte/revisão. A relação não está implementada hoje e a coincidência de código G76 não comprova compatibilidade do template legado.

Consultor → slots → resolver → ciclo real → ResultCard → OPEN_GUIDE existente. Futuramente outras ações aparecem somente quando uma relação registrada aponta a calculadora, aplicação ou documento disponível. Mostrar slots reconhecidos e motivo baseado nos filtros realmente usados, por exemplo controlador/máquina/operação; preservar a regra atual de código único na base. Sem percentual de confiança ou afirmação de exclusividade universal.
Ambiguidade pede contexto; ausência retorna no_match; nunca inventar ciclo/variante/documento. Preservar FSM IDLE/FILLING_SLOTS/RESOLVING/PRESENTING/FEEDBACK, interactionId durante complementação, feedback e consulta offline.

ResultCard mantém targets validados no Map interno; o DOM apenas fornece resultId/ação. Extensão deve preservar rejeição de IDs desconhecidos e limpeza do Map, sem converter data attributes em autoridade de destino.
Destino inválido/indisponível retorna estado explicativo e ação segura; aplicação inexistente oferece Guia quando o ciclo existe. Erro de armazenamento/sync não apaga resultado local. GuardAccess aplica-se a toda navegação e renderização.

Telemetria/outbox existentes preservam ownership e ordenação interação→feedback, sem pergunta bruta. Novos domínios não cabem automaticamente no schema EV3 de quatro slots/cycleId; mudanças em telemetria/RLS só em missão explícita. Estas ações não definem novas RPCs ou tabelas.
