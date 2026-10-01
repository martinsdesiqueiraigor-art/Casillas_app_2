# Roadmap

Estado do código local na branch `casillas-2.0`, referência `629ebe3` em 29/09/2026. Itens baseados apenas em histórico ou inspeção local estão identificados; não se inferiu estado remoto atual.

## Concluído no código/histórico disponível

- Supabase Auth integrado ao acesso à aplicação.
- Consulta de entitlement antes de consulta/início de trial remoto de 30 dias.
- Ativação de licença por RPC, seguida de nova consulta de entitlement.
- Licença associada à conta, vitalícia segundo o entitlement criado pela migration e sem limite de aparelhos.
- Home com os 12 módulos e ativação self-service por Card 5; correção do redirect de redefinição de senha para `auth.html` relativo ao subpath.
- Definição `get_casillas_entitlement()` versionada na migration `20260929042401_add_get_casillas_entitlement.sql`.
- PWA estática com manifest, cache Service Worker `casillas-v10` e workflow GitHub Pages `static.yml`; histórico registra deploy e teste inicial.

## Em andamento / parcialmente validado

- Validação integrada de Auth, trial, entitlement e ativação em ambiente controlado.
- Validação de sessão autenticada e uso das calculadoras offline, além da tela de login observada historicamente.
- Revalidação da implantação remota, RLS/grants e definições de RPC após as migrations locais.

## Próximos

1. Executar testes funcionais com contas e dados de teste autorizados, sem usar produção indevidamente.
2. Executar testes RLS/grants e RPC em ambiente controlado e registrar versão/ambiente/evidências.
3. Completar o teste offline após autenticação online: restauração de sessão, navegação e cálculos, documentando limites comerciais.
4. Validar instalação, update e escopo do Service Worker nos navegadores suportados.
5. Tratar a pendência de rate limiting da ativação identificada na auditoria, em trabalho futuro de implementação e revisão de segurança.

## Futuro

- Decidir em etapa própria o destino de `gerar-codigo.html` e sua entrada no pré-cache; hoje é ferramenta antiga independente.
- Avaliar integração efetiva dos manuais, pagamentos e painel administrativo, cada qual com escopo e evidências próprias.
- Revalidar disponibilidade pública e configuração de hospedagem quando houver mudança de publicação.
- `public.activate_casillas_license(text)` foi versionada na migration `20260930213346_add_public_activate_casillas_license_wrapper.sql`. Permanece separada apenas a pendência histórica de timestamp entre a migration local 60324 e a entrada remota 60738.

Não estão concluídos por constarem deste roadmap. Hardening, mudanças de banco e publicação exigem tarefas próprias.
