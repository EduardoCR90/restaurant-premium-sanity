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
