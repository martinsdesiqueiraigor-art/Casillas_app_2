# Handoff — CAS22-F0-01-R1

Executor: CODEX LOCAL. Destino: CAS22-COORD. Data: 2026-10-06.

## Base inspecionada

Pasta `C:\Projetos\Casillas_2.2_DEV`, branch `casillas-2.2`, origin oficial `https://github.com/martinsdesiqueiraigor-art/Casillas_app_2.git`.
Entrada limpa no primeiro commit documental 2.2: `04fac8a4582b713e888a7d146ab755f55c53414e`.
Produção congelada v2.1.0: `1b3082e7ca82bb669180402cf419a56e51af374a`. Baseline, release, transição e AGENTS.md lidos.

## Arquitetura reutilizada e contratos criados

Inspeção estática de CSS/tokens, app/menu/router/eventBus, Programação/motor G-code, tipos/banco/adapter/GuiaManager/renderers, FSM/slotExtractor/resolver/ResultCard/UI Consultor e pilotos Trigonometria/Tolerâncias.
Contrato preserva Vanilla JS/ES Modules, motores, Auth/licença/lease, rate limiting, supabaseClient, IndexedDB, syncQueue/outbox, Service Worker, RLS, telemetria, CI e Production Gate. Não há versões paralelas.

- Guia CNC x Programação: identidade técnica única no banco canônico do Guia; Programação aplica templates homologados. Gerador atual independente, com G71/G70/G75 legados registrados, sem certificação ou correção nesta missão.
- Expansão: quatro ciclos herdados permanecem; novos ciclos somente por missão EV3 com fonte/validação e extensão coordenada dos contratos existentes.
- Fonte/revisão: sourceId estável, edição da fonte separada de revisão do conteúdo, escopo/evidência/responsável e status; proveniência incompleta não vira homologação.
- Variantes: pertencem ao cycleId, com contexto/diferenças/fonte/revisão reais; sem seletor vazio ou modelo inventado.
- Biblioteca: autoridade documental, relações por IDs, direitos e disponibilidade; ativação somente com coleção V1 útil e aceita.
- Design System: reutiliza tokens da paleta existente, define componentes por equivalentes, toque/safe area/breakpoints e aceite dos pilotos.
- Navegação: Início/Calculadoras/Guia/Biblioteca condicionada; Consultor em destaque. Rotas futuras explicitamente distinguidas do deep link do Guia existente.
- Integrações: OPEN_GUIDE corresponde a EVT.GUIDE_OPEN; demais ações são extensões futuras do mesmo mecanismo, payloads limitados e prefill validado no destino.

## Arquivos

Criados: `README.md`, `DESIGN-SYSTEM-CONTRACT.md`, `NAVIGATION-CONTRACT.md`, `DOMAIN-INTEGRATION-CONTRACT.md`, `CNC-CONTENT-CONTRACT.md`, `SOURCE-REVISION-CONTRACT.md`, `LIBRARY-CONTRACT.md`, `PLAN-MASTER-2.2.md` e este handoff, todos em `docs/2.2/`.
Arquivos existentes atualizados: nenhum. Arquivos funcionais alterados: **0**.
A estrutura solicitada foi mantida; acrescentado apenas este handoff para tornar a entrega à Coordenação versionada.

## Validação e registro Git

Validações executadas: identidade Git correta; diff documental revisado; `git diff --check` e `git diff --cached --check` sem erros; allowlist 9/9 Markdown em `docs/2.2`, zero arquivos funcionais; links relativos locais existentes; varredura de placeholders e padrões de credenciais sem ocorrências. A varredura é estática e limitada aos documentos novos.
Testes funcionais/Android/PWA/Supabase não executados nesta missão documental; evidências 2.1 citadas são herdadas. Sem nova auditoria matemática ou homologação CNC.

Um commit documental autorizado: `docs: definir contratos e plano mestre do Casillas 2.2`.
SHA verificável por `git log -1 --format=%H -- docs/2.2`; este arquivo integra o mesmo commit e não pode conter o próprio SHA antecipadamente.
Push autorizado apenas para `origin/casillas-2.2`; confirmação efetiva no handoff da conversa. Não abrir PR, merge ou deploy.

Produção: **INALTERADA**. Supabase: **INALTERADO**. Deploy: **NÃO REALIZADO**.
Decisão de fechamento documental: **F0 CONCLUÍDA — CASILLAS 2.2 PRONTO PARA DESIGN SYSTEM**. Próxima implementação exige missão F1 e aceite dos gates posteriores; este pacote não concede autorização funcional ou de produção.
