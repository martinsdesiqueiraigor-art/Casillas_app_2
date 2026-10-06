# Decisões arquiteturais vigentes

Este documento resume decisões presentes no código e nos registros atuais. Marcos históricos permanecem preservados em seus arquivos.

## Autoridade comercial

Supabase Auth identifica a conta. RPCs no Supabase avaliam entitlement, trial e ativação; o frontend apresenta o resultado e controla a navegação, sem decidir autoridade comercial por conta própria.

## Trial e licença

Entitlement válido tem precedência; na ausência dele, o cliente consulta/inicia trial controlado pelo servidor. Trial configurado para 30 dias. Licença é associada à conta autenticada e sem limite de aparelhos. Ativação chama `activate_casillas_license` e requer nova consulta de entitlement antes do acesso.

## Offline e cálculos

Os cálculos ficam no cliente e são independentes de servidor. O cache PWA melhora disponibilidade de recursos; Auth e verificação comercial dependem do Supabase. O modo offline não promete acesso comercial nem sessão autenticada funcional sem teste.

## Armazenamento local

IndexedDB mantém estado local do app, não trial/licença. As chaves declaradas em `KEYS` no `js/trial.js` não têm uso encontrado e não afetam autorização.

## G3.4 — Destino de gerar-codigo.html

A ferramenta legada `gerar-codigo.html` foi removida do repositório e do artefato público.

Motivos:
- não participava do fluxo comercial atual;
- gerava códigos e hashes apenas localmente;
- continha instruções obsoletas de 3 aparelhos e listas locais em `trial.js`;
- era publicada pelo GitHub Pages porque o workflow utiliza `path: '.'`;
- permanecia no pré-cache do Service Worker.

A arquitetura comercial atual continua baseada em Supabase Auth, trial, entitlement e `activate_casillas_license`, sem autorização local.


## Banco como código

Definições comerciais devem ser reproduzíveis por migrations versionadas. A migration de 29/09/2026 versiona `get_casillas_entitlement`; isso supera a pendência relatada antes do commit `13ad739`. A presença local não certifica sincronização com ambiente remoto.

## Schema drift do wrapper público de ativação

A investigação remota mais recente confirmou `public.activate_casillas_license(text)` como wrapper `SECURITY INVOKER`, `VOLATILE`, com execução permitida a `authenticated` e `service_role`, não a `anon` nem a `PUBLIC`. A implementação `private.activate_casillas_license(text)` está versionada em `20260928160324_fix_activate_casillas_license_entitlement_check.sql`; o wrapper público foi versionado em `20260930213346_add_public_activate_casillas_license_wrapper.sql`. A migration local representa o wrapper sem duplicar a implementação privada.

## Referências

- [Arquitetura](ARQUITETURA.md)
- [Banco de dados](BANCO-DADOS.md)
- [Segurança](SEGURANCA.md)
- [Roadmap](ROADMAP.md)

## 03/10/2026 — Decisões comerciais (G5)

### 1. Geração e entrega de código de licença

Camada 1 — operação manual/local (implementada em G5):
- `tools/gerar-codigo.mjs` gera localmente código aleatório e SHA-256 compatível com a ativação
- `docs/OPERACAO-COMERCIAL.md` documenta o procedimento operacional
- O script não contém credencial administrativa e não escreve automaticamente no Supabase
- O modo `--sql` apenas prepara o INSERT para revisão e execução administrativa manual
- Executar apenas no PC do Igor e entregar o código ao cliente via WhatsApp

Evolução futura (não escopo de G5):
- Camada 2: Edge Function `generate-license`
- Camada 3: automação via gateway de pagamento

Validação da Camada 1:
- geração, normalização, SHA-256 e SQL foram validados localmente;
- E2E remoto com licença descartável não foi executado por decisão explícita no fechamento de G5;
- essa ausência de teste não deve ser registrada como validação remota concluída.

### 2. Preço

- R$ 19,90 — preço real de lançamento (promocional)
- R$ 49,90 — preço cheio (âncora de marketing; referência futura)
- Sem prazo explícito para a promoção
- Sem contagem regressiva, "só hoje" ou falsa urgência
- Revisão a cada trimestre

