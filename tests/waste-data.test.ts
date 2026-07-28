import assert from "node:assert/strict";
import test from "node:test";
import { filterVisibleWasteDataset, getWasteDataset } from "../src/lib/waste-data";
import { wasteCalendarConfig } from "../src/lib/waste-calendar-config";
import type { WasteDataset } from "../src/lib/waste-types";

const VISIBLE_CATEGORY_IDS = new Set(wasteCalendarConfig.heroPriorityCategoryIds);

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

test("normalizes legacy SKO category IDs at the data boundary", () => {
  const legacyDataset: WasteDataset = {
    municipality: "Lípa",
    region: "Vysočina",
    year: 2026,
    sourceFile: "legacy.xlsx",
    generatedAt: "2026-01-01T00:00:00.000Z",
    parserVersion: "legacy",
    categories: [{ id: "sko", name: "SKO", color: "#111111" }],
    events: [{ date: "2026-01-05", categories: ["sko"] }],
  };

  const filtered = filterVisibleWasteDataset(legacyDataset);

  assert.deepEqual(filtered.categories.map(({ id }) => id), ["komunalni-odpad"]);
  assert.deepEqual(filtered.events[0]?.categories, ["komunalni-odpad"]);
});
