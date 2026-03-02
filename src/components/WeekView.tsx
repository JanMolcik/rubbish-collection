import { format } from "date-fns";
import { cs } from "date-fns/locale";
import styles from "@/components/WasteCalendar.module.css";
import type { DaySummary, ResolveCategoryColor, ThemeMode } from "@/components/wasteCalendarTypes";
import { categoryLabel, toRgba } from "@/components/wasteCalendarUtils";

export function WeekView({
  cells,
  theme,
  resolveCategoryColor,
}: {
  cells: DaySummary[];
  theme: ThemeMode;
  resolveCategoryColor: ResolveCategoryColor;
}) {
  return (
    <div className={styles.weekGrid}>
      {cells.map((cell) => (
        <article key={cell.isoDate} className={cell.isToday ? styles.weekCellToday : styles.weekCell}>
          <p className={styles.weekTitle}>{format(cell.date, "EEEE d. M.", { locale: cs })}</p>
          <div className={styles.dayList}>
            {cell.categories.length ? (
              cell.categories.map((category) => {
                const color = resolveCategoryColor(category);

                return (
                  <span
                    key={`${cell.isoDate}-${category.id}`}
                    className={styles.weekTag}
                    style={{
                      borderColor: color,
                      color,
                      backgroundColor: toRgba(color, theme === "dark" ? 0.12 : 0.08),
                    }}
                  >
                    {categoryLabel(category)}
                  </span>
                );
              })
            ) : (
              <span className={styles.emptyState}>Bez svozu</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
