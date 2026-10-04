# Progresso do Casillas 2.0

## 03/10 — Verificação: encoding e integridade de G4.2.1

ENCODING:
- Diff anterior mostrou `�` em PROGRESSO.md
- Investigação com git cat-file nos blobs brutos:
  `í` = C3 AD (UTF-8 correto) em todos os commits
- Nenhum par 3F 3F nos blobs Git
- Conclusão: `�` era exibição do terminal remoto
  (PowerShell), não corrupção real

INTEGRIDADE DA 1ª SEÇÃO G4.2.1:
- Preocupação: itens `AÇÃO PREVENTIVA` e `TESTE-LOCAL.md`
  ausentes na 1ª seção
- Investigação em edea92b (antes da consolidação):
  - AÇÃO PREVENTIVA está em seção própria, preservada
  - TESTE-LOCAL.md nunca esteve em PROGRESSO.md
- Conclusão: nenhuma perda na remoção da duplicata

OBSERVAÇÃO (baixa prioridade):
- Alguns `?` literais aparecem onde provavelmente
  havia `→` (seta). Ex.: `v99 ? v12`. Degradação
  cosmética de edições anteriores. Registrar como
  pendência, não corrigir agora.

## Referência atual

- Branch: `casillas-2.0-hardening`; HEAD atual: `c1a4851` (G4.3b fechado).
- Remote `origin` aponta para `martinsdesiqueiraigor-art/Casillas_app_2`; estado inicial estava limpo.
- Na atualização de 29/09, código e migrations locais foram inspecionados; não foi feita consulta remota ao Supabase ou ao site publicado naquela atualização.

## Marcos recentes

- **28/09 — fluxo comercial e Home:** Auth, trial e entitlement remotos; ativação self-service no Card 5; Home reorganizada. O cliente confirma entitlement depois de ativar.
- **29/09 — migrations:** migration retroativa `20260929042401_add_get_casillas_entitlement.sql` tornou reproduzível a definição de entitlement que antes constava apenas como implantada remotamente. Pendência anterior de versionamento superada no código local.
- **29/09 — recuperação de senha:** commit `3deddfe` ajusta redirect para `auth.html` relativo à localização da aplicação.
- **PWA/Publicação:** histórico documenta GitHub Pages em `https://martinsdesiqueiraigor-art.github.io/Casillas_app_2/`, workflow único `static.yml`, manifest reconhecido, Service Worker ativo e observação de carregamento até login offline. Esses são resultados históricos; não foram revalidados agora.
- **Auditoria:** `docs/AUDITORIA-2026-09-29.md` registra achados e pendências de segurança; preservar como snapshot.
- **Estado comercial remoto informado na investigação recente:** fluxo operacional no ambiente remoto; entitlement e implementação privada de ativação versionados. O wrapper público remoto `public.activate_casillas_license(text)` existe, mas não consta das migrations locais: schema drift conhecido, ainda não corrigido.

## Estado funcional conforme implementação local

- `js/trial.js` consulta entitlement, depois chama trial quando necessário, e ativa licença via RPC com reconsulta do entitlement.
- Trial configurado para 30 dias; acesso de licença baseado na conta, sem limite de aparelhos.
- 12 módulos técnicos; cálculos permanecem no navegador.
- Card 5 de Consultoria oferece botão para abrir a tela de ativação pelo código e botão de compra que inicia contato por WhatsApp; compra/pagamento dentro do app não está implementado.
- Service Worker contém `casillas-v10`; manifest usa `start_url ./index.html`, `scope ./` e `standalone`.
- `KEYS.install`, `lastSeen`, `activated` e `activeCode` estão apenas declaradas em `js/trial.js`, sem uso encontrado. Sem efeito de autorização.
- `gerar-codigo.html` é ferramenta independente legada com instruções do antigo sistema local; não é fluxo comercial atual.

## Validação histórica (29/09)

Os 17 testes SQL/RLS e os testes antigos de Auth/trial pertencem ao histórico daquela atualização e não foram reexecutados naquele momento. O teste de Home foi manual e o offline foi observado apenas até login. O estado atual e as pendências vigentes estão em `STATUS.md`; as evidências técnicas permanecem em [Testes](TESTES.md), [Segurança](SEGURANCA.md) e [Roadmap](ROADMAP.md).

