# G10.5 — Primeira venda assistida

## Objetivo

Conduzir a primeira venda real do Casillas de forma assistida, rastreável e segura, validando o processo comercial manual antes de repeti-lo para outros clientes.

Este documento complementa `docs/OPERACAO-COMERCIAL.md`. Ele não autoriza geração de licença, escrita no Supabase, envio de dados PIX ou publicação.

## Oferta vigente

- Preço normal de referência: R$ 49,90.
- Oferta promocional de lançamento: R$ 19,90.
- Pagamento único.
- Licença vitalícia vinculada à conta Casillas.
- Sem limite de aparelhos, conforme política comercial atual.
- Pagamento inicial: PIX manual.

## Regra principal

A licença só pode ser gerada e cadastrada depois de confirmar que o pagamento entrou efetivamente na conta. Comprovante enviado pelo cliente, isoladamente, não é confirmação de recebimento.

## Fase 1 — pedido do cliente

- [ ] Confirmar que o cliente quer comprar a licença Casillas pelo valor vigente.
- [ ] Confirmar o e-mail exato usado ou que será usado na conta Casillas.
- [ ] Orientar o cliente a criar/entrar na conta antes da ativação, quando necessário.
- [ ] Não solicitar senha do cliente.
- [ ] Não registrar dados pessoais além do necessário para operação e suporte.

## Fase 2 — pagamento

- [ ] Enviar os dados PIX somente em conversa privada com o cliente.
- [ ] Não colocar chave PIX ou dados bancários no Git, app, documentação pública ou landing.
- [ ] Informar o valor exato de R$ 19,90 enquanto a oferta de lançamento estiver vigente.
- [ ] Aguardar o pagamento.
- [ ] Conferir diretamente na conta de recebimento que o valor foi efetivamente creditado.
- [ ] Não avançar apenas com base em imagem ou PDF de comprovante.

### Gate A — pagamento confirmado

Somente avançar para a emissão quando o recebimento real estiver confirmado.

## Fase 3 — emissão da licença

Na raiz do repositório, preparar a licença com:

```powershell
node tools/gerar-codigo.mjs --sql
```

Antes de executar qualquer SQL:

- [ ] Confirmar que o projeto aberto no Supabase é o projeto Casillas correto.
- [ ] Conferir o código original gerado e preservar temporariamente apenas para entrega.
- [ ] Conferir o SHA-256 e o SQL preparados pelo gerador.
- [ ] Confirmar que o SQL usa o produto `casillas`.
- [ ] Confirmar que a licença será criada como `AVAILABLE`.
- [ ] Não copiar o código original para banco, documentação, commit ou mensagem pública.
- [ ] Obter autorização explícita do Igor antes da escrita remota.

### Gate B — autorização para escrita remota

Sem autorização explícita, parar aqui. Preparar o SQL não autoriza executá-lo.

## Fase 4 — cadastro no Supabase

Após autorização explícita:

- [ ] Executar somente o INSERT previamente revisado.
- [ ] Confirmar que uma única licença esperada foi criada.
- [ ] Confirmar status `AVAILABLE`.
- [ ] Confirmar que o banco contém o hash, não o código original.
- [ ] Se houver resultado inesperado, parar e não entregar o código.

## Fase 5 — entrega e ativação

- [ ] Enviar ao cliente somente o código original da licença pelo canal privado acordado.
- [ ] Orientar: entrar no Casillas → Ativar com código → informar o código.
- [ ] Acompanhar a primeira ativação de forma assistida.
- [ ] Confirmar que o app mostra `Licença ativa`.
- [ ] Confirmar que a conta consegue acessar os módulos normalmente.
- [ ] Não pedir nem receber a senha do cliente.

### Gate C — ativação confirmada

A primeira venda só é considerada operacionalmente concluída depois da confirmação de `Licença ativa`.

## Fase 6 — pós-venda

- [ ] Confirmar com o cliente que login e acesso aos módulos estão normais.
- [ ] Registrar a venda sem armazenar código original, chave PIX, senha ou segredo administrativo.
- [ ] Registrar data, valor, situação da ativação e referência mínima do cliente necessária ao suporte.
- [ ] Registrar qualquer erro, dúvida ou etapa confusa observada durante a primeira venda.
- [ ] Corrigir o procedimento antes de escalar para novas vendas, se surgir falha relevante.

## Critérios de parada

Interromper o processo se ocorrer qualquer uma destas situações:

- pagamento não confirmado diretamente na conta;
- e-mail/conta do cliente incerto;
- projeto Supabase incorreto ou duvidoso;
- SQL diferente do esperado;
- código exposto antes da entrega;
- divergência entre código e hash;
- licença não criada como `AVAILABLE`;
- erro inesperado durante ativação;
- necessidade de alteração de schema, função, RLS ou arquitetura;
- necessidade de usar credencial administrativa no frontend;
- ausência de autorização para uma escrita remota.

Em caso de código exposto antes da entrega, não reutilizá-lo. Seguir o procedimento de incidente de `docs/OPERACAO-COMERCIAL.md`.

## Registro mínimo da primeira venda

Registrar apenas o necessário para rastreabilidade operacional:

- data da venda;
- valor recebido;
- e-mail da conta Casillas ou identificador operacional mínimo;
- confirmação de pagamento;
- confirmação de licença cadastrada;
- confirmação de ativação;
- resultado do pós-venda;
- incidentes, se existirem.

Não registrar código original da licença, senha do cliente, chave PIX, dados bancários sensíveis, `service_role` ou outros segredos.

## Critério de conclusão do G10.5

G10.5 poderá ser considerado concluído quando a primeira venda real percorrer o fluxo aprovado, o pagamento estiver confirmado, a licença estiver ativa na conta correta, o pós-venda estiver verificado e as evidências operacionais não revelarem bloqueador crítico.

A preparação deste checklist, por si só, não conclui G10.5 e não autoriza a primeira venda.
