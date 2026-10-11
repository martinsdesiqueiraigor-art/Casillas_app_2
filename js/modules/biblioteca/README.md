# Biblioteca Técnica — módulo isolado (Fase 1)

Missão **CAS22-BIB-INTEGRATION-FASE-01**. Adapta o protótipo aprovado **CAS22-BIB-PROTOTYPE-02** à arquitetura do Casillas 2.2, sem ligá-lo ao app.

O módulo ainda **não está registrado** em `js/app.js`, `js/bottom-nav.js`, `index.html` nem no `service-worker.js`. Nada aqui é carregado pelo aplicativo publicado.

## Arquivos

| Arquivo | Papel |
|---|---|
| `index.js` | Contrato do app (`render(container)`) e controlador (`mountBiblioteca`): navegação interna, abas, busca e eventos |
| `views.js` | Telas: Biblioteca, categoria, ficha (4 abas), busca, Consultor (demonstração) e "não encontrado" |
| `routes.js` | Modelo de rota, validação de identificadores, tela-pai e `toPath`/`parsePath` para a Fase 2 |
| `search.js` | Busca local e normalização (funções puras, testáveis em Node) |
| `dom.js` | `h()` para criar DOM sem HTML de dados; ícones e ilustrações SVG estáticos |
| `data.js` | Conteúdo demonstrativo, idêntico ao do protótipo 02 |
| `biblioteca.css` | Aparência da Iteração 02 com escopo `.cbib` e classes `cbib-` |

## Como o módulo se comporta dentro do app

- **Montagem:** `render(container)` cria `<div class="cbib">` dentro de `#app-content`, como os outros módulos.
- **CSS:** o módulo carrega `biblioteca.css` uma vez (`<link id="cbib-styles">`). A raiz fica oculta só até o CSS aplicar. Se o arquivo falhar (erro) ou não responder em 3 s (`STYLE_TIMEOUT_MS`), a tela aparece mesmo assim, sem estilo, com aviso no console. Ela nunca fica invisível.
- **Navegação:** pilha interna em memória, com o botão Voltar do próprio módulo. O módulo não lê nem altera `location`/`history` e não escuta `hashchange` nem `popstate`.
- **Eventos:** delegados na raiz do módulo. O único listener global (`scroll`, que recolhe o botão Consultor) usa `AbortController` e se desliga sozinho quando o app troca de módulo, porque o app não tem rotina de desmontagem.
- **Segurança:** texto de dados entra só como `textContent`. `DOMParser` é usado apenas para os SVG estáticos de `dom.js`. Rotas e identificadores inválidos viram a tela "não encontrado", sem exceções.
- **Teclado:** os campos de busca têm `data-native-keyboard="1"` para que `js/keyboard.js` não ligue o teclado numérico do app.
- **Rede e armazenamento:** nenhum. Não há chamadas de rede nem uso de `localStorage`.
- **Aba lembrada:** a última aba de cada ficha fica em memória enquanto a página do app estiver aberta. Recarregar ou fechar o app limpa. O limite é de 50 fichas (sai a mais antiga), e `clearSessionMemory()` zera tudo, uso previsto ao sair da conta.
- **Desmontagem:** `unmount(container)` desliga listeners e temporizadores de forma explícita. Sem ela, o módulo se desliga sozinho ao perceber que saiu da tela, e remontar no mesmo contêiner desliga a montagem anterior.
- **Homologação:** `isHomologated(ficha)` (em `routes.js`) só é verdadeiro com estado `validated` e todas as referências vinculadas. Em qualquer outro caso, inclusive estado desconhecido, a ficha mostra o aviso de conteúdo não homologado. O aviso vem do estado da ficha, não de um texto fixo.

API para a Fase 2: `mountBiblioteca(container, { initialRoute, onRouteChange })` devolve `{ navigate, back, selectTab, getRoute, canGoBack, destroy }`. Também são exportados `render`, `unmount`, `clearSessionMemory` e `STYLE_TIMEOUT_MS`.

## Testes

```bash
node --test tests/biblioteca/*.test.mjs
```

- `logic.test.mjs`: normalização, busca, destaque, filtro, rotas válidas e inválidas, `toPath`/`parsePath` e integridade dos dados. Também verifica que o conteúdo segue demonstrativo e sem normas ou valores.
- `isolation.test.mjs`: escopo do CSS, ausência de rede, de roteamento global, de armazenamento e de HTML interpretado. Confirma também que nenhum arquivo do app registra o módulo.
- `harness.html`: página de teste com a casca do app (mesmos CSS, cabeçalho, `#app-content` e barra inferior real). Abra com um servidor local na raiz do repositório: `http://localhost:8080/tests/biblioteca/harness.html`.

