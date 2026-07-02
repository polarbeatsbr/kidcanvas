# KidCanvas — Testes Playwright

## Instalação

```bash
npm install --no-save playwright @playwright/test
npx playwright install chromium
```

## Executar todos os testes

```bash
npx playwright test
```

## Executar um arquivo de teste específico

```bash
npx playwright test tests/mobile-cientista
```

## Executar com saída detalhada

```bash
npx playwright test --reporter=line
```

## O que os testes cobrem

| Grupo | O que verifica |
|---|---|
| **Mobile Page Load** | Carregamento direto de `/cientista-maluco-mobile` e navegação SPA desde a home — confirma que todas as funções globais críticas (`navigate`, `openAlbumModal`, `saveCreatureToBestiary`, `Swal`, etc.) estão definidas e que a view principal é visível. |
| **Multi-page load verification** | Carregamento sem erros de JS da home (`/`), da página mobile do Cientista Maluco, e da rota Pintar Online via SPA. Filtra erros de serviços externos (analytics, ads). |
| **Bestiário flow — unauthenticated** | Ao tentar abrir o Bestiário sem estar logado, verifica que o app exibe um prompt de autenticação (modal, overlay ou toast). |

## Recomendação

> **Execute os testes antes de cada deploy** para garantir que nenhuma regressão foi introduzida.
