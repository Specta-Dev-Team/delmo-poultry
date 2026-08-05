import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

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

const mapBatchRow = getFunctionBlock("mapBatchRow");
const renderHouseCard = getFunctionBlock("renderHouseCard");
const renderTransferAction = getFunctionBlock("renderTransferAction");
const executeReadyToTransferUpdate = getFunctionBlock("executeReadyToTransferUpdate");
const completeReadyToTransfer = getFunctionBlock("completeReadyToTransfer");

assert.match(source, /readyToHarvestUpdate:\s*\{\s*name:\s*"poultry_cull_harvest_update"\s*\}/, "Parent should configure the ready-to-harvest update datasource");
assert.match(source, /liveBirdTransferRequest:\s*\{\s*title:\s*"Live Bird Transfer Request",\s*transid:\s*"nlbdt"\s*\}/, "Parent should configure the Live Bird Transfer Request tstruct");
assert.match(mapBatchRow, /readyToHarvest:\s*isCompletedFlag\(getMatchingFieldValue\(row,\s*\["readytoharvest", "readyToHarvest", "harvestready"\]\)\)/, "Parent batch mapping should preserve the harvestready flag");
assert.match(renderHouseCard, /renderTransferAction\(house\)/, "Parent cards should render the transfer-stage action");
assert.match(renderHouseCard, /ready-harvest-card|live-transfer-card/, "Parent cards should expose a workflow stage class");
assert.match(renderHouseCard, /Ready for transfer/, "ready cards should show a transfer status badge");
assert.match(renderTransferAction, /Ready To Transfer Update/, "pending cards should show Ready To Transfer Update");
assert.match(renderTransferAction, /if\s*\(!hasPlacementDone\(house\)\)\s*return\s*""/, "cards with Placement available should hide transfer actions");
assert.match(renderTransferAction, /Live Bird Transfer Request/, "ready cards should show Live Bird Transfer Request");
assert.match(renderTransferAction, /data-tstruct-action="liveBirdTransferRequest"/, "ready cards should open the Live Bird Transfer Request tstruct");
assert.match(renderTransferAction, /data-ready-to-transfer/, "pending cards should expose the ready-to-transfer update action");
assert.match(source, /renderReadyToTransferConfirmation|readyToTransferConfirmation/, "Parent should render a ready-to-transfer confirmation");
assert.match(source, /data-ready-to-transfer-cancel/, "confirmation should expose a No action");
assert.match(source, /data-ready-to-transfer-confirm/, "confirmation should expose a Yes action");
assert.match(source, /completeReadyToTransfer\(house\)/, "the Yes path should execute the update");
assert.match(executeReadyToTransferUpdate, /callAxpertDataSourceFunction\(DATA_SOURCES\.readyToHarvestUpdate\.name,\s*\{\s*batchid:\s*batchId\s*\}\)/, "ready-to-transfer update should send batchid to the datasource");
assert.match(completeReadyToTransfer, /await window\.ParentAPI\.executeReadyToTransferUpdate\(\{\s*batchid:\s*batchId\s*\}\)/, "Parent should execute the ready-to-transfer update");
assert.match(completeReadyToTransfer, /house\.readyToHarvest\s*=\s*true/, "Parent should switch the card to Live Bird Transfer Request after success");

console.log("parent ready-to-transfer action test passed");
