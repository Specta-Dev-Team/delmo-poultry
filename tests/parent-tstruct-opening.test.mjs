import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const functionStart = parentSource.indexOf(`function ${functionName}`);
  assert.notEqual(functionStart, -1, `${functionName} should exist`);

  const start = parentSource.slice(0, functionStart).endsWith("async ") ? functionStart - "async ".length : functionStart;
  const remainingSource = parentSource.slice(functionStart + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return parentSource.slice(start, nextFunction === -1 ? undefined : functionStart + 1 + nextFunction);
}

const buildTstructUrl = getFunctionBlock("buildTstructUrl");
const buildTstructTargetParams = getFunctionBlock("buildTstructTargetParams");
const encodeTstructTargetParams = getFunctionBlock("encodeTstructTargetParams");
const splitTstructTargetParams = getFunctionBlock("splitTstructTargetParams");
const normalizeTstructParamKey = getFunctionBlock("normalizeTstructParamKey");
const appendMissingTstructTargetParams = getFunctionBlock("appendMissingTstructTargetParams");
const isMortalityTstruct = getFunctionBlock("isMortalityTstruct");
const getMortalityTargetParamEntries = getFunctionBlock("getMortalityTargetParamEntries");
const cleanTargetParams = getFunctionBlock("cleanTargetParams");
const normalizeIndexPart = getFunctionBlock("normalizeIndexPart");
const uniqueValues = getFunctionBlock("uniqueValues");
const targetParamKeys = getFunctionBlock("targetParamKeys");
const rememberTargetParamsForHouse = getFunctionBlock("rememberTargetParamsForHouse");
const getCachedTargetParams = getFunctionBlock("getCachedTargetParams");
const normalizeGlobalVarKey = getFunctionBlock("normalizeGlobalVarKey");
const parseMaybeJson = getFunctionBlock("parseMaybeJson");
const getMatchingFieldValue = getFunctionBlock("getMatchingFieldValue");
const normalizeTargetParamValue = getFunctionBlock("normalizeTargetParamValue");
const extractTargetParams = getFunctionBlock("extractTargetParams");
const loadTargetParamsForHouse = getFunctionBlock("loadTargetParamsForHouse");
const openTstruct = getFunctionBlock("openTstruct");
const actionContext = getFunctionBlock("actionContext");
const applyContextToTstruct = getFunctionBlock("applyContextToTstruct");
const targetParamFields = parentSource.match(/const TARGET_PARAM_FIELDS = \[[\s\S]*?\];/);
assert.ok(targetParamFields, "target param aliases should be declared");

const buildParams = Function(`
const targetParamIndex = new Map();
${normalizeGlobalVarKey}
${cleanTargetParams}
${normalizeIndexPart}
${uniqueValues}
${targetParamKeys}
${getCachedTargetParams}
${splitTstructTargetParams}
${normalizeTstructParamKey}
${appendMissingTstructTargetParams}
${isMortalityTstruct}
${getMortalityTargetParamEntries}
${buildTstructTargetParams}
return buildTstructTargetParams;
`)();

async function resolveTargetParams(rows) {
  let capturedDataSourceName = "";
  let capturedParameters = {};

  const loader = Function("loadRows", "getGlobalContext", "DATA_SOURCES", `
${targetParamFields[0]}
const targetParamIndex = new Map();
${normalizeGlobalVarKey}
${parseMaybeJson}
${getMatchingFieldValue}
${normalizeTargetParamValue}
${extractTargetParams}
${cleanTargetParams}
${normalizeIndexPart}
${uniqueValues}
${targetParamKeys}
${rememberTargetParamsForHouse}
${getCachedTargetParams}
${loadTargetParamsForHouse}
return loadTargetParamsForHouse;
`)(
    async (dataSourceName, parameters) => {
      capturedDataSourceName = dataSourceName;
      capturedParameters = parameters;
      return rows;
    },
    () => ({ branch: "MAIN" }),
    { targetParams: { name: "poultry_targetparams" } },
  );

  const targetParams = await loader({
    id: "H001",
    code: "H001",
    name: "House 1",
    unit: "UNIT1",
  });

  assert.equal(capturedDataSourceName, "poultry_targetparams");
  assert.deepEqual(capturedParameters, {
    branch: "MAIN",
    unit: "UNIT1",
    sublocation: "H001",
    housename: "House 1",
  });

  return targetParams;
}

