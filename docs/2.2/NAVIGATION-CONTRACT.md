# Contrato de navegação 2.2

Status: destinos futuros, exceto os links do Guia já existentes. [Escopo](README.md).

## Estado real

`js/core/router.js` codifica/analisa somente `#/guia/<cycleId>?tab=...&acc=...`. `wireGuideRouter` usa `EVT.GUIDE_OPEN` e `GuiaManager.resolveTarget`.
`js/app.js` conecta hashchange do Guia ao `loadModule`; os demais módulos usam menu/callback e o evento DOM `casillas:navigate-module` com `{key}`. Esse listener hoje exclui `home`.
Não descrever esse router como um router geral pronto. Sua extensão e a cooperação com boot/carregador devem ocorrer em missão futura, preservando acesso antes e depois do import dinâmico.

## Shell pretendido

Ordem: **Início → Calculadoras → Guia CNC → Biblioteca**. Enquanto a Biblioteca não atender ao gate de conteúdo, exibir somente os três destinos úteis. Programação CNC fica acessível em Calculadoras e em ações contextuais do Guia/Consultor; não cria aba principal.
Consultor Técnico é ação de destaque no shell e na Home, com label acessível **Consultor Técnico — Consulta inteligente offline**; não é quinta aba. `consult` continua Consultoria legada, distinta de `consultor-tecnico`.
Biblioteca só ativa após conteúdo V1 útil, fontes/revisões/direitos registrados, relações válidas e navegação/offline verificados. Acesso direto antes disso informa indisponibilidade e oferece destino útil; não mostra catálogo vazio como lançamento. [Gate](LIBRARY-CONTRACT.md).

## Destinos estáveis

| Destino | Forma futura | Chave existente / condição |
| --- | --- | --- |
| Início | `#/` | `home` |
| Índice de calculadoras | `#/calc` | Agrupa módulos existentes; índice ainda futuro |
| Calculadora | `#/calc/<calculatorId>` | `trig`, `coni`, `poly`, `furos`, `rosca`, `tol`, `potencia`, `chaveta`, `conicpad` |
| Programação CNC | `#/calc/prog` | `prog`; seleção futura de ciclo apenas por ID validado |
| Guia | `#/guia` e `#/guia/<cycleId>?tab=<tabId>&acc=<accordionId>` | `guia`; detalhe já implementado |
| Biblioteca | `#/biblioteca` e `#/biblioteca/<documentId>` | Módulo futuro, condicionado ao gate |
| Consultor | `#/consultor` | `consultor-tecnico` |
| Consulta específica no Consultor | `#/consultor/<operationId>` | Vocabulário futuro explicitamente cadastrado; nunca consulta bruta na URL |

No detalhe de Programação poderá existir `?cycle=<cycleId>&variant=<variantId>` somente após homologar aplicação/variante. `variant` é omitido quando não existe variante real. `operationId` não é texto livre nem nome de função arbitrária.
IDs são estáveis e codificados; a tabela associa rotas às chaves atuais sem renomear módulos. Prefill e resultados não entram na URL. Não prometer que estas rotas já funcionam na 2.1.

## Compatibilidade e falhas

Preservar exatamente `#/guia/fanuc_torno_g76?tab=referencia&acc=sintaxe`, canonical IDs, aliases e defaults. Aliases `fanuc-g76`, `fanuc-g83`, `siemens-cycle97`, `siemens-cycle83` continuam resolvidos pelo GuiaManager, sem banco de aliases duplicado.
Target válido mantém aba/acordeão. Target inválido segue o comportamento seguro existente: listagem do Guia e aviso; não abrir automaticamente outro ciclo. Não reinterpretar link antigo como variante específica. Parâmetros novos opcionais exigem validação; parâmetros não reconhecidos não viram DOM, comandos ou permissões.

Carregamento por URL, recarga, mudança de hash, voltar/avançar e ação no próprio destino devem convergir ao mesmo carregador. Usuário sem acesso continua no fluxo existente de Auth/validação; após validação preservar intenção válida sem contornar lease ou guardAccess. Não persistir resultado/prefill técnico como concessão de acesso.
Voltar usa histórico do navegador; retorno explícito ao Guia usa Target validado. Restaurar foco em heading/ação relevante sem reabrir teclado indevidamente. Nenhum redirecionamento externo arbitrário por `returnUrl`.

Aceite futuro: links antigos e aliases, hash malformado, ID/aba/acordeão inexistente, destino indisponível, entrada offline com lease válido/expirado, login/troca de usuário e navegação repetida. Usar testes EV3 existentes e adicionar cobertura de extensões na missão que as implementar.
