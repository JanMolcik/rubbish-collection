import { WasteCalendar, WasteCalendarConfigProvider } from "@/components";
import type { WasteCalendarConfig } from "@/components";
import { getWasteDataset } from "@/lib/waste-data";

const wasteCalendarConfig: WasteCalendarConfig = {
  themeStorageKey: "lipa-theme",
  selectedDateStorageKey: "lipa-selected-date",
  homePickupCategoryIds: ["komunalni-odpad", "sko", "plasty", "papir"],
  heroPriorityCategoryIds: ["komunalni-odpad", "sko", "plasty", "papir"],
  darkCategoryColors: {
    "komunalni-odpad": "#ff8a70",
    plasty: "#7db8ff",
    papir: "#d4a870",
    sklo: "#50d4a0",
    kovy: "#9ab0d8",
    oleje: "#f0c860",
    "nebezpecny-odpad": "#d490d4",
  },
};

export default function Home() {
  const dataset = getWasteDataset();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rubbish-collection.vercel.app";
  const pageTitle = `Lípa | Přehled svozu odpadů ${dataset.year}`;
  const pageDescription = `Kalendář svozu odpadů pro obec ${dataset.municipality} (${dataset.region}) pro rok ${dataset.year}.`;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: pageDescription,
    url: siteUrl,
    inLanguage: "cs-CZ",
  };

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Harmonogram svozu odpadů ${dataset.municipality} ${dataset.year}`,
    description: pageDescription,
    inLanguage: "cs-CZ",
    temporalCoverage: `${dataset.year}-01-01/${dataset.year}-12-31`,
    dateModified: dataset.generatedAt,
    creator: {
      "@type": "GovernmentOrganization",
      name: `Obec ${dataset.municipality}`,
    },
    keywords: dataset.categories.map((category) => category.name),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
      <WasteCalendarConfigProvider config={wasteCalendarConfig}>
        <WasteCalendar data={dataset} />
      </WasteCalendarConfigProvider>
    </>
  );
}
