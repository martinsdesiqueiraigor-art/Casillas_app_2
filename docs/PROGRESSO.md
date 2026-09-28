# Casillas App 2.0 — Progresso

## Referência

- Branch de trabalho: `casillas-2.0`
- Commit de referência para este marco: `24475a08cf6eadd83ec3fe8623735163540e5112` — `feat: refinar Home do Casillas 2.0`
- Projeto Supabase informado: `Casillas` (`maayjshlsxvxtrgjpcep`), região `sa-east-1`, plano Free.
- Este registro é documental; não representa uma nova consulta ao Supabase.

## Concluído conforme código e histórico disponível

### Identidade e acesso

- Supabase Auth integrado ao fluxo da aplicação.
- A sessão e a identidade do usuário são verificadas antes da inicialização protegida.
- `checkTrialStatus()` consulta primeiro o entitlement comercial remoto e, sem acesso comercial válido, consulta/inicia o trial remoto.
- O trial remoto tem duração configurada de 30 dias; trial ativo libera o app e informa dias restantes; trial expirado bloqueia o acesso.
- A ativação comercial usa a RPC `activate_casillas_license`; o cliente consulta o entitlement após a ativação.
- A antiga flag `trial-activated` deixou de ser fonte de autorização.
- O antigo sistema local de validação, device ID, limite de aparelhos e anti-manipulação foi removido de `js/trial.js`.
- A licença comercial não depende de limite de aparelhos; a conta autenticada é a identidade associada ao acesso.

### Aplicativo e Home

- A Home visual foi refinada no commit de referência, com grupos de ferramentas, acesso rápido e catálogo.
- O roteador registra 12 módulos: trigonometria, conicidade, polígonos, furação circular, roscas, tolerâncias ISO, chaveta DIN 6885, conicidades padrão, potência de corte, programação CNC, guia de programação e consultoria.
- O usuário informou que a Home foi testada visualmente com sucesso. Essa evidência é manual e não substitui testes automatizados ou validação de todos os módulos.
- O Service Worker está em `casillas-v10`.
- O botão de ativação em Consultoria abre o WhatsApp com mensagem de suporte; não recupera código por aparelho.

## Pendências e validações

- Executar teste funcional integrado do trial (cadastro/login, trial existente, recarga, logout e novo login) em conta de teste, sem alterar dados de produção.
- Testar estados de expiração e falha de rede de forma controlada.
- Confirmar em ambiente Supabase controlado os cenários de entitlement ativo, revogado e expirado; esta documentação não executou chamadas remotas.
- Verificar e versionar de forma reproduzível a definição remota `get_casillas_entitlement()` em migration, após revisão e processo próprios. A busca local não encontrou sua definição nas migrations existentes.
- Revisar segurança, permissões e RLS das funções/tabelas em ciclo próprio.
- Revisar atualização de cache do Service Worker nos navegadores suportados.
- Não tratar pagamentos, painel administrativo ou publicação pública como concluídos sem evidência atual específica.

## Ferramenta legada

`gerar-codigo.html` permanece temporariamente preservada como ferramenta administrativa independente. Ela gera códigos/hash localmente e não cria, ativa ou revoga licenças no Supabase. O Service Worker ainda a pré-cacheia. Consultar `docs/DECISAO-GERAR-CODIGO-2026-09-28.md` no backup de referência antes de qualquer remoção.

## Backups e histórico

Preservar os backups existentes. `docs/backup-2026-09-27/` é material histórico e pode conter descrições de arquitetura já superadas; não deve ser confundido com o estado atual nem alterado durante tarefas documentais sem pedido específico.
## Proveniência e validação

### Histórico documentado (não repetido neste marco)

- A documentação de 27/09/2026 registrava projeto Supabase e schema comercial inicial, RLS, Auth, criação automática de perfil, RPC de trial e leitura autenticada do trial.
- Foram registrados 17 testes de banco/RLS aprovados; consulte `docs/TESTES.md` para o que a suíte local cobre. O resultado não prova estado remoto atual.
- Commit `b238dde` — `fix: tornar Supabase autoridade do trial` — foi registrado como a migração da autoridade do trial para o Supabase e publicado em `origin/casillas-2.0` naquele momento.
- Commit-base atual deste marco: `24475a08cf6eadd83ec3fe8623735163540e5112` — `feat: refinar Home do Casillas 2.0`; refinou Home e atualizou o cache para v10.
- Node.js, Git, VS Code, Supabase CLI e Docker constavam como configurados no registro anterior; instalação/configuração não foi revalidada aqui.

### Validado atualmente neste marco

- Código local confirma os 12 loaders e a Home na entrada.
- O usuário informou teste visual bem-sucedido da Home.
- O código de `trial.js` chama entitlement antes do trial; isso é inspeção local, não teste funcional remoto.
- Nenhum teste de backend ou de interface foi executado nesta atualização documental.

### Ainda não validado atualmente

- Bateria integrada do trial, estados de erro e expiração.
- RLS, permissões e definição das funções na implantação remota.
- Testes de todos os módulos, dispositivos, instalação/offline e atualização do Service Worker.
- Publicação e URL pública atual do PWA.

Use `docs/MARCO-2026-09-28-FLUXO-COMERCIAL.md` como snapshot histórico de `844d838`; este documento e o marco `HOME-E-FLUXO-COMERCIAL` descrevem a referência posterior `24475a0`.