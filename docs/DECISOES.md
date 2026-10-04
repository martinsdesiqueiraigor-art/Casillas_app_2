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
