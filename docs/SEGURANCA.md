# Casillas App 2.0 — Segurança

## Princípio

O navegador é uma superfície não confiável. Identidade, trial, licença, entitlement e permissões comerciais devem ser validados pelo Supabase, com políticas e funções protegidas. Dados em IndexedDB servem ao funcionamento local e não provam autorização comercial.

## Identidade e fluxo de acesso

- Supabase Auth fornece identidade e sessão.
- `js/app.js` verifica a sessão antes de inicializar a área protegida.
- `js/trial.js` consulta a RPC `get_casillas_entitlement()` antes do trial. Sem entitlement válido, consulta/inicia o trial por `start_casillas_trial()`.
- Trial remoto ativo e dentro da validade permite acesso; trial expirado ou falha de verificação não deve ser substituído por autorização local.
- A ativação comercial é encaminhada a `activate_casillas_license`; o cliente verifica o entitlement depois da resposta.
- `trial-activated` continua declarado como chave local legada, mas não é usado atualmente para liberar acesso.
- O fluxo comercial não usa device ID nem limite de aparelhos.

Este é um resumo do cliente e da arquitetura informada, não uma auditoria atual do backend implantado. Confirmar a definição, grants, `search_path`, RLS e políticas remotas antes de qualquer alteração de segurança.

## Chaves e credenciais

O frontend pode conter apenas a chave pública apropriada para cliente. Não publicar `service_role`, secret keys, senhas, tokens administrativos ou credenciais privilegiadas. RLS e permissões do banco continuam essenciais; a chave pública não substitui esses controles.

## RLS e funções

As tabelas comerciais incluem `products`, `profiles`, `trials`, `licenses`, `entitlements`, `access_events` e `admin_roles`. As migrations locais e auditorias anteriores registram RLS e funções privadas para operações controladas; este documento não confirma o estado remoto atual. Revisar especificamente isolamento por `auth.uid()`, permissões `EXECUTE`, comportamento de funções `SECURITY DEFINER` e `search_path` seguro.

A definição remota `get_casillas_entitlement()` ainda precisa de origem local reproduzível: a busca no diretório de migrations não encontrou sua definição. Tratar essa lacuna como rastreabilidade pendente e não presumir que uma cópia local seja idêntica ao remoto.

## Dados locais e legado

IndexedDB pode armazenar histórico, preferências e estado da interface. Não confiar em valores editáveis pelo usuário para conceder acesso. O antigo mecanismo local de códigos, device ID, limite de aparelhos, fingerprints e anti-manipulação foi removido do fluxo de `js/trial.js`. `gerar-codigo.html` permanece como ferramenta legada independente, fora da autorização atual e sem integração Supabase; sua remoção foi adiada por decisão documentada no backup.

## Verificações antes de publicar

- testar RLS e grants como `anon` e `authenticated`;
- revisar funções privilegiadas, validação de usuário e erros;
- testar entitlement ativo, revogado e expirado e trial ativo/expirado em ambiente controlado;
- confirmar que falhas de Auth/rede não liberam acesso;
- verificar ausência de secrets em arquivos estáticos e logs;
- validar cache e atualização do Service Worker;
- registrar evidências sem expor tokens ou credenciais.
## Inventário técnico e nível de confirmação

### ATUAL / CONFIRMADO NO CÓDIGO LOCAL E NAS MIGRATIONS DISPONÍVEIS

A migration `20260925180000_initial_commercial_schema.sql` habilita RLS em `products`, `profiles`, `trials`, `licenses`, `entitlements`, `access_events` e `admin_roles`.

- `products`: grant SELECT para `anon` e `authenticated`; policy `products_public_read_active` restringe linhas a `is_active = true`.
- `profiles`: `authenticated` pode SELECT; UPDATE é concedido apenas em `full_name` e `locale`. Policies `profiles_select_own` e `profiles_update_own` comparam `auth.uid()` ao `id`.
- `trials`: grant SELECT e policy `trials_select_own` compara `auth.uid()` a `user_id`.
- `licenses`, `entitlements`, `access_events`, `admin_roles`: migration revoga acesso direto de `anon` e `authenticated`; não declara policy de acesso direto para esses papéis.

A migration local declara `private.set_updated_at()` e `private.handle_new_user()` como `SECURITY DEFINER`, ambos com `SET search_path = ''`; execução direta é revogada para `PUBLIC`, `anon` e `authenticated`. O segundo é chamado pelo trigger `on_auth_user_created` em `auth.users`.

`private.start_casillas_trial()` está localmente como `SECURITY DEFINER`, `search_path = ''`, e exige `auth.uid()`. O wrapper `public.start_casillas_trial()` está como `SECURITY INVOKER`, também com `search_path = ''`. Grants locais: wrapper executável por `authenticated`, revogado de `PUBLIC`/`anon`; função privada concedida a `authenticated` para a chamada pelo wrapper e revogada dos demais papéis indicados pela migration.

A migration de ativação `20260928160324_fix_activate_casillas_license_entitlement_check.sql` define `private.activate_casillas_license(text)` com `SECURITY DEFINER` e `search_path = ''`; revoga EXECUTE de `PUBLIC`, `anon` e `authenticated` antes de conceder a `authenticated`. Isso é o conteúdo versionado localmente, não confirmação independente da implantação atual.

### PENDENTE DE REVALIDAÇÃO REMOTA

- Estado atual de RLS, policies, grants de tabelas e funções remotas.
- Definição e grants de `get_casillas_entitlement()`: a função é chamada pelo cliente e sua existência remota foi informada, mas não há definição correspondente localizada nas migrations locais.
- `SECURITY DEFINER`/`INVOKER`, `search_path`, validações e grants efetivos após migrations ou alterações remotas.
- Resultado dos advisors atuais de segurança do Supabase.

Uma auditoria somente leitura anterior registrou a função privada/pública de entitlement como parte da implantação, mas os detalhes devem ser rechecados antes de qualquer mudança no backend. Não executar migrations ou mutações apenas para sanar esta lacuna documental.

### HISTÓRICO

A suíte antiga registrou 17 asserções aprovadas; a migration inicial e os testes disponíveis descrevem principalmente isolamento de profiles. Consulte `docs/TESTES.md`. Mecanismos locais de fingerprint, device ID, limite de dispositivos e anti-manipulação pertencem ao modelo legado, não à autorização atual. `gerar-codigo.html` permanece isolada como ferramenta legada/admin.

## Advisors e revisão antes de publicar

Após mudanças de schema/RPC, revisar Security Advisor e Database Linter, grants, exposição de schemas e RLS. Registrar data, ambiente e resultado, sem publicar secrets. Advisor é complemento; não substitui teste com papéis `anon`/`authenticated` nem revisão da função.