import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lípa - Svoz odpadů",
    short_name: "Svoz odpadů",
    description: "Kalendář svozu odpadů pro obec Lípa.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a5c2e",
    lang: "cs-CZ",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
