# Parent Transfer Card Stages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Parent transfer cards use the same blue/green stage styling as Out Grower and require Yes/No confirmation before marking a batch ready to transfer.

**Architecture:** Parent will derive a stage class and status badge from its existing `readyToHarvest` mapping. The existing `renderTransferAction` path will remain the single action renderer, while a Parent-only confirmation state and modal will guard the datasource call before the card switches stages.

**Tech Stack:** Vanilla JavaScript, HTML template strings, CSS, Node-based assertion tests.

## Global Constraints

- Preserve Parent card structure, metrics, spacing, responsiveness, and existing action routing.
- Use the existing Out Grower muted darker-green palette for live-transfer cards.
- Preserve harvest-ready aliases, including `harvestready`.
- `No` must not call `poultry_cull_harvest_update`; `Yes` must call it with `batchid`.

---

### Task 1: Add failing regression coverage

**Files:**
- Modify: `tests/parent-ready-transfer-action.test.mjs`

**Interfaces:**
- Consumes: Parent source function blocks extracted by the existing test helper.
- Produces: Assertions for stage classes, status badges, confirmation controls, and guarded datasource behavior.

- [ ] **Step 1: Write the failing assertions**

Extend the existing test with assertions equivalent to:

```js
assert.match(renderHouseCard, /ready-harvest-card|live-transfer-card/, "Parent cards should expose a workflow stage class");
assert.match(renderHouseCard, /Ready for transfer/, "ready cards should show a transfer status badge");
assert.match(renderTransferAction, /ready-to-transfer-button/, "pending cards should keep the ready-to-transfer action hook");
assert.match(renderTransferAction, /live-bird-transfer-button/, "ready cards should keep the live transfer action hook");
assert.match(source, /renderReadyToTransferConfirmation|readyToTransferConfirmation/, "Parent should render a ready-to-transfer confirmation");
assert.match(source, /data-ready-to-transfer-cancel/, "confirmation should expose a No action");
assert.match(source, /data-ready-to-transfer-confirm/, "confirmation should expose a Yes action");
assert.match(source, /completeReadyToTransfer\(house\)/, "the Yes path should execute the update");
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
node tests/parent-ready-transfer-action.test.mjs
```

Expected: FAIL because Parent does not yet render stage classes/status badges or the ready-to-transfer confirmation.

### Task 2: Implement Parent stage styling and confirmation flow

**Files:**
- Modify: `parent.js:844-1030, 2868-2910`
- Modify: `parent.css:470-570, 995-1005`

**Interfaces:**
- Consumes: `house.readyToHarvest`, `completeReadyToTransfer(house)`, and the existing Parent event delegation.
- Produces: `renderReadyToTransferConfirmation(house)`, `openReadyToTransferConfirmation(house)`, `closeReadyToTransferConfirmation(house)`, and guarded Yes/No handlers.

- [ ] **Step 1: Add the minimal confirmation state and render it**

Add a `readyToTransferConfirmation` state object alongside the existing day-end confirmation state. Render a modal with `data-ready-to-transfer-cancel` and `data-ready-to-transfer-confirm`; show `Processing...` and an error message while the datasource call is in progress.

- [ ] **Step 2: Add stage classes and status badge to Parent cards**

In `renderHouseCard`, derive `live-transfer-card is-ready-to-transfer` when `isReadyToHarvest(house)` is true, otherwise `ready-harvest-card`, and render `Ready for transfer` only for the live-transfer stage.

- [ ] **Step 3: Route the pending action through the confirmation**

Change the `[data-ready-to-transfer]` click handler to call `openReadyToTransferConfirmation(house)`. Keep `completeReadyToTransfer` as the only function that calls `window.ParentAPI.executeReadyToTransferUpdate`.

- [ ] **Step 4: Add Parent CSS matching Out Grower**

Use the existing Out Grower values: blue `#EFF6FF/#BFDBFE/#2563EB/#1D4ED8/#DBEAFE/#1E40AF` for pending cards and muted darker green `#E8F3EA/#9BC8A6/#008e32/#D8EBDD` for live-transfer cards. Add the 4px left border, status badge treatment, action button hover transition, and modal styling without changing metric tiles.

- [ ] **Step 5: Run focused verification**

Run:

```powershell
node tests/parent-ready-transfer-action.test.mjs
node tests/parent-day-end-and-placementdone-actions.test.mjs
node tests/parent-house-flow.test.mjs
node --check parent.js
git diff --check -- parent.js parent.css tests/parent-ready-transfer-action.test.mjs
```

Expected: all focused tests pass and the syntax/diff checks exit successfully.

- [ ] **Step 6: Refresh the project graph**

Run:

```powershell
npx.cmd graphify update . --scope all --no-description --no-label
```

Expected: Graphify completes successfully and updates the code graph for the changed Parent files and test.