## Histórico preservado

Os documentos de marcos datados são snapshots imutáveis; diferenças com o estado atual ficam registradas aqui e nos documentos técnicos atuais. Backups e conteúdo histórico não são fonte da arquitetura comercial vigente.

## Estado operacional atual

Ver `STATUS.md` e `PLANO-MESTRE.md` para o estado operacional, gates, pendências e próxima ação oficial.

## 29/09 — controle mestre

- Registrados `docs/PLANO-MESTRE.md` e `docs/STATUS.md` como controles operacionais do Plano Mestre.
- A referência operacional atual é a branch `casillas-2.0-hardening`, HEAD `629ebe3`.
- O texto histórico deste documento que cita `casillas-2.0` não deve ser interpretado como estado atual.
- (referência histórica; HEAD atual: ver `STATUS.md`).
- Regra adotada: antes de cada nova fase, consultar plano, status, progresso e evidências Git para evitar retrabalho.

## 30/09 — G1 concluído

- Versionada a função `public.activate_casillas_license(text)` na migration `20260930213346_add_public_activate_casillas_license_wrapper.sql`.
- A migration contém somente o wrapper e seus grants; a implementação privada continua exclusivamente na `20260928160324`.
- Verificação remota confirmou `public_exec=false`, `anon_exec=false`, `authenticated_exec=true`, `service_role_exec=true`.
- Hash da 60324 permaneceu `ccdfa87dc050136398511860a45a8458781d4a99`.
- Nenhuma migration foi aplicada ao Supabase; nenhum commit ou push foi feito.
- G1 — Reprodutibilidade do banco: CONCLUÍDO.
- Próximo gate: G2 — Auth e fluxo comercial.
- Pendência separada: divergência histórica de timestamp entre a migration local 60324 e a entrada remota 60738.

## 30/09 — G2 em andamento

- Suite `tests/trial-access.test.mjs`: 12/12 passando.
- Confirmado: `app.js` verifica sessão no boot; `trial.js` revalida usuário antes de entitlement, trial e ativação.
- Encontrada pendência: `auth.js` expõe `onAuthStateChange()`, porém não existe consumidor ativo na aplicação.
- Consequência: mudança/expiração de sessão durante o uso não possui tratamento explícito no app.
- G2 não foi marcado como concluído.
- Próxima decisão: definir tratamento de mudança/expiração de sessão antes da implementação.

## 30/09 — G2: tratamento de SIGNED_OUT

- `js/app.js` passou a consumir `onAuthStateChange()`.
- Somente o evento `SIGNED_OUT` provoca redirecionamento para `auth.html`.
- `TOKEN_REFRESHED` não é tratado como logout.
- `node --check js/app.js`: OK.
- Suite comercial: 12/12 passando após a mudança.
- `git diff --check`: sem erros de whitespace; apenas avisos preexistentes de conversão LF/CRLF.

## 30/09 — G2 concluído: validação integrada autenticada

- Usuário de teste local autenticado acessou o Casillas com trial expirado e chegou corretamente à tela de ativação.
- A licença local `TESTCASILLAS2026` foi ativada com sucesso; a Home passou a exibir `Licença ativa` e `Acesso comercial confirmado`.
- Logout executado pela função `signOut()` encerrou a sessão e redirecionou para `auth.html`.
- Acesso direto a `http://localhost:4175/` após logout permaneceu bloqueado na tela de login.
- Novo login recuperou `Licença ativa` sem nova ativação, confirmando que a autorização é recuperada pelo entitlement persistido no backend local.
- Suite `tests/trial-access.test.mjs`: 12/12 passando.
- G2 — Auth e fluxo comercial: CONCLUÍDO.
- Próximo gate: G3 — Segurança e hardening.


## 01/10 — G3: auditoria de segurança remota

