import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = "/restaurant-premium-sanity/";
async function serve(root) {
  const server = createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, "http://local").pathname;
      assert.ok(pathname.startsWith(base));
      const name = decodeURIComponent(pathname).slice(base.length);
      const path = resolve(
        root,
        name,
        name.endsWith("/") || !name ? "index.html" : "",
      );
      assert.ok(path.startsWith(root + "/"));
      const body = await readFile(path);
      res.writeHead(200, {
        "Content-Type":
          {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            ".svg": "image/svg+xml",
            ".jpg": "image/jpeg",
            ".png": "image/png",
          }[extname(path)] || "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, url: "http://127.0.0.1:" + server.address().port };
}
assert.ok(
  process.env.VISUAL_BASELINE_DIR,
  "Provide the built baseline directory",
);
const sites = await Promise.all(
  [
    process.env.VISUAL_BASELINE_DIR,
    process.env.VISUAL_CURRENT_DIR || "dist",
  ].map((path) => serve(resolve(path))),
);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
await mkdir("review", { recursive: true });
try {
  let checks = 0;
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    await context.route("https://**/*", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100"><rect width="1600" height="1100" fill="#ddd"/></svg>',
      }),
    );
    for (const route of ["", "carta/", "restaurante/", "reservas/"]) {
      const actual = [],
        screenshots = [];
      for (let i = 0; i < sites.length; i++) {
        const page = await context.newPage();
        await page.goto(sites[i].url + base + route, { waitUntil: "load" });
        await page
          .locator("img")
          .evaluateAll((images) =>
            images.forEach((img) => (img.loading = "eager")),
          );
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() =>
          [...document.images].every((img) => img.complete),
        );
        actual.push(
          await page.evaluate(() =>
            [...document.body.querySelectorAll("*")]
              .filter(
                (e) => !["SCRIPT", "STYLE", "LINK", "META"].includes(e.tagName),
              )
              .map((element) => {
                const box = element.getBoundingClientRect(),
                  style = getComputedStyle(element);
                return {
                  tag: element.tagName,
                  rect: [box.x, box.y, box.width, box.height].map(
                    (n) => Math.round(n * 10) / 10,
                  ),
                  color: style.color,
                  background: style.backgroundColor,
                  font: style.fontFamily,
                  size: style.fontSize,
                  lineHeight: style.lineHeight,
                };
              }),
          ),
        );
        const image = await page.screenshot({
          fullPage: true,
          path: `review/legacy-${i}-${width}-${route.replace("/", "") || "home"}.png`,
        });
        screenshots.push(image);
        await page.close();
      }
      assert.deepEqual(
        actual[1],
        actual[0],
        `${width}px ${route}: visual geometry/styles changed`,
      );
      assert.ok(
        screenshots[1].equals(screenshots[0]),
        `${width}px ${route}: screenshot pixels changed`,
      );
      checks++;
    }
    await context.close();
  }
  console.log(
    `${checks} visual comparisons passed: legacy page geometry, typography, colors and screenshot pixels unchanged.`,
  );
} finally {
  await browser.close();
  for (const site of sites) await new Promise((r) => site.server.close(r));
}