## Revisão da Fase 1 (Coordenação, 2026-10-11)

Aprovada tecnicamente, com ressalvas. Tratadas no próprio módulo:

- Falha de carregamento do CSS: com erro ou atraso, a tela não fica invisível.
- Memória de abas: política definida, com limite e função para zerar.
- Desmontagem explícita: `unmount`.
- Fichas não homologadas: o aviso vem do estado da ficha, com regra testada.

A integração com o Voltar do Android depende do roteador do app e fica para a Fase 2 (item 2 abaixo).

**Decisão de produto registrada:** a Biblioteca Técnica substituirá a apresentação principal da aba Biblioteca. Contatos, serviços e cursos (hoje em `js/modules/consult.js`) serão realocados para uma área secundária. Essa decisão atualiza a CAS-UI-D15 e deve ser registrada em `01-DECISOES-2.1.md` na Fase 2.

## Pendências para a Fase 2 (não executadas)

1. Registrar o módulo em `MODULE_LOADERS` e `MODULE_TITLES` (`js/app.js`) como apresentação principal da aba Biblioteca. Realocar contatos, serviços, cursos e licença (`consult.js`) para a área secundária definida pela Coordenação.
2. Ligar a pilha interna ao histórico do navegador e ao roteador do app (`#/modulo/<chave>/...`) com `toPath`, `parsePath` e `onRouteChange`, para o Voltar do Android funcionar dentro da Biblioteca. Chamar `unmount` na troca de módulo, se o app ganhar esse passo.
3. Incluir a chave do módulo na regra de `css/layout.css` que esconde a faixa de KPIs.
4. Adicionar os 7 arquivos ao `CACHE_ASSETS` do `service-worker.js` e trocar a versão do cache, para uso offline.
5. Decidir a paleta. O módulo usa a da missão (`#0d1117`, `#f0883e`, `#58a6ff`); `css/variables.css` usa `#0b1118`, `#ff7a1a` e `#4aa3ff`.
6. Integrar o Consultor real (hoje é só demonstração visual) e definir como a ficha vira contexto.
7. Substituir o conteúdo demonstrativo por fichas homologadas, com referências reais.
8. Incluir `js/modules/biblioteca` no ESLint/checkJs de `tools/check-ev3.mjs`, se a Coordenação quiser o mesmo nível de verificação.
9. Prever a versão em inglês (i18n).

---

## Atualização de integração — Fase 2 (2026-10-11)

**Este bloco substitui o estado histórico da Fase 1 acima.** As descrições anteriores de "não integrado" e de pendências ainda não executadas são preservadas apenas como histórico do pacote original, não como estado atual.

- **Integrado localmente:** `js/app.js` registra o carregador da Biblioteca, `js/bottom-nav.js` apresenta a aba Biblioteca e `service-worker.js` inclui os recursos para uso offline. Nenhum deploy foi realizado.
- **Roteamento:** `#/biblioteca` é a rota principal; categorias, fichas e busca usam `#/biblioteca/...`. `toPath` e `parsePath` são usados pelo app. A sincronização com o histórico do navegador permite retorno pelo Android sem remontar o módulo a cada rota.
- **Histórico:** novas telas usam `pushState`; atualização da busca e troca de aba usam `replaceState`. O controlador expõe `syncRoute` para sincronização externa, `onBack` para retorno e `destroy` para desmontagem.
- **Estado da ficha:** continua demonstrativo/não homologado enquanto não houver validação documental e referências vinculadas.
- **Testes:** 24/24 testes da Biblioteca e Production Gate com código de saída 0; 6/6 verificações funcionais isoladas e 8/8 integradas aprovadas pelo Product Owner no Android.
- **Pendências de release:** revisar descoberta do Consultor legado, compatibilidade de layout, regressão de rotas diretas, acessibilidade e atualização de cache; revisar fontes e conteúdo CNC. A decisão de realocação de contatos/serviços/cursos ainda não foi implementada.

Registro completo e handoff: `docs/2.2/CAS22-BIB-FASE-02-VALIDACAO-HANDOFF-20261011.md`.

**Governança:** nenhuma publicação, commit, push, merge ou deploy autorizados nesta etapa.