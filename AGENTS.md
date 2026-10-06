# Contrato operacional — Casillas 2.2 sobre baseline 2.1.0

Estas instruções se aplicam às tarefas de desenvolvimento realizadas neste repositório. Instruções explícitas do usuário definem o escopo da tarefa e devem ser respeitadas.


## Baseline congelada e linha 2.2

Leia obrigatoriamente [Baseline 2.1](docs/BASELINE-2.1.md), [Release](docs/RELEASE-2.1.0.md) e [Transição](docs/HANDOFF-2.1-TO-2.2.md).
v2.1.0 aponta ao SHA 1b3082e7ca82bb669180402cf419a56e51af374a e é referência congelada de produção.
casillas-2.2 é desenvolvimento; toda mudança é retrofit progressivo, sem rewrite/framework novo.
Não recriar eventBus, router, supabaseClient, syncQueue, outbox, ConsultorAgent/FSM, slotExtractor/resolver,
Result Card, GuiaManager/renderers, deep links, telemetria/RLS, CI ou Production Gate.
Preservar motores, Auth/licença, rate limiting e lease offline existente; lease é derivado de validação server-side e limitado, não uma nova autoridade comercial local.
Consultor continua local/determinístico; LLM fora do 2.2. Conteúdo CNC novo exige fonte/validação em missão específica.
Produção, deploy, Supabase write e mudanças comerciais só mediante missão explícita futura para SHA/escopo determinados.
Não usar a linha 2.2 como autorização implícita de integração. Nesta missão só documentação está autorizada.

## 1. Identidade do projeto

Este projeto é o **Casillas — Calculadora Técnica de Usinagem**, com baseline de produção 2.1.0 e linha de desenvolvimento 2.2.

## 2. Repositórios e separação

- `Casillas_app` é o repositório legado, mantido como referência histórica. Não o altere como parte do desenvolvimento do Casillas 2.2.
- `Casillas_app_2` é o repositório oficial; a pasta `C:\Projetos\Casillas_app_2` preserva a release 2.1.
- O remote oficial é `origin`, apontando para `https://github.com/martinsdesiqueiraigor-art/Casillas_app_2.git`.
- A branch de desenvolvimento é `casillas-2.2`, na cópia independente `C:\Projetos\Casillas_2.2_DEV`. Não desenvolver diretamente em `casillas-2.0`.
- O remote `legacy`, quando configurado, aponta para `https://github.com/martinsdesiqueiraigor-art/Casillas_app.git`.
- O nome da pasta local não comprova a identidade do repositório. Antes de operações Git importantes, confirme remote, branch e estado.

Antes de operações Git importantes, consulte:

```bash
git remote -v
git branch --show-current
git status --short
```

Nunca envie alterações do Casillas 2.2 para `legacy` e nunca modifique o repositório legado como parte de uma tarefa do 2.0. Não faça commit ou push sem autorização explícita. Não use `reset`, `checkout` ou `clean` para descartar estado local.

## 3. Princípio arquitetural

> O frontend apresenta e solicita. O backend/banco de dados autoriza e protege.

O frontend cuida da interface, navegação, cálculos técnicos, apresentação de estados, chamadas à API, cache e experiência offline. Não é autoridade final para licença, entitlement, autorização comercial, permissões administrativas ou validade definitiva do acesso.

O Service Worker administra recursos e cache do PWA; não concede autorização comercial. A Home apenas apresenta o estado comercial recebido e não concede acesso.

## 4. Supabase

O Supabase é responsável por Auth, PostgreSQL, RLS, funções server-side, trial, licenças, entitlements e eventos de acesso.

- Nunca exponha chaves privilegiadas ou qualquer segredo server-side no frontend, em logs ou em arquivos versionados.
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

## 10. Uso de IA/Codex

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

Commit e push somente quando explicitamente autorizados.

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
