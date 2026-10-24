import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contentSchema, dishSchema, safeUrl } from '../src/types/content';
import { mockContent } from '../src/lib/mock';
test('demo completa: cuatro páginas únicas, categorías válidas y precios positivos', () => {
 const content = contentSchema.parse(mockContent);
 assert.deepEqual(content.pages.map(p => p.slug).sort(), ['carta','inicio','reservas','restaurante']);
 assert.equal(new Set(content.categories.map(c=>c._id)).size,4);
 for (const dish of content.dishes) { assert.ok(content.categories.some(c => c._id === dish.categoryId)); assert.ok(dish.price > 0); }
 assert.equal(content.settings.isFictional, true);
 assert.equal(content.settings.reservationUrl, null);
});
test('rechaza contenido CMS incompleto y precios negativos', () => {
 assert.equal(contentSchema.safeParse({}).success,false);
 assert.equal(dishSchema.safeParse({...mockContent.dishes[0],price:-1}).success,false);
});
test('impide protocolos inseguros en imágenes y reservas', () => {
 for (const url of ['javascript:alert(1)','http://example.com','data:text/html,hello']) assert.equal(safeUrl.safeParse(url).success,false);
 assert.equal(safeUrl.safeParse('https://reservas.example/mesa').success,true);
});

test('dataset conectado vacío conserva demo explícita', async () => {
 const { resolvePublishedContent } = await import('../src/lib/published-content');
 const result = resolvePublishedContent({ publishedDocumentCount: 0 });
 assert.equal(result.source, 'demo');
 assert.equal(result.cmsStatus, 'empty');
 assert.equal(result.content.dishes.length, mockContent.dishes.length);
});
test('contenido publicado se consume y conserva cambios reales', async () => {
 const { resolvePublishedContent } = await import('../src/lib/published-content');
 const result = resolvePublishedContent({ ...mockContent, publishedDocumentCount: 22, dishes: mockContent.dishes.map((dish, i) => i === 0 ? { ...dish, name: 'Plato editado en Sanity', price: 21 } : dish) });
 assert.equal(result.source, 'sanity');
 assert.equal(result.content.dishes[0].name, 'Plato editado en Sanity');
 assert.equal(result.content.dishes[0].price, 21);
});
test('publicación incompleta, duplicada o con referencia rota no oculta errores con demo', async () => {
 const { resolvePublishedContent } = await import('../src/lib/published-content');
 assert.throws(() => resolvePublishedContent({ publishedDocumentCount: 1 }));
 assert.throws(() => resolvePublishedContent({ ...mockContent, publishedDocumentCount: 22, pages: [...mockContent.pages, mockContent.pages[0]] }));
 assert.throws(() => resolvePublishedContent({ ...mockContent, publishedDocumentCount: 22, categories: [] }));
 assert.throws(() => resolvePublishedContent({ publishedDocumentCount: -1 }));
});
