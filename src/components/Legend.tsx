import type { WasteCategory } from "@/lib/waste-types";
import styles from "@/components/WasteCalendar.module.css";
import type { ResolveCategoryColor } from "@/components/wasteCalendarTypes";
import { categoryLabel } from "@/components/wasteCalendarUtils";

export function Legend({
  categories,
  resolveCategoryColor,
}: {
  categories: WasteCategory[];
  resolveCategoryColor: ResolveCategoryColor;
}) {
  return (
    <ul className={styles.legend} aria-label="Legenda typů odpadu">
      {categories.map((category) => {
        const color = resolveCategoryColor(category);

        return (
          <li key={category.id} className={styles.legendItem}>
            <span className={styles.legendPill} style={{ backgroundColor: color }} />
            {categoryLabel(category)}
          </li>
        );
      })}
    </ul>
  );
}
