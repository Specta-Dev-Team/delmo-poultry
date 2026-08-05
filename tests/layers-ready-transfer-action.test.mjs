import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../layers.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const match = new RegExp(`(?:async\\s+)?function\\s+${functionName}\\s*\\(`).exec(source);
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

const renderTransferAction = getFunctionBlock("renderTransferAction");
assert.match(renderTransferAction, /if\s*\(!hasPlacementDone\(house\)\)\s*return\s*""/, "cards with Placement available should hide transfer actions");
assert.match(renderTransferAction, /Ready To Transfer Update/, "completed-placement cards should show Ready To Transfer Update");
assert.match(renderTransferAction, /Live Bird Transfer Request/, "ready cards should show Live Bird Transfer Request");

console.log("layers ready-to-transfer action test passed");
