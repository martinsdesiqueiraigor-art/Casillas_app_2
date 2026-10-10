# Decisões da CAS-UI (vigentes, substituídas, históricas e pendentes)

Atualizado em: 2026-10-10 (CAS-DOC-RECONCILIACAO-01). Registro oficial das decisões da frente CAS-UI. Os identificadores levam o prefixo `CAS-UI-` para não se confundirem com as decisões D01 a D16 da linha `casillas-2.2` (em `docs/2.2/operations/DECISION-REGISTER.md`, na branch `casillas-2.2`).

**Precedência e evolução contínua** (texto completo em `AGENTS.md` §15): nenhuma decisão de interface é permanente. Uma decisão nova e explícita do Product Owner substitui a anterior apenas no escopo definido; a substituída fica registrada aqui como histórico e perde autoridade sobre novas implementações. Segurança, integridade técnica e autorizações vigentes prevalecem sobre qualquer decisão de interface.

## 1. Decisões técnicas e comerciais vigentes (fora da interface)

| Tema | Decisão | Fonte |
|---|---|---|
| Autoridade comercial | Servidor decide trial, licença e entitlement. O frontend apresenta | `AGENTS.md` §3 e §5 |
| Licença | Por conta, vitalícia, sem limite de aparelhos | `docs/DECISOES.md` |
| Licença, renovação | Decidido em 2026-10-10: recursos novos de versões futuras exigem renovação. Quem não renova continua usando tudo que já tinha, sem bloqueio. Pendentes: como o app sabe a versão da licença (Supabase, só com migration revisada) e valor e prazo. Nenhum valor aparece nas telas | Product Owner, 2026-10-10 |
| Período de teste | 30 dias; texto visível "Período de teste" (não "Trial") | `docs/DECISOES.md` (G5) |
| Preço | R$ 19,90 lançamento, R$ 49,90 preço cheio, sem falsa urgência nem contagem regressiva | `docs/DECISOES.md` (G5) |
| Pagamento | PIX manual, dados só em conversa privada, nada no app ou no Git | `docs/PRIMEIRA-VENDA.md` |
| Escopo do Guia CNC | Só FANUC e Siemens | `docs/DECISOES.md` (Sprint 6C) |
| Offline | Cálculos locais; acesso offline só com lease válido de até 7 dias | `docs/DECISOES.md` (EV2-02) |
| Telemetria do Consultor | Sem texto bruto da pergunta | `docs/EV3-CONSULTOR-GUIA.md` |
| Publicação | Só por workflow manual, com SHA e aprovação do Product Owner | `docs/DECISOES.md` (Gate de produção) |
| Autorizações Git | Commit, push, PR, merge e deploy só com autorização explícita vinculada à operação | `AGENTS.md` §14 |

## 2. Decisões da CAS-UI

