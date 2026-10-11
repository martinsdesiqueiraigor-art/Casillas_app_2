# CASILLAS 2.2 — Validação visual Android (11/10/2026)

**Ambiente:** `C:\Projetos\Casillas_2.2_OFICIAL` — servidor local HTTP LAN `192.168.24.7:8766`.
**Escopo:** revisão visual/responsiva pontual, sem mudança funcional intencional.

## Alterações locais observadas nesta etapa

- `css/layout.css`: reserva inferior de conteúdo ajustada de 64px para 72px, além de regras de cabeçalho compacto para telas legadas. O menu lateral permanece disponível nessas telas.
- `css/home-22-local.css`: reserva inferior adicional da Home reduzida de `calc(96px + env(safe-area-inset-bottom,0px))` para `28px`.
- `css/consultor-22-local.css`: reserva inferior adicional do Consultor reduzida de `calc(100px + env(safe-area-inset-bottom,0px))` para `28px`.
- `index.html`: referência de `layout.css` versionada com `?v=20261011-header1` para contornar CSS antigo em cache durante a validação local.

## Evidência manual informada pelo Product Owner

- Prints do Android confirmaram renderização do cabeçalho compacto na Home e, após atualização do CSS, na Trigonometria e Biblioteca.
- Product Owner confirmou expressamente que a **engrenagem de opções** e o **menu lateral** funcionam.
- Barra inferior de quatro abas permaneceu visível nas capturas.
- Prints não demonstram cobertura de todos os tamanhos de tela, rolagem até o último elemento, modo offline, regressão automatizada ou publicação HTTPS.

## Situação e próximos gates

**APROVAÇÃO VISUAL MANUAL PARCIAL:** cabeçalhos compactos e acesso aos menus confirmados no smartphone; revisão responsiva geral e QA de regressão ainda abertos. Não declarar homologação técnica CNC, fórmulas, Auth, licenciamento ou Service Worker a partir destas capturas.

1. **Validação manual parcial da rolagem concluída em 11/10:** capturas Android mostram o último cartão de Calculadoras (Programação CNC) totalmente visível acima da barra inferior e, na Biblioteca, o cartão de licença e o rodapé também visíveis. A Home também foi confirmada por captura posterior: o cartão final 'Consultar ciclos CNC' aparece integralmente acima da barra inferior. Espaçamento inferior validado manualmente nas três telas (Home, Calculadoras e Biblioteca). Não extrapolar a validação para todas as resoluções ou módulos.
2. Conferir módulos adicionais e tamanho de fonte ampliado, sem redesenhar o visual aprovado.
3. Revisar diffs locais e executar testes proporcionais antes de qualquer integração.
4. Tratar separadamente as pendências de QA/SQL registradas em `CAS22-QA-REGRESSION-01.md`.

**Controle:** nenhuma operação de commit, push, merge, deploy ou Supabase remoto foi realizada nesta etapa. A árvore local já continha outras alterações: não atribuir o diff total exclusivamente a esta revisão.
