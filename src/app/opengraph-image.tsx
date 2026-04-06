import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "建設求人ポータル"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: "white",
            marginBottom: 20,
          }}
        >
          🏗️ 建設求人ポータル
        </div>
        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 40,
          }}
        >
          建築・土木・設備・解体に特化した求人サイト
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          株式会社LET運営
        </div>
      </div>
    ),
    { ...size }
  )
}
