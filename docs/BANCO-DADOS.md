# Supabase e banco de dados

Fonte: migrations locais em `supabase/migrations/` na referência `629ebe3`, branch `casillas-2.0`. Não houve consulta nem escrita no Supabase nesta revisão; a documentação descreve schema versionado, não garante implantação remota.

## Entidades

| Tabela | Função definida no schema |
|---|---|
| `products` | Produtos e indicador `is_active`, incluindo slug `casillas`. |
| `profiles` | Perfil relacionado a `auth.users`; criado por trigger. |
| `trials` | Trial por usuário/produto, com estado e datas. |
| `licenses` | Licenças, hash do código, estado e identidade/data de ativação. |
| `entitlements` | Direito comercial por usuário/produto, fonte, estado e validade. |
| `access_events` | Eventos de acesso/ativação. |
| `admin_roles` | Papéis administrativos. |

## RPCs comerciais

- `private.get_casillas_entitlement()` é `SECURITY DEFINER`, `search_path = ''`; retorna linha de entitlement `ACTIVE`, não revogado, ainda válido, para usuário autenticado e produto ativo `casillas`; sem correspondência, a consulta retorna zero linhas. A migration de 29/09/2026 cria também wrapper `public.get_casillas_entitlement()` como `SECURITY INVOKER`.
- `private.start_casillas_trial()` exige `auth.uid()`, busca produto ativo e cria trial de 30 dias. Em conflito por usuário/produto, mantém o trial ainda vigente; trial vencido torna-se `EXPIRED`, sem reiniciar prazo. O wrapper `public.start_casillas_trial()` chama a função privada.
- `private.activate_casillas_license(text)` exige usuário autenticado, normaliza o código e compara hash SHA-256; bloqueia código indisponível, ativa a licença, cria entitlement sem `valid_until` e registra `LICENSE_ACTIVATED`. A migration local concede execução ao papel `authenticated`.

Grants, modos de segurança e corpos acima são os registrados localmente. A confirmação do estado remoto exige revisão independente, somente leitura e com ambiente identificado.

## RLS e grants versionados

A migration inicial habilita RLS nas sete tabelas. Ela dá leitura de produtos ativos a `anon` e `authenticated`; ao usuário autenticado, leitura do próprio perfil e atualização restrita a `full_name` e `locale`; leitura do próprio trial. A migration revoga acesso direto de `anon` e `authenticated` às tabelas de licenças, entitlements, eventos e papéis administrativos. Confira todas as migrations posteriores antes de atribuir isso ao estado remoto atual.

## Auth e acesso

Supabase Auth fornece `auth.uid()`. O cliente chama entitlement antes de trial. A ativação por RPC retorna a licença processada; o cliente refaz a consulta de entitlement antes de apresentar acesso. A licença comercial do produto é sem limite de aparelhos; a associação é por usuário/conta, não por dispositivo.

## Rastreabilidade e pendências

`20260929042401_add_get_casillas_entitlement.sql` é uma migration retroativa que recupera e versiona a função de entitlement, antes ausente do histórico local. A pendência de “versionar essa função” que aparece em alguns documentos e marcos antigos foi superada por esse commit; preservar nos registros históricos, mas não repetir como pendência atual. Continua pendente verificar que migrations e grants locais correspondem ao ambiente implantado. Não se executou RPC nem se alterou schema ou dado nesta tarefa.

## Matriz de funções: remoto e migrations locais

O estado remoto abaixo reflete a investigação Supabase mais recente fornecida para esta atualização. A coluna local é conferida contra as migrations versionadas na branch.

| Função | Existe remotamente | Versionada localmente | Estado |
|---|---:|---:|---|
| `private.get_casillas_entitlement()` | Sim | Sim | Versionada em `20260929042401_add_get_casillas_entitlement.sql`. |
| `public.get_casillas_entitlement()` | Sim | Sim | Wrapper versionado na mesma migration. |
| `private.activate_casillas_license(text)` | Sim | Sim | Implementação privada em `20260928160324_fix_activate_casillas_license_entitlement_check.sql`. |
| `public.activate_casillas_license(text)` | Sim | Sim | Wrapper versionado em `20260930213346_add_public_activate_casillas_license_wrapper.sql`; chama a implementação privada. |

