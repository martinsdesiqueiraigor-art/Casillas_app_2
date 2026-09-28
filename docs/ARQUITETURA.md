# Casillas App 2.0 — Arquitetura

Estado deste documento: marco `24475a08cf6eadd83ec3fe8623735163540e5112`, branch `casillas-2.0`.

## Visão geral

O Casillas separa a interface e os cálculos técnicos da identidade e do acesso comercial. O Supabase é a autoridade para Auth, trial, licenças e entitlements. IndexedDB guarda estado de uso do aplicativo, não direitos comerciais.

## Inicialização e acesso

1. `auth.html` autentica a conta por Supabase Auth.
2. `js/app.js` verifica o usuário autenticado; sem sessão válida, encaminha para autenticação.
3. Antes de abrir a Home, `checkTrialStatus()` em `js/trial.js` consulta o entitlement comercial.
4. Entitlement válido libera o acesso; sem entitlement válido, o cliente consulta/inicia o trial remoto.
5. Trial `ACTIVE` dentro da validade libera o acesso; trial expirado ou erro sem alternativa válida mantém o bloqueio da interface.
6. Após a confirmação, o aplicativo abre a Home e carrega os módulos pelo mapa `MODULE_LOADERS` de `js/app.js`.

A ativação comercial envia o código à RPC `activate_casillas_license`; após a resposta, o cliente consulta novamente o entitlement antes de liberar a interface.

## Camadas

### Interface e módulos

- `index.html`: estrutura do aplicativo, cabeçalho, Home, navegação e tela de ativação.
- `js/app.js`: autenticação inicial, verificação de acesso, roteamento e carregamento dinâmico.
- `js/modules/home.js`: apresentação do estado de acesso recebido e atalhos para módulos existentes.
- `js/modules/*.js`: interface dos módulos técnicos; encaminha operações para funções de `js/calc/` quando aplicável.
- `css/`: tokens visuais, layout, componentes e estilos dos módulos.

### Identidade e sistema comercial

- `js/auth.js`, `js/auth-page.js`: operações de Supabase Auth usadas pelo fluxo de conta.
- `js/trial.js`: consulta entitlement e trial; conduz a ativação por RPC.
- Supabase/PostgreSQL: mantém trial, licenças, entitlements, eventos e controles de acesso.
- RLS e funções de banco limitam acesso a dados e operações comerciais.

### Estado local e PWA

- `js/db.js` e `js/state.js`: IndexedDB para estado do aplicativo e dados locais de interface.
- `service-worker.js`: cache PWA, atualmente `casillas-v10`; inclui a Home dinâmica.
- O cache de recursos não substitui Auth ou a validação online de trial/entitlement.

## Autoridade dos dados

| Informação | Autoridade |
|---|---|
| Identidade e sessão | Supabase Auth |
| Trial e validade | Supabase/PostgreSQL |
| Licença e entitlement | Sistema comercial no Supabase |
| Acesso comercial | Resultado validado pelo backend e apresentado pelo cliente |
| Estado da interface e preferências | IndexedDB |
| Fórmulas e cálculos | Módulos e funções locais de cálculo |

## Produto e módulos

A Home apresenta os 12 módulos em quatro grupos visuais: Cálculos; Roscas e ajustes; Usinagem; Guias e suporte. A lista nominal está no [README](../README.md). A Home não duplica cálculos nem cria uma regra própria de autorização.

## Repositório e organização

Repositório de desenvolvimento: [Casillas_app_2](https://github.com/martinsdesiqueiraigor-art/Casillas_app_2), branch `casillas-2.0`.

```text
index.html, auth.html
css/
js/app.js, js/auth*.js, js/trial.js
js/modules/, js/calc/, js/data/
dados/, icons/, manuais/
service-worker.js
supabase/migrations/, supabase/tests/
docs/
```

`gerar-codigo.html` permanece como ferramenta legada/admin independente e fora do fluxo comercial normal. A decisão de preservá-la temporariamente deve ser respeitada.

## Diretrizes de alteração

- Não transferir autoridade comercial ao navegador ou ao armazenamento local.
- Manter os módulos técnicos separados de Auth, trial e licenciamento.
- Antes de alterar roteamento ou cache, mapear os consumidores e validar a experiência PWA.
- Preservar documentos históricos e backups; corrigir somente o que estiver apresentado como estado atual.

Veja também [Segurança](SEGURANCA.md), [Mapa de dependências](MAPA-DEPENDENCIAS.md) e [Marco 2026-09-28](MARCO-2026-09-28-HOME-E-FLUXO-COMERCIAL.md).
## Responsabilidades e caminho de autorização

```text
Navegador
├── Interface e módulos técnicos (index.html, js/modules/, js/calc/)
├── Identidade e sessão (js/auth*.js → Supabase Auth)
├── Orquestração (js/app.js)
│   └── checkTrialStatus() (js/trial.js)
│       ├── RPC get_casillas_entitlement()
│       ├── sem entitlement válido → RPC start_casillas_trial()
│       └── ativação submetida → RPC activate_casillas_license()
└── IndexedDB (js/db.js, js/state.js): preferências/estado local

Supabase/PostgreSQL: identidade, dados comerciais e decisão de entitlement/trial
```

O fluxo e as verificações de acesso descritos aqui são os do cliente local. As funções remotas, permissões e políticas devem ser conferidas nas migrations disponíveis e em consultas somente leitura antes de afirmar o estado implantado.

## Relações e pontos de entrada

- `index.html` carrega `js/app.js`; `auth.html` usa a camada `js/auth-page.js`/`js/auth.js`.
- `js/app.js` importa `initDB`, estado local, `checkTrialStatus`, Supabase Auth e o mapa de loaders para Home/módulos.
- `js/trial.js` importa o cliente Supabase; não usa IndexedDB como autoridade comercial.
- `js/modules/home.js` recebe o estado de acesso e emite `casillas:navigate-module`; `js/app.js` recebe o evento e carrega o módulo.
- Os módulos técnicos mantêm a interface; `js/calc/` contém cálculos puros onde separados.
- `service-worker.js` guarda recursos estáticos, não a decisão de autorização.

## Sequência para mudanças estruturais

1. Confirmar branch, commit e estado local; identificar backups e arquivos não rastreados.
2. Mapear imports, exports, eventos, consumidores e recursos no pré-cache.
3. Delimitar mudanças de interface, código, migrations e configurações como tarefas separadas.
4. Alterar de forma pequena, preservando dados e autoridade comercial do backend.
5. Executar verificações do escopo, testar fluxo e revisar diff, whitespace e status.
6. Documentar o resultado e as limitações; publicar somente após validação e autorização apropriadas.