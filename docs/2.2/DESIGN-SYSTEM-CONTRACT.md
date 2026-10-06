# Contrato do Design System 2.2

Status: definição documental F0; implantação futura em F1/F2. [Escopo comum](README.md).

## Tokens existentes e extensão

`css/variables.css` já centraliza a direção aprovada. Manter os nomes existentes como contrato público de CSS; não criar segunda paleta nem migrar todos os módulos de uma vez.

| Grupo | Tokens existentes / valores de referência | Uso |
| --- | --- | --- |
| Fundo | `--bg-app: #0d1117` | Fundo do aplicativo |
| Superfícies | `--bg-card: #161b22`, `--bg-input: #21262d`, `--bg-elevated: #1c2128` | Card, campo, elevação |
| Texto | `--text-primary: #e6edf3`, `--text-secondary: #8b949e`, `--text-muted: #6e7681` | Hierarquia; muted não garante legibilidade em qualquer superfície |
| Borda | `--border-color: #30363d` | Separação de superfícies |
| Destaque / informação | `--accent-primary: #f0883e`, `--accent-secondary: #58a6ff`, `--info: #58a6ff` | Ação principal e informação |
| Feedback | `--success: #3fb950`, `--warning: #d29922`, `--danger: #f85149` | Estado sempre acompanhado por texto/ícone |
| Espaçamento | `--sp-1` a `--sp-6`: 4, 8, 12, 16, 20, 24px | Ritmo existente |
| Tipografia | `--font-sans`, `--font-mono` | Fontes de sistema atuais; mono para valores/código |
| Escala | `--fs-xs/sm/md/lg/xl/xxl`: 11/13/15/18/22/28px | Referência herdada; 11px não para instrução crítica |
| Radius | `--radius-sm/md/lg`: 6/10/14px | Campo, card, superfície maior |
| Sombras | `--shadow-soft`: 0 2px 8px rgba(0,0,0,.35); `--shadow-strong`: 0 8px 24px rgba(0,0,0,.55) | Elevação existente |
| Shell | `--header-height: 60px`, `--kpi-height: 60px` | Preservar durante retrofit; medir antes de mudar |
| Safe area | `--safe-top`, `--safe-bottom` via `env(..., 0px)` | Insets existentes |
| Movimento | `--t-fast: 120ms ease`, `--t-mid: 220ms ease` | Feedback breve; respeitar redução de movimento |

Extensões documentais previstas para F1: `--touch-min: 44px` nos dois eixos, `--line-body: 1.5`, `--line-heading: 1.2`, pesos 400/500/600/700; `--safe-left/right` pelos respectivos `env`; `--bottom-nav-height: 64px` excluindo inset inferior; `--focus-ring: 2px solid var(--info)` com offset 2px. Não existem ainda no CSS.
Superfícies não ganham cores locais arbitrárias. Novas combinações de texto/fundo exigem medição de contraste no piloto; esta missão não certifica acessibilidade da paleta inteira.

Breakpoints de contrato: base móvel; até 350px para compactação sem esconder ações essenciais; até 420px para ajustes compactos; a partir de 720px para layout amplo, inicialmente com conteúdo de até 720px como o layout atual. São valores literais de media queries, não custom properties usadas diretamente em queries. Evitar regras conflitantes exatamente em 720px. Sem novo breakpoint sem evidência do conteúdo.

## Componentes e equivalentes

Os nomes abaixo definem responsabilidades, não novas classes JS obrigatórias. Preferir CSS e funções DOM existentes.

| Componente | Equivalente atual | Contrato futuro mínimo |
| --- | --- | --- |
| Card | `.card`, `.card-title`, cards da Home/Guia | Título, corpo, ações opcionais; sem tornar todo card botão quando há ações internas |
| ResultCard | `consultor/resultCard.js`; `.result-row/value/label` nas calculadoras | Preservar ResultCard do Consultor e seu Map; resultados numéricos usam motor, unidade e estado, sem duplicar a classe |
| Button | `.btn`, primary/secondary/outline/danger, `.icon-btn` | Elemento nativo, label, disabled/busy, foco, toque mínimo |
| Chip | Filtros/subtabs específicos; sem primitiva genérica identificada | Label e seleção opcionais; botão somente quando interativo |
| StatusBadge | `.guia-badge`, estado comercial do header | Texto legível e semântico; estado comercial apenas recebido do contrato de acesso |
| EmptyState | `.result-hint`, `.guia-vazio`, mensagens do Consultor | Motivo e próximo passo útil; distinguir ausência de resultado de falha |
| ErrorState | `.result-error`, toast e mensagens locais | Mensagem recuperável e ação quando disponível; não expor detalhes internos |
| OfflineState | Header e estado de acesso em `app.js` | Separar rede, conteúdo local e validade do acesso; não prometer dados não baixados |
| Toast | `showToast` em `js/utils.js` e `.toast-container` | Reutilizar; anúncio acessível e mensagem crítica persistente junto ao campo |
| SectionHeader | `.home-section-heading/title`, `.card-title` | Heading hierárquico e ação opcional semântico |
| BottomNavigation | Menu lateral atual; sem barra inferior genérica identificada | [Navegação](NAVIGATION-CONTRACT.md), um destino ativo, safe area, acessível por teclado |
| TechnicalDiagram container | SVG `desenharTriangulo(res)` em Trigonometria; tipo `visual_canvas` no Guia | Figura com título/descrição e alternativa textual; recebe resultado/conteúdo validado, sem motor paralelo |

Estados compartilhados: inicial, preenchido, carregando quando houver espera real, sucesso, erro, vazio e offline conforme o componente. Não mostrar loading artificial em cálculo local.

## Aceite de F1/F2

Pilotos Trigonometria e Tolerâncias ISO devem comprovar resultados iguais aos motores atuais, unidades e arredondamento preservados, foco visível, operação por teclado, zoom e telas estreitas sem perda de conteúdo. Alvos de toque mínimos inclusive limpar campo (hoje há 30px) e ícones (hoje há 40px fora de regras móveis). Código pode rolar dentro do container; shell não deve ter overflow horizontal.
Barra inferior, toast, teclado existente e safe areas não podem encobrir campos ou resultados. SVG pode fazer escala/posição gráfica, mas nenhum cálculo técnico independente. Nenhuma divergência matemática confirmada nesta análise; qualquer divergência futura deve ser registrada em missão própria.
