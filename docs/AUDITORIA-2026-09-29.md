# Auditoria Técnica — Casillas App 2.0

**Data:** 29 de setembro de 2026
**Branch:** casillas-2.0
**Escopo:** Auditoria completa de código, banco, segurança e infra

---

## 1. Resumo Executivo

O Casillas App 2.0 é um PWA de calculadora técnica de usinagem
com 12 módulos, arquitetura modular client-side, backend em
Supabase (Auth + RLS + RPC) e deploy via GitHub Pages.

### Nota Geral: 9.0/10

| Dimensão | Nota |
|----------|------|
| Modelagem de dados | 9.5/10 |
| Segurança (RLS/grants) | 9.5/10 |
| Funções SQL | 9/10 |
| JavaScript crítico | 7.5/10 |
| PWA / Service Worker | 7.5/10 |
| CI / Deploy | 8.5/10 |
| Configuração Supabase | 8/10 |
| Documentação | 10/10 |

### Pontos Fortes

- Arquitetura modular clara (js/modules, js/calc, js/data)
- Server-side entitlement com RLS + SECURITY DEFINER
- Licenças armazenadas como hash (sha256)
- Documentação de nível sênior
- CI saudável — 100% deploys verdes
- PWA funcional com Service Worker híbrido

### Pontos a Melhorar

- P0.1 (corrigido): Site URL apontava para localhost:3000
- P0.2 (corrigido): resetPassword gerava URL sem path
- P1.1 (pendente): Reset de senha incompleto
- P1.2 (pendente): GitHub Pages publica repo inteiro
- Outros P1/P2 nas seções 4 e 5

---

## 2. Mapa do Sistema

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML/CSS/JS nativo |
| Hospedagem | GitHub Pages |
| CI/CD | GitHub Actions |
| Backend | Supabase (Auth + Postgres) |
| PWA | Service Worker + IndexedDB |

### Fluxo comercial

Login (Supabase Auth)
    ↓
get_casillas_entitlement() ← RPC
    ↓
[entitlement válido?] -- NÃO --> start_casillas_trial()
    |                                    ↓
    |                            Trial 30 dias
    ↓ SIM
Acesso total
    ↓
[Usuário ativa licença] ← activate_casillas_license()
    ↓
Entitlement vitalício

### Banco de dados

**7 tabelas** em `public`:
products, profiles, trials, licenses,
entitlements, access_events, admin_roles

**Funções RPC:**
- get_casillas_entitlement (público + privado)
- start_casillas_trial (público + privado)
- activate_casillas_license (público + privado)

**5 triggers** de updated_at + 1 em auth.users
**4 policies RLS** — todas corretas

---

## 3. Achados P0 — Bloqueadores (RESOLVIDOS)

### ✅ P0.1 — Site URL apontava para localhost

**Descrição:** O campo Site URL no dashboard do Supabase estava
como `http://localhost:3000` (valor padrão nunca alterado).

**Impacto:**
- Reset de senha quebrado
- Confirmação de email quebrada
- Redirect URLs vazias

**Correção (29/09/2026):**
- Site URL → `https://martinsdesiqueiraigor-art.github.io/Casillas_app_2`
- Redirect URLs → `.../Casillas_app_2/**`

**Status:** ✅ Resolvido no dashboard.


### ✅ P0.2 — resetPassword gerava URL sem path

**Descrição:** `resetPassword` em `js/auth.js` usava
`window.location.origin`, que retorna apenas protocolo + domínio.
Em produção (subpath), a URL final ficava sem `/Casillas_app_2/`.

**Antes:**
    redirectTo: `${window.location.origin}/auth.html`

**Depois:**
    redirectTo: new URL('auth.html', window.location.href).href

