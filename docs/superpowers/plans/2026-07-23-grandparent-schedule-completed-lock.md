# Grandparent Schedule Completed Status Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent completed Grandparent schedules from being edited while preserving pending schedule edits.

**Architecture:** The schedule row renderer suppresses the Edit button unless the normalized status is `Pending`. The delegated click handler resolves the current schedule row and returns before opening Schedule Monitoring when it is missing or completed.

**Tech Stack:** Vanilla JavaScript and Node.js `assert` source-level tests.

## Global Constraints

- Modify only Grandparent schedule edit behavior.
- Completed schedules expose no Edit button and cannot open Schedule Monitoring.
- Pending schedules retain their current Edit action.

---

### Task 1: Lock Grandparent completed schedules

**Files:**
- Create: `tests/grandparent-schedule-completed-lock.test.mjs`
- Modify: `grandparent.js:1699-1817, 3099-3108`

**Interfaces:**
- Consumes: `normalizeActivityStatus(status)` and `getScheduleRowFromButton(house, button)`.
- Produces: a pending-only `renderScheduleStatusEditButton(rowIndex, rowId, status)` and a completed-row guard in the schedule edit branch.

- [ ] **Step 1: Write the failing test**

```js
assert.match(renderScheduleStatusEditButton, /normalizeActivityStatus\(status\)\s*!==\s*"Pending"[\s\S]*return\s+""/);
assert.match(renderScheduleRows, /renderScheduleStatusEditButton\(index,\s*rowId,\s*status\)/);
assert.match(source, /const schedule = getScheduleRowFromButton\(house, scheduleEditButton\);[\s\S]*normalizeActivityStatus\(schedule\.status\)\s*!==\s*"Pending"[\s\S]*return;/);
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node tests/grandparent-schedule-completed-lock.test.mjs`

Expected: FAIL because completed Grandparent schedules currently render and open Edit.

- [ ] **Step 3: Implement the pending-only render and click guards**

```js
function renderScheduleStatusEditButton(rowIndex, rowId, status) {
  if (normalizeActivityStatus(status) !== "Pending") return "";
  return `<button class="activity-row-edit-button" type="button" data-schedule-status-edit="true" data-schedule-row-index="${escapeHtml(rowIndex)}" data-activity-row-id="${escapeHtml(rowId || "")}">Edit</button>`;
}
```

Pass `status` from `renderScheduleRows`. Resolve the schedule from `scheduleEditButton` before opening Schedule Monitoring and return when it is missing or not pending.

- [ ] **Step 4: Run focused verification**

Run: `node --check grandparent.js; node tests/grandparent-schedule-completed-lock.test.mjs`

Expected: syntax check exits 0 and the test prints `grandparent schedule completed lock test passed`.
