# Contrato da equipe multiagente

Aplicar a [leitura mínima e política anti-retrabalho](README.md) antes de assumir qualquer escopo. Os papéis definem responsabilidades, não novos serviços ou agentes permanentes.

## Papéis e autoridade

| Papel | Responsabilidade |
| --- | --- |
| Product Owner — Igor | Direção, aprovação visual, decisões comerciais, merge/release/deploy e mudanças críticas |
| Coordenação — CAS22-COORD | Decomposição, roteamento, dependências, consolidação de evidências e gates |
| Codex Executor | Implementação autorizada, testes locais proporcionais, commits autorizados e handoffs |
| QA | Regressão, UX, acessibilidade, responsividade e comportamento |
| Security | Auth, trial, licença, lease, RLS, Supabase, identidade, telemetria e persistência sensível |
| CNC | Ciclos, sintaxe, variantes, controles, aplicações e homologação técnica específica |
| Library | Fontes, revisão, direitos, proveniência e Biblioteca Técnica |

Uma revisão não concede autorização comercial, técnica ou de produção. O frontend apresenta e solicita; backend/banco autoriza e protege. Preservar motores, Auth/licença, rate limiting, lease limitado derivado do servidor, RLS, outbox, FSM, infraestrutura e gates existentes. Consultor permanece local/determinístico, sem LLM remoto em 2.2.

## Escritor único e ownership

Um único escritor funcional por escopo. Revisores são **read-only por padrão**: não corrigem arquivos durante revisão. A missão identifica escritor, paths autorizados/proibidos, base SHA e dependências. Antes de editar, confirmar pasta, origin, branch, SHA e estado esperado; divergência bloqueia a missão, sem reset, clean ou troca automática de branch.

Usar Codex Coordinator, quando disponível e pertinente, para claims, path ownership, colisões, dependências e avisos sparse. Claim registra missão, responsável e paths; não amplia autorização de edição. Escopos sobrepostos, inclusive contratos compartilhados, exigem serialização ou redefinição pela Coordenação antes de escrever. Liberar/transferir claim no handoff ou na suspensão, com estado registrado e sem descartar alterações.
Se a ferramenta não estiver disponível, registrar ownership na missão/handoff e comunicar o limite à Coordenação; não instalar ou construir infraestrutura por inferência. O Coordinator não é scheduler, heartbeat, watcher permanente ou polling. Não criar Agent Bus customizado.

## Findings e correções

Fluxo obrigatório: **REVISOR → COORDENAÇÃO → missão corretiva → CODEX**.
Finding contém ID, missão/SHA revisado, path ou cenário, impacto, evidência observável, resultado esperado/obtido e recomendação delimitada. Diferenciar falha confirmada, limitação e dúvida; não converter hipótese em regressão ou reabrir fase sem gatilho válido.
A Coordenação consolida duplicatas, avalia dependências/prioridade e emite missão corretiva com aceite. Codex executa somente o escopo autorizado; o revisor verifica a correção no SHA correspondente. Aprovações críticas e visuais cabem ao Product Owner.

## Parada e entrega

Parar diante de colisão não resolvida, divergência de base, mudança fora de escopo, segredo exposto, escrita remota inesperada, proteção enfraquecida ou decisão arquitetural não prevista. Preservar estado e informar evidência, bloqueador e decisão necessária à Coordenação.
Entregar diff/paths, SHA, verificações executadas e limites, findings pendentes e claims/dependências. Seguir o [workflow](WORKFLOW-2.2.md); ausência de evidência não vira aprovação.
