import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

assert.match(parentSource, /poultry_unit_filter/, "unit datasource should remain wired");
assert.match(parentSource, /poultry_parent_batch_details/, "active batch detail datasource should drive house cards");
assert.match(parentSource, /poultry_targetparams/, "target params datasource should remain wired for TStruct prefill");

assert.match(
  parentSource,
  /async function loadHouses\(options\)[\s\S]*loadRows\(DATA_SOURCES\.parentBatchDetails\.name,\s*\{\s*unit:\s*unit\.value,\s*house:\s*""\s*\},\s*\{\s*forceReload: options && options\.forceReload\s*\}\)/,
  "house loading should fetch active parent batch rows once per unit with an empty house parameter",
);

assert.match(
  parentSource,
  /function mapBatchRow\(row,\s*unit\)/,
  "batch rows should be mapped by a focused SQL-alias mapper",
);

assert.doesNotMatch(parentSource, /loadHousesLegacyFallback/, "legacy house loader should be removed");
assert.doesNotMatch(parentSource, /loadParentBatchRowsForHouse/, "per-house batch lookup should be removed");
assert.doesNotMatch(parentSource, /loadParentBatchRowsForUnits/, "unused unit-wide helper should be removed");

console.log("parent house loading simplification test passed");
