import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const match = new RegExp(`function\\s+${functionName}\\s*\\(`).exec(source);
  assert.ok(match, `${functionName} should exist`);

  const start = match.index;
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${functionName} block should close`);
}

const loadCharts = getFunctionBlock("loadCharts");

assert.match(
  source,
  /charts:\s*\{\s*name:\s*"poultry_card_chart_details"\s*\}/,
  "Outgrower should configure the shared chart datasource",
);
assert.match(loadCharts, /DATA_SOURCES\.charts\.name/, "Outgrower should load chart rows from the configured datasource");
assert.match(loadCharts, /batchid:\s*batchId/, "Outgrower should pass batchid to the chart datasource");
assert.match(loadCharts, /batch_id:\s*batchId/, "Outgrower should pass batch_id to the chart datasource");
assert.match(loadCharts, /mapChartRows\(/, "Outgrower should map chart datasource rows");
assert.doesNotMatch(source, /function\s+makeRangeValues\s*\(/, "Outgrower should not synthesize chart values");
assert.doesNotMatch(source, /function\s+defaultMetrics\s*\(/, "Outgrower should not seed dummy chart metrics");

console.log("outgrower chart datasource test passed");
