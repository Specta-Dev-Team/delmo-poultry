import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(appSource, /from "\.\/app-data\.js"/);
assert.doesNotMatch(appSource, /\.mjs/);

console.log("browser module path test passed");
