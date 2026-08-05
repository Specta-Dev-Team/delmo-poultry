import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const outgrowerSource = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");
const outgrowerCss = readFileSync(new URL("../outgrower.css", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = outgrowerSource.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = outgrowerSource.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return outgrowerSource.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const renderHouseDetail = getFunctionBlock("renderHouseDetail");

assert.match(outgrowerSource, /schedules:\s*\{\s*name:\s*"poultry_schedule_details"\s*\}/, "outgrower should use the shared schedule datasource");
assert.match(outgrowerSource, /activities:\s*\{\s*name:\s*"poultry_activities_details"\s*\}/, "outgrower should use the shared farmer activity datasource");

assert.match(outgrowerSource, /let selectedActivityTab\s*=\s*"schedule"/, "outgrower should default to the schedule activity tab");
assert.match(outgrowerSource, /let selectedScheduleStatusFilter\s*=\s*"all"/, "outgrower should keep the schedule status filter state");

assert.match(outgrowerSource, /function mapScheduleRows\(/, "outgrower should map schedule datasource rows");
assert.match(outgrowerSource, /function loadSchedules\(house\)/, "outgrower should load schedules by selected batch");
assert.match(outgrowerSource, /function mapFarmerActivityRows\(/, "outgrower should map farmer activity datasource rows");
assert.match(outgrowerSource, /function loadFarmerActivities\(house\)/, "outgrower should load farmer activities by selected batch");

assert.match(outgrowerSource, /function renderActivityTabs\(/, "outgrower should render activity tabs");
assert.match(outgrowerSource, /data-activity-tab/, "outgrower activity tabs should be clickable");
assert.match(outgrowerSource, /function renderScheduleActivityPanel\(/, "outgrower should render a schedule activity panel");
assert.match(outgrowerSource, /function renderFarmerActivityPanel\(/, "outgrower should render a farmer activity panel");
assert.match(outgrowerSource, /function renderActivitySection\(/, "outgrower should render the parent-style Activity section");

assert.match(renderHouseDetail, /renderActivitySection\(house\)/, "outgrower detail should use the Activity section instead of the simple schedule panel");
assert.match(renderHouseDetail, /loadSchedules\(house\)\.then/, "outgrower detail should load schedule rows after rendering");
assert.match(renderHouseDetail, /loadFarmerActivities\(house\)\.then/, "outgrower detail should load farmer activity rows after rendering");
assert.doesNotMatch(renderHouseDetail, /<h2>Schedules<\/h2>/, "outgrower detail should not render the old standalone Schedules panel");

assert.match(outgrowerCss, /\.activity-panel\s*\{/, "outgrower CSS should include activity panel layout");
assert.match(outgrowerCss, /\.activity-tabs\s*\{/, "outgrower CSS should include tab styling");
assert.match(outgrowerCss, /\.schedule-status-filter\s*\{/, "outgrower CSS should include schedule status filter styling");
assert.match(outgrowerCss, /\.activity-status-pill\s*\{/, "outgrower CSS should include status pill styling");
assert.match(outgrowerCss, /\.activity-empty-row\s*\{/, "outgrower CSS should include table empty row styling");

console.log("outgrower activity section test passed");
