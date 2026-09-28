# Marco 2026-09-28 — Fluxo Comercial

> Registro histórico do estado no commit-base `844d838b6ff3375be8314ef602488f68bc08cc57`. Para o estado vigente após o refinamento da Home, consulte `docs/MARCO-2026-09-28-HOME-E-FLUXO-COMERCIAL.md`.

## Estado

- Branch: casillas-2.0
- Commit-base: 844d838b6ff3375be8314ef602488f68bc08cc57 (git rev-parse HEAD)
- Data do marco: 2026-09-28

## Arquitetura atual

- Supabase é a autoridade comercial.
- O usuário precisa estar autenticado para o fluxo de acesso.
- O trial é controlado pelo Supabase.
- O entitlement é consultado no Supabase.
- A licença é ativada através da RPC activate_casillas_license.
- A licença comercial não possui limite de aparelhos no fluxo atual.
- A autorização não depende mais de KEYS.activated.
- O antigo sistema local de device ID e limite de aparelhos foi removido de js/trial.js.

## Alterações concluídas

Foram removidos de js/trial.js:

- validarCodigo
- normalizeCode
- getOrCreateDeviceId
- getActivatedCodesRegistry
- registrarAtivacao
- contarAparelhos
- hashCodigo
- gerarFingerprint
- gerarHashInstall
- verificarIntegridade
- registrarManipulacao
- resetarTentativas
- MAX_DEVICES_PER_CODE
- MAX_TENTATIVAS_MANIPULACAO
- As listas locais de códigos válidos e revogados.
- As chaves locais relacionadas ao aparelho e à anti-manipulação.
- A dependência de getDB e setDB dentro de trial.js.

getDB e setDB continuam sendo utilizados por state.js para persistência legítima do estado do aplicativo.

## Consultoria

O botão 🔑 Ativação do card 🔑 Ativação de licença não utiliza mais código associado ao aparelho. Agora abre o WhatsApp diretamente com a mensagem:

Olá! Preciso de ajuda para ativar minha licença do Casillas App.

A função ausente getActivationCodeForCurrentDevice() não deve ser recriada.

## Pendências conhecidas

1. gerar-codigo.html ainda contém a ferramenta antiga de geração/hash local e precisa ser auditada.
2. service-worker.js ainda inclui gerar-codigo.html no pré-cache.
3. README.md ainda contém referências históricas ao sistema antigo.
4. docs/MAPA-DEPENDENCIAS.md ainda registra getActivationCodeForCurrentDevice().
5. Os testes funcionais foram deliberadamente adiados nesta etapa.
6. Não há necessidade atual de implementar revogação como prioridade.
7. Não fazer limpeza dos backups existentes sem decisão explícita.

## Integridade

- node --check .\js\trial.js passou.
- node --check .\js\modules\consult.js passou.
- git diff --check não encontrou erros de whitespace.
- Existem avisos relacionados a line endings mistos.
- Os line endings não devem ser normalizados automaticamente.

## Regra para próxima etapa

Antes de qualquer nova remoção ou alteração estrutural, consultar este marco e preservar os backups existentes.