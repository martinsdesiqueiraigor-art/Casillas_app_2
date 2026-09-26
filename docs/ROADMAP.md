# Casillas App 2.0 — Roadmap

## Estado atual

- Versão: 2.0 em desenvolvimento
- Branch: casillas-2.0
- Repositório: Casillas_app_2
- Casillas v1.3.1 preservado em branch main
- Supabase conectado
- Banco inicial criado
- RLS configurado
- Testes de banco passando
- Autenticação Supabase testada
- Trial de 30 dias implementado no backend

## Princípios de desenvolvimento

1. Separar código novo do legado
2. Definir a autoridade de cada informação
3. Criar uma camada central de acesso
4. Manter os módulos técnicos independentes do sistema comercial
5. Criar testes antes de substituições importantes
6. Fazer commits pequenos e rastreáveis
7. Manter main protegido
8. Usar Definition of Done em cada etapa
9. Não depender do frontend para segurança
10. Deixar pagamentos para depois da infraestrutura comercial
11. Mapear dependências antes de substituir arquivos

## Etapas

- [x] Auditoria e arquitetura
- [x] Fundação Supabase
- [x] Trial de 30 dias
- [x] Infraestrutura de autenticação
- [ ] Conta / Auth integrado ao aplicativo
- [ ] Conectar trial ao usuário autenticado
- [ ] Licenciamento
- [ ] Controle de acesso
- [ ] Operações comerciais seguras / Edge Functions
- [ ] Área administrativa
- [ ] Pagamentos
- [ ] Segurança e testes finais
- [ ] Finalização do PWA / Service Worker
- [ ] Publicação do Casillas 2.0

## Regra de trabalho

Antes de uma alteração importante:

1. Verificar dependências
2. Criar ponto de restauração
3. Implementar
4. Executar testes
5. Comparar o resultado
6. Criar commit

## Definition of Done

Uma etapa só é considerada concluída quando:

- código implementado
- dependências verificadas
- testes executados
- segurança considerada
- documentação atualizada
- commit criado
- estado do Git confirmado
