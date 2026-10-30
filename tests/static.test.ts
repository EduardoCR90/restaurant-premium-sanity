import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cp,mkdir,mkdtemp,symlink,writeFile,readFile,access,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);

test('Astro genera páginas CMS y los diez bloques bajo la base; excluye páginas ocultas', {timeout:60000}, async()=>{
 const root=resolve('.');
 const work=resolve('../work');
 await mkdir(work,{recursive:true});
 const dir=await mkdtemp(join(work,'salitre-static-'));
 try {
  for (const name of ['src','public','astro.config.mjs','package.json','tsconfig.json']) await cp(join(root,name),join(dir,name),{recursive:true});
  await symlink(join(root,'node_modules'),join(dir,'node_modules'),'dir');
  await cp(join(dir,'src/lib/mock.ts'),join(dir,'src/lib/legacy-mock.ts'));
  const image={url:'https://cdn.sanity.io/images/test/production/example-1600x1100.jpg',alt:'Fotografía de prueba'};
  const blocks=[
   {_type:'hero',title:'Bloque hero',subtitle:'Subtítulo opcional',image,cta:{label:'Carta desde hero',href:'/carta/'}},
   {_type:'richText',title:'Bloque texto',body:[{_type:'block',children:[{_type:'span',text:'Texto seguro <script> & editorial',marks:['strong','a']}],markDefs:[{_type:'link',_key:'a',href:'/carta/'}]}]},
   {_type:'imageText',title:'Bloque imagen y texto',image,body:'Texto junto a imagen',position:'right'},
   {_type:'galleryBlock',title:'Bloque galería',images:[image]},
   {_type:'menuSection',title:'Bloque carta'},
   {_type:'cards',title:'Bloque tarjetas',items:[{title:'Tarjeta uno'},{title:'Tarjeta dos',link:{label:'Ver carta',href:'/carta/'}}]},
   {_type:'cta',title:'Bloque CTA',cta:{label:'Visitar carta',href:'/carta/'}},
   {_type:'faq',title:'Bloque FAQ',items:[{question:'¿Hay opciones?',answer:'Consulta la carta.'}]},
   {_type:'divider',spacing:'large'},
   {_type:'notice',text:'Aviso vigente'},
   {_type:'notice',text:'Aviso caducado',endsAt:'2020-01-01T00:00:00Z'},
   {_type:'unsupported',title:'NO RENDERIZAR'},
   {_type:'hero'},
   {_type:'menuSection',title:'Segunda carta'},
  ];
  const page={slug:'eventos',title:'Encuentros nuevos',seo:{title:'Eventos SEO',description:'Eventos y gastronomía'},blocks};
  const hidden={...page,slug:'oculta',status:'hidden'};
  // Simula una fuente validada para comprobar SEO comercial; no consulta ni escribe Sanity.
  const contentFile=join(dir,'src/lib/content.ts');
  await writeFile(contentFile,(await readFile(contentFile,'utf8')).replace("source: 'demo'","source: 'sanity'"));
  await writeFile(join(dir,'src/lib/mock.ts'),`import {mockContent as legacy} from './legacy-mock';\nimport {contentSchema} from '../types/content';\nexport const mockContent=contentSchema.parse({...legacy,settings:{...legacy.settings,isFictional:false,name:'Restaurante </script> seguro'},dishes:legacy.dishes.map((d,i)=>({...d,visible:i!==0,available:i!==1})),pages:[...legacy.pages.map(p=>({...p,status:p.slug==='restaurante'?'hidden':p.status})),${JSON.stringify(page)},${JSON.stringify(hidden)},{...${JSON.stringify(page)},slug:'constructor',showInNavigation:false,noindex:true}]});\n`);
  await run(process.execPath,[join(root,'node_modules/astro/bin/astro.mjs'),'build','--root',dir],{cwd:dir,env:{...process.env,SANITY_USE_MOCK:'true',ASTRO_TELEMETRY_DISABLED:'1',SITE_BASE:'/restaurant-premium-sanity'},maxBuffer:2_000_000});
  const html=await readFile(join(dir,'dist/eventos/index.html'),'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
  const markers=['Bloque hero','Bloque texto','Bloque imagen y texto','Bloque galería','Bloque carta','Bloque tarjetas','Bloque CTA','Bloque FAQ','space-large','Aviso vigente'];
  let previous=-1;
  for (const marker of markers) {const next=html.indexOf(marker);assert.ok(next>previous,marker);previous=next;}
  assert.ok(html.includes('href="/restaurant-premium-sanity/carta/"'));
  assert.ok(html.includes('Texto seguro &lt;script&gt; &amp; editorial'));
  assert.ok(html.includes('<strong>'));
  assert.ok(html.includes('<details>'));
  assert.ok(html.includes('Eventos SEO'));
  assert.ok(html.includes('Temporalmente no disponible'));
  assert.ok(!html.includes('Tomate, higuera y queso de flor'));
  assert.ok(html.includes('application/ld+json'));
  assert.ok(html.includes('\\u003c/script>'));
  assert.ok(!html.includes('noindex, follow'));
  const sitemap=await readFile(join(dir,'dist/sitemap.xml'),'utf8');
  assert.ok(sitemap.includes('/eventos/'));
  assert.ok(!sitemap.includes('/oculta/'));
  assert.ok(!sitemap.includes('/constructor/'));
  assert.ok(!html.includes('Aviso caducado'));
  assert.ok(!html.includes('NO RENDERIZAR'));
  assert.ok(!html.includes('/oculta/'));
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,'IDs únicos con dos secciones de carta');
  await assert.rejects(access(join(dir,'dist/oculta/index.html')));
  await assert.rejects(access(join(dir,'dist/restaurante/index.html')));
  await access(join(dir,'dist/constructor/index.html'));
  for (const path of ['index.html','carta/index.html','reservas/index.html','404.html','robots.txt','sitemap.xml']) await access(join(dir,'dist',path));
  const result=await run(process.execPath,[join(root,'scripts/check-build.mjs')],{cwd:dir,maxBuffer:1_000_000});
  assert.ok(result.stdout.includes('Build verificada'));
  await run(process.execPath,[join(root,'node_modules/astro/bin/astro.mjs'),'build','--root',dir],{cwd:dir,env:{...process.env,SANITY_USE_MOCK:'true',SITE_BASE:'/',ASTRO_TELEMETRY_DISABLED:'1'},maxBuffer:2_000_000});
  const rootHtml=await readFile(join(dir,'dist/eventos/index.html'),'utf8');
  assert.ok(rootHtml.includes('href="/carta/"'));
  assert.ok(!rootHtml.includes('/restaurant-premium-sanity/'));
  await run(process.execPath,[join(root,'scripts/check-build.mjs')],{cwd:dir,env:{...process.env,SITE_BASE:'/'},maxBuffer:1_000_000});
 } finally {await rm(dir,{recursive:true,force:true});}
});
