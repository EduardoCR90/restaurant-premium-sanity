import { defineConfig } from 'astro/config';
import { loadEnvFile } from 'node:process';
import { restaurantConfig } from './restaurant.config.ts';

// Astro no carga .env automáticamente en process.env al evaluar este archivo.
try {
  loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const site = process.env.SITE_URL || restaurantConfig.site.url;
if (!site.startsWith('https://')) throw new Error('SITE_URL debe ser una URL HTTPS absoluta');

export default defineConfig({
  site,
  base: process.env.SITE_BASE || restaurantConfig.site.base,
  output: 'static',
  trailingSlash: 'always',
  // Solo enlaces marcados: hover/foco; Astro reduce a tap con ahorro de datos o red lenta.
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
