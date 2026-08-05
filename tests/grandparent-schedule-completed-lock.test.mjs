import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../grandparent.js", import.meta.url), "utf8");

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

const renderScheduleStatusEditButton = getFunctionBlock("renderScheduleStatusEditButton");
const renderScheduleRows = getFunctionBlock("renderScheduleRows");

assert.match(
  renderScheduleStatusEditButton,
  /normalizeActivityStatus\(status\)\s*!==\s*"Pending"[\s\S]*return\s+""/,
  "completed Grandparent schedules should not render an Edit button",
);
assert.match(
  renderScheduleRows,
  /renderScheduleStatusEditButton\(index,\s*rowId,\s*status\)/,
  "Grandparent schedule rows should pass their status to the edit-button renderer",
);
assert.match(
  source,
  /const schedule = getScheduleRowFromButton\(house, scheduleEditButton\);[\s\S]*normalizeActivityStatus\(schedule\.status\)\s*!==\s*"Pending"[\s\S]*return;/,
  "completed Grandparent schedules should not open the Schedule Monitoring form",
);

console.log("grandparent schedule completed lock test passed");
