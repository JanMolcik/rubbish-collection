import styles from "@/components/WasteCalendar.module.css";
import type { ThemeMode } from "@/components/wasteCalendarTypes";

export function TopBar({
  year,
  theme,
  onToggleTheme,
}: {
  year: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  const toggleLabel = theme === "dark" ? "Přepnout na světlé téma" : "Přepnout na tmavé téma";

  return (
    <header className={styles.topbar}>
      <p className={styles.topbarBrand} aria-label="Název aplikace">
        LÍPA - SVOZ ODPADŮ
      </p>
      <div className={styles.topbarRight}>
        <span className={styles.topbarYear}>{year}</span>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={onToggleTheme}
          aria-label={toggleLabel}
          aria-pressed={theme === "dark"}
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
  );
}
