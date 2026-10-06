# Casillas 2.2 — contratos de retrofit

Missão **CAS22-F0-01-R1**, executor **CODEX LOCAL**, destino **CAS22-COORD**, 2026-10-06.
Esta entrega fecha a definição documental F0; não implementa interfaces, dados ou comportamento 2.2.
As decisões explícitas da missão estão registradas como direção aprovada; os detalhes aqui definidos são contratos para as próximas missões, sujeitos aos gates de cada fase.

## Referências e precedência

- Produção congelada: v2.1.0, `1b3082e7ca82bb669180402cf419a56e51af374a`.
- Base inspecionada: `04fac8a4582b713e888a7d146ab755f55c53414e`, branch `casillas-2.2`, pasta `C:\Projetos\Casillas_2.2_DEV`.
- Origin: `https://github.com/martinsdesiqueiraigor-art/Casillas_app_2.git`.
- [Baseline](../BASELINE-2.1.md), [release](../RELEASE-2.1.0.md) e [transição](../HANDOFF-2.1-TO-2.2.md) definem o estado herdado. Documentos históricos não redefinem a release.

## Contratos

| Documento | Responsabilidade |
| --- | --- |
| [Design System](DESIGN-SYSTEM-CONTRACT.md) | Tokens, componentes e critérios dos pilotos |
| [Navegação](NAVIGATION-CONTRACT.md) | Shell, destinos e compatibilidade de links |
| [Integração](DOMAIN-INTEGRATION-CONTRACT.md) | Ações entre domínios e payloads mínimos |
| [Conteúdo CNC](CNC-CONTENT-CONTRACT.md) | Identidade canônica, aplicação e variantes |
| [Fonte e revisão](SOURCE-REVISION-CONTRACT.md) | Proveniência, revisão e direitos |
| [Biblioteca](LIBRARY-CONTRACT.md) | Autoridade documental e disponibilidade |
| [Plano mestre](PLAN-MASTER-2.2.md) | Fases, marcos e aceite |
| [Handoff](HANDOFF-CAS22-F0-01-R1.md) | Evidências, limites e entrega à Coordenação |

## Estado real inspecionado

| Infraestrutura existente | Evidência local | Reutilização |
| --- | --- | --- |
| Vanilla JS / ES Modules e carregamento dinâmico | `js/app.js`, `MODULE_LOADERS`, `loadModule` | Evoluir o mesmo carregador e preservar `guardAccess` |
| Eventos e deep links | `js/core/eventBus.js`, `js/core/router.js` | `EVT.GUIDE_OPEN` e `Target` existentes; extensão futura, sem infraestrutura paralela |
| Guia canônico | `js/modules/guia/bancoCiclosCNC.js`, `types.d.ts`, `adapter.js`, `GuiaManager.js`, `renderers/blocks.js` | Quatro registros congelados; adapter preserva lista/filtros/cópia |
| Consulta local | `js/modules/consultor/ConsultorAgent.js`, `slotExtractor.js`, `resolver.js`, `resultCard.js`, `index.js` | FSM, slots, Map de targets, feedback e encaminhamento ao Guia |
| Programação CNC | `js/modules/prog.js`, `js/calc/gcode.js` | UI e funções puras próprias, ainda sem consumo do banco do Guia |
| Calculadoras e apresentação | `js/calc/*`, `js/modules/trig.js`, `js/modules/tol.js` | Motores preservados; SVG de Trigonometria recebe resultado do motor |
| Tokens e componentes | `css/variables.css`, `components.css`, `layout.css`, `modules.css`, `js/utils.js` | Paleta já coincide com direção 2.2; classes e toast reutilizáveis |
| Navegação por módulo | `js/menu.js`, `js/app.js`, `casillas:navigate-module` | Menu lateral e bridge existentes; rotas gerais ainda não implementadas |
| Persistência, sync e acesso | `js/db.js`, `js/core/outboxStore.js`, `syncQueue.js`, `supabaseClient.js`, `js/auth.js`, `js/trial.js` | Preservar conforme baseline; sem nova autoridade local |

A inspeção é estática. Evidências de homologação 2.1 são herdadas da release, não novas execuções desta missão.
Não foi feita auditoria matemática ou técnica dos exemplos CNC.

## Limites comuns

Somente arquivos Markdown novos em `docs/2.2/`. Nenhuma alteração de HTML, CSS, JS, dados, testes, workflows, manifest, Service Worker ou Supabase.
Sem LLM, dependências novas, framework, rewrite, deploy, PR ou merge. Um commit documental e push somente para `origin/casillas-2.2`, autorizados pela missão.

Auth, licença, entitlement, rate limiting, lease offline limitado e derivado do servidor, RLS, ownership da outbox, telemetria e Production Gate continuam vigentes.
Nenhuma ação, rota, badge, cache ou documento concede acesso comercial. Não usar fingerprint, aparelhos, relógio ou armazenamento local como autoridade.

G71/G70/G75 já aparecem no gerador legado. Sua existência não os inclui no núcleo canônico EV3: preservar e registrar, sem ampliar, corrigir ou certificar. [Tratamento](CNC-CONTENT-CONTRACT.md).
