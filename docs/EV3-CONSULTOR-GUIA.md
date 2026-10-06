# EV3 — Consultor Técnico e Guia CNC 2.0

Missão CAS21-EV3-01-R6, contrato técnico R1, exceção operacional R5.
Worktree: `C:\Projetos\Casillas_app_2_EV3`; branch: `feature/cas21-ev3-01`.
Base original: `55f1fed8265bcfee6d60e7ca6a7e91dbc6972f7c`.
Base após rebase: `8316232712e74798bc692ad5fb632fa1600a2c51`.
Destino de revisão: CAS21-EV3-CNC. Integração e publicação dependem da decisão posterior da Coordenação.

## Fluxo e contratos novos

Os componentes abaixo são delta EV3, não componentes preexistentes.
`ConsultorAgent` usa normalização local, regex e vocabulário do banco; nenhum serviço NLP externo.
`slotExtractor` produz controlador, máquina, operação e código. `resolver` consulta somente os registros reais:
código explícito com um candidato resolve; múltiplos candidatos exigem contexto; nenhum candidato produz no_match.
A FSM permite IDLE, FILLING_SLOTS, RESOLVING, PRESENTING e FEEDBACK, valida transições e mantém o UUID durante perguntas complementares.
Nova consulta independente recebe novo UUID.

O caso real `rosca torno fanuc` resolve `fanuc_torno_g76`.
O Result Card mantém um Map interno resultId → target; atributos DOM são apenas gatilhos.
ID desconhecido é rejeitado. O evento central `EVT.GUIDE_OPEN` carrega cycleId e, opcionalmente, tabId/accordionId.
O router codifica componentes e o GuiaManager valida ciclo/alias, aba, acordeão e default antes da navegação.
Alvo inválido volta à listagem com aviso controlado.

Deep link validado, após os gates normais de acesso:

`#/guia/fanuc_torno_g76?tab=referencia&acc=sintaxe`

`js/app.js` coopera com o carregador existente; identidade nova `consultor-tecnico`.
`consult` e `js/modules/consult.js` permanecem a Consultoria legada.
No rebase, o único conflito foi app.js: a versão upstream foi preservada e recebeu a integração EV3.
guardAccess, lease offline, lifecycle/revalidação, bloqueio do shell e invalidação por troca de usuário permanecem upstream.
O teste do app usa o contrato V2 atual e confirma navegação offline com lease válido sem RPC.

## Banco e renderização

A fonte é `dados/guia_cnc.json`, preservada. O banco canônico estático é congelado recursivamente.
A migração é exclusivamente estrutural, com paridade automatizada de título, categoria, tags, sintaxe,
nomes/descrições de parâmetros e exemplo. Nenhum conteúdo técnico foi corrigido ou inventado.

| Alias legado | ID canônico |
| --- | --- |
| fanuc-g76 | fanuc_torno_g76 |
| fanuc-g83 | fanuc_centro_de_usinagem_g83 |
| siemens-cycle97 | siemens_torno_cycle97 |
| siemens-cycle83 | siemens_centro_de_usinagem_cycle83 |

São quatro ciclos, zero ciclos novos. G71 e CYCLE95 continuam ausentes.
O modelo usa meta/contexto/abas, referência com sintaxe/parâmetros e exemplo derivado diretamente da fonte.
linhas_explicadas permanece vazio. visual_canvas é apenas um tipo arquitetural aceito com descrição real;
nenhum ciclo produzido possui essa aba ou imagens inventadas.
Renderers usam DOM/textContent. Nenhum valor de URL vira HTML; não há seletores interpolados com esses valores.
O adapter mantém a lista, filtros e cópia do Guia legado.

## Telemetria, RLS e sync

Migration nova: `20261006085942_ev3_telemetry.sql`. Nenhuma migration anterior foi reescrita.
`chat_interactions`: UUID client-side, user_id, timestamp servidor/client, slots JSONB com quatro chaves permitidas,
outcome, resolved_cycle_id nullable, result_count e schema_version=1. Nenhum texto bruto da pergunta.
Interação é enfileirada na resolução observável, mesmo sem feedback; slot filling intermediário não cria novas linhas.
Uma ambiguidade encerrada explicitamente pode ser registrada como resultado final.

`guide_feedback`: UUID client-side, user_id, interaction_id, cycle_id, helpful, timestamps e schema_version.
FK composta (interaction_id,user_id) → chat_interactions(id,user_id) impede referência a outro usuário.
Unique(user_id,interaction_id,cycle_id) impõe um feedback efetivo.
RLS habilitada nas duas tabelas, SELECT/INSERT próprios para authenticated; anon sem acesso.
INSERT usa grants de colunas que excluem created_at servidor; UPDATE/DELETE não concedidos.
access_events e contratos comerciais não foram modificados.

