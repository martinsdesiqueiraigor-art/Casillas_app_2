# Casillas App 2.0

**Casillas App — Calculadora Técnica de Usinagem** é um PWA técnico para torneiros, fresadores, ferramenteiros e profissionais de usinagem. A interface e os módulos são implementados em HTML, CSS e JavaScript nativo.

> Estado documentado em 28/09/2026, branch `casillas-2.0`, marco `24475a08cf6eadd83ec3fe8623735163540e5112` (`feat: refinar Home do Casillas 2.0`).

## Produto

O Casillas reúne ferramentas de cálculo e consulta para apoiar tarefas de usinagem. A Home funciona como visão geral, apresenta o estado de acesso recebido do fluxo atual, oferece atalhos e organiza os módulos por categoria.

### Módulos

O projeto possui 12 módulos:

1. Trigonometria
2. Conicidade
3. Polígonos
4. Furação Circular
5. Roscas
6. Tolerâncias ISO
7. Potência de Corte
8. Chaveta DIN 6885
9. Conicidades Padrão
10. Programação CNC
11. Guia de Programação
12. Consultoria

Na Home, eles são agrupados em **Cálculos**, **Roscas e ajustes**, **Usinagem** e **Guias e suporte**. Os cartões encaminham para o roteador existente; os cálculos continuam nos módulos atuais.

### Descrição dos módulos

As funções abaixo resumem a finalidade registrada para cada módulo. Consulte a interface atual para detalhes de campos e resultados.

1. **Trigonometria (`trig`)** — triângulo retângulo, relações trigonométricas e diagrama.
2. **Conicidade (`coni`)** — cálculos de cone, ângulo e relação de conicidade.
3. **Polígonos (`poly`)** — propriedades geométricas de polígonos regulares.
4. **Furação Circular (`furos`)** — distribuição circular de furos e coordenadas.
5. **Roscas (`rosca`)** — consulta de padrões de rosca e cálculos associados.
6. **Tolerâncias ISO (`tol`)** — consulta de ajustes e tolerâncias dimensionais.
7. **Potência de Corte (`potencia`)** — parâmetros de corte para operações de usinagem.
8. **Chaveta DIN 6885 (`chaveta`)** — dimensões normalizadas de chavetas.
9. **Conicidades Padrão (`conicpad`)** — consulta de padrões de conicidade.
10. **Programação CNC (`prog`)** — ferramentas e referências para programação CNC.
11. **Guia de Programação (`guia`)** — consulta de ciclos CNC; os registros ficam em `dados/guia_cnc.json` e incluem comando, máquina, código, título, sintaxe e, quando disponível, parâmetros e exemplo.
12. **Consultoria (`consult`)** — informações de consultoria e canais de suporte.

A tela `home` é a entrada/catálogo e não conta como um décimo terceiro módulo.

## Acesso e arquitetura comercial

O fluxo atual é:

```text
Supabase Auth
  → entitlement comercial
  → trial do usuário, quando não há entitlement válido
  → acesso à Home e aos módulos
```

- **Supabase Auth** identifica a conta e mantém a sessão.
- **RLS** e as funções do backend protegem os dados e operações comerciais.
- **Trial:** 30 dias, vinculado à conta e controlado pelo servidor. A validade não é determinada por armazenamento local.
- **Entitlement:** representa o direito comercial retornado pelo Supabase; entitlement válido tem precedência sobre o trial.
- **Ativação:** o código é enviado à RPC `activate_casillas_license` para processamento no servidor. O cliente consulta o entitlement após a ativação.
- **Licença:** vitalícia, associada à conta autenticada e sem limite de aparelhos.

O IndexedDB permanece destinado a estado e dados locais do aplicativo. Não é autoridade de trial ou licença. O fluxo comercial não depende do antigo modelo local de ativação.

O frontend precisa de conexão para autenticar e validar o acesso comercial. O Service Worker mantém recursos do PWA em cache, mas isso não significa que a autenticação e a validação de trial/entitlement possam ser concluídas offline.

## Ferramenta legada

`gerar-codigo.html` permanece temporariamente como ferramenta administrativa/legada independente. Ela não participa do fluxo comercial normal do aplicativo e não cria nem ativa licenças no Supabase. Sua preservação e eventual remoção devem seguir a decisão registrada em documentação do marco.

## Estrutura principal

```text
index.html                 interface e navegação
auth.html                  entrada de autenticação
css/                       tema, layout e componentes
js/app.js                  inicialização e roteador de módulos
js/modules/                Home e módulos técnicos
js/calc/                   funções de cálculo
js/data/ e dados/          tabelas e dados auxiliares
js/auth.js                 integração com Supabase Auth
js/trial.js                entitlement, trial e ativação
js/db.js, js/state.js      persistência do estado do aplicativo
service-worker.js          cache do PWA (casillas-v10)
supabase/migrations/       histórico local versionado do schema
supabase/tests/            testes SQL versionados
docs/                      arquitetura, decisões, testes e marcos
manuais/                   documentação e materiais para usuários
```

## Executar localmente

Na pasta do projeto, inicie um servidor HTTP local. Por exemplo, com Python:

