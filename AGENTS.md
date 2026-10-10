# Contrato operacional — Casillas

Estas instruções se aplicam às tarefas de desenvolvimento realizadas neste repositório. Instruções explícitas do usuário definem o escopo da tarefa e devem ser respeitadas, observadas a hierarquia do §15 e as autorizações do §14. Para continuidade entre sessões, veja `CLAUDE.md`.

## 1. Identidade do projeto

Este projeto é o **Casillas — Calculadora Técnica de Usinagem** (PWA). A branch `casillas-2.0` é a referência de produção. A release homologada anterior é a tag `v2.1.0`; a frente de modernização da interface chama-se **CAS-UI** (veja §17).

## 2. Repositórios e separação

- `Casillas_app` é o repositório legado, mantido como referência histórica. Não o altere como parte do desenvolvimento do Casillas.
- `Casillas_app_2` é o repositório oficial do Casillas.
- O remote oficial é `origin`, apontando para `https://github.com/martinsdesiqueiraigor-art/Casillas_app_2.git`.
- `casillas-2.0` é a referência de produção. Alterações novas são feitas em branches específicas e integradas a ela por PR aprovado (§14).
- O remote `legacy`, quando configurado, aponta para `https://github.com/martinsdesiqueiraigor-art/Casillas_app.git`.
- O nome da pasta local não comprova a identidade do repositório. Antes de operações Git importantes, confirme remote, branch e estado.

Antes de operações Git importantes, consulte:

```bash
git remote -v
git branch --show-current
git status --short
```

Nunca envie alterações do Casillas para `legacy` e nunca modifique o repositório legado como parte de uma tarefa deste repositório. Não faça commit ou push sem autorização explícita (§14). Não use `reset`, `checkout` ou `clean` para descartar estado local.

## 3. Princípio arquitetural

> O frontend apresenta e solicita. O backend/banco de dados autoriza e protege.

O frontend cuida da interface, navegação, cálculos técnicos, apresentação de estados, chamadas à API, cache e experiência offline. Não é autoridade final para licença, entitlement, autorização comercial, permissões administrativas ou validade definitiva do acesso.

O Service Worker administra recursos e cache do PWA; não concede autorização comercial. A Home apenas apresenta o estado comercial recebido e não concede acesso.

## 4. Supabase

O Supabase é responsável por Auth, PostgreSQL, RLS, funções server-side, trial, licenças, entitlements e eventos de acesso.

- Nunca exponha `service_role` ou qualquer segredo server-side no frontend, em logs ou em arquivos versionados.
- Operações comerciais sensíveis devem ser executadas e validadas no servidor.
- RLS deve proteger dados acessíveis por APIs expostas; grants e permissões de funções também devem ser revisados.
- Não altere dados remotos, usuários, trials, licenças ou entitlements sem autorização explícita para a operação específica.
- Não invente nomes, assinaturas ou comportamento de APIs. Consulte a documentação atual do Supabase quando implementar ou revisar funcionalidades dependentes dela.

## 5. Trial, licença e entitlement

Trial, licença e entitlement são controlados pelo servidor. A licença comercial não possui limite de aparelhos. O cliente pode apresentar o estado retornado pelo backend, mas não deve substituir a decisão do servidor.

Não reintroduza como autoridade comercial:

- device ID ou fingerprint;
- localStorage, IndexedDB ou outro estado local;
- códigos locais ou listas locais de códigos;
- relógio local ou contador de aparelhos;
- mecanismos antigos de ativação local.

Referências a esses mecanismos podem existir em documentação histórica quando estiverem claramente identificadas como pertencentes ao modelo anterior.

## 6. Migrations e banco como código

O schema deve ser reproduzível a partir das migrations versionadas no Git:

```text
supabase/migrations/ → Git → Supabase
```

- Não edite silenciosamente uma migration já aplicada em ambiente compartilhado ou remoto.
- Correções de schema aplicado devem ser registradas em uma nova migration.
- Não deixe funções críticas somente no banco remoto; mantenha a definição reproduzível no repositório.
- Não considere o Dashboard do Supabase como fonte única da definição do banco.
- Antes de qualquer escrita no Supabase, confirme que a tarefa a autoriza e que a operação está dentro do escopo.

