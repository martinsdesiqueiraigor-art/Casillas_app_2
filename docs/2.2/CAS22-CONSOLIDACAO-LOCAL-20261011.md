# CASILLAS 2.2 — Inventário de consolidação local

**Data:** 2026-10-11
**Pasta verificada:** `C:\Projetos\Casillas_2.2_OFICIAL`
**Branch local observada:** `casillas-2.0`
**Remote origin:** `https://github.com/martinsdesiqueiraigor-art/Casillas_app_2.git`
**Modo:** leitura do estado Git e documentação; sem integração.

## Estado real da árvore

`git status --short` mostrou 14 arquivos rastreados modificados e entradas não rastreadas (incluindo o diretório `docs/2.2/`). O `git diff --stat` cobre **somente arquivos rastreados**: 14 arquivos, 342 inserções e 682 exclusões; não contabiliza novos CSS, JSON, JS e documentação. O diff total é histórico/acumulado e não pode ser atribuído à última rodada visual.

### Arquivos rastreados modificados

- Interface e entrada: `css/layout.css`, `index.html`, `js/modules/home.js`.
- Inicialização/roteamento: `js/app.js`.
- Consultor: `js/modules/consultor/ConsultorAgent.js`, `index.js`, `resultCard.js`, `telemetry.js`.
- Guia CNC: `js/modules/guia.js`, `js/modules/guia/bancoCiclosCNC.js`.
- Offline: `service-worker.js`.
- Testes: `tests/access-app.test.mjs`, `tests/ev3/app.test.mjs`, `tests/ev3/static.test.mjs`.

### Entradas não rastreadas observadas

- CSS: `css/consultor-22-local.css`, `css/guia-header-22-local.css`, `css/home-22-local.css`, `css/settings-22-local.css`.
- Dados: `dados/ciclos-cnc.json`.
- Documentação: `docs/2.2/`.
- JS: `js/modules/consultor/localId.js`, `js/modules/settings.js`.

## Evidências já disponíveis

- Validação manual Android dos cabeçalhos e espaçamento da Home, Calculadoras e Biblioteca: `CAS22-UI-ANDROID-VALIDATION-20261011.md`.
- Correção de inicialização e fluxo funcional informado: `CAS22-PROGRESS-NAV-01.md`.
- Histórico de regressão automatizada, incluindo 20/20 EV3 e pendências SQL: `CAS22-QA-REGRESSION-01.md`.

## Estratégia de integração proposta (não executada)

1. **UI:** revisar em conjunto `css/layout.css`, quatro CSS locais, `index.html` e `js/modules/home.js`; verificar dependências cruzadas antes de qualquer stage.
2. **Roteamento e Consultor:** revisar `js/app.js`, arquivos do Consultor, `js/modules/guia.js` e seus testes; preservar correção de inicialização e navegação validada.
3. **Banco CNC:** revisar separadamente `dados/ciclos-cnc.json` e `js/modules/guia/bancoCiclosCNC.js`; não confundir migração de dados com homologação técnica das fichas.
4. **Offline/Configurações:** conferir `service-worker.js`, `js/modules/settings.js`, `localId.js` e cobertura de assets.
5. **Documentação/QA:** consolidar evidências e pendências, evitando repetir testes manuais já aprovados.

**Gates:** antes de commit, revisar diferenças por grupo, confirmar dependências entre arquivos, tratar arquivos novos e obter autorização explícita. Não executar `git add -A` ou commit de toda a árvore sem essa revisão. O branch observado é `casillas-2.0`, apesar do nome do projeto 2.2; a estratégia de branch de integração precisa ser deliberada, não presumida.

## Continuidade — branch local criada com autorização do Product Owner

- Criada a branch local `casillas-2.2-consolidacao` a partir de `casillas-2.0` no commit `785b325`.
- `git status --short --branch` confirmou que as alterações rastreadas e não rastreadas permaneceram presentes após a troca.
- Nenhum arquivo foi descartado, nenhuma mudança foi colocada em stage e nenhum commit/push/merge/deploy foi executado.
- A informação de branch `casillas-2.0` no cabeçalho deste inventário é um retrato anterior à criação da nova branch.

