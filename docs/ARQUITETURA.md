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

Na investigação remota mais recente, `public.activate_casillas_license(text)` chama `private.activate_casillas_license(text)`. A implementação privada está versionada, mas o wrapper público remoto não está representado nas migrations atuais e não foi localizado no histórico pesquisável deste repositório. Esse schema drift conhecido é uma lacuna de rastreabilidade, não evidência de falha ou bypass. Nenhuma migration será criada nesta etapa. Veja a [matriz de funções](BANCO-DADOS.md#matriz-de-funcoes-remoto-e-migrations-locais).

## Dados e Supabase

As migrations definem `products`, `profiles`, `trials`, `licenses`, `entitlements`, `access_events` e `admin_roles`; veja [Banco de dados](BANCO-DADOS.md) para políticas, funções e limites da evidência local. A migration `20260929042401_add_get_casillas_entitlement.sql` versiona a lógica privada e wrapper público de entitlement, corrigindo a lacuna de rastreabilidade apontada em documentos anteriores.

## PWA e offline

`manifest.json` define `start_url: ./index.html`, `scope: ./`, `display: standalone`, orientação `portrait` e ícones 192×192 e 512×512. `js/app.js` registra `service-worker.js`; o escopo efetivo decorre da localização do script, no diretório raiz. `casillas-v10` pré-cacheia recursos, incluindo módulos de cálculo, e a navegação usa rede primeiro com fallback para `offline.html`; recursos GET usam cache primeiro. `offline.html` está presente na lista de pré-cache.

Os cálculos permanecem locais. Auth e RPCs comerciais dependem de comunicação com Supabase. O histórico de teste registrou que, offline, a página chegou à tela de login; restauração de sessão autenticada, validação comercial e uso completo dos módulos nesse estado não foram confirmados. Não se deve concluir que sessão autenticada offline funciona.

## Arquivo legado

`gerar-codigo.html` é uma ferramenta autônoma no navegador para gerar códigos e hashes do mecanismo antigo e orienta incorretamente a inserir hashes em `trial.js`. Não é importada pelo fluxo comercial atual. É incluída no pré-cache. Preservada por decisão histórica; não tratar seu conteúdo como regra ou ferramenta operacional atual.

Consulte também [Segurança](SEGURANCA.md), [Mapa de dependências](MAPA-DEPENDENCIAS.md) e [Testes](TESTES.md).