| ID | Decisão | Estado | Data |
|---|---|---|---|
| CAS-UI-D1 | Redesenhar a interface em fatias, em branch própria, com regressão | Vigente (ampliada por D20) | 2026-10-10 |
| CAS-UI-D2 | Conteúdo técnico novo no Guia nasce como rascunho com selo "Em revisão técnica" visível; só vira revisado com conferência do Product Owner | Vigente | 2026-10-10 |
| CAS-UI-D3 | O Product Owner revisa o conteúdo técnico | Vigente | 2026-10-10 |
| CAS-UI-D4 | Estender o schema do Guia com `schema_version`, atualizando `adapter.js`, `types.d.ts` e testes; sem migration do Supabase | Vigente. Aplicada em 2.9 (G76) | 2026-10-10 |
| CAS-UI-D4a | Achados técnicos pendentes do G76 (conteúdo em rascunho, **não homologado**): conferir `X17.4` contra `P(k)` 1,530 mm; `R(d)` em mm (protótipo) ou microns (v2); ausência de `R(i)`. Detalhe em `00-ESTADO-ATUAL.md` §5 e `CHECKLIST-TELAS.md` (linha Guia, Exemplo). Permanecem "Em revisão técnica" até conferência do Product Owner (D2, D3) | Pendente | 2026-10-10 |
| CAS-UI-D5 | Busca por texto livre no Consultor. Restrição vigente: funcionamento local, determinístico e sem serviço externo (sem API de IA ou de terceiros), preservando a FSM e a telemetria sem texto bruto; o texto das buscas não é guardado. A restrição só muda por nova decisão expressa do Product Owner | Vigente. **Não implementada** | 2026-10-10 |
| CAS-UI-D6 | Barra inferior de 4 itens é a navegação principal; o menu lateral continua durante as fatias e sai quando Conicidades Padrão estiver em Calculadoras, Consultoria na Biblioteca e Compartilhar app em Configurações | Vigente. Barra feita em 2.6; menu lateral pendente | 2026-10-10 |
| CAS-UI-D7 | Biblioteca entra sem PDFs (Contato, Serviços, Cursos, Licença) | Vigente. Feita em 2.8 | 2026-10-10 |
| CAS-UI-D8 | Idiomas PT/EN: PT padrão; o inglês só entra após revisão do Product Owner | Vigente. **Não implementada** | 2026-10-10 |
| CAS-UI-D9 | Consultor como cartão na Início e tela própria de resultado | Vigente. Cartão em 2.3; tela em 2.11 | 2026-10-10 |
| CAS-UI-D10 | Após o fim do teste nada fica disponível até ativar; o Guia está incluído na licença | Vigente | 2026-10-10 |
| CAS-UI-D11 | A trilha de interface é executada pelo Claude sob os mesmos gates | Vigente quanto ao papel. A parte sobre autorizações (push só com "autorizo push") foi **substituída** por D21 | 2026-10-10 |
| CAS-UI-D12 | Atualizar `STATUS`, `ARQUITETURA` e `ROADMAP` antes de qualquer release, com conferência do Product Owner | Em execução (CAS-DOC-RECONCILIACAO-01) | 2026-10-10 |
| CAS-UI-D13 | Limpeza de documentos históricos fica fora da CAS-UI por ora | Vigente | 2026-10-10 |
| CAS-UI-D14 | Cadastro com e-mail e senha desde o teste, com confirmação por e-mail (já existe em `auth.html` e `js/auth-page.js`) | Vigente. A interface só redesenha os fluxos | 2026-10-10 |
| CAS-UI-D15 | Manter as quatro abas Início, Calculadoras, Guia CNC e Biblioteca. Preservar a interface aprovada da Biblioteca atual, sem renomear a aba nem alterar sua implementação nesta etapa. A Biblioteca Técnica da linha 2.2 é funcionalidade distinta, com organização a decidir | Vigente | 2026-10-10 |
| CAS-UI-D16 | `casillas-2.0` é a referência de produção. Futuras alterações em branches específicas, com integração controlada mediante aprovação. `casillas-2.2` é preservada como referência documental e histórica, pendente de integração, sem merge entre as linhas | Vigente | 2026-10-10 |
| CAS-UI-D17 | Alvos de toque: 48 px nas ações principais e 44 px como mínimo geral, salvo exceções justificadas por acessibilidade e contexto. Protótipos aprovados são a referência visual prioritária; tokens compartilhados serão consolidados sem substituir globalmente cores e tokens nem alterar a identidade aprovada. Fidelidade = composição, hierarquia, espaçamento, tipografia, componentes e comportamento. Ícones consistentes e acessíveis, preferencialmente SVG | Vigente | 2026-10-10 |
| CAS-UI-D18 | Preservar cálculos, autenticação, licenciamento, Supabase, segurança, integridade CNC, CI e funcionamento offline. HTML, CSS e componentes de apresentação podem ser modernizados com autorização da tarefa e testes de regressão | Vigente (`AGENTS.md` §16) | 2026-10-10 |
| CAS-UI-D19 | Documentação enxuta: `AGENTS.md` (regras permanentes), `CLAUDE.md` (continuidade), este registro, o documento de estado e o checklist de telas. Sem planos paralelos nem cópias concorrentes; o repositório é a fonte oficial e o Claude Project é material auxiliar | Vigente | 2026-10-10 |
| CAS-UI-D20 | Evolução contínua: nenhuma interface, protótipo, identidade ou arquitetura é permanentemente imutável. A hierarquia de autoridade está em `AGENTS.md` §15 | Vigente | 2026-10-10 |
| CAS-UI-D21 | Autorizações: commit, push, PR, merge, deploy e Supabase só com autorização explícita vinculada à operação. Sem push automático ao concluir etapa; sem commits automáticos de handoff; expressões genéricas não autorizam publicação | Vigente (`AGENTS.md` §14) | 2026-10-10 |

