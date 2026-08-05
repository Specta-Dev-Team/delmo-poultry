import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentHtml = readFileSync(new URL("../parent.html", import.meta.url), "utf8");
const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = parentSource.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = parentSource.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return parentSource.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const renderHouseDetail = getFunctionBlock("renderHouseDetail");

assert.match(parentHtml, /id="unitSelect"/, "parent screen should keep the unit filter");
assert.match(parentHtml, /id="houseGrid"/, "parent screen should keep the house grid");
assert.match(parentHtml, /id="houseDetail"/, "parent screen should keep the detail panel");
assert.match(parentHtml, /id="tstructFrame"/, "parent screen should keep the TStruct iframe");

assert.match(parentSource, /data-house-id/, "house cards should remain clickable");
assert.match(parentSource, /data-tstruct-action/, "entry action buttons should remain wired");
assert.match(parentSource, /renderHouseDetail/, "house detail rendering should remain available");
assert.match(parentSource, /openTstruct/, "entry screens should still open TStructs");
assert.match(parentSource, /function chartCard\(/, "house detail should reserve chart card placeholders");
assert.match(parentSource, /<section class="chart-grid">/, "house detail should keep the chart preview area");
assert.match(parentSource, /chartCard\("birds"/, "birds chart placeholder should remain available");
assert.match(parentSource, /chartCard\("mortality"/, "mortality chart placeholder should remain available");
assert.match(parentSource, /chartCard\("feedKg"/, "feed chart placeholder should remain available");
assert.match(parentSource, /chartCard\("bodyWeight"/, "body weight chart placeholder should remain available");
assert.match(parentSource, /function renderScheduleSection\(/, "house detail should reserve the schedule section");
assert.match(parentSource, /No schedule records available/, "schedule section should render an honest empty state until the datasource is bound");
assert.doesNotMatch(renderHouseDetail, /<section class="table-panel activity-panel">\s*<div class="table-panel-header">/, "house detail should not render the duplicate title and entry card");
assert.doesNotMatch(renderHouseDetail, /<h2>\$\{escapeHtml\(house\.name\)\}<\/h2>/, "house detail should not repeat the house title inside a card");
assert.doesNotMatch(renderHouseDetail, /Female birds/, "house detail header card should not repeat the bird metrics grid");
assert.doesNotMatch(renderHouseDetail, /Male birds/, "house detail header card should not repeat the bird metrics grid");
assert.doesNotMatch(renderHouseDetail, /House cost/, "house detail header card should not show the removed metric grid");

console.log("parent house flow test passed");
