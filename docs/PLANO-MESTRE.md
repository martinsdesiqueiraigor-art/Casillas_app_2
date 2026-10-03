# PLANO MESTRE — CASILLAS 2.0

Fonte de verdade do plano de desenvolvimento. Etapas concluídas não devem ser repetidas sem justificativa técnica e evidência.

## Governança

- GPT coordena; ferramentas especializadas executam; evidências validam.
- Mudanças críticas exigem aprovação explícita do Igor.
- Git registra a história; este plano registra a direção; STATUS registra o presente.
- Antes de cada fase: verificar STATUS, PROGRESSO, Git e evidências existentes.

## Gates

- G0 — Arquitetura: CONCLUÍDO
- G1 — Reprodutibilidade do banco: CONCLUÍDO
- G2 — Auth e fluxo comercial: CONCLUÍDO
G3 — Segurança e hardening: PARCIAL
  - G3.1 ✅ concluído
  - G3.2 ⚪ não aplicável (Free Plan)
  - G3.3 ⏸ adiado (pós-lançamento)
  - G3.4 concluído
- G4 — PWA, Service Worker e offline: PARCIAL
  ├── G4.1 — Auditoria estática ✅
  ├── G4.1.1 — Correção do pré-cache ✅
  ├── G4.2.1 — Instalação e atualização ✅
  ├── G4.2.2a — Diagnóstico de contexto ✅
  ├── G4.2.2b — Testes offline funcionais ✅
  ├── G4.2.3 — Segurança e isolamento ✅
  ├── G4.3b — Correção do estado operacional 🔄
  ├── G4.3c — Consolidação de pendências ⏳
  └── G4.3d — Fechamento de G4 ⏳
- G5 — UX comercial: PARCIAL
- G6 — Testes end-to-end: PENDENTE
- G7 — Auditoria final: PENDENTE
- G8 — Aprovação do release por Igor: PENDENTE
- G9 — Produção: PENDENTE/CONTROLADO
- G10 — Lançamento: PENDENTE

## Fases técnicas

1. Governança e rastreabilidade.
2. Produto base e módulos técnicos.
3. Arquitetura comercial Supabase.
4. Reprodutibilidade completa das migrations e funções.
5. Testes de banco, RLS e grants.
6. Auth, trial, entitlement e ativação.
7. Hardening, erros, abuso e rate limiting.
8. Segurança frontend e estado local.
9. PWA, Service Worker, update e offline autenticado.
10. Limpeza controlada de legado.
11. UX comercial e ativação.
12. Modelo comercial, compra e suporte.
13. Landing page e presença comercial.
14. Domínio e publicação.
15. Testes E2E e regressão.
16. Auditoria final de segurança e arquitetura.
17. Release candidate e aprovação.
18. Deploy e smoke test de produção.
19. Lançamento.
20. Pós-lançamento e evolução.
21. Opcional: preparação para Play Store.

## Regra de avanço

Uma fase só avança quando possui objetivo, evidência, testes aplicáveis, decisão registrada e gate correspondente aprovado. Se uma tarefa já estiver concluída, ela será apenas verificada contra suas evidências; não será refeita.

## G3.1 — Hardening de `public.rls_auto_enable()` — CONCLUÍDO

- ACL remoto restringido a `postgres` após validação local e aplicação remota controlada.
- Security Advisor deixou de reportar os WARNs de execução por `anon` e `authenticated`.
- Migration versionada: `20261001023219_harden_rls_auto_enable_acl.sql`.
- Commit: `73e408c6f8868b1e76560901535293cfccfdecc5`.

## Próxima ação oficial

G4.3b — Correção do estado operacional

G2 foi concluído com validação integrada de autenticação, trial, entitlement, ativação, logout, bloqueio por acesso direto sem sessão e nova sessão recuperando a licença ativa.

G1 foi concluído para reprodutibilidade do schema: o wrapper público de ativação foi versionado localmente sem duplicar a implementação privada. A divergência histórica de timestamps das migrations remotas permanece como pendência de rastreabilidade e não impede a reconstrução do schema.
