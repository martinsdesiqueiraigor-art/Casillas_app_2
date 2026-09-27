# Casillas App 2.0 — Segurança

## Objetivo

Este documento registra as principais decisões e controles de segurança adotados no Casillas 2.0.

O princípio central é:

O frontend não é uma autoridade de segurança.

O navegador pode ser manipulado pelo usuário. Portanto, regras comerciais, permissões e informações sensíveis devem ser protegidas no backend.

---

## Princípios

O Casillas 2.0 segue estes princípios:

1. Identidade deve ser validada pelo backend.
2. Dados comerciais devem permanecer sob autoridade do backend.
3. RLS deve proteger dados por usuário.
4. O frontend não deve conter segredos.
5. Funções privilegiadas devem permanecer protegidas.
6. Operações comerciais sensíveis não devem depender somente do JavaScript do navegador.
7. Alterações importantes devem ser testadas antes de serem consideradas concluídas.

---

## Supabase Auth

A autenticação é realizada pelo Supabase Auth.

Responsabilidades:

- cadastro
- login
- logout
- sessão
- identificação do usuário

A identidade comercial é associada ao identificador do usuário autenticado.

O frontend pode consultar a sessão, mas não deve decidir sozinho permissões comerciais.

---

## Chaves e credenciais

O frontend pode utilizar somente uma chave pública apropriada para cliente.

Nunca devem ser colocados no código do navegador:

- service_role
- secret keys
- senhas
- credenciais administrativas
- tokens administrativos permanentes

A chave pública não concede automaticamente acesso aos dados.

O controle de acesso continua sendo feito por RLS e pelas permissões do banco.

---

## Row Level Security

RLS está habilitado nas tabelas do schema público utilizadas pelo sistema comercial.

Objetivo:

Impedir acesso indevido aos registros de outros usuários.

---

## Políticas atuais

### products

Produtos ativos podem ser consultados pelo cliente.

A leitura é limitada aos produtos ativos.

### profiles

Usuário autenticado:

- pode consultar o próprio perfil
- pode atualizar o próprio perfil

O usuário não deve conseguir acessar o perfil de outro usuário.

### trials

Usuário autenticado pode consultar o próprio trial.

O usuário não deve conseguir consultar o trial de outro usuário.

### licenses

Não existe acesso direto para usuários comuns.

### entitlements

Não existe acesso direto para usuários comuns.

### access_events

Não existe acesso direto para usuários comuns.

### admin_roles

Não existe acesso direto para usuários comuns.

---

## Isolamento por usuário

As tabelas que possuem dados específicos de usuários devem utilizar o identificador do usuário autenticado para limitar o acesso.

O padrão esperado é:

usuário autenticado

↓

identificador do usuário

↓

registro pertencente ao mesmo usuário

Esse isolamento evita acesso horizontal indevido entre contas.

---

## Funções SECURITY DEFINER

O projeto utiliza funções SECURITY DEFINER somente quando necessário para operações internas controladas.

Funções existentes:

- private.set_updated_at()
- private.handle_new_user()
- private.start_casillas_trial()

Essas funções ficam no schema private.

O acesso público direto é revogado.

Quando uma função SECURITY DEFINER é utilizada:

- deve existir uma justificativa
- deve haver validação adequada
- o search_path deve ser controlado
- a função não deve ser exposta desnecessariamente

---

## Criação automática do perfil

A função private.handle_new_user() é utilizada por um trigger do banco.

Fluxo:

Supabase Auth

↓

novo usuário

↓

trigger

↓

private.handle_new_user()

↓

profiles

O objetivo é impedir que a criação do perfil dependa exclusivamente do frontend.

---

## Trial

O trial comercial é controlado pelo backend.

O usuário autenticado chama:

Para usuários não licenciados, o Supabase é a autoridade atual do trial.

A validade do trial não depende do IndexedDB ou do localStorage.

Se a verificação do trial no Supabase falhar, o aplicativo não libera o acesso por fallback local.

start_casillas_trial()

A função pública controlada encaminha a operação para a função privada responsável pelo processamento.

O backend controla:

- usuário
- produto
- início
- término
- status

O frontend não deve ser a autoridade sobre a validade do trial.

---

## Proteção contra manipulação local

O sistema legado possui mecanismos locais de proteção contra manipulação do trial.

Esses mecanismos continuam existindo durante a transição.

A ativação paga legada permanece válida temporariamente para usuários que já possuem
uma ativação válida.

Ela não é a autoridade do trial para usuários não licenciados e será migrada
gradualmente para o novo sistema comercial.

Eles não devem ser considerados a autoridade comercial definitiva.

A arquitetura final deve utilizar o backend para determinar:

- validade do trial
- validade da licença
- direitos de acesso

---

## IndexedDB e localStorage

Armazenamento local pode ser utilizado para:

- histórico
- preferências
- estado da interface
- funcionamento offline
- cache

Não deve ser utilizado como autoridade para:

- licença
- trial comercial
- autorização
- permissões administrativas

---

## Frontend

O frontend é considerado uma superfície não confiável.

O usuário pode:

- modificar JavaScript
- alterar localStorage
- alterar IndexedDB
- manipular requisições
- executar código próprio

Por isso, verificações críticas devem existir no backend.

---

## Backend

O backend deve ser responsável por:

- validar identidade
- validar permissões
- controlar licenças
- controlar trials
- controlar entitlements
- executar operações administrativas
- proteger informações comerciais

---

## Segurança das tabelas

As tabelas comerciais possuem RLS habilitado.

As tabelas sensíveis não possuem acesso direto para usuários comuns.

A combinação esperada é:

Autenticação

+

RLS

+

políticas de acesso

+

backend seguro

---

## Testes de segurança

Os testes atuais verificam principalmente:

- RLS
- isolamento de profiles
- acesso do próprio usuário
- bloqueio de acesso a dados de outro usuário

Estado atual:

17 testes de banco executados com sucesso.

---

## Advisor de segurança

O Supabase possui verificações automáticas de segurança.

Os advisors devem ser executados após alterações importantes em:

- RLS
- funções
- políticas
- tabelas
- views
- permissões

Resultados de advisors devem ser analisados antes de uma publicação comercial.

---

## Segurança do código

Antes de adicionar dependências ou modificar componentes importantes:

1. verificar a dependência
2. verificar a origem
3. verificar a versão
4. testar localmente
5. revisar permissões
6. executar os testes

Pacotes Supabase devem possuir versão registrada no projeto e lockfile atualizado.

---

## Processo seguro de alteração

Antes de modificar uma parte crítica:

1. mapear dependências
2. criar backup ou ponto de restauração
3. implementar a alteração
4. executar testes
5. revisar segurança
6. verificar o comportamento
7. criar commit

---

## Estado atual

Concluído:

- Supabase Auth testado
- projeto Supabase configurado
- RLS habilitado
- políticas iniciais configuradas
- funções privadas protegidas
- criação automática de profile
- trial de 30 dias no backend
- testes de RLS
- cliente frontend utilizando chave pública

Em desenvolvimento:

- licenciamento
- entitlements
- controle de acesso
- operações comerciais seguras
- área administrativa
- pagamentos
- auditoria final de segurança

---

## Regra principal

Nenhuma informação controlada pelo usuário no navegador deve ser considerada prova suficiente de autorização comercial.

A autoridade final deve permanecer no backend.