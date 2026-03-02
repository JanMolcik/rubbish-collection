"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { cs } from "date-fns/locale";
import { useEffect, useMemo, useRef, useState } from "react";
import type { WasteCategory, WasteDataset } from "@/lib/waste-types";
import styles from "@/components/waste-collection-app.module.css";

type ViewMode = "day" | "week" | "month";
type ThemeMode = "light" | "dark";

type DaySummary = {
  date: Date;
  isoDate: string;
  categories: WasteCategory[];
  isToday: boolean;
  isCurrentMonth: boolean;
};

const THEME_KEY = "lipa-theme";
const SELECTED_DATE_KEY = "lipa-selected-date";
const HOME_PICKUP_IDS = new Set(["komunalni-odpad", "sko", "plasty", "papir"]);

const CATEGORY_COLORS_DARK: Record<string, string> = {
  "komunalni-odpad": "#ff8a70",
  plasty: "#7db8ff",
  papir: "#d4a870",
  sklo: "#50d4a0",
  kovy: "#9ab0d8",
  oleje: "#f0c860",
  "nebezpecny-odpad": "#d490d4",
};

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function intervalLabel(view: ViewMode, cursorDate: Date): string {
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

function nextCursorDate(view: ViewMode, cursorDate: Date, direction: "next" | "prev") {
  if (view === "month") {
    return direction === "next" ? addMonths(cursorDate, 1) : subMonths(cursorDate, 1);
  }

  if (view === "week") {
    return direction === "next" ? addWeeks(cursorDate, 1) : subWeeks(cursorDate, 1);
  }

  return direction === "next" ? addDays(cursorDate, 1) : subDays(cursorDate, 1);
}

function toRgba(hex: string, alpha: number): string {
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

function isHomePickupCategory(categoryId: string): boolean {
  return HOME_PICKUP_IDS.has(categoryId);
}

function categoryPriority(categoryId: string): number {
  if (categoryId === "komunalni-odpad" || categoryId === "sko") {
    return 0;
  }

  if (categoryId === "plasty") {
    return 1;
  }

  if (categoryId === "papir") {
    return 2;
  }

  return 10;
}

function categoryLabel(category: WasteCategory): string {
  if (category.id === "komunalni-odpad" || category.id === "sko") {
    return "SKO";
  }

  return category.name;
}

function daysLabel(days: number): string {
  if (days === 1) {
    return "den";
  }

  return "dní";
}

function getCategoryColor(category: WasteCategory, theme: ThemeMode): string {
  if (theme === "dark") {
    return CATEGORY_COLORS_DARK[category.id] ?? category.color;
  }

  return category.color;
}

function leadForDate(targetDate: Date, now: Date): string {
  const days = differenceInCalendarDays(targetDate, now);

  if (days === 0) {
    return "DNES";
  }

  if (days === 1) {
    return "ZÍTRA";
  }

  return format(targetDate, "EEEE", { locale: cs }).toUpperCase();
}

export function WasteCollectionApp({ data }: { data: WasteDataset }) {
  const [view, setView] = useState<ViewMode>("month");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = window.localStorage.getItem(THEME_KEY);

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [cursorDate, setCursorDate] = useState<Date>(startOfDay(new Date()));
  const hasRestoredSelection = useRef(false);

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

  const now = startOfDay(new Date());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const storedDate = window.localStorage.getItem(SELECTED_DATE_KEY);
    hasRestoredSelection.current = true;

    if (!storedDate) {
      return;
    }

    const parsed = parseISO(storedDate);

    if (Number.isNaN(parsed.getTime())) {
      return;
    }

    const restoredDate = startOfDay(parsed);

    queueMicrotask(() => {
      setSelectedDate(restoredDate);
      setCursorDate(restoredDate);
    });
  }, []);

  useEffect(() => {
    if (!hasRestoredSelection.current) {
      return;
    }

    window.localStorage.setItem(SELECTED_DATE_KEY, toIsoDate(selectedDate));
  }, [selectedDate]);

  const heroData = useMemo(() => {
    const nearest = sortedEventDates.find((isoDate) => isoDate >= toIsoDate(now));

    if (!nearest) {
      return null;
    }

    const nearestDate = parseISO(nearest);

    const categories = [...(eventsByDate.get(nearest) ?? [])].sort((left, right) => {
      const rankDiff = categoryPriority(left.id) - categoryPriority(right.id);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return left.name.localeCompare(right.name, "cs");
    });

    return {
      nearestDate,
      leadText: leadForDate(nearestDate, now),
      daysUntil: differenceInCalendarDays(nearestDate, now),
      homePickup: categories.filter((category) => isHomePickupCategory(category.id)),
      stationPickup: categories.filter((category) => !isHomePickupCategory(category.id)),
    };
  }, [eventsByDate, now, sortedEventDates]);

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
        isToday: isSameDay(pointer, now),
        isCurrentMonth: isSameMonth(pointer, monthStart),
      });

      pointer = addDays(pointer, 1);
    }

    return cells;
  }, [cursorDate, eventsByDate, now]);

  const weekCells = useMemo(() => {
    const start = startOfWeek(cursorDate, { weekStartsOn: 1 });

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      const isoDate = toIsoDate(date);

      return {
        date,
        isoDate,
        categories: eventsByDate.get(isoDate) ?? [],
        isToday: isSameDay(date, now),
        isCurrentMonth: true,
      } satisfies DaySummary;
    });
  }, [cursorDate, eventsByDate, now]);

  const dayCell = useMemo(() => {
    const isoDate = toIsoDate(cursorDate);

    return {
      date: cursorDate,
      isoDate,
      categories: eventsByDate.get(isoDate) ?? [],
      isToday: isSameDay(cursorDate, now),
      isCurrentMonth: true,
    } satisfies DaySummary;
  }, [cursorDate, eventsByDate, now]);

  const selectedMonthCell = useMemo(() => {
    const isoDate = toIsoDate(selectedDate);

    return {
      date: selectedDate,
      isoDate,
      categories: eventsByDate.get(isoDate) ?? [],
    };
  }, [eventsByDate, selectedDate]);

  function handleViewChange(nextView: ViewMode) {
    setView(nextView);
    setCursorDate(startOfDay(selectedDate));
  }

  function handleNavigate(direction: "next" | "prev") {
    const nextDate = nextCursorDate(view, cursorDate, direction);
    setCursorDate(nextDate);

    if (view !== "month") {
      setSelectedDate(startOfDay(nextDate));
    }
  }

  return (
    <main className={styles.shell} data-theme={theme}>
      <div className={styles.backgroundTexture} aria-hidden />
      <div className={styles.page}>
        <header className={styles.topbar}>
          <span className={styles.topbarBrand}>LÍPA - SVOZ ODPADŮ</span>
          <div className={styles.topbarRight}>
            <span className={styles.topbarYear}>{data.year}</span>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
              aria-label="Přepnout světlé a tmavé téma"
            >
              <span className={styles.sunIcon} aria-hidden>
                ☀
              </span>
              <span className={styles.moonIcon} aria-hidden>
                ☾
              </span>
            </button>
          </div>
        </header>

        <section className={styles.hero}>
          <p className={styles.heroLabel}>Nejbližší svoz</p>

          {heroData ? (
            <>
              <div className={styles.heroBody}>
                <div>
                  <p className={styles.heroLead}>{heroData.leadText}</p>
                  <p className={styles.heroDate}>{format(heroData.nearestDate, "d. MMMM yyyy", { locale: cs })}</p>
                  <p className={styles.heroWeekday}>{format(heroData.nearestDate, "EEEE", { locale: cs })}</p>
                </div>

                <div className={styles.heroCount}>
                  <p className={styles.heroNum}>{heroData.daysUntil}</p>
                  <p className={styles.heroUnit}>{daysLabel(heroData.daysUntil)}</p>
                </div>
              </div>

              <div className={styles.heroTypes}>
                <p className={styles.heroTypesLabel}>Typ svozu</p>
                <div className={styles.heroTypesRow}>
                  {heroData.homePickup.map((category) => {
                    const color = getCategoryColor(category, theme);

                    return (
                      <span
                        key={`home-${category.id}`}
                        className={styles.heroBadge}
                        style={{
                          color,
                        }}
                      >
                        <span className={styles.heroBadgeDot} style={{ backgroundColor: color }} />
                        {categoryLabel(category)}
                      </span>
                    );
                  })}

                  {heroData.stationPickup.map((category) => {
                    const color = getCategoryColor(category, theme);

                    return (
                      <span
                        key={`station-${category.id}`}
                        className={styles.heroBadge}
                        style={{
                          color,
                        }}
                      >
                        <span className={styles.heroBadgeDot} style={{ backgroundColor: color }} />
                        {categoryLabel(category)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className={styles.heroEmpty}>Pro tento rok zatím nejsou nahraná data.</p>
          )}
        </section>

        <section className={styles.calendarPanel}>
          <div className={styles.calendarHeader}>
            <div className={styles.viewSwitch}>
              {(["month", "week", "day"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={mode === view ? styles.viewButtonActive : styles.viewButton}
                  onClick={() => handleViewChange(mode)}
                >
                  {mode === "day" ? "Den" : mode === "week" ? "Týden" : "Měsíc"}
                </button>
              ))}
            </div>

            <div className={styles.navBlock}>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => handleNavigate("prev")}
                aria-label="Předchozí období"
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <p className={styles.intervalLabel}>{intervalLabel(view, cursorDate)}</p>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => handleNavigate("next")}
                aria-label="Další období"
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {view === "month" && (
            <div className={styles.monthScroller}>
              <div className={styles.weekdayHeader}>
                {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day, index) => (
                  <div key={day} className={index > 4 ? styles.weekendLabel : undefined}>
                    {day}
                  </div>
                ))}
              </div>
              <div className={styles.monthGrid}>
                {monthCells.map((cell) => {
                  const isSelected = cell.isoDate === selectedMonthCell.isoDate;
                  const baseClass = cell.isToday
                    ? styles.monthCellToday
                    : cell.isCurrentMonth
                      ? styles.monthCell
                      : styles.monthCellMuted;

                  return (
                    <button
                      key={cell.isoDate}
                      type="button"
                      className={`${baseClass} ${isSelected ? styles.monthCellSelected : ""}`}
                      onClick={() => {
                        setSelectedDate(startOfDay(cell.date));
                        if (!cell.isCurrentMonth) {
                          setCursorDate(startOfDay(cell.date));
                        }
                      }}
                      aria-label={`Vybrat den ${format(cell.date, "d. MMMM yyyy", { locale: cs })}`}
                    >
                      <p className={styles.dayNumber}>{format(cell.date, "d")}</p>
                      <div className={styles.cellMarkerWrap}>
                        {cell.categories.slice(0, 4).map((category) => (
                          <span
                            key={`${cell.isoDate}-${category.id}`}
                            className={styles.cellMarker}
                            style={{ backgroundColor: getCategoryColor(category, theme) }}
                            title={categoryLabel(category)}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className={styles.monthDetail}>
                <p className={styles.monthDetailHeader}>{format(selectedMonthCell.date, "EEEE d. MMMM", { locale: cs })}</p>
                {selectedMonthCell.categories.length ? (
                  <div className={styles.monthDetailList}>
                    {selectedMonthCell.categories.map((category) => (
                      <div
                        key={`month-detail-${selectedMonthCell.isoDate}-${category.id}`}
                        className={styles.monthDetailItem}
                        style={{ borderLeftColor: getCategoryColor(category, theme) }}
                      >
                        {categoryLabel(category)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>Bez svozu.</p>
                )}
              </div>
            </div>
          )}

          {view === "week" && (
            <div className={styles.weekGrid}>
              {weekCells.map((cell) => (
                <article key={cell.isoDate} className={cell.isToday ? styles.weekCellToday : styles.weekCell}>
                  <p className={styles.weekTitle}>{format(cell.date, "EEEE d. M.", { locale: cs })}</p>
                  <div className={styles.dayList}>
                    {cell.categories.length ? (
                      cell.categories.map((category) => (
                        <span
                          key={`${cell.isoDate}-${category.id}`}
                          className={styles.weekTag}
                          style={{
                            borderColor: getCategoryColor(category, theme),
                            color: getCategoryColor(category, theme),
                            backgroundColor: toRgba(getCategoryColor(category, theme), theme === "dark" ? 0.12 : 0.08),
                          }}
                        >
                          {categoryLabel(category)}
                        </span>
                      ))
                    ) : (
                      <span className={styles.emptyState}>Bez svozu</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {view === "day" && (
            <article className={styles.dayPanel}>
              <p className={styles.dayPanelDate}>{format(dayCell.date, "EEEE d. MMMM yyyy", { locale: cs })}</p>
              {dayCell.categories.length ? (
                <ul className={styles.dayPanelList}>
                  {dayCell.categories.map((category) => (
                    <li
                      key={`${dayCell.isoDate}-${category.id}`}
                      className={styles.dayPanelItem}
                      style={{ borderLeftColor: getCategoryColor(category, theme) }}
                    >
                      <span className={styles.dayPanelDot} style={{ backgroundColor: getCategoryColor(category, theme) }} />
                      {categoryLabel(category)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyState}>V tento den není naplánovaný svoz.</p>
              )}
            </article>
          )}

          <div className={styles.legend}>
            {data.categories.map((category) => {
              const color = getCategoryColor(category, theme);

              return (
                <span key={category.id} className={styles.legendItem}>
                  <span className={styles.legendPill} style={{ backgroundColor: color }} />
                  {categoryLabel(category)}
                </span>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
