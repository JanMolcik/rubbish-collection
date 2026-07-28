import assert from "node:assert/strict";
import test from "node:test";
import { getWasteDataset } from "../src/lib/waste-data";

const VISIBLE_CATEGORY_IDS = new Set([
  "komunalni-odpad",
  "plasty",
  "papir",
  "nebezpecny-odpad",
]);

test("exposes only household-relevant waste categories at the data boundary", () => {
  const dataset = getWasteDataset();

  assert.deepEqual(
    dataset.categories.map((category) => category.id),
    [...VISIBLE_CATEGORY_IDS],
  );

  for (const event of dataset.events) {
    assert.ok(event.categories.length > 0, `${event.date} must keep at least one visible category`);
    assert.ok(
      event.categories.every((categoryId) => VISIBLE_CATEGORY_IDS.has(categoryId)),
      `${event.date} contains a hidden category`,
    );
  }
});

test("keeps hazardous-waste pickups in the filtered calendar", () => {
  const hazardousDates = getWasteDataset().events
    .filter((event) => event.categories.includes("nebezpecny-odpad"))
    .map((event) => event.date);

  assert.deepEqual(hazardousDates, ["2026-06-10", "2026-11-18"]);
});

test("removes hidden categories from mixed pickup days without removing the relevant pickup", () => {
  const event = getWasteDataset().events.find(({ date }) => date === "2026-07-30");

  assert.deepEqual(event?.categories, ["plasty"]);
});
