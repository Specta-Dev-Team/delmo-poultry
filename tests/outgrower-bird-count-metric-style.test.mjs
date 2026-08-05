import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const styles = readFileSync(new URL("../outgrower.css", import.meta.url), "utf8");
const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");
const match = styles.match(/\.metric strong \.bird-count-split\s*\{([\s\S]*?)\}/);
const fallbackBirdCount = source.match(/if \(!house\.hasGenderSplit[\s\S]*?return ([^;]+);/);

assert.ok(match, "Out Grower should style the split Bird count value");
assert.match(match[1], /font-size:\s*inherit/, "Bird count text should use the same size as other metric values");
assert.match(match[1], /font-weight:\s*inherit/, "Bird count text should use the same weight as other metric values");
assert.ok(fallbackBirdCount, "Bird count should have a fallback for cards without gender split data");
assert.equal(fallbackBirdCount[1].trim(), "formatNumber(house.birdsHoused)", "fallback Bird count should render as a value, not a label-sized nested span");

console.log("outgrower bird count metric style test passed");
