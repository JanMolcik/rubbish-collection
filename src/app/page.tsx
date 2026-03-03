import { WasteCalendar, WasteCalendarConfigProvider } from "@/components";
import { wasteCalendarConfig } from "@/lib/waste-calendar-config";
import { getWasteDataset } from "@/lib/waste-data";

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
