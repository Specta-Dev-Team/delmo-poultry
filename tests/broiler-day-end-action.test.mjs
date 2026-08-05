import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../broiler.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../broiler.css", import.meta.url), "utf8");

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
const openDayEndConfirmation = getFunctionBlock("openDayEndConfirmation");
const completeDayEnd = getFunctionBlock("completeDayEnd");
const executeDayEnd = getFunctionBlock("executeDayEnd");
const mapHouseRow = getFunctionBlock("mapHouseRow");

assert.ok(
  renderDetailNavbar.indexOf("${renderDayEndButton(house)}") < renderDetailNavbar.indexOf("${renderQuickEntryMenu(house)}"),
  "Day End should render immediately before Entry",
);
assert.match(renderDayEndButton, /data-day-end/, "Day End should have a dedicated action hook");
assert.match(renderDayEndButton, /data-house-id/, "Day End should identify the selected house");
assert.match(source, /function isDayEndFlag\(value\)/, "Broiler should normalize dayend flags");
assert.match(source, /function isDayEnded\(house\)/, "Broiler should expose a day end state helper");
assert.match(mapHouseRow, /dayEnd:\s*isDayEndFlag\(readValue\(\["dayEnd", "day_end", "dayend"\]\)\)/, "Broiler batch mapping should read the dayend flag");
assert.match(renderDayEndButton, /isDayEnded\(house\)/, "Day End should render a completed state for day-ended batches");
assert.match(renderDayEndButton, /Day End Completed/, "Day End should show a completed label after it is locked");
assert.match(renderDayEndConfirmation, /role="dialog"/, "Day End confirmation should use an in-page dialog");
assert.match(renderDayEndConfirmation, /data-day-end-cancel/, "Day End dialog should include a No action");
assert.match(renderDayEndConfirmation, /data-day-end-confirm/, "Day End dialog should include a Yes action");
assert.match(openDayEndConfirmation, /dayEndConfirmation\s*=\s*\{\s*houseId:/, "Day End should open an in-page confirmation state");
assert.match(source, /dayEnd:\s*\{\s*name:\s*"poultry_dayend_update"\s*\}/, "Day End datasource should be configured");
assert.match(executeDayEnd, /callAxpertDataSourceFunction\(AXPERT_DATASOURCES\.dayEnd\.name,\s*\{\s*batchid:\s*batchId\s*\}\)/, "Day End should pass batchid to Axpert");
assert.match(completeDayEnd, /await window\.BroilerAPI\.executeDayEnd\(\{\s*batchid:\s*batchId\s*\}\)/, "Day End should execute only after in-page confirmation");
assert.match(completeDayEnd, /house\.dayEnd\s*=\s*true/, "Day End should lock the current batch after success");
assert.doesNotMatch(source, /window\.confirm\(/, "Day End should not use the browser confirmation dialog");
assert.doesNotMatch(source, /window\.alert\(/, "Day End should not use browser alerts");
assert.match(css, /\.day-end-button:disabled/, "Day End should have a visible disabled state");

console.log("broiler day end action test passed");
