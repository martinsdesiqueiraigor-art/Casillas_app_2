# Política de plugins

Selecionar ferramentas pela necessidade da missão; **não chamar todos os plugins em todas as missões**. Esta política define usos pretendidos, não comprova instalação/disponibilidade nem concede autorização de ações. Conferir capacidades reais antes de usar; indisponibilidade é registrada, sem inventar APIs ou instalar infraestrutura implicitamente.

| Plugin | Uso pertinente | Limite |
| --- | --- | --- |
| Codex Coordinator | Coordenação, claims/path ownership, dependências, colisões e avisos sparse | Não é scheduler, heartbeat, watcher permanente ou polling; sem Agent Bus customizado |
| Superpowers | Brainstorming, design, plano, TDD, debugging, verificação e code review | Aplicar etapas proporcionais; não reabrir decisões ou homologações sem evidência nova |
| Codex Dev Workflows | Feature development/testing, comprehensive QA, code review, handoff e pre-release | Respeitar fase/escopo; pre-release não autoriza produção ou substitui Production Gate |
| Remote Desktop Commander | Inspeção do PC, arquivos, Git, comandos, testes e screenshots | Inspeção e comandos limitados à missão; preservar release e legado |
| Context7 | Documentação atualizada de bibliotecas/APIs | Confirmar versão e fonte; documentação não decide arquitetura |
| Supabase | Somente quando tocar banco, Auth, RLS, migrations, RPC ou logs | Leitura/escrita conforme missão; write remoto exige autorização específica, sem exposição de segredos |
| TinyFish | Fontes públicas, manuais e pesquisa atual | Registrar fonte/proveniência; descoberta não é homologação CNC nem permissão de reprodução |
| HTML Code Generator | Apoio à UI, responsividade, HTML/CSS | Não é autoridade arquitetural; retrofit sobre Vanilla JS/ES Modules e componentes existentes |
| GitBook | Documentação pública madura | Não é rotina diária nem substitui contratos versionados; publicação requer autorização |

## Seleção e registro

Antes de chamar, identificar pergunta/ação concreta, relação com paths e gate da missão e acesso necessário. Reusar evidência já homologada quando válida. Registrar ferramenta e evidência produzida no handoff, distinguindo pesquisa, análise estática, execução e revisão.
Ferramentas não ampliam permissões de commit, push, comunicação externa, banco ou deploy. Encontrar API ou manual não autoriza integração, conteúdo CNC novo ou mudança comercial. Não inserir credenciais, tokens ou dados sensíveis em prompts, URLs, screenshots ou documentos.
Imagem gerada por IA pode ser referência identificada, mas a prova principal do [gate visual](VISUAL-APPROVAL-GATE.md) é tela real renderizada pelo código.
Nesta OPS, a seleção pode se limitar a leitura/edição documental e validações locais de Git/links; não é necessário chamar plugins de implementação, banco, pesquisa ou revisão de frentes fechadas.
