// @ts-check
const { test, expect, devices } = require('@playwright/test');

// ============================================================================
// Helper: filtrar erros de domínios externos (analytics, ads, etc.)
// Esses erros não são bugs do KidCanvas e devem ser ignorados.
// ============================================================================
function isExternalError(errorMessage) {
  const externalPatterns = [
    'google-analytics',
    'googlesyndication',
    'googletagmanager',
    'doubleclick',
    'facebook',
    'fbevents',
    'hotjar',
    'clarity.ms',
    'adsbygoogle',
  ];
  const msg = errorMessage.toLowerCase();
  return externalPatterns.some((pattern) => msg.includes(pattern));
}

// ============================================================================
// Grupo 1: Carregamento direto da página Cientista Maluco Mobile
// ============================================================================
test.describe('Mobile Page Load - Cientista Maluco', () => {
  test('Direct load of /cientista-maluco-mobile defines all critical functions', async ({
    page,
  }) => {
    // Rastrear erros de página para garantir que não houve crash de JS
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Navegar diretamente para a página mobile do Cientista Maluco
    await page.goto('/cientista-maluco-mobile', { waitUntil: 'networkidle' });

    // Verificar que TODAS as funções críticas estão definidas no escopo global
    const functionChecks = await page.evaluate(() => {
      return {
        navigate: typeof window.navigate,
        openAlbumModal: typeof window.openAlbumModal,
        openBestiaryDirectly: typeof window.openBestiaryDirectly,
        saveCreatureToBestiary: typeof window.saveCreatureToBestiary,
        selectChapter: typeof window.selectChapter,
        renderCientistaMalucoView: typeof window.renderCientistaMalucoView,
        Swal: typeof window.Swal,
        showCardReveal: typeof window.showCardReveal,
      };
    });

    expect(functionChecks.navigate).toBe('function');
    expect(functionChecks.openAlbumModal).toBe('function');
    expect(functionChecks.openBestiaryDirectly).toBe('function');
    expect(functionChecks.saveCreatureToBestiary).toBe('function');
    expect(functionChecks.selectChapter).toBe('function');
    expect(functionChecks.renderCientistaMalucoView).toBe('function');
    // Swal pode ser function ou object (SweetAlert2 exporta como objeto com métodos)
    expect(['function', 'object']).toContain(functionChecks.Swal);
    expect(functionChecks.showCardReveal).toBe('function');

    // Verificar que o elemento principal da view está visível e tem altura razoável
    const viewVisible = await page.evaluate(() => {
      const el = document.getElementById('view-cientista-maluco');
      if (!el) return { exists: false, display: 'N/A', height: 0 };
      const style = window.getComputedStyle(el);
      return {
        exists: true,
        display: style.display,
        height: el.offsetHeight,
      };
    });

    expect(viewVisible.exists).toBe(true);
    expect(viewVisible.display).not.toBe('none');
    expect(viewVisible.height).toBeGreaterThan(100);

    // Nenhum erro de JS deve ter ocorrido durante o carregamento
    const appErrors = pageErrors.filter((msg) => !isExternalError(msg));
    expect(appErrors).toEqual([]);
  });

  test('SPA navigation from index.html redirects to mobile and defines functions', async ({
    page,
  }) => {
    // Rastrear erros de página — especialmente "Unexpected token"
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Carregar a home page primeiro
    await page.goto('/', { waitUntil: 'networkidle' });

    // Verificar que funções básicas existem na home
    const homeChecks = await page.evaluate(() => ({
      openAlbumModal: typeof window.openAlbumModal,
      Swal: typeof window.Swal,
    }));
    expect(homeChecks.openAlbumModal).toBe('function');
    expect(['function', 'object']).toContain(homeChecks.Swal);

    // Navegar via SPA para o Cientista Maluco (deve redirecionar para mobile)
    await page.evaluate(() => {
      window.navigate('/cientista-maluco');
    });

    // Aguardar o redirecionamento e carregamento completo
    await page.waitForTimeout(3000);

    // Verificar que as funções do Cientista Maluco estão disponíveis após redirect
    const postRedirectChecks = await page.evaluate(() => ({
      saveCreatureToBestiary: typeof window.saveCreatureToBestiary,
      openBestiaryDirectly: typeof window.openBestiaryDirectly,
      Swal: typeof window.Swal,
    }));

    expect(postRedirectChecks.saveCreatureToBestiary).toBe('function');
    expect(postRedirectChecks.openBestiaryDirectly).toBe('function');
    expect(['function', 'object']).toContain(postRedirectChecks.Swal);

    // Verificar que não houve erros de "Unexpected token" (sintaxe quebrada)
    const unexpectedTokenErrors = pageErrors.filter((msg) =>
      msg.includes('Unexpected token')
    );
    expect(unexpectedTokenErrors).toEqual([]);
  });
});

