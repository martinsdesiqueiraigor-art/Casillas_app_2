# Casillas App 2.0 — Banco de Dados

## Objetivo

Este documento registra a estrutura atual do banco de dados do Casillas 2.0 no Supabase.

O banco é responsável pela identidade comercial, trial, licenciamento, controle de acesso e dados administrativos.

Os módulos técnicos do aplicativo não dependem diretamente dessas tabelas.

---

## Projeto Supabase

Projeto:

Casillas

Região:

South America (São Paulo)

Região técnica:

sa-east-1

Plano atual:

Free

O frontend utiliza apenas a chave pública apropriada para aplicações cliente.

Chaves secretas e service_role não devem ser utilizadas no navegador.

---

## Estrutura comercial

As principais tabelas são:

- products
- profiles
- trials
- licenses
- entitlements
- access_events
- admin_roles

---

## 1. products

Representa os produtos comerciais disponíveis.

Responsabilidades:

- identificar produtos
- nome do produto
- descrição
- status ativo/inativo

Produto atual:

Casillas

Slug:

casillas

Descrição:

Calculadora técnica de usinagem

Estado:

ativo

A tabela possui leitura pública limitada aos produtos ativos.

---

## 2. profiles

Representa o perfil comercial do usuário autenticado.

Relação principal:

Supabase Auth → profiles

O registro é associado ao usuário através do identificador do Supabase Auth.

Responsabilidades:

- perfil do usuário
- dados básicos da conta
- informações necessárias ao sistema comercial

Acesso atual:

- usuário autenticado pode consultar o próprio perfil
- usuário autenticado pode atualizar o próprio perfil
- usuário não pode acessar o perfil de outro usuário

A tabela possui RLS habilitado.

---

## 3. trials

Representa o período de teste do produto.

Relações principais:

- usuário
- produto

Responsabilidades:

- início do trial
- término do trial
- status
- controle do período de teste

Trial atual:

30 dias

Status utilizado atualmente:

ACTIVE

Quando o período termina, o trial pode ser considerado expirado pelo sistema.

Acesso atual:

- usuário autenticado pode consultar o próprio trial
- criação e controle comercial são realizados pelo backend

A tabela possui RLS habilitado.

---

## 4. licenses

Representa licenças comerciais.

Responsabilidades futuras:

- licença adquirida
- validade
- produto associado
- usuário associado
- estado da licença

Acesso direto pelo cliente:

Não permitido atualmente.

A tabela possui RLS habilitado.

Operações comerciais devem ser realizadas por uma camada backend segura.

---

## 5. entitlements

Representa os direitos de acesso concedidos ao usuário.

Responsabilidades:

- determinar quais recursos estão disponíveis
- associar direitos a usuários
- permitir evolução do sistema comercial

Exemplos futuros:

- acesso ao Casillas
- licença permanente
- licença temporária
- recursos adicionais

Acesso direto pelo cliente:

Não permitido atualmente.

---

## 6. access_events

Registra eventos relacionados ao acesso e ao sistema comercial.

Possíveis eventos:

- login
- logout
- início de trial
- ativação
- alteração de licença
- alteração de acesso

A tabela é considerada sensível.

Acesso direto pelo cliente:

Não permitido atualmente.

---

## 7. admin_roles

Representa funções administrativas.

Responsabilidades:

- identificar administradores
- controlar permissões administrativas
- separar usuários comuns de operadores administrativos

Acesso direto pelo cliente:

Não permitido atualmente.

As decisões administrativas devem permanecer no backend.

---

## RLS

Row Level Security está habilitado nas tabelas comerciais.

Objetivo:

Impedir que usuários autenticados acessem registros pertencentes a outros usuários.

Políticas atuais relevantes:

### products

Leitura pública de produtos ativos.

### profiles

Usuário autenticado pode consultar o próprio registro.

Usuário autenticado pode atualizar o próprio registro.

### trials

Usuário autenticado pode consultar o próprio trial.

### licenses

Sem acesso direto para usuários comuns.

### entitlements

Sem acesso direto para usuários comuns.

### access_events

Sem acesso direto para usuários comuns.

### admin_roles

Sem acesso direto para usuários comuns.

---

## Funções privadas

O projeto possui funções internas no schema private.

Funções importantes:

- private.set_updated_at()
- private.handle_new_user()
- private.start_casillas_trial()

Essas funções não devem ser expostas diretamente ao navegador.

Quando uma função utiliza SECURITY DEFINER, ela deve permanecer protegida e possuir validações apropriadas.

---

## Criação automática do perfil

Quando um usuário é criado no Supabase Auth, o backend possui um trigger responsável por criar o perfil correspondente.

Fluxo:

Usuário criado

↓

auth.users

↓

private.handle_new_user()

↓

public.profiles

Isso evita depender do frontend para criar manualmente o perfil comercial.

---

## Trial

O início do trial é realizado através da função pública controlada:

start_casillas_trial()

Essa função utiliza a camada privada:

private.start_casillas_trial()

A operação exige usuário autenticado.

O backend:

- identifica o usuário
- localiza o produto Casillas
- cria ou atualiza o trial
- define o período de 30 dias
- controla o status

O frontend não deve determinar a data real de término do trial como autoridade comercial.

---

## Autoridade dos dados

| Informação | Autoridade |
|---|---|
| Identidade do usuário | Supabase Auth |
| Perfil | profiles |
| Produto | products |
| Trial | trials |
| Licença | licenses |
| Direitos de acesso | entitlements |
| Eventos comerciais | access_events |
| Administração | admin_roles |

---

## Segurança

Nunca colocar no frontend:

- service_role
- secret keys
- senhas
- credenciais administrativas

O frontend utiliza somente credenciais apropriadas para cliente público.

RLS permanece habilitado nas tabelas expostas.

Operações sensíveis devem ser executadas no backend.

---

## Testes

Os testes de banco atualmente verificam:

- configuração básica do ambiente
- RLS de profiles
- isolamento entre usuários
- acesso ao próprio perfil
- bloqueio de acesso ao perfil de outro usuário

Estado atual:

17 testes executados com sucesso.

---

## Estado atual

Concluído:

- projeto Supabase
- schema comercial inicial
- RLS
- profiles
- products
- trials
- licenses
- entitlements
- access_events
- admin_roles
- trigger de criação de perfil
- trial de 30 dias
- RPC do trial
- testes de RLS

Ainda em desenvolvimento:

- autenticação integrada à interface
- conta do usuário dentro do aplicativo
- integração completa do trial com autenticação
- licenciamento
- entitlements operacionais
- controle de acesso
- operações comerciais seguras
- área administrativa
- pagamentos

---

## Regra arquitetural

O banco de dados é a autoridade para informações comerciais.

IndexedDB e localStorage não devem ser utilizados para determinar:

- validade real do trial
- validade de licença
- autorização comercial
- permissões administrativas

O frontend apresenta o estado recebido do backend, mas não deve ser a fonte de verdade comercial.