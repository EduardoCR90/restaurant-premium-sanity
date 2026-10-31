import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mockContent } from "../src/lib/mock";
import { contentSchema } from "../src/types/content";
import { compositionSchema, siteEditorialSchema } from "../src/types/editorial";
import {
  pageCopy,
  siteCopy,
  originalDefaults,
  visibleEditorialLink,
} from "../src/lib/editorial";
import { restaurantQuery } from "../src/lib/queries";
const fixture = JSON.parse(
  await readFile(
    new URL("./fixtures/editorial-contract.json", import.meta.url),
    "utf8",
  ),
);

test("contrato compartido admite cada campo de composición y cabecera/pie/carta sin perder claves", () => {
  assert.deepEqual(
    compositionSchema.parse(fixture.page.composition),
    fixture.page.composition,
  );
  assert.deepEqual(
    siteEditorialSchema.parse(fixture.settings.editorial),
    fixture.settings.editorial,
  );
  assert.ok(restaurantQuery.includes("navigationLabel,composition"));
  assert.ok(restaurantQuery.includes("editorial,socialImage"));
});
test("documentos anteriores o valores nulos conservan textos y enlaces históricos sin modificar documentos", () => {
  const page = structuredClone(mockContent.pages[0]);
  const settings = structuredClone(mockContent.settings);
  const before = JSON.stringify({ page, settings });
  assert.deepEqual(pageCopy(page), originalDefaults.composition);
  assert.deepEqual(siteCopy(settings), originalDefaults.editorial);
  assert.equal(JSON.stringify({ page, settings }), before);
  assert.deepEqual(
    pageCopy({ ...page, composition: null }),
    originalDefaults.composition,
  );
});
test("overrides parciales conservan los demás grupos; un titular personalizado no hereda cursivas antiguas", () => {
  const page = contentSchema.parse({
    ...mockContent,
    pages: mockContent.pages.map((p, i) =>
      i
        ? p
        : {
            ...p,
            composition: {
              hero: { caption: "Nueva fotografía" },
              essence: { heading: { before: "Otro concepto" } },
            },
          },
    ),
  }).pages[0];
  const copy = pageCopy(page);
  assert.equal(copy.hero.caption, "Nueva fotografía");
  assert.equal(copy.hero.sideNote, originalDefaults.composition.hero.sideNote);
  assert.deepEqual(copy.essence.heading, {
    before: "Otro concepto",
    emphasis: "",
    after: "",
  });
  assert.equal(
    copy.featured.heading.emphasis,
    originalDefaults.composition.featured.heading.emphasis,
  );
});
test("enlaces nulos se ocultan, ausentes heredan; rutas ocultas no dejan CTA rotos", () => {
  const content = structuredClone(mockContent);
  const settings = {
    ...content.settings,
    editorial: { footer: { link: null } },
  };
  assert.equal(siteCopy(settings).footer.link, null);
  assert.ok(siteCopy({ ...settings, editorial: undefined }).footer.link);
  assert.equal(
    visibleEditorialLink(content, { label: "Ver", href: "/carta/#menu" }),
    true,
  );
  content.pages.find((p) => p.slug === "carta")!.status = "hidden";
  assert.equal(
    visibleEditorialLink(content, { label: "Ver", href: "/carta/" }),
    false,
  );
  assert.equal(
    visibleEditorialLink(content, {
      label: "Ver",
      href: "https://example.test/menu",
    }),
    true,
  );
});
test("rechaza titulares vacíos, enlaces inseguros y texto inválido; admite valores parciales y SEO social", () => {
  assert.equal(
    compositionSchema.safeParse({
      hero: { link: { label: "X", href: "javascript:alert(1)" } },
    }).success,
    false,
  );
  assert.equal(
    compositionSchema.safeParse({ essence: { heading: {} } }).success,
    false,
  );
  assert.equal(
    siteEditorialSchema.safeParse({ signature: "  " }).success,
    false,
  );
  const content = contentSchema.parse({
    ...mockContent,
    settings: {
      ...mockContent.settings,
      socialImage: {
        url: "https://example.test/social.jpg",
        alt: "Imagen social compartida",
      },
      editorial: { signature: "Cocina contemporánea" },
    },
  });
  assert.equal(content.settings.socialImage?.alt, "Imagen social compartida");
});
