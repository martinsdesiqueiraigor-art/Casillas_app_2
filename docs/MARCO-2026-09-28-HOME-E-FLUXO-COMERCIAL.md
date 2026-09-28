# Marco 2026-09-28 — Home e Fluxo Comercial

## Estado

- Branch: `casillas-2.0`
- Commit-base: `24475a08cf6eadd83ec3fe8623735163540e5112`
- Commit: `feat: refinar Home do Casillas 2.0`
- Data do marco: 2026-09-28
- Projeto Supabase informado: `Casillas`, referência `maayjshlsxvxtrgjpcep`, região `sa-east-1`, plano Free. Esses dados refletem o contexto fornecido e não foram consultados remotamente nesta atualização.

## Arquitetura atual

Supabase é a autoridade comercial. O usuário precisa estar autenticado via Supabase Auth. O trial é controlado pelo Supabase, com duração configurada de 30 dias. `js/trial.js` consulta primeiro `get_casillas_entitlement()` e, sem entitlement válido, consulta/inicia o trial por `start_casillas_trial()`. Trial vigente `ACTIVE` permite acesso e informa os dias restantes; trial expirado ou erro de verificação bloqueia o acesso. A ativação da licença usa `activate_casillas_license()` e consulta o entitlement após a ativação.

Licenças não possuem limite de aparelhos. O acesso não depende mais de `KEYS.activated` (`trial-activated`) nem do antigo armazenamento local como autoridade.

## Home e módulos

O commit-base refinou a Home como entrada e catálogo. A tela agrupa os módulos em Cálculos, Roscas e ajustes, Usinagem, Guias e suporte, e oferece acesso rápido a ferramentas frequentes.

O roteador de `js/app.js` registra 12 módulos técnicos:

- Trigonometria (`trig`)
- Conicidade (`coni`)
- Polígonos (`poly`)
- Furação Circular (`furos`)
- Roscas (`rosca`)
- Tolerâncias ISO (`tol`)
- Potência de Corte (`potencia`)
- Chaveta DIN 6885 (`chaveta`)
- Conicidades Padrão (`conicpad`)
- Programação CNC (`prog`)
- Guia de Programação (`guia`)
- Consultoria (`consult`)

A Home (`home`) é a tela inicial, não um dos 12 módulos técnicos.

## Alterações concluídas

- O antigo sistema local de ativação/limite de aparelhos e anti-manipulação foi removido de `js/trial.js`, incluindo validação de códigos local, device ID, registro de ativações, limite de dispositivos, fingerprint e helpers associados.
- `KEYS.activated` não é mais usado como autorização; sua declaração ainda pode permanecer como compatibilidade/histórico no cliente.
- `getDB` e `setDB` continuam sendo usados por `js/state.js` para estado local; o fluxo comercial não os usa como autoridade.
- O botão `🔑 Ativação` do card `🔑 Ativação de licença` abre o WhatsApp diretamente com: `Olá! Preciso de ajuda para ativar minha licença do Casillas App.` A função `getActivationCodeForCurrentDevice()` não deve ser recriada.
- `gerar-codigo.html` continua preservado temporariamente como ferramenta legada independente. Não participa do fluxo normal, não possui integração com Supabase/Auth/entitlement e não cria nem ativa licenças comerciais. A decisão formal está registrada em `DECISAO-GERAR-CODIGO-2026-09-28.md` no conjunto documental do marco.
- `service-worker.js` usa `casillas-v10` e ainda inclui `gerar-codigo.html` no pré-cache; não há lógica específica de ativação comercial associada a essa ferramenta.

## Arquivos do commit-base

O commit `24475a0` alterou `css/layout.css`, `css/modules.css`, `index.html`, `js/app.js`, adicionou `js/modules/home.js` e atualizou `service-worker.js`.

## Integridade e evidências

- Foram registrados anteriormente resultados aprovados de `node --check` para `js/app.js`, `js/modules/home.js` e `service-worker.js`.
- `git diff --check` não apontou erros de whitespace em verificações anteriores; há avisos de line endings mistos em arquivos existentes. Não normalizar line endings automaticamente.
- O usuário informou que a Home foi testada visualmente com sucesso.
- Esta consolidação documental não executou testes do aplicativo, RPCs, consultas ou operações no Supabase.

## Pendências

1. Testar o fluxo real de trial: login, consulta do trial existente, recarga, logout e novo login, sem criar estado de teste fora do plano autorizado.
2. Validar cenários de expiração, erro de Auth/rede e entitlement revogado em ambiente controlado.
3. A busca local de migrations não encontrou uma definição versionada de `get_casillas_entitlement()`, embora sua existência remota tenha sido informada. Planejar rastreabilidade reproduzível em etapa própria, após comparar a definição remota.
4. Revisar grants, RLS e funções remotas antes de publicação.
5. Rever o pré-cache e a ferramenta `gerar-codigo.html` somente após confirmar que nenhum processo administrativo depende da URL.
6. Revisar README, mapa de dependências, segurança, roadmap e testes conforme novas evidências.
7. Preservar integralmente backups e documentos históricos; não remover backups sem decisão explícita.

## Regra para a próxima etapa

Antes de qualquer remoção ou mudança estrutural, consultar este marco e preservar os backups existentes. Trabalhar em etapas: construir → testar → corrigir → publicar → documentar. Não declarar um teste concluído sem evidência e não tratar documentação como validação remota.
