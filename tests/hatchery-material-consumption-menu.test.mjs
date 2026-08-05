import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../hatchery.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../hatchery.html", import.meta.url), "utf8");

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

const renderBatchCard = getFunctionBlock("renderBatchCard");
const buildTstructTargetParams = getFunctionBlock("buildTstructTargetParams");
const buildTstructUrl = getFunctionBlock("buildTstructUrl");

assert.match(html, /<link rel="stylesheet" href="hatchery\.css">/, "Hatchery should load its stylesheet");
assert.match(
  source,
  /materialConsumption:\s*\{\s*title:\s*"Material Consumption Note",\s*transid:\s*"fdcon"\s*\}/,
  "Hatchery should configure Material Consumption Note with fdcon",
);
assert.match(
  renderBatchCard,
  /<details class="card-menu">[\s\S]*aria-label="Batch actions"[\s\S]*data-tstruct-action="materialConsumption"[\s\S]*data-batch-id="\$\{escapeAttribute\(batchId\)\}"[\s\S]*Material Consumption Note/,
  "every Hatchery batch card should expose Material Consumption Note in a three-dot menu",
);
assert.match(
  buildTstructTargetParams,
  /transid\s*===\s*"fdcon"[\s\S]*\["tobatch",\s*batchTargetValue\]/,
  "Material Consumption Note should send the selected batch as tobatch",
);
assert.match(
  buildTstructUrl,
  /buildTstructTargetParams\(transid,\s*context\)/,
  "TStruct target parameters should receive the transaction ID",
);

console.log("hatchery material consumption menu test passed");
