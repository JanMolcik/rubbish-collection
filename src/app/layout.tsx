import type { Metadata } from "next";
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
