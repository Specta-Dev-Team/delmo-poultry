import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");
const parentStyles = readFileSync(new URL("../parent.css", import.meta.url), "utf8");

const start = parentSource.indexOf("<section class=\"context-strip\">");
assert.notEqual(start, -1, "Parent detail should render the context strip");
const end = parentSource.indexOf("</section>", start);
const contextMarkup = parentSource.slice(start, end);

for (const label of ["Batch birds", "Male live birds", "Female live birds", "Male dead birds", "Female dead birds"]) {
  assert.match(contextMarkup, new RegExp(`contextItem\\(\\\"${label}\\\"`), `${label} should be shown in the Parent context strip`);
}
assert.doesNotMatch(contextMarkup, /contextItem\("Mortality"/, "Parent context strip should remove the Mortality tile");
assert.match(parentStyles, /\.context-strip\s*\{[\s\S]*grid-template-columns:\s*repeat\(5,/, "Parent context tiles should fit five metrics on wide screens");

console.log("parent gendered bird metrics test passed");
