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
# Hardening — sprint 2026-09-29

Branch `casillas-2.0-hardening`, baseada no commit `629ebe3bd8ae8e7d36ad7a7c00a46868d1f8f898`. Este registro cobre apenas as mudanças e verificações deste sprint; não substitui a auditoria histórica nem modifica os dez documentos Markdown preexistentes.

## Correção local

**Problema:** `checkTrialStatus()` tratava erro ao validar a identidade ou consultar `get_casillas_entitlement()` como se não houvesse entitlement. Em seguida chamava `start_casillas_trial()`; uma resposta de trial ativo podia liberar a interface apesar da falha na verificação comercial anterior.

**Correção:** resultados com `reason` de autenticação/consulta agora bloqueiam a inicialização e não chamam a RPC de trial. A consulta de trial continua para uma resposta válida sem entitlement, preservando o fluxo comercial previsto.

**Teste:** `tests/trial-access.test.mjs` usa mocks locais do cliente Supabase para cobrir erro de sessão, erro de entitlement, ausência de entitlement com trial ativo e entitlement válido. Não faz chamadas de rede.

## Supabase remoto — consultas somente leitura

Foram consultados metadados de funções, políticas/RLS, grants efetivos selecionados e Security Advisor do projeto `maayjshlsxvxtrgjpcep`. Nenhuma mutação ou SQL de escrita foi executado.

- A consulta confirmou remotamente as funções privadas/públicas de entitlement e trial, a implementação privada de ativação e o wrapper público `public.activate_casillas_license(text)`. O wrapper público de ativação é `SECURITY INVOKER` (não `SECURITY DEFINER`), `VOLATILE`, executável por `authenticated` e `service_role`, não por `anon` nem `PUBLIC`. Continua ausente das migrations locais: schema drift conhecido, sem migration criada neste sprint.
- As sete tabelas comerciais consultadas têm RLS habilitado. `products` permite leitura de produto ativo; `profiles` e `trials` têm políticas de leitura própria; `profiles` também tem policy de atualização própria. `licenses`, `entitlements`, `access_events` e `admin_roles` não tinham policies, mas os grants diretos de SELECT/INSERT para `anon` e `authenticated` estavam ausentes na consulta. O Security Advisor classificou RLS habilitado sem policies nessas quatro tabelas como INFO.
- O Security Advisor também reportou `public.rls_auto_enable()` como função `SECURITY DEFINER` executável por `anon` e `authenticated`, e proteção contra senhas vazadas desativada. A inspeção read-only mostrou que a função retorna `event_trigger` e está associada ao event trigger `ensure_rls` para `ddl_command_end`. O aviso requer revisão específica; não foi demonstrado que seja chamável como RPC comum nem classificado aqui como exploração confirmada. A configuração de Auth não foi alterada.

As observações remotas são snapshots das consultas deste sprint; não garantem que a configuração permaneça igual após esta data.

## PWA, publicação e limites

- O Service Worker intercepta somente GET same-origin. Chamadas Supabase usam outra origem e não entram no cache local; o site GitHub Pages serve HTML estático, sem resposta HTML personalizada por usuário. Não foi encontrada evidência de cache de resposta comercial autenticada. Nenhuma alteração no Service Worker foi necessária; os recursos de cálculo pré-cacheados permanecem intactos.
- `.github/workflows/static.yml` publica o diretório inteiro (`path: '.'`), incluindo arquivos além da aplicação. A auditoria já registrava esse comportamento. Nenhum filtro de artefato foi introduzido porque excluir a ferramenta legada e estruturar um artefato dedicado exigiria alterar o deploy e o pré-cache, com dependências e validação PWA próprias.
- O gate da aplicação é executado em JavaScript público. Um usuário pode modificar o cliente ou carregar módulos estáticos sem obter entitlement do backend; os cálculos locais não fazem chamadas comerciais protegidas. Impedir uso não autorizado desses cálculos sem conexão conflita com seu caráter offline e exigiria decisão de produto/arquitetura. Esta correção fecha o fallback local diante de erro, mas não transforma código cliente em enforcement comercial inviolável.
- `onAuthStateChange` é exposto por `js/auth.js`, mas não é assinado pelo app atual. O app valida `getUser()` na inicialização; perda de sessão durante uma tela já aberta não foi alterada, pois determinar o comportamento dessa tela offline exige uma política explícita.

## Itens não alterados neste sprint

