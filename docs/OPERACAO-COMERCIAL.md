# Operação comercial — licenças Casillas

## Objetivo

Este procedimento descreve a Camada 1 da operação manual de licenças do Casillas. O gerador é local e não faz parte do aplicativo publicado.

## Princípios de segurança

- O código original da licença é entregue ao cliente e não é armazenado no banco.
- O banco recebe somente o SHA-256 hexadecimal do código normalizado.
- Não colocar `service_role`, senha, token administrativo ou segredo no frontend, no script ou no Git.
- Não publicar `tools/gerar-codigo.mjs` como recurso do PWA nem adicioná-lo ao Service Worker.
- Toda escrita no Supabase continua sendo uma ação administrativa explícita.

## Gerar uma licença

No terminal, a partir da raiz do repositório:

```powershell
node tools/gerar-codigo.mjs
```

O comando gera um código aleatório localmente e mostra seu SHA-256. Ele não altera o Supabase.

Para também preparar o SQL administrativo:

```powershell
node tools/gerar-codigo.mjs --sql
```

O SQL usa o produto ativo com slug `casillas` e cria a licença com status `AVAILABLE`.

## Cadastrar no Supabase

1. Confirme que o projeto aberto é o projeto Casillas correto.
2. Gere uma licença com `node tools/gerar-codigo.mjs --sql`.
3. Guarde temporariamente o código exibido para entrega ao cliente.
4. Revise o SQL exibido antes de executá-lo.
5. Execute o INSERT manualmente no SQL Editor do Supabase.
6. Confirme que a linha retornada está com status `AVAILABLE`.
7. Não grave o código original em tabelas, documentação, commits ou mensagens públicas.

## Entregar e ativar

Envie somente o código original ao cliente pelo canal comercial acordado. No app, o cliente usa **Ativar com código**. A ativação normaliza o código, calcula SHA-256 e procura uma licença `AVAILABLE`. Após sucesso, a licença passa a `ACTIVE` e o entitlement da conta é criado.

## Conferência operacional

Antes da entrega, confirme que:
- o INSERT retornou uma licença;
- o status é `AVAILABLE`;
- o código entregue corresponde ao hash cadastrado;
- nenhum segredo administrativo foi copiado para arquivos do projeto.

Após a ativação, confirme pelo fluxo normal do app que a conta apresenta **Licença ativa**.

## Incidentes

Se um código for exposto antes da entrega, não o reutilize. Revogue ou descarte a licença conforme o procedimento administrativo vigente e gere outro código. Não tente corrigir manualmente o hash do cliente.

## Escopo

Esta é a Camada 1 manual. Automação por Edge Function ou gateway de pagamento permanece fora do escopo atual do G5.
