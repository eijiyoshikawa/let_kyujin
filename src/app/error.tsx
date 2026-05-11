"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center bg-primary-50 border-2 border-primary-100">
          <AlertTriangle className="h-7 w-7 text-primary-600" />
        </div>
        <p className="mt-4 text-xs font-bold tracking-wide text-primary-600">
          ERROR
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          ページを表示できません
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          一時的な問題が発生しています。<br className="sm:hidden" />
          時間をおいて再度お試しください。
        </p>
        {error.digest && (
          <p className="mt-3 inline-block bg-gray-100 px-2 py-1 text-[10px] font-mono text-gray-500">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="press inline-flex items-center gap-1.5 bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            再読み込み
          </button>
          <Link
            href="/"
            className="press inline-flex items-center gap-1.5 border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
          >
            <Home className="h-4 w-4" />
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
