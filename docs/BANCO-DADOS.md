# Casillas App 2.0 — Banco de Dados

## Objetivo

Este documento registra a estrutura atual do banco de dados do Casillas 2.0 no Supabase.

O banco é responsável pela identidade do usuário, trial, licenciamento, controle de acesso, eventos comerciais e dados administrativos.

Os módulos técnicos do aplicativo não dependem diretamente dessas tabelas.

---

## Projeto Supabase

**Projeto:** Casillas

**Região:** South America (São Paulo)

**Região técnica:** `sa-east-1`

**Plano atual:** Free

O frontend utiliza somente a chave pública apropriada para aplicações cliente.

Chaves secretas e `service_role` não devem ser utilizadas no navegador.

---

## Estrutura comercial

As principais tabelas são:

### `products`

Catálogo de produtos disponíveis no sistema comercial.

Responsabilidade:

- identificar o produto;
- armazenar informações comerciais;
- controlar se o produto está ativo.

O produto Casillas já está cadastrado.

---

### `profiles`

Perfil associado ao usuário autenticado.

Responsabilidade:

- manter dados complementares do usuário;
- relacionar o usuário ao sistema comercial;
- permitir políticas próprias de acesso.

A criação inicial do perfil é realizada automaticamente pelo backend após o cadastro do usuário.

---

### `trials`

Controla o período de avaliação de cada usuário.

Responsabilidade:

- associar o trial ao usuário;
- registrar início e término;
- controlar status;
- impedir reutilização indevida do período de avaliação.

O trial do Casillas possui duração de **30 dias**.

Para usuários não licenciados, o Supabase é a autoridade do trial.

---

### `licenses`

Estrutura destinada ao controle das licenças comerciais.

Responsabilidade futura:

- registrar licença;
- produto;
- usuário;
- origem da licença;
- status;
- datas;
- identificação comercial.

Atualmente a estrutura existe, mas ainda não há licenças comerciais operacionais.

---

### `entitlements`

Estrutura destinada a representar os direitos de acesso do usuário.

Responsabilidade futura:

- determinar quais recursos o usuário pode utilizar;
- separar licença comercial de direito de acesso;
- permitir evolução para diferentes planos e recursos.

Atualmente a estrutura existe, mas ainda não há entitlements operacionais.

---

### `access_events`

Estrutura para registrar eventos relevantes de acesso e autorização.

Responsabilidade futura:

- auditoria;
- diagnóstico;
- rastreamento de alterações de acesso;
- histórico de eventos comerciais.

Atualmente não há eventos comerciais registrados nessa tabela.

---

### `admin_roles`

Estrutura destinada às funções administrativas.

Responsabilidade futura:

- identificar administradores;
- controlar permissões administrativas;
- permitir criação de área administrativa segura.

Atualmente não há administradores cadastrados nessa tabela.

---

## Row Level Security — RLS

As tabelas comerciais utilizam RLS.

O princípio adotado é:

> O frontend nunca deve ser considerado autoridade de segurança.

As políticas devem impedir que um usuário autenticado consulte ou altere dados pertencentes a outro usuário.

A autorização comercial definitiva deve ser controlada pelo backend.

---

## Funções do banco

### `private.set_updated_at()`

Função auxiliar para atualização automática de campos de data de alteração.

---

### `private.handle_new_user()`

Função executada pelo fluxo de cadastro para criação automática do perfil do usuário.

---

### `private.start_casillas_trial()`

Função protegida responsável pelo início do trial.

Características:

- exige usuário autenticado;
- utiliza `auth.uid()`;
- cria ou atualiza o trial;
- utiliza duração de 30 dias;
- trata trial expirado;
- executa com privilégios controlados;
- não fica disponível diretamente para usuários anônimos.

---

### `public.start_casillas_trial()`

Wrapper público controlado que chama a função privada.

A execução é permitida somente para usuários autenticados.

O wrapper não transforma o frontend em autoridade comercial; ele apenas fornece uma interface controlada para a operação de backend.

---

## Autoridade atual

| Área | Autoridade |
|---|---|
| Cálculos técnicos | Módulos do aplicativo |
| Interface | Frontend |
| Histórico local | IndexedDB |
| Identidade | Supabase Auth |
| Sessão | Supabase Auth |
| Trial de usuário não licenciado | Supabase / PostgreSQL |
| Licenças | Sistema comercial do backend |
| Entitlements | Sistema comercial do backend |
| Controle comercial de acesso | Backend |
| Eventos comerciais | Backend |
| Administração | Backend |

---

## Migração do sistema legado

O sistema possui atualmente duas camadas de acesso comercial.

### Sistema novo

O Supabase controla:

- identidade;
- sessão;
- trial;
- estrutura de licenças;
- estrutura de entitlements;
- estrutura de eventos;
- estrutura administrativa.

### Sistema legado

A ativação local existente ainda é mantida temporariamente para usuários que já possuem uma ativação válida.

Isso é uma estratégia de migração e compatibilidade.

O sistema legado não deve ser considerado a autoridade definitiva do novo sistema comercial.

As funções legadas ainda permanecem porque existem dependências no código atual que serão migradas posteriormente.

---

## Estado atual

### Concluído

- Projeto Supabase criado.
- Schema comercial criado.
- Produto Casillas criado.
- Tabelas comerciais criadas.
- RLS configurado.
- Policies iniciais configuradas.
- Perfil automático após cadastro.
- Trial backend de 30 dias.
- RPC de início do trial testada.
- Leitura autenticada do trial testada.
- Supabase Auth integrado.
- Fluxo de login e cadastro implementado.
- Sessão integrada ao aplicativo.
- Trial conectado ao usuário autenticado.
- Supabase definido como autoridade do trial para usuários não licenciados.
- Falha na verificação do trial não libera acesso por fallback local.

### Em desenvolvimento

- Licenciamento comercial.
- Entitlements operacionais.
- Controle definitivo de acesso.
- Registro de eventos de acesso.
- Operações comerciais seguras.
- Área administrativa.
- Integração de pagamentos.
- Migração gradual da ativação legada.

---

## Segurança

Não devem existir no frontend:

- `service_role`;
- senhas administrativas;
- chaves privadas;
- credenciais de banco;
- qualquer segredo que permita ignorar RLS ou autorização comercial.

O cliente Supabase do frontend utiliza somente credenciais públicas apropriadas para aplicações cliente.

A segurança depende de:

- Supabase Auth;
- RLS;
- policies;
- funções protegidas;
- validação no backend;
- separação entre identidade e autorização;
- não utilização do armazenamento local como autoridade comercial definitiva.

---

## Próximas etapas

1. Validar o fluxo completo de cadastro → login → sessão → trial → acesso.
2. Validar trial expirado.
3. Implementar licenciamento comercial.
4. Implementar entitlements.
5. Implementar controle definitivo de acesso.
6. Registrar eventos comerciais.
7. Criar operações administrativas seguras.
8. Integrar pagamentos.
9. Migrar definitivamente as funções comerciais legadas quando não houver mais dependências.
10. Realizar auditoria final de segurança.

---

## Testes atuais

Já foram realizados:

- testes de RLS;
- 17 testes de banco;
- teste de login;
- teste de criação automática de perfil;
- teste da RPC de trial;
- teste de leitura autenticada do trial;
- teste do cliente Supabase no frontend;
- teste local da integração do aplicativo;
- validação da correção de encoding de `trial.js`.

Commit relacionado à mudança de autoridade do trial:

`b238dde` — `fix: tornar Supabase autoridade do trial`

---

## Última atualização

27/09/2026