# Decision Register — Casillas 2.2

Registro inicial da missão CAS22-OPS-01-R1 em 2026-10-06. Consolida decisões explícitas da Coordenação e contratos existentes; não é nova implementação, auditoria ou homologação técnica. Base F0: `b3c80007ca82533cfc2cd350911ced05316e9451`.

| ID | Decisão | Estado | Referência / limite |
| --- | --- | --- | --- |
| D01 | Casillas 2.1 congelado/homologado | FECHADO | [Release](../../RELEASE-2.1.0.md), v2.1.0 em `1b3082e7ca82bb669180402cf419a56e51af374a` |
| D02 | Casillas 2.2 é retrofit, não rewrite | VIGENTE | [Transição](../../HANDOFF-2.1-TO-2.2.md); sem recriar infraestrutura |
| D03 | Stack Vanilla JS + ES Modules | VIGENTE | [Baseline](../../BASELINE-2.1.md); sem framework novo |
| D04 | Consultor local/determinístico; sem LLM remoto em 2.2 | VIGENTE | [Integração](../DOMAIN-INTEGRATION-CONTRACT.md); preservar FSM/slots/resolver |
| D05 | Guia CNC é autoridade canônica | VIGENTE | [Conteúdo CNC](../CNC-CONTENT-CONTRACT.md); IDs e banco existentes |
| D06 | Programação CNC é camada de aplicação; sem banco paralelo | VIGENTE | [Conteúdo CNC](../CNC-CONTENT-CONTRACT.md); integração futura exige homologação dos templates |
| D07 | Quatro ciclos EV3 atuais são núcleo inicial homologado, não limite permanente | VIGENTE | [Baseline](../../BASELINE-2.1.md); homologação estrutural/paridade, sem nova certificação técnica |
| D08 | Novos ciclos exigem validação técnica específica | VIGENTE | [Conteúdo CNC](../CNC-CONTENT-CONTRACT.md) e [fonte/revisão](../SOURCE-REVISION-CONTRACT.md); missão técnica e fontes |
| D09 | Biblioteca Técnica é autoridade documental | VIGENTE | [Biblioteca](../LIBRARY-CONTRACT.md); fonte, direitos e proveniência |
| D10 | Calculadoras preservam motores atuais; redesign não altera matemática implicitamente | VIGENTE | [Design System](../DESIGN-SYSTEM-CONTRACT.md) e [plano](../PLAN-MASTER-2.2.md) |
| D11 | F0 concluída no commit `b3c80007ca82533cfc2cd350911ced05316e9451`; não repetir sem nova evidência | FECHADA | [Handoff F0](../HANDOFF-CAS22-F0-01-R1.md); fechamento documental, sem aceite visual de M1 |
| D12 | Mudanças visuais relevantes exigem aprovação visual | VIGENTE | [Visual Approval Gate](VISUAL-APPROVAL-GATE.md); aprovação de Igor antes de escala |
| D13 | Biblioteca não vira aba principal vazia | VIGENTE | [Biblioteca](../LIBRARY-CONTRACT.md); ativação após coleção V1 útil e aceita |
| D14 | Consultor não é quinta aba fixa | VIGENTE | [Navegação](../NAVIGATION-CONTRACT.md); ação em destaque no shell/Home |
| D15 | Navegação final pretendida: Início / Calculadoras / Guia CNC / Biblioteca | VIGENTE | [Navegação](../NAVIGATION-CONTRACT.md); Biblioteca condicionada ao gate, destinos futuros |

## Manutenção e reabertura

Antes de auditoria, implementação ou correção, ler este registro junto à baseline, contratos, [fase atual](README.md), commits e evidências homologadas. Decisão VIGENTE orienta missões futuras; FECHADO/FECHADA preserva conclusão e histórico, sem impedir correção por evidência nova.
Reabrir somente por evidência contraditória, regressão real, mudança de requisito, nova dependência ou falha observável. Registrar ID afetado, gatilho/prova, missão, responsável, escopo/impacto, decisão da Coordenação e aprovação de Igor quando crítica, comercial ou visual. Não substituir silenciosamente registros; vincular decisão sucessora e preservar origem/estado anterior.
Não repetir sem evidência nova auditoria arquitetural homologada, testes físicos encerrados, EV2, EV3, F0 ou decisões de stack/offline/FSM/banco canônico CNC. Evidências da [release](../../RELEASE-2.1.0.md) são herdadas, não executadas novamente nesta OPS.
Este registro não concede autorização para integração, produção, banco, novos ciclos ou mudança comercial.
