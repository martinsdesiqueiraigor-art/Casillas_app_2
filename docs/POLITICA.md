# Política de Orquestração do Casillas v1.0

## 1. Princípio fundamental
Planejar → verificar → executar → testar → registrar → aprovar → publicar.
Cada ferramenta será usada somente quando resolver um problema concreto.

## 2. Papéis
**Igor — proprietário e autoridade final.** Define objetivos, prioridades e aprova decisões relevantes.
**Claude — análise crítica, auditoria paralela e orquestração do diálogo Igor↔GPT.**
**GPT — execução técnica e orquestração das ferramentas.**
**Ferramentas —** cada uma possui função definida e atua dentro do escopo autorizado.

## 3. Gatilhos de ferramentas
**Context7 — obrigatório** quando a decisão depende de documentação atual de API, biblioteca, serviço ou ferramenta.
**Superpowers — obrigatório** em debug, análise de causa raiz e verificação antes de declarar conclusão.
**Codelit — obrigatório** em blocos com 5+ tarefas ou decisão arquitetural.
**Remote Desktop Commander —** execução no PC.
**Git/GitHub —** versionamento e histórico técnico.
**Supabase —** fonte de verdade do backend remoto.

## 4. Verificação de remote
Nunca afirmar “nenhum push” ou “está sincronizado” sem verificar:
- `git status -sb`
- `git log origin/<branch> -1`
- `git rev-list --left-right --count <branch>...origin/<branch>`

## 5. Aprovação
**Commit:** diff → teste → aprovação → commit.
**Push:** verificação pré → autorização Igor → push → verificação pós → registro.
**Supabase remoto:** mesma regra de verificação e aprovação antes da alteração.

## 6. Fonte de verdade por categoria
**Direção →** `PLANO-MESTRE.md`
**Estado atual →** `STATUS.md`
**Histórico técnico →** `PROGRESSO.md` + Git
**Código →** Git
**Banco remoto →** Supabase
**Documentação de API/biblioteca →** Context7 / documentação oficial

## 7. Quando parar e pedir orientação
Parar diante de:
- Requisito ambíguo.
- Conflito entre documentos.
- Alteração destrutiva.
- Risco de segurança.
- Divergência local/remote.
- Alteração arquitetural não planejada.
- Necessidade de credencial.
- Teste falhando sem causa estabelecida.

## 8. 5 princípios finais
1. Evidência antes de conclusão.
2. Estado antes de ação.
3. Uma fonte de verdade por categoria.
4. Aprovação antes de publicação.
5. Simplicidade antes de automação.
