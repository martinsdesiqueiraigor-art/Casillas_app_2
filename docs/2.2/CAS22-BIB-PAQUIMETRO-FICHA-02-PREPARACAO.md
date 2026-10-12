# CASILLAS 2.2 — Preparação da segunda ficha da Biblioteca

ID: CAS22-BIB-FICHA-02-PREP
Estado: PREPARAÇÃO / NÃO HOMOLOGADO
Assunto: Paquímetro
Categoria: Metrologia e medição

## Decisão de escopo

A Biblioteca já possui o assunto `paquimetro` como `planned` em `js/modules/biblioteca/data.js`. Não mudar para `available` nem cadastrar `sheetId` até a ficha estar completa e revisada. A ficha de Micrômetro externo continua demonstrativa e não constitui fonte normativa.

## Estrutura proposta para revisão

- Identificação: título, aplicação, categoria, versão, responsável, data e estado.
- Visão geral: definição, partes e limites de aplicação, com referências rastreáveis.
- Utilização: preparação, seleção da superfície de medição, leitura conforme o modelo, registro e verificação.
- Cuidados: erros comuns, condições ambientais, conservação e limitações.
- Fontes e revisão: manual de fabricante/modelo, documentos normativos aplicáveis, trechos/localizadores, revisor e histórico.
- Exemplos de perguntas ao Consultor: uso para medidas internas; diferença entre profundidade e medida externa; erros de posicionamento.

## Critérios obrigatórios antes de publicar a ficha

1. Vincular pelo menos uma fonte documental real, identificada e verificável.
2. Não fixar resolução, exatidão, incerteza, tolerâncias nem método de calibração sem a fonte do instrumento/modelo.
3. Submeter afirmações técnicas à revisão humana independente.
4. Registrar versão e evidência da revisão, mantendo `reviewState` coerente com o processo.
5. Habilitar `sheetId` e `status: available` somente após a ficha existir e passar pelos testes de rotas e busca.
6. Não declarar `verified: true` em ações relacionadas sem evidência específica; não criar associação CNC por semelhança de termos.

## Estado de integração

Consultor → Biblioteca: infraestrutura funcional e validada no smartphone para a ficha atual.
Biblioteca → Calculadoras: mecanismo de links explícitos disponível; nenhum vínculo do Paquímetro autorizado.
Biblioteca → Guia CNC: não habilitado sem alvo de ciclo/controle comprovado.

Este documento é uma preparação editorial e técnica, não uma ficha homologada e não altera o conteúdo publicado no aplicativo.
