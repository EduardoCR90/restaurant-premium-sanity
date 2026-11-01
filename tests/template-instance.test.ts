import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);
test("workflow callback imports before npm ci in a fresh checkout, without credentials or network", async () => {
  const root = resolve("."),
    directory = await mkdtemp(join(root, ".template-test-"));
  try {
    for (const path of ["vendor", "restaurant.config.ts", "package.json"])
      await cp(join(root, path), join(directory, path), { recursive: true });
    await mkdir(join(directory, "scripts"));
    await cp(
      join(root, "scripts/report-deployment.mjs"),
      join(directory, "scripts/report-deployment.mjs"),
    );
    await mkdir(join(directory, "src/instance"), { recursive: true });
    await cp(
      join(root, "src/instance/editorial-defaults.ts"),
      join(directory, "src/instance/editorial-defaults.ts"),
    );
    const probe = join(directory, "probe.mjs");
    await writeFile(
      probe,
      "import './scripts/report-deployment.mjs';import {writeFile} from 'node:fs/promises';await writeFile(new URL('./probe.ok',import.meta.url),'verified');",
    );
    await run(process.execPath, [probe], {
      cwd: directory,
      env: {
        ...process.env,
        SANITY_API_READ_TOKEN: "",
        ACTIONS_ID_TOKEN_REQUEST_TOKEN: "",
      },
      maxBuffer: 100000,
    });
    assert.equal(
      await readFile(join(directory, "probe.ok"), "utf8"),
      "verified",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
