import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = parentSource.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = parentSource.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return parentSource.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const buildTstructTargetParams = getFunctionBlock("buildTstructTargetParams");
const cleanTargetParams = getFunctionBlock("cleanTargetParams");
const normalizeIndexPart = getFunctionBlock("normalizeIndexPart");
const splitTstructTargetParams = getFunctionBlock("splitTstructTargetParams");
const normalizeTstructParamKey = getFunctionBlock("normalizeTstructParamKey");
const appendMissingTstructTargetParams = getFunctionBlock("appendMissingTstructTargetParams");
const isMortalityTstruct = getFunctionBlock("isMortalityTstruct");
const getMortalityTargetParamEntries = getFunctionBlock("getMortalityTargetParamEntries");
const applyContextToTstruct = getFunctionBlock("applyContextToTstruct");
const actionContext = getFunctionBlock("actionContext");

const buildParams = Function(`
const targetParamIndex = new Map();
function getCachedTargetParams() { return ""; }
${cleanTargetParams}
${normalizeIndexPart}
${splitTstructTargetParams}
${normalizeTstructParamKey}
${appendMissingTstructTargetParams}
${isMortalityTstruct}
${getMortalityTargetParamEntries}
${buildTstructTargetParams}
return buildTstructTargetParams;
`)();

assert.match(actionContext, /farmName/, "Parent action context should carry farm/branch for mortality prefill");
assert.match(buildTstructTargetParams, /isMortalityTstruct\(context\)/, "Parent target params should branch for mortality");

[
  "farm",
  "locationid",
  "batch",
  "batchunit",
  "unit",
  "unitid",
  "batchhouse",
  "house",
  "sublocationid",
  "mortsublocation",
].forEach((fieldName) => {
  assert.match(getMortalityTargetParamEntries, new RegExp(`\\["${fieldName}"`), `mortality URL params should include ${fieldName}`);
});

assert.match(
  applyContextToTstruct,
  /fieldNames:\s*\["farm", "branch"\]/,
  "mortality prefill should set the Farm field before dependent fields",
);
assert.match(
  applyContextToTstruct,
  /\["batchunit", "unit", "unitid", "locationid"\]/,
  "mortality unit prefill should target real Unit fields",
);
assert.match(
  applyContextToTstruct,
  /\["batchhouse", "house", "sublocationid", "mortsublocation"\]/,
  "mortality house prefill should target real House fields",
);
assert.match(
  applyContextToTstruct,
  /\["batch", "batchid", "nbatch"\]/,
  "mortality batch prefill should target the real Batch field",
);

assert.doesNotMatch(
  buildTstructTargetParams,
  /entries\.push\(\["batch",\s*batchTargetValue\]\)/,
  "generic placement target params should not receive batch prefill",
);

assert.equal(
  buildParams({
    actionKey: "placement",
    transid: "btplc",
    unitName: "UNIT ONE",
    houseName: "HOUSE ONE",
    batchCode: "B001",
    targetParams: "unit=UNIT ONE&house=HOUSE ONE",
  }),
  "unit=UNIT ONE&house=HOUSE ONE",
  "non-mortality target params should stay untouched",
);

const mortalityParams = buildParams({
  actionKey: "mortality",
  transid: "morta",
  farmName: "WARADALA FARM",
  unitId: "U001",
  unitName: "UNIT ONE",
  houseId: "H001",
  houseName: "HOUSE ONE",
  batchCode: "B001",
  targetParams: "unit=UNIT ONE&house=HOUSE ONE",
});

assert.match(mortalityParams, /farm=WARADALA FARM/, "mortality params should append farm");
assert.match(mortalityParams, /locationid=U001/, "mortality params should append locationid");
assert.match(mortalityParams, /batch=B001/, "mortality params should append batch");
assert.match(mortalityParams, /batchunit=UNIT ONE/, "mortality params should append batchunit");
assert.match(mortalityParams, /batchhouse=HOUSE ONE/, "mortality params should append batchhouse");
assert.match(mortalityParams, /sublocationid=H001/, "mortality params should append sublocationid");
assert.match(mortalityParams, /mortsublocation=HOUSE ONE/, "mortality params should append mortsublocation");

console.log("parent mortality prefill test passed");
