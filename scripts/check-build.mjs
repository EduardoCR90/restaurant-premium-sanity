import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve('dist');
const base = (process.env.SITE_BASE || '/restaurant-premium-sanity').replace(/\/$/,'') + '/';
const origin = process.env.SITE_URL || 'https://eduardocr90.github.io';
const routes = (await readdir(root,{recursive:true})).filter(name=>name === 'index.html' || name.endsWith('/index.html')).map(name=>name === 'index.html' ? '' : name.slice(0,-10));
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
  assert.ok((html.match(/aria-current="page"/g) || []).length <= 1, `Navegación activa duplicada: ${route}`);
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
const notFound = await readFile(join(root,'404.html'),'utf8');
assert.ok(notFound.includes('noindex, follow'), '404 sin noindex');
await access(join(root,'sitemap.xml'));
console.log(`Build verificada bajo ${base}.`);