- Security Advisor do projeto remoto confirmou `public.rls_auto_enable()` como `SECURITY DEFINER` executável por `anon` e `authenticated`, com endpoint RPC reportado pelo advisor. O achado é concreto; nenhuma correção foi aplicada.
- Security Advisor confirmou proteção contra senhas vazadas desativada. Nenhuma alteração de Auth foi executada.
- O advisor mantém quatro tabelas com RLS habilitado e sem policies (`licenses`, `entitlements`, `access_events`, `admin_roles`) como INFO. O snapshot anterior mostrou ausência de grants diretos para `anon`/`authenticated`; não foi identificado acesso direto por essas roles.
- `mcp__Supabase__list_edge_functions` confirmou zero Edge Functions remotas.
- A auditoria do código não encontrou implementação de rate limiting para `activate_casillas_license`; permanece pendência de desenho.
- `gerar-codigo.html` permanece legado público, incluído no artefato, com instruções obsoletas de três aparelhos; nenhuma alteração foi feita.
- Git continua sem arquivos staged. `git diff --check` não apresentou erro de whitespace; somente avisos de conversão LF/CRLF.
- Hash da migration 60324 permanece `ccdfa87dc050136398511860a45a8458781d4a99`.
- G3 permanece PARCIAL. G3.1 (`rls_auto_enable`) concluído.
- Pendentes: leaked-password protection, rate limiting da ativação,
  decisão sobre `gerar-codigo.html`.

## 01/10 — G3.1 concluído: hardening de public.rls_auto_enable()

- Migration `20261001023219_harden_rls_auto_enable_acl.sql` criada e commitada como `73e408c6f8868b1e76560901535293cfccfdecc5`.
- Aplicação remota executada manualmente via SQL Editor do Supabase.
- `REVOKE EXECUTE` aplicado para `PUBLIC`, `anon`, `authenticated` e `service_role`.
- `has_function_privilege`: `PUBLIC=false`, `anon=false`, `authenticated=false`, `service_role=false`, `postgres=true`.
- `proacl` final: `{postgres=X/postgres}`.
- Security Advisor: os dois WARNs referentes à execução de `public.rls_auto_enable()` por `anon` e `authenticated` desapareceram.
- Permanecem outros achados independentes: leaked password protection desativada (WARN) e quatro tabelas com RLS sem policies (INFO).
- Aplicação foi manual; não houve `supabase db push`. O histórico remoto de migrations não registra esta aplicação.
- Rollback disponível em `C:\Backups\Casillas\2026-10-01-g3-rls\rollback.sql`.


## 01/10 — G3.2 não aplicável + G3.3 adiado

G3.2 — Leaked Password Protection

AUDITORIA:
- WARN auth_leaked_password_protection confirmado
- funcionalidade indisponível no Free Plan (documentação Supabase)
- configuração no Dashboard: Authentication → Providers → Email

DECISÃO:
- NÃO APLICÁVEL no plano atual
- aceitar como risco residual documentado
- reavaliar se o projeto migrar para Pro

EVIDÊNCIA:
- Security Advisor: WARN presente e esperado no Free
- documentação oficial Supabase confirma requisito de plano
---

G3.3 — Rate Limiting da ativação

DECISÃO:
- ADIADO para pós-lançamento
- motivo: exige modelo de ameaça; sem tráfego real, seria especulativo

RISCO RESIDUAL:
- brute force de códigos sem limitação explícita
- mitigação: códigos aleatórios tornam brute force inviável na prática
- reavaliar se houver evidência de tentativa


## G3.4 — gerar-codigo.html removido

- Ferramenta legada removida do repositório e, por consequência, do artefato publicado pelo GitHub Pages.
- `./gerar-codigo.html` removido do `CACHE_ASSETS`.
- Service Worker incrementado de `casillas-v10` para `casillas-v11` para invalidar o cache anterior.
- README, mapa de dependências e decisões atualizados.
- G3.4 concluído localmente; publicação depende do próximo push/deploy autorizado.


## 01/10 — G4.2.1 concluído: instalação e atualização do SW

TESTES EXECUTADOS:
- Instalação limpa: SW v12 ativo, 50 entradas, 6 assets críticos presentes
- Atualização simulada v99 → v12: cache antigo removido corretamente
- Caches finais: apenas casillas-v12

DESCOBERTAS:

1. Fluxo de redirect para auth.html

