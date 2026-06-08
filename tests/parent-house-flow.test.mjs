import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.doesNotMatch(indexSource, /data-screen="farm"/);
assert.doesNotMatch(indexSource, />\s*Farms\s*</);
assert.doesNotMatch(appSource, /function renderFarm\(/);
assert.doesNotMatch(appSource, /data-farm-id/);
assert.doesNotMatch(appSource, /screen === "farm"/);
assert.match(appSource, /getAssignedFarmHouses/);
assert.match(appSource, /house-card-grid/);
assert.match(appSource, /data-house-id/);
assert.doesNotMatch(appSource, /summary\.healthTasks/);
assert.doesNotMatch(appSource, /hero-panel/);
assert.doesNotMatch(appSource, /kpi-grid/);
assert.doesNotMatch(appSource, /Operations queue/);
assert.doesNotMatch(appSource, /Day report/);
assert.doesNotMatch(appSource, /Open selected house charts/);

console.log("parent-to-house flow test passed");
