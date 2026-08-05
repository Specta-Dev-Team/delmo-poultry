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

const callAxpertDataSourceFunction = getFunctionBlock("callAxpertDataSourceFunction");
const loadRows = getFunctionBlock("loadRows");
const loadUnitOptions = getFunctionBlock("loadUnitOptions");
const loadHouses = getFunctionBlock("loadHouses");
const loadScreenData = getFunctionBlock("loadScreenData");
const reloadCurrentFrame = getFunctionBlock("reloadCurrentFrame");
const handleClick = getFunctionBlock("handleClick");

assert.match(handleClick, /reloadCurrentFrame\(\)/, "refresh button should use the backup frame reload behavior");
assert.match(reloadCurrentFrame, /window\.location\.reload\(\)/, "frame reload should call window.location.reload when available");
assert.match(reloadCurrentFrame, /renderHouseDetail\(selectedHouseId\)/, "frame reload fallback should rerender selected house detail");
assert.match(reloadCurrentFrame, /renderHouses\(currentSearchValue\)/, "frame reload fallback should rerender house list");
assert.match(loadScreenData, /const forceReload = Boolean\(options && options\.forceReload\)/, "screen reload should track force reload state");
assert.match(loadScreenData, /loadUnitOptions\(\{\s*forceReload\s*\}\)/, "forced reload should refresh unit datasource");
assert.match(loadScreenData, /loadHouses\(\{\s*unit,\s*unitOptions,\s*forceReload\s*\}\)/, "forced reload should refresh house datasource");
assert.match(loadUnitOptions, /loadRows\(DATA_SOURCES\.units\.name,\s*parameters,\s*\{\s*forceReload: options && options\.forceReload\s*\}\)/, "unit rows should receive force reload option");
assert.match(loadHouses, /loadRows\(DATA_SOURCES\.parentBatchDetails\.name,\s*\{\s*unit:\s*unit\.value,\s*house:\s*""\s*\},\s*\{\s*forceReload: options && options\.forceReload\s*\}\)/, "batch rows should receive force reload option");
assert.match(loadRows, /callAxpertDataSourceFunction\(dataSourceName,\s*parameters \|\| \{\},\s*options \|\| \{\}\)/, "row loader should forward reload options to Axpert caller");
assert.match(callAxpertDataSourceFunction, /refreshCache:\s*Boolean\(options && options\.forceReload\)/, "AxList requests should set refreshCache on forced reload");
assert.ok(
  callAxpertDataSourceFunction.indexOf("GetDataFromAxList") < callAxpertDataSourceFunction.indexOf("GetIViewData"),
  "AxList should be attempted before IView data like the backup implementation",
);

console.log("parent reload test passed");
