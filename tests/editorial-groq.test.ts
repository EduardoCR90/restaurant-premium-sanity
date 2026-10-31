import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse, evaluate } from "groq-js";
import { restaurantQuery } from "../src/lib/queries";
import { mockContent } from "../src/lib/mock";
import { resolvePublishedContent } from "../src/lib/published-content";
import { pageCopy, siteCopy } from "../src/lib/editorial";
const fixture = JSON.parse(
  await readFile(
    new URL("./fixtures/editorial-contract.json", import.meta.url),
    "utf8",
  ),
);

test("GROQ real en memoria adapta documentos y assets a los contratos editoriales públicos", async () => {
  const docs: Record<string, unknown>[] = [];
  let imageNumber = 0;
  function image(value: { url: string; alt: string } | null | undefined) {
    if (!value) return undefined;
    const id = `image-fixture-${++imageNumber}`;
    docs.push({ _id: id, _type: "sanity.imageAsset", url: value.url });
    return {
      _type: "editorialImage",
      asset: { _type: "reference", _ref: id },
      alt: value.alt,
    };
  }
  docs.push({
    ...mockContent.settings,
    _id: "restaurant-settings",
    _type: "settings",
    logo: image(mockContent.settings.logo),
    editorial: fixture.settings.editorial,
    socialImage: image({
      url: "https://example.test/social-fixture.jpg",
      alt: "Imagen social sintética",
    }),
  });
  docs.push({
    ...mockContent.story,
    _id: "restaurant-story",
    _type: "story",
    image: image(mockContent.story.image),
  });
  docs.push({
    _id: "restaurant-gallery",
    _type: "gallery",
    images: mockContent.gallery.map(image),
  });
  for (const p of mockContent.pages)
    docs.push({
      ...p,
      _id: `fixture-${p.slug}`,
      _type: "page",
      slug: { _type: "slug", current: p.slug },
      image: image(p.image),
      seo: { ...p.seo, image: image(p.seo.image) },
      composition: fixture.page.composition,
    });
  for (const c of mockContent.categories)
    docs.push({ ...c, _type: "category" });
  for (const d of mockContent.dishes)
    docs.push({
      ...d,
      _type: "dish",
      category: { _type: "reference", _ref: d.categoryId },
      image: image(d.image),
    });
  // A stored menu block must remain category/dish references; GROQ alone adapts to public IDs.
  const home = docs.find((d) => d._id === "fixture-inicio")!;
  home.blocks = [
    {
      _type: "menuSection",
      _key: "offline-block",
      categories: [{ _type: "reference", _ref: mockContent.categories[0]._id }],
      dishes: [{ _type: "reference", _ref: mockContent.dishes[0]._id }],
    },
  ];
  const result = await (
    await evaluate(parse(restaurantQuery), { dataset: docs })
  ).get();
  const { content, source } = resolvePublishedContent(result);
  assert.equal(source, "sanity");
  assert.equal(content.settings.socialImage?.alt, "Imagen social sintética");
  assert.deepEqual(siteCopy(content.settings), fixture.settings.editorial);
  assert.deepEqual(pageCopy(content.pages[0]), fixture.page.composition);
  assert.deepEqual(
    (content.pages[0].blocks?.[0] as { categoryIds: string[] }).categoryIds,
    [mockContent.categories[0]._id],
  );
  assert.equal(
    content.dishes.find((d) => d._id === mockContent.dishes[0]._id)?.categoryId,
    mockContent.dishes[0].categoryId,
  );
  assert.ok(content.pages[0].image?.url.startsWith("https://"));
  assert.ok(content.gallery.length > 0);
});
