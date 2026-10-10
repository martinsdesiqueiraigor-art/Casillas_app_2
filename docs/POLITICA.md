# Política de Orquestração do Casillas v1.0

## 1. Princípio fundamental
Planejar → verificar → executar → testar → registrar → aprovar → publicar.
Cada ferramenta será usada somente quando resolver um problema concreto.

## 2. Papéis
**Igor — proprietário e autoridade final.** Define objetivos, prioridades e aprova decisões relevantes.
**Claude — análise crítica, auditoria paralela e orquestração do diálogo Igor↔GPT.**
**GPT — execução técnica e orquestração das ferramentas.**
**Ferramentas —** cada uma possui função definida e atua dentro do escopo autorizado.

> **Nota de precedência (2026-10-10).** Para a trilha de interface (CAS-UI), o Claude executa sob os mesmos gates (CAS-UI-D11). Autorizações de commit, push, PR, merge e deploy seguem `AGENTS.md` §14. A hierarquia de autoridade está em `AGENTS.md` §15. Esta política ainda não foi reconciliada por inteiro com a CAS-UI: onde divergir de `AGENTS.md`, vale `AGENTS.md`. Os procedimentos da linha `casillas-2.2` (Coordenação, Mission Supervisor) permanecem preservados; não foi decidido que sejam obrigatórios na CAS-UI.

## 3. Gatilhos de ferramentas
**Context7 — obrigatório** quando a decisão depende de documentação atual de API, biblioteca, serviço ou ferramenta.
**Superpowers — obrigatório** em debug, análise de causa raiz e verificação antes de declarar conclusão.
**Codelit — obrigatório** em blocos com 5+ tarefas ou decisão arquitetural.
**Remote Desktop Commander —** execução no PC.
**Git/GitHub —** versionamento e histórico técnico.
**Supabase —** fonte de verdade do backend remoto.

## 4. Verificação de remote
Nunca afirmar “nenhum push” ou “está sincronizado” sem verificar:
- `git status -sb`
- `git log origin/<branch> -1`
- `git rev-list --left-right --count <branch>...origin/<branch>`

## 5. Aprovação
**Commit:** diff → teste → aprovação → commit.
**Push:** verificação pré → autorização Igor → push → verificação pós → registro.
**Supabase remoto:** mesma regra de verificação e aprovação antes da alteração.

## 6. Fonte de verdade por categoria
**Direção →** `PLANO-MESTRE.md`
**Estado atual →** `STATUS.md`
**Histórico técnico →** `PROGRESSO.md` + Git
**Código →** Git
**Banco remoto →** Supabase
**Documentação de API/biblioteca →** Context7 / documentação oficial

## 7. Quando parar e pedir orientação
Parar diante de:
- Requisito ambíguo.
- Conflito entre documentos.
- Alteração destrutiva.
- Risco de segurança.
- Divergência local/remote.
- Alteração arquitetural não planejada.
- Necessidade de credencial.
- Teste falhando sem causa estabelecida.

## 8. 5 princípios finais
1. Evidência antes de conclusão.
2. Estado antes de ação.
3. Uma fonte de verdade por categoria.
4. Aprovação antes de publicação.
5. Simplicidade antes de automação.

## 05/10/2026 — Gate de Produção 2.1: PUSH ≠ DEPLOY

Fluxo aprovado: hardening/desenvolvimento → validação → PR e integração controlada em casillas-2.0 → release manual → confirmação explícita de Igor → Pages. casillas-2.0 permanece a branch de release; nenhuma terceira branch de produção é necessária.

A implementação local usa CI sem Pages/OIDC, executada em PR para casillas-2.0 e pushes nas duas branches conhecidas. O workflow de release só aceita workflow_dispatch, ref refs/heads/casillas-2.0 e SHA completo igual ao HEAD de release, ao SHA do evento e ao checkout. A conferência é repetida antes de montar o artefato e depois da aprovação do environment. Se a branch avançar, iniciar uma nova release do SHA revisto; não publicar silenciosamente a execução antiga.

