import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          color: "#d3f3dd",
          background:
            "radial-gradient(circle at 85% 35%, rgba(106,191,122,0.22), rgba(15,58,28,0.95) 42%), linear-gradient(120deg, #0f3a1c 0%, #0a2b15 60%, #081f11 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Lípa - svoz odpadů
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1,
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Kalendář svozu
          </div>
          <div style={{ fontSize: 38, color: "#9bd4a7" }}>Přehled svozu odpadů pro obec Lípa</div>
        </div>
      </div>
    ),
    size,
  );
}
