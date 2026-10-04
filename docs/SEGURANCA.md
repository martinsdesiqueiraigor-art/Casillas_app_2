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
