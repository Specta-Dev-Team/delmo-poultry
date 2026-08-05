import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../outgrower.js", import.meta.url), "utf8");

function getFunctionBlock(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const remainingSource = source.slice(start + 1);
  const nextFunction = remainingSource.search(/\r?\n\s+function\s+\w+/);
  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction);
}

const renderHouseCard = getFunctionBlock("renderHouseCard");
const renderHarvestAction = getFunctionBlock("renderHarvestAction");
const renderQuickEntryMenu = getFunctionBlock("renderQuickEntryMenu");
const renderListActions = getFunctionBlock("renderListActions");
const buildTstructUrl = getFunctionBlock("buildTstructUrl");

[
  ["farmerRegistration", "Farmer Registration", "fmreg"],
  ["batchAllocationToFarmer", "Batch Allocation to Farmer", "bafar"],
  ["outGrowerChickPlacement", "Out Grower Chick Placement", "chpog"],
  ["outGrowerMortality", "Mortality - Out Grower", "ogmor"],
  ["materialConsumption", "Material Consumption Note", "fdcon"],
  ["outGrowerBodyWeight", "Body Weight Monitoring - Out Grower", "ogbdw"],
  ["outGrowerPriceCard", "Outgrower Price Card", "prcad"],
  ["outGrowerMaterialIssue", "Material Issue - Out Grower", "matog"],
  ["outGrowerFeedReturn", "Outgrower Feed Return", "ogret"],
].forEach(([key, title, transid]) => {
  assert.match(source, new RegExp(`${key}:\\s*\\{\\s*title:\\s*"${title}"[\\s\\S]*transid:\\s*"${transid}"`), `${title} should be configured`);
});

assert.doesNotMatch(source, /readyToHarvest:\s*\{\s*title:\s*"Ready To Harvest Update"[\s\S]*ivname:\s*"pltohar"/, "Ready To Harvest Update should no longer open as an iView");
assert.match(source, /targetParams:\s*\{\s*name:\s*"poultry_outgrower_targetparams"\s*\}/, "outgrower target params datasource should be wired");

assert.doesNotMatch(source, /title:\s*"Mortality",\s*transid:\s*"morta"/, "generic mortality action should be removed");
assert.doesNotMatch(source, /title:\s*"Body Weight Monitoring",\s*transid:\s*"bdwgt"/, "generic body weight action should be removed");
assert.doesNotMatch(source, /title:\s*"Water Consumption Monitoring"/, "water action should be removed from outgrower actions");

assert.match(source, /const CARD_ACTIONS = \[[\s\S]*"outGrowerChickPlacement"[\s\S]*\]/, "card dropdown should keep the Out Grower actions");
assert.doesNotMatch(source, /const CARD_ACTIONS = \[[\s\S]*"readyToHarvest"[\s\S]*\]/, "Ready To Harvest should not remain in the card dropdown");
assert.match(renderListActions, /data-tstruct-action="farmerRegistration"[\s\S]*Farmer Registration/, "top nav should replace Create House with Farmer Registration");
assert.doesNotMatch(renderListActions, /Create House|houseCreation/, "top nav should not show Create House");
assert.match(renderListActions, /class="command-button primary"[\s\S]*data-tstruct-action="batchAllocationToFarmer"[\s\S]*Batch Allocation/, "top nav should show Batch Allocation as a visible primary button");
assert.doesNotMatch(source, /const QUICK_ENTRY_ACTIONS = \[[\s\S]*key:\s*"batchAllocationToFarmer"[\s\S]*\]/, "ellipsis quick entries should not duplicate Batch Allocation to Farmer");
assert.doesNotMatch(source, /const QUICK_ENTRY_ACTIONS = \[[\s\S]*key:\s*"outGrowerChickPlacement"[\s\S]*\]/, "top nav quick entries should not include Out Grower Chick Placement");
assert.doesNotMatch(renderQuickEntryMenu, /water|lighting|environment/, "entry menu should not include removed generic entries");
assert.match(renderHouseCard, /renderHarvestAction\(house\)/, "cards should use the batch-aware harvest action");
assert.match(renderHarvestAction, /data-harvest-ready/, "card primary action should mark a batch ready to harvest");
assert.match(renderHarvestAction, /Live Bird Transfer Request/, "ready cards should switch to Live Bird Transfer Request");
assert.doesNotMatch(renderHouseCard, /Harvest Pull Out/, "old Harvest Pull Out button label should be removed");
assert.doesNotMatch(renderHouseCard, /house-code-pill/, "outgrower cards should not repeat a pill beside the house name");
assert.match(renderHouseCard, /metric\("Batch No"/, "outgrower cards should keep the Batch No metric tile");

assert.match(source, /function loadTargetParamsForHouse\(house\)/, "outgrower should load target params for a selected house");
assert.match(source, /function rememberTargetParamsForHouse\(house,\s*targetParams\)/, "target params should be cached per house");
assert.match(source, /function buildTstructTargetParams\(context\)/, "TStruct URLs should include target params");
assert.match(buildTstructUrl, /buildTstructTargetParams\(context\)/, "TStruct URL builder should use target params");
assert.match(source, /unit000F1/, "outgrower should pass Axpert unit alias target params");
assert.match(source, /house000F1/, "outgrower should pass Axpert house alias target params");
assert.match(source, /batch000F1/, "outgrower should pass Axpert batch alias target params");
assert.match(source, /farm000F1/, "outgrower should pass Axpert farm alias target params");
assert.match(source, /farmer000F1/, "outgrower should pass Axpert farmer alias target params");
assert.match(source, /function expandAxpertFieldNames\(fieldNames\)/, "outgrower should expand Axpert 000F1 field names during iframe prefill");
assert.match(source, /function setAxpertFrameField\(frameWindow,\s*fieldNames,\s*value,\s*displayText\)/, "outgrower should use Axpert setter functions when available");
assert.match(source, /function triggerAxpertDependentReload\(frameWindow,\s*frameDocument,\s*config\)/, "outgrower should refresh dependent TStruct fields after prefill");
assert.match(source, /fieldNames:\s*\["farm", "farmname", "branch", "branchname"\]/, "outgrower should prefill farm fields");
assert.match(source, /fieldNames:\s*\["farmer", "farmername", "farmercode"\]/, "outgrower should prefill farmer fields");
assert.match(source, /function buildIViewUrl\(ivname,\s*context\)/, "iView URL builder should exist");
assert.match(source, /function openIView\(actionKey,\s*context\)/, "iView opener should exist");
assert.match(source, /loadTargetParamsForAction/, "actions should load target params before opening");
assert.match(source, /tstructFrame\.addEventListener\("load",\s*prefillTstructUnitContext\)/, "TStruct iframe should prefill context after load");

console.log("outgrower actions and target params test passed");
