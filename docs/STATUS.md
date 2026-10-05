# STATUS — CASILLAS 2.0

Atualizado em 2026-10-04.

## Estado do projeto

- Branch real: `casillas-2.0-hardening`
- Último commit: consultar `git log -1 --oneline`
- Working tree: ver `git status --short`
- Supabase remoto: não alterado nesta atualização.
- origin/casillas-2.0: `68da79a` — documentação de conclusão de G9 publicada; release funcional Casillas 2.0.0 permanece baseado em `5588402`
- casillas-2.0-hardening (local): sincronizada com `origin/casillas-2.0` (`0 0`)

## Gates

| Gate | Estado | Observação |
|---|---|---|
| G0 | CONCLUÍDO | Arquitetura comercial definida. |
| G1 | CONCLUÍDO | Schema comercial local reproduzível; wrapper público de ativação versionado. |
| G2 | CONCLUÍDO | 12/12 testes unitários de acesso; ativação local; logout; bloqueio por acesso direto sem sessão; nova sessão recuperando licença via entitlement. |
| G3 | PARCIAL (G3.1 e G3.4 concluídos; G3.2 não aplicável — Free Plan; G3.3 adiado) | Hardening local e auditoria realizados; pendências restantes. |
| G4 | CONCLUÍDO | SW v12, offline funcional validado em G4.2.2b; segurança/isolamento validados em G4.2.3. Pendências não bloqueantes registradas. |
| G5 | CONCLUÍDO | Textos, logout, oferta comercial e Camada 1 implementados; regressão da UX alterada aprovada. E2E remoto da Camada 1 não executado por decisão explícita. |
| Sprint 6C | CONCLUÍDO E PUBLICADO | Refinamento de Guia CNC, navegação/acessibilidade, estados/feedbacks e responsividade. Regressão 12/12; Compartilhar App validado no ambiente HTTPS publicado. |
| G6 | CONCLUÍDO POR EVIDÊNCIAS ACUMULADAS | Fluxo crítico integrado coberto por G2, G4 e regressões posteriores; cobertura complementar permanece registrada em TESTES.md. |
| G7 | CONCLUÍDO | Dois bloqueadores corrigidos; deploy do commit `e52ff60` aprovado e recuperação de senha validada E2E em HTTPS até novo login. |
| G8 | CONCLUÍDO/APROVADO | Igor aprovou explicitamente o release candidate Casillas 2.0.0 (`5588402`) após deploy nº 15 e smoke test em produção. |
| G9 | CONCLUÍDO | Produção oficial mantida no GitHub Pages; Supabase/Auth e operação comercial auditados; smoke test final HTTPS aprovado com licença ativa no smartphone. |
| G10 | EM ANDAMENTO | G10.1 oferta/preço, G10.2 PIX manual e G10.3 procedimento de licença definidos; G10.4 Landing V2 concluída e publicada; G10.5 primeira venda assistida pendente. |

## G1 — evidências já existentes

- `20260929042401_add_get_casillas_entitlement.sql` versiona entitlement.
- `20260928160324_fix_activate_casillas_license_entitlement_check.sql` contém a implementação privada de ativação.
- O wrapper público `public.activate_casillas_license(text)` agora está versionado em `20260930213346_add_public_activate_casillas_license_wrapper.sql`.
- O drift de timestamp 60324/60738 foi classificado como histórico, não funcional.

## G2 — evidências finais

- Suite `tests/trial-access.test.mjs`: 12/12 passando.
- `app.js` valida a sessão no boot via `getCurrentUser()`.
- `trial.js` usa `auth.getUser()` antes de entitlement, trial e ativação.
- `auth.js` expõe `onAuthStateChange()` e `app.js` trata `SIGNED_OUT` redirecionando para `auth.html`.
- Ativação local com `TESTCASILLAS2026` resultou em `Licença ativa` e `Acesso comercial confirmado`.
- Após logout, o acesso direto a `http://localhost:4175/` permaneceu bloqueado na tela de login.
- Nova sessão autenticada recuperou a licença ativa sem nova ativação, confirmando reconsulta do entitlement.
- Nenhuma alteração remota no Supabase foi necessária para esses testes.

