import rawData from "@/data/collections-2026.json";
import { wasteCalendarConfig } from "@/lib/waste-calendar-config";
import type { WasteCategory, WasteDataset } from "@/lib/waste-types";

const dataset = rawData as WasteDataset;

const legacyCategoryAliases = new Map([["sko", "komunalni-odpad"]]);

function normalizeCategoryId(categoryId: string): string {
  return legacyCategoryAliases.get(categoryId) ?? categoryId;
}

export function filterVisibleWasteDataset(source: WasteDataset): WasteDataset {
  const visibleCategoryIds = new Set(wasteCalendarConfig.heroPriorityCategoryIds);
  const categoriesById = new Map<string, WasteCategory>();

  for (const category of source.categories) {
    const id = normalizeCategoryId(category.id);
    if (visibleCategoryIds.has(id) && !categoriesById.has(id)) {
      categoriesById.set(id, { ...category, id });
    }
  }

  const events = source.events
    .map((event) => ({
      ...event,
      categories: [
        ...new Set(
          event.categories
            .map(normalizeCategoryId)
            .filter((categoryId) => visibleCategoryIds.has(categoryId)),
        ),
      ],
    }))
    .filter((event) => event.categories.length > 0);

  return {
    ...source,
    categories: [...categoriesById.values()],
    events,
  };
}

const visibleDataset = filterVisibleWasteDataset(dataset);

const categoryMap = new Map<string, WasteCategory>(
  visibleDataset.categories.map((category) => [category.id, category]),
);

export function getWasteDataset(): WasteDataset {
  return visibleDataset;
}

export function getCategoryById(categoryId: string): WasteCategory | undefined {
  return categoryMap.get(categoryId);
}
