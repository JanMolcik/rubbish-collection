import { format } from "date-fns";
import { cs } from "date-fns/locale";
import styles from "@/components/WasteCalendar.module.css";
import type { HeroPickupData, HeroData, ResolveCategoryColor } from "@/components/wasteCalendarTypes";
import { categoryLabel, daysLabel } from "@/components/wasteCalendarUtils";

function PickupBadges({
  pickup,
  resolveCategoryColor,
}: {
  pickup: HeroPickupData;
  resolveCategoryColor: ResolveCategoryColor;
}) {
  return (
    <div className={styles.heroTypesRow}>
      {[...pickup.homePickup, ...pickup.stationPickup].map((category) => {
        const color = resolveCategoryColor(category);

        return (
          <span key={category.id} className={styles.heroBadge} style={{ color }}>
            <span className={styles.heroBadgeDot} style={{ backgroundColor: color }} />
            {categoryLabel(category)}
          </span>
        );
      })}
    </div>
  );
}

function relativeDateLabel(daysUntil: number): string {
  if (daysUntil === 0) {
    return "dnes";
  }

  if (daysUntil === 1) {
    return "zítra";
  }

  if (daysUntil === -1) {
    return "včera";
  }

  if (daysUntil < 0) {
    return `před ${Math.abs(daysUntil)} dny`;
  }

  return `za ${daysUntil} ${daysLabel(daysUntil)}`;
}

export function HeroSection({
  heroData,
  resolveCategoryColor,
}: {
  heroData: HeroData | null;
  resolveCategoryColor: ResolveCategoryColor;
}) {
  const pickup = heroData?.pickup ?? null;
  const selectedPickupCategories = pickup
    ? [...pickup.homePickup, ...pickup.stationPickup].map(categoryLabel).join(", ")
    : "";
  const selectionAnnouncement =
    heroData?.mode === "selected"
      ? pickup
        ? `${format(heroData.displayDate, "d. MMMM yyyy", { locale: cs })}: svoz ${selectedPickupCategories}.`
        : `${format(heroData.displayDate, "d. MMMM yyyy", { locale: cs })}: bez svozu.${
            heroData.nextPickup
              ? ` Další svoz ${format(heroData.nextPickup.date, "d. MMMM", { locale: cs })}.`
              : ""
          }`
      : "";

  return (
    <section className={styles.hero} aria-labelledby="pickup-summary-heading">
      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {selectionAnnouncement}
      </span>
      <h2 id="pickup-summary-heading" className={styles.heroLabel}>
        {heroData?.mode === "selected" ? "Vybraný den" : "Nejbližší svoz"}
      </h2>

      {heroData ? (
        <>
          <div className={styles.heroBody}>
            <div>
              <p className={styles.heroLead}>{heroData.leadText}</p>
              <p className={styles.heroDate}>{format(heroData.displayDate, "d. MMMM yyyy", { locale: cs })}</p>
              <p className={styles.heroWeekday}>{format(heroData.displayDate, "EEEE", { locale: cs })}</p>
            </div>

            {pickup && pickup.daysUntil >= 0 && (
              <div className={styles.heroCount} aria-label={`Svoz ${relativeDateLabel(pickup.daysUntil)}`}>
                <p className={styles.heroNum}>{pickup.daysUntil}</p>
                <p className={styles.heroUnit}>{daysLabel(pickup.daysUntil)}</p>
              </div>
            )}
          </div>

          {pickup && (
            <div className={styles.heroTypes}>
              <p className={styles.heroTypesLabel}>Typ svozu</p>
              <PickupBadges pickup={pickup} resolveCategoryColor={resolveCategoryColor} />
            </div>
          )}

          {!pickup && heroData.nextPickup && (
            <div className={styles.heroNextPickup}>
              <p className={styles.heroTypesLabel}>Další svoz</p>
              <p className={styles.heroNextDate}>
                {format(heroData.nextPickup.date, "EEEE d. MMMM", { locale: cs })} ·{" "}
                {relativeDateLabel(heroData.nextPickup.daysUntil)}
              </p>
              <PickupBadges pickup={heroData.nextPickup} resolveCategoryColor={resolveCategoryColor} />
            </div>
          )}

          {!pickup && !heroData.nextPickup && (
            <p className={styles.heroNoNext}>Po vybraném dni už není v kalendáři další svoz.</p>
          )}
        </>
      ) : (
        <p className={styles.heroEmpty}>Pro tento rok zatím nejsou nahraná data.</p>
      )}
    </section>
  );
}
