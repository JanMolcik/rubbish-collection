import type { Metadata } from "next";
import { WasteCalendar, WasteCalendarConfigProvider } from "@/components";
import type { WasteCalendarConfig } from "@/components";
import type { ThemeMode, ViewMode } from "@/components/wasteCalendarTypes";
import { wasteCalendarConfig } from "@/lib/waste-calendar-config";
import { getWasteDataset } from "@/lib/waste-data";

export const metadata: Metadata = {
  title: "Embed | Kalendář svozu odpadů",
  description: "Vložitelná widget varianta kalendáře svozu odpadů pro obec Lípa.",
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

type EmbedPageProps = {
  searchParams?: Promise<SearchParams> | SearchParams;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseBooleanParam(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.toLowerCase();

  if (normalized === "1" || normalized === "true" || normalized === "yes") {
    return true;
  }

  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return false;
  }

  return fallback;
}

function parseViewParam(value: string | undefined): ViewMode | undefined {
  if (value === "day" || value === "week" || value === "month") {
    return value;
  }

  return undefined;
}

function parseThemeParam(value: string | undefined): ThemeMode | null {
  if (value === "light" || value === "dark") {
    return value;
  }

  return null;
}

export default async function EmbedPage({ searchParams }: EmbedPageProps) {
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : (searchParams ?? {});

  const dataset = getWasteDataset();
  const initialView = parseViewParam(firstParam(resolvedSearchParams.view));
  const forcedTheme = parseThemeParam(firstParam(resolvedSearchParams.theme));
  const showHero = parseBooleanParam(firstParam(resolvedSearchParams.hero), false);
  const showLegend = parseBooleanParam(firstParam(resolvedSearchParams.legend), true);
  const compact = parseBooleanParam(firstParam(resolvedSearchParams.compact), true);

  const embedConfig: WasteCalendarConfig = {
    ...wasteCalendarConfig,
    themeStorageKey: "lipa-embed-theme",
    selectedDateStorageKey: "lipa-embed-selected-date",
  };

  return (
    <WasteCalendarConfigProvider config={embedConfig}>
      <WasteCalendar
        data={dataset}
        mode="embed"
        initialView={initialView}
        forcedTheme={forcedTheme}
        showHero={showHero}
        showLegend={showLegend}
        compact={compact}
      />
    </WasteCalendarConfigProvider>
  );
}
