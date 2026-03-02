import { format } from "date-fns";
import { cs } from "date-fns/locale";
import styles from "@/components/WasteCalendar.module.css";
import type { DaySummary, ResolveCategoryColor } from "@/components/wasteCalendarTypes";
import { categoryLabel } from "@/components/wasteCalendarUtils";

export function DayView({
  day,
  resolveCategoryColor,
}: {
  day: DaySummary;
  resolveCategoryColor: ResolveCategoryColor;
}) {
  return (
    <article className={styles.dayPanel}>
      <p className={styles.dayPanelDate}>{format(day.date, "EEEE d. MMMM yyyy", { locale: cs })}</p>
      {day.categories.length ? (
        <ul className={styles.dayPanelList}>
          {day.categories.map((category) => {
            const color = resolveCategoryColor(category);

            return (
              <li
                key={`${day.isoDate}-${category.id}`}
                className={styles.dayPanelItem}
                style={{ borderLeftColor: color }}
              >
                <span className={styles.dayPanelDot} style={{ backgroundColor: color }} />
                {categoryLabel(category)}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.emptyState}>V tento den není naplánovaný svoz.</p>
      )}
    </article>
  );
}
