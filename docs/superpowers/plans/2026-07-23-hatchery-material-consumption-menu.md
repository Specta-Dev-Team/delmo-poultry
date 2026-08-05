# Hatchery Material Consumption Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a per-card Hatchery menu that opens Material Consumption Note in TStruct `fdcon`.

**Architecture:** Add a `materialConsumption` entry to the existing Hatchery TStruct map. The batch-card renderer emits the established `details.card-menu` structure with a `data-tstruct-action` button and its `data-batch-id`; TStruct target-parameter construction receives the transaction ID and emits `tobatch` from that context for `fdcon`.

**Tech Stack:** Vanilla JavaScript and Node.js `assert` source-level tests.

## Global Constraints

- Every Hatchery batch card has one three-dot menu.
- Material Consumption Note opens `fdcon` with `tobatch` set to the clicked card batch ID.
- Existing card actions retain their behavior.

---

### Task 1: Add the per-card material-consumption menu

**Files:**
- Modify: `hatchery.html:33`
- Modify: `hatchery.js:8-12, 346-380`
- Create: `tests/hatchery-material-consumption-menu.test.mjs`

**Interfaces:**
- Consumes: `AXPERT_TSTRUCTS`, `renderBatchCard(batch)`, and the delegated `[data-tstruct-action]` click handler.
- Produces: `materialConsumption: { title: "Material Consumption Note", transid: "fdcon" }` and a batch-scoped menu action.

- [ ] **Step 1: Write the failing test**

```js
assert.match(source, /materialConsumption:\s*\{\s*title:\s*"Material Consumption Note",\s*transid:\s*"fdcon"\s*\}/);
assert.match(html, /<link rel="stylesheet" href="hatchery\.css">/);
assert.match(buildTstructTargetParams, /transid\s*===\s*"fdcon"[\s\S]*\["tobatch",\s*batchTargetValue\]/);
assert.match(buildTstructUrl, /buildTstructTargetParams\(transid,\s*context\)/);
assert.match(card, /<details class="card-menu">[\s\S]*aria-label="Batch actions"[\s\S]*data-tstruct-action="materialConsumption"[\s\S]*data-batch-id="\$\{escapeAttribute\(batchId\)\}"[\s\S]*Material Consumption Note/);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node tests/hatchery-material-consumption-menu.test.mjs`

Expected: FAIL because the Hatchery TStruct map and card renderer do not expose this action.

- [ ] **Step 3: Implement the TStruct and card menu**

```js
materialConsumption: { title: "Material Consumption Note", transid: "fdcon" },
```

```html
<link rel="stylesheet" href="hatchery.css">
```

```html
<details class="card-menu">
  <summary aria-label="Batch actions">...</summary>
  <div class="command-popover align-right">
    <button type="button" data-tstruct-action="materialConsumption" data-batch-id="${escapeAttribute(batchId)}">Material Consumption Note</button>
  </div>
</details>
```

```js
function buildTstructTargetParams(transid, context) {
  const batchTargetValue = context.batchId || context.setterBatch || context.batchCode;
  if (transid === "fdcon") return `tobatch=${batchTargetValue}`;
  // existing target parameter entries
}
```

- [ ] **Step 4: Run focused verification**

Run: `node --check hatchery.js; node tests/hatchery-material-consumption-menu.test.mjs`

Expected: syntax check exits 0 and the test prints `hatchery material consumption menu test passed`.
