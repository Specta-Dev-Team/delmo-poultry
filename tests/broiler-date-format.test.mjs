import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../broiler.js", import.meta.url), "utf8");
const cardStart = source.indexOf("function renderHouseCard");
assert.notEqual(cardStart, -1, "Broiler card renderer should exist");
const cardEnd = source.indexOf("function renderTransferAction", cardStart);
const cardMarkup = source.slice(cardStart, cardEnd);

assert.match(cardMarkup, /metric\("Placement Date",\s*escapeHtml\(formatDate\(getHousePlacementDate\(house\)\)\)\)/, "Broiler placement date should use the shared formatted date");
assert.match(cardMarkup, /metric\("Expected Production Date",\s*escapeHtml\(formatDate\(getHouseHarvestDate\(house\)\s*\|\|\s*"-"\)\)\)/, "Broiler expected production date should use the shared formatted date");

console.log("broiler date format test passed");