assert.match(parentSource, /passContextInQuery:\s*true/, "TStruct URL context should stay enabled");
assert.match(parentSource, /targetParams:\s*\{\s*name:\s*"poultry_targetparams"\s*\}/, "target params datasource should be configured");
assert.match(encodeTstructTargetParams, /encodeURIComponent\(part\.slice\(equalsIndex \+ 1\)\)/, "target-param values should be URL encoded");
assert.match(buildTstructUrl, /buildTstructTargetParams\(context\)/, "TStruct URL should be driven by target params");
assert.match(buildTstructUrl, /&\$\{encodedParams\}&act=open/, "target params should be appended before act=open");
assert.match(buildTstructTargetParams, /context\.targetParams \|\| context\.targetparams/, "datasource target params should be reused");
assert.match(buildTstructTargetParams, /context\.batchCode \|\| context\.batchId/, "batch code and id should both be available for fallback params");
assert.match(rememberTargetParamsForHouse, /targetParamIndex\.set/, "target params should be cached like the senior custom screen lookup map");
assert.match(getCachedTargetParams, /targetParamIndex\.get/, "TStruct opening should reuse cached target params before re-querying");
assert.match(openTstruct, /await loadTargetParamsForTstruct\(pendingTstructContext\)/, "TStruct opening should resolve target params first");
assert.match(openTstruct, /tstructFrame\.src = buildTstructUrl\(action\.transid,\s*pendingTstructContext\)/, "TStruct iframe should open the built URL");
assert.match(actionContext, /targetParams/, "house action context should carry cached target params");
assert.match(parentSource, /function applyContextToTstruct\(\)/, "backup-style TStruct context prefill should run after iframe load");
assert.match(parentSource, /tstructFrame\.addEventListener\("load",\s*prefillTstructUnitContext\)/, "TStruct iframe load should trigger backup-style context prefill");
assert.match(applyContextToTstruct, /\["batch", "batchid", "batchno", "batchnumber"\]/, "backup-style batch field prefill should remain available");
assert.match(parentSource, /unit000F1/, "unit target parameter aliases should remain available for Axpert fields");
assert.match(parentSource, /house000F1/, "house target parameter aliases should remain available for Axpert fields");
assert.match(parentSource, /batchid/, "batch target parameter aliases should remain available for Axpert fields");

const mergedBatchParams = buildParams({
  module: "parent",
  unitId: "UNIT1",
  houseCode: "H001",
  batchId: "PPW/26/PS/BT000001",
  batchCode: "PPW/26/PS/BT000001",
  targetParams: "unit=UNIT1&house=H001",
});

assert.match(
  mergedBatchParams,
  /^unit=UNIT1&house=H001$/,
  "backup-style URL targetparams should stay exactly as returned by the datasource",
);

assert.equal(
  await resolveTargetParams([{ targetparams: "unit=UNIT1&house=H001&batch=B001" }]),
  "unit=UNIT1&house=H001&batch=B001",
  "target params should resolve from direct datasource aliases",
);

assert.equal(
  await resolveTargetParams([{ result: { openeriv: "unit=UNIT1&house=H001&batch=B002" } }]),
  "unit=UNIT1&house=H001&batch=B002",
  "target params should resolve from nested result payloads",
);

assert.equal(
  await resolveTargetParams([{ data: [{ value: "unit=UNIT1&house=H001&batch=B003" }] }]),
  "unit=UNIT1&house=H001&batch=B003",
  "target params should resolve from nested data rows even when the field name is not known",
);

console.log("parent TStruct opening simplification test passed");
