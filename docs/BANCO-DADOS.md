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

## 06/10/2026 - EV2-03/04: candidato local de validade e revogação

Fonte: release 8c56306054db0cf13b53481890022edfa01aeda4 mais o diff local desta missão; não aplicado remotamente.

A migration nova `20261006020648_enforce_commercial_validity_and_license_revocation.sql` preserva migrations históricas, assinaturas dos wrappers, RLS, grants existentes e o índice único de uma linha ACTIVE por usuário/produto.

- `private.get_casillas_entitlement()`: acesso somente em `[valid_from, valid_until)`; fim NULL é ilimitado, sem dispensar o início. Para origem LICENSE, exige também licença ACTIVE, não revogada, da mesma conta/produto.
- Dependência explícita: `source = 'LICENSE'` e `license_id` apontando à licença. GRANT, PROMOTION e ADMIN são origens independentes. Não foi adicionado relacionamento ou coluna.
- O trigger de revogação em licenses atualiza apenas dependentes LICENSE/mesmo license_id, incluindo futuros/expirados, para REVOKED com o timestamp da licença. Registra LICENSE_REVOKED com IDs dos dependentes e identidade auth.uid() do ator quando disponível. Falha na atualização/auditoria aborta a operação inteira; não cria trial.
- O trigger de escrita em entitlements impede dependente ACTIVE sem licença ACTIVE da mesma conta/produto. FOR SHARE na licença serializa essa escrita com sua revogação. Funções dos triggers são privadas, SECURITY DEFINER, search_path vazio, sem EXECUTE para PUBLIC, anon, authenticated ou service_role.
- A migration reconcilia e audita dependentes ACTIVE de licenças já REVOKED. Uma futura aplicação remota exige revisão própria de dados e plano; não foi executada aqui.
- `private.activate_casillas_license(text)`: verifica vigência real. Uma linha ACTIVE fora da vigência ou sem backing válido ainda reserva o índice; rejeita antes de tocar no código, com erro específico, sem revogar/substituir grants independentes. A ativação não é aceita nesse caso. Permitir coexistência/substituição exigiria decisão separada sobre o índice e as regras comerciais.
- `private.start_casillas_trial()`: não cria trial novo para conta/produto com licença revogada. Trials preexistentes seguem sua própria validade, sem reinício/extensão. Trial futuro não é devolvido como acesso vigente.
- Frontend inalterado: recebe as mesmas assinaturas; ausência de entitlement e erro de trial continuam bloqueando acesso. Revalidação durante sessão/offline pertence a EV2-02, fora do escopo.

Testes locais: novo pgTAP 48/48; setup 12/12; profiles 16/16; frontend trial-access 12/12. Fixtures sintéticas com rollback, exclusivamente no stack descartável. Detalhes e incidentes de validação em PROGRESSO.md.

Teste de aplicação sobre estado anterior: node tests/ev2-migration.test.mjs cria outro banco LOCAL descartável com as dez migrations históricas e fixtures sintéticas; aplica a nova migration pela CLI e verifica reconciliação, auditoria, grant independente, ausência de acesso dependente e ausência de trial. 8/8 PASS; cleanup PASS. Nenhuma preparação manual de produto ou escrita remota.

## 06/10/2026 - Ajuste final local EV2-03/04: decisões D1-D3

Este registro substitui a interpretação anterior de trial preexistente como fallback independente após revogação. Ainda somente candidato local, sem aplicação remota.

