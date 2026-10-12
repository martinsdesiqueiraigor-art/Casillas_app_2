# CLAUDE.md — continuidade de sessão (Casillas)

> **Metadados:** finalidade: instruções específicas do Claude Code; destinatário: Claude Code; estado: vigente como orientação, condicionado à verificação do ambiente; revisão: 2026-10-11; revisão assistida por ChatGPT com autorização do Product Owner; autoria original: não verificada. Não concede autorização para escrita no GitHub.

> **Limite de ambiente:** o Claude Code não possui acesso direto à pasta oficial `C:\Projetos\Casillas_2.2_OFICIAL`. O GitHub pode estar atrasado em relação ao PC. Antes de propor implementação sobre o app, informar branch e SHA consultados e solicitar confirmação de compatibilidade. Para protótipos independentes, entregar artefatos separados (por exemplo, ZIP), sem editar branches oficiais salvo autorização específica.

Leia primeiro. Este arquivo aponta para as fontes oficiais; não as substitui nem copia.

## Nomes (não confundir)
- **Produção**: branch `casillas-2.0`. Em 2026-10-10: HEAD da branch `cd1411f` (merge do PR #12, só documentação); aplicativo publicado `c115a3e` (service worker `casillas-v20`). Não confundir os dois; confirme com `git`. A tag `v2.1.0` (`1b3082e`) é a release anterior.
- **CAS-UI**: frente de modernização da interface (`docs/interface-2.1/`). Não é a release v2.1.0.
- **`casillas-2.2`**: branch histórica de governança/desenvolvimento, distinta da branch local `casillas-2.2-consolidacao` observada em 2026-10-11. Preservar; não mesclar sem autorização.
- **Casillas 2.2 (produto)**: escopo da próxima versão, definido em CAS22-SCOPE-01 (`docs/interface-2.1/docs/01-DECISOES-2.1.md` §7). Não é a branch `casillas-2.2` e não termina com a CAS-UI.

## Fontes oficiais (o repositório é a referência)
- Regras permanentes, segurança, autorizações: `AGENTS.md`.
- Licença, trial, banco, segurança: `docs/DECISOES.md`, `docs/BANCO-DADOS.md`, `docs/SEGURANCA.md`.
- Estado da 2.2: verificar o Git e os registros datados em `docs/2.2/`, sem presumir que estão completos ou atualizados. `docs/interface-2.1/docs/00-ESTADO-ATUAL.md` é histórico da CAS-UI.
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
1. Ler este arquivo, `AGENTS.md` e os documentos pertinentes ao escopo; distinguir registros históricos de decisões vigentes.
2. No ambiente acessível, consultar `git remote -v`, `git branch --show-current`, `git rev-parse HEAD` e `git status --short`; conferir sincronização com o PC por evidência fornecida pelo responsável. Não presumir que `fetch` revele commits ainda locais.
3. Conferir decisões ligadas à tarefa e confirmar se documentos da CAS-UI ainda se aplicam à 2.2.
4. Identificar a próxima atividade não concluída e informar o estado em poucas linhas **antes** de mudar qualquer coisa.
5. Se o SHA real diferir do registrado, parar e perguntar.

## Após compactação de contexto
Não confiar só no resumo. Reler este arquivo e o estado, conferir `git log -5` e retomar a tarefa em andamento.

## Smartphone e desktop
O GitHub contém somente o que foi enviado ao remoto e pode não incluir o trabalho no PC oficial. Antes de continuar, comparar branches e SHAs sem assumir sincronização; não executar `fetch`, `push`, checkout ou alterações remotas automaticamente quando o escopo for apenas análise ou prototipagem.

## Encerramento
Registrar estado, trabalho feito, pendências e próximo passo no relatório de entrega; não atualizar documentos históricos como se fossem estado vigente da 2.2. Se isso exigir commit fora da autorização vigente, pedir autorização. Sem commits automáticos de handoff.

## Autorizações (resumo; texto completo em `AGENTS.md` §14)
Leitura, análise e testes locais não destrutivos: livres. Commit, push, PR, merge, deploy e Supabase/infraestrutura: só com autorização explícita vinculada à operação. "Ok", "pode" e "sim" não autorizam publicação. Sem push automático ao concluir etapa.

## Núcleo protegido (`AGENTS.md` §16)
Cálculos, Auth, licença/trial/entitlement, RLS/Supabase/migrations, Consultor determinístico, conteúdo CNC, service worker/offline, testes, CI e Production Gate. Alterar só com missão específica, análise de risco e testes. Interface (Home, Calculadoras, Consultor, Guia, Biblioteca, Configurações, cabeçalho, navegação, design system) é modernizável, reutilizando os módulos funcionais existentes.
