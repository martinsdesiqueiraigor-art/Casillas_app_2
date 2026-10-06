# Mission Supervisor V1

Missão CAS22-OPS-03-R1; origem/handoff CAS22-COORD; executor CODEX LOCAL. Base `db0c77ce5a5108df82ebcb70766f48bfec20ef9f`, branch casillas-2.2. Runtime em `C:\Projetos\Casillas_AgentOps\runtime`, externo ao app. POC em `C:\Projetos\Casillas_AgentOps\supervisor` preservada como evidência homologada, com inventários SHA-256 antes/depois.

## Contrato oficial

O supervisor transporta e executa missões reversíveis aprovadas; a Coordenação define produto, escopo, base e permissões. Codex Coordinator mantém claims/colisões quando houver escrita paralela real. Não há autoridade comercial, Agent Bus, serviço Windows, scheduled task, autostart ou dependência nova. Os [contratos da equipe](AGENT-TEAM-CONTRACT.md), [workflow](WORKFLOW-2.2.md), [plugins](PLUGIN-POLICY.md) e gates existentes permanecem aplicáveis.

JSON estrito UTF-8, sem extras: mission_id, role (COORD/CODEX/QA/SECURITY/CNC/LIBRARY), phase, prompt_file, cwd, sandbox, autorun, depends_on, unblocks, handoff_to, human_gate, git_mode, base_sha e allowed_paths. ID seguro/único; SHA-1 de 40 hex; paths exatos relativos ao repo, sem traversal/globs/reparse points. Prompt `.txt` somente em runtime/prompts ou ao lado do manifesto. cwd/branch/origin/modos dependem da allowlist revisada de config. Nenhum command/executable/args arbitrário, Invoke-Expression ou shell de manifesto.

READ-ONLY: sandbox read-only, git_mode none, human_gate false, allowed_paths vazio. Repo limpo e branch permitida/HEAD=base_sha antes; HEAD, árvore, snapshots de arquivos e origin preservados depois. WORKSPACE-WRITE: sandbox workspace-write, git_mode local-commit, human_gate false, allowed_paths não vazio. Mesma base limpa; stage apenas dos paths explícitos, checks e diff --check; exatamente um commit local filho direto da base, árvore final limpa, diff dentro da allowlist e origin sem avanço. Nenhum push pelo agente. Nesta integração a config do Casillas permite só leitura; escrita foi homologada exclusivamente em fixture Git externa. Missão F1 deve decidir sua própria allowlist/config e base.

CLI usa ProcessStartInfo/argumentos fixos, sandbox e configuração nativa existentes, nunca danger-full-access ou bypass de aprovação/sandbox. A versão instalada exige `--approve-for-me` sozinho para workspace-write; combinado com `--sandbox` é recusado. READ-ONLY usa `--sandbox read-only`. Nenhuma credencial/auth é exposta. Opções documentadas no help instalado e na [documentação oficial](https://learn.chatgpt.com/docs/non-interactive-mode).

## HUMAN GATE e estados

human_gate=true vai diretamente a approval e nunca invoca Codex ou libera dependentes. A Coordenação DEVE marcar merge estável, deploy/produção, Supabase remoto/migration, release/rollback, mudanças comerciais/pricing/access-policy, credenciais/segredos e destrutivas. Há denylist simples defensiva somente em phase/handoff_to; não interpreta prompt livre nem substitui o contrato humano. Não há execução crítica/aprovação automática nessa V1.

inbox pronta; waiting depende de DONE localmente validado; running executa; approval exige humano; review reservado; done validada; blocked política/drift; failed técnico/manifesto inválido. autorun=false não executa. unblocks é validado, mas depends_on determina a liberação. `-Once` drena a cadeia executável; `-Watch -PollSeconds 2` observa por scan e espera, sem heartbeat/busy loop. Lock exclusivo impede segunda instância. Interrupção com running exige revisão manual; não há retry automático ou correção Git destrutiva. Drift inesperado interrompe o runtime.

Resultado estrito: mission_id, status DONE/BLOCKED/FAILED, summary, repo_head, checks, changed_paths, commit_sha (ou vazio), unblocks e handoff_to. Validação local de tipos/campos/ID/HEAD/commit/paths, independente do modelo, além de exit 0 para DONE. Evidência por ID nunca sobrescrita; journal é append-only. Reutilização de ID é recusada.

## Operação e evidências

A Coordenação aprova missão e ownership; operador completa templates/config, coloca manifesto em inbox e prompt não sensível no local permitido e inicia manualmente `powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\Projetos\Casillas_AgentOps\runtime\supervisor.ps1 -Once`. Política PowerShell vale somente para o processo. Watch é opcional/manual, sem instalação residente. Consultar README e OPS-03-RESULT.md externos para testes A–G, snapshots, resultados e recuperação.

Testes exigidos: preservação POC; leitura real Casillas; commit real em fixture alterando só ALLOWED.txt; HUMAN GATE sem Codex; cadeia A → B; negativos de manifesto/resultado/gates (incluindo path indevido e dois commits simulados na fixture); Watch >=6 s com PollSeconds 2, lock recusando segunda instância e recuperação após término. Evidência herdada da POC não é teste recém-executado.

## Limites e próxima fase

Missões/arquivos locais são confiáveis e aprovados, sem segredos; não há autenticação de manifestos nem parser semântico. Snapshots não detectam mudanças transitórias revertidas; bytes de arquivos ignorados e conteúdo interno de .git não são auditados, evitando ler segredos. Metadados dos demais arquivos são comparados. Gates posteriores detectam drift, mas não impedem previamente todo efeito de um agente malicioso. Não são substitutos do sandbox/automatic review ou autorização humana. Git remoto depende de conectividade e falha fecha o gate. Interrupção/timeout durante agente exige revisão da árvore de processos. Teste de término vazio não homologa interrupção em plena escrita.

Produção 2.1, Supabase, app e arquitetura permanecem preservados. Um commit somente documental e push origin/casillas-2.2 são autorizados por OPS-03; sem PR/merge/deploy. **F1 permanece PRÓXIMA até fechar esta missão; não é iniciada aqui e exige missão própria.**
