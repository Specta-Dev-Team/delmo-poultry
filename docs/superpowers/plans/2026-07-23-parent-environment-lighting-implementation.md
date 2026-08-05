# Parent Environment and Lighting Entry Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Lighting Management and Environment Monitoring TStruct actions to Parent's house dropdown and Entry menu.

**Architecture:** Parent centralizes entry actions in `TSTRUCTS`, `CARD_ACTIONS`, `DETAIL_ACTIONS`, and `ICONS`. Register the two existing Grandparent-compatible action definitions there so existing menu rendering and TStruct opening automatically apply. A source-level Node regression test protects the action IDs and both action surfaces.

**Tech Stack:** Vanilla JavaScript, Node.js ESM test scripts, `node:assert/strict`.

## Global Constraints

- Keep transaction IDs exactly `light` and `envnm`.
- Use the labels `Lighting Management` and `Environment Monitoring`.
- Keep the Parent-only change aligned with Grandparent ordering: after `bodyWeight`, before `water`.
- Do not change Parent TStruct context-prefill, data-source, styling, or other operation screens.

---

### Task 1: Register and expose Parent management actions

**Files:**
- Modify: `parent.js:31-67`
- Create: `tests/parent-environment-lighting-actions.test.mjs`

**Interfaces:**
- Consumes: Parent's existing `TSTRUCTS`, `CARD_ACTIONS`, `DETAIL_ACTIONS`, `ICONS`, and generic `[data-tstruct-action]` event handling.
- Produces: `lighting` and `environment` actions that both Parent menu renderers pass to `openTstruct(actionKey, actionContext(house))`.

- [ ] **Step 1: Write the failing test**

Create `tests/parent-environment-lighting-actions.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const parentSource = readFileSync(new URL("../parent.js", import.meta.url), "utf8");

assert.match(parentSource, /lighting:\s*\{\s*title:\s*"Lighting Management",\s*transid:\s*"light"\s*\}/, "Parent should register the Lighting Management TStruct");
assert.match(parentSource, /environment:\s*\{\s*title:\s*"Environment Monitoring",\s*transid:\s*"envnm"\s*\}/, "Parent should register the Environment Monitoring TStruct");
assert.match(parentSource, /const CARD_ACTIONS = \["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water"\]/, "Parent house dropdown should include lighting and environment actions");
assert.match(parentSource, /const DETAIL_ACTIONS = \["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water", "hatcherTransfer"\]/, "Parent Entry menu should include lighting and environment actions");
assert.match(parentSource, /lighting:\s*"M9 18h6/, "Parent should define a Lighting Management icon");
assert.match(parentSource, /environment:\s*"M12 2v20/, "Parent should define an Environment Monitoring icon");

console.log("parent environment and lighting actions test passed");
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/parent-environment-lighting-actions.test.mjs`

Expected: FAIL because Parent does not yet define `lighting`, `environment`, or include them in both action arrays.

- [ ] **Step 3: Write the minimal implementation**

In `parent.js`, add the two Grandparent-aligned definitions and icons, then insert their action keys after `bodyWeight` and before `water`:

```js
lighting: { title: "Lighting Management", transid: "light" },
environment: { title: "Environment Monitoring", transid: "envnm" },
```

```js
const CARD_ACTIONS = ["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water"];
const DETAIL_ACTIONS = ["placement", "eggCollection", "mortality", "feedMedication", "bodyWeight", "lighting", "environment", "water", "hatcherTransfer"];
```

```js
lighting: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c1 1 1.5 2 1.5 3h5c0-1 0.5-2 1.5-3a7 7 0 0 0-4-12z",
environment: "M12 2v20M5 8a7 7 0 0 0 14 0M5 16a7 7 0 0 1 14 0",
```

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `node tests/parent-environment-lighting-actions.test.mjs; node tests/parent-tstruct-opening.test.mjs`

Expected: Both scripts exit with code 0 and print their success messages.

- [ ] **Step 5: Run the full test suite**

Run: `Get-ChildItem tests -Filter *.test.mjs | ForEach-Object { node $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }`

Expected: Every test script exits with code 0.

- [ ] **Step 6: Update the codebase graph**

Run: `npx.cmd graphify update . --scope all --no-description --no-label`

Expected: Graphify refreshes `.graphify/graph.json` after the JavaScript and test changes.

- [ ] **Step 7: Commit the focused change**

```powershell
git add -- parent.js tests/parent-environment-lighting-actions.test.mjs docs/superpowers/specs/2026-07-23-parent-environment-lighting-design.md docs/superpowers/plans/2026-07-23-parent-environment-lighting-implementation.md
git commit -m "feat: add parent environment and lighting actions"
```

Expected: One commit containing only the Parent action change, its regression test, and its design/implementation documentation.
