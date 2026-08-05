import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const screenFiles = ["grandparent.js", "layers.js", "broiler.js"];

function getFunctionBlock(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = source.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

for (const fileName of screenFiles) {
  const source = readFileSync(new URL(`../${fileName}`, import.meta.url), "utf8");
  const buildTstructTargetParams = getFunctionBlock(source, "buildTstructTargetParams");

  assert.doesNotMatch(
    buildTstructTargetParams,
    /\["batch",\s*batchTargetValue\]/,
    `${fileName} should not pass generic batch URL params that fill placement detail rows`,
  );
  assert.doesNotMatch(
    buildTstructTargetParams,
    /\["batch000F1",\s*batchTargetValue\]/,
    `${fileName} should not pass generic batch000F1 URL params that fill placement detail rows`,
  );
  assert.match(
    buildTstructTargetParams,
    /\["tobatch",\s*batchTargetValue\]/,
    `${fileName} should keep parent-style header-safe tobatch prefill`,
  );
  assert.match(
    buildTstructTargetParams,
    /\["batchid",\s*context\.batchId\]/,
    `${fileName} should keep batch id available for header context`,
  );
}

console.log("placement batch prefill safety test passed");
