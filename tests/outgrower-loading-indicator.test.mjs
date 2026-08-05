import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../outgrower.css", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);
  const remaining = source.slice(start + 1);
  const nextFunction = remaining.search(/\r?\n\s+(?:async\s+)?function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const renderHouses = getFunctionBlock("renderHouses");

assert.match(renderHouses, /if \(housesLoading\)/, "house rendering should still defer cards while data is pending");
assert.doesNotMatch(source, /renderHouseLoadingState|setOutgrowerLoading|loadingProgress|loadingTicker/, "the visible loader should be removed");
assert.doesNotMatch(styles, /\.outgrower-load-state|outgrower-load-shimmer|outgrower-load-pulse/, "loader styles should be removed");

console.log("outgrower loading indicator test passed");
