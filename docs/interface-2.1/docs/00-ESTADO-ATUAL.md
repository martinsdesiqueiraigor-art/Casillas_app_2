# Estado atual — CAS-UI (Modernização da Interface)

Atualizado em: 2026-10-10 (missão CAS-DOC-RECONCILIACAO-01; referências de estado corrigidas na missão CAS-UI-HOME-PLAN-01). Fonte oficial de estado e próxima atividade. Os SHAs abaixo foram conferidos com `git fetch` e `git ls-remote` nesta data; **reconfirme no Git antes de agir** (veja `CLAUDE.md`).

CAS-UI é a frente de modernização da interface. Não é a release `v2.1.0` (a produção anterior, `1b3082e`).

## 1. Branches e SHAs

| Branch | SHA | Papel | Observação |
|---|---|---|---|
| `casillas-2.0` | `cd1411f` | **Produção** (HEAD da branch) | Merge do PR 12 (só documentação). CI pós-merge aprovada (run 38090964537). Sem deploy: o código do app é idêntico ao de `c115a3e` |
| `casillas-2.0` (publicado) | `c115a3e` | **Aplicativo publicado** | Merge do PR 11. Service worker `casillas-v20`. Deploy bem-sucedido (run 38078685051) |
| `casillas-2.1-fatia-2` | `f585ef0` | Desenvolvimento da CAS-UI | Árvore idêntica à produção. Aparece "5 commits atrás" só pelos merges dos PRs 7 a 11 |
| `casillas-2.1-ui-tokens` | `d91cdbd` | Tokens e protótipos | Ancestral de `fatia-2`, sem conteúdo novo |
| `casillas-2.2` | `88b1183` | Linha de governança e desenvolvimento | **Pendente de integração.** 4 commits documentais de 06/10, 29 atrás de `casillas-2.0`. Preservada; não encerrada, não mesclada |
| `casillas-2.0-hardening`, `feature/cas21-ev3-01`, `audit/security-review`, `main` | — | Históricas | `main` é o legado v1 |

Tag `v2.1.0` = `1b3082e` (release homologada anterior à CAS-UI).

## 2. Produção

- Aplicativo publicado: `c115a3e`, service worker `casillas-v20`. O HEAD da branch (`cd1411f`) difere só em documentação e não exige deploy. Endereço: https://martinsdesiqueiraigor-art.github.io/Casillas_app_2/
- Deploys por workflow manual (`static.yml`, aprovação do environment `github-pages` pelo Product Owner). Bem-sucedidos em `1e771b1`, `b43dfc1`, `9cd82a3` e `c115a3e`. O deploy de `61a276c` (PR 10) foi cancelado e substituído; `c115a3e` o inclui.
- O Product Owner abriu e instalou o app no smartphone e no desktop. Isso não é registro de validação de fidelidade (veja `CHECKLIST-TELAS.md`).

## 3. Etapas realizadas

Três numerações convivem nos registros antigos: etapas `2.x` (commits e PRs), itens `B1–B14` (mapa antigo, descontinuado) e fatias (plano `03-FATIA-2-PLANO.md`). A tabela é a correspondência. Em `03-FATIA-2-PLANO.md`, a "2.5 Verificação" nunca foi uma etapa de código; no Git, 2.5 é a lista de Calculadoras.

