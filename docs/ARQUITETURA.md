# Casillas App 2.0 — Arquitetura

## Visão geral

O Casillas 2.0 é dividido em quatro responsabilidades principais:

1. Aplicativo
2. Conta e autenticação
3. Sistema comercial
4. Persistência local

A separação existe para evitar que regras comerciais e de segurança fiquem dependentes do frontend.

## 1. Aplicativo

Responsável por:

- Interface
- Navegação
- Calculadoras técnicas
- Histórico local
- Preferências
- Teclado personalizado
- Funcionamento offline

Os módulos técnicos não devem depender diretamente do sistema comercial.

## 2. Conta e autenticação

Responsável por:

- Cadastro
- Login
- Logout
- Sessão
- Identificação do usuário
- Recuperação de acesso

Tecnologia:

- Supabase Auth
- @supabase/supabase-js

O usuário autenticado é identificado pelo Supabase Auth.

## 3. Sistema comercial

Responsável por:

- Trial
- Licença
- Entitlements
- Controle de acesso
- Eventos comerciais
- Administração
- Futuramente pagamentos

A autoridade comercial deve permanecer no backend.

### Tabelas principais

- products
- profiles
- trials
- licenses
- entitlements
- access_events
- admin_roles

## 4. Persistência local

Responsável por:

- Histórico
- Estado do aplicativo
- Preferências
- Dados necessários para funcionamento offline
- Cache

IndexedDB e armazenamento local não devem ser utilizados como autoridade para:

- validade da licença
- duração real do trial
- autorização comercial
- quantidade de dispositivos autorizados

## Fluxo conceitual

USUÁRIO
   |
   v
CASILLAS APP
   |
   +----> Interface
   |
   +----> Módulos técnicos
   |
   +----> Persistência local
   |
   v
SUPABASE AUTH
   |
   v
USUÁRIO AUTENTICADO
   |
   v
SISTEMA COMERCIAL
   |
   +----> Trial
   +----> Licença
   +----> Entitlements
   +----> Controle de acesso
   |
   v
BANCO POSTGRESQL

## Autoridade das informações

| Informação | Autoridade |
|---|---|
| Cálculos técnicos | Código dos módulos |
| Interface | Frontend |
| Histórico local | IndexedDB |
| Sessão | Supabase Auth |
| Identidade do usuário | Supabase Auth |
| Trial | Supabase |
| Licença | Supabase |
| Entitlements | Supabase |
| Autorização comercial | Backend |
| Administração | Backend |
## Segurança

O frontend nunca deve ser considerado uma autoridade de segurança.

O cliente pode:

- solicitar informações
- apresentar informações
- iniciar operações autorizadas

O backend deve:

- validar identidade
- validar permissões
- controlar operações comerciais
- proteger dados sensíveis

## Regra de dependência

Os módulos técnicos devem permanecer independentes de:

- Supabase
- Auth
- Licenciamento
- Trial
- Pagamentos

A camada comercial deve se comunicar com o aplicativo por interfaces bem definidas.

## Estrutura atual

Casillas_app/
├── css/
├── dados/
├── icons/
├── js/
│   ├── app.js
│   ├── db.js
│   ├── state.js
│   ├── trial.js
│   ├── supabase.js
│   ├── supabase.bundle.js
│   └── modules/
├── manuais/
├── supabase/
│   ├── migrations/
│   └── tests/
├── docs/
└── index.html

## Diretriz para futuras alterações

Antes de substituir ou alterar significativamente um arquivo:

1. Identificar quem importa o arquivo
2. Identificar quem utiliza suas funções
3. Identificar efeitos colaterais
4. Criar backup ou ponto de restauração
5. Implementar a alteração
6. Executar testes
7. Verificar o comportamento do aplicativo
8. Criar commit

## Objetivo arquitetural

A arquitetura final deve permitir:

- aplicativo técnico independente
- autenticação confiável
- trial controlado pelo backend
- licenciamento seguro
- funcionamento offline das calculadoras
- evolução comercial sem reescrever os módulos técnicos