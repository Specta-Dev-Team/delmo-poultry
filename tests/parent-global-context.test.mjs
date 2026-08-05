import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = parentSource.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = parentSource.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return parentSource.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

assert.match(parentSource, /function readAxpertGlobalVar\(possibleKeys\)/);
assert.match(parentSource, /function extractAxpertGlobalVarValue\(source,\s*targetKeys,\s*visited\)/);
assert.match(parentSource, /readAxpertGlobalVar\(\["M_BRANCH", "M_BRANCHNAME", "branch", "branchname"\]\)/);
assert.match(parentSource, /readAxpertGlobalVar\(\["M_COMPANY", "M_COMPANYNAME", "company", "companyname"\]\)/);
assert.match(parentSource, /AxGetGlobalVar\(""\)/);

const normalizeGlobalVarKey = getFunctionBlock("normalizeGlobalVarKey");
const extractAxpertGlobalVarValue = getFunctionBlock("extractAxpertGlobalVarValue");

const extractValue = Function(`
${normalizeGlobalVarKey}
${extractAxpertGlobalVarValue}
return extractAxpertGlobalVarValue;
`)();

assert.equal(
  extractValue("PROCESSING PLANT -WARADALA", ["M_BRANCH"]),
  "PROCESSING PLANT -WARADALA",
  "plain string global vars should be returned as-is",
);

assert.equal(
  extractValue({ globalVars: [{ M_BRANCH: "PROCESSING PLANT -WARADALA" }] }, ["M_BRANCH"]),
  "PROCESSING PLANT -WARADALA",
  "global var dumps should be searchable by key",
);

console.log("parent global context test passed");
