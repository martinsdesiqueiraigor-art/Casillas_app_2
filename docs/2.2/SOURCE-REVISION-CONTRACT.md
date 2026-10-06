# Contrato de fonte e revisão técnica

Status: modelo documental futuro; nenhum cadastro de fonte ou revisão criado nesta missão.

## Modelo mínimo

Fonte identifica uma referência externa/interna; revisão técnica registra a avaliação do conteúdo do Casillas contra essa referência. Versão do documento não é versão do app nem data de deploy.

| Campo | Regra |
| --- | --- |
| `sourceId` | ID estável único, não URL nem título mutável |
| `title` | Título da fonte |
| `origin`, `author` | Instituição/origem e autor quando conhecido; desconhecido explícito |
| `documentRef` | Identificação do manual/norma/documento, seção/página quando conhecida |
| `sourceVersion`, `sourceRevision` | Edição/versão e revisão do documento, sem inferência |
| `reviewDate` | Data ISO `YYYY-MM-DD` da revisão técnica efetivamente realizada; ausente se não houve |
| `technicalStatus` | Estado descrito abaixo |
| `note` | Limitações, lacunas e escopo da avaliação |
| `url` | Opcional; referência de consulta quando existente, HTTPS validado |
| `usageRights` | Situação dos direitos e permissão necessária para o uso pretendido |

Revisão do conteúdo: `contentRevision` (identificador imutável por item/ciclo), `reviewedBy` (responsável real), `reviewDate`, `technicalStatus`, `sourceRefs`, `scope`, `evidenceRef` (missão/registro de validação). `sourceRefs` usa `{sourceId, sourceRevision, locator}`; revisão da fonte pode permanecer desconhecida apenas no legado/rascunho, com nota. Conteúdo novo aprovado exige referência precisa suficiente para reproduzir a revisão.
Não confundir SHA de migração estrutural com revisão técnica. Datas de cadastro não preenchem reviewDate.

## Status e fluxo

| Status | Significado / disponibilidade |
| --- | --- |
| `legacy_unreviewed` | Conteúdo herdado com paridade estrutural, sem revisão técnica nova; preservar comportamento 2.1 e indicar limite ao apresentar metadados |
| `draft` | Material em preparação, fora do catálogo público |
| `in_review` | Fonte/escopo em avaliação, sem nova disponibilização técnica |
| `validated` | Revisão explícita com responsável, data, fonte e evidência; somente escopo indicado |
| `superseded` | Revisão substituída, vínculo à sucessora; não apagar identidade/histórico |
| `withdrawn` | Conteúdo retirado mediante missão própria; apresentar indisponibilidade e orientação segura |

Transições são documentadas por missão, nunca calculadas por relógio local. Não atribuir `validated` aos quatro ciclos somente por existência em produção. Homologação estrutural EV3 e validação técnica são evidências diferentes. A classificação futura não remove conteúdo legado nesta missão.
Mudança de sintaxe, parâmetros ou aplicação requer nova contentRevision e avaliação dos consumidores/templates; correção apenas editorial registra o escopo e não simula nova homologação CNC. Links por ID permanecem estáveis; aplicação registra a revisão consumida para detectar incompatibilidade.

## Fonte técnica e conteúdo copiado

Citar/consultar uma fonte não autoriza reproduzir manual, norma, tabela, desenho ou página. `usageRights` registra `status` (`unknown`, `reference_only`, `permitted`, `restricted`), `holder`, `licenseRef` ou `permissionRef`, `allowedUses` (link, resumo original, trecho autorizado, redistribuição, offline), `note` e eventual validade documentada.
Com direitos desconhecidos, não copiar nem disponibilizar arquivo offline por pressuposição. Preferir referência e explicação original validada; trecho/arquivo exige evidência de permissão para aquele uso. Informação sobre direitos da fonte não equivale ao entitlement comercial do aplicativo.
Este modelo registra evidências; não emite parecer jurídico ou presume direitos sobre normas/manuais. Avaliação de direito de reprodução necessária fica na missão do conteúdo específico.

## Apresentação e integridade

Guia mostra referência resumida e revisão vinculada; Biblioteca mostra registro documental completo. Não manter duas fichas divergentes: consumidores usam sourceId/revisão. Na ausência da Biblioteca, a referência local deve continuar disponível no Guia.
Campos ausentes são apresentados como não informados, sem placeholders que pareçam dados reais. URLs não viram HTML; aceitar protocolos permitidos, sem scripts, dados embutidos ou redirecionamentos arbitrários. Não inserir tokens de acesso em URLs ou documentos versionados.
Validar unicidade, relações, datas, revisões e direitos antes de disponibilizar novo conteúdo. Manter metadados mínimos offline com os conteúdos locais para permitir rastreabilidade sem rede.
