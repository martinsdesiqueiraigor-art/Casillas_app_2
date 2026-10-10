# Decisões do Casillas 2.1

Estado: rascunho. Coluna "Decisão" só é preenchida pelo Igor.

## 1. Já decididas (vigentes no repositório)

| Tema | Decisão | Fonte |
|---|---|---|
| Autoridade comercial | Servidor decide trial, licença e entitlement. O frontend apresenta | `AGENTS.md` §3 e §5 |
| Licença | Por conta, vitalícia, sem limite de aparelhos | `docs/DECISOES.md` |
| Licença, renovação | Decidido em 2026-10-10 pelo usuário: recursos novos de versões futuras exigem renovação. Quem não renova continua usando tudo que já tinha, sem bloqueio. A definir: como o app sabe a versão da licença (Supabase, sem migration sem revisão) e valor e prazo da renovação. Nenhum valor de renovação aparece nas telas | Usuário, 2026-10-10 |
| Período de teste | 30 dias; texto visível "Período de teste" (não "Trial") | `docs/DECISOES.md` (G5) |
| Preço | R$ 19,90 lançamento, R$ 49,90 preço cheio, sem falsa urgência nem contagem regressiva | `docs/DECISOES.md` (G5) |
| Pagamento | PIX manual, dados só em conversa privada, nada no app ou no Git | `docs/PRIMEIRA-VENDA.md` |
| Escopo do Guia CNC | Só FANUC e Siemens | `docs/DECISOES.md` (Sprint 6C) |
| Offline | Cálculos locais; acesso offline só com lease válido de até 7 dias | `docs/DECISOES.md` (EV2-02) |
| Telemetria do Consultor | Sem texto bruto da pergunta | `docs/EV3-CONSULTOR-GUIA.md` |
| Publicação | Só por workflow manual, com SHA e confirmação do Igor | `docs/DECISOES.md` (Gate de produção) |
| Git | Sem commit, push ou deploy sem autorização | `AGENTS.md` §2 e §11 |

## 2. Em aberto (travam o 2.1)

| # | Pergunta | Proposta de Claude | Decisão |
|---|---|---|---|
| D1 | O 2.1 pode redesenhar a interface? A regra "incremental, sem reconstrução ampla" era da Sprint 6C | Sim, em fatias, em branch própria, cada fatia com regressão | A definir |
| D2 | Como entra conteúdo técnico novo no Guia (variantes, passos, cuidados, trajetória)? | Campo `revisao` (`rascunho` ou `revisado`) e selo visível. Só vira `revisado` com conferência do Igor ou de técnico indicado por ele | A definir |
| D3 | Quem revisa o conteúdo técnico? | Igor, ou técnico indicado por ele | A definir |
| D4 | Pode estender o schema do banco do Guia (novas operações, `variantes`, `revisao`, `trajetoria`)? | Sim, com `schema_version`, atualizando `adapter.js`, `types.d.ts` e testes | A definir |
| D5 | O Consultor ganha busca por texto livre? | Sim, como segunda opção quando os slots não resolvem, mantendo a FSM, a telemetria e "sem serviço externo" | A definir |
| D6 | Navegação: barra inferior sobre o menu lateral atual? | Sim, como camada sobre `loadModule`. O menu lateral continua | Interface aprovada com barra inferior de 4 itens (Início, Calculadoras, Guia CNC, Biblioteca) em 2026-10-10. Falta confirmar a integração com `loadModule` |
| D7 | Biblioteca entra no 2.1? | Só depois de especificar direitos dos PDFs, acesso e armazenamento (trilha EV4) | A definir. A tela de Biblioteca aprovada em 2026-10-10 só tem Contato, Serviços, Cursos e Licença, sem PDFs |
| D8 | Idiomas PT/EN (seletor aprovado em Configurações em 2026-10-10; revisão do inglês segue em aberto) | Dicionário em `js/i18n/`, PT padrão, EN só após revisão. Quem revisa o inglês: A definir | A definir |
| D9 | O Consultor é cartão na Início ou aba própria? | A definir | Interface aprovada com cartão na Início e tela de resultado própria (2026-10-10). Confirmar |
| D10 | O que fica livre depois dos 30 dias, se algo? O Guia é pago ou livre? | Decidido em 2026-10-10 pelo usuário: após o fim do teste, nada fica disponível até ativar. Falta decidir só se o Guia é pago ou livre durante a licença | Decidido (parte) |
| D11 | Papéis em `docs/POLITICA.md`: Claude executa a trilha de interface? Ferramentas obrigatórias "quando disponíveis"? | Sim, sob os mesmos gates | A definir |
| D12 | Qual documento de estado vale: `STATUS.md` (04/10) ou `DECISOES.md` (05 a 06/10)? Pages está ativo ou suspenso? | Não decido. Atualizar `STATUS`, `ARQUITETURA` e `ROADMAP` antes de qualquer release | A definir |
| D13 | Limpeza de arquivos e documentos históricos | Ver `inventario-arquivos-casillas.md` | A definir |
| D14 | Como a pessoa cria a conta na versão de teste? | Decidido em 2026-10-10: cadastro com e-mail e senha desde o teste, com mensagem de confirmação no e-mail. Conferido na v2 em 2026-10-10: isso já existe (`auth.html`, `js/auth-page.js`: abas Entrar e Criar conta, `signUp`, mensagem "Conta criada. Verifique seu e-mail para confirmar o cadastro.", recuperação de senha por e-mail com nova senha e confirmação). A interface 2.1 só redesenha esses fluxos, sem mudar a função. Quando o teste de fato começa não foi conferido | Decidido |

## 3. Restrições técnicas que valem para toda a fatia

- Runtime sem `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`; `// @ts-check` obrigatório (`tests/ev3/static.test.mjs`).
- Arquivo novo de runtime entra em `CACHE_ASSETS`, com versão nova do SW e teste atualizado (`service-worker.js`).
- Só vai ao ar o que está em `index.html`, `auth.html`, `offline.html`, `manifest.json`, `service-worker.js`, `css`, `js`, `dados`, `icons`, `manuais` (`production-gate.mjs`).
- Mudanças em `js/app.js`, SW, migrations e arquitetura comercial são coordenadas centralmente (`AGENTS.md` §9).
