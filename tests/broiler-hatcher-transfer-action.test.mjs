import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../broiler.js", import.meta.url), "utf8");

assert.doesNotMatch(source, /hatcherTransfer/, "Broiler should not expose the Grower To Layer action");
assert.doesNotMatch(source, /Grower To Layer/, "Broiler should not label any action Grower To Layer");
assert.doesNotMatch(source, /transid:\s*["']layer["']/, "Broiler should not configure the layer tstruct");

console.log("broiler Grower To Layer action removal test passed");
