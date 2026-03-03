import styles from "@/components/WasteCalendar.module.css";

export type AppFooterLink = {
  label: string;
  url: string;
};

type AppFooterProps = {
  copyrightName: string;
  links: AppFooterLink[];
};

export function AppFooter({ copyrightName, links }: AppFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.appFooter} aria-label="Informace o autorovi aplikace">
      <p className={styles.appFooterText}>© {currentYear} {copyrightName}</p>
      <nav className={styles.appFooterLinks} aria-label="Sociální a profesní odkazy">
        {links.map((link) => (
          <a
            key={link.url}
            className={styles.appFooterLink}
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={link.label}
            title={link.label}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
