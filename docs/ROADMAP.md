# Casillas App 2.0 — Roadmap

## Estado de referência

- Branch: `casillas-2.0`
- Commit de referência: `24475a08cf6eadd83ec3fe8623735163540e5112` — refinamento visual da Home.
- Supabase Auth, trial remoto e entitlement comercial fazem parte do fluxo cliente atual.
- O projeto Supabase informado é `Casillas`, região `sa-east-1`, plano Free. Este documento não valida estado remoto atual.
- Service Worker: `casillas-v10`.

## Arquitetura vigente

O acesso requer usuário autenticado. A aplicação consulta entitlement comercial; se não houver entitlement válido, consulta o trial remoto. `activate_casillas_license` é usado para ativar uma licença e o entitlement é consultado após o sucesso. IndexedDB não concede autorização. A licença não tem limite de aparelhos. A flag local `trial-activated` não é fonte de acesso.

Home e módulos técnicos devem permanecer desacoplados do sistema comercial.

## Próximas etapas

1. Executar teste integrado do trial com a conta de teste já existente e registrar evidências sem alterar estado comercial indevidamente.
2. Testar recarga, logout/login e erros de conectividade; testar expiração somente em ambiente/dados controlados.
3. Revisar a rastreabilidade da função `get_casillas_entitlement()`: documentar a definição remota e preparar sua representação versionada após revisão própria.
4. Revalidar grants, RLS e funções relacionadas ao acesso comercial antes de publicação.
5. Testar atualização do Service Worker `casillas-v10`, instalação PWA, cache e comportamento offline. O acesso comercial requer conectividade para autenticação e consulta do servidor.
6. Auditar futuramente `gerar-codigo.html` como ferramenta legada; mantê-la e seu pré-cache até confirmar que nenhum processo administrativo depende da URL.
7. Revisar os manuais PDF e sua integração com a interface; a presença de arquivos na pasta, por si só, não foi confirmada como mecanismo de detecção automática.
8. Avaliar publicação e pagamentos em etapas separadas, com URLs e resultados de implantação verificados no momento da execução.

## Regra de execução

Para cada etapa: definir escopo → inspecionar dependências → criar ponto de restauração quando houver mudança estrutural → implementar → testar → revisar diff e estado Git → documentar. Não inferir que uma etapa está pronta sem evidência observável.
## Princípios de desenvolvimento

1. Backend é a autoridade para identidade e acesso comercial; nunca confiar em estado editável do navegador.
2. Manter módulos técnicos desacoplados de Auth, trial, licença e pagamentos.
3. Mapear consumidores antes de alterar arquivos centrais ou APIs.
4. Fazer mudanças pequenas, rastreáveis e em escopos separados (cliente, banco, publicação).
5. Proteger secrets e validar RLS, grants e funções no escopo correspondente.
6. Não tratar resultados antigos de teste como validação atual.
7. Preservar históricos e backups; não esconder ou remover cópias sem decisão.

## Definition of Done

Uma etapa pode ser marcada como concluída quando: escopo e dependências estão documentados; implementação/diff corresponde ao pedido; verificações adequadas foram executadas; riscos de segurança e cache foram considerados; comportamento esperado foi observado; documentação foi atualizada; e o estado Git foi revisado. Commit/publicação só ocorrem quando explicitamente autorizados.

## Etapas atualizadas

- **Concluídas no cliente:** Auth integrado; trial remoto; consulta de entitlement; ativação por RPC; remoção da flag local como autorização; remoção do limite/device ID legado de `trial.js`; Home refinada.
- **Em validação:** fluxo funcional de trial e entitlement, erros/rede/expiração, atualização PWA e testes em dispositivos.
- **Rastreabilidade pendente:** definir origem versionada de `get_casillas_entitlement()` após comparar a função remota, sem presumir divergência funcional.
- **Backlog:** revisão futura de `gerar-codigo.html` e decisão sobre seu pré-cache; integração explícita dos PDFs de manuais; publicação pública e pagamentos com escopo e evidências próprios.