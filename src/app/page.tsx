import { WasteCalendar, WasteCalendarConfigProvider } from "@/components";
import type { WasteCalendarConfig } from "@/components";
import { getWasteDataset } from "@/lib/waste-data";

const wasteCalendarConfig: WasteCalendarConfig = {
  themeStorageKey: "lipa-theme",
  selectedDateStorageKey: "lipa-selected-date",
  homePickupCategoryIds: ["komunalni-odpad", "sko", "plasty", "papir"],
  heroPriorityCategoryIds: ["komunalni-odpad", "sko", "plasty", "papir"],
  darkCategoryColors: {
    "komunalni-odpad": "#ff8a70",
    plasty: "#7db8ff",
    papir: "#d4a870",
    sklo: "#50d4a0",
    kovy: "#9ab0d8",
    oleje: "#f0c860",
    "nebezpecny-odpad": "#d490d4",
  },
};

export default function Home() {
  const dataset = getWasteDataset();

  return (
    <WasteCalendarConfigProvider config={wasteCalendarConfig}>
      <WasteCalendar data={dataset} />
    </WasteCalendarConfigProvider>
  );
}
