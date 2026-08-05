import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");
const cardStart = source.indexOf("function renderHouseCard");
assert.notEqual(cardStart, -1, "Out Grower card renderer should exist");
const cardEnd = source.indexOf("function renderHarvestAction", cardStart);
const cardMarkup = source.slice(cardStart, cardEnd);

assert.match(source, /function formatDate\(value\)/, "Out Grower should define a date formatter");
assert.match(cardMarkup, /metric\("Placement Date",\s*escapeHtml\(formatDate\(getHousePlacementDate\(house\)\)\)\)/, "Out Grower placement date should use the formatted date");
assert.match(cardMarkup, /metric\("Expected Production Date",\s*escapeHtml\(formatDate\(getHouseHarvestDate\(house\)\s*\|\|\s*"-"\)\)\)/, "Out Grower expected production date should use the formatted date");

console.log("outgrower date format test passed");
