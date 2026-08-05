import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");

assert.match(source, /initializeOutgrowerData\(\);/, "initial Out Grower boot should use the normal data-source path");
assert.doesNotMatch(
  source,
  /initializeOutgrowerData\(\{\s*forceReload\s*:\s*true\s*\}\)/,
  "initial Out Grower boot should not force an Axpert cache refresh",
);

console.log("outgrower initial load performance test passed");
