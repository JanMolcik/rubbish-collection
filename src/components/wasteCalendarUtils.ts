import {
  addHours,
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

type StoredDatePayload = {
  date: string;
  savedAt: string;
};

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export function readStoredDate(storageKey: string, maxAgeHours: number): Date | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return null;
  }

  const now = new Date();
  const safeMaxAgeHours = maxAgeHours > 0 ? maxAgeHours : 1;

  try {
    const payload = JSON.parse(storedValue) as Partial<StoredDatePayload>;

    if (typeof payload.date !== "string" || typeof payload.savedAt !== "string") {
      return null;
    }

    const parsedDate = parseISO(payload.date);
    const savedAt = parseISO(payload.savedAt);

    if (!isValidDate(parsedDate) || !isValidDate(savedAt)) {
      return null;
    }

    if (addHours(savedAt, safeMaxAgeHours).getTime() <= now.getTime()) {
      return null;
    }

    return startOfDay(parsedDate);
  } catch {
    // Legacy values were plain ISO dates without timestamp metadata.
    // Skip restoring to avoid ambiguous expiry behavior.
    return null;
  }
}

export function writeStoredDate(storageKey: string, selectedDate: Date): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredDatePayload = {
    date: toIsoDate(selectedDate),
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(storageKey, JSON.stringify(payload));
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
