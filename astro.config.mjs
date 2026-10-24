import { defineConfig } from 'astro/config';
import { loadEnvFile } from 'node:process';

// Astro no carga .env automáticamente en process.env al evaluar este archivo.
try {
  loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const site = process.env.SITE_URL || 'https://eduardocr90.github.io';
if (!site.startsWith('https://')) throw new Error('SITE_URL debe ser una URL HTTPS absoluta');

export default defineConfig({
  site,
  base: '/restaurant-premium-sanity',
  output: 'static',
  trailingSlash: 'always',
});
