# EVOLUÇÃO 2.1 — CONCLUÍDO / HISTÓRICO

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
# PLANO DE EVOLUÇÃO — CASILLAS 2.1

Status: PLANEJAMENTO
Owner e autoridade final: Igor Martins de Siqueira
Coordenação: GPT
Base estável: Casillas 2.0.0 em produção

## 1. Objetivo

Evoluir o Casillas sem transformar a versão 2.0 em ambiente de experimentação. O 2.1 combina qualidade, segurança, conhecimento CNC, biblioteca técnica, integração contextual e presença de conteúdo.

Princípio do produto:

**CALCULAR → APRENDER → PROGRAMAR → CONSULTAR**

## 2. Fronteira 2.0 x 2.1

- Casillas 2.0 permanece estável em produção.
- G10.5 (primeira venda assistida) continua independente e não depende do 2.1.
- O desenvolvimento 2.1 não autoriza alterações em produção, Supabase remoto, licenças reais ou publicação.
- Correções críticas descobertas durante a evolução devem voltar à coordenação para decisão de hotfix 2.0 ou inclusão no 2.1.
- Pesquisa, testes e criação de conteúdo podem ocorrer em paralelo; alterações concorrentes no mesmo código não.

## 3. Modelo de trabalho paralelo

| ID | Trilha | Responsabilidade | Ferramentas/ambiente | Dependência |
|---|---|---|---|---|
| EV0 | Coordenação | Escopo, decisões, gates, integração e evidências | Chat coordenador, Git, Codelit | Central |
| EV1 | QA e Testes | Encontrar e reproduzir falhas; validar cálculos, UX, PWA e fluxos | ChatGPT/Work, TinyFish, Superpowers, testes, Desktop Commander | Pode iniciar |
| EV2 | Segurança | Auditar Auth, RLS, RPC, trial, entitlement, licenças e exposição | ChatGPT/Work, Supabase, GitHub, Superpowers, Context7; Codex Security opcional se disponível | Pode iniciar |
| EV3 | Guia CNC 2.0 | Estruturar e validar a nova base de conhecimento CNC | ChatGPT/Work, pesquisa técnica, Context7 quando aplicável | Pode iniciar |
| EV4 | Biblioteca Técnica | Definir catálogo, PDFs, direitos, acesso e armazenamento | ChatGPT/Work, Supabase em fase de desenho | Pode iniciar |
| EV5 | Integração e UX | Conectar calculadoras, Guia, Biblioteca e vídeos | Desenvolvimento coordenado | EV3/EV4 definidos |
| EV6 | Conteúdo e Crescimento | Instagram, YouTube, identidade editorial e funil | Chats dedicados, Work quando útil, geração de mídia | Pode iniciar |
| EV7 | Release 2.1 | Integrar, executar regressão, RC, aprovação e publicação | Coordenação + QA + Git | EV1–EV6 aplicáveis |

## 4. Contrato dos agentes

Cada chat/agente recebe uma responsabilidade principal, entradas autorizadas, entregável e critério de parada.

- EV1 e EV2 inicialmente reportam problemas; não corrigem automaticamente.
- EV3 e EV4 especificam antes de implementar.
- EV6 não altera código do produto sem tarefa aprovada pela coordenação.
- Mudanças compartilhadas em `js/app.js`, Service Worker, migrations ou arquitetura comercial são coordenadas centralmente.
- Nenhum agente faz commit, push, deploy ou escrita remota por inferência.
- Mudança crítica, destrutiva, de segurança ou produção exige aprovação explícita do owner.

## 5. EV0 — Coordenação 2.1

### Entregáveis
- manter este plano e o escopo;
- receber relatórios das trilhas;
- classificar achados por severidade e versão;
- decidir dependências e ordem de integração;
- preservar rastreabilidade Git e evidências.

### Gate EV0
A coordenação está pronta quando cada trilha possuir escopo, entregável, critério de aceite e fronteira de escrita definidos.

## 6. EV1 — QA e Testes

### Escopo
1. Matemática dos módulos, com resultado independente.
2. Interface em celular e desktop.
3. Navegação e validações de entrada.
4. Auth, trial, entitlement, ativação, logout e recuperação.
5. PWA, instalação, atualização, offline/online.
6. Regressão automatizada dos cenários aprovados.
7. Navegação por agente de browser quando disponível.

### Regra
TinyFish representa o usuário no navegador; Superpowers apoia investigação, testes e verificação. Resultado visual não substitui validação matemática independente.

### Entregável
Relatório por cenário com entrada, resultado esperado, resultado observado, evidência, severidade e PASS/FAIL.

### Gate EV1
Nenhum bloqueador aberto; falhas não bloqueantes classificadas e aceitas ou planejadas.

## 7. EV2 — Segurança

### Escopo
- Supabase Auth;
- RLS e grants;
- RPCs públicas/privadas;
- trial e entitlement;
- ativação e licenças;
- estado local e tentativa de bypass;
- exposição de secrets e superfície do Pages;
- Service Worker;
- abuso/rate limiting;
- dependências e, opcionalmente, achados do Codex Security se a ferramenta estiver disponível. O Codex Security não é requisito para executar ou concluir o EV2.

### Pergunta de controle
**Um usuário consegue obter ou manter acesso comercial sem autorização válida do servidor?**

### Entregável
Relatório com achado, evidência, impacto, severidade, reprodução e recomendação. Achado não autoriza correção automática.

### Gate EV2
Zero vulnerabilidade crítica/alta não tratada para o escopo do release, ou aceite explícito e documentado quando tecnicamente justificável.

## 8. EV3 — Guia CNC 2.0

