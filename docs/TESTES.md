# Casillas App 2.0 — Testes

## Objetivo

Este documento registra os testes realizados no Casillas 2.0 e os testes planejados para as próximas etapas.

O objetivo é garantir que alterações importantes sejam verificadas antes de serem consideradas concluídas.

---

## Testes de banco de dados

### Testes de RLS

Executados com:

* Supabase CLI
* pgTAP

Resultado atual:

* 2 arquivos de teste
* 17 testes
* 17 testes aprovados
* Resultado: PASS

Os testes verificam principalmente:

* isolamento entre usuários
* acesso ao próprio perfil
* bloqueio de acesso ao perfil de outro usuário
* funcionamento das políticas de RLS

---

## Testes de autenticação

### Login

Foi criado um usuário de teste no Supabase Auth.

O login com email e senha foi executado com sucesso.

Resultado:

* sessão criada: SIM
* erro: NÃO

---

## Teste de criação automática de profile

O cadastro de usuário foi integrado ao trigger do banco.

Fluxo testado:

Supabase Auth

↓

novo usuário

↓

trigger

↓

private.handle_new_user()

↓

profiles

O perfil foi criado automaticamente.

Resultado:

PASS

---

## Teste do trial

O trial possui duração de 30 dias.

O fluxo testado foi:

usuário autenticado

↓

start_casillas_trial()

↓

trial no banco

↓

status ACTIVE

↓

data de término

O RPC foi executado com sucesso.

Resultado:

* usuário identificado: SIM
* trial criado: SIM
* status: ACTIVE
* duração: 30 dias
* erro: NÃO

---

## Teste de leitura do trial

Após a criação do trial, foi realizada uma consulta autenticada.

Resultado:

* trial encontrado: SIM
* status ACTIVE
* data de início registrada
* data de término registrada
* erro: NÃO

Resultado:

PASS

---

## Testes do frontend

### Cliente Supabase

Foi instalado:

@supabase/supabase-js

O cliente Supabase foi integrado ao frontend por meio de:

* js/supabase.js
* js/supabase.bundle.js

Resultado:

PASS

---

### app.js

O aplicativo foi conectado ao cliente Supabase.

Foi verificado que:

* o import foi adicionado
* o arquivo não foi corrompido
* o aplicativo continua carregando
* não foram identificados erros vermelhos no teste local

Resultado:

PASS

---

### trial.js

O módulo de trial foi conectado ao Supabase.

Para usuários não licenciados, o Supabase passou a ser a autoridade do trial.

A ativação paga legada continua funcionando temporariamente para usuários que já possuem
uma ativação válida.

Estado:

CONCLUÍDO — autoridade do trial migrada para o Supabase

---

## Testes de segurança

Devem ser executados após alterações importantes em:

* RLS
* políticas
* funções
* permissões
* tabelas
* views
* operações comerciais

Também devem ser executados testes específicos para:

* usuário sem autenticação
* usuário autenticado
* acesso ao próprio registro
* tentativa de acesso a registro de outro usuário
* operações administrativas
* licença
* entitlement
* trial expirado

---

## Testes planejados

### Autenticação

* cadastro
* login
* logout
* sessão persistente
* sessão expirada
* recuperação de acesso
* usuário não autenticado

### Trial

* criação do trial
* leitura do próprio trial
* tentativa de leitura de outro trial
* trial ativo
* trial expirado
* tentativa de reiniciar trial
* usuário sem trial

### Licenciamento

* licença válida
* licença expirada
* licença inexistente
* licença pertencente a outro usuário
* entitlement ativo
* entitlement inativo

### Controle de acesso

* usuário sem licença
* usuário com trial
* usuário com licença
* usuário com acesso expirado
* tentativa de manipulação do frontend

### Segurança

* RLS
* permissões
* funções SECURITY DEFINER
* exposição de dados
* acesso anônimo
* acesso autenticado
* acesso administrativo

---

## Testes antes da publicação

Antes da publicação do Casillas 2.0 devem ser executados:

1. Testes do banco
2. Testes de autenticação
3. Testes de trial
4. Testes de licenciamento
5. Testes de controle de acesso
6. Testes de segurança
7. Testes do frontend
8. Testes PWA
9. Testes offline
10. Testes em dispositivos móveis
11. Teste de atualização do Service Worker
12. Teste de recuperação após atualização

---

## Definition of Done

Um recurso só será considerado concluído quando:

* implementação concluída
* dependências verificadas
* testes executados
* segurança revisada
* comportamento esperado confirmado
* documentação atualizada
* commit criado
* Git sem alterações inesperadas

---

## Estado atual

### Concluído

* Testes de RLS
* 17 testes de banco aprovados
* Login Supabase
* Criação automática de profile
* RPC do trial
* Leitura autenticada do trial
* Integração inicial do cliente Supabase
* Teste local do frontend

### Em desenvolvimento

* Teste integrado de cadastro → login → sessão → trial → acesso
* Teste de expiração real do trial
* Teste de falha de conexão com Supabase
* Teste de acesso com licença legada já ativada
* Licenciamento
* Entitlements
* Controle de acesso
* Operações comerciais seguras

---

## Regra

Nenhuma etapa importante deve ser considerada concluída apenas porque o código foi escrito.

O resultado deve ser confirmado por testes.
