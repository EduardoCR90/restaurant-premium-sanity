import type { APIRoute } from 'astro';
import {getContent} from '../lib/content';
import {getPublishedPages} from '../lib/pages';
import {pathFor} from '../lib/paths';
import {routeForSlug} from '../types/routes';
export const GET:APIRoute = async ({site}) => {
 const data = await getContent();
 const pages = data.source === 'demo' || data.content.settings.isFictional ? [] : getPublishedPages(data.content).filter(p => !p.noindex);
 const escape = (v:string) => v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${escape(new URL(pathFor(routeForSlug(p.slug)),site).href)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
