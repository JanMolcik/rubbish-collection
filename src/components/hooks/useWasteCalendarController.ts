import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WasteCategory, WasteDataset } from "@/lib/waste-types";
import { useWasteCalendarConfig } from "@/components/WasteCalendarConfigProvider";
import { resolveCategoryColor } from "@/components/wasteCalendarTheme";
import type {
  DaySummary,
  HeroData,
  ResolveCategoryColor,
  SelectedDaySummary,
  ThemeMode,
  ViewMode,
} from "@/components/wasteCalendarTypes";
import {
  isHomePickupCategory,
  leadForDate,
  nextCursorDate,
  readStoredDate,
  readStoredTheme,
  sortCategoriesByPriority,
  toIsoDate,
  writeStoredDate,
} from "@/components/wasteCalendarUtils";

type WasteCalendarController = {
  view: ViewMode;
  theme: ThemeMode;
  cursorDate: Date;
  heroData: HeroData | null;
  monthCells: DaySummary[];
  weekCells: DaySummary[];
  dayCell: DaySummary;
  selectedMonthCell: SelectedDaySummary;
  resolveCategoryColorByTheme: ResolveCategoryColor;
  handleViewChange: (nextView: ViewMode) => void;
  handleNavigate: (direction: "next" | "prev") => void;
  handleMonthSelect: (date: Date, isCurrentMonth: boolean) => void;
  toggleTheme: () => void;
  canToggleTheme: boolean;
};

type UseWasteCalendarOptions = {
  initialView?: ViewMode;
  forcedTheme?: ThemeMode | null;
};

export function useWasteCalendarController(
  data: WasteDataset,
  options?: UseWasteCalendarOptions,
): WasteCalendarController {
  const config = useWasteCalendarConfig();
  const forcedTheme = options?.forcedTheme ?? null;
  const [view, setView] = useState<ViewMode>(options?.initialView ?? "month");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (forcedTheme) {
      return forcedTheme;
    }

    const storedTheme = readStoredTheme(config.themeStorageKey);

    if (storedTheme) {
      return storedTheme;
    }

    if (typeof window === "undefined") {
      return "light";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [cursorDate, setCursorDate] = useState<Date>(startOfDay(new Date()));
  const hasRestoredSelection = useRef(false);

  const today = useMemo(() => startOfDay(new Date()), []);

  const categoryIndex = useMemo(
    () => new Map(data.categories.map((category) => [category.id, category])),
    [data.categories],
  );

  const eventsByDate = useMemo(() => {
    return new Map(
      data.events.map((event) => {
        const categories = event.categories
          .map((categoryId) => categoryIndex.get(categoryId))
          .filter((category): category is WasteCategory => Boolean(category));

        return [event.date, categories];
      }),
    );
  }, [categoryIndex, data.events]);

  const sortedEventDates = useMemo(
    () => data.events.map((event) => event.date).sort((left, right) => left.localeCompare(right)),
    [data.events],
  );

  const resolveCategoryColorByTheme = useCallback<ResolveCategoryColor>(
    (category) => resolveCategoryColor(category, theme, config.darkCategoryColors),
    [config.darkCategoryColors, theme],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    if (!forcedTheme) {
      window.localStorage.setItem(config.themeStorageKey, theme);
    }
  }, [config.themeStorageKey, forcedTheme, theme]);

  useEffect(() => {
    const restoredDate = readStoredDate(config.selectedDateStorageKey, config.selectedDateMaxAgeHours);
    hasRestoredSelection.current = true;

    if (!restoredDate) {
      return;
    }

    queueMicrotask(() => {
      setSelectedDate(restoredDate);
      setCursorDate(restoredDate);
    });
  }, [config.selectedDateMaxAgeHours, config.selectedDateStorageKey]);

  useEffect(() => {
    if (!hasRestoredSelection.current) {
      return;
    }

    writeStoredDate(config.selectedDateStorageKey, selectedDate);
  }, [config.selectedDateStorageKey, selectedDate]);

  const heroData = useMemo(() => {
    const nearest = sortedEventDates.find((isoDate) => isoDate >= toIsoDate(today));

    if (!nearest) {
      return null;
    }

    const nearestDate = parseISO(nearest);
    const categories = sortCategoriesByPriority(eventsByDate.get(nearest) ?? [], config.heroPriorityCategoryIds);

    return {
      nearestDate,
      leadText: leadForDate(nearestDate, today),
      daysUntil: differenceInCalendarDays(nearestDate, today),
      homePickup: categories.filter((category) => isHomePickupCategory(category.id, config.homePickupCategoryIds)),
      stationPickup: categories.filter((category) => !isHomePickupCategory(category.id, config.homePickupCategoryIds)),
    };
  }, [config.heroPriorityCategoryIds, config.homePickupCategoryIds, eventsByDate, sortedEventDates, today]);

  const monthCells = useMemo(() => {
    const monthStart = startOfMonth(cursorDate);
    const monthEnd = endOfMonth(cursorDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const cells: DaySummary[] = [];
    let pointer = gridStart;

    while (pointer <= gridEnd) {
      const isoDate = toIsoDate(pointer);
      cells.push({
        date: pointer,
        isoDate,
        categories: eventsByDate.get(isoDate) ?? [],
        isToday: isSameDay(pointer, today),
        isCurrentMonth: isSameMonth(pointer, monthStart),
      });

      pointer = addDays(pointer, 1);
    }

    return cells;
  }, [cursorDate, eventsByDate, today]);

  const weekCells = useMemo(() => {
    const weekStart = startOfWeek(cursorDate, { weekStartsOn: 1 });

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const isoDate = toIsoDate(date);

      return {
        date,
        isoDate,
        categories: eventsByDate.get(isoDate) ?? [],
        isToday: isSameDay(date, today),
        isCurrentMonth: true,
      } satisfies DaySummary;
    });
  }, [cursorDate, eventsByDate, today]);

  const dayCell = useMemo(() => {
    const isoDate = toIsoDate(cursorDate);

    return {
      date: cursorDate,
      isoDate,
      categories: eventsByDate.get(isoDate) ?? [],
      isToday: isSameDay(cursorDate, today),
      isCurrentMonth: true,
    } satisfies DaySummary;
  }, [cursorDate, eventsByDate, today]);

  const selectedMonthCell = useMemo(() => {
    const isoDate = toIsoDate(selectedDate);

    return {
      date: selectedDate,
      isoDate,
      categories: eventsByDate.get(isoDate) ?? [],
    };
  }, [eventsByDate, selectedDate]);

  const handleViewChange = useCallback((nextView: ViewMode) => {
    setView(nextView);
    setCursorDate(startOfDay(selectedDate));
  }, [selectedDate]);

  const handleNavigate = useCallback((direction: "next" | "prev") => {
    setCursorDate((currentCursorDate) => {
      const nextDate = nextCursorDate(view, currentCursorDate, direction);

      if (view !== "month") {
        setSelectedDate(startOfDay(nextDate));
      }

      return nextDate;
    });
  }, [view]);

  const handleMonthSelect = useCallback((date: Date, isCurrentMonth: boolean) => {
    setSelectedDate(date);

    if (!isCurrentMonth) {
      setCursorDate(date);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (forcedTheme) {
      return;
    }

    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }, [forcedTheme]);

  return {
    view,
    theme,
    cursorDate,
    heroData,
    monthCells,
    weekCells,
    dayCell,
    selectedMonthCell,
    resolveCategoryColorByTheme,
    handleViewChange,
    handleNavigate,
    handleMonthSelect,
    toggleTheme,
    canToggleTheme: !forcedTheme,
  };
}
