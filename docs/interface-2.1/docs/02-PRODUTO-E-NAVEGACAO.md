# Produto e navegação

Atualizado em: 2026-10-10 (CAS-DOC-RECONCILIACAO-01). Descreve o app como está no código da produção (`casillas-2.0`) e o estado da modernização da interface (CAS-UI).

## 1. O que o app é

PWA de calculadora técnica de usinagem para torneiros, fresadores e ferramenteiros. HTML, CSS e JavaScript puros, sem framework (`manifest.json`, `index.html`). Cálculos rodam no cliente. Login, trial e licença dependem do Supabase.

## 2. Navegação e módulos

Entrada: `index.html` + `js/app.js` (`MODULE_LOADERS`). Navegação principal por **barra inferior de 4 itens**: Início, Calculadoras, Guia CNC e Biblioteca (`js/bottom-nav.js`). O **menu lateral** (`#side-menu`, `js/menu.js`) continua até que suas funções tenham novo lugar (CAS-UI-D6). O Consultor Técnico é acessado pela Início.

| Área | Módulo (chave) | Arquivo |
|---|---|---|
| Início | `home`; Consultor Técnico (`consultor-tecnico`) | `home.js`, `consultor/index.js` |
| Calculadoras | Lista (`calculadoras`); Trigonometria, Conicidade, Polígonos, Furação Circular, Roscas, Tolerâncias ISO, Chaveta DIN 6885, Conicidades Padrão, Potência de Corte (`trig`, `coni`, `poly`, `furos`, `rosca`, `tol`, `chaveta`, `conicpad`, `potencia`); Programação CNC (`prog`) | `js/modules/*.js`, kit em `js/modules/ui/calcKit.js`, cálculos em `js/calc/*.js` |
| Guia CNC | `guia` | `guia.js`, `guia/` |
| Biblioteca | Contato, Serviços, Cursos e Licença (`consult`, antiga Consultoria) | `consult.js` |

Fora do app principal: `auth.html` (login, cadastro, recuperação de senha) e `offline.html` (fallback). Configurações (protótipo aprovado) ainda não existe no código.

**Biblioteca**: a aba e sua interface atuais são preservadas (CAS-UI-D15). A **Biblioteca Técnica** prevista na linha `casillas-2.2` é uma funcionalidade distinta, com organização interna a decidir.

## 3. Estados de acesso mostrados ao usuário

Definidos em `js/app.js` (`refreshAccess`) e `js/trial.js`. A interface só apresenta; quem decide é o servidor.

| Texto no cabeçalho | Significa |
|---|---|
| Período de teste · Nd | Trial ativo, N dias restantes |
| Acesso ativo | Licença ativa |
| Modo offline | Acesso por lease local válido (até 7 dias) |
| Validação necessária | Sem acesso confirmado; abre a tela de ativação |

Banner de trial com faixas de dias (mais de 7, 4 a 7, últimos 3) e botão Ativar.

## 4. Guia CNC e Consultor

- Banco canônico: `js/modules/guia/bancoCiclosCNC.js`, 4 ciclos: `fanuc_torno_g76`, `fanuc_centro_de_usinagem_g83`, `siemens_torno_cycle97`, `siemens_centro_de_usinagem_cycle83`. O G76 tem conteúdo estendido em `guia/conteudo2.js` (schema_version 2), rascunho com selo "Em revisão técnica".
- Deep link: `#/guia/<id>?tab=<aba>&acc=<acordeão>`.
- Consultor: extrai controlador, máquina, operação e código; resolve só com esses campos; abre o Guia no ciclo achado. Busca livre ainda não existe (CAS-UI-D5). Fonte: `docs/EV3-CONSULTOR-GUIA.md`.

## 5. Estado das mudanças da CAS-UI

| Mudança | Decisão | Estado |
|---|---|---|
| Paleta e tokens | CAS-UI-D17 | Tokens alinhados em `141adf3`; consolidação futura sem substituição global |
| Início e calculadoras nos painéis aprovados | CAS-UI-D1 | Calculadoras feitas (2.13, 2.14). Início parcial: cabeçalho legado, sem engrenagem nem campo do Consultor |
| Barra inferior | CAS-UI-D6 | Feita (2.6). Menu lateral permanece |
| Guia com variantes, trajetória, passos, cuidados e selo | CAS-UI-D2, D3, D4 | Feita para o G76 (2.9); demais ciclos pendentes |
| Consultor com busca de texto livre | CAS-UI-D5 | Não implementada |
| Biblioteca | CAS-UI-D7, D15 | Feita (2.8) |
| Configurações e inglês | CAS-UI-D8 | Não implementadas |

## 6. Padrões de interface

- Tema escuro, PT-BR (inglês depois da revisão do Product Owner). Os protótipos aprovados em `docs/interface-2.1/telas/` são a referência visual vigente e podem ser substituídos por versões futuras aprovadas.
- 48 px nas ações principais, 44 px no mínimo geral (CAS-UI-D17).
- Sem emoji; ícones consistentes e acessíveis, preferencialmente SVG de um conjunto.
- Cor nunca é a única indicação de estado: sempre vem com texto.
- Todo conteúdo CNC sem revisão técnica mostra "Em revisão técnica".

## 7. O que não muda sem missão específica

Auth, trial, licença, entitlement, RLS, rate limit, lease offline, fluxo de venda, gate de publicação, cálculos, service worker e Consultor determinístico (`AGENTS.md` §16). Qualquer fatia da CAS-UI passa por eles sem alterá-los.
