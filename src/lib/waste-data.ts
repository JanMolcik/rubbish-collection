import rawData from "@/data/collections-2026.json";
import type { WasteCategory, WasteDataset } from "@/lib/waste-types";

const dataset = rawData as WasteDataset;

const categoryMap = new Map<string, WasteCategory>(
  dataset.categories.map((category) => [category.id, category]),
);

export function getWasteDataset(): WasteDataset {
  return dataset;
}

export function getCategoryById(categoryId: string): WasteCategory | undefined {
  return categoryMap.get(categoryId);
}
