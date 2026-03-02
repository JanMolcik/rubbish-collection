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
import { useMemo, useState } from "react";
import type { WasteCategory, WasteDataset } from "@/lib/waste-types";
import styles from "@/components/waste-collection-app.module.css";

type ViewMode = "day" | "week" | "month";

type DaySummary = {
  date: Date;
  isoDate: string;
  categories: WasteCategory[];
  isToday: boolean;
  isCurrentMonth: boolean;
};

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function buildRelativeLead(targetDate: Date, now: Date): string {
  const days = differenceInCalendarDays(targetDate, now);

  if (days === 0) {
    return `Dnes ${format(targetDate, "d. M.", { locale: cs })}`;
  }

  if (days === 1) {
    return `Zítra ${format(targetDate, "d. M.", { locale: cs })}`;
  }

  return `${format(targetDate, "EEEE d. M.", { locale: cs })}`;
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

export function WasteCollectionApp({ data }: { data: WasteDataset }) {
  const [view, setView] = useState<ViewMode>("month");
  const [cursorDate, setCursorDate] = useState<Date>(startOfDay(new Date()));

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

  const heroData = useMemo(() => {
    const nearest = sortedEventDates.find((isoDate) => isoDate >= toIsoDate(now));
    if (!nearest) {
      return null;
    }

    const nearestDate = parseISO(nearest);

    const categories = eventsByDate.get(nearest) ?? [];

    return {
      nearestDate,
      categories,
      leadText: buildRelativeLead(nearestDate, now),
      daysUntil: differenceInCalendarDays(nearestDate, now),
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

  return (
    <main className={styles.shell}>
      <div className={styles.backgroundGlow} aria-hidden />
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Svoz odpadů {data.year}</p>
        <h1 className={styles.title}>Lípa v rytmu svozu</h1>
        <p className={styles.subtitle}>
          Přehled pro obec {data.municipality}, {data.region}. Žádné hledání v tabulce, jen jasná odpověď co se vyváží dnes,
          zítra a dál.
        </p>

        {heroData ? (
          <div className={styles.heroCard}>
            <div>
              <p className={styles.heroLead}>{heroData.leadText}</p>
              <p className={styles.heroDate}>{format(heroData.nearestDate, "EEEE, d. MMMM", { locale: cs })}</p>
            </div>
            <div className={styles.heroMeta}>
              {heroData.daysUntil === 0 ? "Dnes" : `${heroData.daysUntil} dní`}
            </div>
            <div className={styles.tagWrap}>
              {heroData.categories.map((category) => (
                <span
                  key={category.id}
                  className={styles.tag}
                  style={{
                    borderColor: category.color,
                    backgroundColor: `${category.color}20`,
                  }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.heroCard}>
            <p className={styles.heroLead}>Pro tento rok zatím nejsou nahraná data.</p>
          </div>
        )}
      </section>

      <section className={styles.calendarPanel}>
        <div className={styles.calendarHeader}>
          <div className={styles.viewSwitch}>
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={mode === view ? styles.viewButtonActive : styles.viewButton}
                onClick={() => setView(mode)}
              >
                {mode === "day" ? "Den" : mode === "week" ? "Týden" : "Měsíc"}
              </button>
            ))}
          </div>

          <div className={styles.navBlock}>
            <button type="button" className={styles.navButton} onClick={() => setCursorDate(nextCursorDate(view, cursorDate, "prev"))}>
              Předchozí
            </button>
            <p className={styles.intervalLabel}>{intervalLabel(view, cursorDate)}</p>
            <button type="button" className={styles.navButton} onClick={() => setCursorDate(nextCursorDate(view, cursorDate, "next"))}>
              Další
            </button>
          </div>
        </div>

        {view === "month" && (
          <div className={styles.monthScroller}>
            <div className={styles.weekdayHeader}>
              {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className={styles.monthGrid}>
              {monthCells.map((cell) => (
                <article
                  key={cell.isoDate}
                  className={cell.isToday ? styles.monthCellToday : cell.isCurrentMonth ? styles.monthCell : styles.monthCellMuted}
                >
                  <p className={styles.dayNumber}>{format(cell.date, "d.")}</p>
                  <div className={styles.cellTagWrap}>
                    {cell.categories.map((category) => (
                      <span
                        key={`${cell.isoDate}-${category.id}`}
                        className={styles.cellTag}
                        style={{ borderLeftColor: category.color }}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
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
                        style={{ borderColor: category.color }}
                      >
                        {category.name}
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
                    style={{ borderLeftColor: category.color }}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>V tento den není naplánovaný svoz.</p>
            )}
          </article>
        )}
      </section>
    </main>
  );
}