### 3. Logout visível

- Implementado em G5.4.2 reutilizando o `signOut()` existente.
- CTA visível validado manualmente: encerra a sessão e retorna ao fluxo de autenticação.

### 4. Padronização terminológica

- "Trial" → "Período de teste" (apenas em UI visível ao usuário)
- "3 aparelhos" → remover todas as referências
- Código interno, chaves e nomes de função: não alterar em G5

## 04/10/2026 — Sprint 6C: decisões de refinamento

- O Guia de Programação CNC desta etapa fica oficialmente restrito a FANUC e Siemens; novos comandos ficam para evolução futura com validação técnica própria.
- O refinamento prioriza evolução incremental da interface existente, sem reconstrução visual ampla.
- Acessibilidade inclui operação por teclado, estados ARIA, foco previsível e zoom do navegador permitido.
- Em telas de até 420 px, controles críticos recebem área de toque ampliada; em telas extremamente estreitas, informações secundárias podem ser ocultadas para preservar os controles principais.
- Compartilhamento não deve ser classificado como validado a partir do servidor HTTP em rede local; a validação funcional fica pendente para contexto HTTPS/seguro.
- Sprint 6C não altera arquitetura comercial, regras de trial/licença, Supabase remoto ou Service Worker.

## 05/10/2026 — BL-02: pré-requisito de RLS automático

A Coordenação 2.1 aprovou a Opção A somente para implementação e validação local: incluir public.rls_auto_enable() e ensure_rls no schema reconstruível, sem editar a migration existente de hardening.

A nova migration 20261001023218_reconcile_rls_auto_enable_prerequisite.sql precede 20261001023219 por dependência lógica. Seu timestamp NÃO comprova a data original de instalação. Os objetos já existiam no remoto no snapshot G3.1; autoria, data e canal da instalação original não foram comprovados no histórico versionado.

Fonte da função: C:\Backups\Casillas\2026-10-01-g3-rls\01-rls_auto_enable-def.sql, SHA-256 verificado 11C789A01A2BF5A975F4795EB919A71B6C0ABFC47FF5C9EAE17013AFC32438DF. O trigger foi reconstruído de 03-ensure_rls-trigger.txt e 05-dependencias.txt; seu comando original de criação não foi encontrado. OIDs históricos não são transportáveis.

O corpo foi preservado: erros ao habilitar RLS são registrados por RAISE LOG, sem repropagação. Não foi adotado o RAISE do exemplo atual do Supabase. CREATE FUNCTION e CREATE EVENT TRIGGER, sem substituição ou remoção, falham diante de objetos existentes. A execução local como postgres reproduz os owners observados; aplicação remota exige plano separado.

BL-02 é CANDIDATO A FECHADO após reset local completo e verificação do mecanismo. BL-01 permanece aberto. Sem escrita remota, commit ou push; baseline integral não aprovada.

## 05/10/2026 — Gate de Produção aprovado: Alternativa B

A Coordenação aprovou PUSH ≠ DEPLOY: CI separada, integração controlada em casillas-2.0 e publicação somente por workflow_dispatch com identificação do SHA e confirmação de Igor no environment. A implementação deste checkpoint é LOCAL e ainda não commitada/publicada.

ci.yml é reutilizado por static.yml via workflow_call: preflight → validation → build → deploy. Assim, falha de validação impede construir/publicar o artefato; somente deploy tem Pages/OIDC. Checkout e artefato vinculam-se ao SHA explícito, que deve ser o HEAD da branch de release; há nova conferência após a aprovação. Evidências manuais de aprovação/smoke são obrigatórias e seu conteúdo precisa ser revisado pelo owner.

Configurações GitHub efetivamente aplicadas: environment github-pages com Igor como required reviewer, self-review permitido e branch policy casillas-2.0 preservada; branch com PR, check Casillas baseline do app GitHub Actions, strict checks, enforce_admins e bloqueio de force push/deletion. Aprovações independentes de PR não são impostas ao projeto solo.

