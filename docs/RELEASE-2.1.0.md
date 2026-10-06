# Casillas 2.1.0 — PRODUÇÃO HOMOLOGADA

Fechamento documental: 2026-10-06, missão CAS21-REL-03-R1.
A versão publicada é imutável; este documento nasce na linha de desenvolvimento 2.2.

| Referência | Valor |
| --- | --- |
| Versão / status | Casillas 2.1.0 / PRODUÇÃO HOMOLOGADA |
| Tag | v2.1.0 |
| SHA publicado | 1b3082e7ca82bb669180402cf419a56e51af374a |
| Branch estável | casillas-2.0 |
| Deployment | 6888207195 |
| Workflow de deploy | 37487857422 |
| Artifact digest SHA-256 | 62643ebb98ac7c19e3afb46ab80146cab6e9ba3f666f0e3c04a7c052985ae246 |
| Service Worker | casillas-v13 |
| Supabase | ACTIVE_HEALTHY; 14 migrations canônicas; última 20261006085942_ev3_telemetry |
| Produção | https://martinsdesiqueiraigor-art.github.io/Casillas_app_2/ |
| P0 / P1 | 0 / 0 |

## Fechamento das frentes

EV2 fechado: hardening comercial, validade/revogação, rate limiting e lease offline.
EV3 fechado: Consultor Técnico determinístico, Guia CNC 2.0, deep links, telemetria com RLS e outbox com ownership.
EV1 QA fechado; Production Gate CAS21-REL-01-R1 aprovado.
CAS21-REL-02-R1 publicou somente o SHA autorizado, por um dispatch e aprovação humana do environment.

CI da release: [run 37462439821](https://github.com/martinsdesiqueiraigor-art/Casillas_app_2/actions/runs/37462439821), SUCCESS.
Evidência homologada: EV3 20/20; frontend 63/63; Production Gate 8/8; sintaxe 76/76; pgTAP 167/167.
Build Linux e manifesto publicado têm o digest acima. Pós-deploy: 74/74 arquivos HTTP 200 e bytes iguais ao candidato.
Chrome com perfil limpo: zero pageerrors, requisições mutáveis e RPCs comerciais.

## PWA e fluxos homologados

- Teste físico Android, instalação PWA e offline real: homologados pela Coordenação na entrada de CAS21-REL-03-R1.
- Offline autenticado depende da identidade e do lease válido já implementados, derivados da validação online; não autoriza primeiro login/trial sem rede.
- Consultor → Guia: “rosca torno fanuc” → fanuc_torno_g76 → referência/sintaxe, com conteúdo local real.
- Compartilhamento → WhatsApp → Landing: preservar o fluxo de compartilhamento existente com link da landing. A validação manual HTTPS de Compartilhar App consta do histórico de [Testes](TESTES.md); não foi repetida neste fechamento.
- Os novos registros físicos são homologação fornecida pela Coordenação. Esta missão documental não realizou novos testes Android, PWA ou comerciais.

## Pendências e histórico de limitações

P2-01: o item visual do Consultor Técnico ainda difere dos demais itens do menu; aceito, não bloqueante.
P2-02 era a ausência de teste físico completo Android na fase inicial; a homologação física informada nesta missão atualiza essa limitação histórica.
Observação cosmética do smoke público: favicon automático na raiz do domínio retorna 404, fora do caminho do aplicativo; nenhum asset crítico está ausente.
Avisos INFO de performance: FK de guide_feedback sem índice de cobertura na ordem da FK; índice novo de chat_interactions ainda sem uso.
Não houve correção desses itens neste fechamento.

## Rollback e autoridade documental

Referência anterior: 8c56306054db0cf13b53481890022edfa01aeda4.
Rollback exige missão separada, novo commit com árvore aprovada, CI/Production Gate e autorização de deploy.
Sem force push, downgrade automático do Supabase ou reutilização desta autorização para outro SHA.

**Casillas 2.1 não deve ser reinterpretado por documentos históricos anteriores.**
Leia [Baseline 2.1](BASELINE-2.1.md) e [Handoff 2.1 → 2.2](HANDOFF-2.1-TO-2.2.md).
