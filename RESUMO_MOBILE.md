# Resumo das Melhorias e Correções Mobile — KidCanvas (25/06/2026)

Este documento registra todas as análises, correções e alterações de infraestrutura de cache realizadas hoje para viabilizar e estabilizar a nova interface mobile no ambiente de testes `/t`.

---

## 1. Problemas Identificados & Soluções Aplicadas

### 1.1. Erros de Inicialização e Ordem de Carregamento dos Scripts
- **Sintoma:** O console do navegador exibia `TypeError: Cannot set properties of null` ao carregar `/t` (painel-teste), fazendo com que travasse e não carregasse a tela.
- **Causa:** O script `/app.js` estava sendo carregado na tag `<head>`, antes que os elementos da estrutura SPA (como `#view-pintar-online`) existissem no corpo (DOM).
- **Solução:** Movemos a importação do script `<script src="/app.js">` para o final do corpo em `painel-teste.html`, logo antes das customizações. Isso garantiu que todos os elementos estivessem disponíveis para a associação de eventos.

### 1.2. Erro 404 ao Acessar `/t` ou Recarregar no Mobile
- **Sintoma:** Ao carregar diretamente o link de testes no celular, a página retornava erro 404 ou voltava para a Home.
- **Causa:** O roteador SPA interno (`wrapRouter`) não interceptava caminhos relativos ao arquivo `/t` de forma flexível (como `/t/` ou com parâmetros).
- **Solução:** Atualizamos a função de roteamento `wrapRouter` em `painel-teste.html` para abranger as rotas `/t`, `/t/` e arquivos contendo `painel-teste.html`, direcionando-os silenciosamente para `/pintar-online`.

### 1.3. Cores Não Atualizavam no Mobile (Ficava Travado em Rosa)
- **Sintoma:** Ao tocar nas bolinhas de cores da barra mobile, a borda indicava a seleção da cor, mas ao pintar o desenho ele continuava com a cor Rosa padrão.
- **Causa:** 
  1. A variável de estado de cores `selectedPaintColor` em `app.js` estava encapsulada no escopo do arquivo e não podia ser alterada pelos scripts customizados do `painel-teste.html`.
  2. O Service Worker (`sw.js`) mantinha um cache persistente e agressivo do `app.js` antigo, impedindo os celulares de receberem as alterações.
- **Solução:**
  1. Expusemos explicitamente as funções internas `selectPaintingColor` e `setPaintTool` no objeto `window` (dentro do `app.js`), permitindo o controle externo direto:
     ```javascript
     window.selectPaintingColor = selectPaintingColor;
     window.setPaintTool = setPaintTool;
     ```
  2. Alteramos o seletor rápido do mobile em `painel-teste.html` para traduzir a cor HEX em coordenadas RGB e passá-las para a API global exposta:
     ```javascript
     window.selectPaintingColor([r, g, b]);
     ```
  3. Atualizamos a classe `.selected` para aplicar uma borda dourada (`#ffb703`) e scale na bolinha selecionada na barra de cores rápida.

### 1.4. Persistência de Cache do PWA (Service Worker)
- **Sintoma:** Mesmo após mudar os códigos no servidor, os celulares continuavam vendo comportamentos antigos e a pintura padrão em Rosa.
- **Causa:** 
  1. O Service Worker pré-carregava o `/app.js` no cache estático do navegador.
  2. A versão do cache no `sw.js` estava estática em `kidcanvas-cache-v1` e nunca era invalidada.
  3. O arquivo `sw.js` estava no `.gitignore`, de forma que as mudanças locais no Service Worker nunca eram enviadas ao GitHub/Vercel.
- **Solução:**
  1. Modificamos o [.gitignore](file:///.gitignore) para liberar e rastrear os arquivos `sw.js` e `public/sw.js` (`!sw.js` e `!public/sw.js`).
  2. Atualizamos o nome do cache no [sw.js](file:///sw.js) para `kidcanvas-cache-v2`, forçando todos os clientes mobile a descartarem o cache antigo e reinstalarem as versões atualizadas.
  3. Atualizamos os parâmetros de bust de cache em `painel-teste.html` para `?v=1782356600000`.

---

## 2. Desenhos de Teste para Validação (Histórico de Deploys)
Para garantir que você soubesse visualmente quando o commit e o push foram concluídos com sucesso no servidor de produção, alteramos o desenho padrão exibido ao acessar `/t` direto:
1. **Inicial:** Dinossauro convencional.
2. **Atualização 1:** Unicórnio na Nuvem (confirmou o funcionamento do HTML novo).
3. **Atualização 2:** **T-Rex Correndo Feliz 🦖** (confirmou o funcionamento do novo Service Worker e controle de cores).

---

## 3. Estado Atual & Próximos Passos
- **Status do Código:** Todas as alterações estão commitadas e em produção na branch `main` (`https://www.kidcanvas.com.br/t`).
- **Ao ligar o computador novamente:** 
  - Acesse `https://www.kidcanvas.com.br/t`.
  - Caso ainda veja o Unicórnio ou a barra de cores não atualize, **limpe os dados/cache do seu navegador ou teste em aba anônima** para limpar o Service Worker antigo (`v1`). Quando carregar o **T-Rex**, tudo estará atualizado e funcionando perfeitamente!
