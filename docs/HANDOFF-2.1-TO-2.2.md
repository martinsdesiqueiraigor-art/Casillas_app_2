# Handoff Casillas 2.1 → 2.2

Casillas 2.1 é a baseline estável em produção: v2.1.0, SHA 1b3082e7ca82bb669180402cf419a56e51af374a.
Casillas 2.2 é a linha de redesign/UX com retrofit progressivo; ainda não é uma nova versão publicada.
A criação desta branch não autoriza alterações funcionais, comerciais ou de produção.

## Isolamento

- Referência oficial 2.1: C:\Projetos\Casillas_app_2, casillas-2.0 no SHA publicado, limpa.
- Desenvolvimento: C:\Projetos\Casillas_2.2_DEV, branch casillas-2.2, inicialmente derivada de v2.1.0.
- Backup: C:\Projetos\Backups\Casillas_2.1, snapshot por git archive, ZIP, bundle autossuficiente, checksums e instruções de restauração.
- A tag aponta ao código publicado, antes do commit documental desta linha. Estes documentos não alteram a release congelada.
- Futuras missões devem indicar esta pasta e branch explicitamente; não desenvolver diretamente na release.

## Princípios congelados

Vanilla JS / ES Modules; sem rewrite e sem framework novo.
Preservar motores de cálculo, Auth/licença, lease offline, rate limiting, RLS, outbox, identidade e gates existentes.
Consultor continua local/determinístico; LLM está fora do escopo 2.2.
G71/G70/CYCLE95 somente após fonte e validação técnica explícitas; nenhum ciclo foi criado neste fechamento.
Biblioteca deve ter autoridade documental e fontes rastreáveis.
Design System + pilotos antes de escalar alterações visuais.
Integrar progressivamente o retrofit ao modelo existente; não recriar a infraestrutura listada na [Baseline](BASELINE-2.1.md).

## Estado e pendências

EV2, EV3, EV1 e Production Gate fechados; [Release](RELEASE-2.1.0.md) contém evidências, limitações e rollback.
P2 visual do menu permanece aceito. A limitação física Android inicial é histórica diante da homologação fornecida pela Coordenação.
Sem novo deploy, Supabase write, migration, alteração comercial ou funcional nesta missão.

Próxima ação exige missão formal da Coordenação para Casillas 2.2. Nenhum PR foi aberto neste fechamento.