O wrapper público de ativação está versionado localmente com `search_path = ''`, execução revogada de `public`/`anon` e concedida a `authenticated` e `service_role`. O cliente chama `supabase.rpc('activate_casillas_license')`; a sequência documentada é wrapper público → implementação privada → entitlement, seguida de nova consulta do entitlement pelo cliente.

A antiga lacuna de rastreabilidade do wrapper foi encerrada pela migration `20260930213346_add_public_activate_casillas_license_wrapper.sql`. O drift histórico de timestamp permanece apenas como registro, não como divergência funcional atual.

## 05/10/2026 — BL-02: cadeia local reconciliada para revisão

A sequência local é wrapper 20260930213346 → pré-requisito 20261001023218_reconcile_rls_auto_enable_prerequisite.sql → hardening existente 20261001023219. Essa posição representa ordem lógica, não cronologia original comprovada. O reset local aplicou as dez migrations, sem preparação SQL manual.

A função não recebe argumentos, retorna event_trigger, usa plpgsql, VOLATILE, SECURITY DEFINER e search_path=pg_catalog. O trigger ensure_rls está habilitado em ddl_command_end para CREATE TABLE, CREATE TABLE AS e SELECT INTO, referenciando a função. No local, ambos pertencem a postgres.

O corpo habilita RLS apenas nas tabelas/tabelas particionadas elegíveis de public; não cria policies nem concede acesso. O tratamento histórico registra falhas e continua. O hardening seguinte produz ACL {postgres=X/postgres}, sem EXECUTE para PUBLIC, anon, authenticated ou service_role. Objetos existentes não são substituídos.

Origem e hash do snapshot estão em DECISOES.md. O DDL do trigger foi reconstruído de metadados; OIDs não são reproduzidos. O corpo instalado foi comparado ao snapshot. Nenhuma escrita remota ocorreu; histórico remoto e drift não reconciliados. BL-01 continua impedindo a validação completa da baseline. Resultados e comandos: PROGRESSO.md.

## 05/10/2026 — BL-01: harness de teste autocontido

O setup em `supabase/tests/000-setup-tests-hooks.sql` instala o schema `tests` e quatro funções exclusivamente no banco LOCAL durante a execução da suíte: `create_supabase_user`, `get_supabase_user`, `get_supabase_uid` e `authenticate_as`. Não são migrations nem dependências de produção. O reset remove esse harness; a suíte o recria antes de profiles. O schema não integra os schemas expostos pela API local.

As definições vêm de Basejump 0.0.6, arquivo `supabase_test_helpers--0.0.6.sql`, commit `828d744f8f7ca12750d27af1d9e011a8e29c1345`, blob `aeb85131a294bf29a851b36bb6790f86f01c0d43`: https://github.com/usebasejump/supabase-test-helpers/blob/828d744f8f7ca12750d27af1d9e011a8e29c1345/supabase_test_helpers--0.0.6.sql . As quatro definições foram conferidas contra a fonte, removendo somente espaços finais; licença MIT incluída no setup. Não se instala a extensão Basejump inteira: somente o subconjunto necessário está versionado.

Dependências utilizadas: pgTAP 1.3.3, uuid-ossp 1.1, schema auth e role authenticated do Supabase local. Sem download HTTP, pg_tle ou dbdev durante os testes. EXECUTE dos helpers é revogado de PUBLIC e concedido a authenticated; não há alteração de grants comerciais. Os getters e criação de fixture preservam SECURITY DEFINER da fonte; authenticate_as preserva SECURITY INVOKER e configura role/claims locais à transação. Fixtures, role e claims são revertidos pelo rollback dos testes.

O setup agora verifica schema, extensões, assinaturas e funcionamento de identidade/auth em 12 asserções. Profiles permanece byte a byte inalterado, com plano 16; total da suíte: 28. Duas reconstruções independentes aplicaram as dez migrations e recriaram o harness automaticamente, com PASS. BL-02 foi fechado no escopo local pela Coordenação; BL-01 está resolvido tecnicamente para revisão. Baseline LOCAL reproduzível recomendada como APROVÁVEL, referente ao HEAD mais estes diffs locais ainda não commitados. Evidências detalhadas em PROGRESSO.md; nenhuma escrita remota.
