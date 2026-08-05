import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../broiler.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = source.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const applyContextToTstruct = getFunctionBlock("applyContextToTstruct");
const buildTstructTargetParams = getFunctionBlock("buildTstructTargetParams");
const clearPlacementOriginFields = getFunctionBlock("clearPlacementOriginFields");

assert.match(
  buildTstructTargetParams,
  /if\s*\(transid\s*===\s*"btplc"\)\s*\{[\s\S]*return\s+batchTargetValue\s*\?\s*`batchid=/,
  "Broiler placement target params should return only the batch ID",
);
assert.doesNotMatch(
  buildTstructTargetParams.match(/if\s*\(transid\s*===\s*"btplc"[\s\S]*?\n\s*\}\s*(?:else|else if)/)?.[0] || "",
  /\["(?:unit|house|fromunit|fromhouse|fromsubunit)"/,
  "Broiler placement target params should not include unit or house fields",
);

assert.match(
  applyContextToTstruct,
  /context\.transid\s*===\s*"btplc"/,
  "Broiler placement context prefill should identify the btplc TStruct",
);
assert.match(
  applyContextToTstruct,
  /context\.transid\s*===\s*"btplc"[\s\S]*context\._unitApplied\s*=\s*true[\s\S]*context\._houseApplied\s*=\s*true/,
  "Broiler placement should skip From Unit and From House prefill while preserving completion state",
);
assert.match(
  clearPlacementOriginFields,
  /From Unit|fromunit|fromsublocation|fromhouse/,
  "Broiler placement should know the Axpert From Unit and From House fields",
);
assert.match(
  applyContextToTstruct,
  /schedulePlacementOriginClear\(/,
  "Broiler placement should clear origin fields after the batch-driven dependent reload",
);
assert.match(
  applyContextToTstruct,
  /fieldNames:\s*context\.transid\s*===\s*"btplc"[\s\S]*\?\s*\["batchid", "batchid000F1"\][\s\S]*keywords:\s*context\.transid\s*===\s*"btplc"[\s\S]*\?\s*\["batchid"\]/,
  "Broiler placement should target only the header Batch ID field",
);

console.log("broiler placement context prefill test passed");
