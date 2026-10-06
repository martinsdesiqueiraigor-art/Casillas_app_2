# Baseline 2.1 — leitura obrigatória para Codex/agentes

Versão estável: **Casillas 2.1.0**, tag **v2.1.0**, SHA **1b3082e7ca82bb669180402cf419a56e51af374a**.
Produção homologada na branch casillas-2.0. Desenvolvimento novo somente em casillas-2.2, cópia independente.
[Release congelada](RELEASE-2.1.0.md) é a referência atual; planos e auditorias anteriores são históricos.

## Arquitetura existente

Vanilla JS / ES Modules, HTML/CSS, carregador modular em js/app.js, DOM seguro e motores locais em js/calc.
Calculadoras, Home, Programação CNC, Guia CNC, Consultoria legada (consult) e Consultor Técnico (consultor-tecnico) já existem.
Supabase Auth e RPCs server-side são autoridade de identidade/comercial. O runtime oficial é js/supabase.bundle.js; não duplicar cliente/configuração.
IndexedDB v2 preserva config/historico/cache e acrescenta outbox.
Service Worker **casillas-v13**, 17 assets EV3 no precache; cache-first de assets e network-first de navegação.
Supabase possui **14 migrations canônicas**, incluindo lease EV2 e telemetria EV3 aplicada remotamente.

## Consultor e Guia implementados

Consultor local/determinístico, normalização, slots, FSM IDLE/FILLING_SLOTS/RESOLVING/PRESENTING/FEEDBACK e resolução no banco real.
interactionId permanece no slot filling. Código explícito: único resolve, múltiplos desambiguam, zero produz no_match.
Result Card usa Map interno; DOM apenas dispara ação. EVT.GUIDE_OPEN integra router e carregador.
GuiaManager valida canonical ID/alias/tab/accordion/defaultTarget antes da renderização segura.

Deep link existente: #/guia/fanuc_torno_g76?tab=referencia&acc=sintaxe.

| Alias | Ciclo homologado |
| --- | --- |
| fanuc-g76 | fanuc_torno_g76 |
| fanuc-g83 | fanuc_centro_de_usinagem_g83 |
| siemens-cycle97 | siemens_torno_cycle97 |
| siemens-cycle83 | siemens_centro_de_usinagem_cycle83 |

São exatamente quatro registros migrados estruturalmente, com paridade e deepFreeze.
Não houve revisão/correção técnica ou conteúdo inventado. Não criar ciclo ausente por inferência.

## Acesso, banco e operação

Lease offline de até sete dias, limitado também pelo término comercial quando aplicável; identidade, expiração,
logout/troca de usuário, clock rollback, guardAccess e lifecycle/revalidação já protegidos.
Rate limiting de ativação server-side: quota por conta/produto compartilhada entre rotas, de cinco admissões em cinco minutos e vinte em 24 horas;
recusas estruturadas e tentativas concorrentes cobertas. Preservar o contrato nas migrations e testes.

RLS/grants mínimos protegem as tabelas. Telemetria chat_interactions/guide_feedback é separada de access_events.
Sem pergunta bruta; FK composta protege ownership, UNIQUE limita feedback efetivo.
Outbox captura ownerUserId na criação, mantém eventos de A durante login B, sincroniza interação antes de feedback e prova equivalência em retry.

CI já existe: npm ci, gate focalizado EV3, baseline, sintaxe, pgTAP e Production Gate.
Deploy Pages é manual por static.yml: SHA exato, approval_record, smoke_record, CI reutilizada, build oficial,
revalidação após aprovação humana do environment github-pages e deploy do mesmo artefato.
PWA instalada/offline real foram homologados; isso não transforma cache em autoridade comercial.

## Não tratar como greenfield

É proibido recriar como infraestrutura nova:
eventBus, router, supabaseClient, syncQueue, outbox, ConsultorAgent, FSM, slotExtractor, resolver,
Result Card, GuiaManager, renderer, deep links, telemetria, RLS, CI e Production Gate.
Evoluir por retrofit os componentes existentes, preservando contratos e testes.
Consulte [Transição 2.2](HANDOFF-2.1-TO-2.2.md) antes de qualquer alteração.
