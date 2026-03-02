import type { Metadata } from "next";
import { Cormorant_Garamond, Hind } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Hind({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Lípa | Přehled svozu odpadů",
  description:
    "Přehledný kalendář svozu odpadů pro obec Lípa. Nearest pickup hero + denní, týdenní a měsíční pohled.",
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
