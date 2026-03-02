import type { MetadataRoute } from "next";
import { getWasteDataset } from "@/lib/waste-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rubbish-collection.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const dataset = getWasteDataset();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(dataset.generatedAt),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
