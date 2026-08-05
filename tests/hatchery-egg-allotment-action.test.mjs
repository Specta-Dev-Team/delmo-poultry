import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../hatchery.html", import.meta.url), "utf8");
const source = readFileSync(new URL("../hatchery.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const match = new RegExp(`function\\s+${functionName}\\s*\\(`).exec(source);
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

const renderListActions = getFunctionBlock("renderListActions");

assert.match(html, /<script src="hatchery\.js"><\/script>/, "Hatchery should load hatchery.js");
assert.match(
  renderListActions,
  /data-tstruct-action="eggGrading"[\s\S]*<span>Egg Grading<\/span>[\s\S]*data-tstruct-action="eggAllotment"[\s\S]*<span>Add Egg Allotment<\/span>/,
  "Egg Grading and Add Egg Allotment should be adjacent",
);
assert.match(
  source,
  /eggGrading:\s*\{\s*title:\s*"Egg Grading",\s*transid:\s*"eggal"\s*\}/,
  "Egg Grading should open the eggal TStruct",
);
assert.match(
  source,
  /eggAllotment:\s*\{\s*title:\s*"Egg Allotment",\s*transid:\s*"egall"\s*\}/,
  "Egg Allotment should open the egall TStruct",
);

console.log("hatchery egg allotment action test passed");
