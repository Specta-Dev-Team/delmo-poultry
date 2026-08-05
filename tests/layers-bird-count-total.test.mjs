import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../layers.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const functionPattern = new RegExp(`(?:async\\s+)?function\\s+${functionName}\\s*\\(`);
  const match = functionPattern.exec(source);
  assert.ok(match, `${functionName} should exist`);

  const start = match.index;
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${functionName} block should close`);
}

const birdCountLabel = getFunctionBlock("birdCountLabel");
const renderHouseCard = getFunctionBlock("renderHouseCard");

assert.match(birdCountLabel, /formatNumber\(house\.totalBirds\)/, "Layers Bird count should use totalbirds");
assert.doesNotMatch(birdCountLabel, /femaleBirds|maleBirds/, "Layers Bird count should not split male and female values");
assert.match(renderHouseCard, /metric\("Bird count",\s*birdCountLabel\(house\)\)/, "Layers cards should render the total Bird count tile");

console.log("layers Bird count total test passed");