| Etapa | Item antigo | Conteúdo | Commit(s) | PR / SW |
|---|---|---|---|---|
| Tokens | A5 | Tokens de design em `css/variables.css` | `141adf3` | — |
| Protótipos | — | Telas aprovadas e documentação em `docs/interface-2.1/` | `d91cdbd` | — |
| 2.1 | B1 | Componentes base (toque, foco) | `7999596` | PR 7 · v14 |
| 2.2 | B2 | Resultado em destaque (`.result-row--primary`) | `48700bf` | PR 7 |
| 2.3 | B3 | Início (estado do acesso, cartão do Consultor, acesso rápido) | `95e25bf`, `39e1a30` | PR 7 |
| 2.4 | B4 | Abas de modo e resultado em destaque (7 módulos) | `b607f50` | PR 7; refeita em 2.13 e 2.14 |
| 2.5 | B5 | Lista de Calculadoras (busca, categorias) | `320410b`, `17da8ea` | PR 7 / PR 8 |
| 2.6 | B6 | Barra inferior de 4 itens | `406d411`, `3d8dc1b` | PR 7 |
| 2.7 | B7 | Login, Criar conta, Nova senha, Ativação | `0284edc` | PR 7 |
| 2.8 | B11 | Biblioteca (Contato, Serviços, Cursos, Licença) | `052fe6c` | PR 7 |
| Release | E3 | Service worker v14 e docs | `5319c83`; merge `1e771b1` | PR 7 · v14 |
| 2.9 | B9 (parcial) | Guia CNC no design aprovado; conteúdo estendido só do G76 (`conteudo2.js`, rascunho com selo) | `7b0bb91` | PR 8 · v15 |
| 2.10 | — | Moldura: KPIs só nos cálculos; cabeçalho sem emoji | `eb0e318`; merge `b43dfc1` | PR 8 |
| 2.11 | B10 (parcial) | Ajustes do teste no celular: Instalar App, cabeçalho; Consultor Técnico no visual aprovado | `482e0b3`, `0bda7da`; merge `9cd82a3` | PR 9 · v16–v17 |
| 2.12 | — | Instalar App compacto, títulos sem emoji, campo do Consultor | `bab134b`; merge `61a276c` | PR 10 · v18 |
| 2.13 | B4 | Conicidade no design aprovado e kit `calcKit.js` | `37c466f` | PR 11 · v19 |
| 2.14 | B4 | As 9 calculadoras no kit (cálculos inalterados) | `f585ef0`; merge `c115a3e` | PR 11 · v20 |

## 4. Pendências comprovadas no código

- **Início**: o cabeçalho ainda é o legado (botão `☰`, texto "Casillas", menu `⋮` com emojis). O protótipo tem logo e engrenagem. O cartão do Consultor é um botão, sem o campo de pergunta do protótipo.
- **Configurações**: sem módulo nem tela (idioma só após revisão do inglês, CAS-UI-D8).
- **Menu lateral**: continua em `index.html` até as funções dele terem novo lugar (CAS-UI-D6).
- **Consultor**: busca por texto livre não existe (CAS-UI-D5). O campo atual usa o mecanismo existente (slots e FSM).
- **Guia CNC**: só o G76 tem conteúdo estendido; os outros ciclos seguem no formato do EV3.
- **Ícones**: emojis e símbolos ainda em `index.html`, `js/app.js`, `js/menu.js`, `prog.js`, `home.js` (✓, ◷). Identidade e ícones são provisórios.
- **Números**: `formatNumber` exibe ponto decimal; o protótipo usa vírgula. A entrada já aceita vírgula.
- **Service worker**: o ramo de navegação guarda respostas sem verificar `res.ok` (candidato a correção em missão própria; núcleo protegido).
- **Primeiro uso e splash**: não iniciados.
- **Renovação de licença**: bloqueada (exige migration revisada).

## 5. Decisões pendentes

- Licença: valor e prazo da renovação, e como o app sabe a versão da licença (Supabase; sem migration sem revisão). Nenhum valor de renovação aparece nas telas.
- G76: conferir `X17.4` contra `P(k)` 1,530 mm; `R(d)` em mm (protótipo) ou microns (v2) e a ausência de `R(i)`.
- Biblioteca Técnica (linha 2.2): organização interna a decidir; é funcionalidade distinta da Biblioteca da aba.
- Consolidação de tokens compartilhados, sem substituir globalmente cores nem alterar a identidade aprovada.
- Logo definitivo (consultar INPI) e conjunto de ícones.
- Revisão técnica do conteúdo do Guia e revisão do inglês (feitas pelo Product Owner).
- Integração entre a linha `casillas-2.2` e a CAS-UI.
- Limpeza de documentos históricos (CAS-UI-D13), fora desta fase.

