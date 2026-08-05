import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../grandparent.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../grandparent.css", import.meta.url), "utf8");

const start = source.indexOf("<section class=\"context-strip\">");
assert.notEqual(start, -1, "Grand Parent detail should render the context strip");
const end = source.indexOf("</section>", start);
const contextMarkup = source.slice(start, end);

for (const label of ["Batch birds", "Male live birds", "Female live birds", "Male dead birds", "Female dead birds"]) {
  assert.match(contextMarkup, new RegExp(`contextItem\\(\\\"${label}\\\"`), `${label} should be shown in the Grand Parent context strip`);
}
assert.doesNotMatch(contextMarkup, /contextItem\("Live birds"/, "Grand Parent context strip should replace the combined Live birds tile");
assert.doesNotMatch(contextMarkup, /contextItem\("Mortality"/, "Grand Parent context strip should replace the combined Mortality tile");
assert.match(styles, /\.context-strip\s*\{[\s\S]*grid-template-columns:\s*repeat\(5,/, "Grand Parent context tiles should fit five metrics on wide screens");
assert.match(source, /maleLiveBirds:\s*maleBirds/, "Grand Parent male live tile should use raw male birds");
assert.match(source, /femaleLiveBirds:\s*femaleBirds/, "Grand Parent female live tile should use raw female birds");

console.log("grandparent gendered bird metrics test passed");