## 7. Segurança

Revise os controles conforme o risco, priorizando:

1. Auth e identidade;
2. autorização;
3. RLS e policies;
4. RPCs e funções privilegiadas;
5. secrets e exposição de dados;
6. integridade, constraints e transações;
7. validação de entradas e erros;
8. dependências;
9. Service Worker e cache;
10. demais controles de segurança do PWA.

Não remova uma proteção apenas para facilitar uma implementação. Não enfraqueça RLS, grants ou validações sem análise e autorização compatíveis com o escopo.

## 8. Testes e validação

Altere Auth, trial, licença, entitlement, RLS, RPC, migrations ou segurança somente com validação proporcional ao risco. Correções de vulnerabilidades ou falhas de autorização devem incluir testes de regressão quando tecnicamente aplicável.

Não execute testes que alterem dados remotos sem autorização expressa. Não remova testes para fazer código passar. Diferencie testes executados, análise estática e cenários que dependem de ambiente ou dados não disponíveis.

## 9. Controle de escopo

Antes de editar:

1. inspecione o estado e os arquivos envolvidos;
2. identifique dependências e efeitos da alteração;
3. confira arquivos autorizados e proibidos;
4. faça a menor mudança que atenda ao objetivo.

Não faça refatorações ou limpezas não solicitadas, não instale dependências sem justificativa e não altere arquitetura sem aprovação. Preserve arquivos não rastreados, backups, encoding e line endings quando a tarefa assim exigir. Se surgir uma decisão arquitetural relevante não prevista, pare e peça decisão humana.

## 10. Uso de IA (Claude, Codex, GPT)

A IA deve inspecionar antes de modificar, respeitar o escopo, preservar arquitetura e segurança, não inventar APIs, não esconder alterações inesperadas e apresentar evidências das validações realizadas. Dúvidas sobre risco, identidade do repositório ou efeitos fora do escopo exigem pausa e esclarecimento humano.

## 11. Definition of Done

Conforme aplicável à tarefa, a conclusão deve confirmar:

- objetivo atingido e escopo respeitado;
- testes ou validações executados e seus resultados;
- revisão de segurança quando pertinente;
- `git status`, diff e `git diff --check` revisados;
- arquivos fora do escopo preservados;
- alterações inesperadas investigadas;
- nenhum segredo exposto.

Commit e push somente quando explicitamente autorizados (§14).

## 12. Critérios de parada

Pare e solicite revisão humana diante de:

- alteração fora do escopo ou risco ao repositório legado;
- migration ou escrita remota inesperada;
- mudança crítica de RLS, grants, Auth ou autorização não prevista;
- segredo exposto;
- mudança comercial não solicitada;
- remoção de teste ou quebra de comportamento existente;
- nova dependência sem justificativa;
- quantidade inesperada de arquivos alterados;
- divergência relevante entre a tarefa e o estado real do projeto.

Quando o resultado começar a fugir do objetivo, pare antes de continuar.

## 13. Princípio de simplicidade

Use a menor solução segura e sustentável. Não introduza infraestrutura, abstrações ou processos empresariais sem necessidade real. Prefira mudanças pequenas, compreensíveis, testáveis e reversíveis.

## 14. Autorizações

| Operação | Permissão |
|---|---|
| Leitura, análise e testes locais não destrutivos | Permitidos |
| Edição de arquivos | Conforme o escopo da tarefa. HTML, CSS e JavaScript só quando a tarefa os incluir |
| Commit, push, PR, merge, deploy, escrita no Supabase ou na infraestrutura | Somente com autorização explícita do Product Owner, vinculada à operação e ao escopo (branch, PR ou SHA) |

- A autorização de uma operação não vale para outra. Aprovar uma interface não autoriza alterar sistemas críticos, e aprovar uma mudança técnica não autoriza alterar outras áreas.
- Expressões genéricas de concordância ("ok", "pode", "sim", "beleza") não autorizam publicação. Merge e deploy exigem "Autorizo" que identifique a operação e o PR ou SHA.
- Concluir uma etapa não dispara push, PR, merge nem deploy. Não há commits automáticos de handoff.
- A aprovação do environment `github-pages` é do Product Owner. Avisos automáticos de ferramentas (por exemplo, de commits não enviados) não são autorização.
- Quando commit for autorizado, prefira um commit por etapa concluída.

