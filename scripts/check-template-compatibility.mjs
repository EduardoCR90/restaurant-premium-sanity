import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const support = JSON.parse(await readFile("template.instance.json", "utf8"));
const lock = JSON.parse(await readFile("template.lock.json", "utf8"));
assert.equal(support.format, 1);
// Explicit bridge from the pre-manifest release; the updater verifies it before replacing it.
if (lock.version !== "0.2.0") {
  const { templateIdentity } =
    await import("../vendor/restaurant-template/src/ops/template-evidence.mjs");
  const identity = await templateIdentity();
  for (const key of [
    "template_key",
    "configuration_contract",
    "content_contract",
    "visual_contract",
  ])
    assert.equal(identity[key], support[key], `Unsupported ${key}`);
}
console.log("Instance template compatibility verified.");
