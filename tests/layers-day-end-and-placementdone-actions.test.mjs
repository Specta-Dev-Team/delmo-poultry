import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../layers.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../layers.css", import.meta.url), "utf8");

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

const renderDetailNavbar = getFunctionBlock("renderDetailNavbar");
const renderDayEndButton = getFunctionBlock("renderDayEndButton");
const renderDayEndConfirmation = getFunctionBlock("renderDayEndConfirmation");
const completeDayEnd = getFunctionBlock("completeDayEnd");
const getHouseActionKeys = getFunctionBlock("getHouseActionKeys");
const getQuickEntryActions = getFunctionBlock("getQuickEntryActions");
const actionContext = getFunctionBlock("actionContext");
const openTstruct = getFunctionBlock("openTstruct");
const mapHouseRow = getFunctionBlock("mapHouseRow");
const executeDayEnd = getFunctionBlock("executeDayEnd");

assert.ok(
  renderDetailNavbar.indexOf("${renderDayEndButton(house)}") < renderDetailNavbar.indexOf("${renderQuickEntryMenu(house)}"),
  "Layers Day End should render immediately before Entry",
);
assert.match(renderDayEndConfirmation, /role="dialog"/, "Layers Day End should use an in-page dialog");
assert.match(renderDayEndConfirmation, /data-day-end-cancel/, "Layers Day End dialog should include No");
assert.match(renderDayEndConfirmation, /data-day-end-confirm/, "Layers Day End dialog should include Yes");
assert.match(renderDayEndButton, /Day End Completed/, "Layers Day End should lock with a completed label");
assert.match(source, /dayEnd:\s*\{\s*name:\s*"poultry_dayend_update"\s*\}/, "Layers should configure the shared Day End datasource");
assert.match(executeDayEnd, /callAxpertDataSourceFunction\(AXPERT_DATASOURCES\.dayEnd\.name,\s*\{\s*batchid:\s*batchId\s*\}\)/, "Layers Day End should send batchid");
assert.match(completeDayEnd, /await window\.LayersAPI\.executeDayEnd\(\{\s*batchid:\s*batchId\s*\}\)/, "Layers should execute only after confirmation");
assert.match(completeDayEnd, /house\.dayEnd\s*=\s*true/, "Layers should lock the current batch after Day End");
assert.match(css, /\.day-end-confirmation/, "Layers should style the Day End dialog");

assert.match(source, /function hasPlacementDone\(house\)/, "Layers should expose a placement done helper");
assert.match(mapHouseRow, /placementDone:\s*isCompletedFlag\(readValue\(\["placementDone", "placement_done", "placementdone"\]\)\)/, "Layers batch mapping should read placementdone");
assert.match(getHouseActionKeys, /hasPlacementDone\(house\) && action === "placement"[\s\S]*return false/, "Layers card actions should remove Placement when done");
assert.match(getQuickEntryActions, /hasPlacementDone\(house\) && action\.key === "placement"[\s\S]*return false/, "Layers Entry should remove Placement when done");
assert.match(actionContext, /placementDone:\s*house \? hasPlacementDone\(house\) : false/, "Layers action context should carry placement state");
assert.match(openTstruct, /if \(actionKey === "placement" && context && context\.placementDone\) return;/, "Layers should guard against manually opening Placement after completion");

console.log("layers Day End and placementdone actions test passed");
