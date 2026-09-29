# Casillas 2.0 — Estado do Projeto

## Marco: pós-deploy PWA

Data: 29/09/2026

### Git

Branch:

`casillas-2.0`

Workflow ativo de GitHub Pages:

`.github/workflows/static.yml`

Workflow duplicado removido:

`.github/workflows/pages.yml`

O workflow `static.yml` executou com sucesso após o commit `4433e6e`.

A remoção do workflow duplicado foi registrada no commit:

`2082a88` — `ci: remover workflow duplicado do GitHub Pages`

### GitHub Pages

Aplicação publicada em:

`https://martinsdesiqueiraigor-art.github.io/Casillas_app_2/`

O site está acessível.

### PWA / Manifest

O manifest foi reconhecido pelo Chrome.

Nome:

`Casillas App — Calculadora Técnica de Usinagem`

Nome curto:

`Casillas`

Orientação:

`portrait`

Modo de exibição:

`standalone`

Ícones 192×192 e 512×512 reconhecidos.

Os avisos apresentados pelo Chrome sobre `id`, screenshots, ícones maskable e `display-override` são recomendações e não foram tratados neste marco.

### Service Worker

Arquivo:

`service-worker.js`

O Service Worker foi registrado corretamente no GitHub Pages.

Status observado:

`activated and is running`

Versão observada durante o teste:

`#32`

Clientes observados sob controle do Service Worker:

- `/Casillas_app_2/`
- `/Casillas_app_2/index.html`
- `/Casillas_app_2/?utm_source=chatgpt.com`

Ciclo observado:

`Install → Wait → Activate`

### Teste offline

O teste offline foi iniciado.

Com o navegador em modo Offline, a aplicação conseguiu carregar até a tela de login.

A persistência/restauração da sessão Supabase em cenário offline ainda não foi validada.

Portanto, o teste de funcionamento completo offline permanece pendente.

### Próximo passo

Retomar os testes a partir da persistência da sessão Supabase:

1. autenticar normalmente enquanto online;
2. confirmar acesso à Home;
3. verificar persistência da sessão;
4. entrar em modo Offline;
5. recarregar;
6. verificar se a sessão autenticada é restaurada;
7. testar navegação e cálculos offline.

Nenhuma alteração de código deve ser feita até esse teste ser concluído.

### Estado de segurança do marco

Nenhuma alteração foi feita no Supabase durante este marco.

Nenhuma alteração foi feita no Service Worker durante este marco.

Nenhuma alteração foi feita no código comercial de autenticação, trial ou entitlement durante este marco.
