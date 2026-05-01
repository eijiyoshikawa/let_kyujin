"use client"

import { useEffect } from "react"
import Link from "next/link"

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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-primary-600">エラーが発生しました</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          ページを表示できません
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          一時的な問題が発生しています。時間をおいて再度お試しください。
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
          >
            再読み込み
          </button>
          <Link
            href="/"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
