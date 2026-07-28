import type { WasteCalendarConfig } from "@/components";

export const wasteCalendarConfig: WasteCalendarConfig = {
  themeStorageKey: "lipa-theme",
  selectedDateStorageKey: "lipa-selected-date",
  selectedDateMaxAgeHours: 8,
  homePickupCategoryIds: ["komunalni-odpad", "plasty", "papir"],
  heroPriorityCategoryIds: ["komunalni-odpad", "plasty", "papir", "nebezpecny-odpad"],
  darkCategoryColors: {
    "komunalni-odpad": "#7f8a96",
    plasty: "#f0c94a",
    papir: "#79b3ff",
    "nebezpecny-odpad": "#d490d4",
  },
};
