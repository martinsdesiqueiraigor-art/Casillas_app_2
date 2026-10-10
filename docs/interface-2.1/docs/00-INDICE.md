# CAS-UI — Documentação da modernização da interface

Atualizado em: 2026-10-10 (CAS-DOC-RECONCILIACAO-01). CAS-UI é a frente de modernização da interface do Casillas. Não é a release `v2.1.0`. Ler primeiro: `CLAUDE.md` (raiz) e `00-ESTADO-ATUAL.md`.

## Fonte oficial por assunto

O repositório é a fonte oficial versionada. O Claude Project e as memórias de conversas são material auxiliar e não concorrem como fontes.

| Assunto | Fonte oficial |
|---|---|
| Regras permanentes, segurança, autorizações, hierarquia | `AGENTS.md` |
| Continuidade de sessão | `CLAUDE.md` |
| Estado, branches, SHAs, etapas e próxima atividade | `00-ESTADO-ATUAL.md` |
| Decisões da interface (vigentes e substituídas) | `01-DECISOES-2.1.md` |
| Produto e navegação | `02-PRODUTO-E-NAVEGACAO.md` |
| Estado de cada tela (protótipo, implementação, fidelidade) | `CHECKLIST-TELAS.md` |
| Protótipos visuais aprovados | `../telas/` |
| Licença, trial, banco, segurança | `docs/DECISOES.md`, `docs/BANCO-DADOS.md`, `docs/SEGURANCA.md` |
| Venda e licença manual | `docs/OPERACAO-COMERCIAL.md`, `docs/PRIMEIRA-VENDA.md` |
| Release e publicação | `docs/STATUS.md`, `.github/workflows/static.yml` |
| Linha de desenvolvimento 2.2 | Branch `casillas-2.2` (preservada, pendente de integração) |

## Precedência

Segurança e autorizações vigentes > decisões explícitas e recentes do Product Owner > decisões técnicas e funcionais vigentes > protótipos aprovados > documentos históricos (`AGENTS.md` §15). Uma decisão nova substitui a anterior apenas no escopo definido, que permanece registrada como histórico. Em tema comercial ou de segurança, se um documento desta pasta contradisser os documentos atuais do repositório, vale o documento atual e o conflito vira pendência em `01-DECISOES-2.1.md`.

## Documentos desta pasta

1. `00-ESTADO-ATUAL.md` — onde o trabalho está, etapas, pendências e próximo passo.
2. `01-DECISOES-2.1.md` — decisões vigentes, substituídas e pendentes.
3. `02-PRODUTO-E-NAVEGACAO.md` — o que o app é e como se navega.
4. `CHECKLIST-TELAS.md` — estado das telas.
5. `03-FATIA-2-PLANO.md` — plano original da fatia 2 (histórico; a correspondência de etapas está no estado).
6. `REGRAS-DE-TRABALHO.md` — documento histórico, substituído por `AGENTS.md` e `CLAUDE.md`.

## Regras de escrita

- Toda afirmação sobre o código cita o arquivo. Sem fonte, não entra.
- O que não foi decidido fica como **A definir** ou **pendente**. Ninguém escolhe por omissão.
- Conteúdo técnico de usinagem tem estado: `rascunho` ou `revisado`.
- Não criar planos mestres, registros paralelos ou cópias concorrentes.
