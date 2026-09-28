# Casillas App 2.0 — Supabase e dados comerciais

Este documento descreve o papel atual do backend, sem substituir as migrations nem uma consulta de catálogo remoto. Dados do projeto e do modelo comercial abaixo correspondem ao contexto confirmado do marco de 28/09/2026.

## Projeto

- Nome: `Casillas`
- Referência: `maayjshlsxvxtrgjpcep`
- Região: São Paulo (`sa-east-1`)
- Plano: Free

O frontend usa configuração pública apropriada para cliente. Nenhuma `service_role`, chave secreta, senha ou credencial administrativa deve entrar em HTML, JavaScript público ou documentação.

## Entidades

As migrations locais definem as tabelas comerciais abaixo. RLS está habilitado nelas; políticas e permissões devem ser conferidas nas migrations e no ambiente remoto antes de qualquer mudança de banco.

| Tabela | Papel |
|---|---|
| `products` | Catálogo e estado ativo de produtos, incluindo `casillas`. |
| `profiles` | Perfil associado à identidade Auth. |
| `trials` | Período de avaliação associado ao usuário e produto. |
| `licenses` | Registro e estado das licenças comerciais. |
| `entitlements` | Direitos de acesso comerciais associados ao usuário/produto. |
| `access_events` | Histórico de eventos de acesso/ativação. |
| `admin_roles` | Atribuições administrativas. |

## Fluxo de acesso

- Supabase Auth fornece a identidade autenticada.
- O cliente consulta `get_casillas_entitlement()` antes do trial.
- Se não houver entitlement comercial válido, consulta `start_casillas_trial()`.
- O trial é de 30 dias, associado à conta e controlado pelo servidor.
- A ativação chama `activate_casillas_license`; o processamento do código e a criação/atualização de entitlement ocorrem no backend.
- A licença atual é vitalícia, vinculada à conta autenticada e sem limite de aparelhos.

A Home apenas apresenta o resultado devolvido ao fluxo do aplicativo. IndexedDB/localStorage não determinam validade comercial.

## Funções e versionamento

As funções usadas pelo cliente são `start_casillas_trial`, `get_casillas_entitlement` e `activate_casillas_license`. A criação inicial e a exposição do trial estão registradas nas migrations locais; a correção da ativação está em `supabase/migrations/20260928160324_fix_activate_casillas_license_entitlement_check.sql`.

Na busca estática deste marco, não foi encontrada uma definição de `get_casillas_entitlement` nas migrations locais, embora a função remota faça parte do fluxo atual conforme o estado confirmado do projeto. **Backlog:** verificar a origem/versionamento dessa definição e sincronizá-la por uma etapa própria, sem alterar o Supabase neste trabalho documental.

O inventário completo, parâmetros, privilégios e políticas devem ser obtidos das migrations e de consultas somente leitura ao projeto remoto. Este documento não afirma que fez uma consulta remota nesta atualização.

## Segurança e RLS

- RLS está habilitado nas tabelas comerciais expostas.
- Policies devem limitar linhas conforme identidade/necessidade; RLS não substitui grants nem regras internas de RPCs.
- Funções privilegiadas devem validar identidade, manter search path seguro e expor somente as permissões necessárias.
- O cliente não deve receber segredos administrativos.

Consulte [Segurança](SEGURANCA.md) e as migrations em `supabase/migrations/`. Nenhuma alteração de schema ou dado foi feita para esta documentação.

## Histórico e próximos passos

Os registros antigos que descreviam licenças/entitlements como ainda não operacionais eram snapshots de etapas anteriores e foram supersedidos pelo fluxo comercial atual.

Próximos pontos técnicos: versionar a definição de `get_casillas_entitlement`, completar a bateria integrada de trial (ativo, expirado e erro), e manter testes de isolamento/RLS em dia. Nenhum desses pontos requer mudança de banco nesta atualização documental.
## Funções registradas nas migrations locais

**Fonte desta seção:** migrations locais nomeadas abaixo. Esta é documentação estática do repositório e não confirma sozinha a versão atualmente implantada.

| Função | Definição local e papel | Segurança local registrada |
|---|---|---|
| `private.set_updated_at()` | Trigger function que atualiza `NEW.updated_at`; associada a triggers de tabelas que possuem `updated_at`. | `SECURITY DEFINER`, `SET search_path = ''`; execução direta revogada para `PUBLIC`, `anon` e `authenticated`. Migration `20260925180000_initial_commercial_schema.sql`. |
| `private.handle_new_user()` | Trigger function que cria `profiles` após inserção em `auth.users`. | `SECURITY DEFINER`, `SET search_path = ''`; execução direta revogada para `PUBLIC`, `anon` e `authenticated`; chamada pelo trigger. Mesma migration inicial. |
| `private.start_casillas_trial()` | Exige `auth.uid()`, localiza produto Casillas ativo e insere trial com 30 dias. A restrição de usuário/produto leva a conflito: a função preserva um trial ainda vigente e marca expirado quando `ends_at` já passou; não renova `ends_at` nessa ramificação. | `SECURITY DEFINER`, `SET search_path = ''`; a migration revoga EXECUTE de `PUBLIC`, `anon` e `authenticated` e concede a `authenticated`, para uso pelo wrapper. Migration `20260926024716_create_trial_function.sql`. |
| `public.start_casillas_trial()` | Wrapper SQL que chama a função privada e retorna `public.trials`. | `SECURITY INVOKER`, `SET search_path = ''`; EXECUTE revogado de `PUBLIC` e `anon`, concedido a `authenticated`. Migration `20260926025046_expose_start_casillas_trial.sql`. |
| `private.activate_casillas_license(text)` | Valida e ativa licença, cria entitlement e registra evento de ativação; migration local contém o ajuste para ignorar entitlements não válidos no bloqueio de nova ativação. | `SECURITY DEFINER`, `SET search_path = ''`; migration revoga EXECUTE de `PUBLIC`, `anon` e `authenticated`, concedendo a `authenticated`. Migration `20260928160324_fix_activate_casillas_license_entitlement_check.sql`. Revalidar remoto antes de tratar grants como estado atual. |

`get_casillas_entitlement()` é chamado pelo cliente e foi informado como existente remotamente, mas sua definição não foi localizada nas migrations locais. Não inferir linguagem, SECURITY mode, search path ou grants remotos a partir desta documentação.

## RLS e acesso nas migrations locais

A migration `20260925180000_initial_commercial_schema.sql` habilita RLS em `products`, `profiles`, `trials`, `licenses`, `entitlements`, `access_events` e `admin_roles`. Ela revoga grants diretos de `anon` e `authenticated` nas tabelas e reabre somente os acessos necessários: leitura de produtos ativos; leitura e atualização das colunas `full_name`/`locale` do próprio perfil; leitura do próprio trial. As outras tabelas não recebem grants diretos para esses papéis nessa migration. Isso descreve a base local; conferir migrations posteriores e estado remoto antes de depender operacionalmente desses controles.

## Histórico de testes

Documentação anterior registra teste de RLS, 17 asserções aprovadas, login, trigger/perfil, RPC de início de trial e leitura autenticada. O resumo técnico atual da cobertura está em `docs/TESTES.md`. Esses resultados são históricos; não foram repetidos nesta atualização.