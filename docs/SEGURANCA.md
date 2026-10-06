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
# Segurança

## Princípio

O navegador nunca é autoridade comercial. JavaScript entregue ao usuário pode ser copiado, inspecionado ou alterado. Supabase Auth, RPCs, entitlement/trial e controles de banco são responsáveis por identidade e decisão comercial. Não há DRM, proteção contra F12 ou segredo no frontend como controle válido.

## Controles presentes no código/migrations

- O cliente usa Supabase Auth e verifica usuário antes de iniciar a área principal.
- O acesso consulta entitlement; sem direito válido consulta/inicia trial remoto. Erros de verificação não são substituídos por autorização local.
- A ativação de licença é feita por RPC autenticada; o cliente confirma o entitlement novamente antes de liberar a tela.
- No cliente, falha/ausência de entitlement segue para a RPC de trial; falha também na verificação de trial bloqueia. Isso não concede por si só acesso local, mas a revalidação do comportamento com falhas seletivas de RPC segue pendente.
- RLS está habilitado nas tabelas comerciais na migration inicial. Policies e grants locais delimitam leitura de produto ativo, perfil próprio e trial próprio; acesso direto às tabelas sensíveis é revogado para papéis cliente nessa migration.
- Funções privadas comerciais versionadas definem `search_path = ''`; wrappers públicos de trial e entitlement usam `SECURITY INVOKER`. Veja [Banco de dados](BANCO-DADOS.md).
- A licença é ligada à conta e não possui limite de aparelhos. Não existe validação por device ID no fluxo atual de `js/trial.js`.
- Não se identificou uso das chaves `KEYS.install`, `KEYS.lastSeen`, `KEYS.activated` ou `KEYS.activeCode` além de suas declarações em `js/trial.js`. São constantes remanescentes sem leitura ou escrita no código consultado; não influenciam Auth, trial ou autorização.

`localStorage`, `sessionStorage`, IndexedDB, cookies locais, device ID e fingerprint não são autoridade comercial. Em especial, `KEYS.activated` e `KEYS.activeCode` não são lidas ou gravadas e não autorizam acesso.

Esses pontos descrevem código e migrations locais. A revisão não consultou produção e não certifica configuração remota, grants efetivos ou proteção contra abuso.

## Riscos conhecidos e hardening futuro

- Revisar em ambiente remoto os grants efetivos, RLS/policies, funções privilegiadas, `search_path`, validação de `auth.uid()` e schema exposto.
- A auditoria técnica de 29/09 registra pendência de rate limiting para tentativas de ativação. Isso não está implementado pela função versionada localmente.
- Testar falha fechada em erros de Auth/RPC e cenários de trial/entitlement com dados controlados.
- Confirmar que falha exclusiva de `get_casillas_entitlement()` não causa liberação indevida por um trial que o cliente consulta em seguida.
- Avaliar exposição de mensagens/logs e registrar evidências sem tokens, códigos ou dados pessoais.
- Validar atualização do Service Worker e comportamento de cache nos navegadores suportados; cache não concede acesso.

Esses itens são ações futuras, não controles concluídos. Não foi feita alteração de segurança nesta tarefa documental.

### Pendência documentada: wrapper público de ativação

`public.activate_casillas_license(text)` está representado na migration `20260930213346_add_public_activate_casillas_license_wrapper.sql`. O wrapper chama a implementação privada, define `search_path = ''`, revoga execução de `public`/`anon` e concede execução a `authenticated` e `service_role`. A antiga lacuna de versionamento está encerrada; permanece apenas o registro histórico de drift de timestamp. Veja [Banco de dados](BANCO-DADOS.md#matriz-de-funcoes-remoto-e-migrations-locais).

## Legado

`gerar-codigo.html` foi removido em G3.4 e também retirado do pré-cache. O gerador operacional atual é `tools/gerar-codigo.mjs`, usado localmente e fora do artefato público do PWA.
