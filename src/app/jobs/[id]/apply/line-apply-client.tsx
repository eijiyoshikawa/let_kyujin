"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Loader2, ExternalLink } from "lucide-react"

/**
 * クライアント側で：
 * 1. POST /api/jobs/[id]/apply-click を呼び出して click を記録 + LINE URL 取得
 * 2. モバイルなら自動で window.location.href に遷移
 * 3. デスクトップなら「LINE を開く」ボタン + QR コードを表示
 */
export function LineApplyClient({
  jobId,
  isMobileGuess,
  lineOaId,
}: {
  jobId: string
  isMobileGuess: boolean
  lineOaId: string
}) {
  const [lineUrl, setLineUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // SSR 側の UA 判定をそのまま使用（headers() で正確に判定済み）。
  // クライアント側で再判定すると hydration 後の setState で再レンダーが走るため避ける。
  const isMobile = isMobileGuess

  // マウント時に click を記録 + LINE URL 取得
  useEffect(() => {
    let cancelled = false
    async function track() {
      try {
        const res = await fetch(`/api/jobs/${jobId}/apply-click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "apply_page" }),
        })
        const json = await res.json()
        if (cancelled) return
        if (!res.ok || !json?.lineUrl) {
          setError(json?.error ?? "unknown_error")
          return
        }
        setLineUrl(json.lineUrl)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "network_error")
        }
      }
    }
    track()
    return () => {
      cancelled = true
    }
  }, [jobId])

  // モバイルかつ LINE URL 取得済みなら自動遷移
  useEffect(() => {
    if (!lineUrl || !isMobile) return
    // ボタンを 1 拍見せてから遷移（UX 向上）
    const id = setTimeout(() => {
      window.location.href = lineUrl
    }, 600)
    return () => clearTimeout(id)
  }, [lineUrl, isMobile])

  if (error) {
    return (
      <div className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800 rounded">
        通信エラーが発生しました。ページを再読み込みしてもう一度お試しください。
      </div>
    )
  }

  if (!lineUrl) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        LINE に接続しています…
      </div>
    )
  }

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(lineUrl)}`

  return (
    <div className="mt-6 space-y-4">
      <a
        href={lineUrl}
        className="flex w-full items-center justify-center gap-2 rounded bg-[#06C755] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#05A847] active:scale-[0.98]"
      >
        <MessageCircle className="h-5 w-5" />
        LINE で応募する
        <ExternalLink className="h-4 w-4 opacity-70" />
      </a>

      {/* デスクトップ向け QR コード */}
      {!isMobile && (
        <div className="mt-6 rounded border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-700 font-medium">
            スマートフォンで LINE を開きたい方
          </p>
          <p className="mt-1 text-xs text-gray-500">
            このコードを LINE で読み取ると応募メッセージが事前入力されます
          </p>
          {/* qr-server.com の公開 API は外部依存だが、本番でも追加コストなく動く */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt="LINE 応募用 QR コード"
            width={180}
            height={180}
            className="mx-auto mt-3"
            loading="lazy"
          />
          <p className="mt-2 text-[10px] text-gray-400">
            LINE 公式アカウント ID: {lineOaId || "（未設定）"}
          </p>
        </div>
      )}
    </div>
  )
}
