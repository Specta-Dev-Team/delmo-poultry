import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../outgrower.html", import.meta.url), "utf8");

assert.doesNotMatch(html, /<script\s+src="outgrower\.js"><\/script>/i, "Axpert HTML should not load the local Out Grower script directly");
assert.match(html, /var isAxpertHtmlPage = \/\\\/HTMLPages\\\//i, "Out Grower should detect Axpert HTMLPages");
assert.match(html, /document\.createElement\("script"\)/, "standalone Out Grower should inject its local script dynamically");

console.log("outgrower Axpert script loading test passed");
