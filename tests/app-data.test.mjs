import assert from "node:assert/strict";

import {
  FARM_DATA,
  buildFarmSummary,
  getAssignedFarm,
  getAssignedFarmHouses,
  getHouseById,
  getMetricSeries,
} from "../app-data.js";

function test(name, run) {
  run();
  console.log(`ok - ${name}`);
}

test("buildFarmSummary rolls active house data into farm-level KPIs", () => {
  const summary = buildFarmSummary(FARM_DATA.farms[0]);

  assert.equal(summary.totalHouses, 3);
  assert.equal(summary.activeHouses, 2);
  assert.equal(summary.totalBirds, 10250);
  assert.equal(summary.totalTrays, 6910);
  assert.equal(summary.totalWeightKg, 2180);
  assert.equal(summary.openHealthTasks, 3);
});

test("getHouseById returns the selected house with its batch context", () => {
  const house = getHouseById("HUS008");

  assert.equal(house.name, "BF1 House Grower");
  assert.equal(house.batch.id, "BR-BATCH-001");
  assert.equal(house.batch.ageDays, 5);
});

test("getMetricSeries returns compact time windows for house charts", () => {
  const house = getHouseById("HUS008");
  const week = getMetricSeries(house, "feedKg", "1w");
  const month = getMetricSeries(house, "feedKg", "1m");

  assert.equal(week.length, 8);
  assert.equal(month.length, 14);
  assert.deepEqual(week.at(-1), { label: "11 May", value: 0.34 });
});

test("getAssignedFarmHouses returns houses for the user's assigned farm", () => {
  const assignedFarm = getAssignedFarm();
  const houses = getAssignedFarmHouses();

  assert.equal(assignedFarm.id, "FRM004");
  assert.equal(houses.length, 3);
  assert.deepEqual(
    houses.map((house) => house.id),
    ["HUS007", "HUS008", "HUS011"],
  );
});

console.log("app-data tests passed");
