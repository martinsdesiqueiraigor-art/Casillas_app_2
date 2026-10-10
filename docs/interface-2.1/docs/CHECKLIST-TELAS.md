# Checklist de telas

Atualizado em: 2026-10-10 (CAS-DOC-RECONCILIACAO-01). Os arquivos de protótipo ficam em `docs/interface-2.1/telas/`.

## Estados (obrigatoriamente separados)

- **Protótipo aprovado**: a proposta visual foi aprovada pelo Product Owner.
- **Implementação concluída**: o código correspondente foi integrado (etapa e SHA em `00-ESTADO-ATUAL.md`).
- **Fidelidade validada**: a interface real foi comparada com o protótipo e aprovada pelo Product Owner. Registro exigido: data, SHA e a aprovação.

Uma tela implementada não é considerada validada visualmente. Até esta data **nenhuma tela tem fidelidade validada registrada**.

| Tela | Protótipo aprovado | Implementação | Fidelidade validada | Observações |
|---|---|---|---|---|
| Início | Sim (`casillas-inicio.html`) | **Parcial** (2.3, 2.10) | Não registrada | Falta: cabeçalho com logo e engrenagem (o atual é o legado), campo do Consultor no cartão, ícones SVG no lugar de `✓` e `◷` |
| Calculadoras (lista) | Sim (`casillas-calculadoras.html`) | Sim (2.5) | Não registrada | 9 calculadoras, busca e categorias. Descrições e agrupamento são texto provisório |
| Conicidade | Sim (`casillas-conicidade.html`), modelo das calculadoras | Sim (2.13) | Não registrada | Abre com valores, resultado ao vivo, cartões, detalhes, figura proporcional, copiar. Cópia para a área de transferência não testada. Números com ponto decimal |
| Demais 8 calculadoras | Seguem o modelo da Conicidade | Sim (2.14) | Não registrada | Trigonometria, Polígonos, Furação, Roscas, Tolerâncias, Potência, Chaveta, Conicidades Padrão. Cálculos inalterados |
| Guia, Visão geral (G76) | Sim (`guia-cnc-g76-novo.html`) | Sim (2.9) | Não registrada | Conteúdo estendido só do G76, com selo "Em revisão técnica" |
| Guia, Trajetória | Sim | Sim (2.9) | Não registrada | Refinar depois a vista lateral e os textos das figuras |
| Guia, Parâmetros | Sim | Sim (2.9) | Não registrada | Ajustar a fonte no futuro |
| Guia, Exemplo | Sim | Sim (2.9) | Não registrada | Conferir `X17.4` contra `P(k)` 1530 |
| Guia, Cuidados | Aceita como está | Sim (2.9) | Não registrada | Mantém o visual do protótipo |
| Consultor com resultado | Sim (`casillas-consultor.html`) | Sim (2.11), sem busca livre | Não registrada | A busca da demonstração é ilustrativa |
| Biblioteca | Sim (`casillas-biblioteca.html`) | Sim (2.8) | Não registrada | Contato, Serviços, Cursos, Licença. Links, preços e textos vêm da versão anterior, sem conferência. Interface preservada (CAS-UI-D15) |
| Configurações | Sim (`casillas-configuracoes.html`) | **Não** | — | Sem módulo no código. Seletor de idioma só após a revisão do inglês |
| Login (Entrar, Criar conta) | Sim (`casillas-login.html`) | Sim (2.7) | Não registrada | Recuperar senha e "Verifique seu e-mail" como faixas na própria tela |
| Nova senha | Sim (`casillas-nova-senha.html`) | Sim (2.7) | Não registrada | Mensagens dependem do servidor |
| Ativação por código | Sim (`casillas-ativacao.html`) | Sim (2.7) | Não registrada | Serve também de Fim do teste (CAS-UI-D10) |
| Estados de acesso | Sim (`casillas-estados-acesso.html`) | **Parcial** (2.3) | Não registrada | Faixas de dias no cartão da Início; o banner global do teste não foi alterado |
| Fim do teste (bloqueio total) | Sim, junto com a Ativação | Sim (2.7) | Não registrada | Mesma tela da Ativação, com outra frase |
| Seletor de idioma (English) | Sim, dentro de Configurações | **Não** | — | Depende de Configurações e da revisão do inglês |
| Logos | Referência provisória (`casillas-logos.html`) | Não | — | Modelo 3 provisório; logo definitivo pendente |
| Primeiro uso e splash | Não iniciado | Não | — | Baixa prioridade |
