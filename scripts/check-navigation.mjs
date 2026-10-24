import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Herramienta de verificación fuera del bundle y de las dependencias del producto.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:4321';
const base = '/restaurant-premium-sanity/';
// Mantiene directo únicamente el servidor local; el tráfico externo conserva el proxy.
process.env.PLAYWRIGHT_DISABLE_FORCED_CHROMIUM_PROXIED_LOOPBACK = '1';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {}),
});
await mkdir('review', { recursive: true });
try {
  for (const mode of ['desktop', 'mobile', 'reduced', 'fallback', 'save-data']) {
    const context = await browser.newContext({
      viewport: mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      hasTouch: mode === 'mobile',
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
    });
    await context.addInitScript(({ fallback, saveData }) => {
      window.__salitreToken = crypto.randomUUID();
      window.__salitreLoads = 0;
      document.addEventListener('astro:page-load', () => window.__salitreLoads++);
      if (fallback) document.startViewTransition = undefined;
      if (saveData) {
        const connection = navigator.connection;
        if (connection) Object.defineProperty(connection, 'saveData', { get: () => true });
        else Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } });
      }
    }, { fallback: mode === 'fallback', saveData: mode === 'save-data' });
    if (process.env.HTTPS_PROXY) {
      // Node usa la CA configurada del entorno; no se desactiva la validación TLS.
      await context.route('https://images.unsplash.com/**', async route => {
        const response = await context.request.get(route.request().url());
        assert.ok(response.ok(), `Imagen HTTP ${response.status()}`);
        await route.fulfill({ response });
      });
    }
    const page = await context.newPage();
    const errors = [];
    const htmlRequests = [];
    page.on('request', request => {
      if (['', 'carta/', 'restaurante/', 'reservas/'].some(route => request.url() === origin + base + route)) htmlRequests.push(request.url());
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(origin) && response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`);
    });
    await page.goto(origin + base, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__salitreLoads > 0);
    assert.deepEqual(htmlRequests, [origin + base], `${mode}: prefetch automático sin intención`);
    if (mode === 'desktop') {
      const requested = page.waitForRequest(request => request.url() === origin + base + 'carta/');
      await page.locator(`nav a[href="${base}carta/"]`).hover();
      await requested;
      console.log('OK prefetch: hover carga la carta antes de pulsar.');
    }
    if (mode === 'save-data') {
      await page.locator(`nav a[href="${base}carta/"]`).hover();
      await page.waitForTimeout(300); // Supera el debounce de hover sin pulsar.
      assert.deepEqual(htmlRequests, [origin + base], 'Ahorro de datos: no debe precargar por hover');
      console.log('OK ahorro de datos: no hay prefetch por hover; navegación al pulsar.');
    }
    const token = await page.evaluate(() => window.__salitreToken);
    const header = await page.locator('.site-header').boundingBox();
    async function settled(route, previousLoads) {
      await page.waitForURL(origin + base + route);
      await page.waitForFunction(count => window.__salitreLoads > count, previousLoads);
      assert.equal(await page.evaluate(() => window.__salitreToken), token, `${mode}: recarga completa`);
      assert.equal(await page.locator('nav[aria-label="Navegación principal"] [aria-current="page"]').getAttribute('href'), base + route);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://eduardocr90.github.io' + base + route);
      assert.ok(await page.title());
      const social = await page.locator('meta[property="og:image"]').getAttribute('content');
      assert.equal(social, 'https://eduardocr90.github.io' + base + 'og-default.jpg');
    }
    async function click(route, selector) {
      const count = await page.evaluate(() => window.__salitreLoads);
      await page.locator(selector || `nav[aria-label="Navegación principal"] a[href="${base + route}"]`).click();
      await settled(route, count);
    }
    await click('carta/');
    const nextHeader = await page.locator('.site-header').boundingBox();
    assert.equal(nextHeader.height, header.height, `${mode}: cambia la altura de cabecera`);
    assert.equal(nextHeader.y, header.y, `${mode}: cambia la posición de cabecera`);
    await page.locator('.menu-index a').last().click();
    assert.ok(new URL(page.url()).hash.startsWith('#categoria-'));
    await click('restaurante/');
    await click('reservas/');
    let count = await page.evaluate(() => window.__salitreLoads);
    await page.goBack();
    await settled('restaurante/', count);
    count = await page.evaluate(() => window.__salitreLoads);
    await page.goForward();
    await settled('reservas/', count);
    await click('', '.site-header .wordmark');
    await click('reservas/', '.reservation-band a');
    await click('', '.site-header .wordmark');
    // Activa también las imágenes lazy para detectar fallos fuera del primer viewport.
    await page.locator('img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0), undefined, { timeout: 30000 });
    await page.screenshot({ path: `review/navigation-${mode}.png` });
    assert.deepEqual(errors, [], `${mode}: errores JS o recursos locales`);
    console.log(`OK ${mode}: 4 páginas, historial, anclas, CTA, cabecera estable, metadatos y fotos sin errores JS.`);
    await context.close();
  }
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(origin + base);
  await page.locator(`nav a[href="${base}carta/"]`).click();
  assert.equal(new URL(page.url()).pathname, base + 'carta/');
  assert.ok(await page.locator('h1').textContent());
  console.log('OK sin JavaScript: navegación HTML y contenido disponibles.');
  await context.close();
} finally {
  await browser.close();
}
