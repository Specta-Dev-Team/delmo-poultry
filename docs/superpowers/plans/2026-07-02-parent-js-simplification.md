# Parent JS Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce `parent.js` to the maintainable core needed for active parent batch houses and TStruct entry screens with target-param prefill.

**Architecture:** Keep one deployable JavaScript file for Axpert. Split the file internally into config/state, datasource helpers, mapping, UI rendering, and TStruct helpers. Use the completed datasource aliases directly instead of broad fallback mappings.

**Tech Stack:** Plain browser JavaScript, Axpert datasource functions, Node assertion tests.

---

### Task 1: Test The Simplified Contract

**Files:**
- Modify: `tests/parent-no-mock-data.test.mjs`
- Modify: `tests/parent-house-loading.test.mjs`
- Modify: `tests/parent-tstruct-opening.test.mjs`
- Modify: `tests/parent-global-context.test.mjs`
- Modify: `tests/parent-datasource-normalization.test.mjs`

- [ ] **Step 1: Replace old string-regression tests with tests for the simplified contract**

Check that `parent.js` contains direct datasource names, direct SQL-alias mapping, target-param TStruct opening, useful exposed APIs, no mock/demo data, no synthetic charts, and no old iframe polling functions.

- [ ] **Step 2: Run the parent tests and confirm they fail against the old implementation**

Run: `node tests/parent-no-mock-data.test.mjs`, `node tests/parent-house-loading.test.mjs`, `node tests/parent-tstruct-opening.test.mjs`, `node tests/parent-global-context.test.mjs`, and `node tests/parent-datasource-normalization.test.mjs`.

Expected: at least one failure showing the old script still contains removed behavior or lacks the simplified function shapes.

### Task 2: Replace Parent Screen Script

**Files:**
- Modify: `parent.js`

- [ ] **Step 1: Rewrite `parent.js` as one compact IIFE**

Keep these behaviors:
- load units from `poultry_unit_filter` with branch/company context
- load houses from `poultry_house_details` per unit location name
- enrich houses from `poultry_parent_batch_details` by `unit` and `house`
- show active batch houses and details
- open entry TStructs
- call `poultry_targetparams` before opening a house action when target params are missing
- expose `window.parentOps`

- [ ] **Step 2: Remove old unnecessary behavior**

Remove synthetic chart generation, chart/schedule datasource loaders, iframe DOM polling prefill, multi-signature field setters, large fallback mapping lists, and always-on debug logs.

### Task 3: Verify

**Files:**
- Test: `tests/parent-*.test.mjs`

- [ ] **Step 1: Run parent tests**

Run each parent test with `node`.

Expected: all parent tests pass.

- [ ] **Step 2: Review line count and debug footprint**

Run: `node -e "const fs=require('fs'); const s=fs.readFileSync('parent.js','utf8'); console.log(s.split(/\\r?\\n/).length, (s.match(/console\\./g)||[]).length)"`

Expected: file is much shorter than the old 2500-line script, and console usage is limited to useful warning/debug helper output.
