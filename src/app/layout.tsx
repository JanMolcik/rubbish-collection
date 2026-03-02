import type { Metadata, Viewport } from "next";
import { Anton, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Anton({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  weight: "400",
});

const body = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rubbish-collection.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lípa | Přehled svozu odpadů",
    template: "%s | Lípa - Svoz odpadů",
  },
  description:
    "Přehledný kalendář svozu odpadů pro obec Lípa. Nejbližší svoz, denní, týdenní i měsíční pohled.",
  applicationName: "Lípa - Svoz odpadů",
  keywords: [
    "svoz odpadu",
    "kalendář svozu",
    "Lípa",
    "komunální odpad",
    "plasty",
    "papír",
    "sklo",
    "odpadový harmonogram",
  ],
  authors: [{ name: "Obec Lípa" }],
  creator: "Obec Lípa",
  publisher: "Obec Lípa",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "/",
    siteName: "Lípa - Svoz odpadů",
    title: "Lípa | Přehled svozu odpadů",
    description:
      "Přehledný kalendář svozu odpadů pro obec Lípa. Nejbližší svoz, denní, týdenní i měsíční pohled.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Lípa - Svoz odpadů",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lípa | Přehled svozu odpadů",
    description:
      "Přehledný kalendář svozu odpadů pro obec Lípa. Nejbližší svoz, denní, týdenní i měsíční pohled.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1a5c2e" },
    { media: "(prefers-color-scheme: dark)", color: "#060f1e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
