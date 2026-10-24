import { mkdir, writeFile } from 'node:fs/promises';
import { mockContent } from '../src/lib/mock';
// Importación manual mediante Sanity CLI: no usa tokens de escritura en Astro.
const { settings, story, pages, categories, dishes } = mockContent;
const documents = [
 { ...settings, _id:'restaurant-settings', _type:'settings', hours:settings.hours.map((hour,i)=>({...hour,_type:'openingHours',_key:`hours-${i}`})) },
 { ...story, image:undefined, _id:'restaurant-story', _type:'story' },
 { _id:'restaurant-gallery', _type:'gallery', images:[] },
 ...pages.map(page => ({...page,_id:`page-${page.slug}`,_type:'page',slug:{_type:'slug',current:page.slug},image:undefined})),
 ...categories.map((category,i)=>({...category,_type:'category',order:i})),
 ...dishes.map((dish,i)=>({...dish,_id:`dish-${dish._id}`,_type:'dish',order:i,image:undefined,categoryId:undefined,category:{_type:'reference',_ref:dish.categoryId}})),
];
await mkdir('.sanity',{recursive:true});
await writeFile('.sanity/seed.ndjson',documents.map(doc=>JSON.stringify(doc)).join('\n')+'\n');
console.log('Creado .sanity/seed.ndjson. No se ha modificado ningún dataset. Las fotografías deben subirse desde Studio.');
