import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layersSource = readFileSync(new URL("../layers.js", import.meta.url), "utf8");

assert.match(
  layersSource,
  /lighting:\s*\{\s*title:\s*"Lighting Management",\s*transid:\s*"light"\s*\}/,
  "Layers should register the Lighting Management TStruct",
);
assert.match(
  layersSource,
  /environment:\s*\{\s*title:\s*"Environment Monitoring",\s*transid:\s*"envnm"\s*\}/,
  "Layers should register the Environment Monitoring TStruct",
);
assert.match(
  layersSource,
  /cardActions:\s*\[[^\]]*"lighting"[^\]]*"environment"[^\]]*\]/,
  "Layers house dropdown should include lighting and environment actions",
);
assert.match(
  layersSource,
  /\{\s*key:\s*"lighting",\s*icon:\s*"M9 18h6/,
  "Layers Entry menu should include the Lighting Management action",
);
assert.match(
  layersSource,
  /\{\s*key:\s*"environment",\s*icon:\s*"M12 2v20/,
  "Layers Entry menu should include the Environment Monitoring action",
);

console.log("layers environment and lighting actions test passed");
