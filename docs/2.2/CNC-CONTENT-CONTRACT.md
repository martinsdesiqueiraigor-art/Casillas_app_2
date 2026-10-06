# Contrato de conteúdo CNC: Guia e aplicação

Status: contrato futuro sobre os quatro registros EV3, sem alterar conteúdo. [Fontes](SOURCE-REVISION-CONTRACT.md).

## Identidade e estado herdado

O runtime canônico é `js/modules/guia/bancoCiclosCNC.js`, com deepFreeze. `dados/guia_cnc.json` é a fonte legada preservada para paridade; não deve virar segundo banco editável independente.
Guia e resolver já consomem o banco canônico; `toLegacy` deriva a apresentação antiga. `Cycle` contém `meta`, `contexto`, `abas`, `defaultTarget`. `GuiaManager` valida ID/alias/tab/acordeão.

| cycleId preservado | Alias |
| --- | --- |
| `fanuc_torno_g76` | `fanuc-g76` |
| `fanuc_centro_de_usinagem_g83` | `fanuc-g83` |
| `siemens_torno_cycle97` | `siemens-cycle97` |
| `siemens_centro_de_usinagem_cycle83` | `siemens-cycle83` |

Quatro ciclos são o núcleo homologado estruturalmente, não limite permanente nem certificação técnica nova. EV3 preservou sintaxe/parâmetros/exemplos por paridade; fonte primária, revisão e variantes específicas ainda não constam do tipo atual.

## Guia CNC x Programação CNC

**Guia: como o ciclo funciona. Programação: como aplicar o ciclo no programa.** Um cycleId mantém uma única identidade técnica nos dois contextos. Guia detém sintaxe, parâmetros, aplicação, controle, máquina, operação, explicação, alertas, exemplo, trajetória didática e referências validadas. Programação detém inputs, valores de calculadoras, seleção de template e saída aplicada, com retorno ao Guia.

Hoje `prog.js` chama seis funções de `calc/gcode.js`: `gcodeFurosCirculares`, `gcodeRoscamento`, `gcodeDesbaste`, `gcodeCanal`, `gcodeRoscaMultipla`, `macroFuros`. Subabas: furos, rosca, desbaste, canal, rmult, macro. Há geração, cópia e compartilhamento; nenhum consumo do banco do Guia ou fontes/revisões associadas.
O gerador contém G83/G81, G76, G71/G70, G75, G92 e Macro B. **G71/G70/G75 existentes são herança funcional, não ciclos novos desta missão nem registros homologados do Guia.** Não remover, corrigir, ampliar ou promover esses templates por inferência. Sua futura incorporação canônica requer missão EV3 técnica específica; até lá, a cobertura legada fica separada e registrada, sem novo banco técnico.
Não considerar automaticamente o G76/G83 do gerador equivalentes aos registros do Guia. A vinculação depende de revisão de sintaxe, parâmetros, unidades e contexto de controle/máquina. Nenhuma divergência matemática/técnica foi confirmada nesta inspeção; a correção, se necessária, é outra missão.

## Extensão compatível do conteúdo

Preservar `meta.id` como cycleId, aliases, abas e defaults. Futuras extensões opcionais: `sourceRefs` (sourceId + revisão exata + localização), `technicalReview`, `variants`, `applicationRefs`. ApplicationRef aponta template homologado por ID/revisão, sem copiar catálogo técnico.
Metadados legados ausentes continuam ausentes e explicitamente apresentados como proveniência pendente; não preencher nomes/datas de revisão fictícios. Renderer não exibe seção vazia nem transforma ausência em aprovação.

Contrato futuro de aplicação: `templateId`, `templateRevision`, `cycleId`, `cycleRevision` quando houver revisão registrada, `variantId` opcional, entradas tipadas com unidades/limites, mapeamento explícito de parâmetros, `sourceRefs`, status e evidência de homologação. Sem template homologado não há nova geração para esse ciclo; oferecer consulta no Guia. O exemplo do Guia é didático e não vira template executável automaticamente.

## Variantes reais

Cada variante pertence ao cycleId existente: `variantId` estável e único nesse ciclo, `variantLabel`, `controllerFamily`, `controllerModel` quando documentado, `machineType`, `differences`, `sourceRefs`, `technicalReview`. `differences` registra parâmetro/sintaxe/comportamento afetado e descrição sustentada pela fonte; não aplica patch textual opaco a G-code.
Família/máquina mapeiam `meta.controlador/maquina`; modelo desconhecido fica ausente, sem default inventado. Não criar “0i-TF Sistema A” a partir de mockup. `variants` ausente ou vazio mantém a UI herdada sem seletor. Apenas variantes reais validadas podem ser selecionadas, inclusive por URL.
Variante muda contexto técnico, não cycleId já publicado. Não selecionar silenciosamente a primeira quando a aplicação depende de variante; pedir contexto ou informar limitação. Alterar variante invalida aplicação gerada incompatível.

## Expansão por missão EV3

1. Receber escopo, fonte primária, controle/máquina e direitos de uso.
2. Revisar identidade/aliases, operação, sintaxe, unidades, variantes e alertas com validação técnica explícita.
3. Estender o banco/adapter/renderers/resolver existentes e seus contratos somente na missão autorizada.
4. Provar defaults/links, unicidade, paridade dos quatro herdados, no_match e ambiguidade. Validar template separadamente quando houver aplicação.
5. Registrar revisão/evidência e política offline antes de disponibilizar conteúdo.

O validator atual permite apenas fanuc/siemens, torno/centro_de_usinagem, operações rosca/furacao e três tipos de aba; portanto extensão de vocabulário não é só adicionar JSON. Exige revisão coordenada de `types.d.ts`, `validateBank`, slots/resolver, renderers e testes, sem recriar os componentes.
Não alterar o teste do núcleo de quatro para acomodar conteúdo sem validação. Adição futura autorizada precisa manter invariantes e atualizar expectativas com justificativa.
Nenhum G71/G70/G74/G75/G76 adicional/CYCLE95 ou outro ciclo/variante entra por este contrato. Trajetória visual só com conteúdo validado; tipo `visual_canvas` existente não comprova que há diagrama técnico homologado.