// ============================================================================
// Grupo 2: Verificação de carregamento de múltiplas páginas
// ============================================================================
test.describe('Multi-page load verification', () => {
  test('Home page loads without JS errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Verificar funções globais essenciais da home page
    const checks = await page.evaluate(() => ({
      navigate: typeof window.navigate,
      openAlbumModal: typeof window.openAlbumModal,
      showToast: typeof window.showToast,
    }));

    expect(checks.navigate).toBe('function');
    expect(checks.openAlbumModal).toBe('function');
    expect(checks.showToast).toBe('function');

    // Filtrar erros de serviços externos (analytics, ads) que não são bugs nossos
    const appErrors = pageErrors.filter((msg) => !isExternalError(msg));
    expect(appErrors).toEqual([]);
  });

  test('Cientista Maluco Mobile loads without JS errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/cientista-maluco-mobile', { waitUntil: 'networkidle' });

    // Verificar funções críticas da página Cientista Maluco
    const checks = await page.evaluate(() => ({
      navigate: typeof window.navigate,
      openAlbumModal: typeof window.openAlbumModal,
      saveCreatureToBestiary: typeof window.saveCreatureToBestiary,
    }));

    expect(checks.navigate).toBe('function');
    expect(checks.openAlbumModal).toBe('function');
    expect(checks.saveCreatureToBestiary).toBe('function');

    const appErrors = pageErrors.filter((msg) => !isExternalError(msg));
    expect(appErrors).toEqual([]);
  });

  test('Pintar Online (via SPA) loads without JS errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Carregar home primeiro, depois navegar via SPA
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.evaluate(() => {
      window.navigate('/pintar-online');
    });

    // Aguardar carregamento da view via SPA (no mobile redireciona para a rota /t)
    await page.waitForTimeout(3000);

    // Verificar que fomos redirecionados para o painel de pintura mobile (/t)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/t');

    const appErrors = pageErrors.filter((msg) => !isExternalError(msg));
    expect(appErrors).toEqual([]);
  });
});

// ============================================================================
// Grupo 3: Fluxo do Bestiário sem autenticação
// ============================================================================
test.describe('Bestiário flow - unauthenticated', () => {
  test('Clicking Abrir Bestiário when logged out shows auth prompt', async ({
    page,
  }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto('/cientista-maluco-mobile', { waitUntil: 'networkidle' });

    // Verificar se a função openBestiaryDirectly existe
    const hasFn = await page.evaluate(
      () => typeof window.openBestiaryDirectly === 'function'
    );
    expect(hasFn).toBe(true);

    // Tentar abrir o bestiário sem estar logado
    if (hasFn) {
      await page.evaluate(() => {
        try {
          window.openBestiaryDirectly();
        } catch (e) {
          // Pode lançar erro se requer auth — isso é esperado
        }
      });
    }

    // Aguardar possível modal ou toast aparecer
    await page.waitForTimeout(1000);

    // Verificar se um prompt de autenticação apareceu
    // Pode ser: auth-modal, auth-overlay, SweetAlert, ou um toast
    const authPromptVisible = await page.evaluate(() => {
      // Checar modal de auth real (id="authModal" com classe "open")
      const realAuthModal = document.getElementById('authModal');
      if (realAuthModal) {
        const style = window.getComputedStyle(realAuthModal);
        if (style.display !== 'none' || realAuthModal.classList.contains('open'))
          return { found: true, type: 'authModal' };
      }

      // Checar modal de auth alternativo
      const authModal = document.querySelector('.auth-modal');
      if (authModal) {
        const style = window.getComputedStyle(authModal);
        if (style.display !== 'none' || authModal.classList.contains('active'))
          return { found: true, type: 'auth-modal' };
      }

      // Checar overlay de auth
      const authOverlay = document.getElementById('auth-overlay');
      if (authOverlay) {
        const style = window.getComputedStyle(authOverlay);
        if (
          style.display !== 'none' ||
          authOverlay.classList.contains('active')
        )
          return { found: true, type: 'auth-overlay' };
      }

      // Checar SweetAlert (Swal)
      const swalPopup = document.querySelector('.swal2-popup');
      if (swalPopup) {
        const style = window.getComputedStyle(swalPopup);
        if (style.display !== 'none')
          return { found: true, type: 'swal2-popup' };
      }

      // Checar toast
      const toast = document.querySelector(
        '.toast, .toast-container, [class*="toast"]'
      );
      if (toast) {
        const style = window.getComputedStyle(toast);
        if (style.display !== 'none') return { found: true, type: 'toast' };
      }

      return { found: false, type: 'none' };
    });

    // O usuário deve ser avisado que precisa fazer login
    expect(authPromptVisible.found).toBe(true);
  });
});
