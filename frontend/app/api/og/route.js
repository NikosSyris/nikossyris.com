import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Nikos Syris' Blog";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
        }}
      >
        <div style={{ fontSize: "22px", color: "#9ca3af", fontFamily: "sans-serif" }}>
          nikossyris.com
        </div>

        <div
          style={{
            fontSize: title.length > 50 ? "48px" : "60px",
            fontWeight: "bold",
            color: "#ededed",
            fontFamily: "sans-serif",
            lineHeight: 1.2,
            maxWidth: "960px",
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: "20px", color: "#9ca3af", fontFamily: "sans-serif" }}>
          Nikos Syris
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
