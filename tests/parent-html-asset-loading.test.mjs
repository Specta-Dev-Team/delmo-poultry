import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentHtml = readFileSync(new URL("../parent.html", import.meta.url), "utf8");

assert.doesNotMatch(parentHtml, /<link rel="stylesheet" href="parent\.css" \/>/);
assert.doesNotMatch(parentHtml, /<script src="parent\.js"><\/script>/);
assert.match(parentHtml, /var isAxpertHtmlPage = \/\\\/HTMLPages\\\//i);
assert.match(parentHtml, /document\.createElement\("link"\)/);
assert.match(parentHtml, /document\.createElement\("script"\)/);

console.log("parent html asset loading test passed");
