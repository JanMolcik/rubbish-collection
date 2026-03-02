import { format, startOfDay } from "date-fns";
import { cs } from "date-fns/locale";
import styles from "@/components/WasteCalendar.module.css";
import type { DaySummary, ResolveCategoryColor, SelectedDaySummary } from "@/components/wasteCalendarTypes";
import { categoryLabel } from "@/components/wasteCalendarUtils";

const WEEKDAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

export function MonthView({
  cells,
  selected,
  onSelectDate,
  resolveCategoryColor,
}: {
  cells: DaySummary[];
  selected: SelectedDaySummary;
  onSelectDate: (date: Date, isCurrentMonth: boolean) => void;
  resolveCategoryColor: ResolveCategoryColor;
}) {
  return (
    <div className={styles.monthScroller}>
      <div className={styles.weekdayHeader}>
        {WEEKDAY_LABELS.map((day, index) => (
          <div key={day} className={index > 4 ? styles.weekendLabel : undefined}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.monthGrid}>
        {cells.map((cell) => {
          const isSelected = cell.isoDate === selected.isoDate;
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
              onClick={() => onSelectDate(startOfDay(cell.date), cell.isCurrentMonth)}
              aria-label={`Vybrat den ${format(cell.date, "d. MMMM yyyy", { locale: cs })}`}
              aria-pressed={isSelected}
              aria-current={cell.isToday ? "date" : undefined}
            >
              <p className={styles.dayNumber}>{format(cell.date, "d")}</p>
              <div className={styles.cellMarkerWrap}>
                {cell.categories.slice(0, 4).map((category) => (
                  <span
                    key={`${cell.isoDate}-${category.id}`}
                    className={styles.cellMarker}
                    style={{ backgroundColor: resolveCategoryColor(category) }}
                    title={categoryLabel(category)}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.monthDetail}>
        <p className={styles.monthDetailHeader}>{format(selected.date, "EEEE d. MMMM", { locale: cs })}</p>
        {selected.categories.length ? (
          <div className={styles.monthDetailList}>
            {selected.categories.map((category) => (
              <div
                key={`month-detail-${selected.isoDate}-${category.id}`}
                className={styles.monthDetailItem}
                style={{ borderLeftColor: resolveCategoryColor(category) }}
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
  );
}