## 15. Evolução contínua e hierarquia de autoridade

Nenhuma interface, protótipo, identidade visual, arquitetura ou decisão de produto é permanentemente imutável. O Product Owner pode aprovar, a qualquer momento, imagens técnicas, ilustrações e diagramas; animações e transições; mudanças de cores, tipografia, ícones e identidade; reorganização de cards, menus, navegação e componentes; redesenho parcial ou completo de qualquer tela; inclusão, remoção ou evolução de funcionalidades; e mudanças arquiteturais justificadas tecnicamente.

Os protótipos atualmente aprovados (`docs/interface-2.1/telas/`) são a **referência visual vigente**, não uma proibição de melhorias. Uma nova decisão aprovada substitui a anterior somente no escopo definido; a decisão substituída permanece registrada como histórico e deixa de exercer autoridade sobre novas implementações. Uma IA não pode rejeitar uma proposta visual só porque um documento antigo descreve outro design. Antes de implementar, deve avaliar o impacto e identificar os requisitos funcionais e técnicos a preservar.

Hierarquia, da maior para a menor autoridade:

1. Requisitos de segurança, integridade técnica e autorizações vigentes.
2. Decisões explícitas e recentes do Product Owner, dentro do escopo autorizado.
3. Decisões técnicas e funcionais vigentes por assunto.
4. Protótipos visuais atualmente aprovados.
5. Documentos históricos, somente como referência.

Em conflito, identifique a divergência e sua consequência antes de agir. A documentação orienta a evolução do Casillas; não a congela.

## 16. Núcleo protegido e interface modernizável

**Núcleo protegido** (não é imutável para sempre, mas só muda por missão específica, com autorização, análise de riscos e testes proporcionais): motores matemáticos das calculadoras (`js/calc/`); autenticação e controle de acesso; licença, trial e entitlement; segurança e RLS; Supabase e migrations; Consultor Técnico determinístico; integridade do conteúdo CNC; service worker e funcionamento offline; testes, CI e Production Gate.

**Interface modernizável** (sujeita a propostas aprovadas): Home; Calculadoras e apresentação dos resultados; Consultor Técnico; Guia CNC; Biblioteca; Configurações; cabeçalho, menus e navegação; design system, imagens, ilustrações, animações e componentes compartilhados.

A modernização reutiliza as funcionalidades existentes sempre que apropriado. Não reconstrua módulos funcionais apenas para reproduzir um protótipo. Fidelidade visual considera composição, hierarquia, espaçamento, tipografia, componentes e comportamento; não implica substituir globalmente cores e tokens.

## 17. Linhas de desenvolvimento e fontes oficiais

- **Produção**: `casillas-2.0`. Em 2026-10-10, o HEAD da branch é `cd1411f` (merge do PR #12, só documentação) e o aplicativo publicado é `c115a3e` (service worker `casillas-v20`). São referências distintas; confirme no Git antes de agir.
- **CAS-UI**: frente de modernização da interface; documentação em `docs/interface-2.1/docs/`. Não confundir com a release `v2.1.0`.
- **`casillas-2.2`**: linha de desenvolvimento e governança com documentação e `AGENTS.md` próprios, pendente de integração. É preservada, não é considerada encerrada nem substituída, e não é mesclada sem decisão e autorização específicas.
- O repositório `Casillas_app_2` é a fonte oficial versionada de código, estado e documentação. O Claude Project e as memórias de conversas são material auxiliar e não concorrem como fontes de decisão.
- Fonte de cada assunto: estado e próxima atividade em `docs/interface-2.1/docs/00-ESTADO-ATUAL.md`; decisões da interface em `01-DECISOES-2.1.md`; release em `docs/STATUS.md`; segurança, licença e banco em `docs/DECISOES.md`, `docs/BANCO-DADOS.md` e `docs/SEGURANCA.md`.

## 18. Continuidade entre sessões

O protocolo de início de sessão, retomada após compactação, uso entre smartphone e desktop e encerramento está em `CLAUDE.md`. O registro do estado fica em `docs/interface-2.1/docs/00-ESTADO-ATUAL.md`.