## G3 — evidências da auditoria de segurança (2026-10-01)

- Security Advisor remoto confirmou `public.rls_auto_enable()` como `SECURITY DEFINER` executável por `anon` e `authenticated`, com rota RPC reportada pelo advisor. O achado é concreto e requer decisão de hardening; nenhuma correção foi aplicada.
- Security Advisor remoto confirmou proteção contra senhas vazadas desativada. Nenhuma alteração de Auth foi aplicada.
- Security Advisor remoto mantém RLS sem policies em `licenses`, `entitlements`, `access_events` e `admin_roles` como INFO; o snapshot anterior mostrou ausência de grants diretos para `anon`/`authenticated` nessas tabelas. Não foi classificado como vulnerabilidade confirmada.
- Não existem Edge Functions no projeto remoto neste momento.
- Não foi encontrado rate limiting implementado para tentativas de ativação; permanece pendência de desenho/decisão.
- `gerar-codigo.html` removido em G3.4 (commit 3b47078).

## G3.1 — hardening de `public.rls_auto_enable()` concluído

- Migration `20261001023219_harden_rls_auto_enable_acl.sql` aplicada remotamente via SQL Editor.
- ACL pós-aplicação: `PUBLIC/anon/authenticated/service_role=false`; `postgres=true`.
- `proacl` final: `{postgres=X/postgres}`.
- Security Advisor não reporta mais os WARNs de `rls_auto_enable()` para `anon` e `authenticated`.
- Rollback: `C:\Backups\Casillas\2026-10-01-g3-rls\rollback.sql`.

## G5 — concluído

- G5.4.1: textos visíveis padronizados para "Período de teste"; validação manual aprovada.
- G5.4.2: logout visível implementado; validação manual aprovada.
- G5.4.3: oferta vitalícia com preço promocional e compra via WhatsApp implementada; validação manual aprovada.
- Suite `tests/trial-access.test.mjs`: 12/12 passando na regressão de G5.
- Camada 1: `tools/gerar-codigo.mjs` e `docs/OPERACAO-COMERCIAL.md` implementados e versionados.
- Gerador validado localmente: sintaxe, geração, normalização e SHA-256 conferidos por vetor independente; modo `--sql` apenas prepara o INSERT.
- O teste E2E remoto da Camada 1 (cadastrar licença descartável e ativá-la) não foi executado por decisão explícita do Igor; nenhuma escrita remota foi feita nessa validação.
- Commits de implementação: `97c8cc4`, `4cb7f7c`, `7d4ca09`, `53a00ef`.

## Sprint 6C — refinamento concluído e publicado

- 6C.1: Guia CNC refinado para consulta compacta; escopo oficial do Guia restrito a FANUC e Siemens; validação manual aprovada. Commit `b00bdfe`.
- 6C.2: navegação por teclado, foco e estados ARIA melhorados; validação manual aprovada. Commit `90449c9`.
- 6C.3: terminologia de período de teste e estados semânticos do Guia padronizados; validação manual aprovada. Commit `d5aaabc`.
- 6C.4: zoom do navegador liberado e responsividade/áreas de toque refinadas para telas pequenas; validação manual aprovada. Commit `fd58c25`.
- 6C.5: revisão acumulada sem regressão encontrada; `git diff --check`, sintaxe dos JavaScript alterados e `tests/trial-access.test.mjs` aprovados (12/12).
- Compartilhar App: validado manualmente no smartphone no ambiente HTTPS publicado; a ação gerou corretamente a mensagem de compartilhamento do Casillas com o link da landing page.
- Supabase remoto não foi alterado pelo Sprint 6C.
- Os commits do Sprint 6C foram publicados em `origin/casillas-2.0` junto com a evolução que culminou no G7; no início do G8, Git confirmou divergência local/remoto `0 0`.

