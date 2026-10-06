# Governança operacional Casillas 2.2

Missão **CAS22-OPS-01-R1**, origem e handoff **CAS22-COORD**, executor **CODEX LOCAL**, 2026-10-06.
Base: `b3c80007ca82533cfc2cd350911ced05316e9451`, pasta `C:\Projetos\Casillas_2.2_DEV`, branch `casillas-2.2`, origin `https://github.com/martinsdesiqueiraigor-art/Casillas_app_2.git`.
Este pacote formaliza operação e gates; não altera comportamento nem autoriza as fases futuras.

## Documentos

| Documento | Uso |
| --- | --- |
| [Contrato da equipe](AGENT-TEAM-CONTRACT.md) | Papéis, escritor único, claims e findings |
| [Workflow](WORKFLOW-2.2.md) | Missões, estados, dependências, evidências e handoff |
| [Política de plugins](PLUGIN-POLICY.md) | Seleção por necessidade e limites de autoridade |
| [Decision Register](DECISION-REGISTER.md) | Decisões vigentes e etapas fechadas |
| [Visual Approval Gate](VISUAL-APPROVAL-GATE.md) | Render real, QA e aprovação do Product Owner |

## Leitura mínima antes de agir

1. [AGENTS.md](../../../AGENTS.md).
2. [Baseline 2.1](../../BASELINE-2.1.md), [release congelada](../../RELEASE-2.1.0.md) e [transição](../../HANDOFF-2.1-TO-2.2.md).
3. [Contratos 2.2](../README.md) e contratos pertinentes ao escopo.
4. Este README operacional.
5. [Decision Register](DECISION-REGISTER.md).
6. Fase atual abaixo e dependências no [plano mestre](../PLAN-MASTER-2.2.md).
7. Histórico Git, missões/handoffs e evidências homologadas: verificar se a missão já foi executada.

## Política anti-retrabalho

Antes de auditoria, implementação ou correção, conferir baseline, contratos 2.2, Decision Register, fase atual, commits e evidências homologadas. Reusar evidência válida para o mesmo escopo, revisão e ambiente, indicando origem e limites; não declarar evidência herdada como teste recém-executado.
Reabrir etapa fechada apenas por evidência contraditória, regressão real, mudança de requisito, nova dependência ou falha observável. Registrar gatilho, evidência e impacto; a Coordenação encaminha missão delimitada, preservando o fechamento anterior como histórico.

Não repetir sem evidência nova: auditoria arquitetural homologada, testes físicos encerrados, EV2 fechada, EV3 fechada, F0 e decisões de stack, offline, FSM e banco canônico CNC. Consultar a [release](../../RELEASE-2.1.0.md) e o [handoff F0](../HANDOFF-CAS22-F0-01-R1.md) antes de propor nova verificação dessas frentes.

## Estado das fases nesta missão

| Fase | Estado | Condição para avançar |
| --- | --- | --- |
| Casillas 2.1 release | FECHADA | Reabertura somente pela política anti-retrabalho |
| F0 contratos | CONCLUÍDA | Commit `b3c80007ca82533cfc2cd350911ced05316e9451` |
| F1 Design System + Shell | PRÓXIMA | Missão explícita da Coordenação após M0 |
| F2 pilotos | AGUARDANDO F1 | Aceite dos pilotos fecha M1 |
| F3 Guia + Consultor | AGUARDANDO M1 | Preservar EV3 e contratos técnicos |
| F4 Biblioteca | AGUARDANDO M2 | Coleção útil, fontes, direitos e gate de ativação |
| F5 escala | AGUARDANDO | Dependências do plano mestre e aprovação visual |
| F6 integração/release | AGUARDANDO | M4; Production Gate e autorização para SHA exato |

Estados de fase não substituem os estados contratuais de missão do [workflow](WORKFLOW-2.2.md). M1 inclui F1/F2; M2 fecha Guia/Consultor. OPS concluída significa pronto para receber missão F1, sem início funcional implícito.

## Limites desta entrega

Somente os seis documentos de `docs/2.2/operations/` e apontamento curto opcional em AGENTS.md. Zero arquivos funcionais: não alterar HTML, CSS/JS, calculadoras, dados CNC, manifest, Service Worker, Supabase, migrations, tests ou workflows.
Não criar Agent Bus, daemon, watcher, scheduler, heartbeat, fila própria, framework ou infraestrutura de agentes. Sem redesign, alteração comercial/CNC, PR, merge, release, deploy ou escrita Supabase.
Um commit documental autorizado: `docs: definir governança multiagente do Casillas 2.2`; push somente para `origin/casillas-2.2`.
Validar status/diff, `git diff --check`, allowlist documental, ausência de segredos e links Markdown locais. Não repetir testes funcionais ou físicos encerrados nesta missão documental.
