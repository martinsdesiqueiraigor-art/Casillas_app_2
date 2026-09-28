# Casillas App 2.0 — Mapa de dependências

## Estado de referência

Este mapa descreve o código local na branch `casillas-2.0`. A autorização comercial é decidida pelo Supabase; IndexedDB permanece voltado ao estado e aos dados locais do aplicativo. O Service Worker está na versão `casillas-v10`.

## Entrada e acesso

| Arquivo | Responsabilidade e relações |
|---|---|
| `index.html` | Estrutura da aplicação, telas de autenticação/ativação, navegação, banner do trial e carregamento de `js/app.js`. |
| `auth.html`, `js/auth-page.js`, `js/auth.js` | Interface e operações Supabase Auth; sessão identifica o usuário. |
| `js/app.js` | Ponto de entrada. Inicializa persistência, interface e menu; chama `checkTrialStatus()` antes de carregar Home. |
| `js/trial.js` | Consulta entitlement, consulta/inicia trial, ativa licença pela RPC e atualiza a interface de acesso. |
| `js/supabase.bundle.js` | Cliente Supabase usado no navegador. |
| `js/supabase.js` | Configuração pública do cliente; não deve conter credenciais secretas. |

## Fluxo de acesso

1. `js/app.js` exige sessão Supabase e interrompe a inicialização protegida se não houver usuário autenticado.
2. Antes de carregar o módulo inicial, chama `checkTrialStatus()` em `js/trial.js`.
3. `checkTrialStatus()` consulta `get_casillas_entitlement()`. A resposta válida libera o acesso comercial e oculta o banner de trial.
4. Sem entitlement válido, consulta `start_casillas_trial()`. Trial `ACTIVE` e dentro do prazo libera acesso e apresenta os dias restantes. Trial expirado ou falha de verificação bloqueia a interface.
5. A ativação de licença usa `activate_casillas_license`; depois o cliente confirma o entitlement.

As funções remotas são a autoridade dos dados comerciais. O resumo acima descreve a integração cliente; a definição implantada e as permissões devem ser verificadas separadamente no Supabase antes de mudanças de backend.

## Módulos técnicos e Home

`js/app.js` registra 12 módulos carregáveis: `trig`, `coni`, `poly`, `furos`, `rosca`, `tol`, `potencia`, `chaveta`, `conicpad`, `prog`, `guia` e `consult`. `home` é a tela inicial e catálogo, implementada em `js/modules/home.js`, não um dos 12 módulos técnicos listados.

A Home agrupa os módulos em Cálculos; Roscas e ajustes; Usinagem; Guias e suporte. O acesso rápido aponta para Trigonometria, Roscas, Potência de Corte e Programação CNC. A Home dispara `casillas:navigate-module`, tratado por `js/app.js`.

Os módulos técnicos devem continuar desacoplados de Auth, trial, licenciamento e operações comerciais.

## Dados locais

- `js/db.js` fornece acesso ao IndexedDB.
- `js/state.js` utiliza `getDB`/`setDB` para persistir estado e dados locais.
- Essa persistência não é autoridade para licença, entitlement ou validade de trial.

## Consultoria e ferramenta legada

`js/modules/consult.js` usa o helper de WhatsApp definido na própria área de consultoria; não depende mais de código de ativação por aparelho.

`gerar-codigo.html` é uma ferramenta independente legada de geração/hash local. Não participa do fluxo normal nem cria licenças no Supabase. A decisão registrada é preservá-la temporariamente para eventual acesso administrativo direto. `service-worker.js` ainda a inclui no pré-cache, sem lógica específica para ela.

## Service Worker

`service-worker.js` pré-cacheia HTML, CSS, JavaScript e recursos da PWA usando `casillas-v10`. Mudanças nos arquivos carregados devem considerar invalidação e teste de cache. A presença no cache não significa que um recurso participe do fluxo de autorização.

## Divergência a acompanhar

O código cliente chama `get_casillas_entitlement()`. A busca local do histórico de migrations não localizou uma migration correspondente à função; a existência e definição remotas foram informadas como já implantadas. Manter a origem versionada dessa função como pendência de rastreabilidade, sem inferir que o backend remoto esteja ausente.
## Mapa operacional compacto

| Arquivo/camada | Importa ou chama | Consumidores/risco |
|---|---|---|
| `index.html` | Carrega `js/app.js`; declara menu e áreas da interface. | Entrada da PWA; revisar com navegação e estilos. |
| `auth.html` | Carrega o fluxo de página de autenticação. | `js/auth-page.js` e `js/auth.js` usam Supabase Auth. |
| `js/app.js` | `db.js`, `state.js`, `trial.js`, `auth.js`, Supabase, menu/teclado e loaders dinâmicos. | Orquestra inicialização e autorização; alto risco. |
| `js/trial.js` | `supabase.bundle.js`; RPCs de entitlement, trial e ativação. | Chamado por `app.js`; alto risco comercial. |
| `js/db.js` | IndexedDB. | Inicialização em `app.js`; `state.js` usa persistência. Não usar como autorização. |
| `js/state.js` | `db.js`. | `app.js` e módulos; `getDB`/`setDB` atendem estado local. |
| `js/modules/home.js` | Ícones e DOM; emite `casillas:navigate-module`. | Recebe estado de acesso; evento tratado por `app.js`. |
| `js/modules/*.js` | Utilitários, estado e `js/calc/` quando aplicável. | Loader dinâmico em `app.js`; manter sem dependência comercial. |
| `js/modules/consult.js` | Helpers de WhatsApp e estado/UI local. | Ação de ativação leva ao suporte; não importa mais `trial.js` para código por aparelho. |
| `js/supabase.js` / `js/supabase.bundle.js` | Configuração pública / cliente empacotado. | Auth e `trial.js`; nenhum secret administrativo pode ir ao navegador. |
| `service-worker.js` | `CACHE_ASSETS`, incluindo módulos e arquivos estáticos. | Atualização de cache pode servir código antigo; revisar versão e instalação PWA. |

### Dependências críticas e riscos

- Mudanças em `trial.js` precisam considerar a ordem Auth → entitlement → trial, UI de bloqueio/banner, handler de ativação e chamadas do `app.js`.
- Mudanças em `app.js` podem afetar os loaders, títulos, menus, estado de acesso e eventos Home.
- Mudanças em `db.js`/`state.js` podem afetar persistência de múltiplos módulos, mas não devem alterar autorização comercial.
- Mudanças em módulo devem conferir menu (`index.html`), `MODULE_LOADERS`/`MODULE_TITLES`, catálogo Home, CSS, dados e `CACHE_ASSETS`.
- Mudanças de RPC/schema dependem de migrations versionadas, RLS/grants e revisão remota independente; não inferir que fonte local e remota estejam sincronizadas.

### Checklist antes de substituir ou remover

1. Buscar imports, exports, chamadas por nome, listeners/eventos e referências de texto no projeto.
2. Conferir se páginas administrativas, ferramentas HTML, documentação ou Service Worker usam o recurso.
3. Confirmar o comportamento substituto e compatibilidade dos dados existentes.
4. Fazer backup somente conforme escopo autorizado, sem sobrescrever backups antigos.
5. Implementar alteração mínima; validar sintaxe, lint/testes pertinentes, interface, PWA/cache e diff.
6. Conferir `git status --short` para garantir que só os arquivos pretendidos foram tocados.