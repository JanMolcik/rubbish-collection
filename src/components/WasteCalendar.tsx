"use client";

import type { WasteDataset } from "@/lib/waste-types";
import { CalendarHeader } from "@/components/CalendarHeader";
import { DayView } from "@/components/DayView";
import { HeroSection } from "@/components/HeroSection";
import { Legend } from "@/components/Legend";
import { MonthView } from "@/components/MonthView";
import { TopBar } from "@/components/TopBar";
import { WeekView } from "@/components/WeekView";
import { useWasteCalendarController } from "@/components/hooks/useWasteCalendarController";
import styles from "@/components/WasteCalendar.module.css";
import type { ThemeMode, ViewMode } from "@/components/wasteCalendarTypes";

type WasteCalendarProps = {
  data: WasteDataset;
  mode?: "full" | "embed";
  initialView?: ViewMode;
  forcedTheme?: ThemeMode | null;
  showHero?: boolean;
  showLegend?: boolean;
  compact?: boolean;
};

export function WasteCalendar({
  data,
  mode = "full",
  initialView,
  forcedTheme = null,
  showHero = true,
  showLegend = true,
  compact = false,
}: WasteCalendarProps) {
  const {
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
    canToggleTheme,
  } = useWasteCalendarController(data, { initialView, forcedTheme });

  const shellClassName = [
    styles.shell,
    mode === "embed" ? styles.embedShell : "",
    compact ? styles.embedCompact : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={shellClassName} data-theme={theme} aria-label="Kalendář svozu odpadů">
      <div className={styles.backgroundTexture} aria-hidden />
      <div className={styles.page}>
        <h1 className={styles.srOnly}>Kalendář svozu odpadů pro obec {data.municipality}</h1>
        <TopBar year={data.year} theme={theme} onToggleTheme={toggleTheme} showThemeToggle={canToggleTheme} />

        {showHero && <HeroSection heroData={heroData} resolveCategoryColor={resolveCategoryColorByTheme} />}

        <section className={styles.calendarPanel} aria-labelledby="calendar-overview-heading">
          <h2 id="calendar-overview-heading" className={styles.srOnly}>
            Přehled svozu podle dne, týdne a měsíce
          </h2>
          <CalendarHeader view={view} cursorDate={cursorDate} onViewChange={handleViewChange} onNavigate={handleNavigate} />

          {view === "month" && (
            <MonthView
              cells={monthCells}
              selected={selectedMonthCell}
              onSelectDate={handleMonthSelect}
              resolveCategoryColor={resolveCategoryColorByTheme}
            />
          )}

          {view === "week" && (
            <WeekView cells={weekCells} theme={theme} resolveCategoryColor={resolveCategoryColorByTheme} />
          )}

          {view === "day" && <DayView day={dayCell} resolveCategoryColor={resolveCategoryColorByTheme} />}

          {showLegend && <Legend categories={data.categories} resolveCategoryColor={resolveCategoryColorByTheme} />}
        </section>
      </div>
    </main>
  );
}