## Revisão de higiene Git — 2026-10-11

- `git diff --name-status`: 14 arquivos rastreados modificados.
- `git ls-files --others --exclude-standard`: 11 arquivos novos não rastreados, incluindo quatro documentos em `docs/2.2/`.
- `git diff --check` apontou um espaço final na linha 24 de `tests/access-app.test.mjs`; corrigido sem alteração lógica. Segunda execução sem erros de whitespace (apenas avisos de normalização LF/CRLF).
- Branch confirmada: `casillas-2.2-consolidacao`.
- Os arquivos ainda não foram adicionados ao índice Git; antes do commit, revisar os conjuntos e suas dependências.

## Revisão de dependências para commits

- **UI + navegação:** `index.html` referencia os quatro novos CSS e acrescenta `#opt-settings`; `js/app.js` importa `js/modules/settings.js`, registra a rota de configurações e preserva a correção de boot. `css/layout.css` contém cabeçalho legado e ajuste de espaço inferior. `js/modules/home.js` participa da entrega visual.
- **Offline:** `service-worker.js` inclui os quatro CSS, `js/modules/settings.js`, `js/modules/consultor/localId.js` e `dados/ciclos-cnc.json`; portanto, não separar um commit de UI que aponte para arquivos inexistentes em sua revisão. Confirmar integridade da lista de assets antes de integração remota.
- **Consultor/Guia:** `js/app.js` contém alterações de navegação/cache do Consultor e bridge do Guia; isso atravessa fronteiras de módulos. Não presumir que um commit de UI isolado seja autocontido.
- **Dados CNC:** a redução extensa em `js/modules/guia/bancoCiclosCNC.js` deve ser revisada juntamente com o novo `dados/ciclos-cnc.json`; a revisão de organização não constitui homologação de conteúdo CNC.
- **Recomendação:** primeiro um checkpoint local coerente de toda a árvore após inspeção de integridade; só depois, se desejado, separar commits por frente em outra etapa controlada. Não criar commit parcial que quebre dependências.

## Integridade da migração do banco CNC — verificação local

- Extraído o array literal da versão `HEAD:js/modules/guia/bancoCiclosCNC.js` (via `git show`) e comparado estruturalmente, por serialização JSON, ao array `ciclos` de `dados/ciclos-cnc.json`.
- **Resultado:** `oldCount=4`, `newCount=4`, `identical=true`, com mesma ordem e IDs (`siemens_torno_cycle97`, `siemens_centro_de_usinagem_cycle83`, `fanuc_torno_g76`, `fanuc_centro_de_usinagem_g83`).
- O arquivo novo tem `schema_version=1` e o carregador novo faz `validateBank` e `deepFreeze`. Comparação de dados não comprova carregamento offline, compatibilidade de navegadores ou revisão técnica dos exemplos CNC.
- **Gate de integridade dos dados migrados:** aprovado. **Gate de comportamento/runtime e homologação técnica:** não declarado concluído por esta checagem.

## Pré-checkpoint — verificações adicionais

- Branch e arquivos pendentes reconfirmados por `git status --short --branch`.
- `node --check` sem erros em `js/app.js`, `js/modules/guia/bancoCiclosCNC.js` e `service-worker.js`.
- Inspeção estática da lista de assets do Service Worker: **82 referências, 0 caminhos ausentes** na árvore local.
- Essas verificações não equivalem a teste de execução offline nem a regressão funcional completa.
- A árvore permanece sem stage/commit. Próximo gate: autorização específica para registrar checkpoint Git local e definição do escopo exato de arquivos a incluir.

**Controle de segurança:** nenhum `git add`, commit, push, merge, deploy ou mudança Supabase realizado. Nenhum teste novo executado nesta consolidação. Não modificar fórmulas, conteúdo técnico CNC ou regras comerciais por consequência deste inventário.
