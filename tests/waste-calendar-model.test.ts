import assert from "node:assert/strict";
import test from "node:test";
import type { WasteCategory } from "../src/lib/waste-types";
import { buildHeroData } from "../src/components/wasteCalendarUtils";

const categories: WasteCategory[] = [
  { id: "komunalni-odpad", name: "Komunální odpad", color: "#111111" },
  { id: "plasty", name: "Plasty", color: "#222222" },
  { id: "nebezpecny-odpad", name: "Nebezpečný odpad", color: "#333333" },
];
const categoryIndex = new Map(categories.map((category) => [category.id, category]));
const eventsByDate = new Map([
  ["2026-07-30", [categoryIndex.get("plasty")!]],
  ["2026-08-03", [categoryIndex.get("komunalni-odpad")!]],
  ["2026-11-18", [categoryIndex.get("nebezpecny-odpad")!]],
]);
const sortedEventDates = [...eventsByDate.keys()];
const shared = {
  today: new Date(2026, 6, 28),
  eventsByDate,
  sortedEventDates,
  priorityCategoryIds: ["komunalni-odpad", "plasty", "papir", "nebezpecny-odpad"],
  homePickupCategoryIds: ["komunalni-odpad", "plasty", "papir"],
};

test("a clean visit selects today visually but shows the nearest relevant pickup", () => {
  const hero = buildHeroData({
    ...shared,
    selectedDate: new Date(2026, 6, 28),
    hasExplicitSelection: false,
  });

  assert.equal(hero?.mode, "nearest");
  assert.equal(hero?.displayDate.getDate(), 30);
  assert.equal(hero?.pickup?.daysUntil, 2);
  assert.deepEqual(hero?.pickup?.homePickup.map(({ id }) => id), ["plasty"]);
});

test("an explicit selected pickup day replaces nearest-pickup content", () => {
  const hero = buildHeroData({
    ...shared,
    selectedDate: new Date(2026, 7, 3),
    hasExplicitSelection: true,
  });

  assert.equal(hero?.mode, "selected");
  assert.equal(hero?.leadText, "SVOZ");
  assert.equal(hero?.displayDate.getDate(), 3);
  assert.deepEqual(hero?.pickup?.homePickup.map(({ id }) => id), ["komunalni-odpad"]);
  assert.equal(hero?.nextPickup, null);
});

test("an explicit empty day says Bez svozu and includes the next relevant pickup", () => {
  const hero = buildHeroData({
    ...shared,
    selectedDate: new Date(2026, 6, 31),
    hasExplicitSelection: true,
  });

  assert.equal(hero?.mode, "selected");
  assert.equal(hero?.leadText, "BEZ SVOZU");
  assert.equal(hero?.pickup, null);
  assert.equal(hero?.nextPickup?.date.getDate(), 3);
  assert.deepEqual(hero?.nextPickup?.homePickup.map(({ id }) => id), ["komunalni-odpad"]);
});

test("an explicit empty day still renders when there is no later pickup", () => {
  const hero = buildHeroData({
    ...shared,
    selectedDate: new Date(2026, 11, 31),
    hasExplicitSelection: true,
  });

  assert.equal(hero?.leadText, "BEZ SVOZU");
  assert.equal(hero?.nextPickup, null);
});
