import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

assert.match(parentSource, /lighting:\s*\{\s*title:\s*"Lighting Management",\s*transid:\s*"light"\s*\}/, "Parent should register the Lighting Management TStruct");
assert.match(parentSource, /environment:\s*\{\s*title:\s*"Environment Monitoring",\s*transid:\s*"envnm"\s*\}/, "Parent should register the Environment Monitoring TStruct");
assert.match(parentSource, /const CARD_ACTIONS = \["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water"\]/, "Parent house dropdown should include lighting and environment actions");
assert.match(parentSource, /const DETAIL_ACTIONS = \["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water", "hatcherTransfer"\]/, "Parent Entry menu should include lighting and environment actions");
assert.match(parentSource, /lighting:\s*"M9 18h6/, "Parent should define a Lighting Management icon");
assert.match(parentSource, /environment:\s*"M12 2v20/, "Parent should define an Environment Monitoring icon");

console.log("parent environment and lighting actions test passed");
