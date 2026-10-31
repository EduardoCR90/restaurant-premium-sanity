import type { APIRoute } from 'astro';
import {pathFor} from '../lib/paths';
export const GET: APIRoute = ({site}) => new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(pathFor('/sitemap.xml'),site).href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