- Nenhuma migration, RLS ou função remota foi alterada. Eventos de início de trial e validação de entitlement dentro da RPC de trial dependem de mudança de banco e permanecem fora do sprint sem migration autorizada.
- O fluxo de redefinição de senha, publicação, `gerar-codigo.html`, sessão offline e a decisão sobre enforcement das calculadoras não foram modificados.
- O teste manual `teste-auth.mjs` e os testes SQL não foram executados: o primeiro autentica contra o projeto real e os segundos requerem ambiente de banco. Não foi executado teste de navegador/deploy.

## Sprint 2 — investigação e consolidação

Branch `casillas-2.0-hardening`; HEAD mantido em `629ebe3bd8ae8e7d36ad7a7c00a46868d1f8f898`. O estado preexistente dos dez documentos Markdown listados na solicitação foi preservado.

### `public.rls_auto_enable()` e `ensure_rls`

Consultas somente leitura aos catálogos do PostgreSQL retornaram:

| Propriedade | Evidência observada |
| --- | --- |
| Owner | `postgres` |
| SECURITY DEFINER | Sim |
| `search_path` | `pg_catalog` fixo |
| Linguagem / volatility | `plpgsql` / `VOLATILE` |
| Argumentos / retorno | nenhum / `event_trigger` |
| ACL EXECUTE | `PUBLIC`, `anon`, `authenticated`, `service_role` e `postgres` |
| Event trigger | `ensure_rls`, `ddl_command_end`, habilitado, owner `postgres` |
| Tags | `CREATE TABLE`, `CREATE TABLE AS`, `SELECT INTO` |
| Dependência | `ensure_rls` referencia esta função; nenhuma outra dependência catalogada foi encontrada |

A definição percorre os comandos DDL reportados por `pg_event_trigger_ddl_commands()`, aceita apenas tabelas/tabelas particionadas no schema `public` e executa `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` usando a identidade do objeto fornecida pelo catálogo. Não recebe dados do cliente, não altera policies/grants nem concede acesso. Erros ao habilitar RLS são capturados e registrados em log; o event trigger continua. Portanto, o nome “auto enable” não garante por si só sucesso em todos os contextos: o DDL pode criar uma tabela sem RLS se o `ALTER TABLE` falhar.

