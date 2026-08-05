import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../layers.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = source.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const buildTstructTargetParams = getFunctionBlock("buildTstructTargetParams");
const clearPlacementOriginFields = getFunctionBlock("clearPlacementOriginFields");
const schedulePlacementOriginClear = getFunctionBlock("schedulePlacementOriginClear");

assert.match(
  buildTstructTargetParams,
  /transid\s*===\s*"btplc"[\s\S]*return\s+batchTargetValue\s*\?\s*`batchid=/,
  "Layers placement target params should contain only the Batch ID",
);
assert.match(
  clearPlacementOriginFields,
  /From Unit|fromunit|fromsublocation|fromhouse/,
  "Layers placement should know the Axpert From Unit and From House fields",
);
assert.match(
  schedulePlacementOriginClear,
  /clearPlacementOriginFields\(/,
  "Layers placement should clear origin fields after the dependent batch load",
);
assert.match(
  source,
  /tstructFrame\.addEventListener\("load",\s*handleTstructLoad\)/,
  "Layers should clean placement origin fields when the TStruct iframe loads",
);

console.log("layers placement batch prefill test passed");