Em uma instalação limpa sem sessão autenticada, / redireciona
para /auth antes de registrar o Service Worker. Isso pode
significar que usuários novos (sem login) não têm o SW
registrado antes de fazer login. Investigar em G4.2.2 se o
registro do SW ocorre independentemente do estado de auth.

2. Servidor antigo na porta 4175

Um servidor antigo (v10) estava rodando antes de G4.2.1.
Foi substituído pelo servidor atual apontando para
C:\Projetos\Casillas_app_2.

OBSERVAÇÃO SOBRE CONTAMINAÇÃO POTENCIAL:

Como o servidor antigo servia v10, os testes de G2 (Auth,
Trial, Ativação) podem ter rodado contra a versão antiga do
frontend. Os testes foram 12/12 PASS, e o backend local é o
mesmo — mas o frontend testado pode ter sido v10, não o
estado atual. Recomendação: revalidar o fluxo de auth em
G4.2.2 ou em etapa própria.

EVIDÊNCIA:
- SW hash final: BDDB1E3581A76538C771798FC085CA441776E9BE8669C4D8572055DC6E9469E5
- git status --short: vazio

## 01/10 � G4.2.2a conclu�do: diagn�stico de contexto do PWA

VERIFICA��ES EXECUTADAS:

1. Servidor = reposit�rio

   Hashes id�nticos entre servidor local e reposit�rio:
   - js/trial.js    ? 9A843DA3...
   - js/app.js      ? 7DF573CC...
   - service-worker.js ? BDDB1E35...

   Contamina��o por servidor antigo (v10) resolvida.
   O servidor atual serve exatamente o estado do reposit�rio.

2. Porta 4175

   Processo �nico (node.exe serve), diret�rio
   C:\Projetos\Casillas_app_2. Nenhum fantasma.

3. Registro do Service Worker depende de auth

   Ordem real em js/app.js:
   - linha 220: getCurrentUser()
   - linha 224/229: redirect para /auth.html
   - linha 241: registerServiceWorker()

   Para usu�rio n�o autenticado, o redirect ocorre ANTES
   de registerServiceWorker(). Portanto:
   - usu�rio novo (sem login): SW N�O registrado
   - usu�rio logado (ap�s reload): SW registrado

   Isso N�O � bug � � comportamento atual do fluxo.
   Mas � DECIS�O DE ARQUITETURA A VALIDAR:

   - Se intencional: PWA s� habilita ap�s autentica��o
   - Se descuido: registrar SW antes do redirect

   Decis�o: deixar para G4.2.2b testar os dois fluxos,
   depois decidir se corrige (G4 ou G5) ou aceita como est�.

IMPLICA��ES PARA G4.2.2b:

- Teste offline real s� � v�lido para usu�rio logado
- Cen�rio "usu�rio novo offline" deve ser documentado
  como comportamento esperado, n�o como falha

## 01/10 — Observação: possível contaminação de G2

Durante os testes de G2 (Auth/Trial/Ativação, 12/12 passando),
um servidor antigo (v10) estava ativo na porta 4175, servindo
código diferente do repositório atual.

Os 12 testes passaram, e o backend local é o mesmo. Porém, o
frontend testado pode ter sido v10, não o código atual (v12).

IMPACTO:
- G2 não é necessariamente inválido — a lógica de auth/trial/
  ativação provavelmente é idêntica entre v10 e v12
- Mas a evidência está contaminada

AÇÃO PENDENTE:
- Revalidar os testes de G2 contra o código atual
- Pode ser feito como parte de G4.2.2b ou como etapa própria
- Não corrigir nada agora

## 01/10 � G4.2.2b conclu�do: testes offline funcionais

FLUXO A (usu�rio novo):
- Com instala��o limpa e sem sess�o, / redireciona para /auth antes do registro do SW.
- Comportamento esperado confirmado.

