import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = source.indexOf(`async function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);
  const remaining = source.slice(start + 1);
  const nextFunction = remaining.search(/\r?\n\s+(?:async\s+)?function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const loadBatchDetailCards = getFunctionBlock("loadBatchDetailCards");
const loadBaseHouseCardsForSelectedFarmers = getFunctionBlock("loadBaseHouseCardsForSelectedFarmers");
const loadHouseCardsForSelectedFarmer = getFunctionBlock("loadHouseCardsForSelectedFarmer");

assert.match(loadBatchDetailCards, /house:\s*""/, "batch details should be fetched with an empty house filter for unit-wide loading");
assert.doesNotMatch(loadBatchDetailCards, /baseHouses\.map\(async/, "batch details should not make one request per base house");
assert.match(loadBatchDetailCards, /unitGroups|group.*unit|unique.*unit/i, "batch detail requests should be grouped by unit");
assert.match(loadBatchDetailCards, /if\s*\(!unitKey\)\s*return/, "houses without a real unit should skip the batch-detail request");
assert.doesNotMatch(loadBatchDetailCards, /__all__|unitKey\s*===\s*"__all__"/, "batch details should never receive a synthetic blank-unit group");
assert.match(loadBatchDetailCards, /unit:\s*normalizeParamValue\(unitHouses\[0\]\.unitCode\)/, "batch details should receive the real unit value");
assert.match(loadBaseHouseCardsForSelectedFarmers, /Promise\.all\(farmersToLoad\.map\(async\s*\(farmer\)/, "all farmer house requests should run concurrently");
assert.match(loadBaseHouseCardsForSelectedFarmers, /farmername:\s*farmer\.value/, "each house request should pass the required farmer value");
assert.doesNotMatch(loadBaseHouseCardsForSelectedFarmers, /farmername:\s*selectedFarmer\s*===\s*"all"\s*\?\s*""/, "All Farmers should not use an unsupported blank farmer filter");
assert.match(loadHouseCardsForSelectedFarmer, /loadBaseHouseCardsForSelectedFarmers\(/, "the card loader should use the concurrent farmer request path");

console.log("outgrower house loading performance test passed");
