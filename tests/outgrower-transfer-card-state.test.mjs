import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../outgrower.css", import.meta.url), "utf8");

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

const renderHouseCard = getFunctionBlock("renderHouseCard");
const renderHarvestAction = getFunctionBlock("renderHarvestAction");

assert.match(renderHouseCard, /live-transfer-card/, "transfer cards should expose the live transfer state class");
assert.match(renderHouseCard, /ready-harvest-card/, "harvest cards should expose the ready harvest state class");
assert.match(renderHouseCard, /Ready for transfer/, "ready cards should show a visible transfer state badge");
assert.match(renderHarvestAction, /transfer-request-button/, "the transfer request button should have a dedicated visual hook");
assert.match(styles, /\.ready-harvest-card/, "ready harvest cards should have a distinct blue treatment");
assert.match(styles, /\.live-transfer-card/, "live transfer cards should have a distinct green treatment");
assert.match(styles, /\.transfer-request-button/, "the transfer request button should have a distinct treatment");
assert.match(styles, /#EFF6FF/, "ready harvest cards should use the requested blue background");
assert.match(styles, /#BFDBFE/, "ready harvest cards should use the requested blue border");
assert.match(styles, /#2563EB/, "ready harvest actions should use the requested blue");
assert.match(styles, /#1D4ED8/, "ready harvest actions should use the requested blue hover color");
assert.match(styles, /#DBEAFE/, "ready harvest badges should use the requested blue tint");
assert.match(styles, /#1E40AF/, "ready harvest badges should use the requested dark blue text");
assert.match(styles, /#E8F3EA/, "live transfer cards should use the muted darker green background");
assert.match(styles, /#9BC8A6/, "live transfer cards should use the muted green border");
assert.match(styles, /#3F8F5B/, "live transfer actions should use the muted darker green");
assert.match(styles, /#34764A/, "live transfer actions should use the muted darker green hover color");
assert.match(styles, /#D8EBDD/, "live transfer badges should use the muted green tint");
assert.match(styles, /#285C35/, "live transfer badges should use the muted dark green text");
const transferStart = styles.indexOf(".live-transfer-card");
const transferEnd = styles.indexOf(".house-card-header", transferStart);
const transferStyles = styles.slice(transferStart, transferEnd);
assert.doesNotMatch(transferStyles, /var\(--accent-violet\)|var\(--tint-violet\)/, "the transfer state should not use the previous violet theme");

console.log("outgrower transfer card state test passed");
