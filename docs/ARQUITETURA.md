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
# Arquitetura do Casillas 2.0

Estado do código local na branch `casillas-2.0`, referência `629ebe3` (29/09/2026). Esta descrição deriva dos arquivos cliente e migrations versionadas; não confirma por si só o estado implantado.

## Componentes

- `index.html`, `auth.html`, `css/`: interface e telas.
- `js/app.js`: inicialização, verificação de identidade/acesso, roteador e carregamento dinâmico da Home e dos 12 módulos.
- `js/modules/` e `js/calc/`: apresentação e cálculos técnicos locais.
- `js/auth.js`, `js/auth-page.js`: Supabase Auth, sessão, login, cadastro, saída e solicitação de redefinição de senha.
- `js/trial.js`: orquestra chamadas comerciais e atualiza a interface; não é autoridade final.
- Supabase Auth/PostgreSQL: identidade e decisão comercial por RPC; tabelas expostas protegidas por RLS/grants conforme migrations.
- `js/db.js`, `js/state.js`: estado de uso local no IndexedDB, sem autoridade comercial.
- `service-worker.js`: cache e fallback de navegação da PWA.

## Fluxo de identidade e acesso

1. `js/app.js` chama `getCurrentUser()` (Supabase Auth); se não há usuário, envia para `auth.html`.
2. Com usuário autenticado, `checkTrialStatus()` chama `get_casillas_entitlement()`.
3. Entitlement com `has_access=true` e validade ausente ou futura libera a interface.
4. Qualquer resultado sem entitlement aceito pelo cliente (incluindo erro da RPC) leva à chamada de `start_casillas_trial()`. Só trial `ACTIVE` com `ends_at` futuro libera; trial expirado ou falha/erro nessa chamada mostra bloqueio. Esse comportamento é o fallback implementado pelo cliente, não uma afirmação de entitlement confirmado quando a primeira RPC falha.
5. A ativação envia o código para `activate_casillas_license(p_license_code)`. Após resposta estruturada com `license_id`, o cliente consulta novamente o entitlement; só então esconde o bloqueio e emite evento para carregar a interface.

O trial tem 30 dias conforme função SQL e cliente. O acesso é associado à conta e a licença não tem limite de aparelhos. IndexedDB e estado local não concedem acesso.

`public.activate_casillas_license(text)` chama `private.activate_casillas_license(text)` e está versionado em `20260930213346_add_public_activate_casillas_license_wrapper.sql`. A implementação privada permanece em `20260928160324_fix_activate_casillas_license_entitlement_check.sql`. A antiga lacuna de rastreabilidade foi encerrada; veja a [matriz de funções](BANCO-DADOS.md#matriz-de-funcoes-remoto-e-migrations-locais).

## Dados e Supabase

As migrations definem `products`, `profiles`, `trials`, `licenses`, `entitlements`, `access_events` e `admin_roles`; veja [Banco de dados](BANCO-DADOS.md) para políticas, funções e limites da evidência local. A migration `20260929042401_add_get_casillas_entitlement.sql` versiona a lógica privada e wrapper público de entitlement, corrigindo a lacuna de rastreabilidade apontada em documentos anteriores.

## PWA e offline

`manifest.json` define `start_url: ./index.html`, `scope: ./`, `display: standalone`, orientação `portrait` e ícones 192×192 e 512×512. `js/app.js` registra `service-worker.js`; o escopo efetivo decorre da localização do script, no diretório raiz. O Service Worker atual usa `casillas-v12`, pré-cacheia os recursos do PWA e usa rede primeiro para navegação com fallback para `offline.html`; recursos GET locais usam cache primeiro.

Os cálculos permanecem locais. Auth e RPCs comerciais dependem de comunicação com Supabase quando precisam de validação remota. Em G4.2.2b foi validada sessão já autenticada com SW v12, reload offline, cálculos de Trigonometria e Roscas, Guia CNC offline e retorno normal ao online. Isso não significa que um usuário novo consiga autenticar ou obter autorização comercial pela primeira vez sem rede.

## Arquivo legado

`gerar-codigo.html` foi removido em G3.4 e retirado do pré-cache. A operação comercial manual atual usa `tools/gerar-codigo.mjs`, fora do artefato público do PWA.

Consulte também [Segurança](SEGURANCA.md), [Mapa de dependências](MAPA-DEPENDENCIAS.md) e [Testes](TESTES.md).
