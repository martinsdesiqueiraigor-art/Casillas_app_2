# Visual Approval Gate

Para mudanças visuais relevantes em missões futuras:

**IMPLEMENTAÇÃO → TESTES → RENDER REAL → CAPTURA → QA VISUAL → APROVAÇÃO PRODUCT OWNER → ESCALA**.

A prova visual principal é a tela real renderizada pelo código no SHA revisado. Imagem gerada por IA, mockup ou referência não substitui implementação, teste ou aprovação. Esta OPS apenas documenta o gate; não realiza redesign nem renderização de uma UI nova.

## Evidência por etapa

| Etapa | Evidência / condição |
| --- | --- |
| Implementação | Missão autorizada, paths e SHA; retrofit dos componentes e motores existentes |
| Testes | Checks proporcionais de comportamento/regressão; nos pilotos, resultados/unidades/arredondamento iguais aos motores |
| Render real | Executar a aplicação do SHA indicado; registrar navegador, ambiente, viewport e estado |
| Captura | Screenshots reais identificados por missão/SHA, largura/altura, estado e condições de rede; sem dados sensíveis |
| QA visual | Revisão read-only, cenários e findings consolidados via Coordenação; correções retornam pelo workflow |
| Aprovação Product Owner | Igor aprova explicitamente versão/evidências, escopo e eventuais ressalvas; silêncio ou QA favorável não é aprovação |
| Escala | Coordenação libera missão seguinte após gates/dependências; não autoriza deploy, merge ou release implicitamente |

## Capturas e inspeção

Capturas sugeridas em aproximadamente **360 px**, **390 px** e viewport amplo/tablet, anotando medidas reais. Cobrir estados inicial, preenchido, resultado e erro/offline quando aplicáveis; registrar cenários não aplicáveis e limitações. Captura desktop estreita não comprova teclado ou safe area de dispositivo físico quando esses comportamentos forem relevantes.

QA verifica:

- Safe area, teclado aberto/fechado e barra inferior sem encobrir campos, ações ou resultados.
- Overflow horizontal/vertical e sobreposição de cards, toast, menus, diagramas e navegação.
- Foco visível, ordem e restauração de foco, navegação por teclado e labels acessíveis.
- Legibilidade, contraste, zoom, textos longos, unidades/código e estados de feedback.
- Alvos de toque, espaçamento e comportamento responsivo conforme o [Design System](../DESIGN-SYSTEM-CONTRACT.md).
- Erro e offline com conteúdo/lease reais, sem criar autoridade comercial local nem expor informações sensíveis.

Pode apresentar **REFERÊNCIA vs IMPLEMENTAÇÃO REAL**, com rótulos explícitos e capturas separadas. Referência explica intenção; implementação real demonstra o resultado observado. Não rotular referência gerada como screenshot ou prova funcional.

## Aprovação e retorno

Registrar missão, SHA aprovado, referências das capturas, revisão QA, responsável/data, ressalvas e escopo aprovado no handoff. Pendência visual relevante impede escala até decisão do Product Owner. Se a implementação mudar após aprovação, avaliar o impacto e reapresentar evidência do trecho afetado antes de escalar.
Finding segue [revisor → Coordenação → missão corretiva → Codex](AGENT-TEAM-CONTRACT.md), com nova verificação no SHA corrigido. Aplicar [anti-retrabalho](README.md): reusar provas compatíveis, sem repetir fases fechadas por preferência não formalizada.
Gate visual complementa verificações funcionais, técnicas e de segurança e o Production Gate existente; não altera suas autoridades. F1/F2 e M1 devem ser aceitos antes da escala prevista no [plano mestre](../PLAN-MASTER-2.2.md).
