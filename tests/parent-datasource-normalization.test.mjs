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

const parseMaybeJson = getFunctionBlock("parseMaybeJson");
const normalizeRows = getFunctionBlock("normalizeRows");
const callAxpertDataSourceFunction = getFunctionBlock("callAxpertDataSourceFunction");
const toNumber = getFunctionBlock("toNumber");
const normalizeGlobalVarKey = getFunctionBlock("normalizeGlobalVarKey");
const getMatchingFieldValue = getFunctionBlock("getMatchingFieldValue");
const getOptionalNumber = getFunctionBlock("getOptionalNumber");
const cleanTargetParams = getFunctionBlock("cleanTargetParams");
const normalizeIndexPart = getFunctionBlock("normalizeIndexPart");
const uniqueValues = getFunctionBlock("uniqueValues");
const targetParamKeys = getFunctionBlock("targetParamKeys");
const rememberTargetParamsForHouse = getFunctionBlock("rememberTargetParamsForHouse");
const isCompletedFlag = getFunctionBlock("isCompletedFlag");
const mapBatchRow = getFunctionBlock("mapBatchRow");

const helpers = Function(`
const targetParamIndex = new Map();
${parseMaybeJson}
${normalizeRows}
${toNumber}
${normalizeGlobalVarKey}
${getMatchingFieldValue}
${getOptionalNumber}
${cleanTargetParams}
${normalizeIndexPart}
${uniqueValues}
${targetParamKeys}
${rememberTargetParamsForHouse}
${isCompletedFlag}
${mapBatchRow}
return { normalizeRows, mapBatchRow };
`)();

const axpertWrappedPayload = [{
  result: {
    message: "success",
    poultry_parent_batch_details: {
      data: [{
        unit: "WPA",
        unitname: "WARADALA POULTRY",
        id: "WAHO",
        code: "WAHO",
        housename: "WARADALA POUL HOUSE",
      }],
    },
  },
  success: true,
}];

assert.deepEqual(
  helpers.normalizeRows(axpertWrappedPayload, "poultry_parent_batch_details"),
  [{
    unit: "WPA",
    unitname: "WARADALA POULTRY",
    id: "WAHO",
    code: "WAHO",
    housename: "WARADALA POUL HOUSE",
  }],
  "Axpert datasource wrapper rows should be unwrapped",
);

assert.match(
  callAxpertDataSourceFunction,
  /AxGetSqlData/,
  "datasource loading should support the senior custom screen AxGetSqlData path",
);

assert.deepEqual(
  helpers.normalizeRows('{"result":[{"result":{"row":[{"locationcode":"UNIT1","locationname":"Parent Unit"}]}}]}', "poultry_unit_filter"),
  [{ locationcode: "UNIT1", locationname: "Parent Unit" }],
  "AxGetSqlData result[0].result.row payloads should be unwrapped",
);

const mappedHouse = helpers.mapBatchRow({
  unit: "WPA",
  unitname: "WARADALA POULTRY",
  id: "WARH",
  code: "WARH",
  housename: "WARADALA POUL HOUSE 2",
  batchid: "PPW/26/PS/BT000001",
  flockage: "42 days",
  malebirds: "10",
  femalebirds: "90",
  birdshoused: "100",
  deadbirds: "2",
  malelivebirds: "9",
  femalelivebirds: "89",
  maledeadbirds: "1",
  femaledeadbirds: "1",
  totalbirds: "98",
  mortalityrate: "2.00",
  totalfeedgivenkg: "120.5",
  feedperbird: "1.205",
  placementdate: "2026-06-01",
  harvestdate: "2026-12-01",
  status: "Active",
  batchactive: "T",
}, { value: "WPA", label: "WARADALA POULTRY" });

assert.equal(mappedHouse.id, "WARH");
assert.equal(mappedHouse.name, "WARADALA POUL HOUSE 2");
assert.equal(mappedHouse.batchId, "PPW/26/PS/BT000001");
assert.equal(mappedHouse.femaleBirds, 90);
assert.equal(mappedHouse.maleBirds, 10);
assert.equal(mappedHouse.birdsHoused, 100);
assert.equal(mappedHouse.liveHens, 98, "parent Live birds should use datasource totalbirds");
assert.equal(mappedHouse.maleLiveBirds, 10, "parent live tile should use the raw male birds count");
assert.equal(mappedHouse.femaleLiveBirds, 90, "parent live tile should use the raw female birds count");
assert.equal(mappedHouse.maleDeadBirds, 1, "parent cards should expose male dead birds");
assert.equal(mappedHouse.femaleDeadBirds, 1, "parent cards should expose female dead birds");
assert.equal(mappedHouse.mortalityRate, 2);
assert.equal(mappedHouse.feedPerBird, 1.205);
assert.equal(mappedHouse.status, "Active");

console.log("parent datasource normalization test passed");
