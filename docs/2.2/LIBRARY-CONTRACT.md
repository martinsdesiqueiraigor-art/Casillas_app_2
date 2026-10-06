# Contrato da Biblioteca Técnica V1

Status: módulo futuro; não há loader de Biblioteca em `js/app.js`. Nenhum item/arquivo técnico é adicionado nesta missão.

## Papel e modelo

Biblioteca é autoridade documental; não recalcula valores nem define um banco CNC alternativo. Guia permanece autoridade CNC, calculadoras executam motores, Programação aplica templates e Consultor descobre/encaminha.

| Campo | Contrato |
| --- | --- |
| `id` | documentId estável único |
| `title`, `description` | Título e descrição úteis à descoberta |
| `category`, `domain` | Vocabulário cadastrado na missão V1; não inferir classificação CNC |
| `sourceRefs` | sourceId/revisão/localização do [modelo comum](SOURCE-REVISION-CONTRACT.md) |
| `author`, `origin` | Autor/origem reais ou ausência explícita |
| `version`, `revision`, `date` | Versão do item, revisão e data correspondentes, distintas da edição da fonte e da reviewDate |
| `technicalReview` | Status, escopo, responsável/data/evidência conforme contrato comum |
| `usageRights` | Direitos para a representação do item; referência à permissão sem duplicar texto de licença divergente |
| `representation` | `local_original`, `authorized_asset` ou `external_reference`; caminho/URL validado |
| `offlinePolicy`, `offlineAvailability` | Classe pretendida e estado observado, separados |
| `relations` | IDs existentes de ciclos, calculadoras, aplicações e operações reconhecidas pelo Consultor |

Relações mínimas opcionais: `cycleIds`, `calculatorIds`, `applicationRefs` (templateId/revisão/cycleId quando homologados), `consultorOperationIds`. Arrays vazios não criam ações. Validar integridade no catálogo/registro de módulos/banco canônico; jamais relacionar pelo título ou por código isolado G76.
O item pode ser referência ao manual, resumo original validado ou material autorizado. Não precisa hospedar PDF; um link sem descrição/contexto útil não basta para a V1.
Biblioteca referencia explicação/sintaxe do Guia em vez de duplicá-las. Guia referencia sourceId/documentId; não depende da aba Biblioteca ativa para renderizar os quatro ciclos herdados.

## Navegação, descoberta e gate de ativação

Filtros por categoria/domínio e busca local devem operar apenas nos itens disponíveis. Detalhe mostra origem, versão/revisão, direitos, estado offline e relações úteis. Consultor só oferece Biblioteca por relação real, sem supor que o resolver CNC atual indexa documentos.
Botões abrir Guia/Calculadora/Programação seguem [ações](DOMAIN-INTEGRATION-CONTRACT.md). Documento desconhecido retorna estado seguro; referência externa sem rede informa necessidade de conexão, mantendo metadados locais disponíveis.

Ativar a aba somente quando a missão V1 entregar e a Coordenação aceitar: pelo menos uma coleção coerente com utilidade técnica demonstrada, cada item público com fonte/status/direitos compatíveis, conteúdo acessível, relações validadas e cenários online/offline/erro verificados. Não basta loader, mockup ou quantidade arbitrária de PDFs. Registrar coleção e evidência de aceite na missão F4. Até lá, sem aba vazia publicada.
Direitos desconhecidos bloqueiam cópia/redistribuição, não justificam preencher permissão fictícia. Conteúdo novo técnico público exige revisão adequada; material herdado não recebe aprovação retroativa automática.

## Offline

| Classe | Conteúdo previsto | Comportamento futuro |
| --- | --- | --- |
| `required` — obrigatório offline | Motores e dados locais essenciais, quatro ciclos herdados, Consultor local, metadados/fonte ligados a eles | Preservar baseline e rastreabilidade sem rede, sujeito ao acesso existente |
| `preferred` — preferencialmente offline | Resumos V1 e assets pequenos com direitos para armazenamento | Disponibilização seletiva após validação de tamanho/direitos; informar download real |
| `on_demand` — online sob demanda | Arquivos extensos e referências externas | Não precachear; sem rede mostrar limite e metadados |

`offlineAvailability`: `not_stored`, `available`, `stale`, `unavailable`; disponibilidade só afirma bytes/revisão efetivamente locais. Política não é prova de download. Registrar revisão/tamanho esperado e permissão antes de cachear assets, controlar orçamento e invalidar versão substituída em missão própria.
Não baixar biblioteca inteira nem alterar Service Worker nesta F0. Futuro cache usa infraestrutura existente após missão autorizada; sem novo mecanismo de licença, nova outbox ou IndexedDB paralelo. Metadados/documentos não carregam dados pessoais, perguntas ou credenciais.
