import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

// Link preview image for Facebook, WhatsApp, and other shares.
// Pages pass ?title= so each course gets its own card.
export function GET(request: Request) {
  const title = new URL(request.url).searchParams.get("title")?.trim().slice(0, 110) || brand.tagline;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #2a1810 0%, #4a2a1a 100%)",
          color: "#fff6ee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#e7cbb8", textTransform: "uppercase" }}>
          {brand.name}
        </div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 60 : 76, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#f0d2c0" }}>rightskillsbangladesh.com</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "cache-control": "public, max-age=86400, s-maxage=86400" },
    },
  );
}