Antes do dispatch, Igor deve aprovar o diff, o SHA, o plano de rollback e as evidências do candidato. Informar expected_sha, approval_record e smoke_record; as referências não validam automaticamente o conteúdo dos registros. A aprovação em github-pages é confirmação deliberada da publicação pelo owner, NÃO revisão técnica independente.

Requisitos antes de publicar:
- Sintaxe dos executáveis, testes frontend existentes, testes do gate e reset/pgTAP LOCAL a partir das migrations, sem SQL manual ou credencial Supabase remota.
- Smoke do candidato em ambiente isolado: navegação/cálculos essenciais, sessão/login/logout, trial/entitlement, bloqueio em falhas e sem sessão, instalação/atualização/offline PWA. Não gerar licença real.
- Alterações em migrations/harness exigem as duas reconstruções independentes e revisão de compatibilidade/rollback; testes locais não autorizam aplicação remota.
- Revisão de segurança e ausência de blocker; artefato público limitado aos caminhos aprovados.
- Depois do deployment, smoke HTTPS é verificação operacional adicional. Sucesso em Pages não prova atualização imediata de todos os clientes PWA.

Somente o job deploy recebe pages:write/id-token:write; ele depende da validação e do artefato gerado pelo mesmo SHA no mesmo run. Smoke automatizado do artefato verifica arquivos/links locais/manifest/precache e integridade reproduzível, mas NÃO substitui smoke de navegador ou E2E comercial.

Proteção remota configurada nesta missão: PR obrigatório, check Casillas baseline do GitHub Actions (app 15368), atualização com a base, conversas resolvidas, force push/deletion bloqueados e aplicação aos administradores. Não se exige approval de PR por reviewer independente inexistente: required_approving_review_count=0. A integração continua exigindo revisão e autorização humana registradas.

github-pages exige Igor (martinsdesiqueiraigor-art), permite self-review e restringe deployments à branch casillas-2.0. Limitação: can_admins_bypass permanece true; a API REST documentada de atualização não expõe esse controle. Antes de aprovar o gate integral, desmarcar Allow administrators to bypass configured protection rules pela interface GitHub e conferir novamente. Não usar bypass como operação normal.

Rollback:
- Frontend/Pages: recuperar conteúdo de um SHA funcional conhecido, validar e publicar uma release autorizada. O guard aceita somente o HEAD atual; SHA antigo não é publicado diretamente. Recuperação usa revert rastreável/nova revisão com o conteúdo conhecido.
- Commit: revert preserva histórico e exige nova validação/release; sozinho não modifica o site publicado.
- Migration não aplicada: bloquear sua aplicação e revisar sua inclusão.
- Migration aplicada: plano separado de migration corretiva, compatibilidade e backup conforme o caso; git revert NÃO desfaz automaticamente banco ou dados.
- PWA: considerar uma nova versão de cache e provar atualização com cache existente, inclusive em rollback. service-worker.js não foi alterado nesta missão.

Ativação pendente: arquivos locais ainda não publicados. O workflow remoto antigo ainda contém push; a proteção de branch e o reviewer já estão ativos. O check obrigatório ainda precisa ser produzido pelo novo CI. Após aprovação do diff e autorização de commit/push da branch hardening, verificar CI/PR antes da integração; não desabilitar proteções para contornar check pendente. Testes reais em Actions e de aprovação permanecem pendentes; nenhuma release adicional foi executada.

## 05/10/2026 — Procedimento posterior: preparação com Pages temporariamente suspenso

O candidato técnico já está publicado na hardening (e38eed7/582716c) e a CI run #2 (37385454509) passou, sem deployment. O parágrafo anterior descreve o checkpoint pré-commit; não representa mais o estado atual da hardening. A release permanece em f7fd1e2 e EV2-08 aberto.

