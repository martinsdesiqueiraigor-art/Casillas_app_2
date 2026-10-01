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
| `public.activate_casillas_license(text)` | Sim | Não | Schema drift conhecido: wrapper remoto sem definição correspondente nas migrations atuais. Não foi encontrada evidência do wrapper no histórico pesquisável deste repositório; isso não prova ausência em todo repositório ou histórico externo. |

A investigação remota informou que o wrapper público de ativação é `SECURITY INVOKER`, `VOLATILE`, executável por `authenticated` e `service_role`, sem execução concedida a `anon` ou `PUBLIC`. A migration local versiona apenas a função privada; o cliente chama `supabase.rpc('activate_casillas_license')`, nome público. A sequência remota documentada é wrapper público → implementação privada → entitlement; após a resposta, o cliente consulta entitlement novamente.

Esta divergência de rastreabilidade, por si só, não significa que a função remota esteja quebrada, que a autorização seja local ou que exista bypass. Ela não é classificada aqui como vulnerabilidade confirmada. Nenhuma migration será criada nesta etapa; eventual versionamento do wrapper é uma decisão técnica futura e trabalho separado.
