"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { JobCard } from "./job-card"
import { JobCardSkeletonGrid } from "@/components/ui/skeleton"

type RecommendedJob = {
  id: string
  title: string
  category: string
  prefecture: string
  city: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string | null
  employmentType: string | null
  source: string
  tags: string[]
  company: {
    name: string
    logoUrl: string | null
    /** GbizINFO JSONB（あれば建設業許可バッジ表示） */
    gbizData?: unknown
  } | null
}

/**
 * トップページなど ISR キャッシュされたページに、クライアント fetch で
 * パーソナライズおすすめを差し込むセクション。
 *
 * - 初回マウント時に `/api/recommendations?limit=N` を叩く
 * - サーバー側で gc_sid Cookie を読むため、匿名ユーザーでも閲覧履歴から
 *   推薦が出る
 * - personalized: false（履歴ゼロ）の場合は出さない（SSR 側の人気枠と重複させない）
 * - エラー時はサイレントに非表示
 */
export function RecommendedForYou({
  limit = 6,
  alwaysShow = false,
}: {
  limit?: number
  alwaysShow?: boolean
}) {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ready"; jobs: RecommendedJob[]; personalized: boolean }
    | { kind: "error" }
  >({ kind: "loading" })

  useEffect(() => {
    const ctrl = new AbortController()
    // INP 保護: API 応答が 2 秒以上かかったら諦めて非表示にし、
    // メインスレッドのアイドル時間を確保する。
    const timeoutId = setTimeout(() => ctrl.abort(), 2000)

    fetch(`/api/recommendations?limit=${limit}`, {
      credentials: "same-origin",
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        setState({
          kind: "ready",
          jobs: data.jobs ?? [],
          personalized: !!data.personalized,
        })
      })
      .catch(() => {
        setState({ kind: "error" })
      })
      .finally(() => {
        clearTimeout(timeoutId)
      })
    return () => {
      clearTimeout(timeoutId)
      ctrl.abort()
    }
  }, [limit])

  if (state.kind === "error") return null

  if (state.kind === "loading") {
    return (
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Sparkles className="h-5 w-5 text-amber-500" />
          あなたへのおすすめ求人
        </h2>
        <div className="mt-4">
          <JobCardSkeletonGrid count={Math.min(4, limit)} cols="sm:grid-cols-2" />
        </div>
      </section>
    )
  }

  // ログイン無し + 閲覧履歴も無い → 出さない（SSR 側の人気枠と重複するため）
  if (!alwaysShow && !state.personalized) return null
  if (state.jobs.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
        <Sparkles className="h-5 w-5 text-amber-500" />
        あなたへのおすすめ求人
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        {state.personalized
          ? "閲覧履歴・お気に入りから、興味に合いそうな求人を選んでいます。"
          : "建設業の注目求人です。"}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.jobs.slice(0, limit).map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  )
}
