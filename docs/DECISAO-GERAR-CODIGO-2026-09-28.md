# Decisão — gerar-codigo.html

## Data

2026-09-28

## Contexto

Durante a migração do Casillas para o novo fluxo comercial baseado em Supabase, foi realizada uma auditoria estática de:

- gerar-codigo.html
- service-worker.js

## Resultado da auditoria

gerar-codigo.html:

- é uma ferramenta independente;
- gera códigos aleatórios;
- calcula hashes locais;
- permite copiar e baixar os resultados;
- não possui integração com Supabase;
- não possui integração com Auth;
- não possui integração com entitlement;
- não cria licenças;
- não ativa licenças;
- não revoga licenças no Supabase;
- não é chamada pelo fluxo normal do aplicativo;
- não possui referências de navegação encontradas no aplicativo atual.

A página ainda contém referências conceituais ao modelo antigo:

- limite de 3 aparelhos;
- CODIGOS_VALIDOS_HASH;
- CODIGOS_REVOGADOS_HASH;
- geração/hash local.

Esses elementos são considerados obsoletos em relação à arquitetura comercial atual.

## Relação com o Service Worker

service-worker.js ainda inclui ./gerar-codigo.html no array CACHE_ASSETS. A página é, portanto, pré-cacheada junto dos recursos estáticos.

A auditoria não encontrou lógica específica do Service Worker para essa ferramenta.

## Decisão

> gerar-codigo.html será preservado temporariamente como ferramenta legada e NÃO será removido nesta etapa.

Motivo:

> A análise estática indica que a ferramenta não participa do fluxo normal do aplicativo, porém não é possível excluir totalmente a possibilidade de uso administrativo direto por URL.

## Condição para remoção futura

A remoção somente deverá ser considerada depois de confirmar que:

1. nenhum processo administrativo depende diretamente da página;
2. ninguém utiliza a URL como ferramenta operacional;
3. a remoção do item correspondente no CACHE_ASSETS foi planejada;
4. README e docs/MAPA-DEPENDENCIAS.md serão atualizados;
5. o Service Worker/cache será revisado;
6. um novo backup será criado antes da remoção.

## Estado arquitetural

A ferramenta NÃO faz parte da nova autoridade comercial.

A arquitetura comercial atual permanece:

Supabase Auth
→ Trial
→ Entitlement
→ activate_casillas_license
→ Licença sem limite de aparelhos

gerar-codigo.html permanece fora desse fluxo.

## Regra de segurança

> Não recriar o antigo sistema de códigos locais, limite de aparelhos, device ID, fingerprint ou listas locais de hashes apenas para manter gerar-codigo.html funcionando.

Se a ferramenta for necessária no futuro, ela deverá ser avaliada separadamente e adaptada à arquitetura comercial atual, sem reintroduzir o mecanismo legado.