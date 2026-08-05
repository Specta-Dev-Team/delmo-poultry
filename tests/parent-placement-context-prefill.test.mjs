import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = source.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const buildTstructTargetParams = getFunctionBlock("buildTstructTargetParams");
const applyContextToTstruct = getFunctionBlock("applyContextToTstruct");
const clearPlacementOriginFields = getFunctionBlock("clearPlacementOriginFields");

assert.match(
  buildTstructTargetParams,
  /transid\s*===\s*"btplc"[\s\S]*return\s+batchTargetValue\s*\?\s*`batchid=/,
  "Parent placement target params should contain only the Batch ID",
);
assert.match(
  applyContextToTstruct,
  /context\.transid\s*===\s*"btplc"[\s\S]*context\._unitApplied\s*=\s*true[\s\S]*context\._houseApplied\s*=\s*true/,
  "Parent placement should skip From Unit and From House prefill",
);
assert.match(
  clearPlacementOriginFields,
  /From Unit|fromunit|fromsublocation|fromhouse/,
  "Parent placement should know the Axpert From Unit and From House fields",
);
assert.match(
  applyContextToTstruct,
  /schedulePlacementOriginClear\(/,
  "Parent placement should clear origin fields after the batch-driven dependent reload",
);
assert.match(
  applyContextToTstruct,
  /fieldNames:\s*context\.transid\s*===\s*"btplc"[\s\S]*\?\s*\["batchid", "batchid000F1"\][\s\S]*keywords:\s*context\.transid\s*===\s*"btplc"[\s\S]*\?\s*\["batchid"\]/,
  "Parent placement should target only the header Batch ID field",
);

console.log("parent placement context prefill test passed");
