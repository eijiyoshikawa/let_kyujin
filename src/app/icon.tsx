import { ImageResponse } from "next/og"

// Next.js App Router の dynamic icon。faviconとして /icon に配信される。
// brand orange (#f37524) を背景に "G" を中央配置。

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f37524",
          color: "white",
          fontSize: 24,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        G
      </div>
    ),
    { ...size }
  )
}
