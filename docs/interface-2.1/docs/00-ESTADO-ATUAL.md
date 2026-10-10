# Estado atual do Casillas 2.1

Atualizado em: 2026-10-10. Ler este arquivo antes de qualquer proposta. Atualizar ao fim de cada tela aprovada.

## Fase
Definir e aprovar a interface, uma tela por vez. Nenhum código do app 2.1 até a aprovação das telas.

## Fonte de verdade visual
1. Protótipos anteriores aprovados: `casillas-app.html` (Início, Calculadoras, Biblioteca) e `guia-cnc-g76.html` (Guia CNC 2.0, original intacto).
2. Referências do usuário (imagens): tela Visão geral do G76 e painel "Guia CNC 2.0" com telas complementares.
3. `guia-cnc-g76-novo.html`: cópia do protótipo com a nova Visão geral do G76. Visão geral, Trajetória, Parâmetros e Exemplo aprovadas em 2026-10-10. Cuidados aceita como está (visual do protótipo). Guia concluído. Configurações aprovada em 2026-10-10. Fonte da aba Parâmetros pode ser ajustada no futuro. Refinamento da vista lateral da Trajetória fica para depois.
4. O canvas "Casillas 2.1 Telas" é apoio para telas que os protótipos não cobrem. Não é fonte de verdade.

## Pronto
- Docs 2.1 em rascunho (índice, decisões, produto e navegação, plano da fatia 2), relatório de regras impeditivas e inventário de arquivos.
- Commit local `141adf3` (tokens de design em `css/variables.css`), branch `casillas-2.1-ui-tokens`. Sem push.
- Canvas: Início, Estados de acesso, Calculadoras, Conicidade e Guia (Visão geral, Trajetória, Parâmetros, Exemplo) no estilo dos protótipos antigos.
- Visão geral do G76 nova, em `guia-cnc-g76-novo.html`: cabeçalho com logo e configurações, filtros com ícone e funil, card com barra laranja e alerta de variante, 4 abas com ícone, Aplicação com ilustração, linhas com ícone, navegação de 4 itens.

## Em andamento
- Consultor aprovado (`casillas-consultor.html`). Calculadoras (lista) aprovada em 2026-10-10 (`casillas-calculadoras.html`). Conicidade aprovada em 2026-10-10 (`casillas-conicidade.html`) como modelo das demais calculadoras: abre com valores, resultado ao vivo, cartões, resultados detalhados, figura proporcional, copiar. Demais calculadoras seguem esse padrão. Início aprovado em 2026-10-10 (`casillas-inicio.html`). Biblioteca aprovada em 2026-10-10 (`casillas-biblioteca.html`), com a Configurações atualizada para licença vitalícia e renovação para recursos novos. Telas principais todas aprovadas. Resta Primeiro uso e splash (baixa prioridade).
- (concluído) Telas de acesso: Login aprovado (`casillas-login.html`), com abas Entrar e Criar conta como na v2. Recuperar senha e Verifique seu e-mail são faixas na própria tela, como na v2. Nova senha aprovada (`casillas-nova-senha.html`). Ativação por código aprovada (`casillas-ativacao.html`, serve também de Fim do teste). Estados do acesso aprovados (`casillas-estados-acesso.html`). Telas de acesso concluídas.

## Próximos passos, nesta ordem
1. Definir o próximo passo com o usuário: Primeiro uso e splash, ícones (Lucide ou conjunto próprio), logo definitivo, ajustes visuais para depois e decisões pendentes. Histórico, favoritos e alternância mm/pol ficam para a fatia seguinte.

## Onde estão os arquivos das telas
Os HTML das telas aprovadas (`casillas-*.html`, `guia-cnc-g76-novo.html`) ficam na pasta de saídas da sessão e foram enviados ao usuário. Não estão no Project nem no repositório. Se a sessão acabar, o usuário tem os arquivos que recebeu. Guardar uma cópia no Project ou no Git depende de decisão do usuário.

## Padrões fixados nas telas aprovadas
- Calculadoras seguem a Conicidade: abre com valores, resultado ao vivo, cartões de resultado, "Resultados detalhados" expansível, figura SVG proporcional, copiar resultado, faixa vermelha para erro, selo "Em revisão técnica". Cálculo de demonstração: fórmulas não conferidas por revisão técnica. Cópia para a área de transferência não testada.
- Barra inferior de 4 itens. Alvos de toque de 48 px ou mais. Ícones de traço de 2 px num mapa único por tela, para trocar o conjunto depois.
- Logo provisório (Modelo 3) em SVG inline.

## Identidade visual
- Logo: provisório, Modelo 3 "C com ferramenta" (`casillas-logos.html`). O usuário disse que pode ser qualquer um e que será substituído depois. Conferir marca no INPI antes de adotar de vez. Nome vira vetor na versão final.
- Ícones: a folha com Material Design Icons (`casillas-icones.html`) foi rejeitada por destoar da interface. Caminho escolhido: biblioteca de traço fino (Lucide, licença ISC) para os genéricos, desenho próprio para os de usinagem e ilustrações SVG com degradê no lugar de imagens 3D. A instalação da Lucide falhou no ambiente (rede). Falta o usuário enviar o pacote, ou aprovar o conjunto próprio completo.

## Ajustes visuais para depois
- Reduzir a fonte (decisão do usuário, ainda sem tela definida). Vale para as telas aprovadas.
- Refinar a vista lateral da Trajetória.
- Declaração de fonte inválida (`font:... inherit`) nos botões do protótipo do Guia: botões e abas usam o tamanho padrão do navegador. Corrigir junto com a redução da fonte.

## Pendências de decisão (aguardam o usuário)
- Licença (decidido em 2026-10-10): vitalícia para o que o usuário já tem. Recursos novos de versões futuras exigem renovação. Quem não renova continua usando tudo sem os recursos novos, sem bloqueio. A definir depois: como o app sabe a versão da licença (Supabase, sem migration sem revisão) e valor e prazo da renovação. Nenhum número de renovação na tela até lá.
- Escopo proposto para a fase de interface (Guia completo, depois Configurações, acesso e Consultor).
- Ciclo de referência do Guia: G76 (proposto).
- Telemetria: guardar ou não o texto das buscas sem resultado. Conflita com a regra da v2 de telemetria sem texto bruto.
- Dados do exemplo do G76: X17.4 dá 1,3 mm de profundidade por lado (nominal 20 mm) e P(k) é 1,530 mm. Conferir com o manual. Chip da tela diz só "passo 2,5".
- R(d) em microns (v2) contra mm (protótipo) e ausência de R(i) na v2.
- D1 a D13 em `01-DECISOES-2.1.md`.

## Auditoria do Supabase já feita (sessão anterior, somente leitura)
Projeto "Casillas", região sa-east-1. Resultado:
- 14 migrations aplicadas. RLS ligado em 9 tabelas.
- Tabelas comerciais sem grants nem policies para `anon` e `authenticated`. `anon` só lê `products` ativos.
- Sem Edge Functions.
- Alerta: proteção contra senhas vazadas desligada.
- As tabelas de telemetria `chat_interactions` e `guide_feedback` existem, mas não estão documentadas.
- Tabela de tentativas de ativação vazia. 2 licenças existentes.
- Não conferido: se a confirmação de e-mail está ligada no projeto e quando o teste começa. A data da auditoria não está registrada, então o estado pode ter mudado.

## Git
Nenhum push feito. Push só com "autorizo push" do usuário, para branch nova, nunca `casillas-2.0`.
