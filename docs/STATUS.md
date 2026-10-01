# STATUS — CASILLAS 2.0

Atualizado em 2026-10-01.

## Estado do projeto

- Branch real: `casillas-2.0-hardening`
- HEAD: `629ebe3` — relatório de auditoria técnica completa
- Working tree: alterações locais intencionais; nada staged.
- Supabase remoto: não alterado nesta atualização.

## Gates

| Gate | Estado | Observação |
|---|---|---|
| G0 | CONCLUÍDO | Arquitetura comercial definida. |
| G1 | CONCLUÍDO | Schema comercial local reproduzível; wrapper público de ativação versionado. |
| G2 | CONCLUÍDO | 12/12 testes unitários de acesso; ativação local; logout; bloqueio por acesso direto sem sessão; nova sessão recuperando licença via entitlement. |
| G3 | PARCIAL | Hardening local e auditoria realizados; pendências restantes. |
| G4 | PARCIAL | PWA/SW existem; offline autenticado ainda precisa validação completa. |
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
- `gerar-codigo.html` continua público/legado e incluído no artefato, com instruções obsoletas de três aparelhos; nenhuma alteração foi feita.

## Próxima ação

G3 — Segurança e hardening: decidir e, após aprovação, tratar `rls_auto_enable()` e proteção contra senhas vazadas; depois desenhar rate limiting da ativação e decidir o destino de `gerar-codigo.html`. A divergência histórica de timestamps das migrations remotas permanece registrada como pendência de rastreabilidade.

## Regra anti-retrabalho

Antes de qualquer tarefa: consultar este arquivo, `PLANO-MESTRE.md`, `PROGRESSO.md` e evidências Git. Tarefas concluídas somente são revalidadas quando necessário.
