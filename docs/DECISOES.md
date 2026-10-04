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

Camada 1 — operação manual/local (a criar em G5):
- Criar o script local `tools/gerar-codigo.mjs` (não deployado, não público)
- Executar apenas no PC do Igor
- Gerar código, calcular hash e inserir em `licenses` com status AVAILABLE
- Entregar o código ao cliente via WhatsApp

Evolução futura (não escopo de G5):
- Camada 2: Edge Function `generate-license`
- Camada 3: automação via gateway de pagamento

Pendências de G5:
- Criar `tools/gerar-codigo.mjs`
- Criar e documentar o procedimento em `docs/OPERACAO-COMERCIAL.md`

### 2. Preço

- R$ 19,90 — preço real de lançamento (promocional)
- R$ 49,90 — preço cheio (âncora de marketing; referência futura)
- Sem prazo explícito para a promoção
- Sem contagem regressiva, "só hoje" ou falsa urgência
- Revisão a cada trimestre

### 3. Logout visível

- Entra em G5 como feature nova (Lote 2)
- `signOut()` existe no código; falta CTA visível
- Impacto: adicionar botão + mensagem de confirmação

### 4. Padronização terminológica

- "Trial" → "Período de teste" (apenas em UI visível ao usuário)
- "3 aparelhos" → remover todas as referências
- Código interno, chaves e nomes de função: não alterar em G5
