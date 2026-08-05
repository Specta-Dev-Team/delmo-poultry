import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);
  const remaining = source.slice(start + 1);
  const nextFunction = remaining.search(/\r?\n\s+function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const renderHarvestAction = getFunctionBlock("renderHarvestAction");
const renderHouseCard = getFunctionBlock("renderHouseCard");
const buildTstructTargetParams = getFunctionBlock("buildTstructTargetParams");

assert.match(
  source,
  /liveBirdTransferRequest:\s*\{\s*title:\s*"Live Bird Transfer Request",\s*transid:\s*"nlbdt"\s*\}/,
  "the ready-state action should use the Live Bird Transfer Request TStruct",
);
assert.match(
  source,
  /outGrowerChickPlacement:\s*\{\s*title:\s*"Out Grower Chick Placement",\s*transid:\s*"chpog"\s*\}/,
  "the card dropdown should keep the Out Grower Chick Placement TStruct",
);
assert.match(renderHarvestAction, /data-tstruct-action="liveBirdTransferRequest"/, "ready cards should keep the transfer action wired");
assert.match(renderHarvestAction, /<span>Live Bird Transfer Request<\/span>/, "ready cards should show the new transfer label");
assert.match(renderHarvestAction, /if\s*\(!hasPlacementDone\(house\)\)\s*return\s*""/, "cards with Placement available should hide transfer actions");
assert.match(renderHouseCard, /hasPlacementDone\(house\)\s*\?\s*CARD_ACTIONS\.filter\([\s\S]*outGrowerChickPlacement/, "completed-placement cards should hide the placement action");
assert.match(source, /placementDone:\s*isPlacementDoneFlag\(/, "Out Grower should map the placementdone flag");
assert.doesNotMatch(renderHarvestAction, /Harvest Pull Out/, "the old Harvest Pull Out label should be removed");
const cardActions = source.match(/const CARD_ACTIONS = \[[\s\S]*?\];/)?.[0] || "";
assert.match(cardActions, /"outGrowerChickPlacement"/, "the card dropdown should include Out Grower Chick Placement");
assert.doesNotMatch(cardActions, /"liveBirdTransferRequest"/, "the transfer request should stay out of the card dropdown");
assert.match(buildTstructTargetParams, /\["batch",\s*batchTargetValue\]/, "the transfer TStruct should receive the batch prefill");
assert.match(buildTstructTargetParams, /\["house",\s*houseTargetValue\]/, "the transfer TStruct should receive the house prefill");
assert.match(buildTstructTargetParams, /\["farmer",\s*farmerTargetValue\]/, "the transfer TStruct should receive the farmer prefill");
assert.match(source, /tstructFrame\.src\s*=\s*buildTstructUrl\(action\.transid,\s*pendingTstructContext\)/, "the configured nlbdt transaction should be used when opening the TStruct");

console.log("outgrower live bird transfer request test passed");
