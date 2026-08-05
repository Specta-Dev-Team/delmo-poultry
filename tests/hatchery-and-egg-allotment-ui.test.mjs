import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(fileName) {
  return readFileSync(new URL(`../${fileName}`, import.meta.url), "utf8");
}

const setterJs = read("setter.js");
const setterHtml = read("setter.html");
const setterCss = read("setter.css");

assert.match(setterHtml, /<title>Hatchery Operations<\/title>/, "browser title should use Hatchery");
assert.match(setterHtml, /aria-label="Hatchery actions"/, "action region should use Hatchery");
assert.match(setterHtml, /aria-label="Hatchery batches"/, "batch region should use Hatchery");
assert.match(setterJs, /<h2>Hatchery Operations<\/h2>/, "screen heading should use Hatchery");
assert.match(setterJs, /placeholder="Search hatchery batches\.\.\."/, "search placeholder should use Hatchery");
assert.match(setterJs, /aria-label="Search hatchery batches"/, "search aria label should use Hatchery");
assert.match(setterJs, /<small>Hatchery batch<\/small>/, "card subline should use Hatchery");
assert.match(setterJs, /No hatchery batches found\./, "empty state should use Hatchery");
assert.doesNotMatch(setterJs, /infertile-badge|Infertile/, "Setter/Hatchery cards should not render the infertile badge");
assert.doesNotMatch(setterCss, /\.infertile-badge/, "Infertile badge styling should be removed when the tag is removed");

for (const fileName of ["parent.js", "grandparent.js", "layers.js"]) {
  const source = read(fileName);
  assert.doesNotMatch(source, /Egg Allotment|eggAllotment|eggal/, `${fileName} should not expose Egg Allotment`);
}

console.log("hatchery and egg allotment UI test passed");