## Pendências Abertas

### Revalidação de gates
- [x] G6 consolidou as evidências críticas já executadas em G2, G4 e regressões posteriores sem repetir testes concluídos.
- [ ] Cenários complementares não cobertos pelo fluxo crítico permanecem em `docs/TESTES.md` para evolução/auditoria conforme risco.

### Infraestrutura de teste
- [ ] Criar docs/TESTE-LOCAL.md
      - Servidor correto (porta 4175, raiz do projeto)
      - Usuários de teste local (nome, não senha)
      - Como recriar
      - Limitações de automação (login, DevTools Application)
      - Critérios para considerar um teste válido

### Pendências cosméticas (não bloqueantes)
- [ ] Adicionar favicon.ico
- [ ] Atualizar meta tag apple-mobile-web-app-capable

### Decisões arquiteturais a validar
- [ ] Comportamento do SW vs. auth
      Estado: SW registra apenas após auth
      Pendência: decidir se mantém (intencional) ou altera (futuro)

### Achados de G4 (não bloqueantes)
- [ ] Service Worker cacheia 404 de navegação
      Impacto: fallback offline.html limitado a URLs nunca acessadas
      Correção ideal: if (res.ok) antes de c.put
      Prioridade: baixa

### Cobertura de testes
- [ ] G4.2.3 — testes 2, 3c, 4 auditados estaticamente, não executados
      dinamicamente. Não há funcionalidade conhecida quebrada —
      apenas cobertura de execução incompleta.

## G7 — Auditoria final

- CONCLUÍDO.
- Auditoria identificou dois bloqueadores concretos: recuperação de senha incompleta e publicação de todo o repositório no artefato do GitHub Pages.
- Recuperação de senha foi completada com tratamento de `PASSWORD_RECOVERY`, confirmação de nova senha e `updateUser({ password })`.
- Workflow do GitHub Pages monta `_site` apenas com os arquivos necessários ao PWA; documentação, migrations, testes e ferramentas locais ficam fora do artefato.
- Commit `e52ff60` foi publicado e o workflow GitHub Pages nº 13 concluiu com sucesso para esse SHA.
- E2E real de recuperação aprovado em HTTPS com conta de teste: solicitação aceita → e-mail recebido → link abriu modo Nova senha → senha redefinida → login bem-sucedido com a nova senha.
- Validações locais anteriores: `git diff --check`, sintaxe de `js/auth.js` e `js/auth-page.js`, suíte `tests/trial-access.test.mjs` 12/12 e conferência dos caminhos do artefato.
- Compartilhar App foi posteriormente validado no ambiente HTTPS publicado e deixou de ser pendência.

## G10 — lançamento em andamento

- G10.1: oferta definida em R$ 49,90, com preço promocional de lançamento de R$ 19,90.
- G10.2: pagamento inicial definido como PIX manual; dados de pagamento não devem ser publicados no Git/app e são enviados apenas em contato privado.
- G10.3: procedimento manual de emissão/entrega/ativação preparado com `tools/gerar-codigo.mjs --sql`; nenhuma licença real foi criada durante a preparação de G10.
- G10.4: CONCLUÍDO E PUBLICADO. Landing V2 integrada ao `main` do repositório `Casillas-landing` no commit `7a9b12d`; GitHub Pages concluiu com sucesso para o SHA correspondente e a produção HTTPS foi verificada com o CSS local e a oferta comercial, sem os textos antigos bloqueados.
- G10.5: primeira venda assistida e checklist pós-venda ainda não executados.

## Próxima ação

- G10.5 — preparar a primeira venda assistida e o checklist operacional pós-venda. Preparação não autoriza geração de licença real, escrita no Supabase, envio de PIX, compra ou publicação.



A divergência histórica de timestamps das migrations remotas permanece registrada como pendência de rastreabilidade.

## Regra anti-retrabalho

