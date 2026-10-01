# Mapa de dependências

Mapa derivado da estrutura local na branch `casillas-2.0`; não representa verificação do serviço remoto.

| Componente | Dependências e função | Observação |
|---|---|---|
| `index.html` | Carrega `js/app.js`, estilos e manifest. | Entrada da aplicação/PWA. |
| `auth.html` | `js/auth-page.js` e `js/auth.js`. | Login, cadastro e redefinição de senha via Auth. |
| `js/app.js` | Auth, `trial.js`, estado/IndexedDB, menu, teclado e loaders dinâmicos. | Orquestra identidade, validação de acesso e navegação. |
| `js/trial.js` | Cliente Supabase; RPCs `get_casillas_entitlement`, `start_casillas_trial`, `activate_casillas_license`. | Sem autorização local; estado da UI depois da resposta. |
| `js/modules/home.js` | DOM/ícones; recebe estado de acesso e emite navegação. | Apresentação, não autoridade. |
| `js/modules/*.js`, `js/calc/*.js` | Interface, helpers e cálculos locais. | Cálculos não dependem de backend. |
| `js/db.js`, `js/state.js` | IndexedDB para estado de uso. | Não usar como prova comercial. |
| `supabase/migrations/` | Schema, policies, funções privadas e wrappers públicos. | Fonte reproduzível local; implantação exige confirmação separada. |
| `supabase/tests/` | Setup SQL e testes de RLS de profiles. | Cobertura limitada; veja `TESTES.md`. |
| `manifest.json`, `service-worker.js` | Instalação PWA, pré-cache e fallback offline. | Cache não autentica nem concede entitlement. |

## Fluxo comercial resumido

`auth.html` → Supabase Auth → `js/app.js` → `checkTrialStatus()` → entitlement → se ausente/inválido, trial → Home. Ativação pelo formulário na interface → RPC de ativação → nova consulta de entitlement → evento local que carrega a Home. O banco continua autoridade dos direitos.

Na ativação, o cliente chama o endpoint RPC público `public.activate_casillas_license()`, que no Supabase remoto delega para `private.activate_casillas_license()`. Apenas a implementação privada aparece nas migrations atuais; o wrapper público é schema drift conhecido e não tem evidência localizada no histórico pesquisável deste repositório. A divergência não comprova falha do serviço ou bypass. Veja [Banco de dados](BANCO-DADOS.md#matriz-de-funcoes-remoto-e-migrations-locais).

## Pontos de cuidado

- Alterar `trial.js` exige revisar ordem de Auth, entitlement, trial, bloqueio e ativação.
- Alterar roteador/Home exige rever loaders e eventos de navegação.
- Alterar módulos pode exigir revisar dados, estilos e recursos do pré-cache.
- Alterar migrations exige avaliar RLS, grants e funções; não inferir implantação remota.
- `KEYS` declaradas em `trial.js` não foram encontradas em uso. `KEYS.activated`/`activeCode` não autorizam acesso.