Pendência explícita: bypass administrativo do environment continua permitido, pois o parâmetro não é exposto pelo PUT REST documentado; requer configuração pela interface. Não foi enviado parâmetro não documentado. Ainda faltam publicação controlada dos workflows e T1–T6 em Actions. EV2-08 não é declarado fechado neste checkpoint. Aplicativo, Service Worker, migrations e Supabase remoto não foram alterados.

## 05/10/2026 — Decisão posterior: preparar integração com Pages suspenso

O candidato foi publicado em e38eed7 e corrigido em 582716c. Casillas CI run #2 (37385454509) passou: frontend 12/12, gate 8/8, pgTAP 28/28 e cleanup. Nenhum deployment ocorreu na hardening. As entradas anteriores registram os respectivos checkpoints históricos.

A Coordenação escolheu desabilitar temporariamente somente Pages, criar PR controlado e validar CI. Merge, comprovação pós-integração, reabilitação do workflow já manual e homologação da release serão missões separadas. Não basta habilitar o workflow enquanto a release ainda contém o YAML antigo com push.

Pages ID 369795219 está disabled_manually, confirmado em 2026-10-05T23:23:09Z; CI ID 375870461 continua active. Release permanece em f7fd1e2 e EV2-08 aberto. A suspensão é reversível por /enable no mesmo workflow, sem exclusão de arquivo, mas não será revertida nesta preparação.

can_admins_bypass=true e B-03/B-04/B-05 permanecem pendentes; a Coordenação decidirá seu tratamento antes da homologação integral. Self-review continua confirmação operacional, não revisão técnica independente.

## 06/10/2026 - EV2-03/04: contrato aplicado somente no candidato local

A Coordenação autorizou implementação local de vigência `[valid_from, valid_until)` e revogação atômica da licença com seus entitlements diretamente dependentes. Sem autorização de commit, push, aplicação remota ou release.

O modelo existente foi reutilizado: source LICENSE + license_id identifica dependência; GRANT/PROMOTION/ADMIN permanecem independentes. Licenses não possui colunas valid_from/valid_until; a vigência do direito originado da licença está no entitlement, além do estado da licença. NULL valid_until significa fim ilimitado, nunca início antecipado.

Revogação é enforced por trigger no banco, sem nova RPC pública: atualiza dependentes e registra auditoria na mesma transação. Escritas posteriores não podem reativar dependente de licença revogada. A migration também reconcilia dependências antigas já incoerentes, se existirem no banco ao qual vier a ser aplicada.

O índice único ACTIVE foi preservado. Entitlement futuro/expirado não concede acesso; se ainda reservar esse índice, a ativação é rejeitada explicitamente ANTES de consumir o código, preservando o entitlement. Não se revogam grants nem se inventa política de coexistência para liberar a ativação.

Revogação não cria novo trial. Trial anterior independente não é apagado, estendido ou reiniciado; mantém as regras existentes. Frontend, rate limit, revalidação de sessão/offline e Production Gate não foram alterados.

Implementação e evidências locais estão em BANCO-DADOS.md/PROGRESSO.md. Fechamento formal e qualquer publicação dependem da revisão da Coordenação.

## 06/10/2026 - Decisões finais D1-D3 aplicadas no diff local

A Coordenação definiu REVOKED como estado terminal da licença, com revoked_at imutável. Nenhuma reativação administrativa ou RPC de unrevoke foi criada. Novo acesso futuro exige nova licença ou entitlement independente autorizado.

Revogação bloqueia trial como fallback, inclusive trial preexistente válido. O registro antigo é preservado, mas o RPC normal não o devolve como acesso após licença revogada da mesma conta/produto. Getter comercial continua aceitando direitos independentes válidos e nova licença. Esta decisão substitui a interpretação anterior de preservação do trial com acesso independente.

A origem LICENSE equivale à presença de license_id; outras origens devem ter vínculo NULL. Migration aborta diante de combinações legadas inconsistentes, sem escolher intenção. FK e lista de origens existentes preservadas.

Alterada somente a migration EV2 ainda local/não commitada, seus testes e documentação. Nenhuma aplicação Supabase remota, commit, push ou release.
