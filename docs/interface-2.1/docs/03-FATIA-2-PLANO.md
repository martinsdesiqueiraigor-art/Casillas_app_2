# Fatia 2 — Início e calculadoras nos novos painéis (plano)

Estado: plano. Não executa nada. Depende de **D1** em `01-DECISOES-2.1.md` (redesenho liberado). O patch de tokens (fatia 1) já existe no commit local `141adf3`, branch `casillas-2.1-ui-tokens`.

## 1. O que o código já oferece

A interface da v2 já é feita de classes compartilhadas, então a maior parte do visual novo vem do CSS, não de reescrever módulos.

- Componentes comuns em `css/components.css`: `.card`, `.input-group`, `.input`, `.input-with-clear`, `.btn` (`-primary`, `-secondary`, `-outline`), `.kpi-card`, `.result-row`, `.result-label`, `.result-value`, `.result-hint`, `.table-wrap`, `.data-table`, `.toast-*`, `.trial-banner`.
- Todas as cores passam por `css/variables.css`. Só 15 valores fixos fora dele, quase todos texto escuro sobre laranja.
- Módulos de cálculo (`coni.js` como exemplo) montam a tela com `createElementSafe` e as mesmas classes, sem `innerHTML`.
- Início (`js/modules/home.js`): `hero`, cartão de acesso (`home-access-card`, com variantes `is-trial`, `is-licensed`, `is-verified`), acesso rápido (`trig`, `rosca`, `potencia`, `prog`) e catálogo em 4 grupos.

## 2. Contraste da paleta nova (WCAG, calculado)

| Par | Razão | Resultado |
|---|---|---|
| Texto principal sobre card | 15,55 | passa |
| Texto secundário sobre card | 6,80 | passa |
| Texto apagado sobre fundo / card | 5,71 / 5,23 | passa (o valor antigo dava 4,12, abaixo de 4,5) |
| Laranja sobre card / fundo | 6,65 / 7,27 | passa |
| Texto escuro sobre botão laranja | 7,14 | passa |
| Azul, verde, âmbar sobre card | 6,59 / 9,54 / 9,80 | passa |
| Vermelho (erro) sobre card | 5,18 | passa |

## 3. Plano por etapa (cada uma é um commit pequeno e revisável)

| Etapa | Arquivos | Mudança | Risco |
|---|---|---|---|
| 2.1 Componentes base | `css/components.css` | Cartões, campos de entrada, botões, linhas de resultado e KPIs com o acabamento dos painéis novos (bordas, raios, estados de foco e toque) | Baixo, só CSS |
| 2.2 Resultado em destaque | `css/components.css` + uma classe opcional em `js/modules/*.js` | Valor principal do cálculo em destaque laranja (`.result-row--primary`), demais em tom neutro | Baixo; a classe é opcional, o módulo sem ela não muda |
| 2.3 Início | `css/layout.css` ou `modules.css` (classes `home-*`), `js/modules/home.js` se necessário | Cartão de acesso e acesso rápido com a identidade nova. Os estados de acesso continuam vindo do servidor | Médio: mexe em tela de status comercial; só apresentação |
| 2.4 Calculadoras | `js/modules/{trig,coni,poly,furos,rosca,tol,chaveta,conicpad,potencia,prog}.js` + CSS | Padronizar cabeçalho, seletor de modo e bloco de resultado, módulo a módulo | Médio; fórmulas em `js/calc/` não são tocadas |
| 2.5 Verificação | — | Regressão automática existente + roteiro manual abaixo | — |

Ordem: 2.1 e 2.2 antes de tudo, porque beneficiam todos os módulos de uma vez. Depois 2.3, depois 2.4 do mais simples (conicidade, polígonos) ao mais complexo (roscas, potência).

## 4. O que não mexe

- `js/calc/*` (fórmulas). Qualquer ajuste de cálculo é outra tarefa, com teste independente.
- Auth, trial, entitlement, lease offline, `app.js` (lógica), Service Worker e migrations.
- Se uma etapa precisar de arquivo novo de runtime, ela para e pede decisão: entra em `CACHE_ASSETS`, com versão nova do SW.

## 5. Verificação

Automática (já existe): `npm run test:ev3`, `tests/trial-access.test.mjs`, `production-gate.mjs validate`, `git diff --check`. Nenhuma cobre aparência.

Manual, por etapa, em 360 px, 390 px e desktop, no tema escuro:
- Início com teste, licença ativa, offline e "validação necessária" (os quatro estados);
- cada calculadora: digitar, calcular, limpar, erro de entrada;
- teclado numérico customizado abrindo sobre o novo layout;
- menu lateral e menu de opções;
- foco por teclado visível; zoom do navegador a 200%.

## 6. Pendências que bloqueiam este plano

- **D1** (redesenho liberado) e **D6** (barra inferior) — esta última só afeta o 2.3.
- Tenho os mockups de Início e das calculadoras de uma conversa anterior; antes do 2.3 e do 2.4 confirmo cada tela contra eles, módulo a módulo. **Não consigo ver os módulos rodando aqui** sem um navegador sobre o app autenticado; as telas dependem de login. A conferência visual final é sua, ou de uma sessão com o app aberto.
- O que for "novo comportamento" (por exemplo busca na Início) fica de fora desta fatia, salvo decisão.
