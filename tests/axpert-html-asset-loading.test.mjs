import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(fileName) {
  return readFileSync(new URL(`../${fileName}`, import.meta.url), "utf8");
}

for (const [fileName, scriptName, cssName] of [
  ["parent.html", "parent.js", "parent.css"],
  ["broiler.html", "broiler.js", "broiler.css"],
  ["setter.html", "setter.js", "setter.css"],
]) {
  const html = read(fileName);
  assert.doesNotMatch(html, new RegExp(`<link\\s+rel="stylesheet"\\s+href="${cssName}"`, "i"), `${fileName} should not directly link ${cssName}`);
  assert.doesNotMatch(html, new RegExp(`<script\\s+src="${scriptName}"`, "i"), `${fileName} should not directly load ${scriptName}`);
  assert.match(html, /var isAxpertHtmlPage = \/\\\/HTMLPages\\\//i, `${fileName} should detect Axpert HTMLPages`);
  assert.match(html, /document\.createElement\("link"\)/, `${fileName} should inject local CSS only outside Axpert`);
  assert.match(html, /document\.createElement\("script"\)/, `${fileName} should inject local JS only outside Axpert`);
}

console.log("axpert html asset loading test passed");
