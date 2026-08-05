import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function readSource(fileName) {
  return readFileSync(new URL(`../${fileName}`, import.meta.url), "utf8");
}

function getFunctionBlock(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
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
      if (opened && depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`${functionName} block should close`);
}

const sources = {
  parent: readSource("parent.js"),
  grandparent: readSource("grandparent.js"),
  layers: readSource("layers.js"),
  broiler: readSource("broiler.js"),
  outgrower: readSource("outgrower.js"),
};

for (const [screen, source] of Object.entries(sources)) {
  assert.doesNotMatch(source, new RegExp(["Live", "hens"].join(" "), "i"), `${screen} should not show the old live count copy`);
}

assert.match(sources.parent, /contextItem\("Live birds"/, "parent detail metric should be labelled Live birds");
assert.match(sources.grandparent, /contextItem\("Live birds"/, "grandparent detail metric should be labelled Live birds");

for (const screen of ["grandparent", "layers", "broiler", "outgrower"]) {
  const block = getFunctionBlock(sources[screen], "mapHouseRow");
  assert.match(block, /hasTotalBirds/, `${screen} should detect whether totalbirds was supplied`);
  assert.match(block, /liveHens:\s*hasTotalBirds\s*\?\s*totalBirds/, `${screen} live count should prefer datasource totalbirds`);
}

assert.match(
  getFunctionBlock(sources.grandparent, "mapBatchRow"),
  /liveHens:\s*hasTotalBirds\s*\?\s*totalBirds/,
  "grandparent batch details should prefer datasource totalbirds",
);

assert.match(
  getFunctionBlock(sources.outgrower, "applyBatchDetailRow"),
  /house\.hasTotalBirds\s*=\s*true/,
  "outgrower batch detail aggregation should remember datasource totalbirds",
);

assert.match(
  getFunctionBlock(sources.outgrower, "finalizeBatchHouse"),
  /house\.liveHens\s*=\s*house\.hasTotalBirds\s*\?\s*house\.totalBirds/,
  "outgrower final live count should preserve datasource totalbirds",
);

console.log("live birds totalbirds mapping test passed");
