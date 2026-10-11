# CASILLAS 2.2 — Primeira regressão automatizada

**Data:** 2026-10-10  
**Ambiente:** `C:\Projetos\Casillas_2.2_OFICIAL`  
**Branch local observada:** `casillas-2.0`  
**Status:** NÃO APROVADO PARA INTEGRAÇÃO; diagnóstico inicial.

## Execução

Comando: `node --test tests\*.test.mjs tests\ev3\*.test.mjs`.

Resultado reportado pelo Node: **127 testes, 110 aprovados, 17 falhas**. Parte dos testes foi executada ou relatada duas vezes por importação/seleção de arquivos; não interpretar o total como casos independentes.

### Falhas observadas

- `tests/access-app.test.mjs`: cinco casos falharam com `ReferenceError: applySettings is not defined`. A fixture injeta dependências em `Function(...)` e não contempla a função de Configurações adicionada ao `app.js`. A fixture também usa um DOM simulado simplificado, que precisará ser reavaliado perante o novo roteamento.
- Testes EV3 de app, offline, estático e UI: módulos `linkedom`, `fake-indexeddb` ou `typescript` não encontrados. Dependências estão declaradas no `package.json`, mas indisponíveis na instalação local durante a execução.
- Testes de rate limit, migration e offline DB: executável `supabase` indisponível (`spawnSync supabase ENOENT`). Não há evidência de falha das migrations a partir deste resultado.
- Casos de resolver, FSM, banco CNC, fila de sincronização, lease offline e trial passaram em parte substancial da execução.

## Revisão de alterações

`git diff --check` não reportou erro de whitespace (apenas avisos de normalização LF/CRLF). O working tree contém modificações anteriores à correção de navegação, incluindo Home, Consultor, Configurações, CSS e arquivos novos. **Não separar ou fazer commit do diff completo como se fosse exclusivamente navegação.**

## Próximas ações

1. Restaurar dependências locais de testes de modo controlado e repetir suites sem alterar dependências versionadas inadvertidamente.
2. Atualizar fixtures de testes para a API atual de Configurações/roteamento, sem enfraquecer asserções de segurança.
3. Verificar disponibilidade de CLI Supabase antes de repetir suites que dependem dela.
4. Criar testes específicos de histórico, `hashchange`, origem Consultor e retorno da ficha.
5. Revisar regressões e somente então solicitar autorização para integração Git.

Nenhum commit, push, merge, deploy ou operação remota no Supabase foi executado nesta etapa.

## Continuação — ambiente de dependências recuperado

Foi executado `npm ci --ignore-scripts --no-audit --no-fund` com êxito: 112 pacotes instalados localmente a partir do lockfile. Não houve alteração intencional de `package.json` ou `package-lock.json`.

A suíte isolada `node --test tests\ev3\*.test.mjs` passou a executar e reportou **20 testes: 18 aprovados, 2 falhas**:

1. `tests/ev3/app.test.mjs`: `timeout app` no teste integrado de inicialização/deep link. A fixture usa `linkedom`, histórico simulado sem `pushState`, `location` substituída e não define `sessionStorage`. A causa exata do timeout ainda precisa ser isolada; não classificá-la como apenas erro de fixture.
2. `tests/ev3/static.test.mjs`: `js/modules/consultor/localId.js` ausente da lista de precache do Service Worker. **Defeito objetivo de cobertura offline**, requer correção de cache e revisão de todos os novos arquivos 2.2.

A fixture de `tests/access-app.test.mjs` continua desatualizada em relação a `applySettings` e a outras dependências atuais de `app.js`. Os testes com CLI Supabase seguem sem execução válida enquanto `supabase` não estiver disponível no PATH.

**Gate QA permanece aberto.** Não houve commit, push, merge ou deploy.

## Correção local autorizada — cobertura offline

Alterado `service-worker.js`: inclusão de `js/modules/consultor/localId.js`, `js/modules/settings.js` e quatro folhas CSS locais da interface 2.2 no precache. Versão de cache local incrementada de `casillas-v20` para `casillas-v21-local` para invalidar cache antigo. Ajustada a expectativa fixa de versão em `tests/ev3/static.test.mjs` para o novo identificador, mantendo as asserções de existência e cobertura dos assets.

**Verificação:** `node --test tests\ev3\static.test.mjs`: **4/4 aprovados**. `git diff --check`: sem erro de whitespace (avisos LF/CRLF).

**Ainda pendente:** timeout no `tests/ev3/app.test.mjs`; a causa não foi isolada. A suíte completa, a fixture `tests/access-app.test.mjs` e testes dependentes de CLI Supabase ainda não foram homologados. **Não considerar QA encerrado.**

## Regressão EV3 e autenticação — correções de fixtures

A fixture `tests/access-app.test.mjs` foi atualizada com dependências simuladas da configuração e ponte Guia, `location.hash` e métodos de DOM introduzidos pelo roteamento. **Resultado:** `node --test tests\access-app.test.mjs` = **6/6 PASS**, preservando asserções de bloqueio de acesso e troca de identidade.

O timeout de `tests/ev3/app.test.mjs` foi isolado: `linkedom` não dispara automaticamente `hashchange` quando `location.hash` é alterado. O teste foi atualizado para disparar explicitamente esse evento nas duas navegações, fornecer `sessionStorage` e simular `history.replaceState` sem apagar indevidamente o hash. Nenhuma regra de produção foi alterada para satisfazer o teste.

**Resultado:** `node --test tests\ev3\*.test.mjs` = **20/20 PASS**, incluindo o teste integrado, precache, domínio, offline, sincronização e UI. Avisos de Node sobre ausência de `type: module` não impediram a execução.

**Limites:** os testes dependentes da CLI Supabase e a regressão total de todas as suítes não foram executados novamente nesta rodada. Ainda não há validação real do Service Worker em HTTPS nem deploy. Nenhum commit, push, merge ou deploy.

## Regressão geral — execução local

Executado `node --test tests\*.test.mjs tests\ev3\*.test.mjs`: **131 testes, 128 PASS, 3 FAIL**. As três falhas são processos de teste de contratos SQL (`activation-rate-limit`, `ev2-migration`, `offline-access-db`) que invocam `spawnSync('supabase', ...)` e não localizam executável nativo no PATH do Node Windows. O Supabase CLI está instalado (2.118.0), mas `supabase.cmd` passado em `CASILLAS_SUPABASE_CLI` produz `EINVAL` no Node 24 Windows. Foi localizado executável nativo em `C:\Users\Usuario\AppData\Roaming\npm\node_modules\supabase\node_modules\@supabase\cli-windows-x64\bin\supabase.exe`.

Iniciado **somente** teste `offline-access-db.test.mjs` com `CASILLAS_SUPABASE_CLI` apontando para o `.exe` nativo. O processo ainda não retornou resultado ao fechamento deste registro. Docker já tinha contêineres `supabase_*_Casillas_app` ativos; **não executar testes paralelos de banco nem reiniciar/limpar esse ambiente** até confirmação de isolamento e conclusão do processo.

Nenhum commit, push, merge ou deploy. Gate SQL pendente.
