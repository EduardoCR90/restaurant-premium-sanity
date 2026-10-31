import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mockContent} from '../src/lib/mock';
import {contentSchema,pageSchema} from '../src/types/content';
import {slugSchema,routeForSlug} from '../src/types/routes';
import {themeSchema,themeVariables,canUseModule} from '../src/types/restaurant';
import {getPublishedPages,getPageBySlug,getNavigation,getMenu,getHomeHref} from '../src/lib/pages';
import {resolveBlocks} from '../src/lib/blocks';
import {resolvePublishedContent} from '../src/lib/published-content';

test('slugs nuevos y rutas anteriores; rechaza colisiones, duplicados y rutas inseguras',()=>{
 for (const slug of ['eventos','menu-2026','constructor']) assert.equal(slugSchema.parse(slug),slug);
 for (const slug of ['404','api','dashboard','robots.txt','sitemap','Acento','../ruta','a/b','','carta/','área','doble--guion']) assert.equal(slugSchema.safeParse(slug).success,false,slug);
 assert.deepEqual(mockContent.pages.map(p=>routeForSlug(p.slug)),['/','/carta/','/restaurante/','/reservas/']);
 const extra=pageSchema.parse({slug:'eventos',title:'Eventos',seo:{title:'Eventos',description:'Encuentros'}});
 const content=contentSchema.parse({...mockContent,pages:[...mockContent.pages,extra]});
 assert.equal(getPageBySlug(content,'eventos')?.title,'Eventos');
 assert.equal(getPageBySlug(content,'inexistente'),undefined);
 assert.throws(()=>resolvePublishedContent({...content,publishedDocumentCount:23,pages:[...content.pages,extra]}));
});

test('solo páginas publicadas; navegación CMS con orden, etiqueta y visibilidad',()=>{
 const content=structuredClone(mockContent);
 content.pages[0].navigationOrder=3;
 content.pages[1].navigationOrder=0;
 content.pages[1].navigationLabel='Nuestra carta';
 content.pages[2].status='hidden';
 content.pages[3].showInNavigation=false;
 assert.equal(getPageBySlug(content,'restaurante'),undefined);
 assert.equal(getPublishedPages(content).length,3);
 assert.deepEqual(getNavigation(content).map(p=>[p.label,p.href]),[['Nuestra carta','/carta/'],['Inicio','/']]);
 assert.ok(getPageBySlug(content,'reservas'));
});

test('carta ordenada, ocultos excluidos y agotados conservados; filtros por referencias',()=>{
 const content=structuredClone(mockContent);
 content.categories[0].visible=false;
 content.categories[1].order=8;
 content.categories[2].order=1;
 content.categories[3].order=3;
 content.dishes[6].visible=false;
 content.dishes[7].available=false;
 const menu=getMenu(content);
 assert.deepEqual(menu.categories.map(c=>c._id),['postres','bebidas','principales']);
 assert.ok(!menu.dishes.some(d=>d.categoryId==='entrantes'||d._id==='7'));
 assert.equal(menu.dishes.find(d=>d._id==='8')?.available,false);
 assert.deepEqual(getMenu(content,['postres'],['8']).dishes.map(d=>d._id),['8']);
 assert.equal(getMenu(content,['inexistente']).dishes.length,0);
});

test('bloques conservan orden, defaults y opcionales; desconocidos e inválidos se omiten con aviso',()=>{
 const warnings:string[]=[];
 const blocks=resolveBlocks([{_type:'hero',title:'Primero'},{_type:'futureBlock'},{_type:'imageText',body:'Sin imagen'},{_type:'divider'},{_type:'faq',items:[{question:'Pregunta',answer:'Respuesta'}]}],new Date(),m=>warnings.push(m));
 assert.deepEqual(blocks.map(b=>b._type),['hero','divider','faq']);
 assert.equal(blocks[0].variant,'editorial');
 assert.equal(warnings.length,2);
 assert.deepEqual(resolveBlocks(),[]);
});

test('avisos vigentes se evalúan en build, con final exclusivo y fechas válidas',()=>{
 const notice={_type:'notice',text:'Aviso',startsAt:'2026-10-30T10:00:00Z',endsAt:'2026-10-30T12:00:00Z'};
 assert.equal(resolveBlocks([notice],new Date('2026-10-30T11:00:00Z')).length,1);
 assert.equal(resolveBlocks([notice],new Date('2026-10-30T12:00:00Z')).length,0);
 assert.equal(resolveBlocks([notice],new Date('2026-10-30T09:00:00Z')).length,0);
 assert.equal(resolveBlocks([{...notice,endsAt:notice.startsAt,startsAt:notice.endsAt}],new Date(),()=>{}).length,0);
});

test('tema inicial compatible, variantes seguras y preferencias sin autorización',()=>{
 const theme=themeSchema.parse({});
 assert.equal(theme.paper,'#ece8df');
 assert.equal(theme.accent,'#95462f');
 assert.ok(themeVariables(theme).includes('Georgia'));
 assert.ok(themeVariables(themeSchema.parse({font:'sans',accent:'#123456'})).includes('Arial'));
 assert.equal(themeSchema.safeParse({paper:'red;display:none'}).success,false);
 const preference={key:'reservations' as const,enabled:true,presentation:'link' as const};
 assert.equal(canUseModule(preference),false);
 assert.equal(canUseModule(preference,{key:'reservations',authorized:false}),false);
 assert.equal(canUseModule(preference,{key:'staff',authorized:true}),false);
 assert.equal(canUseModule(preference,{key:'reservations',authorized:true}),true);
});

test('portada oculta elige una ruta pública y listas enriquecidas conservan semántica y orden',async()=>{
 const content=structuredClone(mockContent);
 content.pages[0].status='hidden';
 assert.equal(getHomeHref(content),'/carta/');
 content.pages.forEach(p=>p.status='hidden');
 assert.equal(getHomeHref(content),undefined);
 const {groupRichText}=await import('../src/lib/rich-text');
 const paragraph={_type:'block' as const,style:'normal' as const,children:[{_type:'span' as const,text:'Texto',marks:[]}],markDefs:[]};
 const groups=groupRichText([paragraph,{...paragraph,listItem:'bullet'},{...paragraph,listItem:'bullet'},{...paragraph,listItem:'number'},paragraph]);
 assert.deepEqual(groups.map(g=>[g.list,g.items.length]),[[undefined,1],['ul',2],['ol',1],[undefined,1]]);
});
