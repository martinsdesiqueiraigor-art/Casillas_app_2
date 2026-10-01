# Casillas 2.0

Calculadora técnica de usinagem em formato PWA, feita para torneiros, fresadores, ferramenteiros e outros profissionais da área. Reúne cálculos locais, tabelas de consulta, ferramentas CNC e guias de apoio.

## Produto

O aplicativo contém 12 módulos técnicos: trigonometria, conicidade, polígonos, furação circular, roscas, tolerâncias ISO, potência de corte, chaveta DIN 6885, conicidades padrão, programação CNC, guia CNC e consultoria. As calculadoras executam no navegador; não dependem de servidor para fazer os cálculos.

## Arquitetura e acesso

HTML, CSS e JavaScript nativo implementam a interface, navegação e cálculos. Supabase Auth identifica o usuário; as RPCs do Supabase consultam entitlement, consultam/iniciam trial e ativam licença. O servidor é a autoridade comercial. O trial tem 30 dias e a licença comercial documentada é vitalícia, associada à conta e sem limite de aparelhos.

A investigação remota confirmou o fluxo comercial operacional. Há schema drift conhecido: o wrapper público remoto de ativação não está representado nas migrations locais, embora sua implementação privada esteja versionada. Detalhes e limites da confirmação estão em [Banco de dados](docs/BANCO-DADOS.md).

O manifest configura início em `./index.html`, escopo `./` e modo `standalone`. O Service Worker `casillas-v10` pré-cacheia recursos e usa fallback de navegação offline. Recursos em cache podem abrir offline, mas a autenticação e a validação do acesso comercial usam Supabase; restauração de sessão e acesso a módulos após autenticação em cenário offline não estão validados.

## Desenvolvimento

Sirva a pasta por HTTP, por exemplo `python -m http.server 8080`, e abra `http://localhost:8080`. Não abra `index.html` como arquivo local. O projeto não possui `package.json` na raiz. Não inclua segredos server-side no cliente.

## Estado atual

Branch principal de desenvolvimento: `casillas-2.0`. A última referência local examinada é `629ebe3` (29/09/2026); documentação e histórico registram publicação PWA no GitHub Pages. Isso não equivale a uma nova checagem do site ou do Supabase remoto. Validação integrada de Auth/comercial, offline autenticado e cenários de RLS/entitlement seguem pendentes ou dependem de ambiente controlado.

Este repositório não inclui mais a ferramenta legada `gerar-codigo.html`. A geração local de códigos/hashes e o antigo modelo de 3 aparelhos não fazem parte da arquitetura comercial atual.

## Documentação

- [Arquitetura](docs/ARQUITETURA.md): componentes, fluxo de acesso e PWA.
- [Banco de dados](docs/BANCO-DADOS.md): tabelas, migrations, funções e RLS.
- [Segurança](docs/SEGURANCA.md): controles existentes, riscos e hardening pendente.
- [Testes](docs/TESTES.md): cobertura e evidências, com seus limites.
- [Progresso](docs/PROGRESSO.md), [Roadmap](docs/ROADMAP.md) e [status](docs/status-casillas-2.0.md).
- [Decisões](docs/DECISOES.md) e [mapa de dependências](docs/MAPA-DEPENDENCIAS.md).

Os marcos datados em `docs/` são registros históricos preservados; discrepâncias com o código atual estão descritas nos documentos de estado.
