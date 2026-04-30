import { ImageResponse } from "next/og";

export const alt = "The Drip — Specialty Coffee Discovery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#faf9f7",
          color: "#1c1917",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#1c1917",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
            }}
          >
            ☕
          </div>
          <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>
            The Drip
          </span>
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>
          Specialty coffee, ranked by people who actually drink it.
        </div>
        <div style={{ marginTop: 40, fontSize: 30, color: "#78716c" }}>
          Community Elo meets structured pro reviews.
        </div>
      </div>
    ),
    { ...size },
  );
}
