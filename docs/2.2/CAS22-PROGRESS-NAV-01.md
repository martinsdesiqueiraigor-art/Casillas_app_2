# CASILLAS 2.2 — Progresso da navegação

**ID:** CAS22-PROGRESS-NAV-01
**Data:** 2026-10-10
**Ambiente:** `C:\Projetos\Casillas_2.2_OFICIAL`
**Estado:** APROVADO EM TESTE MANUAL NO SMARTPHONE; integração Git pendente.

## Contexto e problema

A navegação entre Home, Consultor, Guia CNC, Calculadoras e Configurações utilizava mecanismos diferentes: troca de módulos sem histórico e rotas `#/guia` com histórico. O botão Voltar do Android ou navegador não refletia consistentemente a jornada.

## Intervenção local

- `js/app.js`: roteamento de módulos via hash `#/modulo/<chave>`, tratamento de `hashchange`, proteção contra carregamentos assíncronos fora de ordem, preservação temporária do DOM do Consultor e identificação da origem de acesso ao Guia.
- `js/modules/guia.js`: retorno ao Consultor quando a ficha foi aberta a partir dele; retorno à lista para abertura convencional no Guia.
- Os arquivos acima já continham ou coexistem com alterações locais de desenvolvimento. Não confundir o diff total com mudanças exclusivamente desta missão.

## Evidência e limites

O Product Owner informou aprovação de navegação para todas as telas testadas no smartphone. Isso constitui **homologação manual informada**, não prova de cobertura automatizada completa nem homologação técnica do conteúdo CNC.

A verificação local de sintaxe (`node --check` para `js/app.js` e `js/modules/guia.js`) e `git diff --check` não indicou erro na execução observada. Não foram feitos testes E2E automatizados nesta intervenção.

## Pendências e próximos gates

1. Executar testes automatizados e regressões, incluindo navegação, autenticação e offline.
2. Revisar diffs e preservar alterações locais preexistentes.
3. Separar alterações de navegação para integração controlada, com autorização específica para commit/push/merge.
4. Validar novamente em HTTPS/publicação antes de considerar concluída a entrega em produção.
5. Continuar revisão técnica independente das fichas CNC e das demais funcionalidades do Casillas 2.2.

## Controle de mudanças

Registro documental local autorizado. **Nenhum commit, push, merge, deploy ou alteração remota Supabase autorizado/executado nesta atualização.**

**Documentos legados:** `docs/STATUS.md` e `docs/PROGRESSO.md` contêm histórico da linha 2.0/2.1; este registro documenta exclusivamente o avanço local 2.2, sem sobrescrever snapshots anteriores.

## Continuidade — 2026-10-11: inicialização Android e próximo ciclo visual

- **Incidente:** tela principal vazia em Chrome/Android após carregamento dos recursos, inclusive `dados/ciclos-cnc.json` com HTTP 200.
- **Correção local em `js/app.js`:** inicialização protegida por `document.readyState`: registrar `DOMContentLoaded` com `{ once: true }` quando `loading`, ou executar `iniciarApp()` imediatamente quando o documento já estiver pronto. Preservado `boot().catch(...)` para falhas reais.
- **Validação:** o usuário confirmou por capturas no smartphone que a Home e as telas de calculadoras/Guia voltaram a renderizar; também informou que o fluxo completo Consultor → Guia CNC já foi testado e funciona. Isto **não equivale** à homologação técnica de todos os ciclos/fórmulas.
- **Limpeza:** seis `console.info('[CAS22-BOOT]...')` temporários removidos de `js/app.js`; tratamento de erros mantido.
- **Teste focal após limpeza:** `node --check js/app.js` sem erro; `node --test tests/ev3/app.test.mjs tests/ev3/static.test.mjs` = **5 PASS / 0 FAIL**. O resultado não substitui regressão geral, testes SQL ou homologação em HTTPS.
- **Próxima frente:** revisão visual/responsiva da Home e dos cabeçalhos; investigar sobreposição superior, safe areas, espaçamentos e consistência entre módulos, preservando a direção visual aprovada. **Nenhuma correção de layout aplicada nesta etapa.**
- **Banco CNC:** `dados/ciclos-cnc.json` e loader `js/modules/guia/bancoCiclosCNC.js` preservados; fichas em revisão técnica (como G76) não são homologadas por este teste.
- **Controle:** working tree já continha muitas alterações e arquivos não rastreados; não tratar o diff como exclusivamente desta missão. Sem commit, push, merge, deploy ou mudanças remotas no Supabase.
