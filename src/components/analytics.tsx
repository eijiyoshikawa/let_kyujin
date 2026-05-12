"use client"

import Script from "next/script"
import { useSyncExternalStore } from "react"

/**
 * GA4 ローダー。Cookie 同意バナーで "all" を選択された場合のみスクリプトを読み込む。
 * GDPR / 改正電気通信事業法（2023.6〜）の同意要件に準拠。
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const consented = useSyncExternalStore<boolean>(
    (cb) => {
      window.addEventListener("storage", cb)
      window.addEventListener("cookie-consent-changed", cb)
      return () => {
        window.removeEventListener("storage", cb)
        window.removeEventListener("cookie-consent-changed", cb)
      }
    },
    () => {
      try {
        return localStorage.getItem("cookie_consent") === "all"
      } catch {
        return false
      }
    },
    () => false
  )

  if (!gaId || !consented) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
