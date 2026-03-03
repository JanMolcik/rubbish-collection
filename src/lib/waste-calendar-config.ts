import type { WasteCalendarConfig } from "@/components";

export const wasteCalendarConfig: WasteCalendarConfig = {
  themeStorageKey: "lipa-theme",
  selectedDateStorageKey: "lipa-selected-date",
  selectedDateMaxAgeHours: 8,
  homePickupCategoryIds: ["komunalni-odpad", "sko", "plasty", "papir"],
  heroPriorityCategoryIds: ["komunalni-odpad", "sko", "plasty", "papir"],
  darkCategoryColors: {
    "komunalni-odpad": "#7f8a96",
    plasty: "#f0c94a",
    papir: "#79b3ff",
    sklo: "#6bdc88",
    kovy: "#d0d6de",
    oleje: "#d08d74",
    "nebezpecny-odpad": "#d490d4",
  },
};