### Modelo de conhecimento
**Fabricante/controle → máquina → código/ciclo → variante → exemplo**

Cada conteúdo deve poder registrar:
- aplicação e compatibilidade;
- sintaxe;
- parâmetros;
- explicação;
- exemplo completo;
- explicação linha a linha;
- alertas e erros comuns;
- calculadora relacionada;
- material técnico relacionado;
- vídeo relacionado.

### Regras
- Não tratar dialetos CNC como universais.
- Identificar controle/variante quando necessário.
- Conteúdo técnico exige fonte ou validação apropriada antes da publicação.

### Gate EV3
Modelo de dados, UX de consulta, busca/filtros e conjunto inicial do conteúdo aprovados antes da integração.

## 9. EV4 — Biblioteca Técnica

### Objetivo
Criar uma Biblioteca Técnica acessível pelo Casillas para apostilas, tabelas e materiais de apoio.

### Modelo inicial
Metadados: título, descrição, autor/fonte, categoria, nível, versão/data, tamanho, localização e política de acesso.

Categorias candidatas:
- Programação CNC;
- Torneamento;
- Fresamento;
- Roscas;
- Tolerâncias;
- Metrologia;
- Cálculos;
- Tabelas técnicas.

### Armazenamento proposto
- material público/promocional: fonte pública apropriada;
- manuais de terceiros: preferir fonte oficial e respeitar direitos;
- material próprio/exclusivo: Supabase Storage privado, sujeito a desenho e aprovação;
- não incluir grandes coleções de PDF no pré-cache do Service Worker.

### Gate EV4
Catálogo, direitos de distribuição, modelo de acesso e arquitetura de armazenamento aprovados antes de qualquer implementação remota.

## 10. EV5 — Integração e UX

Conectar áreas relacionadas sem duplicar conteúdo.

Exemplo:
**Calculadora de Rosca → Entenda o cálculo → Programação CNC relacionada → Apostila → Vídeo**

E no sentido inverso:
**Guia CNC → Calculadora relacionada → Biblioteca → Vídeo**

### Gate EV5
Fluxos principais funcionam em mobile e desktop, sem regressão de navegação, acessibilidade ou desempenho relevante.

## 11. EV6 — Conteúdo e Crescimento

### Canais
- Instagram Casillas
- YouTube Casillas

### Posicionamento
Compartilhar conhecimento prático de usinagem e CNC. O aplicativo aparece como ferramenta derivada desse propósito, não como propaganda constante.

### EV6.1 — Manifesto Casillas
Primeira entrega editorial: trailer/apresentação do canal, aproximadamente 1–2 minutos, com tom profissional e de chão de fábrica.

Derivações:
- YouTube 16:9;
- Reel 9:16;
- YouTube Short/cortes;
- publicação/carrossel de apresentação.

### Pilares editoriais
1. conhecimento técnico;
2. situações e problemas de oficina;
3. programação CNC;
4. cálculos e parâmetros;
5. demonstrações do Casillas;
6. materiais de estudo e evolução profissional.

### Reuso de conhecimento
Uma pesquisa técnica validada pode alimentar Guia CNC, Biblioteca, YouTube, Instagram e Casillas, mantendo uma mesma base técnica.

### Métricas
Priorizar qualidade e funil, não somente seguidores: conteúdo → landing → trial → uso → compra. Instrumentação futura depende de decisão de privacidade e escopo.

### Gate EV6
Identidade editorial, Manifesto e calendário inicial aprovados antes de uma rotina de publicação.

## 12. EV7 — Release 2.1

### Pré-condições
- funcionalidades planejadas integradas;
- QA/regressão executados;
- segurança revisada;
- conteúdo técnico aplicável validado;
- documentação atualizada;
- working tree e branches controlados.

### Gate final
Casillas 2.1 somente recebe aprovação de release após evidências e aprovação explícita de Igor. Commit, push e deploy seguem gates próprios.

## 13. Paralelismo permitido

Podem iniciar em paralelo: **EV1 + EV2 + EV3 + EV4 + EV6**.

EV5 começa após contratos de integração de EV3/EV4 estarem definidos. EV7 ocorre depois das trilhas aplicáveis.

Regra: **pesquisar em paralelo, testar em paralelo e criar conteúdo em paralelo; não modificar o mesmo código em paralelo sem coordenação.**

## 14. Branches propostas

Nenhuma branch é criada por este documento. Convenção proposta, sujeita à aprovação antes do uso:

- `casillas-2.1` — integração;
- `qa-2.1` — somente se testes exigirem arquivos versionados;
- `guia-cnc-2.1`;
- `biblioteca-2.1`;
- branches curtas de correção por achado quando necessário.

Conteúdo de Instagram/YouTube não precisa compartilhar branch com o código do aplicativo.

## 15. Critérios de parada e escalonamento

Parar e devolver à coordenação quando houver:
- conflito entre documentos/evidências;
- necessidade de segredo/credencial;
- escrita em Supabase ou produção;
- alteração destrutiva;
- divergência Git inesperada;
- mudança arquitetural fora do escopo;
- teste falhando sem causa conhecida;
- dúvida técnica que possa produzir conteúdo CNC incorreto;
- conflito de direitos autorais/licença de material.

## 16. Próximas ações

1. Revisar e aprovar este plano.
2. Preparar prompts mestres para EV1, EV2, EV3, EV4, Instagram e YouTube.
3. Confirmar conexão/instalação das ferramentas especializadas antes de atribuir trabalho.
4. Abrir trilhas paralelas sem alterações concorrentes no núcleo.
5. Manter G10.5 da versão 2.0 como operação comercial independente.