Antes de qualquer tarefa: consultar este arquivo, `PLANO-MESTRE.md`, `PROGRESSO.md` e evidências Git. Tarefas concluídas somente são revalidadas quando necessário.

## 05/10/2026 — BL-02: candidato a fechado, revisão pendente

- Pré-requisito local: 20261001023218_reconcile_rls_auto_enable_prerequisite.sql; hardening existente preservado.
- Reset npx --no-install supabase db reset --local --no-seed: dez migrations aplicadas, exit 0, sem SQLSTATE 42883.
- Função, owner, corpo histórico, trigger, dependência e ACL verificados localmente; provas transacionais de RLS concluídas com rollback.
- BL-02: CANDIDATO A FECHADO, sujeito à revisão da Coordenação.
- BL-01: ABERTO. supabase test db --local falha na preparação de profiles por schema tests ausente (exit 1; plano 16, executados 8).
- Os gates históricos não equivalem à aprovação da baseline 2.1. Baseline integral e reprodutibilidade dos testes ainda pendentes.
- Sem escrita remota, correção EV2, commit, push ou deploy. Alterações locais aguardam revisão.

## 05/10/2026 — BL-01: baseline local reproduzível, revisão pendente

- BL-02: FECHADO NO ESCOPO LOCAL pela Coordenação; migration de pré-requisito e hardening preservados.
- BL-01: RESOLVIDO TECNICAMENTE. Setup autocontido com quatro helpers Basejump 0.0.6 fixados no repositório, somente em supabase/tests; sem dependência HTTP/dbdev/pg_tle durante os testes.
- Profiles inalterado: 16/16 PASS. Setup: 12/12 PASS. Suíte completa: Files=2 / Tests=28 / PASS, exit 0.
- Duas reconstruções independentes LOCAL: reset 10/10 migrations, exit 0, seguido de suíte completa PASS, exit 0, em cada ciclo. Antes de cada suíte, ausência de schema/helpers/fixtures confirmou que o harness foi reconstruído automaticamente.
- BASELINE LOCAL REPRODUZÍVEL — APROVÁVEL, referente ao HEAD f3019fc4c6a22baef2b96985665f62f79fa7bedf mais diffs locais BL-02/BL-01 ainda não commitados. Aprovação formal aguarda revisão da Coordenação.
- Causa histórica, fonte dos helpers, versões e resultados registrados em PROGRESSO.md e BANCO-DADOS.md. As pendências históricas acima permanecem como registros do estado anterior.
- Não houve escrita remota, mudança comercial, correção EV2, commit, push ou deploy. Reconciliação/validação do histórico remoto continua fora desta comprovação.

## 05/10/2026 — Gate de Produção: implementação pré-commit

- Baseline BL-01/BL-02 aprovada e publicada em f7fd1e2340b7d95f405c2c6f00e41ae4176d3cef; último deployment conhecido permanece run #20, success, nesse SHA.
- Gate implementado LOCALMENTE: CI sem deploy; release manual com ref/SHA/evidências; validação reutilizada antes de artefato/Pages.
- Local: sintaxe de 42 executáveis rastreados, frontend 12/12, gate 8/8, actionlint 1.7.12 PASS; banco descartável database-only aplicou 10 migrations e pgTAP 28/28 PASS, removido com seus volumes.
- Proteções remotas de branch e required reviewer Igor no github-pages configuradas e relidas com sucesso. Self-review é confirmação operacional, não revisão técnica independente.
- Limitação aberta: environment can_admins_bypass=true; desativação requer interface GitHub. Check Casillas baseline exigido na branch ainda aguarda primeira execução do novo workflow.
- EV2-08/Gate de Produção: PARCIAL, aguardando revisão pré-commit, publicação autorizada e provas reais T1–T6 em Actions. O YAML novo não está ativo remotamente.
- Sem commit, push, deploy adicional, alteração funcional, EV2-02/03/04/06 ou Supabase remoto. Procedimento de release/cache/rollback: POLITICA.md.
