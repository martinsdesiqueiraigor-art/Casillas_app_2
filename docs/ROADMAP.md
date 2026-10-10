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

- Casillas 2.1: redesenho da interface em fatias. Etapas 2.1 a 2.8 prontas na `casillas-2.1-fatia-2`; faltam Configurações (idioma após revisão do inglês), Guia 2.0, Consultor com busca livre e renovação de licença. Detalhes em `STATUS.md`.
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
