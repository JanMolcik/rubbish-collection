import type { WasteCategory } from "@/lib/waste-types";
import type { ThemeMode } from "@/components/wasteCalendarTypes";

export function resolveCategoryColor(
  category: WasteCategory,
  theme: ThemeMode,
  darkCategoryColors: Record<string, string>,
): string {
  if (theme === "dark") {
    return darkCategoryColors[category.id] ?? category.color;
  }

  return category.color;
}
