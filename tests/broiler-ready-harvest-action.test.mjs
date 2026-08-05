import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../broiler.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../broiler.css", import.meta.url), "utf8");

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

const mapHouseRow = getFunctionBlock("mapHouseRow");
const renderHouseCard = getFunctionBlock("renderHouseCard");
const renderTransferAction = getFunctionBlock("renderTransferAction");
const executeReadyToHarvestUpdate = getFunctionBlock("executeReadyToHarvestUpdate");
const completeReadyToHarvest = getFunctionBlock("completeReadyToHarvest");

assert.match(source, /readyToHarvestUpdate:\s*\{\s*name:\s*"poultry_cull_harvest_update"\s*\}/, "Broiler should configure the ready-to-harvest update datasource");
assert.match(source, /liveBirdTransferRequest:\s*\{\s*title:\s*"Live Bird Transfer Request",\s*transid:\s*"nlbdt"\s*\}/, "Broiler should configure the Live Bird Transfer Request tstruct");
assert.match(mapHouseRow, /readyToHarvest:\s*isPlacementDoneFlag\(readValue\(\["readytoharvest", "readyToHarvest", "harvestready"\]\)\)/, "Broiler mapping should preserve the harvestready flag");
assert.match(renderHouseCard, /renderTransferAction\(house\)/, "Broiler cards should render the transfer-stage action");
assert.match(renderHouseCard, /ready-harvest-card|live-transfer-card/, "Broiler cards should expose a workflow stage class");
assert.match(renderHouseCard, /Ready for transfer/, "ready cards should show a transfer status badge");
assert.match(renderTransferAction, /Ready To Harvest Update/, "pending cards should show Ready To Harvest Update");
assert.match(renderTransferAction, /if\s*\(!hasPlacementDone\(house\)\)\s*return\s*""/, "cards with Placement available should hide transfer actions");
assert.match(renderTransferAction, /Live Bird Transfer Request/, "ready cards should show Live Bird Transfer Request");
assert.match(renderTransferAction, /data-tstruct-action="liveBirdTransferRequest"/, "ready cards should open the Live Bird Transfer Request tstruct");
assert.match(renderTransferAction, /data-ready-to-harvest/, "pending cards should expose the ready-to-harvest update action");
assert.match(source, /renderReadyToHarvestConfirmation|readyToHarvestConfirmation/, "Broiler should render a ready-to-harvest confirmation");
assert.match(source, /data-ready-to-harvest-cancel/, "confirmation should expose a No action");
assert.match(source, /data-ready-to-harvest-confirm/, "confirmation should expose a Yes action");
assert.match(executeReadyToHarvestUpdate, /callAxpertDataSourceFunction\(AXPERT_DATASOURCES\.readyToHarvestUpdate\.name,\s*\{\s*batchid:\s*batchId\s*\}\)/, "ready-to-harvest update should send batchid to the datasource");
assert.match(completeReadyToHarvest, /await window\.BroilerAPI\.executeReadyToHarvestUpdate\(\{\s*batchid:\s*batchId\s*\}\)/, "Broiler should execute the ready-to-harvest update");
assert.match(completeReadyToHarvest, /house\.readyToHarvest\s*=\s*true/, "Broiler should switch the card to Live Bird Transfer Request after success");
assert.match(styles, /\.ready-harvest-card/, "Broiler should include the blue pending stage styling");
assert.match(styles, /\.live-transfer-card/, "Broiler should include the green live-transfer stage styling");
assert.match(styles, /#EFF6FF/, "pending cards should use the blue stage background");
assert.match(styles, /#E8F3EA/, "live-transfer cards should use the muted green stage background");
assert.match(styles, /#008e32/, "live-transfer actions should use the darker green button");
assert.match(styles, /\.ready-to-harvest-confirmation/, "Broiler should style the confirmation dialog");

console.log("broiler ready-to-harvest action test passed");
