# Casillas App 2.0 — Progresso

## Infraestrutura

- [x] Repositório criado
- [x] Branch `casillas-2.0` publicada
- [x] Backup físico da versão 2.0
- [x] Versão v1.3.1 preservada
- [x] `origin` / `legacy` configurados
- [x] Node.js instalado
- [x] Git instalado
- [x] VS Code configurado
- [x] Supabase CLI configurado
- [x] Docker configurado

---

## Supabase

- [x] Projeto `Casillas` criado
- [x] CLI vinculada ao projeto
- [x] Schema comercial criado
- [x] Tabela `products`
- [x] Tabela `profiles`
- [x] Tabela `trials`
- [x] Tabela `licenses`
- [x] Tabela `entitlements`
- [x] Tabela `access_events`
- [x] Tabela `admin_roles`
- [x] RLS habilitado
- [x] Policies iniciais configuradas
- [x] Função de criação automática de perfil
- [x] Produto Casillas criado
- [x] Trial de 30 dias no backend
- [x] RPC de início do trial testada
- [x] Leitura autenticada do trial testada
- [x] Função privada de início do trial protegida
- [x] Wrapper público autenticado para início do trial
- [x] Uso do schema privado configurado

---

## Autenticação

- [x] Supabase Auth configurado
- [x] Login implementado
- [x] Cadastro implementado
- [x] Recuperação de senha implementada
- [x] Logout implementado
- [x] Persistência de sessão implementada
- [x] Página de autenticação criada
- [x] `auth.js` integrado
- [x] `auth-page.js` integrado
- [x] Aplicativo verifica usuário autenticado antes de iniciar
- [x] Usuário não autenticado é direcionado para `auth.html`
- [x] Perfil do usuário criado automaticamente pelo backend

---

## Frontend

- [x] Cliente Supabase
- [x] Bundle Supabase
- [x] `app.js` conectado ao Supabase
- [x] `auth.js` conectado ao aplicativo
- [x] `trial.js` conectado ao aplicativo
- [x] Fluxo de autenticação integrado à aplicação
- [x] Verificação central de acesso no carregamento do aplicativo
- [x] Trial conectado ao usuário autenticado

---

## Autoridade do Trial

- [x] Supabase utilizado como autoridade do trial para usuários não licenciados
- [x] Trial associado ao usuário autenticado
- [x] Verificação do trial realizada no backend
- [x] Trial expirado bloqueia o acesso
- [x] Falha na verificação do Supabase não libera acesso por fallback local
- [x] Sistema legado de ativação paga preservado durante a migração
- [x] Código de ativação legado continua válido para usuários já ativados
- [x] Funções legadas mantidas temporariamente por dependências existentes
- [x] Correção de encoding em `js/trial.js`
- [x] Teste local após correção de encoding
- [x] Commit `b238dde` — `fix: tornar Supabase autoridade do trial`
- [x] Alteração publicada em `origin/casillas-2.0`

> **Estado de migração:** o Supabase é a autoridade do trial para usuários não licenciados. A ativação paga legada continua funcionando temporariamente para preservar compatibilidade durante a migração para o novo sistema comercial.

---

## Testes

- [x] Testes de RLS
- [x] 17 testes de banco aprovados
- [x] Login Supabase testado
- [x] Usuário de teste criado
- [x] Trigger de criação de perfil testado
- [x] RPC de trial testada
- [x] Leitura autenticada do trial testada
- [x] Cliente Supabase no frontend testado
- [x] Aplicativo iniciado localmente
- [x] Verificação do trial integrada ao carregamento
- [x] Correção de encoding de `trial.js` validada
- [x] Arquivo corrigido testado em ambiente local

### Testes ainda necessários

- [ ] Teste integrado completo: cadastro → login → sessão → trial → acesso
- [ ] Teste de expiração real do trial
- [ ] Teste de usuário sem trial
- [ ] Teste de falha de conexão com Supabase
- [ ] Teste de acesso com licença legada já ativada
- [ ] Teste completo do fluxo de recuperação de senha
- [ ] Teste integrado em diferentes dispositivos/navegadores
- [ ] Teste final das regras RLS após conclusão do sistema comercial

---

## Sistema Comercial

### Concluído

- [x] Estrutura inicial de produtos
- [x] Estrutura de perfis
- [x] Estrutura de trials
- [x] Estrutura de licenças
- [x] Estrutura de entitlements
- [x] Estrutura de eventos de acesso
- [x] Estrutura de administradores
- [x] RLS inicial
- [x] Trial backend de 30 dias
- [x] Autoridade do trial transferida para Supabase

### Em desenvolvimento

- [ ] Licenciamento comercial
- [ ] Entitlements operacionais
- [ ] Controle definitivo de acesso
- [ ] Registro de eventos de acesso
- [ ] Operações comerciais seguras
- [ ] Área administrativa
- [ ] Integração de pagamentos

---

## Próximo passo

### Fase atual

**Migrar do trial para o sistema comercial completo.**

Prioridade:

1. Validar o fluxo completo de autenticação + trial.
2. Implementar o sistema de licenciamento.
3. Implementar `entitlements` como autoridade de acesso aos recursos pagos.
4. Integrar controle de acesso.
5. Registrar eventos comerciais relevantes.
6. Manter a ativação legada funcionando durante a migração.
7. Remover gradualmente a dependência do sistema comercial legado somente depois da migração completa.

---

## Princípio atual de arquitetura

O aplicativo possui duas áreas que devem permanecer separadas:

**Funcionalidade técnica**
- cálculos;
- módulos de usinagem;
- histórico local;
- funcionamento offline quando aplicável.

**Identidade e acesso comercial**
- usuário;
- sessão;
- trial;
- licença;
- entitlement;
- controle de acesso;
- eventos comerciais.

A persistência local não deve ser utilizada como autoridade definitiva para autorização comercial.

---

## Última atualização

27/09/2026
