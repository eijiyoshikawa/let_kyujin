import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "ゲンバキャリア"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ fontSize: 72, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          ゲンバキャリア
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.85)", marginBottom: 40 }}>
          建築・土木・設備・解体に特化した求人サイト
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>求人検索</span>
          <span>・</span>
          <span>履歴書作成</span>
          <span>・</span>
          <span>転職サポート</span>
        </div>
        <div style={{ position: "absolute", bottom: 30, fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
          株式会社LET運営
        </div>
      </div>
    ),
    { ...size }
  )
}
