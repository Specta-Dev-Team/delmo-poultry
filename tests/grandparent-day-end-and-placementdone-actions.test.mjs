import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../grandparent.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../grandparent.css", import.meta.url), "utf8");

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
const getHouseActions = getFunctionBlock("getHouseActions");
const actionContext = getFunctionBlock("actionContext");
const openTstruct = getFunctionBlock("openTstruct");
const mapBatchRow = getFunctionBlock("mapBatchRow");
const executeDayEnd = getFunctionBlock("executeDayEnd");

assert.ok(
  renderDetailNavbar.indexOf("${renderDayEndButton(house)}") < renderDetailNavbar.indexOf("${renderEntryMenu(house)}"),
  "Grand Parent Day End should render immediately before Entry",
);
assert.match(renderDayEndConfirmation, /role="dialog"/, "Grand Parent Day End should use an in-page dialog");
assert.match(renderDayEndConfirmation, /data-day-end-cancel/, "Grand Parent Day End dialog should include No");
assert.match(renderDayEndConfirmation, /data-day-end-confirm/, "Grand Parent Day End dialog should include Yes");
assert.match(renderDayEndButton, /Day End Completed/, "Grand Parent Day End should lock with a completed label");
assert.match(source, /dayEnd:\s*\{\s*name:\s*"poultry_dayend_update"\s*\}/, "Grand Parent should configure the shared Day End datasource");
assert.match(executeDayEnd, /callAxpertDataSourceFunction\(DATA_SOURCES\.dayEnd\.name,\s*\{\s*batchid:\s*batchId\s*\}\)/, "Grand Parent Day End should send batchid");
assert.match(completeDayEnd, /await window\.GrandparentAPI\.executeDayEnd\(\{\s*batchid:\s*batchId\s*\}\)/, "Grand Parent should execute only after confirmation");
assert.match(completeDayEnd, /house\.dayEnd\s*=\s*true/, "Grand Parent should lock the current batch after Day End");
assert.match(css, /\.day-end-confirmation/, "Grand Parent should style the Day End dialog");

assert.match(source, /function hasPlacementDone\(house\)/, "Grand Parent should expose a placement done helper");
assert.match(mapBatchRow, /placementDone:\s*isCompletedFlag\(rowText\(row, \["placementdone", "placement_done"\]\)\)/, "Grand Parent batch mapping should read placementdone");
assert.match(getHouseActions, /hasPlacementDone\(house\) && action === "placement"[\s\S]*return false/, "Grand Parent menus should remove Placement when done");
assert.match(actionContext, /placementDone:\s*house \? hasPlacementDone\(house\) : false/, "Grand Parent action context should carry placement state");
assert.match(openTstruct, /if \(actionKey === "placement" && context && context\.placementDone\) return;/, "Grand Parent should guard against manually opening Placement after completion");

console.log("grandparent Day End and placementdone actions test passed");
