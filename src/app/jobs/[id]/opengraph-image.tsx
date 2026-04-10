import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "求人詳細"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  await params

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, color: "white", marginBottom: 16 }}>
          ゲンバキャリア
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.8)" }}>
          建築・土木・設備・解体の求人サイト
        </div>
        <div style={{ position: "absolute", bottom: 30, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
          株式会社LET運営
        </div>
      </div>
    ),
    { ...size }
  )
}