Sequência escolhida pela Coordenação:

1. Identificar e suspender somente Pages ID 369795219 via PUT /actions/workflows/369795219/disable; reler disabled_manually e confirmar CI ID 375870461 active.
2. Publicar somente o registro documental na hardening, exigir CI verde e criar PR para casillas-2.0; observar Casillas baseline no contexto pull_request e ausência de deployment.
3. Parar antes do merge. Integração exige nova autorização; não contornar proteção de branch.
4. Em missão posterior, manter Pages suspenso durante a integração, confirmar o YAML manual no commit resultante e comprovar ausência de deployment.
5. Somente com autorização separada, reabilitar o MESMO workflow por PUT /actions/workflows/369795219/enable ou Actions → Deploy static content to Pages → Enable workflow; reler active.
6. Testar/homologar release manual em missão posterior. Reabilitar não equivale a autorizar dispatch.

Desativação confirmada em 2026-10-05T23:23:09Z. Esse controle suspende novas execuções de Pages sem editar o arquivo ou alterar o site existente; a CI permanece ativa. Antes de transições futuras, conferir também execuções antigas pendentes.

Bypass administrativo continua true. Ajuste a decidir pelo owner: Settings → Environments → github-pages → desmarcar Allow administrators to bypass configured protection rules → salvar → conferir GET. A API REST PUT documentada consultada não expõe esse campo; não enviar parâmetro inventado.

B-03/B-04/B-05 e as provas do fluxo manual permanecem pendentes. A suspensão reduz o risco da transição, mas não fecha EV2-08 nem homologa o Gate.

## 06/10/2026 — EV2-02: continuidade offline V1

Após validação online positiva pela fachada canônica get_casillas_access_v2(), o cliente pode continuar por no máximo sete dias. O PostgreSQL produz validated_at na mesma chamada com statement_timestamp(); o lease termina em MIN(validated_at + 7 dias, valid_until), quando houver limite comercial. Para trial, valid_until é ends_at. Nenhum cache, relógio local ou ausência de rede cria/renova direito.

Sessão e entitlement são distintos: JWT expirado offline pode fornecer somente identidade cacheada consistente (user.id = JWT sub), nunca autorização por si só. É indispensável lease válido daquela conta e produto casillas. Ausência/corrupção de armazenamento, identidade incerta, produto diferente ou RPC V2 indisponível falham fechados. Logout/troca de conta invalidam o lease.

Negativa explícita do servidor invalida o lease. REVOKED não restaura trial antigo; direitos independentes válidos continuam pela autoridade existente. Falha real de transporte permite apenas usar lease anterior ainda válido, sem renovar a âncora. Ativação exige confirmação online, não pode aproveitar um lease offline antigo.

Revalidar ao abrir online, retornar conectividade, focus/visibility (eventos agrupados, intervalo mínimo de um minuto), e em oportunidade visível de até quinze minutos ou antes da expiração. O timer não faz polling agressivo nem apaga dados técnicos. Offline exibe indicação discreta de prazo.

Armazenamento operacional, não DRM: versão 1, vínculo user_id/produto, campos comerciais selecionados, sem código de licença ou token privilegiado. maxObservedLocalTime e marcador global avançam apenas; a avaliação usa tempo local máximo observado e duração desde a validação local para avançar a âncora server-side. Isso limita rollback simples e tolera offset inicial, mas não protege contra adulteração completa do cliente/armazenamento. Revogação não chega instantaneamente a aparelho realmente offline; risco aceito de até sete dias, limitado pela validade comercial.

Migração V2 deve ser aplicada sob gate remoto próprio ANTES de eventual deployment do frontend. Nesta missão não há aplicação Supabase remota, merge ou deploy. Service Worker/Production Gate permanecem inalterados; atualização de PWA/cache existente exige validação específica no futuro gate de release.
