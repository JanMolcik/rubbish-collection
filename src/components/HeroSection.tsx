import { format } from "date-fns";
import { cs } from "date-fns/locale";
import styles from "@/components/WasteCalendar.module.css";
import type { HeroData, ResolveCategoryColor } from "@/components/wasteCalendarTypes";
import { categoryLabel, daysLabel } from "@/components/wasteCalendarUtils";

export function HeroSection({
  heroData,
  resolveCategoryColor,
}: {
  heroData: HeroData | null;
  resolveCategoryColor: ResolveCategoryColor;
}) {
  return (
    <section className={styles.hero} aria-labelledby="nearest-pickup-heading">
      <h2 id="nearest-pickup-heading" className={styles.heroLabel}>
        Nejbližší svoz
      </h2>

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
                const color = resolveCategoryColor(category);

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
                const color = resolveCategoryColor(category);

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
  );
}
