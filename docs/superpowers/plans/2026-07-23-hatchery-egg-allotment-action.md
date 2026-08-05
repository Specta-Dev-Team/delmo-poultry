# Hatchery Egg Allotment Action Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Egg Allotment action beside Egg Grading and ensure the Hatchery page loads its implementation script.

**Architecture:** Configure separate Hatchery actions: `eggGrading` maps to `eggal` and `eggAllotment` maps to `egall`. The page script reference is corrected to load `hatchery.js`, and the command-action template exposes the two adjacent buttons.

**Tech Stack:** Static HTML, vanilla JavaScript, Node.js `assert` tests.

## Global Constraints

- Egg Grading opens `eggal`.
- Add Egg Allotment appears immediately after Egg Grading.
- Add Egg Allotment opens the configured `egall` TStruct.

---

### Task 1: Add the Hatchery Egg Allotment button

**Files:**
- Modify: `hatchery.html:62`
- Modify: `hatchery.js:263-274`
- Create: `tests/hatchery-egg-allotment-action.test.mjs`

**Interfaces:**
- Consumes: `AXPERT_TSTRUCTS.eggGrading` with `transid: "eggal"`, `AXPERT_TSTRUCTS.eggAllotment` with `transid: "egall"`, and the delegated `[data-tstruct-action]` click handler.
- Produces: adjacent Egg Grading and Add Egg Allotment buttons using their distinct action keys.

- [ ] **Step 1: Write the failing test**

```js
assert.match(html, /<script src="hatchery\.js"><\/script>/);
assert.match(actions, /data-tstruct-action="eggGrading"[\s\S]*<span>Egg Grading<\/span>[\s\S]*data-tstruct-action="eggAllotment"[\s\S]*<span>Add Egg Allotment<\/span>/);
assert.match(source, /eggGrading:\s*\{\s*title:\s*"Egg Grading",\s*transid:\s*"eggal"\s*\}/);
assert.match(source, /eggAllotment:\s*\{\s*title:\s*"Egg Allotment",\s*transid:\s*"egall"\s*\}/);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node tests/hatchery-egg-allotment-action.test.mjs`

Expected: FAIL because the page loads `setter.js` and no Add Egg Allotment action exists.

- [ ] **Step 3: Implement the script correction and action button**

```html
<script src="hatchery.js"></script>
```

```html
<button class="command-button primary" type="button" data-tstruct-action="eggGrading">
  <span>Egg Grading</span>
</button>
<button class="command-button" type="button" data-tstruct-action="eggAllotment">
  <span>Add Egg Allotment</span>
</button>
```

- [ ] **Step 4: Run focused verification**

Run: `node --check hatchery.js; node tests/hatchery-egg-allotment-action.test.mjs`

Expected: syntax check exits 0 and the test prints `hatchery egg allotment action test passed`.
