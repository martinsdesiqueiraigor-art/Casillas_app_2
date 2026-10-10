# CLAUDE.md — continuidade de sessão (Casillas)

Leia primeiro. Este arquivo aponta para as fontes oficiais; não as substitui nem copia.

## Nomes (não confundir)
- **Produção**: branch `casillas-2.0`. Em 2026-10-10: HEAD da branch `cd1411f` (merge do PR #12, só documentação); aplicativo publicado `c115a3e` (service worker `casillas-v20`). Não confundir os dois; confirme com `git`. A tag `v2.1.0` (`1b3082e`) é a release anterior.
- **CAS-UI**: frente de modernização da interface (`docs/interface-2.1/`). Não é a release v2.1.0.
- **`casillas-2.2`**: linha de governança/desenvolvimento pendente de integração. Preservada; não mesclar, não dar por encerrada.
- **Casillas 2.2 (produto)**: escopo da próxima versão, definido em CAS22-SCOPE-01 (`docs/interface-2.1/docs/01-DECISOES-2.1.md` §7). Não é a branch `casillas-2.2` e não termina com a CAS-UI.

## Fontes oficiais (o repositório é a referência)
- Regras permanentes, segurança, autorizações: `AGENTS.md`.
- Licença, trial, banco, segurança: `docs/DECISOES.md`, `docs/BANCO-DADOS.md`, `docs/SEGURANCA.md`.
- Estado e próxima atividade: `docs/interface-2.1/docs/00-ESTADO-ATUAL.md`.
- Decisões da interface (vigentes e substituídas): `docs/interface-2.1/docs/01-DECISOES-2.1.md`.
- Produto e navegação: `02-PRODUTO-E-NAVEGACAO.md`. Telas: `CHECKLIST-TELAS.md` e protótipos em `docs/interface-2.1/telas/`.
- Release e publicação: `docs/STATUS.md` e `.github/workflows/static.yml`.
- Claude Project, memórias e resumos de conversa são **apoio**, nunca fonte de decisão.

## Hierarquia de autoridade (detalhes em `AGENTS.md` §15)
1. Segurança, integridade técnica e autorizações vigentes.
2. Decisões explícitas e recentes do Product Owner, no escopo autorizado.
3. Decisões técnicas e funcionais vigentes por assunto.
4. Protótipos visuais aprovados (referência vigente, não proibição de melhorias).
5. Documentos históricos, só como referência.
Nenhum documento antigo bloqueia uma decisão nova e válida do Product Owner dentro do escopo dela. Em conflito, descreva a divergência e a consequência antes de agir.

## Início de sessão
1. Ler este arquivo e o `00-ESTADO-ATUAL.md`.
2. `git remote -v`, `git branch --show-current`, `git rev-parse HEAD`, `git status --short`; `git fetch` e comparar com os SHAs do estado.
3. Conferir em `01-DECISOES-2.1.md` as decisões ligadas à tarefa.
4. Identificar a próxima atividade não concluída e informar o estado em poucas linhas **antes** de mudar qualquer coisa.
5. Se o SHA real diferir do registrado, parar e perguntar.

## Após compactação de contexto
Não confiar só no resumo. Reler este arquivo e o estado, conferir `git log -5` e retomar a tarefa em andamento.

## Smartphone e desktop
O repositório versionado é a referência comum. Alterações locais não publicadas não existem no outro ambiente. Uma sessão ativa por branch; antes de continuar, `git fetch` e comparar cópias.

## Encerramento
Registrar estado, trabalho feito, pendências e próximo passo (em `00-ESTADO-ATUAL.md`). Se isso exigir commit fora da autorização vigente, pedir autorização. Sem commits automáticos de handoff.

## Autorizações (resumo; texto completo em `AGENTS.md` §14)
Leitura, análise e testes locais não destrutivos: livres. Commit, push, PR, merge, deploy e Supabase/infraestrutura: só com autorização explícita vinculada à operação. "Ok", "pode" e "sim" não autorizam publicação. Sem push automático ao concluir etapa.

## Núcleo protegido (`AGENTS.md` §16)
Cálculos, Auth, licença/trial/entitlement, RLS/Supabase/migrations, Consultor determinístico, conteúdo CNC, service worker/offline, testes, CI e Production Gate. Alterar só com missão específica, análise de risco e testes. Interface (Home, Calculadoras, Consultor, Guia, Biblioteca, Configurações, cabeçalho, navegação, design system) é modernizável, reutilizando os módulos funcionais existentes.
