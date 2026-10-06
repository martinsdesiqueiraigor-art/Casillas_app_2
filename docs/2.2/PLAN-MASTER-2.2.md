# Plano mestre Casillas 2.2

Missão CAS22-F0-01-R1. Plano documental de retrofit; nenhuma fase de implementação é autorizada por este arquivo. [Baseline e contratos](README.md).

## Marcos aprovados pela missão

| Marco | Resultado esperado | Evidência de aceite nas próximas missões |
| --- | --- | --- |
| M0 | Contratos fechados | Pacote F0 coerente, inspeção real, validação documental e handoff |
| M1 | Design System + Shell + pilotos aprovados | F1/F2 com revisão visual/funcional, resultados iguais aos motores |
| M2 | Guia/Consultor aprovados | F3 preserva EV3, links, FSM, feedback, offline e rastreabilidade |
| M3 | Biblioteca e navegação final aprovadas | Coleção V1 útil, direitos/revisões, relações e gate da aba |
| M4 | Demais módulos migrados | Retrofit progressivo sem mudança técnica/comercial implícita |
| M5 | Candidato 2.2 pronto para Production Gate | SHA candidato, validação integrada e registros exigidos pelo gate existente |

M0 documental concluído não é aprovação visual de M1 nem autorização de produção. Os critérios da missão encerram a definição F0; a Coordenação recebe o pacote para conduzir os próximos gates.

## Fases e dependências

| Fase | Escopo futuro | Dependência / limite |
| --- | --- | --- |
| F0 — referência + contratos | Inspeção 2.1, contratos e plano | Somente documentação nesta missão |
| F1 — Design System + Shell | Tokens/componentes existentes, shell e extensão do router/carregador | Missão explícita após M0; Biblioteca ainda oculta sem gate |
| F2 — pilotos Trigonometria + Tolerâncias ISO | Separar apresentação do motor e validar diagramas/estados | F1; fechar M1 antes de escalar |
| F3 — Guia CNC + Consultor | Retrofit de Guia/FSM/ResultCard, fontes e ações reais | M1; nenhum ciclo/variante novo sem missão técnica EV3 |
| F4 — Biblioteca Técnica V1 | Coleção documentada, descoberta, offline seletivo e navegação final | M2; fontes/direitos/utilidade aceitos para M3 |
| F5 — escala das calculadoras | Demais apresentações e Programação CNC progressivamente | M1 e contratos; completar M3 antes de fechar M4 |
| F6 — integração + QA + release | Validação integrada, candidato, Production Gate existente | M4; publicação exige nova autorização para SHA exato |

Programação CNC em F5 deve preservar funções atuais; consumir identidade canônica somente para aplicações tecnicamente homologadas. Rastrear templates legados G71/G70/G75 como lacuna de cobertura do Guia. Missão EV3 pode validar novos ciclos em frente própria, mas este plano não adiciona conteúdo nem presume prioridade técnica.

## Critérios transversais

- Comparar resultados dos motores, unidades e arredondamento antes/depois; diagramas apenas consomem resultados. Divergência matemática vira registro e missão própria.
- Reusar EventBus/router, GuiaManager/adapter/renderers, FSM/slots/resolver/ResultCard, syncQueue/outbox/IndexedDB e supabaseClient. Sem framework, LLM ou infraestrutura paralela.
- Preservar deep links e aliases, menu/loader e Consultoria legada até retrofit explícito; rotas novas são extensão coordenada.
- Validar toque, teclado, foco, telas estreitas, safe area, zoom, redução de movimento, erros e offline nos pilotos.
- Manter Auth/licença, rate limiting, lease derivado de servidor, RLS e ownership/ordenação de telemetria. Nenhuma alteração comercial nesta linha por autorização implícita.
- Não disponibilizar Biblioteca vazia, variante fictícia ou template sem validação. Fonte não concede direito de reprodução.
- Executar checks pertinentes das missões futuras sem remover testes para passar; distinguir evidência herdada, análise estática e execução real.

## Riscos conhecidos e tratamento

Router hoje limitado ao Guia: F1 deve estender parse/encode/boot/hashchange e manter guardAccess, em vez de criar router novo.
Programação não está ligada ao banco canônico: validar mapeamento de templates/unidades/contexto antes de integrar. Nenhuma equivalência técnica presumida.
Tipos/validator do banco são restritos: expansão demanda revisão coordenada, sem simplesmente inserir registro não suportado.
Fonte/variante não constam dos ciclos atuais: metadados opcionais, ausência explícita e revisão técnica específica; sem preenchimento inventado.
CSS possui controles menores que o alvo futuro: tratar nos pilotos, sem alegar conformidade atual. Pendência visual P2 do menu herdada permanece até missão de UI.
Biblioteca aumenta peso/direitos de assets: catálogo útil e orçamento offline seletivo antes de ativação.

## Operação e parada

Cada missão futura informa branch/pasta, base SHA, arquivos autorizados, evidências e critérios de aceite. Commit/push exigem autorização compatível; deploy/Supabase write/migration/alteração comercial exigem missão explícita própria.
Parar se aparecer mudança fora do escopo, risco à release/legado, proteção enfraquecida, segredo, dependência injustificada ou divergência arquitetural relevante. Preservar estado local; sem reset/clean para descartar trabalho.
M5 significa pronto para avaliação, não publicado. CI e Production Gate existentes continuam a governar produção; rollback segue contrato da release congelada, nunca downgrade remoto automático.
