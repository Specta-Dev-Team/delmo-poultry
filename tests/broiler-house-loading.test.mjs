import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../broiler.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = source.indexOf(`async function ${functionName}(`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  let depth = 0;
  let opened = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
      opened = true;
    } else if (char === "}") {
      depth -= 1;
      if (opened && depth === 0) return source.slice(start, index + 1);
    }
  }

  throw new Error(`${functionName} block should close`);
}

const loadHouses = getFunctionBlock("loadHouses");

assert.match(source, /poultry_broiler_unit/, "Broiler unit datasource should remain wired");
assert.match(source, /poultry_broiler_house/, "Broiler house datasource should remain wired");
assert.match(source, /poultry_broiler_batch_details/, "Broiler batch details datasource should remain wired");

assert.match(
  loadHouses,
  /loadRowsFromAttempts\(AXPERT_DATASOURCES\.houses\.name,\s*houseAttempts,\s*loadOptions\)/,
  "Broiler house cards should start from the house datasource like Grand Parent",
);

assert.match(
  loadHouses,
  /loadRowsFromAttempts\(AXPERT_DATASOURCES\.broilerBatchDetails\.name,\s*batchAttempts,\s*loadOptions\)/,
  "Broiler should enrich house cards from batch details when unit-level batch rows exist",
);
assert.match(loadHouses, /mappedHouses\.push\(house\)/, "Broiler should keep house cards visible when no batch detail row exists");
assert.match(loadHouses, /mapBatchRow\(row,\s*findHouseForBatchRow\(row,\s*houseLookup\),\s*unitOption\)/, "Broiler should merge batch detail rows onto matching house rows");

console.log("broiler house loading test passed");
