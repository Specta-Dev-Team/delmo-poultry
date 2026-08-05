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

const mapHouseRow = getFunctionBlock("mapHouseRow");
const getHouseActionKeys = getFunctionBlock("getHouseActionKeys");
const getQuickEntryActions = getFunctionBlock("getQuickEntryActions");
const actionContext = getFunctionBlock("actionContext");
const openTstruct = getFunctionBlock("openTstruct");

assert.match(source, /function isPlacementDoneFlag\(value\)/, "Broiler should normalize placementdone flags");
assert.match(source, /function hasPlacementDone\(house\)/, "Broiler should expose a placement done helper");
assert.match(mapHouseRow, /placementDone:\s*isPlacementDoneFlag\(readValue\(\["placementDone", "placement_done", "placementdone"\]\)\)/, "Broiler house mapping should read placementdone from batch details");
assert.match(getHouseActionKeys, /hasPlacementDone\(house\) && action === "placement"[\s\S]*return false/, "Broiler card actions should remove Placement when placement is done");
assert.match(getQuickEntryActions, /hasPlacementDone\(house\) && action\.key === "placement"[\s\S]*return false/, "Broiler detail entry actions should remove Placement when placement is done");
assert.match(actionContext, /placementDone:\s*house \? hasPlacementDone\(house\) : false/, "Broiler action context should carry placement done state");
assert.match(openTstruct, /if \(actionKey === "placement" && context && context\.placementDone\) return;/, "Broiler should guard against opening Placement when placement is done");

console.log("broiler placementdone actions test passed");
