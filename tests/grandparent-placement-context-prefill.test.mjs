import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../grandparent.js", import.meta.url), "utf8");

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
const getPlacementOriginFieldCandidates = getFunctionBlock("getPlacementOriginFieldCandidates");
const applyPlacementBatchHeaderToTstruct = getFunctionBlock("applyPlacementBatchHeaderToTstruct");

assert.match(
  buildTstructTargetParams,
  /transid\s*===\s*"btplc"[\s\S]*return\s+batchTargetValue\s*\?\s*`batchid=/,
  "Grand Parent placement target params should contain only the Batch ID",
);
assert.doesNotMatch(
  buildTstructTargetParams.match(/if\s*\(transid\s*===\s*"btplc"[\s\S]*?\n\s*\}\s*else/)?.[0] || "",
  /\["(?:unit|house|fromunit|fromhouse|fromsubunit)"/,
  "Grand Parent placement target params should not include unit or house fields",
);
assert.match(
  applyContextToTstruct,
  /context\.transid\s*===\s*"btplc"[\s\S]*context\._unitApplied\s*=\s*true[\s\S]*context\._houseApplied\s*=\s*true/,
  "Grand Parent placement should skip From Unit and From House prefill",
);
assert.match(
  clearPlacementOriginFields,
  /getPlacementOriginFieldCandidates\(/,
  "Grand Parent placement should know the Axpert From Unit and From House fields",
);
assert.match(
  getPlacementOriginFieldCandidates,
  /unit|sublocation|length\s*-\s*1/,
  "Grand Parent placement should resolve duplicate Axpert origin fields",
);
assert.match(
  applyContextToTstruct,
  /schedulePlacementOriginClear\(/,
  "Grand Parent placement should clear origin fields after the batch-driven dependent reload",
);
assert.match(
  applyPlacementBatchHeaderToTstruct,
  /findFieldByLabel\(frameDocument,\s*"Batch ID"\)/,
  "Grand Parent placement should locate the header Batch ID field by label",
);
assert.doesNotMatch(
  applyPlacementBatchHeaderToTstruct,
  /setAxpertFrameField/,
  "Grand Parent placement header prefill should not use the global Axpert setter that can reach detail rows",
);
assert.match(
  applyContextToTstruct,
  /applyPlacementBatchHeaderToTstruct\(/,
  "Grand Parent placement should use the header-only Batch ID setter",
);

console.log("grandparent placement context prefill test passed");
