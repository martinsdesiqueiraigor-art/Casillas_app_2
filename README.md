# Casillas — baseline 2.1.0 / desenvolvimento 2.2

PWA de usinagem com cálculos locais, consulta CNC e acesso comercial protegido.
**Produção homologada:** Casillas 2.1.0, tag v2.1.0, SHA 1b3082e7ca82bb669180402cf419a56e51af374a.
A branch casillas-2.0 e a tag são referências estáveis; casillas-2.2 é desenvolvimento isolado, sem novo deploy.

## Estado atual

Vanilla JS / ES Modules. package.json e lockfile existem; ferramentas de desenvolvimento usam npm ci.
CI e Production Gate estão implementados, com deploy Pages manual por SHA e aprovação humana do environment.
O PWA publicado não depende de node_modules.

Supabase comercial atual: Auth/RPCs server-side, validade/revogação, rate limiting, lease offline e RLS; 14 migrations canônicas alinhadas.
Service Worker casillas-v13. Offline autenticado e PWA instalado foram validados; teste físico Android/offline real homologado pela Coordenação.
Primeiro login e nova autorização comercial continuam dependendo da validação online.

Consultor Técnico e Guia CNC 2.0 existem e cooperam com o carregador atual.
Consulta “rosca torno fanuc” abre fanuc_torno_g76; quatro ciclos legados, nenhum conteúdo CNC novo.
Consultoria legada mantém consult; Consultor usa consultor-tecnico.
Telemetria estruturada e feedback usam outbox com ownership e sync protegido; preservam a experiência CNC local.

## Desenvolvimento 2.2

Use C:\Projetos\Casillas_2.2_DEV e casillas-2.2. Preserve a pasta oficial 2.1 e a tag congelada.
Sirva por HTTP, por exemplo python -m http.server 8080; não abra index.html como arquivo local.
npm run test:ev3 executa a verificação focalizada existente. Testes SQL somente em Supabase local descartável autorizado.
Redesign/UX por retrofit progressivo, sem rewrite/framework novo; Design System e pilotos antes de escalar.
Alterações funcionais e produção exigem missões específicas; este commit é exclusivamente documental.

## Leitura obrigatória

- [Release 2.1.0](docs/RELEASE-2.1.0.md): SHA, deployment, evidências e limites.
- [Baseline 2.1](docs/BASELINE-2.1.md): arquitetura que já existe e não deve ser recriada.
- [Handoff 2.1 → 2.2](docs/HANDOFF-2.1-TO-2.2.md): isolamento e princípios congelados.
- [Contrato dos agentes](AGENTS.md) e [Changelog](CHANGELOG.md).

## Registro HISTÓRICO — README anterior

O texto abaixo foi preservado como registro de estados anteriores. Referências antigas de SHA, cache,
ausência de package.json, drift ou testes pendentes não descrevem a baseline homologada acima.

---
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
