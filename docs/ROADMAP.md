## ESTADO ATUAL / OBSERVAÇÃO DE ENCERRAMENTO — 2026-10-06

Casillas 2.1.0 está em PRODUÇÃO HOMOLOGADA: tag v2.1.0, SHA 1b3082e7ca82bb669180402cf419a56e51af374a,
deployment 6888207195, SW casillas-v13, Supabase ACTIVE_HEALTHY com 14 migrations canônicas aplicadas.
EV2, EV3, EV1 e Production Gate fechados. CI existe e passou; package.json existe.
Offline autenticado, instalação PWA e validação física Android/offline real homologados pela Coordenação.

Fontes atuais: [Release 2.1.0](RELEASE-2.1.0.md), [Baseline 2.1](BASELINE-2.1.md) e [Transição 2.2](HANDOFF-2.1-TO-2.2.md).
Este cabeçalho não modifica o registro abaixo nem declara novas execuções de testes ou consultas remotas nesta missão.
Desenvolvimento novo somente em casillas-2.2; não recriar contratos já entregues.

## REGISTRO HISTÓRICO PRESERVADO

O conteúdo abaixo descreve estados, testes e limites das respectivas datas/missões, incluindo pendências já encerradas.
Ele não redefine a versão estável atual nem constitui autorização de produção.

---
# Roadmap

Estado do código local na branch `casillas-2.0`, referência `629ebe3` em 29/09/2026. Itens baseados apenas em histórico ou inspeção local estão identificados; não se inferiu estado remoto atual.

## Concluído no código/histórico disponível

- Supabase Auth integrado ao acesso à aplicação.
- Consulta de entitlement antes de consulta/início de trial remoto de 30 dias.
- Ativação de licença por RPC, seguida de nova consulta de entitlement.
- Licença associada à conta, vitalícia segundo o entitlement criado pela migration e sem limite de aparelhos.
- Home com os 12 módulos e ativação self-service por Card 5; correção do redirect de redefinição de senha para `auth.html` relativo ao subpath.
- Definição `get_casillas_entitlement()` versionada na migration `20260929042401_add_get_casillas_entitlement.sql`.
- PWA estática com manifest, Service Worker `casillas-v12` e workflow GitHub Pages `static.yml`; instalação, atualização e offline autenticado foram validados no G4.

## Em andamento / parcialmente validado

- Fluxo crítico de Auth, trial, entitlement e ativação já possui validação integrada registrada; cenários complementares permanecem em `TESTES.md`.
- Sessão autenticada e cálculos offline foram validados em G4.2.2b; ampliar cobertura de navegadores permanece trabalho complementar.
- Revalidação da implantação remota, RLS/grants e definições de RPC após as migrations locais.

## Próximos

1. Executar testes funcionais com contas e dados de teste autorizados, sem usar produção indevidamente.
2. Executar testes RLS/grants e RPC em ambiente controlado e registrar versão/ambiente/evidências.
3. Manter regressão do offline autenticado validado em G4.2.2b e ampliar a matriz de navegadores quando necessário.
4. Manter regressão de instalação/update do Service Worker validada no G4 e ampliar navegadores suportados quando necessário.
5. Tratar a pendência de rate limiting da ativação identificada na auditoria, em trabalho futuro de implementação e revisão de segurança.

## Futuro

- `gerar-codigo.html` foi removido em G3.4; preservar apenas `tools/gerar-codigo.mjs` como ferramenta operacional local, fora do PWA publicado.
- Avaliar integração efetiva dos manuais, pagamentos e painel administrativo, cada qual com escopo e evidências próprias.
- Revalidar disponibilidade pública e configuração de hospedagem quando houver mudança de publicação.
- `public.activate_casillas_license(text)` foi versionada na migration `20260930213346_add_public_activate_casillas_license_wrapper.sql`. Permanece separada apenas a pendência histórica de timestamp entre a migration local 60324 e a entrada remota 60738.

Não estão concluídos por constarem deste roadmap. Hardening, mudanças de banco e publicação exigem tarefas próprias.