FLUXO B (usu�rio logado):
- Sess�o ativa confirmada; app permaneceu em / sem redirecionamento para /auth.
- SW v12 ativo e controlando a p�gina.
- Cache casillas-v12 presente com 50 entradas.
- Offline ativado e app recarregado com sucesso.
- Trigonometria calculou 3-4-5 offline: hipotenusa 5,00 mm.
- Roscas calculou M10 � 1,5 offline: di�metro m�dio 9,0258 mm e di�metro interno 8,3763 mm.
- Guia de Programa��o carregou offline com 4 de 4 ciclos a partir do guia local.
- Offline desativado e app retomou normalmente online, mantendo sess�o e SW ativo.

OBSERVA��O:
- A descoberta do servidor v10 permanece registrada como poss�vel contamina��o dos testes de G2.
- Pend�ncia: revalidar os testes de G2 contra o c�digo atual.
## 01/10 — Observação: instabilidade do servidor local

O servidor em localhost:4175 mudou entre sessões durante G4:

- G4.2.2a: servidor antigo (v10) estava ativo
- G4.2.3: servidor diferente (PID 3756) servindo dist/
  → /service-worker.js retornava 404

Isso indica que o ambiente local não persiste entre sessões
de forma confiável.

AÇÃO PREVENTIVA (para blocos futuros):

Antes de qualquer teste que dependa do servidor local,
validar:
1. Hash de js/app.js, js/trial.js, service-worker.js
   contra o repositório
2. /service-worker.js responde 200
3. Porta 4175 serve a raiz do projeto (não dist/ ou outro)


## 03/10 — G4.2.3 concluído: segurança e isolamento validados

Teste 1 (crítico) — Supabase fora do cache:
- requisições de API (auth, rest) não são cacheadas pelo SW
- apenas arquivos JS do SDK estão no cache, como esperado

Teste 3b — fallback de navegação:
- URL nunca acessada + offline → offline.html ✅

Testes 2, 3c, 4 — verificados por auditoria de código em G4.1.
- Teste 2: métodos não-GET são ignorados.
- Teste 3c: cache dinâmico de GET same-origin.
- Teste 4: cache de GET same-origin via c.put(req, copy).

Teste 3a — comportamento online de URL inexistente:
- 404 padrão observado/confirmado.

Teste 5 — hash do Service Worker:
- hash validado sem alteração durante o bloco de testes.

ACHADO REGISTRADO (baixa prioridade):
- Service Worker cacheia respostas 404 de navegação.
- Impacto: fallback offline.html fica limitado a URLs nunca acessadas online.
- Correção ideal: adicionar if (res.ok) antes do c.put no fetch handler.
- Pendência para G5 ou posterior.

EVIDÊNCIA:
- Teste 1: validação dinâmica/manual no navegador.
- Teste 3b: validação dinâmica/manual no navegador com URL nunca acessada online.
- Testes 2, 3a, 3c e 4: auditoria de código / evidências anteriores, sem execução dinâmica nesta sessão quando aplicável.
## 03/10 — Push oficial para origin/casillas-2.0

CONTEXTO:
5 commits locais de G4.3 estavam pendentes de publicação.

COMMITS ENVIADOS:
- edea92b — docs(g4.2.3-parcial)
- 2f34f74 — docs(g4.2.3)
- c1a4851 — docs(g4.3b)
- 2c9c548 — docs(g4.3c)
- d11aa96 — docs(g4.3d)

RESULTADO:
origin/casillas-2.0 atualizado de 0e4e074 → d11aa96.
Push autorizado explicitamente pelo Igor.

NOTA:
Este foi o primeiro push coordenado e registrado após a
descoberta do push não-rastreado de 01/10. Daqui em diante,
pushes coordenados devem ser registrados neste documento.

## 04/10 — G5: decisões comerciais e lotes de execução definidos

DECISÕES REGISTRADAS:
- Preço de lançamento: R$ 19,90; preço cheio de referência: R$ 49,90.
- Licença: pagamento único, vitalícia, vinculada à conta e sem limite de aparelhos.
- Compra inicial via WhatsApp; sem gateway de pagamento no escopo de G5.
- Terminologia visível: padronizar "Trial"/"Versão gratuita"/"período de avaliação" para "Período de teste", conforme contexto.
- Lote 1: padronização de textos da UI.
- Lote 2: CTA visível de logout usando o `signOut()` existente.

