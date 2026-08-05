import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../grandparent.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const functionStart = source.indexOf(`function ${functionName}`);
  assert.notEqual(functionStart, -1, `${functionName} should exist`);

  const start = source.slice(0, functionStart).endsWith("async ") ? functionStart - "async ".length : functionStart;
  const remainingSource = source.slice(functionStart + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : functionStart + 1 + nextFunction);
}

const loadUnitOptions = getFunctionBlock("loadUnitOptions");
const loadHouses = getFunctionBlock("loadHouses");
const mapHouseRow = getFunctionBlock("mapHouseRow");
const mapBatchRow = getFunctionBlock("mapBatchRow");
const loadTargetParamsForHouse = getFunctionBlock("loadTargetParamsForHouse");
const buildTstructUrl = getFunctionBlock("buildTstructUrl");
const applyContextToTstruct = getFunctionBlock("applyContextToTstruct");

assert.match(source, /key:\s*"grandparent"/, "grandparent screen should expose grandparent context");
assert.match(source, /exposeName:\s*"grandparentOps"/, "grandparent screen should expose grandparentOps");
assert.match(source, /units:\s*\{\s*name:\s*"poultry_gp_unit"\s*\}/, "unit filter should use poultry_gp_unit");
assert.match(source, /houses:\s*\{\s*name:\s*"poultry_gp_house"\s*\}/, "house loading should use poultry_gp_house");
assert.match(source, /batchDetails:\s*\{\s*name:\s*"poultry_gp_batch_details"\s*\}/, "card details should use poultry_gp_batch_details");
assert.match(source, /targetParams:\s*\{\s*name:\s*"poultry_targetparams"\s*\}/, "target params datasource should remain shared");

assert.match(loadUnitOptions, /loadRows\(DATA_SOURCES\.units\.name/, "unit options should load from configured unit datasource");
assert.match(loadHouses, /loadRows\(DATA_SOURCES\.houses\.name/, "house list should load from configured house datasource");
assert.match(loadHouses, /loadRows\(DATA_SOURCES\.batchDetails\.name/, "house cards should be enriched by GP batch details datasource");
assert.match(mapHouseRow, /locationname|unitName|unitname/, "house mapper should preserve unit labels from house datasource");
assert.match(mapBatchRow, /birdshoused/, "batch detail mapper should preserve bird count fields");
assert.match(loadTargetParamsForHouse, /DATA_SOURCES\.targetParams\.name/, "entry prefill should resolve target params from shared datasource");
assert.match(buildTstructUrl, /buildTstructTargetParams\(context\)/, "TStruct URL should use parent-style targetparams");
assert.match(applyContextToTstruct, /fieldNames:\s*\["batch", "batchid", "batchno", "batchnumber"\]/, "backup-style batch iframe prefill should remain available");

assert.doesNotMatch(source, /poultry_unit_filter/, "grandparent should not use parent unit datasource");
assert.doesNotMatch(source, /poultry_grandparent_houses/, "grandparent should not use old grandparent house datasource");

console.log("grandparent datasource pattern test passed");
