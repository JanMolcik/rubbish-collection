import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { cs } from "date-fns/locale";
import type { WasteCategory } from "@/lib/waste-types";
import type { ThemeMode, ViewMode } from "@/components/wasteCalendarTypes";

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function intervalLabel(view: ViewMode, cursorDate: Date): string {
  if (view === "month") {
    return format(cursorDate, "LLLL yyyy", { locale: cs });
  }

  if (view === "week") {
    const weekStart = startOfWeek(cursorDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(cursorDate, { weekStartsOn: 1 });
    return `${format(weekStart, "d. M.", { locale: cs })} - ${format(weekEnd, "d. M. yyyy", { locale: cs })}`;
  }

  return format(cursorDate, "EEEE d. MMMM yyyy", { locale: cs });
}

export function nextCursorDate(view: ViewMode, cursorDate: Date, direction: "next" | "prev") {
  if (view === "month") {
    return direction === "next" ? addMonths(cursorDate, 1) : subMonths(cursorDate, 1);
  }

  if (view === "week") {
    return direction === "next" ? addWeeks(cursorDate, 1) : subWeeks(cursorDate, 1);
  }

  return direction === "next" ? addDays(cursorDate, 1) : subDays(cursorDate, 1);
}

export function toRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return hex;
  }

  const int = Number.parseInt(normalized, 16);
  const red = (int >> 16) & 255;
  const green = (int >> 8) & 255;
  const blue = int & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function categoryLabel(category: WasteCategory): string {
  if (category.id === "komunalni-odpad" || category.id === "sko") {
    return "SKO";
  }

  return category.name;
}

export function daysLabel(days: number): string {
  return days === 1 ? "den" : "dní";
}

export function leadForDate(targetDate: Date, now: Date): string {
  const days = differenceInCalendarDays(targetDate, now);

  if (days === 0) {
    return "DNES";
  }

  if (days === 1) {
    return "ZÍTRA";
  }

  return format(targetDate, "EEEE", { locale: cs }).toUpperCase();
}

export function sortCategoriesByPriority(categories: WasteCategory[], priorityCategoryIds: string[]): WasteCategory[] {
  const rank = new Map(priorityCategoryIds.map((id, index) => [id, index]));

  return [...categories].sort((left, right) => {
    const leftRank = rank.get(left.id);
    const rightRank = rank.get(right.id);

    if (leftRank !== undefined && rightRank !== undefined) {
      return leftRank - rightRank;
    }

    if (leftRank !== undefined) {
      return -1;
    }

    if (rightRank !== undefined) {
      return 1;
    }

    return left.name.localeCompare(right.name, "cs");
  });
}

export function isHomePickupCategory(categoryId: string, homePickupCategoryIds: string[]): boolean {
  return homePickupCategoryIds.includes(categoryId);
}

export function readStoredDate(storageKey: string): Date | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedDate = window.localStorage.getItem(storageKey);

  if (!storedDate) {
    return null;
  }

  const parsed = parseISO(storedDate);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return startOfDay(parsed);
}

export function readStoredTheme(storageKey: string): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTheme = window.localStorage.getItem(storageKey);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return null;
}
