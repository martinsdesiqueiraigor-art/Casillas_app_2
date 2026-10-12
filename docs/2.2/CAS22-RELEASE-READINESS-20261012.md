# CASILLAS 2.2 — Preparação de release (auditoria local)

Data: 2026-10-12. Estado: CANDIDATA EM PREPARAÇÃO; PUBLICAÇÃO NÃO AUTORIZADA.

## Identidade e limites
- Repositório local: C:\Projetos\Casillas_2.2_OFICIAL
- Branch: casillas-2.2-consolidacao
- HEAD auditado: 86d27fd9936e8e84415a8570fb4d524fa60e8b8b
- Integração da Biblioteca/Aprender/Mapas já consolidada localmente por merge fast-forward autorizado.
- Sem push, deploy, merge para branch de release, alterações remotas ou autorização de publicação.

## Evidências disponíveis
- Biblioteca: 24/24 PASS em 2026-10-12 (logic.test.mjs e isolation.test.mjs).
- Supabase local: 14/14 migrations aplicadas; 167/167 testes SQL/RLS PASS em 2026-10-12.
- Backup pré-migration: C:\Projetos\Casillas_Backups\casillas_pre_migrations_20261012.dump (448398 bytes).
- EV3: 20/20 PASS na regressão registrada anteriormente.
- Trial/licenciamento: 63/63 PASS; proteção de release: 8/8 PASS no Production Gate anterior.
- Android: validação funcional e offline reportada/aprovada pelo Product Owner; não substitui auditoria automatizada do navegador.
- Árvore Git limpa antes da criação deste relatório; este documento novo ainda não foi commitado.

## Escopo de conteúdo
- Biblioteca enxuta: consulta, Aprender (piloto G71), Mapas Técnicos, fichas demonstrativas de Paquímetro e Micrômetro.
- Aprovação de UX/funcionamento não significa homologação técnica de fichas, fontes, exemplos ou valores.
- Guia CNC permanece a autoridade para programação específica por controle; não inferir compatibilidade de códigos.

## Pendências bloqueantes para publicação
1. CONCLUÍDO POR DECISÃO DO PRODUCT OWNER (2026-10-12): o responsável pelo Casillas informou que já revisou e aprovou tecnicamente o conteúdo. Não exigir nova revisão técnica para esta candidata. Esta declaração não constitui auditoria independente; manter apenas a identificação correta de demonstrações e estados editoriais existentes.
2. VALIDAÇÃO FUNCIONAL CONCLUÍDA POR DECLARAÇÃO DO PRODUCT OWNER (2026-10-12): smartphone, navegação e offline já validados; não solicitar repetição. A verificação formal de identidade/empacotamento do artefato de release permanece etapa operacional separada, sem reabrir os testes de uso.
3. Conferir acessibilidade, descoberta do Consultor e transições de sessão.
4. Confirmar a política de branch: o workflow de publicação exige refs/heads/casillas-2.0, SHA exato, registro de aprovação e smoke test; a candidata atual está em casillas-2.2-consolidacao.
5. Solicitar autorização específica antes de commit, push, merge para release ou deploy.

## Plano de recuperação
- Preservar o SHA da versão publicada atual e registrar o SHA da candidata aprovada.
- Não modificar o workflow nem contornar seus controles de aprovação.
- Em caso de regressão após futura publicação, interromper novas liberações e restaurar o artefato/commit de produção previamente validado por processo autorizado.
- O backup SQL acima é somente do banco LOCAL, não representa backup do Supabase remoto.

## Decisão
Revisão técnica e validação funcional no smartphone declaradas concluídas e aprovadas pelo Product Owner em 2026-10-12; não solicitar repetição. Apto a preparar a liberação operacional no GitHub; publicação ainda depende de autorização específica, identidade da candidata e guardas do workflow. Este relatório não declara auditoria independente.
