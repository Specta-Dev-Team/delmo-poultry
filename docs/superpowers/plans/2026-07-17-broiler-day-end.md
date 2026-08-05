# Broiler Day End Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Day End button immediately before Entry in the selected Broiler house header and execute `poultry_dayend_update` for that house's batch.

**Architecture:** Keep the UI action inside the existing Broiler detail navbar and delegate the database update to a small `executeDayEnd` method exposed through `window.BroilerAPI`. The click handler owns loading and feedback states, while the datasource method calls the existing Axpert bridge directly so update failures are not swallowed by row-loading fallbacks.

**Tech Stack:** Plain HTML templates in JavaScript, CSS, Axpert datasource APIs, Node.js assertion tests.

## Global Constraints

- Add the action only to the selected Broiler house detail header.
- Render `Day End` immediately before the existing `Entry` control.
- Call `poultry_dayend_update` with `{ batchid: selectedBatchId }`.
- Prevent duplicate execution while the update is running.
- Refresh Broiler data only after a successful update.
- Do not add the action to house cards or other poultry screens.

---

### Task 1: Add the Broiler Day End Action

**Files:**
- Create: `tests/broiler-day-end-action.test.mjs`
- Modify: `broiler.js`
- Modify: `broiler.css`

**Interfaces:**
- Consumes: `callAxpertDataSourceFunction(dataSourceName, parameters)`, `reloadCurrentFrame()`, and the selected house's `batchId` or `batchCode`.
- Produces: `renderDayEndButton(house): string`, `executeDayEnd(parameters): Promise<unknown>`, and `handleDayEnd(house, button): Promise<void>`.

- [ ] **Step 1: Write the failing behavior test**

Create `tests/broiler-day-end-action.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../broiler.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../broiler.css", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const functionPattern = new RegExp(`(?:async\\s+)?function\\s+${functionName}\\s*\\(`);
  const match = functionPattern.exec(source);
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

const renderDetailNavbar = getFunctionBlock("renderDetailNavbar");
const renderDayEndButton = getFunctionBlock("renderDayEndButton");
const executeDayEnd = getFunctionBlock("executeDayEnd");
const handleDayEnd = getFunctionBlock("handleDayEnd");

assert.ok(
  renderDetailNavbar.indexOf("${renderDayEndButton(house)}") < renderDetailNavbar.indexOf("${renderQuickEntryMenu(house)}"),
  "Day End should render immediately before Entry",
);
assert.match(renderDayEndButton, /data-day-end/, "Day End should have a dedicated action hook");
assert.match(renderDayEndButton, /data-house-id/, "Day End should identify the selected house");
assert.match(source, /dayEnd:\s*\{\s*name:\s*"poultry_dayend_update"\s*\}/, "Day End datasource should be configured");
assert.match(executeDayEnd, /callAxpertDataSourceFunction\(AXPERT_DATASOURCES\.dayEnd\.name,\s*\{\s*batchid:\s*batchId\s*\}\)/, "Day End should pass batchid to Axpert");
assert.match(handleDayEnd, /button\.disabled\s*=\s*true/, "Day End should block duplicate clicks");
assert.match(handleDayEnd, /await window\.BroilerAPI\.executeDayEnd\(\{\s*batchid:\s*batchId\s*\}\)/, "Day End should execute for the selected batch");
assert.match(handleDayEnd, /reloadCurrentFrame\(\)/, "Day End should refresh after success");
assert.match(css, /\.day-end-button:disabled/, "Day End should have a visible disabled state");

console.log("broiler day end action test passed");
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
node tests\broiler-day-end-action.test.mjs
```

Expected: FAIL with `renderDayEndButton should exist` because the action has not been implemented.

- [ ] **Step 3: Add the button before Entry**

Add this renderer near `renderQuickEntryMenu` in `broiler.js`:

```js
function renderDayEndButton(house) {
    const houseId = escapeAttribute(house && house.id || "");
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    return `
      <button class="command-button primary day-end-button" type="button" data-day-end data-house-id="${houseId}" ${batchId ? "" : "disabled"}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v9M8 8l4 4 4-4M5 16v4h14v-4" /></svg>
        <span>Day End</span>
      </button>
    `;
}
```

Render it before Entry in `renderDetailNavbar(house)`:

```js
<div class="command-actions">
  ${renderDayEndButton(house)}
  ${renderQuickEntryMenu(house)}
</div>
```

- [ ] **Step 4: Add the datasource action and click behavior**

Add the datasource entry:

```js
dayEnd: { name: "poultry_dayend_update" },
```

Add the direct datasource method near the other Broiler API loaders:

```js
async function executeDayEnd(parameters) {
    const batchId = String(parameters && parameters.batchid || "").trim();
    if (!batchId) throw new Error("A batch ID is required to run Day End.");
    return callAxpertDataSourceFunction(AXPERT_DATASOURCES.dayEnd.name, { batchid: batchId });
}
```

Expose it through `window.BroilerAPI`:

```js
executeDayEnd: executeDayEnd,
```

Add the UI handler near the other detail actions:

```js
async function handleDayEnd(house, button) {
    const batchId = String(house && (house.batchId || house.batchCode) || "").trim();
    if (!batchId || !button || button.disabled) return;

    const label = button.querySelector("span");
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    if (label) label.textContent = "Processing...";

    try {
        if (!window.BroilerAPI || typeof window.BroilerAPI.executeDayEnd !== "function") {
            throw new Error("Broiler Day End datasource is unavailable.");
        }
        await window.BroilerAPI.executeDayEnd({ batchid: batchId });
        if (label) label.textContent = "Completed";
        window.alert("Day End completed successfully.");
        reloadCurrentFrame();
    } catch (error) {
        console.error("[Broiler Operations] Day End failed.", error);
        button.disabled = false;
        button.removeAttribute("aria-busy");
        if (label) label.textContent = "Day End";
        window.alert("Unable to complete Day End. Please try again.");
    }
}
```

Handle the button before TStruct and card actions in the document click listener:

```js
const dayEndButton = event.target.closest("[data-day-end]");
if (dayEndButton) {
    event.preventDefault();
    event.stopPropagation();
    const house = houses.find((item) => item.id === (dayEndButton.dataset.houseId || ""));
    handleDayEnd(house, dayEndButton);
    closeOpenMenus();
    return;
}
```

- [ ] **Step 5: Add the disabled and processing styles**

Add to `broiler.css` beside the command-button styles:

```css
.day-end-button:disabled {
    cursor: not-allowed;
    opacity: 0.62;
}

.day-end-button[aria-busy="true"] {
    min-width: 126px;
}
```

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```powershell
node tests\broiler-day-end-action.test.mjs
node tests\broiler-house-loading.test.mjs
node tests\broiler-placementdone-actions.test.mjs
node --check broiler.js
```

Expected: all tests print their pass message and the syntax check exits with code 0.

- [ ] **Step 7: Refresh the project graph**

Run:

```powershell
npx.cmd graphify update . --scope all --no-description --no-label
```

Expected: the graph rebuild completes without errors.

- [ ] **Step 8: Review the final diff**

Run:

```powershell
git diff -- broiler.js broiler.css tests/broiler-day-end-action.test.mjs
```

Expected: only the Day End UI, datasource execution, feedback styles, and focused test are present.

- [ ] **Step 9: Commit when requested**

```powershell
git add broiler.js broiler.css tests/broiler-day-end-action.test.mjs
git commit -m "feat: add broiler day end action"
```
