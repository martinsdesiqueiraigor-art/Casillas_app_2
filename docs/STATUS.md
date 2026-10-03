# STATUS — CASILLAS 2.0

Atualizado em 2026-10-01.

## Estado do projeto

- Branch real: `casillas-2.0-hardening`
- Último commit: consultar `git log -1 --oneline`
- Working tree: ver `git status --short`
- Supabase remoto: não alterado nesta atualização.
- origin/casillas-2.0: `0e4e074` (atualizado por push em 01/10 19:58)
- casillas-2.0-hardening (local): 3 commits à frente do remote

## Gates

| Gate | Estado | Observação |
|---|---|---|
| G0 | CONCLUÍDO | Arquitetura comercial definida. |
| G1 | CONCLUÍDO | Schema comercial local reproduzível; wrapper público de ativação versionado. |
| G2 | CONCLUÍDO | 12/12 testes unitários de acesso; ativação local; logout; bloqueio por acesso direto sem sessão; nova sessão recuperando licença via entitlement. |
| G3 | PARCIAL (G3.1 e G3.4 concluídos; G3.2 não aplicável — Free Plan; G3.3 adiado) | Hardening local e auditoria realizados; pendências restantes. |
| G4 | PARCIAL | PWA/SW validados em G4.2.x; segurança e isolamento validados em G4.2.3. G4 em fechamento documental (G4.3b/c/d). |
| G5 | PARCIAL | UX comercial implementada; compra/pagamento ainda externo. |
| G6 | PENDENTE | E2E integrado. |
| G7 | PENDENTE | Auditoria final. |
| G8 | PENDENTE | Aprovação do release. |
| G9 | PENDENTE | Produção. |
| G10 | PENDENTE | Lançamento. |

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

## Pendências Abertas

### Revalidação de gates
- [ ] Revalidar G2 (Auth/Trial/Ativação) contra código atual
      Motivo: testes de G2 podem ter rodado contra servidor v10
      Referência: PROGRESSO.md (G4.2.1, G4.2.2a)

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

## Próxima ação

- G4.3d — fechamento de G4



A divergência histórica de timestamps das migrations remotas permanece registrada como pendência de rastreabilidade.

## Regra anti-retrabalho

Antes de qualquer tarefa: consultar este arquivo, `PLANO-MESTRE.md`, `PROGRESSO.md` e evidências Git. Tarefas concluídas somente são revalidadas quando necessário.
