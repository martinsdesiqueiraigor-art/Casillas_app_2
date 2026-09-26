# Casillas App 2.0 — Mapa de Dependências

## Objetivo

Este documento registra as principais relações entre os arquivos do Casillas 2.0.

O objetivo é evitar alterações importantes sem verificar previamente quem depende de cada arquivo.

---

## Arquivos principais

| Arquivo | Responsabilidade |
|---|---|
| index.html | Estrutura principal da aplicação |
| js/app.js | Inicialização e controle principal |
| js/trial.js | Sistema de trial e ativação |
| js/db.js | Persistência local |
| js/state.js | Estado da aplicação |
| js/supabase.js | Configuração do cliente Supabase |
| js/supabase.bundle.js | Cliente Supabase empacotado |
| js/modules/ | Módulos técnicos |
| service-worker.js | Cache e funcionamento PWA |

---

## Relações principais

### index.html

Depende de:

- js/app.js

Responsabilidade:

- carregar a aplicação
- fornecer a estrutura HTML
- disponibilizar elementos da interface

---

### js/app.js

Importa ou utiliza:

- js/db.js
- js/trial.js
- js/supabase.bundle.js

Responsabilidade:

- inicializar o aplicativo
- controlar o fluxo principal
- inicializar módulos
- verificar o acesso ao aplicativo
- coordenar a interface

É um arquivo de alta dependência.

Alterações significativas devem ser feitas de forma cirúrgica.

---

### js/trial.js

Importa ou utiliza:

- js/db.js
- js/supabase.bundle.js

Também é utilizado por:

- js/app.js
- js/modules/consult.js

Responsabilidade atual:

- trial local legado
- ativação
- códigos de ativação
- identificação de dispositivo
- integração inicial com Supabase

Estado arquitetural:

O sistema local ainda existe.

O Supabase já possui o trial de 30 dias no backend, mas a integração ainda não substituiu completamente a autoridade local.

---

### js/db.js

Utilizado por:

- js/app.js
- js/state.js
- js/trial.js

Responsabilidade:

- IndexedDB
- persistência local

Não deve ser utilizado como autoridade para:

- licença
- trial comercial
- autorização comercial
- permissões de usuário

---

### js/state.js

Depende de:

- js/db.js

Responsabilidade:

- gerenciamento do estado local da aplicação
- persistência de informações relacionadas ao funcionamento do aplicativo

---

### js/modules/

Contém os módulos técnicos do Casillas.

Responsabilidade:

- cálculos
- fórmulas
- ferramentas técnicas
- funcionalidades específicas de usinagem

Regra arquitetural:

Os módulos técnicos devem permanecer independentes de:

- Supabase
- autenticação
- trial
- licenciamento
- pagamentos

---

### js/modules/consult.js

Possui dependência histórica de:

- js/trial.js

Utiliza:

- WHATSAPP
- getActivationCodeForCurrentDevice()

Também possui funcionalidades relacionadas a:

- consultoria
- ativação
- comunicação
- links comerciais

Esta dependência deve ser considerada antes de alterar ou reescrever trial.js.

---

### js/supabase.js

Responsabilidade:

- configuração do cliente Supabase
- URL do projeto
- chave pública do projeto

Não deve conter:

- service_role
- secret keys
- senhas
- credenciais administrativas

Este arquivo serve como fonte de configuração para o cliente Supabase antes do empacotamento.

---

### js/supabase.bundle.js

Responsabilidade:

- disponibilizar o cliente Supabase para o frontend estático

Motivo:

O GitHub Pages não resolve diretamente o import de:

@supabase/supabase-js

O bundle permite que o navegador carregue o cliente Supabase como módulo local.

---

### service-worker.js

Possui dependências relacionadas a:

- js/app.js
- js/trial.js
- js/db.js

Responsabilidade:

- cache
- recursos offline
- funcionamento PWA

Alterações em arquivos JavaScript importantes devem considerar o cache do Service Worker.

---

## Supabase

O sistema comercial possui as seguintes entidades principais:

- products
- profiles
- trials
- licenses
- entitlements
- access_events
- admin_roles

### Relações conceituais

Usuário autenticado:

Supabase Auth

↓

profiles

↓

trials

licenses

entitlements

↓

controle de acesso comercial

---

## Autoridade das informações

### Frontend

Autoridade:

- interface
- navegação
- apresentação
- cálculos executados no cliente

Não é autoridade para:

- licença
- trial comercial
- autorização
- permissões administrativas

### IndexedDB

Autoridade:

- histórico local
- preferências
- estado local
- dados necessários ao funcionamento offline

Não é autoridade comercial.

### Supabase Auth

Autoridade:

- identidade do usuário
- sessão
- autenticação

### Backend / Supabase

Autoridade:

- trial
- licenças
- entitlements
- autorização comercial
- operações administrativas

---

## Dependências críticas

As seguintes dependências devem ser verificadas antes de alterações importantes:

### trial.js

Verificar:

- app.js
- consult.js
- service-worker.js
- gerar-codigo.html

### app.js

Verificar:

- index.html
- trial.js
- db.js
- módulos
- service-worker.js

### db.js

Verificar:

- app.js
- state.js
- trial.js

### supabase.bundle.js

Verificar:

- app.js
- trial.js
- futuras camadas de autenticação
- futuras camadas comerciais

---

## Regra para substituição de arquivos

Nenhum arquivo de alta dependência deve ser substituído diretamente sem:

1. Mapear seus consumidores
2. Verificar imports
3. Verificar funções exportadas
4. Verificar efeitos colaterais
5. Criar ponto de restauração
6. Implementar
7. Testar
8. Comparar comportamento
9. Criar commit

---

## Arquivos de maior risco de alteração

### Alto risco

- js/app.js
- js/trial.js
- js/db.js
- service-worker.js

### Risco médio

- js/state.js
- js/modules/consult.js
- js/supabase.js

### Menor risco arquitetural

- novos módulos técnicos isolados
- documentação
- CSS aditivo

---

## Estratégia para o Casillas 2.0

A evolução deve seguir esta ordem:

1. Autenticação
2. Conta do usuário
3. Integração do trial com usuário autenticado
4. Licenciamento
5. Controle de acesso
6. Operações comerciais seguras
7. Administração
8. Pagamentos
9. Segurança final
10. Publicação

Os módulos técnicos existentes devem permanecer independentes desse processo.