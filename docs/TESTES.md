## ESTADO ATUAL / OBSERVAÇÃO DE ENCERRAMENTO — 2026-10-06

Casillas 2.1.0 está em PRODUÇÃO HOMOLOGADA: tag v2.1.0, SHA 1b3082e7ca82bb669180402cf419a56e51af374a,
deployment 6888207195, SW casillas-v13, Supabase ACTIVE_HEALTHY com 14 migrations canônicas aplicadas.
EV2, EV3, EV1 e Production Gate fechados. CI existe e passou; package.json existe.
Offline autenticado, instalação PWA e validação física Android/offline real homologados pela Coordenação.

Fontes atuais: [Release 2.1.0](RELEASE-2.1.0.md), [Baseline 2.1](BASELINE-2.1.md) e [Transição 2.2](HANDOFF-2.1-TO-2.2.md).
Este cabeçalho não modifica o registro abaixo nem declara novas execuções de testes ou consultas remotas nesta missão.
Desenvolvimento novo somente em casillas-2.2; não recriar contratos já entregues.

## REGISTRO HISTÓRICO PRESERVADO

O conteúdo abaixo descreve estados, testes e limites das respectivas datas/missões, incluindo pendências já encerradas.
Ele não redefine a versão estável atual nem constitui autorização de produção.

---
# Testes e validação

Esta página distingue inspeção estática, resultados históricos e regressões posteriores. Em 04/10/2026, G6 foi consolidado por evidências acumuladas do fluxo crítico; nenhum E2E foi repetido apenas para alterar o rótulo do gate.

## Existentes

- `supabase/tests/profiles_rls.test.sql`: testes SQL de estrutura e isolamento de leitura/atualização do perfil. O registro histórico contabiliza 16 asserções neste arquivo.
- `supabase/tests/000-setup-tests-hooks.sql`: setup hook (1 asserção no registro histórico).
- Total de 17 asserções SQL/RLS foi registrado como aprovado em execução anterior. O escopo é principalmente `profiles`; não cobre integralmente trial, entitlement, ativação, papéis administrativos ou fluxo atual de PWA.
- Não há suíte automatizada de frontend indicada por `package.json` (não há `package.json` na raiz).

## Evidência disponível

| Verificação | Estado | Evidência/limite |
|---|---|---|
| 17 asserções SQL/RLS | Aprovado historicamente | Documentado em registros anteriores; não repetido nesta atualização. |
| Login, trial expirado, ativação, entitlement, logout e nova sessão | Aprovado no fluxo integrado de G2 | `PROGRESSO.md` registra ativação de `TESTCASILLAS2026`, bloqueio pós-logout e recuperação da licença em novo login. |
| Regressão comercial | Aprovado | `tests/trial-access.test.mjs`: 12/12 em execuções registradas em G2, G5 e Sprint 6C. |
| Home | Parcialmente validado | Histórico registra teste visual/manual; não representa fluxo visual exaustivo de todos os módulos. |
| PWA, instalação e atualização do Service Worker | Aprovado no escopo de G4 | G4.2.1 registrou SW v12, cache esperado e atualização com limpeza de cache antigo. |
| Offline autenticado e cálculos | Aprovado no escopo de G4.2.2b | Sessão ativa + SW v12 + reload offline; Trigonometria, Roscas e Guia CNC funcionaram; retorno online normal. |
| Segurança/isolamento do Service Worker | Aprovado com limites documentados | G4.2.3 foi concluído; alguns casos foram auditados estaticamente sem execução dinâmica e continuam registrados como cobertura incompleta. |
| Inspeção das migrations e chamadas cliente | Aprovado como inspeção estática | RPCs e configuração local conferidas; inspeção isolada não comprova todo o ambiente remoto. |
| Consolidação G6 | Concluída por evidências acumuladas | Nenhum E2E crítico foi repetido; foram reutilizadas evidências concretas de G2, G4 e regressões posteriores. |

## Cobertura complementar ainda não executada integralmente

- Auth: recuperação de senha completa foi validada em G7 (solicitação → e-mail → link HTTPS → nova senha → login com a nova senha). Permanecem sem cobertura integral apenas falhas reais de rede e outros cenários complementares.
- Trial: criação controlada/reutilização sem extensão e combinações remotas adicionais; expiração/bloqueio e erros principais possuem cobertura integrada ou unitária registrada.
- Entitlement/licença: cenários remotos adicionais de revogação, expiração, produto inativo e falhas; ativação válida e recuperação do entitlement já possuem evidência integrada.
- Camada 1 comercial: E2E remoto com criação e ativação de licença descartável não executado por decisão explícita anterior.
- RLS/grants: ampliar execução por papéis `anon` e `authenticated` nas tabelas sensíveis e RPCs; não testar produção sem autorização.
- PWA: alguns cenários de G4.2.3 permaneceram apenas em auditoria estática; instalação, atualização e offline autenticado crítico já foram validados.
- UX: fluxo visual exaustivo de todos os módulos não foi executado; módulos críticos/amostrais e refinamentos do Sprint 6C possuem validação registrada.
- Compartilhar App: aprovado manualmente em origem HTTPS publicada; a ação gerou corretamente a mensagem de compartilhamento com o link da landing page.

Ativar licença, criar trial ou alterar dados requer ambiente de teste autorizado. Nenhuma chamada remota foi feita para esta documentação.
