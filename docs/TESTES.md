# Testes e validação

Esta página distingue inspeção estática, resultados registrados anteriormente e execução atual. Nenhum teste foi executado durante a consolidação documental.

## Existentes

- `supabase/tests/profiles_rls.test.sql`: testes SQL de estrutura e isolamento de leitura/atualização do perfil. O registro histórico contabiliza 16 asserções neste arquivo.
- `supabase/tests/000-setup-tests-hooks.sql`: setup hook (1 asserção no registro histórico).
- Total de 17 asserções SQL/RLS foi registrado como aprovado em execução anterior. O escopo é principalmente `profiles`; não cobre integralmente trial, entitlement, ativação, papéis administrativos ou fluxo atual de PWA.
- Não há suíte automatizada de frontend indicada por `package.json` (não há `package.json` na raiz).

## Evidência disponível

| Verificação | Estado | Evidência/limite |
|---|---|---|
| 17 asserções SQL/RLS | Aprovado historicamente | Documentado em registros anteriores; não repetido nesta atualização. |
| Login, perfil automático, RPC de trial e leitura autenticada | Aprovado historicamente | Relato anterior; não representa execução atual. |
| Home | Parcialmente validado | Histórico registra teste visual manual; não cobre todos os módulos. |
| PWA, instalação e Service Worker | Parcialmente validado | `docs/status-casillas-2.0.md` registra observações feitas no Chrome; não foram repetidas. |
| Offline até a tela de login | Parcialmente validado | Observado em teste registrado; sessão autenticada e acesso após login offline não validados. |
| Inspeção das migrations e chamadas cliente | Aprovado como inspeção estática | RPCs e configuração local conferidas; não comprova ambiente remoto. |
| Testes nesta consolidação | Não executados | Escopo exclusivamente documental. |

## Pendências de validação

- Auth: login, sessão persistente, logout, redefinição de senha e erros de rede.
- Trial: criação controlada, reutilização sem extensão, estado ativo, expiração, usuário não autenticado e erros de RPC.
- Entitlement/licença: válido, ausente, revogado, expirado, produto inativo, ativação e falhas; usar ambiente e códigos de teste autorizados.
- RLS/grants: execução da suíte SQL e testes por papéis `anon` e `authenticated`, incluindo tabelas sensíveis e RPCs. Não testar produção sem autorização.
- PWA: instalação, escopo sob subpath do GitHub Pages, atualização/cache antigo, navegação offline e cálculos após uma sessão válida; distinguir recursos offline da autorização online.
- Fluxo visual dos 12 módulos, Card 5 de Consultoria e fluxo de recuperação de senha.

Ativar licença, criar trial ou alterar dados requer ambiente de teste autorizado. Nenhuma chamada remota foi feita para esta documentação.