**Correção (29/09/2026):**
- Commit `3deddfe` em `casillas-2.0`
- Deploy automático (Actions #6, verde em 17s)

**Status:** ✅ Corrigido e em produção.

---

## 4. Achados P1 — Alta Prioridade (Pendentes)

### 🔴 P1.1 — Reset de senha incompleto

**Descrição:** Após P0.2, o link do email redireciona
corretamente para `/Casillas_app_2/auth.html#access_token=...
&type=recovery`. Porém, o `auth.html` não processa o token —
mostra a tela de login normal.

**Impacto:** Usuário não consegue completar o reset.

**Correção sugerida:**
1. Detectar `type=recovery` na URL ou evento `PASSWORD_RECOVERY`
2. Ocultar tela de login
3. Mostrar tela de "Definir nova senha"
4. Chamar `supabase.auth.updateUser({ password })`

**Esforço:** 30-60 min.

### 🔴 P1.2 — GitHub Pages publica todo o repositório

**Descrição:** O workflow `.github/workflows/static.yml`
faz upload do diretório inteiro (`path: '.'`), publicando
TODO o repositório.

**Impacto confirmado empiricamente:**
- `supabase/migrations/*.sql` — schema público
- `.gitignore` — exposto
- `docs/SEGURANCA.md` — exposto
- `package.json` — exposto

**Correção sugerida:** criar diretório `_site/` com apenas
arquivos públicos, ou usar build step.

**Esforço:** 15-30 min.

### 🟠 P1.3 — Service Worker cacheia respostas autenticadas

**Descrição:** O SW faz cache de respostas HTML de navegação,
incluindo páginas autenticadas.

**Impacto:** Em dispositivo compartilhado, pode vazar estado
residual entre usuários.

**Correção sugerida:** limpar cache no logout, ou não cachear
HTML autenticado.

### 🟠 P1.4 — start_casillas_trial não loga TRIAL_STARTED

**Descrição:** A tabela `access_events` tem o tipo
`TRIAL_STARTED` definido, mas a função `start_casillas_trial`
não insere nela.

**Impacto:** Perda de trilha de auditoria.

**Correção:** adicionar INSERT em `access_events`.

### 🟠 P1.5 — start_casillas_trial não valida entitlement existente

**Descrição:** Um usuário com licença ativa pode chamar
`start_casillas_trial` e criar trial paralelo.

**Impacto:**
- Comportamento inconsistente
- Se a licença for revogada, ainda tem trial ativo

**Correção:** validar entitlement antes do INSERT.

### 🟠 P1.6 — gerar-codigo.html exposto publicamente

**Descrição:** Ferramenta administrativa/legada está no repo
e sendo publicada pelo GitHub Pages.

**Impacto:**
- Superfície de ataque desnecessária
- UX confusa se descoberta

**Correção:** remover do deploy + remover do CACHE_ASSETS.


### 🟠 P1.7 — getSupabaseTrial cria trial silenciosamente

**Descrição:** A função `getSupabaseTrial` chama
`start_casillas_trial` (que CRIA trial), não apenas consulta.
Isso significa que qualquer usuário novo que abre o app pela
primeira vez cria trial automaticamente.

**Impacto:**
- UX questionável
- Sem log de TRIAL_STARTED

**Correção:** separar `getTrialStatus` (leitura) de
`startTrial` (mutação).

### 🟠 P1.8 — signOut usa escopo local sem documentação

**Descrição:** `supabase.auth.signOut({ scope: 'local' })`
desloga apenas o device atual.

**Impacto:**
- Decisão válida de UX
- Sem documentação do motivo
- Sem opção "logout de todos os devices"

**Correção:** documentar ou oferecer opção global.

---

## 5. Achados P2 — Média Prioridade

| ID | Item | Categoria |
|----|------|-----------|
| P2.1 | Falta TRIAL_EXPIRED em access_events | Backend |
| P2.2 | Sem rate limit em activate_casillas_license | Backend |
| P2.3 | Falta índice parcial em licenses | Backend |
| P2.4 | KEYS morto em trial.js | Frontend |
| P2.5 | Bug de corte no formato de código | Frontend |
| P2.6 | Falta redirect em sessão expirada | Frontend |
| P2.7 | Import dinâmico repetido de utils.js | Frontend |
| P2.8 | PUBLISHABLE_KEY com nome confuso | Frontend |
| P2.9 | CACHE_VERSION hardcoded no SW | PWA |
| P2.10 | Sem timeout de fetch no SW | PWA |
| P2.11 | Sem headers de segurança no SW | PWA |
| P2.12 | Captcha não habilitado no Supabase | Config |
| P2.13 | project_id cosmético | Config |
| P2.14 | OAuth não habilitado | Config |
| P2.15 | Falta .nojekyll na raiz | Deploy |
| P2.16 | Actions em tags (não SHAs) | CI |

---

## 6. O Que Foi Corrigido Nesta Sessão

### ✅ Schema drift — get_casillas_entitlement

A função existia apenas em produção (criada via dashboard).
Correção: migration retroativa em
`supabase/migrations/20260929042401_add_get_casillas_entitlement.sql`.

**Commits:** 13ad739 → 221a189.

### ✅ Bug UX — Card 5 (Ativação → WhatsApp)

O botão "Ativação" abria WhatsApp em vez de mostrar tela de
input de código.

**Correção:** card reescrito, botão "Ativar com código" abre
`#activation-screen`.

**Commits:** 221a189.

### ✅ P0.1 — site_url no Dashboard

Alterado de `http://localhost:3000` para
`https://martinsdesiqueiraigor-art.github.io/Casillas_app_2`.
Redirect URL adicionado.

### ✅ P0.2 — resetPassword em js/auth.js

Corrigido para usar `new URL('auth.html', window.location.href)`.
**Commit:** 3deddfe.

---

## 7. Roadmap de 90 Dias

### Sprint 1 (próximas 2 semanas) — Fechar P1

- [ ] P1.1 — Tela de "definir nova senha" no auth.html
- [ ] P1.2 — Corrigir workflow para publicar só o público
- [ ] P1.6 — Remover gerar-codigo.html do deploy
- [ ] P1.4 — Adicionar TRIAL_STARTED em access_events
- [ ] P1.5 — Validar entitlement antes de criar trial

### Sprint 2 (4-6 semanas) — Qualidade

- [ ] P2.2 — Rate limiting em activate_casillas_license
- [ ] P2.4 — Limpar código morto (KEYS em trial.js)
- [ ] P2.5 — Corrigir bug de corte no input de código
- [ ] P2.12 — Habilitar captcha no Supabase Auth
- [ ] P2.15 — Adicionar .nojekyll
- [ ] Testes unitários em js/calc/ (Vitest)

### Sprint 3 (8-12 semanas) — Escala

- [ ] P2.14 — Login com Google
- [ ] Landing pública com SEO
- [ ] i18n (PT/EN/ES)
- [ ] Admin panel
- [ ] Sentry + analytics

---

## 8. Anexos

### Anexo A — SQL para P1.4 e P1.5

A ser criado em `docs/AUDITORIA-ANEXO-A.sql` na próxima sessão.

### Anexo B — Correção do workflow static.yml

A ser criado em `docs/AUDITORIA-ANEXO-B.md` na próxima sessão.

### Anexo C — Script audit-check.sh

A ser criado em `scripts/audit-check.sh` na próxima sessão.

---

## 9. Referências

- OWASP Top 10 (2021)
- Supabase RLS Best Practices
- LGPD (Lei 13.709/2018)
- GitHub Pages Security Hardening
- MDN — Service Worker API

---

**Fim do relatório.**

*Este documento é um retrato do estado do projeto em 29/09/2026.
Novos achados devem ser adicionados como seções separadas ou em
novas auditorias datadas.*