`anon` e `authenticated` não têm privilégio `CREATE` no schema `public` nem `CREATE` no database, conforme `has_schema_privilege`/`has_database_privilege`; essas verificações incluem privilégios herdados. A função não tem argumentos e o tipo especial `event_trigger` é sinal para invocação pelo mecanismo de event trigger. A documentação do PostgreSQL descreve esse tipo como exclusivo para a execução como event trigger. [Documentação PostgreSQL sobre event triggers](https://www.postgresql.org/docs/current/event-trigger-definition.html), [funções de trigger PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql-trigger.html).

**RPC:** o catálogo comprova ACL permissiva e existência em `public`, mas isso sozinho não comprova que o projeto exponha uma rota RPC utilizável. A lista de schemas expostos é configuração do Data API e não foi recuperada nesta consulta; não foi feita chamada POST ao endpoint. Mesmo que apareça na introspecção da API, não há caminho SQL comum demonstrado para executar o corpo: a função depende do contexto de event trigger. PostgreSQL documenta que `CREATE EVENT TRIGGER` é restrito a superusuários. Não foi executada chamada experimental remota.

**Alcance e explorabilidade:** no estado consultado não foi identificado caminho de abuso por `anon`/`authenticated`: esses papéis não podem criar os objetos que acionam o trigger e não possuem privilégio de alterar as tabelas comerciais. No contexto de DDL privilegiado, o efeito é habilitar RLS na tabela recém-criada sob `public`; não há alteração arbitrária de objetos nem caminho direto para conceder entitlement, modificar licença ou ler dados comerciais. A função roda como `postgres`, mas não como `SUPERUSER` no catálogo consultado; o `ALTER TABLE` ainda depende dos privilégios efetivos desse owner sobre a tabela. A exceção interna suprime falha de RLS e deixa um evento de log, ponto a considerar ao validar DDL administrativo.

**Classificação: B — configuração desnecessária, sem exploração identificada.** O mecanismo ligado ao event trigger parece administrativo/legítimo, mas `EXECUTE` concedido a `PUBLIC`, `anon`, `authenticated` e `service_role` não é necessário para esses papéis e amplia a superfície de introspecção. A rota RPC e a resposta exata do gateway permanecem **inconclusivas**, sem evidência de execução. A correção conceitual futura é restringir `EXECUTE` aos papéis administrativos que precisam administrar/recriar o trigger, preservando o owner e validando o fluxo de migrações/event trigger. Nenhuma correção remota ou migration foi feita.

### RLS e tabelas comerciais

Snapshot remoto: owner `postgres`, RLS habilitado e `FORCE ROW LEVEL SECURITY` desabilitado nas quatro tabelas. Não havia policies. `anon`/`authenticated` não tinham privilégios diretos consultados; `service_role` tinha privilégios diretos e `BYPASSRLS`, portanto sua chave precisa permanecer exclusivamente server-side.

| Tabela | RLS | Policies | Acesso direto anon/auth | Acesso via função observado | Risco / classificação |
| --- | --- | --- | --- | --- | --- |
| `licenses` | Sim | Nenhuma | Nenhum | `private.activate_casillas_license`, limitada a usuário autenticado, hash do código, licença disponível e bloqueio de linha | **ACESSO INDIRETO CONTROLADO** |
| `entitlements` | Sim | Nenhuma | Nenhum | leitura própria via `private.get_casillas_entitlement`; gravação durante ativação privada | **ACESSO INDIRETO CONTROLADO** |
| `access_events` | Sim | Nenhuma | Nenhum | inserção do evento de ativação pela função privada | **ACESSO INDIRETO CONTROLADO** |
| `admin_roles` | Sim | Nenhuma | Nenhum | nenhuma função SECURITY DEFINER consultada acessava esta tabela | **SEGURA NO MODELO ATUAL**; funcionalidade administrativa não observada |

Foram inspecionadas as funções SECURITY DEFINER atuais em `public`/`private`. As funções comerciais privadas relevantes usam `search_path` vazio; os wrappers públicos delegam para elas. `get_casillas_entitlement` restringe a leitura por `auth.uid()`, estado ativo, revogação, produto Casillas ativo e validade. A função privada de ativação exige `auth.uid()`, normaliza/hash o código, seleciona licença `AVAILABLE` com `FOR UPDATE`, e grava licença, entitlement e evento. `start_casillas_trial` exige usuário autenticado e faz upsert por usuário/produto; trial expirado não vira ativo. Não encontrei por essas verificações uma leitura/escrita direta não autorizada pelas roles cliente.

### Auth, sessão e fluxo comercial

`getCurrentUser()` chama `supabase.auth.getUser()` no boot de `app.js`; erro ou ausência de usuário encaminha a `auth.html`. Depois o app chama `checkTrialStatus()` antes de carregar o módulo inicial. Essa função valida novamente o usuário antes de consultar entitlement; em caso de ausência válida do entitlement consulta o trial, e erros/ausência/expiração do trial mantêm a tela de ativação. Entitlement com `valid_until` expirado não libera entitlement e segue para verificação do trial.

`getSession()` não é chamado diretamente no código da aplicação. `onAuthStateChange()` é exportado em `auth.js`, mas não há assinatura do app. Assim, logout/expiração após o boot não causa reação imediata observada nesta camada; não foi implementada política de sessão offline, sincronização ou logout automático. `getUser()` é a verificação de identidade remota no fluxo normal; erro nela não é convertido em trial.

Na ativação, o handler valida novamente o usuário, envia o código a `public.activate_casillas_license`, exige objeto de resposta e `license_id`, então consulta entitlement de novo. Só após entitlement válido esconde a tela e emite `casillas:activated`. Erro de RPC, resposta sem `license_id` ou entitlement ausente/erro não libera a interface. O código é enviado diretamente ao backend e não é salvo localmente neste fluxo.

### Estado local

`KEYS.install`, `KEYS.lastSeen`, `KEYS.activated` e `KEYS.activeCode` são apenas declaradas no `trial.js`; buscas por uso fora da declaração não encontraram leitura nem escrita. Classificação das quatro: **SEM USO/legado**, sem autoridade de autorização observada. Nenhuma remoção foi feita.

`js/db.js` usa IndexedDB para `config`, `historico` e `cache`; `js/state.js` persiste módulo atual e dados locais de cálculo. Nenhum desses valores alimenta a decisão comercial. Não foi encontrado uso de `sessionStorage` ou `document.cookie` na aplicação própria. O cliente Supabase usa persistência padrão de sessão no navegador; essa sessão é credencial de Auth e não substitui a decisão de entitlement no servidor. Não foi encontrado uso de cookie próprio como grant comercial.

### Deploy, segredo e Service Worker

O workflow dispara em push para `casillas-2.0` ou manualmente e configura `actions/upload-pages-artifact@v3` com `path: '.'`. A implementação v3 empacota `.` usando `tar`, excluindo explicitamente apenas `.git` e `.github`; portanto, ao contrário do comportamento de versões mais novas, dotfiles como `.gitignore` e `supabase/.gitignore` também entram no artefato. [Workflow local](../.github/workflows/static.yml), [implementação v3 da action](https://github.com/actions/upload-pages-artifact/blob/v3/action.yml). Isso inclui documentos, migrations SQL, fontes, testes versionados, configuração Supabase e `gerar-codigo.html`, além dos arquivos do site. Na árvore Git consultada não há `.env`, arquivo de chave, página debug/teste ou backup versionado; arquivos locais ignorados não fazem parte de um checkout limpo do workflow.

O scan textual não encontrou chave `service_role`, chave privada, token de provedor ou credencial com formato conhecido nos arquivos de origem inspecionados. `js/supabase.bundle.js` contém a URL do projeto e uma publishable key, destinada ao cliente; não é service-role. Não foram exibidos valores secretos. `gerar-codigo.html` é uma ferramenta antiga pública que gera localmente códigos/hash e instrui a inclusão de hashes em `trial.js`; não acessa o Supabase nem cria licenças no backend. O texto operacional está obsoleto, mas não constitui, por si, bypass ou segredo. Trata-se de superfície pública conhecida, cuja remoção/quarentena depende de decisão de publicação separada.

O Service Worker segue o mesmo comportamento anteriormente revisado: somente GET same-origin; navegação network-first com cópia do HTML estático, recursos cache-first e fallback offline; chamadas Supabase usam outra origem. A lista de pré-cache inclui ferramentas estáticas como `gerar-codigo.html`. Não foi identificado cache de resposta comercial Supabase nem evidência nova que justifique alterar o worker.

### Injeção client-side

Busca direcionada por `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `document.write`, `eval` e `new Function`: `innerHTML` aparece nos ícones SVG gerados por funções constantes em `icons.js`/`menu.js`/`app.js`, e no aviso de `modules/rosca.js`. Nesse aviso, HTML adicional é constante e números são formatados a partir da tabela numérica e da entrada convertida em número; não há interpolação de texto Supabase, URL, código de licença ou mensagem externa. Não foi identificado XSS concreto nesses sinks. Não houve reescrita geral.

### Testes e validação do Sprint 2

O arquivo existente `tests/trial-access.test.mjs` foi preservado e ampliado com testes locais usando mocks: usuário ausente, entitlement expirado, trial expirado/erro, ativação sem `license_id`, ativação com erro, revalidação de entitlement válida e inválida. Nenhum teste unitário chama o projeto remoto. `node --test tests/*.mjs`: **12 aprovados, 0 falhos**. Verificações `node --check` para `js/app.js`, `js/auth.js`, `js/trial.js` e arquivos `tests/*.mjs` passaram. `git diff --check` e `git diff --cached --check` passaram; Git emitiu apenas avisos de conversão LF/CRLF em arquivos modificados.

### Limites, pendências e ações proibidas respeitadas

**Corrigir em sprint futuro:** remover/restringir ACL EXECUTE desnecessária de `rls_auto_enable()` após validar a configuração do Data API e o processo administrativo de DDL; decidir se `gerar-codigo.html` deve sair do artefato público e atualizar as instruções obsoletas; avaliar listener de sessão e política offline; versionar o wrapper `public.activate_casillas_license` se a reconciliação local/remota confirmar que ele ainda está ausente no conjunto completo de migrations.

**Não é vulnerabilidade confirmada:** RLS ligado sem policy nas quatro tabelas, no snapshot de grants consultado, não dá acesso ao cliente sem privilégios; não foi encontrada exploração de `rls_auto_enable`; a publishable key é pública por projeto.

**Inconclusivo:** exposição/registro exato da função especial no schema cache e rota PostgREST do projeto; isto requer consulta de configuração/API que não foi feita. O scan não substitui varredura especializada de segredos nem análise do artefato efetivamente baixado.

Não houve Supabase write, SQL de escrita, mudança de Auth/RLS/functions/grants/triggers/dados, migration, commit, push, reset, restore, clean, stash, rebase ou merge. Os dez documentos preexistentes foram preservados.