IndexedDB sobe de v1 para v2 com store outbox aditiva, preservando config/historico/cache.
Cada item possui id, type, ownerUserId, createdAt e payload. Ownership nasce no evento.
SyncQueue filtra pelo proprietário atual, verifica identidade antes do envio e antes de remover,
serializa flush concorrente e envia interação antes do feedback dependente.
Falhas de rede/autenticação/integridade mantêm eventos pendentes.
A → logout → B não envia nem apaga os eventos de A; A pode retomá-los.

UUID primário e constraints tornam retries seguros. Erro 23505 só é aceito como concluído após SELECT próprio
comprovando o mesmo ID e payload; timestamps client_created_at são comparados pelo instante,
pois PostgreSQL pode representar UTC de outra forma. Outros erros não são mascarados como sucesso.
O adaptador Supabase importa somente `js/supabase.bundle.js`, sem novo createClient/configuração/segredo.
Sessão local determina o filtro de ownership; RLS continua autoridade no servidor.

SUPABASE REMOTO NÃO ACESSADO/ALTERADO. Migration executada somente em bancos locais descartáveis.

## Offline e Service Worker

O banco e o domínio são locais; ausência de rede afeta somente sincronização.
Com acesso offline autorizado pelo gate existente, o app abre Consultor, resolve G76, apresenta card,
abre Guia e grava interação/feedback no IndexedDB sem Supabase disponível.
Sync é acionado na inicialização, em resolução/feedback e no retorno online; não há background sync ou timer novo.

Exceção R5: CACHE_VERSION casillas-v12 → casillas-v13; somente CACHE_ASSETS recebeu 17 arquivos runtime:

| Assets adicionados | Necessidade |
| --- | --- |
| core/eventBus.js, core/router.js | Contrato do evento e deep link |
| core/outboxStore.js, core/syncQueue.js | Persistência e envio posterior com ownership |
| core/supabaseClient.js | Adaptador do runtime oficial, disponível mesmo sem rede |
| modules/consultor/constants.js, ConsultorAgent.js | FSM e interação |
| modules/consultor/slotExtractor.js, resolver.js | NLP/resolução local |
| modules/consultor/resultCard.js, index.js, telemetry.js | UI, Map e gravação local |
| modules/guia/adapter.js, bancoCiclosCNC.js, deepFreeze.js | Banco local e compatibilidade |
| modules/guia/GuiaManager.js, renderers/blocks.js | Validação e conteúdo do alvo |

Todos são caminhos sob js/. Declarações .d.ts são apenas desenvolvimento e não são precacheadas.
O teste verifica existência de todos os caminhos listados, fechamento dos imports runtime e invariância
do restante do Service Worker. Fetch, estratégias, fallback, install/activate e lifecycle não foram redesenhados.

## Verificação

`npm ci` instala ferramentas somente para desenvolvimento; o PWA publicado usa os arquivos runtime existentes.
`npm run test:ev3` executa validador, 20 testes, checkJs e ESLint focalizados.
Cobertura: domínio/FSM/fixture ambígua, banco/paridade, E2E G76 real, Map, evento/rota/manager/renderer,
XSS textual, UI offline/IndexedDB, ownership A→B, ordem, rede/retry e app integrado.
`node --test tests/ev3/app.test.mjs`: 1/1.
`node tools/test-ev3-sql.mjs`: reconstrução start/reset/test/stop local isolada, 14 migrations e 167/167 pgTAP
(22 EV3, 145 baseline). CASILLAS_SUPABASE_CLI permite indicar o executável local.
Executar runners SQL sequencialmente para preservar os stacks de outras frentes.

Regressão R6:
- activation-rate-limit.test.mjs: 52/52 verificações de integração e 106/106 pgTAP.
- ev2-migration.test.mjs: 13/13 verificações e 66/66 pgTAP.
- production-gate.mjs validate: 63/63 frontend e 8/8 production gate; 76 executáveis com sintaxe válida.
- offline-access-db.test.mjs: 1/1 runner e 35/35 pgTAP.
- git diff --check: sem erros.

A CI preserva baseline/pgTAP/production gate e adiciona npm ci + test:ev3.
O pgTAP existente descobre automaticamente o arquivo EV3.
O teste upstream de infraestrutura usa a lista real de migrations; nenhuma contagem histórica foi corrigida no EV3.

DevDependencies exatas: TypeScript 5.9.3 (checkJs), ESLint 9.39.1 (no-undef/no-implicit-globals),
linkedom 0.18.12 (DOM em testes), fake-indexeddb 6.2.4 (upgrade/outbox real em testes).
Zero dependências novas de runtime/browser. .d.ts delimita contratos com módulos legados e bundle oficial;
checkJs cobre a frente/domínio/db/Guia, e app.js recebe ESLint, gate DOM, sintaxe e teste de integração.

Limites reais: teste offline automatizado usa DOM/IndexedDB simulados e prova estática de precache,
sem instalação em navegador físico. A migration ainda não está no servidor remoto, por proibição desta missão;
o envio real exige sua aplicação posterior autorizada. Sem ela, o fluxo CNC e a outbox continuam locais.
