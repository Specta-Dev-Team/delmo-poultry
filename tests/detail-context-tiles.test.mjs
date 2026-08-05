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
      if (opened && depth === 0) return source.slice(start, index + 1);
    }
  }

  throw new Error(`${functionName} block should close`);
}

for (const fileName of ["layers.js", "broiler.js", "outgrower.js"]) {
  const source = readSource(fileName);
  const detailBlock = getFunctionBlock(source, "renderHouseDetail");
  const contextCalls = [...detailBlock.matchAll(/contextItem\("([^"]+)"/g)].map((match) => match[1]).slice(0, 3);

  assert.deepEqual(
    contextCalls,
    ["Batch birds", "Live birds", "Mortality"],
    `${fileName} detail context tiles should match parent/grandparent`,
  );
  assert.match(detailBlock, /formatNumber\(house\.liveHens\)/, `${fileName} Live birds tile should use liveHens`);
  assert.match(
    detailBlock,
    /`\$\{formatNumber\(house\.deadBirds\)\} \/ \$\{percentLabel\(mortalityRate\(house\)\)\}`/,
    `${fileName} Mortality tile should show count and rate`,
  );
}

console.log("detail context tiles test passed");
