"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

type State =
  | { status: "loading" }
  | { status: "success"; alreadyVerified: boolean }
  | { status: "error"; message: string }

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [state, setState] = useState<State>({ status: "loading" })

  useEffect(() => {
    if (!token) return

    let cancelled = false

    void (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (cancelled) return

        if (!res.ok) {
          setState({
            status: "error",
            message: data.error ?? "確認に失敗しました",
          })
          return
        }
        setState({
          status: "success",
          alreadyVerified: Boolean(data.alreadyVerified),
        })
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "通信エラーが発生しました",
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  if (!token) {
    return (
      <div className="mt-6 border bg-white p-6 shadow-sm text-center">
        <p className="text-red-600">確認リンクが見つかりません。</p>
        <Link
          href="/register"
          className="mt-4 inline-block text-sm font-medium text-primary-600"
        >
          再度ご登録
        </Link>
      </div>
    )
  }

  if (state.status === "loading") {
    return (
      <div className="mt-6 border bg-white p-6 shadow-sm text-center text-gray-600">
        確認中...
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="mt-6 border bg-white p-6 shadow-sm text-center">
        <p className="text-red-600">{state.message}</p>
        <Link
          href="/register"
          className="mt-4 inline-block text-sm font-medium text-primary-600"
        >
          再度ご登録
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-6 border bg-white p-6 shadow-sm text-center">
      <p className="text-green-600 font-medium">
        {state.alreadyVerified
          ? "このメールアドレスは既に確認済みです。"
          : "メールアドレスの確認が完了しました"}
      </p>
      <Link
        href="/login"
        className="mt-4 inline-block bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        ログインする
      </Link>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 text-center">
        メールアドレスの確認
      </h1>
      <Suspense
        fallback={
          <div className="mt-6 text-center text-gray-500">読み込み中...</div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