VERIFICAÇÃO DE ARTEFATOS:
- `tools/gerar-codigo.mjs`: não existe no repositório neste marco.
- `docs/OPERACAO-COMERCIAL.md`: não existe no repositório neste marco.
- Ambos ficam registrados como pendências da Camada 1 da operação manual de licenças em G5.

ESTADO:
- Planejamento/documentação apenas.
- Nenhuma implementação de G5 iniciada neste marco.
- Sem alteração remota, commit ou push nesta etapa.


## 04/10 — G5.6: fechamento documental

IMPLEMENTAÇÃO CONCLUÍDA:
- G5.4.1 — padronização dos textos visíveis de período de teste; commit `97c8cc4`.
- G5.4.2 — logout visível; commit `4cb7f7c`.
- G5.4.3 — oferta comercial de licença vitalícia e compra via WhatsApp; commit `7d4ca09`.
- Camada 1 — gerador local e procedimento operacional; commit `53a00ef`.

EVIDÊNCIAS:
- G5.4.1 validado manualmente pelo Igor: textos corretos.
- G5.4.2 validado manualmente pelo Igor: logout correto.
- G5.4.3 validado manualmente pelo Igor: oferta e WhatsApp corretos.
- `node --test tests/trial-access.test.mjs`: 12/12 passando na regressão executada após as alterações.
- Gerador local: `node --check` aprovado; geração e modo `--sql` executados; normalização e SHA-256 conferidos contra cálculo independente.
- Nenhuma credencial administrativa foi incluída no gerador; arquivos da Camada 1 não são referenciados pelo Service Worker.

DECISÃO DE COBERTURA:
- O teste E2E remoto da Camada 1, que cadastraria uma licença descartável `AVAILABLE` no Supabase e a ativaria com conta de teste, NÃO foi executado.
- Igor decidiu explicitamente pular essa validação.
- Portanto, o fechamento de G5 não declara esse cenário como validado remotamente.
- Nenhuma escrita no Supabase foi realizada durante a implementação/validação da Camada 1.

ESTADO:
- G5 — UX comercial: CONCLUÍDO no escopo acordado.
- Próximo gate: G6 — Testes end-to-end.
- Os commits locais de G5 permanecem sem push até autorização explícita.

## 04/10 — Sprint 6C: refinamento pré-G6

IMPLEMENTAÇÃO CONCLUÍDA:
- 6C.1 — Guia CNC: cartões compactos, detalhes expansíveis com ARIA, busca/filtros preservados e escopo FANUC + Siemens; commit `b00bdfe`.
- 6C.2 — navegação/acessibilidade: teclado, Escape, foco, `aria-expanded` e `aria-current`; commit `90449c9`.
- 6C.3 — estados/feedbacks: terminologia "Período de teste" e estados semânticos de carregamento/vazio no Guia; commit `d5aaabc`.
- 6C.4 — responsividade: zoom permitido, cabeçalho refinado e áreas de toque maiores em telas pequenas; commit `fd58c25`.

EVIDÊNCIAS:
- Igor aprovou manualmente 6C.1, 6C.2 (exceto compartilhamento no ambiente HTTP), 6C.3 e 6C.4 no smartphone.
- Revisão acumulada 6C.5: working tree limpa antes do fechamento documental; quatro commits locais à frente de `origin/casillas-2.0`.
- `git diff --check b65601b..HEAD`: aprovado.
- `node --check` nos JavaScript alterados no Sprint: aprovado.
- `node --test tests/trial-access.test.mjs`: 12/12 passando.
- Nenhum resíduo encontrado no escopo verificado para `Haas`, `user-scalable=no` ou "período de avaliação".
- Nenhuma alteração remota no Supabase foi realizada no Sprint 6C.

PENDÊNCIA CONTROLADA:
- Compartilhar App não pôde ser validado no smartphone usando `http://192.168.24.7:4175` porque Web Share/Clipboard dependem de contexto seguro. Deve ser revalidado em HTTPS; não é considerado aprovado nem falha confirmada.

ESTADO:
- Sprint 6C — CONCLUÍDO LOCALMENTE no escopo acordado.
- Próximo gate oficial permanece G6 — Testes end-to-end.
- Nenhum push do Sprint 6C foi realizado.