## 6. Próxima atividade (planejamento; não autorizada)

A Home é um item da interface; o Casillas 2.2 só se conclui com todo o escopo de CAS22-SCOPE-01 (`01-DECISOES-2.1.md` §7).

**Home fiel ao protótipo** `casillas-inicio.html`, preservando os módulos funcionais existentes. Condições já definidas:
- A engrenagem de Configurações não abre tela fictícia.
- O campo de pergunta do Consultor usa o mecanismo existente, sem simular busca livre.
- Execução em missão separada, com autorização específica e validação visual no smartphone.

## 7. Verificações e limites

- CI "Casillas baseline" passou nos merges dos PRs 7 a 11. Localmente, `node --test tests/*.test.mjs` dá 108 aprovados e 3 falhas que exigem Docker (rodam só na CI).
- Não há registro de fidelidade validada de nenhuma tela pelo Product Owner.
- Não verificado: estado atual do Supabase após 10/10; se a confirmação de e-mail está ligada; quando o teste de 30 dias de fato começa.
- Reauditoria do Supabase (2026-10-10, somente leitura): 14 migrations, RLS ligado em todas as tabelas de `public`, proteção contra senhas vazadas desligada (alerta), telemetria do Consultor só com `controlador`, `maquina`, `operacao` e `codigo`, sem campo de versão da licença.

## 8. Material de referência

- Protótipos aprovados em `docs/interface-2.1/telas/` (referência visual vigente, substituíveis por versões futuras aprovadas); protótipos antigos em `telas/referencia-anterior/`.
- Padrões das telas aprovadas: calculadoras seguem a Conicidade (abre com valores, resultado ao vivo, cartões, detalhes expansíveis, figura proporcional, copiar, faixa vermelha de erro, selo "Em revisão técnica"). Barra inferior de 4 itens. Alvos de toque de 48 px nas ações principais e 44 px no mínimo.
- Logo provisório (Modelo 3, `casillas-logos.html`). A folha de ícones Material Design foi rejeitada; caminho previsto: traço fino (Lucide, licença ISC) mais desenho próprio.
- Ajustes visuais combinados para depois: reduzir a fonte; refinar a vista lateral da Trajetória; corrigir a declaração de fonte inválida (`font:... inherit`) nos botões do protótipo do Guia.
- `casillas-pwa.zip` (protótipo antigo) deu ideias para o Consultor (busca local) e para o formato do Guia; não entra no app.

## 9. Retomada

Reconciliação documental (CAS-DOC-RECONCILIACAO-01) concluída em 2026-10-10: commit `a84e022` na branch `cas-ui-docs-reconciliacao`, integrado à `casillas-2.0` pelo PR #12 (merge `cd1411f`). A CI pós-merge passou (run 38090964537, "Casillas baseline"). Sem deploy: o PR só alterou documentação; o aplicativo publicado continua `c115a3e` (SW v20).

Sessão seguinte (2026-10-10, CAS-UI-HOME-PLAN-01): correção destas referências de estado e plano da Home, somente leitura no código.

Última sessão (2026-10-10, CAS22-DOC-CONSOLIDATION-01, só documentação): registrado o escopo do Casillas 2.2 (CAS22-SCOPE-01, `01-DECISOES-2.1.md` §7) e o inventário dos protótipos (`CHECKLIST-TELAS.md`). Nenhum item do escopo está concluído. Alterações locais, sem commit, push, PR, merge ou deploy. Próximo passo: o Product Owner revisa e autoriza (ou não) a integração destes documentos; depois, decide sobre o plano da Home (seção 6).