- D3: trigger BEFORE UPDATE OF status, revoked_at torna REVOKED terminal: rejeita saída para qualquer estado e qualquer alteração de revoked_at após a primeira revogação. Atua também em UPDATE comum por service_role. Primeira revogação e UPDATE sem alteração real continuam permitidos; não duplicam auditoria.
- D1: private.start_casillas_trial() rejeita com "Licenca revogada impede acesso por trial" se existir licença REVOKED para a mesma conta/produto, mesmo havendo trial antigo válido. A guarda precede qualquer escrita no trial; preserva todo seu registro histórico. Sem revogação, trial segue funcionando normalmente. Direitos comerciais válidos continuam pelo getter: nova licença ou GRANT/PROMOTION/ADMIN autorizado, sem ressuscitar a licença anterior.
- D2: source permanece NOT NULL, com as quatro origens reais do schema. CHECK entitlements_source_license_consistency impõe (source = 'LICENSE') = (license_id IS NOT NULL), preservando a FK existente. Precheck conta combinações inconsistentes e aborta com SQLSTATE 23514/erro explícito antes de alterar dados. Não infere source ou vínculo.
- A reconciliação anterior de dependentes LICENSE ACTIVE ligados a licença REVOKED continua atômica e auditada. Não modifica direitos independentes.
- Frontend e assinaturas públicas permanecem iguais: o cliente já bloqueia em erro do RPC de trial.

Validação direcionada: pgTAP EV2 54/54; setup obrigatório do harness 12/12, total 66 PASS. Forward-migration 13/13 (inclui duas inconsistências legadas, rollback de dados/DDL/histórico e aplicação válida das 11 migrations). Cleanup PASS. Profiles/frontend/Gate/Pages não repetidos.

## 06/10/2026 - EV2-06 V1: ativação com cota autoritativa

Nova migration: 20261006043029_rate_limit_commercial_activation.sql. Candidato da hardening; NÃO aplicada ao Supabase remoto nesta missão.

- Escopo: auth.uid() + UUID do produto ativo com slug casillas, obtido no servidor. Nenhuma RPC aceita product_id/slug fornecido pelo cliente.
- Cotas móveis: 5 tentativas admitidas em 5 minutos e 20 em 24 horas. Limite superior é inclusivo para a quantidade: quinta/vigésima admitidas; sexta/vigésima primeira bloqueadas. Timestamp exatamente no início da janela já expirou. Relógio clock_timestamp() capturado após o lock da conta/produto.
- private.activation_attempt_windows mantém no máximo 20 timestamps por conta/produto. PK serializa por linha; INSERT ON CONFLICT e SELECT FOR UPDATE cobrem inclusive a primeira chamada concorrente. Timestamps antigos são removidos na próxima admissão; nenhuma chave/hash/IP é registrado. Contas sem novas chamadas podem conservar sua última linha; limpeza periódica não integra V1.
- Admissão precede validação do input e qualquer consulta de licença. Recusas comerciais, sintaxe inválida, vazio, NULL e oversized preservam a tentativa na transação HTTP normal. Chamadas já bloqueadas não acrescentam tentativa.
- Input: até 128 bytes UTF-8 brutos; depois trim/remoção histórica de espaços e hífens/uppercase, 1-64 caracteres ASCII alfanuméricos. Digest ocorre somente após esses checks e a recusa de reserva comercial ACTIVE.
- RPC nova public.activate_casillas_license_v2(text): JSON com result SUCCESS, INVALID_REQUEST, ACTIVATION_DENIED ou RATE_LIMITED. SUCCESS traz license_id/entitlement_id/product_slug/activated_at; RATE_LIMITED traz retry_after_seconds inteiro. Demais falhas normais não identificam existência/estado da chave.
- public.activate_casillas_license(text) e private.activate_casillas_license(text) mantêm assinatura e quatro colunas de sucesso; recusas normais retornam zero linhas. Cliente legado bloqueia sem license_id, com mensagem genérica aceita pela Coordenação. Nenhum núcleo de ativação sem limiter permanece exposto.
- A RPC pública nova é SECURITY INVOKER. private.activate_casillas_license_v2 é SECURITY DEFINER/search_path vazio e recebe EXECUTE authenticated somente para permitir o wrapper invoker; essa função também aplica todo o limiter. Helpers de admissão/tempo não têm EXECUTE para PUBLIC/anon/authenticated/service_role; tabela privada sem grants dessas roles, RLS habilitada e nenhuma policy pública.
- Escritas comerciais estão em subtransação: só a violação identificada do índice entitlements_one_active_per_user_product vira recusa normal, preservando admissão e desfazendo consumo. Outros erros de integridade/infraestrutura propagam e provocam rollback técnico; não são mascarados.
- PostgREST: usar POST normal com resposta JSON. Prefer tx=rollback, max-affected e Accept singular são recusados antes de admissão/hash/consulta comercial, pois o transporte pode desfazer a transação. Não são tentativas comerciais admitidas e nunca testam uma chave. GET de função VOLATILE não ativa. O gate remoto futuro deve verificar commit normal das RPCs e ausência de endpoints alternativos que executem SQL privilegiado; SQL direto privilegiado/rollback arbitrário não é a superfície de cliente suportada.
- js/trial.js usa V2, reconhece as quatro classes e exige SUCCESS + license_id + nova confirmação do getter. Falha nunca cria autorização offline. Trial, getter, D1-D3, RLS comercial, índice único, quantidade de dispositivos e Service Worker não foram alterados.
- Ordem operacional futura: aplicar a migration sob autorização própria ANTES de publicar o frontend V2. Sem RPC nova disponível, o cliente falha fechado; não tentar fallback ilimitado para RPC antiga.
- Riscos residuais: múltiplas contas, abuso distribuído e infraestrutura/HTTP antes da RPC exigem controles próprios; não são substituídos por Auth rate limits. Erro técnico real pode desfazer admissão. V1 não altera esses limites de confiança nem implementa EV2-02.

