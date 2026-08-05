import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../outgrower.css", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const functionPattern = new RegExp(`(?:async\\s+)?function\\s+${functionName}\\s*\\(`);
  const match = functionPattern.exec(source);
  assert.ok(match, `${functionName} should exist`);

  const start = match.index;
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${functionName} block should close`);
}

const createBatchHouseFromRow = getFunctionBlock("createBatchHouseFromRow");
const applyBatchDetailRow = getFunctionBlock("applyBatchDetailRow");
const renderHouseCard = getFunctionBlock("renderHouseCard");
const renderHarvestAction = getFunctionBlock("renderHarvestAction");
const renderHarvestReadyConfirmation = getFunctionBlock("renderHarvestReadyConfirmation");
const completeHarvestReady = getFunctionBlock("completeHarvestReady");
const executeHarvestReady = getFunctionBlock("executeHarvestReady");

assert.match(source, /harvestReady:\s*\{\s*name:\s*"poultry_outgrower_harvestready"\s*\}/, "Out Grower should configure the harvest-ready datasource");
assert.match(source, /function isReadyToHarvest\(house\)/, "Out Grower should expose a ready-to-harvest helper");
assert.match(createBatchHouseFromRow, /readyToHarvest:\s*isReadyToHarvestFlag\(getRowValue\(row, \["readytoharvest", "ready_to_harvest"\]\)\)/, "batch mapping should read readytoharvest");
assert.match(applyBatchDetailRow, /house\.readyToHarvest\s*=\s*Boolean\(house\.readyToHarvest\) \|\| isReadyToHarvestFlag/, "batch-detail enrichment should preserve ready-to-harvest state");
assert.match(renderHouseCard, /renderHarvestAction\(house\)/, "cards should render the harvest action for their batch state");
assert.match(renderHarvestAction, /data-harvest-ready/, "not-ready cards should provide the harvest-ready action");
assert.match(renderHarvestAction, /Live Bird Transfer Request/, "ready cards should provide Live Bird Transfer Request");
assert.match(renderHarvestAction, /data-tstruct-action="liveBirdTransferRequest"/, "Live Bird Transfer Request should open the dedicated transfer TStruct");
assert.doesNotMatch(renderHarvestAction, /data-iview-action="readyToHarvest"/, "the card should not open the Ready To Harvest iView");
assert.match(renderHarvestReadyConfirmation, /role="dialog"/, "harvest-ready confirmation should be in-page");
assert.match(renderHarvestReadyConfirmation, /data-harvest-ready-cancel/, "harvest-ready confirmation should include No");
assert.match(renderHarvestReadyConfirmation, /data-harvest-ready-confirm/, "harvest-ready confirmation should include Yes");
assert.match(executeHarvestReady, /callAxpertDataSourceFunction\(DATA_SOURCES\.harvestReady\.name,\s*\{\s*batch:\s*batchId\s*\}\)/, "harvest-ready update should send batch");
assert.match(completeHarvestReady, /await window\.outGrowerOps\.executeHarvestReady\(\{\s*batch:\s*batchId\s*\}\)/, "harvest-ready update should only run after confirmation");
assert.match(completeHarvestReady, /house\.readyToHarvest\s*=\s*true/, "card should switch to Live Bird Transfer Request after a successful update");
assert.match(completeHarvestReady, /loadHouseCardsForSelectedFarmer\(\{\s*forceReload:\s*true\s*\}\)/, "successful updates should refresh the batch-details datasource");
assert.match(css, /\.harvest-ready-confirmation/, "Out Grower should style the confirmation dialog");

console.log("outgrower harvest-ready action test passed");