```powershell
Set-Location C:\Projetos\Casillas_app
python -m http.server 8080
```

Abra `http://localhost:8080`. Os módulos ES e o Service Worker precisam ser servidos por HTTP; abrir `index.html` diretamente como arquivo não reproduz o ambiente PWA.

Autenticação e verificação comercial dependem do projeto Supabase conectado. Não coloque `service_role`, senhas ou chaves secretas no frontend ou em arquivos versionados.

## PWA

O Casillas pode ser instalado por navegadores compatíveis quando servido em origem segura (HTTPS) ou em `localhost`. Abra um endereço publicado confirmado e use a opção **Instalar aplicativo** ou **Adicionar à tela inicial**; o texto varia por navegador e sistema. Não use a URL histórica de `Casillas_app` como endereço atual sem validação.

O Service Worker pré-cacheia recursos estáticos para uso offline de partes do aplicativo. Autenticação e verificação comercial dependem de conexão com o Supabase; cache não mantém a sessão nem autoriza acesso offline.

## Desenvolvimento

Antes de uma alteração, confira branch, commit e `git status --short`; preserve alterações locais e backups. Faça mudanças pequenas, valide o comportamento e os arquivos alterados, revise `git diff --check` e atualize a documentação correspondente.

**Fluxo de trabalho:** Construir → testar → corrigir → publicar → documentar.

### Manutenção de módulos e CNC

Os arquivos usam ES Modules. Ao criar um módulo técnico:

1. Implemente a interface em `js/modules/<chave>.js`, exportando `render(container)`; mantenha cálculos puros em `js/calc/` quando houver lógica matemática isolável.
2. Registre loader e título em `MODULE_LOADERS` e `MODULE_TITLES` de `js/app.js`.
3. Adicione navegação em `index.html` e estilos necessários em `css/modules.css`.
4. Inclua o recurso em `CACHE_ASSETS` de `service-worker.js` e revise a versão do cache.
5. Adicione o módulo à Home (`js/modules/home.js`) se ele precisar aparecer no catálogo.
6. Confira imports, inicialização, navegação, responsividade, acessibilidade e atualização do cache; valide a sintaxe dos JavaScripts alterados e revise o diff.

Para acrescentar ciclos ao Guia CNC, atualize o array `itens` de `dados/guia_cnc.json`. O módulo consome `comando`, `maquina`, `codigo`, `titulo` e `sintaxe`; `categoria`, `tags`, `parametros` e `exemplo` complementam pesquisa e apresentação. Valide o JSON e teste filtros e cópia de código.

## Publicação

O aplicativo é uma PWA estática e requer hospedagem HTTP; para instalação PWA use HTTPS, exceto em `localhost`. GitHub Pages, Netlify e Vercel são opções de hospedagem, não confirmação de implantação ativa. Antes de publicar, confirme projeto, domínio, branch/diretório publicado, configuração do Supabase, segurança e atualização do Service Worker. A URL pública atual do Casillas App não foi confirmada neste marco. Gerar APK por ferramenta externa depende de uma URL publicada e verificada.

## Repositório e branch

- Repositório: [martinsdesiqueiraigor-art/Casillas_app_2](https://github.com/martinsdesiqueiraigor-art/Casillas_app_2)
- Branch de desenvolvimento: [`casillas-2.0`](https://github.com/martinsdesiqueiraigor-art/Casillas_app_2/tree/casillas-2.0)
- Projeto de apresentação: [Casillas-landing](https://martinsdesiqueiraigor-art.github.io/Casillas-landing/)

O endereço público de execução do PWA não foi confirmado neste marco; use o repositório acima como fonte do código até validar a publicação.

## Documentação relacionada

Consulte [`docs/DECISOES.md`](docs/DECISOES.md), [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md), [`docs/SEGURANCA.md`](docs/SEGURANCA.md) e [`docs/MARCO-2026-09-28-HOME-E-FLUXO-COMERCIAL.md`](docs/MARCO-2026-09-28-HOME-E-FLUXO-COMERCIAL.md) para o estado detalhado.

## Histórico de versões

Este resumo preserva marcos do README anterior; não descreve a arquitetura comercial atual:

- **v1.0.0 (19/09/2026):** primeira versão registrada, com calculadoras, teclado e trial/ativação locais.
- **v1.1.0 (19/09/2026):** banner de trial, menu compacto e função de atualização.
- **v1.2.0 (20/09/2026):** ícones e menu agrupado; expansão da área de consultoria.
- **v1.3.0 (23/09/2026):** Guia CNC; registros iniciais de ciclos Siemens CYCLE97/CYCLE83 e Fanuc G76/G83; filtros, cópia de código e melhorias de consultoria/interface.
- **Casillas 2.0:** Auth, trial, licenciamento e entitlement migrados ao fluxo comercial Supabase; Home refinada no commit `24475a0`.

As proteções locais de trial, fingerprint, hash e limite de aparelhos citadas nos registros 1.x pertencem ao modelo anterior e foram substituídas; não são a autoridade comercial atual.

As versões 1.x tiveram mecanismos locais de trial/ativação que não são a segurança nem a autoridade comercial atual. Consulte [Decisões](docs/DECISOES.md) e os marcos para contexto histórico completo.