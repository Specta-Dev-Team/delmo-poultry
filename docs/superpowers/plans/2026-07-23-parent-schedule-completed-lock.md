# Parent Schedule Completed Status Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make completed Parent schedule rows non-editable while leaving pending schedule rows editable.

**Architecture:** Keep the rule within the existing schedule-rendering and delegated-click paths in `parent.js`. The renderer decides whether to expose an Edit button, and the click handler independently enforces the same normalized-status rule.

**Tech Stack:** Vanilla JavaScript, Node.js `assert` source-level tests.

## Global Constraints

- Modify only Parent schedule status behavior.
- A `Completed` schedule must not expose or open the status editor.
- A `Pending` schedule retains its current Edit action.

---

### Task 1: Lock completed schedule rows

**Files:**
- Modify: `tests/parent-schedule-completed-lock.test.mjs`
- Modify: `parent.js:1489-1607, 2778-2788`

**Interfaces:**
- Consumes: `normalizeActivityStatus(status)` and each schedule item’s `status` field.
- Produces: `renderScheduleStatusEditButton(rowIndex, rowId, status)` emits an Edit button only for pending statuses; the schedule edit click path opens an editor only for a pending row.

- [ ] **Step 1: Write the failing test**

```js
assert.match(
  renderScheduleStatusEditButton,
  /normalizeActivityStatus\(status\)\s*!==\s*"Pending"[\s\S]*return\s+""/,
  "completed schedules should not render an Edit button",
);
assert.match(
  renderScheduleRows,
  /renderScheduleStatusEditButton\(index,\s*rowId,\s*status\)/,
  "schedule rows should pass their status to the edit-button renderer",
);
assert.match(
  scheduleEditHandler,
  /normalizeActivityStatus\(scheduleItem\.status\)\s*!==\s*"Pending"[\s\S]*return/,
  "completed schedules should not open the status editor",
);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/parent-schedule-completed-lock.test.mjs`

Expected: FAIL because `renderScheduleStatusEditButton` has no status guard and the click handler does not reject completed schedules.

- [ ] **Step 3: Write minimal implementation**

```js
function renderScheduleStatusEditButton(rowIndex, rowId, status) {
  if (normalizeActivityStatus(status) !== "Pending") return "";
  return `<button class="activity-row-edit-button" type="button" data-schedule-status-edit="true" data-schedule-row-index="${escapeHtml(rowIndex)}" data-activity-row-id="${escapeHtml(rowId || "")}">Edit</button>`;
}
```

Pass `status` from `renderScheduleRows`. In the existing delegated schedule-edit branch, resolve the selected item from `house.schedules`; return without setting `scheduleStatusEditor` when its normalized status is not `Pending`.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node tests/parent-schedule-completed-lock.test.mjs`

Expected: `parent schedule completed lock test passed`

- [ ] **Step 5: Run related Parent tests**

Run: `Get-ChildItem tests -Filter 'parent-*.test.mjs' | ForEach-Object { node $_.FullName }`

Expected: every Parent test prints its success message without an assertion failure.

