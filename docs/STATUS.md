# STATUS — CASILLAS 2.0

Atualizado em 2026-10-04.

## Estado do projeto

- Branch real: `casillas-2.0-hardening`
- Último commit: consultar `git log -1 --oneline`
- Working tree: ver `git status --short`
- Supabase remoto: não alterado nesta atualização.
- origin/casillas-2.0: consultar Git antes de qualquer publicação
- casillas-2.0-hardening (local): Sprint 6C concluído localmente e ainda não publicado; verificar divergência no Git antes do push

## Gates

| Gate | Estado | Observação |
|---|---|---|
| G0 | CONCLUÍDO | Arquitetura comercial definida. |
| G1 | CONCLUÍDO | Schema comercial local reproduzível; wrapper público de ativação versionado. |
| G2 | CONCLUÍDO | 12/12 testes unitários de acesso; ativação local; logout; bloqueio por acesso direto sem sessão; nova sessão recuperando licença via entitlement. |
| G3 | PARCIAL (G3.1 e G3.4 concluídos; G3.2 não aplicável — Free Plan; G3.3 adiado) | Hardening local e auditoria realizados; pendências restantes. |
| G4 | CONCLUÍDO | SW v12, offline funcional validado em G4.2.2b; segurança/isolamento validados em G4.2.3. Pendências não bloqueantes registradas. |
| G5 | CONCLUÍDO | Textos, logout, oferta comercial e Camada 1 implementados; regressão da UX alterada aprovada. E2E remoto da Camada 1 não executado por decisão explícita. |
| Sprint 6C | CONCLUÍDO LOCALMENTE | Refinamento de Guia CNC, navegação/acessibilidade, estados/feedbacks e responsividade. Regressão 12/12; compartilhamento ainda requer validação em HTTPS. |
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

## G5 — concluído

- G5.4.1: textos visíveis padronizados para "Período de teste"; validação manual aprovada.
- G5.4.2: logout visível implementado; validação manual aprovada.
- G5.4.3: oferta vitalícia com preço promocional e compra via WhatsApp implementada; validação manual aprovada.
- Suite `tests/trial-access.test.mjs`: 12/12 passando na regressão de G5.
- Camada 1: `tools/gerar-codigo.mjs` e `docs/OPERACAO-COMERCIAL.md` implementados e versionados.
- Gerador validado localmente: sintaxe, geração, normalização e SHA-256 conferidos por vetor independente; modo `--sql` apenas prepara o INSERT.
- O teste E2E remoto da Camada 1 (cadastrar licença descartável e ativá-la) não foi executado por decisão explícita do Igor; nenhuma escrita remota foi feita nessa validação.
- Commits de implementação: `97c8cc4`, `4cb7f7c`, `7d4ca09`, `53a00ef`.

## Sprint 6C — refinamento concluído localmente

- 6C.1: Guia CNC refinado para consulta compacta; escopo oficial do Guia restrito a FANUC e Siemens; validação manual aprovada. Commit `b00bdfe`.
- 6C.2: navegação por teclado, foco e estados ARIA melhorados; validação manual aprovada. Commit `90449c9`.
- 6C.3: terminologia de período de teste e estados semânticos do Guia padronizados; validação manual aprovada. Commit `d5aaabc`.
- 6C.4: zoom do navegador liberado e responsividade/áreas de toque refinadas para telas pequenas; validação manual aprovada. Commit `fd58c25`.
- 6C.5: revisão acumulada sem regressão encontrada; `git diff --check`, sintaxe dos JavaScript alterados e `tests/trial-access.test.mjs` aprovados (12/12).
- Compartilhar App: não foi validado no teste por smartphone em `http://192.168.24.7:4175`; permanece pendente de validação em contexto HTTPS/seguro. Não é registrado como aprovado nem como falha funcional confirmada.
- Supabase remoto não foi alterado pelo Sprint 6C.
- Os commits do Sprint 6C permanecem locais até autorização explícita de publicação.

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

- G6 — Testes end-to-end



A divergência histórica de timestamps das migrations remotas permanece registrada como pendência de rastreabilidade.

## Regra anti-retrabalho

Antes de qualquer tarefa: consultar este arquivo, `PLANO-MESTRE.md`, `PROGRESSO.md` e evidências Git. Tarefas concluídas somente são revalidadas quando necessário.
