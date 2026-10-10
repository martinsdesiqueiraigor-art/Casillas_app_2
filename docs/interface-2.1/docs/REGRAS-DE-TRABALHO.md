# Regras de trabalho com o Claude (DOCUMENTO HISTÓRICO)

> **Histórico, sem autoridade.** Substituído em 2026-10-10 (CAS-DOC-RECONCILIACAO-01). As regras oficiais estão em `AGENTS.md` (autorizações §14, hierarquia §15, núcleo protegido §16) e `CLAUDE.md` (protocolo de sessão). Em particular, as regras de commit e push abaixo foram substituídas por CAS-UI-D21 (veja `01-DECISOES-2.1.md`). Mantido apenas para registro.

Definidas pelo usuário. Valiam para as sessões do projeto Casillas 2.1 até 2026-10-10.

## Como trabalhar
1. Antes de qualquer proposta, ler `00-ESTADO-ATUAL.md` e o checklist de telas.
2. Não gerar telas, arquivos ou código sem pedir antes. A geração só começa com autorização do usuário ("pode gerar" ou equivalente).
3. Antes de gerar, descrever em uma ou duas linhas o que vai ser feito.
4. Uma tela por vez. Esperar a aprovação antes da próxima, para evitar retrabalho.
5. Melhorar sobre os protótipos aprovados e as imagens de referência do usuário. Não recriar a partir do código da v2.
6. Trabalhar em cópias. Os protótipos originais ficam intactos.
7. Ao fim de cada tela aprovada, atualizar o estado e o checklist no Project.
8. Dizer quando algo não foi verificado. Não afirmar que uma tabela, regra ou arquivo existe sem conferir.

## Segurança e repositório
- Não enviar `.env`, `node_modules`, `supabase/.temp`, `.git`, chaves, códigos de licença reais nem dados de clientes.
- Auditoria do Supabase somente leitura. Nenhuma migration sem revisão do usuário.
- Sem commit, push ou deploy sem autorização explícita (AGENTS.md). Commit local foi autorizado. Push só com "autorizo push", para branch nova, nunca `casillas-2.0`.

## Padrões de interface
- Tema escuro, laranja `#ff7a1a` e azul `#4aa3ff`, PT-BR com inglês.
- Sem emoji. Ícones SVG de um conjunto único.
- Alvos de toque de 48 px ou mais.
- Cor nunca é a única indicação de estado: sempre vem com texto.
- Todo ciclo do Guia sem revisão técnica mostra "Em revisão técnica" visível.
