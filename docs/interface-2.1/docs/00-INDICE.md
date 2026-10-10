# Casillas 2.1 — Documentação do novo app

Estado: **rascunho para aprovação do Igor**. Nada aqui vale até ser aprovado.

## Como usar

Esta pasta é a fonte de verdade para **produto, interface, Guia CNC, Consultor e idiomas** do Casillas 2.1.
A parte de **segurança, banco e operação comercial** continua nos documentos atuais do repositório e **não é reescrita aqui**:

| Assunto | Onde está |
|---|---|
| Regras de agente, Git, escopo, Supabase | `AGENTS.md` |
| Trial, licença, entitlement, lease offline | `docs/DECISOES.md`, `docs/BANCO-DADOS.md` |
| Segurança | `docs/SEGURANCA.md` |
| Venda e licença manual | `docs/OPERACAO-COMERCIAL.md`, `docs/PRIMEIRA-VENDA.md` |
| Estado atual do 2.0 | `docs/STATUS.md` (precisa de atualização, ver 01) |

Se um documento desta pasta contradizer um dos acima em tema comercial ou de segurança, **vale o documento atual** e o conflito vira pendência em `01-DECISOES-2.1.md`.

## Documentos

1. `01-DECISOES-2.1.md` — decisões já tomadas, decisões em aberto e o que cada uma destrava.
2. `02-PRODUTO-E-NAVEGACAO.md` — o que o app é hoje, o que muda e como se navega.
3. `00-ESTADO-ATUAL.md` — onde o trabalho está, próximos passos e pendências. Ler primeiro.
4. `CHECKLIST-TELAS.md` — status de cada tela e o arquivo HTML dela.
5. `REGRAS-DE-TRABALHO.md` — como trabalhamos (pedir antes de gerar, uma tela por vez).
6. Próximos (ainda não escritos): sistema visual, formato do Guia CNC 2.0, Consultor, idiomas PT/EN.

## Regras de escrita

- Uma ou duas páginas por documento.
- Toda afirmação sobre o código cita o arquivo. Sem fonte, não entra.
- O que não foi decidido fica como **A definir**. Ninguém escolhe por omissão.
- Conteúdo técnico de usinagem tem estado: `rascunho` ou `revisado`.
