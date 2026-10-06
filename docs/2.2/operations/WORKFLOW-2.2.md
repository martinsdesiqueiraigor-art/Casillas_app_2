# Workflow operacional 2.2

**DECISÃO → MISSÃO → EXECUÇÃO → VERIFICAÇÃO → REVISÃO → APROVAÇÃO → PRÓXIMA FASE**.
Este contrato admite o [Supervisor V1](MISSION-SUPERVISOR-V1.md) externo, autorizado por OPS-03: scan manual Once/Watch de missões reversíveis aprovadas. Não criar Agent Bus, daemon, serviço, scheduler, heartbeat ou autostart. Registro manual mantém seu fluxo sem polling.

## Entrada e execução

1. Consultar a [leitura mínima](README.md), [decisões](DECISION-REGISTER.md), fase, commits e evidências. Verificar execução prévia e reusar provas válidas.
2. A Coordenação emite missão com ID/origem/executor/handoff, objetivo, pasta/branch/origin/base SHA e estado esperado, paths autorizados/proibidos, dependências, critérios de aceite, gates e permissões Git/remotas explícitas.
3. Confirmar identidade e estado antes de editar e antes de operações Git importantes: `git remote -v`, `git branch --show-current`, `git rev-parse HEAD`, `git status --short`. Divergência da base contratada exige parada e decisão humana, sem corrigir automaticamente.
4. Registrar claim/path ownership, conferir colisões e assumir escritor único. Executar a menor mudança autorizada, preservando arquitetura, encoding, line endings e estado alheio.
5. Verificar diff e escopo, `git diff --check`, testes/checks proporcionais e segurança quando pertinente. Identificar resultados, ambiente, SHA e limitações; evidência herdada fica explicitamente atribuída.
6. Revisores read-only avaliam o SHA/evidências. Findings seguem [revisor → Coordenação → missão corretiva → Codex](AGENT-TEAM-CONTRACT.md).
7. Consolidar aceite e aprovações aplicáveis. Mudança visual relevante segue o [Visual Approval Gate](VISUAL-APPROVAL-GATE.md). Commit/push apenas quando autorizados; PR/merge/release/deploy e Supabase write não são efeitos automáticos do workflow.
8. Entregar handoff, encerrar claims e registrar estado. A próxima fase exige missão própria e dependências satisfeitas.

## Estados contratuais de missão

| Estado | Significado / saída |
| --- | --- |
| QUEUED | Missão registrada para priorização; sem execução. Vai a READY quando completa e liberada pela Coordenação |
| READY | Escopo, base, dependências e ownership resolvidos. Vai a RUNNING ao assumir execução |
| RUNNING | Escritor executa escopo autorizado. Vai a REVIEW com verificações/evidências; WAITING ou BLOCKED se não pode prosseguir |
| WAITING | Aguarda dependência, resposta ou aprovação identificada; registra responsável e condição de retomada, sem polling. Retorna ao ponto pendente quando resolvido |
| REVIEW | Evidências e SHA submetidos à revisão/gates. Vai a CHANGES_REQUESTED, WAITING por aprovação, BLOCKED ou DONE após aceite |
| CHANGES_REQUESTED | Findings consolidados pela Coordenação exigem missão corretiva. Retorna a READY/RUNNING somente com escopo e escritor definidos, depois a REVIEW |
| BLOCKED | Impedimento de escopo, identidade, segurança, colisão ou decisão não prevista; preservar estado. Coordenação resolve condição e recoloca em READY ou no gate pendente |
| DONE | Aceite, aprovações aplicáveis e handoff completos. Reabertura apenas por gatilho da política anti-retrabalho e missão explícita |

Registrar manualmente estado, motivo, responsável, SHA/evidência e próximo gate na missão/handoff. WAITING não equivale a aprovação e DONE não equivale a deploy. Avisos sparse do Coordinator ocorrem em mudanças relevantes de claim, colisão, dependência, bloqueio ou entrega; não são heartbeat.

## Evidência e anti-retrabalho

Vincular prova à missão, SHA/revisão, cenário, ambiente, resultado e origem. Reutilizar homologação compatível; mudança no código, ambiente ou requisito exige avaliar somente o impacto antes de repetir checks. Não reexecutar auditoria homologada, testes físicos, EV2/EV3, F0 ou decisões de stack/offline/FSM/banco canônico sem evidência nova.
Reabertura registra evidência contraditória, regressão real, mudança de requisito, nova dependência ou falha observável; identifica decisões e consumidores afetados. Preservar histórico e emitir missão delimitada, sem auditoria geral automática.

## Handoff mínimo

Relatar missão/destino, base SHA e final SHA, documentos/arquivos criados ou alterados, arquivos funcionais alterados, decisões e gates, verificações/resultados/limites, findings, dependências, estado e próxima ação. Informar commit/push efetivos e destino; explicitar situação de produção, Supabase e deploy.
Nesta OPS: incluir AGENTS.md alterado/não alterado, decisões registradas, política de plugins, anti-retrabalho e gate visual. Fechamento: **OPS CONCLUÍDA — PRONTO PARA F1** ou **MISSÃO BLOQUEADA**, conforme evidência. Um commit documental e push somente em `origin/casillas-2.2`; nenhum PR, merge ou deploy.
