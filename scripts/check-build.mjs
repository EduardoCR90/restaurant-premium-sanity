import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve('dist');
const base = '/restaurant-premium-sanity/';
const origin = process.env.SITE_URL || 'https://eduardocr90.github.io';
const routes = ['', 'carta/', 'restaurante/', 'reservas/'];
const pages = new Map();
for (const route of routes) pages.set(base + route, await readFile(join(root, route, 'index.html'), 'utf8'));

function decode(value) { return value.replaceAll('&amp;', '&'); }
async function checkUrl(value, currentPath) {
  if (/^(#|mailto:|tel:|data:)/.test(value)) {
    if (value.startsWith('#')) assert.ok(pages.get(currentPath).includes(`id="${value.slice(1)}"`), `Ancla ausente: ${value}`);
    return;
  }
  const url = new URL(decode(value), origin + currentPath);
  if (url.origin !== new URL(origin).origin) return;
  assert.ok(url.pathname.startsWith(base), `URL fuera de base: ${url.href}`);
  const relative = decodeURIComponent(url.pathname.slice(base.length));
  const file = resolve(root, relative, url.pathname.endsWith('/') ? 'index.html' : '');
  assert.ok(file.startsWith(root + '/'), `Ruta fuera de dist: ${file}`);
  await access(file);
}

for (const [route, html] of pages) {
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `H1: ${route}`);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1, `Navegación activa: ${route}`);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  assert.equal(canonical?.[1], origin + route, `Canonical: ${route}`);
  const image = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);
  assert.ok(image, `Falta imagen social: ${route}`);
  assert.ok(image[1].startsWith('https://'), `Imagen social no absoluta: ${route}`);
  await checkUrl(image[1], route);
  assert.ok(html.includes('name="twitter:image"'), `Falta imagen Twitter: ${route}`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) await checkUrl(match[1], route);
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const source of decode(match[1]).split(',')) await checkUrl(source.trim().split(/\s+/)[0], route);
  }
  console.log(`OK ${route}: navegación, recursos, anclas y canonical`);
}
console.log('Build verificada bajo /restaurant-premium-sanity/.');
