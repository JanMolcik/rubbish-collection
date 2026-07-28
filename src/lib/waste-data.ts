import rawData from "@/data/collections-2026.json";
import type { WasteCategory, WasteDataset } from "@/lib/waste-types";

const dataset = rawData as WasteDataset;

const visibleCategoryIds = new Set([
  "komunalni-odpad",
  "plasty",
  "papir",
  "nebezpecny-odpad",
]);

const visibleDataset: WasteDataset = {
  ...dataset,
  categories: dataset.categories.filter((category) => visibleCategoryIds.has(category.id)),
  events: dataset.events
    .map((event) => ({
      ...event,
      categories: event.categories.filter((categoryId) => visibleCategoryIds.has(categoryId)),
    }))
    .filter((event) => event.categories.length > 0),
};

const categoryMap = new Map<string, WasteCategory>(
  visibleDataset.categories.map((category) => [category.id, category]),
);

export function getWasteDataset(): WasteDataset {
  return visibleDataset;
}

export function getCategoryById(categoryId: string): WasteCategory | undefined {
  return categoryMap.get(categoryId);
}
