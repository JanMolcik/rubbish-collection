import type { WasteCategory } from "@/lib/waste-types";

export type ViewMode = "day" | "week" | "month";
export type ThemeMode = "light" | "dark";

export type DaySummary = {
  date: Date;
  isoDate: string;
  categories: WasteCategory[];
  isToday: boolean;
  isCurrentMonth: boolean;
};

export type SelectedDaySummary = {
  date: Date;
  isoDate: string;
  categories: WasteCategory[];
};

export type HeroData = {
  nearestDate: Date;
  leadText: string;
  daysUntil: number;
  homePickup: WasteCategory[];
  stationPickup: WasteCategory[];
};

export type WasteCalendarConfig = {
  themeStorageKey: string;
  selectedDateStorageKey: string;
  selectedDateMaxAgeHours: number;
  homePickupCategoryIds: string[];
  heroPriorityCategoryIds: string[];
  darkCategoryColors: Record<string, string>;
};

export type ResolveCategoryColor = (category: WasteCategory) => string;
