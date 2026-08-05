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

const renderHouses = getFunctionBlock("renderHouses");

assert.match(
  renderHouses,
  /if\s*\(\s*selectedFarmer\s*!==\s*"all"\s*\)\s*\{\s*houseGrid\.innerHTML\s*=\s*visibleHouses\.map\(renderHouseCard\)\.join\(""\)/,
  "outgrower should keep the flat house list when one farmer is selected",
);

assert.match(
  renderHouses,
  /const grouped\s*=\s*visibleHouses\.reduce\(\(result,\s*house\)\s*=>\s*\{[\s\S]*house\.farmerName[\s\S]*\},\s*\{\}\)/,
  "outgrower should group visible houses by farmer when All Farmers is selected",
);

assert.match(
  renderHouses,
  /<div class="unit-separator"><h3>\$\{escapeHtml\(farmerLabel\)\}<\/h3><hr\/><\/div>/,
  "outgrower should render parent-style separator lines for each farmer group",
);

assert.match(outgrowerCss, /\.unit-separator\s*\{/, "outgrower CSS should define the separator layout");
assert.match(outgrowerCss, /\.unit-separator h3\s*\{/, "outgrower CSS should style separator labels");
assert.match(outgrowerCss, /\.unit-separator hr\s*\{/, "outgrower CSS should style separator lines");

console.log("outgrower farmer grouping test passed");
