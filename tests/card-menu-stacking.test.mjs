import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cssFiles = [
  "parent.css",
  "grandparent.css",
  "layers.css",
  "broiler.css",
  "outgrower.css",
  "setter.css",
];

for (const fileName of cssFiles) {
  const source = readFileSync(new URL(`../${fileName}`, import.meta.url), "utf8");

  assert.match(
    source,
    /\.house-card\s*\{[\s\S]*position:\s*relative;/,
    `${fileName} should create a stacking context for house cards`,
  );
  assert.match(
    source,
    /\.house-card:has\(details\[open\]\),\s*\.house-card\.menu-open\s*\{[\s\S]*z-index:\s*100;/,
    `${fileName} should raise cards while their action menu is open`,
  );
  assert.match(
    source,
    /\.card-menu\s+\.command-popover\s*\{[\s\S]*z-index:\s*110;/,
    `${fileName} should keep card action popovers above following cards and separators`,
  );
}

console.log("card menu stacking test passed");
