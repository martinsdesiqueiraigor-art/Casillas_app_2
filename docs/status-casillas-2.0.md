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
# Status do Casillas 2.0

## Snapshot de publicação registrado

O registro de 29/09/2026 documentou o workflow GitHub Pages `.github/workflows/static.yml`, publicação no endereço abaixo e reconhecimento do manifest e Service Worker no Chrome:

<https://martinsdesiqueiraigor-art.github.io/Casillas_app_2/>

O teste relatou Service Worker ativo (versão observada `#32` naquele momento), manifest com `standalone`, ícones 192/512 e carregamento offline até login. Isso é evidência histórica e não foi repetida nesta revisão. Não confundir versão observada pelo navegador com a constante local `casillas-v10`.

## Estado do código local em 29/09/2026

- Branch `casillas-2.0`, HEAD `629ebe3` no início desta atualização.
- Manifest: `start_url: ./index.html`, `scope: ./`, `display: standalone`, orientação `portrait`; ícones em `icons/icon-192.png` e `icons/icon-512.png`.
- `service-worker.js` registra `casillas-v10`, pré-cacheia arquivos estáticos e módulos, estratégia network-first para navegação com fallback `offline.html`, cache-first para outros GETs same-origin.
- `js/app.js` registra o Service Worker e implementa botão de instalação quando o navegador emite `beforeinstallprompt`.
- O app consulta Auth/RPCs comerciais online. O teste completo de sessão autenticada e cálculos offline segue pendente.
- Workflow Pages presente: `.github/workflows/static.yml`. A existência local não comprova execução ou configuração remota atual.

## Próximas verificações

Validar em navegador/origem publicada a instalação, escopo sob `/Casillas_app_2/`, atualização e limpeza de cache antigo, navegação offline, e comportamento após autenticação online. Registrar separadamente o que funciona para recursos/cálculos e o que depende de Auth/entitlement online.

Nenhuma validação de navegador, publicação ou serviço remoto foi realizada nesta atualização documental.

## Atualização do estado comercial remoto

A investigação Supabase mais recente confirmou o fluxo comercial funcional no ambiente remoto. As funções privadas/públicas de entitlement e a implementação privada da ativação estão versionadas localmente. `public.activate_casillas_license(text)` também existe no Supabase remoto, mas não está representada nas migrations atuais nem foi encontrada no histórico pesquisável deste repositório; o estado é schema drift conhecido. Isso não significa que a função esteja quebrada ou que exista bypass. Nenhuma migration corretiva será criada nesta etapa. A próxima etapa de desenvolvimento está prevista para `casillas-2.0-hardening`; a branch atual não foi alterada.