## 04/10 — G6: consolidação de testes end-to-end

DECISÃO:
- G6 foi revisado contra as evidências históricas antes de qualquer reexecução, seguindo a regra anti-retrabalho.
- O fluxo crítico integrado já havia sido executado em gates anteriores; portanto, não foi repetido apenas para mudar o rótulo do gate.

EVIDÊNCIAS CONSOLIDADAS:
- G2: login autenticado; trial expirado levando ao bloqueio/ativação; ativação de `TESTCASILLAS2026`; confirmação de licença/entitlement; logout; bloqueio de acesso direto sem sessão; novo login recuperando a licença sem nova ativação.
- G2/G5/6C: `tests/trial-access.test.mjs` registrou 12/12 testes aprovados em regressões sucessivas.
- G4.2.1: instalação limpa do SW v12 e atualização com remoção de cache antigo validadas.
- G4.2.2b: sessão autenticada com SW v12; reload offline; Trigonometria 3-4-5 = 5,00 mm; Roscas M10 × 1,5 = 9,0258 mm / 8,3763 mm; Guia de Programação carregado offline; retorno online normal.
- G4.2.3: segurança e isolamento do Service Worker validados no escopo registrado, com coberturas dinâmicas incompletas já documentadas separadamente.
- Sprint 6C: refinamentos validados manualmente no smartphone e regressão acumulada aprovada.

LIMITES:
- O E2E remoto da Camada 1 com criação/ativação de licença descartável continua não executado por decisão explícita anterior.
- Compartilhar App continua pendente de validação em HTTPS.
- Recuperação de senha completa, cenários extremos de trial/licença/RLS e fluxo visual exaustivo de todos os módulos permanecem como cobertura complementar em `docs/TESTES.md`; não são registrados como executados.

ESTADO:
- G6 — CONCLUÍDO POR EVIDÊNCIAS ACUMULADAS do fluxo crítico integrado.
- Nenhum E2E foi repetido nesta consolidação e nenhuma escrita remota foi realizada.
- Próximo gate oficial: G7 — Auditoria final.

## 04/10 — G7: auditoria final em andamento

ACHADOS:
- Recuperação de senha enviava o e-mail, mas não tratava o retorno `PASSWORD_RECOVERY` nem permitia definir a nova senha.
- Workflow do GitHub Pages publicava `path: '.'`, incluindo documentação, migrations, testes e ferramentas locais no artefato público.
- Não foi encontrada chave administrativa/segredo no scan dos arquivos versionados, mas a superfície publicada era desnecessariamente ampla.
- Documentos técnicos ainda continham referências obsoletas ao wrapper de ativação não versionado, SW v10, offline autenticado não validado e `gerar-codigo.html` ainda presente.

CORREÇÕES LOCAIS:
- Recuperação de senha agora trata `PASSWORD_RECOVERY`, exige nova senha + confirmação e usa `supabase.auth.updateUser({ password })`; após sucesso encerra a sessão de recuperação e retorna ao login.
- Workflow do Pages passou a montar `_site` com somente os arquivos necessários ao PWA antes do upload do artefato.
- Documentação técnica atualizada para wrapper versionado, SW v12, offline autenticado validado em G4.2.2b e remoção de `gerar-codigo.html` em G3.4.

EVIDÊNCIAS:
- Implementação de recuperação conferida contra documentação atual do Supabase Auth.
- `git diff --check` aprovado.
- `node --check js/auth.js` e `node --check js/auth-page.js` aprovados.
- `tests/trial-access.test.mjs`: 12/12 aprovados.
- Todos os caminhos declarados para o novo artefato `_site` existem localmente.

PENDÊNCIA BLOQUEANTE PARA FECHAR G7:
- Executar E2E real da recuperação de senha pelo link enviado por e-mail em contexto HTTPS, confirmando também a Redirect URL permitida no Supabase.

PENDÊNCIA CONTROLADA SEPARADA:
- Compartilhar App continua aguardando validação em HTTPS.

ESTADO:
- G7 permanece EM ANDAMENTO.
- Nenhum push e nenhuma escrita no Supabase remoto foram realizados.
