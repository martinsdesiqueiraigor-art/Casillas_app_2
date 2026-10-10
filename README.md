# Casillas

Calculadora técnica de usinagem em formato PWA, feita para torneiros, fresadores, ferramenteiros e outros profissionais da área. Reúne cálculos locais, tabelas de consulta, ferramentas CNC e guias de apoio.

## Produto

O aplicativo contém 12 módulos técnicos: trigonometria, conicidade, polígonos, furação circular, roscas, tolerâncias ISO, potência de corte, chaveta DIN 6885, conicidades padrão, programação CNC, guia CNC e consultoria. As calculadoras executam no navegador; não dependem de servidor para fazer os cálculos.

## Arquitetura e acesso

HTML, CSS e JavaScript nativo implementam a interface, navegação e cálculos. Supabase Auth identifica o usuário; as RPCs do Supabase consultam entitlement, consultam/iniciam trial e ativam licença. O servidor é a autoridade comercial. O trial tem 30 dias e a licença comercial documentada é vitalícia, associada à conta e sem limite de aparelhos.

A investigação remota confirmou o fluxo comercial operacional. O wrapper público de ativação está versionado na migration `20260930213346_add_public_activate_casillas_license_wrapper.sql`. Detalhes e limites da confirmação estão em [Banco de dados](docs/BANCO-DADOS.md).

O manifest configura início em `./index.html`, escopo `./` e modo `standalone`. O Service Worker (`casillas-v20` na produção atual) pré-cacheia recursos e usa fallback de navegação offline. Recursos em cache podem abrir offline, mas a autenticação e a validação do acesso comercial usam Supabase; restauração de sessão e acesso a módulos após autenticação em cenário offline não estão validados.

## Desenvolvimento

Sirva a pasta por HTTP, por exemplo `python -m http.server 8080`, e abra `http://localhost:8080`. Não abra `index.html` como arquivo local. `package.json` e `package-lock.json` existem na raiz (ferramentas de teste e CI usam `npm ci`); o PWA publicado não depende de `node_modules`. Não inclua segredos server-side no cliente.

## Estado atual

`casillas-2.0` é a referência de produção (`c115a3e` em 2026-10-10). A frente **CAS-UI** (modernização da interface) está documentada em [docs/interface-2.1/](docs/interface-2.1/README.md); o estado e a próxima atividade ficam em [00-ESTADO-ATUAL](docs/interface-2.1/docs/00-ESTADO-ATUAL.md). A tag `v2.1.0` é a release anterior à CAS-UI. A linha `casillas-2.2` é preservada e está pendente de integração. Instruções para agentes de IA: [AGENTS.md](AGENTS.md) e [CLAUDE.md](CLAUDE.md). Este texto não equivale a uma nova checagem do site ou do Supabase remoto.

Este repositório não inclui mais a ferramenta legada `gerar-codigo.html`. A geração local de códigos/hashes e o antigo modelo de 3 aparelhos não fazem parte da arquitetura comercial atual.

## Documentação

- [Arquitetura](docs/ARQUITETURA.md): componentes, fluxo de acesso e PWA.
- [Banco de dados](docs/BANCO-DADOS.md): tabelas, migrations, funções e RLS.
- [Segurança](docs/SEGURANCA.md): controles existentes, riscos e hardening pendente.
- [Testes](docs/TESTES.md): cobertura e evidências, com seus limites.
- [Progresso](docs/PROGRESSO.md) (histórico), [Roadmap](docs/ROADMAP.md) e [Status](docs/STATUS.md).
- [Decisões](docs/DECISOES.md) e [mapa de dependências](docs/MAPA-DEPENDENCIAS.md).

Os marcos datados em `docs/` são registros históricos preservados; discrepâncias com o código atual estão descritas nos documentos de estado.
