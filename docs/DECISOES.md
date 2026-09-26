# Casillas App 2.0 — Decisões Arquiteturais

## Objetivo

Este documento registra decisões importantes tomadas durante o desenvolvimento do Casillas 2.0.

O objetivo é preservar o contexto técnico do projeto e evitar decisões contraditórias ou retrabalho.

---

## 1. Separação entre Casillas 1.x e 2.0

A versão 1.3.1 permanece preservada.

A versão 2.0 será desenvolvida separadamente.

Decisão:

* `main` permanece como versão oficial 1.3.1
* `casillas-2.0` é a branch de desenvolvimento
* o repositório `Casillas_app_2` recebe o desenvolvimento da versão 2.0

Motivo:

Permitir evolução da arquitetura sem colocar a versão estável em risco.

---

## 2. Supabase como backend comercial

O Supabase foi escolhido como infraestrutura backend do Casillas 2.0.

Responsabilidades:

* autenticação
* banco PostgreSQL
* RLS
* trial
* licenciamento
* entitlements
* eventos comerciais
* futuras operações administrativas

---

## 3. Supabase Auth para identidade

A identidade do usuário será controlada pelo Supabase Auth.

O frontend não criará seu próprio sistema de identidade.

Responsabilidades:

* cadastro
* login
* logout
* sessão
* recuperação de acesso
* identificação do usuário

---

## 4. Backend como autoridade comercial

O navegador não será considerado autoridade para:

* validade do trial
* validade da licença
* autorização comercial
* permissões administrativas
* entitlements

Essas informações devem ser determinadas pelo backend.

---

## 5. Trial de 30 dias

O Casillas possui trial comercial de 30 dias.

O trial foi implementado no backend.

A criação do trial utiliza uma função controlada pelo banco.

O usuário autenticado é associado ao trial.

A autoridade definitiva sobre o período do trial será o backend.

---

## 6. Sistema local de trial durante a transição

O sistema legado de trial continuará existindo durante a transição.

Ele não será considerado a autoridade comercial definitiva.

A substituição será gradual.

Antes de remover ou reescrever o sistema legado serão verificadas suas dependências.

---

## 7. IndexedDB

IndexedDB continuará sendo utilizado para dados locais do aplicativo.

Pode armazenar:

* histórico
* preferências
* estado local
* dados necessários ao funcionamento offline

Não deve determinar:

* licença
* trial comercial
* autorização
* permissões administrativas

---

## 8. Módulos técnicos independentes

Os módulos técnicos devem permanecer independentes do sistema comercial.

Não devem depender diretamente de:

* Supabase
* Auth
* trial
* licenciamento
* pagamentos

Motivo:

Permitir que as calculadoras continuem funcionando sem depender da infraestrutura comercial.

---

## 9. Cliente Supabase no frontend

O frontend utiliza o cliente oficial:

@supabase/supabase-js

O projeto utiliza um bundle local para permitir o funcionamento no GitHub Pages.

Apenas credenciais apropriadas para frontend podem ser utilizadas no navegador.

---

## 10. Segredos nunca devem ir para o frontend

Não devem ser publicados no código do aplicativo:

* service_role
* secret keys
* senhas
* credenciais administrativas
* tokens administrativos permanentes

O controle de segurança deve ser realizado pelo backend.

---

## 11. RLS

Row Level Security está habilitado nas tabelas do sistema comercial.

As políticas devem limitar o acesso aos dados pertencentes ao usuário autenticado.

Dados comerciais sensíveis não devem receber acesso direto desnecessário pelo cliente.

---

## 12. Funções SECURITY DEFINER

Funções SECURITY DEFINER são utilizadas somente quando existe necessidade arquitetural.

As funções privilegiadas devem:

* permanecer protegidas
* utilizar search_path controlado
* validar o usuário quando necessário
* não ser expostas publicamente sem necessidade

---

## 13. Pequenas alterações

Alterações importantes devem ser feitas em etapas pequenas.

Cada etapa deve possuir:

* objetivo definido
* implementação
* teste
* verificação
* commit

Motivo:

Facilitar diagnóstico e recuperação.

---

## 14. Arquivos de alta dependência

Os seguintes arquivos são considerados críticos:

* js/app.js
* js/trial.js
* js/db.js
* service-worker.js

Eles não devem ser substituídos sem análise prévia de dependências.

---

## 15. Alterações cirúrgicas

Arquivos grandes e estáveis devem preferencialmente receber alterações cirúrgicas.

Exemplo principal:

* js/app.js

Novos arquivos arquiteturais podem ser criados separadamente quando isso reduzir o risco.

---

## 16. Autenticação antes da autoridade definitiva do trial

A interface de autenticação deve ser integrada antes de tornar o Supabase a autoridade exclusiva do fluxo de acesso do aplicativo.

Motivo:

O aplicativo precisa identificar corretamente o usuário antes de consultar as regras comerciais associadas à conta.

---

## 17. Pagamentos somente depois da infraestrutura comercial

A integração de pagamentos não será realizada antes de:

* autenticação
* trial
* licenciamento
* entitlements
* controle de acesso
* operações comerciais seguras

Motivo:

Evitar criar cobrança antes de existir uma base comercial consistente.

---

## 18. Segurança não depende do frontend

O JavaScript do navegador pode ser alterado pelo usuário.

Portanto, verificações realizadas somente no frontend não são consideradas mecanismos suficientes de segurança comercial.

---

## 19. Backups antes de alterações importantes

Antes de alterações arquiteturais importantes deve existir um ponto de restauração.

O projeto possui snapshots físicos e versões registradas no Git.

---

## 20. Git como histórico técnico

Commits devem representar mudanças pequenas e compreensíveis.

A mensagem do commit deve explicar a finalidade da alteração.

O histórico do Git deve permitir identificar:

* o que mudou
* por que mudou
* em qual etapa mudou

---

## 21. Definition of Done

Uma etapa só será considerada concluída quando:

* implementação concluída
* dependências verificadas
* testes executados
* segurança revisada
* comportamento confirmado
* documentação atualizada
* commit criado
* Git verificado

---

## 22. Regra geral do projeto

O Casillas 2.0 deve evoluir de forma incremental.

A prioridade é:

1. estabilidade
2. segurança
3. rastreabilidade
4. separação de responsabilidades
5. evolução comercial
6. publicação

A arquitetura deve permitir crescimento sem exigir reescrita dos módulos técnicos existentes.