Validação local: frontend 16/16; pgTAP 40 limiter + 54 EV2 + 12 setup = 106/106; 52 checks de integração HTTP/concorrência/cleanup, incluindo cinco admissões em doze chamadas paralelas, rotas legadas, anti-enumeração, transporte de rollback e falha técnica. Stack descartável com 12 migrations, PostgreSQL 17.6, Supabase CLI 2.118.0 e PostgREST 16.3. Profiles/Production Gate/Pages não foram repetidos manualmente.

## 06/10/2026 — EV2-02: contrato V2 de acesso e lease offline

Migration nova: 20261006055325_add_casillas_access_v2_offline_lease.sql, somente candidata local/versionada; não aplicada remotamente nesta missão.

public.get_casillas_access_v2() retorna JSONB: contract_version=2, user_id derivado de auth.uid(), product=casillas canônico ativo, validated_at=statement_timestamp(), has_access, state (VALID/NO_ACCESS/EXPIRED/REVOKED), source e valid_until. LICENSE/GRANT/PROMOTION/ADMIN reutilizam private.get_casillas_entitlement(); trial reutiliza private.start_casillas_trial(), com ends_at como limite. A fachada online pode iniciar o primeiro trial conforme a política já existente; não é uma RPC puramente de leitura. Frontend offline nunca a chama.

Assinaturas/corpos históricos preservados. D1 é conferida antes do caminho trial; direito independente válido é considerado antes da negativa por revogação histórica. Não amplia D2/D3/EV2-06. Fachada pública SECURITY INVOKER, privada SECURITY DEFINER, search_path vazio, objetos qualificados. EXECUTE somente authenticated (inclusive delegação privada necessária ao invoker); sem PUBLIC/anon/service_role. Relógio do navegador não define validated_at.

Lease local versão 1: formatVersion, user_id, product, source, validated_at, valid_until, leaseExpiresAt, localValidatedAt, maxObservedLocalTime. Expiração derivada do servidor e revalidada estruturalmente a cada uso. Marcador de tempo global separado preserva high-water entre reinícios/logout; não contém segredo. Dados são modificáveis pelo cliente, não prova criptográfica.

Estado anterior, conforme handoff aprovado da Coordenação: EV2-07 fechado, EV2-03/04/06 aplicados remotamente, doze migrations canônicas até 20261006043029; release homologada 55f1fed8265bcfee6d60e7ca6a7e91dbc6972f7c. Evidências brutas EV2-07 preservadas fora do repo em C:\Backups\Casillas\2026-10-06-ev207-repair-ev20304\; não publicar JSON brutos.