Estados de implementação de cada tela (protótipo aprovado, implementação concluída, fidelidade validada) estão em `CHECKLIST-TELAS.md`.

## 3. Regras e decisões substituídas

| Regra ou decisão | Onde | Substituída por | Escopo da substituição |
|---|---|---|---|
| "Evolução incremental da interface existente, sem reconstrução visual ampla" | `docs/DECISOES.md` (Sprint 6C), escrita como "desta etapa" | CAS-UI-D1 e D20 | Interface |
| Push ao concluir uma etapa, sem pedir autorização de novo | `REGRAS-DE-TRABALHO.md` (seção "Commit e push") | CAS-UI-D21 | Todo o repositório |
| "Push só com 'autorizo push', para branch nova, nunca `casillas-2.0`" | CAS-UI-D11 (texto original) e `REGRAS-DE-TRABALHO.md` | CAS-UI-D21 e `AGENTS.md` §14 | Autorizações |
| Papéis "GPT executa, Claude audita" | `docs/POLITICA.md` §2 | CAS-UI-D11 | Trilha de interface |
| "Nenhum conteúdo técnico foi corrigido ou inventado"; `linhas_explicadas` vazio | `docs/EV3-CONSULTOR-GUIA.md` | CAS-UI-D2 e D4 | Descreve o estado do EV3; conteúdo novo do Guia segue D2 e D4 |
| "Nenhum código do app 2.1 até a aprovação das telas" | `00-ESTADO-ATUAL.md` (versão anterior) | Estado atual neste repositório | Histórico |
| `REGRAS-DE-TRABALHO.md` | esta pasta | `AGENTS.md` e `CLAUDE.md` | Documento histórico |

Nenhuma regra antiga de interface bloqueia uma nova proposta visual aprovada, desde que os requisitos de segurança e o núcleo protegido (`AGENTS.md` §16) sejam preservados.

## 4. Linha `casillas-2.2` (pendente de integração)

Os documentos e decisões D01 a D16 da `casillas-2.2` continuam na branch, preservados. Não foi decidido que seus procedimentos (Mission Supervisor, Coordenação, gate visual) sejam obrigatórios na CAS-UI, nem que tenham sido substituídos. Conflitos identificados, a resolver na integração:

| Tema | Linha 2.2 | CAS-UI |
|---|---|---|
| Desenvolvimento só em `casillas-2.2` | `AGENTS.md` da 2.2 | CAS-UI-D16 (produção em `casillas-2.0`, branches específicas) |
| Biblioteca como aba só com coleção V1 | 2.2-D13, `NAVIGATION-CONTRACT` | CAS-UI-D15 (Biblioteca Técnica é funcionalidade distinta) |
| Paleta e `--touch-min` de 44 px | `DESIGN-SYSTEM-CONTRACT` | CAS-UI-D17 |
| Gate de aprovação visual | `VISUAL-APPROVAL-GATE.md` | Estado "fidelidade validada" em `CHECKLIST-TELAS.md` |

## 5. Pendentes

Veja a seção 5 de `00-ESTADO-ATUAL.md` (renovação e versão da licença, dados do G76, Biblioteca Técnica, tokens, logo e ícones, revisões do Product Owner, integração com a linha 2.2).

## 6. Restrições técnicas que valem para toda a CAS-UI

- Runtime sem `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`; `// @ts-check` obrigatório nas pastas cobertas (`tests/ev3/static.test.mjs`).
- Arquivo novo de runtime entra em `CACHE_ASSETS`, com versão nova do service worker e teste atualizado (`service-worker.js`).
- Só vai ao ar o que está em `index.html`, `auth.html`, `offline.html`, `manifest.json`, `service-worker.js`, `css`, `js`, `dados`, `icons`, `manuais` (`production-gate.mjs`).
- Mudanças em `js/app.js`, service worker, migrations e arquitetura comercial exigem a tarefa correspondente autorizada (`AGENTS.md` §9 e §16).
