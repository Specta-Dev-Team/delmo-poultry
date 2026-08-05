# Outgrower Chart Datasource Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bind Outgrower charts to `poultry_card_chart_details` and remove synthetic chart data.

**Architecture:** Port the Parent/Grandparent chart pipeline into Outgrower: configure the chart datasource, map rows into dated metric records, fetch by batch ID when opening a detail card, and aggregate records by the selected range. Empty datasource results use chart placeholders.

**Tech Stack:** Vanilla JavaScript and Node.js `assert` source-level tests.

## Global Constraints

- Query `poultry_card_chart_details` with `batchid` and `batch_id`.
- Do not generate chart points with `makeRangeValues` or seed charts with `defaultMetrics`.
- Preserve Outgrower chart controls and existing chart rendering styles.

---

### Task 1: Bind Outgrower charts to the datasource

**Files:**
- Modify: `outgrower.js:53-77, 1460-1487, 1519-1550, 1930-1980, 2230-2260, 2509-2585`
- Create: `tests/outgrower-chart-datasource.test.mjs`

**Interfaces:**
- Consumes: `loadRows`, Outgrower batch IDs, chart range controls, and the existing `drawReservedChartPlaceholders` function.
- Produces: `DATA_SOURCES.charts`, `mapChartRows`, `loadCharts`, and datasource-backed `getChartSeries`/`drawHouseCharts` behavior.

- [ ] **Step 1: Write the failing test**

```js
assert.match(source, /charts:\s*\{\s*name:\s*"poultry_card_chart_details"\s*\}/);
assert.match(loadCharts, /DATA_SOURCES\.charts\.name/);
assert.match(loadCharts, /batchid:\s*batchId/);
assert.match(loadCharts, /batch_id:\s*batchId/);
assert.match(loadCharts, /mapChartRows\(/);
assert.doesNotMatch(source, /function\s+makeRangeValues\s*\(/);
assert.doesNotMatch(source, /function\s+defaultMetrics\s*\(/);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node tests/outgrower-chart-datasource.test.mjs`

Expected: FAIL because Outgrower has no chart datasource and still defines synthetic metrics helpers.

- [ ] **Step 3: Implement the datasource chart pipeline**

Add the chart datasource configuration, map datasource rows using the same date and metric aliases as Parent/Grandparent, load rows for the selected batch, assign the mapped result to `house.metrics` after detail rendering, and make `getChartSeries` aggregate datasource records. Remove `defaultMetrics`, `makeRangeValues`, and their calls; retain the existing no-record placeholder path.

- [ ] **Step 4: Run focused verification**

Run: `node --check outgrower.js; node tests/outgrower-chart-datasource.test.mjs`

Expected: syntax check exits 0 and the test prints `outgrower chart datasource test passed`.
