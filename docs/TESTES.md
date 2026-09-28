# Casillas App 2.0 — Testes

## Escopo e evidência

Este documento separa testes históricos relatados no repositório de verificações ainda necessárias. Não declara que testes foram executados nesta atualização documental.

## Histórico registrado

A documentação anterior registra 17 testes de banco/RLS aprovados, além de testes de login, criação de perfil, RPC de trial, leitura autenticada do trial e integração inicial do frontend. Esses resultados são registros históricos e não foram repetidos nesta etapa.

O usuário informou que a Home refinada foi testada visualmente com sucesso. Isso não equivale a teste automatizado, teste de todos os módulos ou validação atual do backend.

## Fluxo atual a validar

```text
Supabase Auth
  → checkTrialStatus()
  → get_casillas_entitlement()
  → entitlement válido: liberar
  → sem entitlement: start_casillas_trial()
  → trial ACTIVE e vigente: liberar com dias restantes
  → trial expirado/inválido ou erro: bloquear
```

A ativação usa `activate_casillas_license()` e deve ser seguida pela consulta do entitlement. Nenhuma RPC foi executada para este documento.

## Bateria funcional pendente

### Autenticação e trial

- login e identificação da sessão;
- conta sem entitlement com trial existente ativo;
- conta sem entitlement e sem trial, observando a criação controlada pelo fluxo esperado;
- recarga com sessão ativa;
- logout e novo login, confirmando reutilização do trial existente;
- trial expirado e status diferente de `ACTIVE` em ambiente controlado;
- falha de rede/Auth/erro de RPC, confirmando bloqueio fechado.

### Entitlement e licença

Em ambiente controlado, validar entitlement ativo, revogado, vencido, produto inativo, ausência de entitlement e falha de consulta. Testar ativação comercial somente com licença de teste disponível e autorização operacional explícita; não consumir ou modificar licenças para documentação.

### PWA e interface

- Home, navegação e carregamento dos 12 módulos;
- atualização do Service Worker `casillas-v10` e descarte de cache anterior;
- instalação, recarga e comportamento offline;
- telas de autenticação, ativação e banner do trial;
- fluxo de recuperação de senha.

## Integridade local

Após alterações de código, executar verificações adequadas ao escopo, revisar `git diff --check`, diff e `git status --short`. Não considerar os testes históricos como prova do estado remoto atual.
## Cobertura conhecida da suíte SQL (resultado histórico)

O histórico do projeto registra 17 asserções aprovadas em dois arquivos: 16 em `supabase/tests/profiles_rls.test.sql` e 1 setup em `supabase/tests/000-setup-tests-hooks.sql`. Não foram executadas novamente nesta etapa.

A cobertura funcional/estrutural registrada no arquivo de profiles inclui: existência da tabela/coluna; RLS habilitado; policies de SELECT/UPDATE; grants de leitura e de UPDATE apenas para `full_name`/`locale`; negação de alteração em `id`, `created_at` e `updated_at`; usuário A e B veem apenas o próprio perfil; atualização do próprio perfil funciona; atualização cruzada entre contas não retorna linha. O teste usa usuários de teste, autentica cada identidade e faz rollback ao final.

Esses 17 testes **não** representam 17 cenários de trial/licença. A suíte mostrada não testa RPC de trial, prevenção de reinício, entitlements, ativação de licença ou acesso administrativo. Os antigos resultados de login, trigger/perfil, RPC de trial e leitura do trial são registros históricos separados e não foram repetidos.

## Estado dos testes

### TESTE HISTÓRICO

- 17 asserções SQL/RLS registradas como aprovadas.
- Login, perfil automático, RPC de início e leitura autenticada de trial registrados como bem-sucedidos em documentação anterior.
- Teste visual da Home informado pelo usuário.

### TESTE ATUAL NESTA ATUALIZAÇÃO

- Nenhum teste funcional, RPC ou teste SQL foi executado. A alteração é documental.

### TESTE PLANEJADO

- Auth: login, sessão persistente, logout, usuário anônimo e erro de autenticação.
- Perfis e isolamento: repetir leitura/atualização entre contas em ambiente de testes.
- Trial: trial ativo e datas, expiração, status não ACTIVE, usuário sem trial, repetição da chamada sem reiniciar/estender, chamada não autenticada e tentativa de acesso cruzado.
- Entitlement: válido, ausente, revogado, expirado, produto inativo e erro RPC; confirmar que a conta consultante não lê o entitlement de outra.
- Licença/admin: permissões por papel, acesso direto às tabelas, execução de RPC, licença disponível/ativada/revogada e relação licença-entitlement em dados de teste autorizados.
- PWA: recarga, troca/logout/login, 12 módulos, instalação, atualização de `casillas-v10`, cache antigo e offline (distinguindo recursos em cache da autorização online).

Testes que criam ou alteram usuário, trial, licença ou entitlement exigem ambiente/dados de teste autorizados; não executar em produção sem autorização específica.