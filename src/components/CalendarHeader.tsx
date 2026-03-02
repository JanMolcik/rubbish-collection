import styles from "@/components/WasteCalendar.module.css";
import type { ViewMode } from "@/components/wasteCalendarTypes";
import { intervalLabel } from "@/components/wasteCalendarUtils";

const VIEW_OPTIONS: ViewMode[] = ["month", "week", "day"];

function viewLabel(mode: ViewMode): string {
  if (mode === "month") {
    return "Měsíc";
  }

  if (mode === "week") {
    return "Týden";
  }

  return "Den";
}

export function CalendarHeader({
  view,
  cursorDate,
  onViewChange,
  onNavigate,
}: {
  view: ViewMode;
  cursorDate: Date;
  onViewChange: (view: ViewMode) => void;
  onNavigate: (direction: "next" | "prev") => void;
}) {
  return (
    <div className={styles.calendarHeader}>
      <div className={styles.viewSwitch} role="group" aria-label="Přepnutí zobrazení kalendáře">
        {VIEW_OPTIONS.map((mode) => (
          <button
            key={mode}
            type="button"
            className={mode === view ? styles.viewButtonActive : styles.viewButton}
            onClick={() => onViewChange(mode)}
            aria-pressed={mode === view}
          >
            {viewLabel(mode)}
          </button>
        ))}
      </div>

      <div className={styles.navBlock} role="group" aria-label="Navigace mezi obdobími">
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onNavigate("prev")}
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
          onClick={() => onNavigate("next")}
          aria-label="Další období"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
