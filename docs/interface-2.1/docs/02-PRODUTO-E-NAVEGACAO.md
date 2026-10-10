# Produto e navegação

Estado: rascunho. Descreve o app **como está no código** (branch `casillas-2.0`) e marca o que o 2.1 propõe mudar.

## 1. O que o app é

PWA de calculadora técnica de usinagem para torneiros, fresadores e ferramenteiros. HTML, CSS e JavaScript puros, sem framework (`manifest.json`, `index.html`). Cálculos rodam no cliente. Login, trial e licença dependem do Supabase.

## 2. Telas e módulos hoje

Entrada: `index.html` + `js/app.js` (`MODULE_LOADERS`, 14 chaves). Navegação por menu lateral (`#side-menu`) e cartões da Início (`js/modules/home.js`).

| Grupo no menu | Módulo (chave) | Arquivo |
|---|---|---|
| Início | Visão geral (`home`), Consultor Técnico (`consultor-tecnico`) | `home.js`, `consultor/index.js` |
| Cálculos | Trigonometria, Conicidade, Polígonos, Furação Circular, Roscas (`trig`, `coni`, `poly`, `furos`, `rosca`) | `js/modules/*.js`, cálculo em `js/calc/*.js` |
| Consultas | Tolerâncias ISO, Chaveta DIN 6885, Conicidades Padrão (`tol`, `chaveta`, `conicpad`) | idem, dados em `js/data/*.js` |
| Produção | Potência de Corte, Programação CNC (`potencia`, `prog`) | idem |
| Suporte e recursos | Guia de Programação (`guia`), Consultoria (`consult`), Compartilhar app | `guia.js`, `consult.js` |

Fora do app principal: `auth.html` (login, cadastro, recuperação de senha) e `offline.html` (fallback).

## 3. Estados de acesso mostrados ao usuário

Definidos em `js/app.js` (`refreshAccess`) e `js/trial.js`. A interface só apresenta; quem decide é o servidor.

| Texto no cabeçalho | Significa |
|---|---|
| Período de teste · Nd | Trial ativo, N dias restantes |
| Acesso ativo | Licença ativa |
| Modo offline | Acesso por lease local válido (até 7 dias) |
| Validação necessária | Sem acesso confirmado; abre a tela de ativação |

Banner de trial com faixas de dias (mais de 7, 4 a 7, últimos 3) e botão Ativar.

## 4. Guia CNC e Consultor hoje

- Banco: `js/modules/guia/bancoCiclosCNC.js`, 4 ciclos: `fanuc_torno_g76`, `fanuc_centro_de_usinagem_g83`, `siemens_torno_cycle97`, `siemens_centro_de_usinagem_cycle83`. Cada um com abas `referencia` (sintaxe e parâmetros) e `exemplo` (código).
- Deep link: `#/guia/<id>?tab=<aba>&acc=<acordeão>`.
- Consultor: extrai controlador, máquina, operação e código; resolve só com esses campos; abre o Guia no ciclo achado. Fonte: `docs/EV3-CONSULTOR-GUIA.md`.

## 5. O que o 2.1 propõe mudar (depende de `01-DECISOES-2.1.md`)

| Mudança | Depende de |
|---|---|
| Paleta nova (laranja `#ff7a1a`, azul `#4aa3ff`, fundo `#0b1118`), só tokens | D1 (patch `0001` já pronto) |
| Início e calculadoras no formato dos painéis novos | D1 |
| Barra inferior sobre o menu lateral | D6 |
| Guia com variantes, trajetória, passos, cuidados e selo de revisão | D2, D3, D4 |
| Consultor com busca por texto livre | D5 |
| Biblioteca | D7 |
| Português e inglês | D8 |

## 6. O que não muda

Auth, trial, licença, entitlement, RLS, rate limit, lease offline, fluxo de venda e gate de publicação. Qualquer fatia do 2.1 passa por eles sem alterá-los.
