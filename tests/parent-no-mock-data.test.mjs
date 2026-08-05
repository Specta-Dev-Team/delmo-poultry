import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

assert.match(parentSource, /const houses = \[\];/);
assert.doesNotMatch(parentSource, /Parent Brooding House/);
assert.doesNotMatch(parentSource, /Parent Grower Annex/);
assert.doesNotMatch(parentSource, /Parent Pre Layer House/);
assert.doesNotMatch(parentSource, /Parent Layer House/);
assert.doesNotMatch(parentSource, /BR BATCH 001/);
assert.doesNotMatch(parentSource, /GP BATCH 015/);
assert.doesNotMatch(parentSource, /Some medication/);
assert.doesNotMatch(parentSource, /getMockUnitOptions/);
assert.doesNotMatch(parentSource, /WARADALA POULTRY/);
assert.doesNotMatch(parentSource, /WARADALA PULLOUT/);
assert.doesNotMatch(parentSource, /poultry_parent_charts/);
assert.doesNotMatch(parentSource, /poultry_parent_schedules/);
assert.doesNotMatch(parentSource, /makeRangeValues/);
assert.doesNotMatch(parentSource, /drawLineChart/);

console.log("parent mock data removal test passed");
