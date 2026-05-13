"use client"

import { useState } from "react"
import { Users, Loader2, ChevronDown } from "lucide-react"

interface Candidate {
  id: string
  name: string | null
  prefecture: string | null
  city: string | null
  desiredCategories: string[]
  desiredSalaryMin: number | null
  score: number
  reasons: string[]
}

/**
 * 応募者詳細ページ右側に置く「スカウト推奨候補」パネル。
 * 折りたたみ式で、開いた時に API を叩く。
 */
export function ScoutRecommendationPanel({
  applicationId,
}: {
  applicationId: string
}) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Candidate[]>([])
  const [error, setError] = useState("")

  async function fetchCandidates() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/company/applications/${applicationId}/scout-recommendations`
      )
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { candidates: Candidate[] }
      setItems(data.candidates)
      setLoaded(true)
    } catch {
      setError("候補の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    const next = !open
    setOpen(next)
    if (next && !loaded && !loading) {
      await fetchCandidates()
    }
  }

  return (
    <section className="border bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
          <Users className="h-4 w-4 text-primary-600" />
          類似候補をスカウト
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      <p className="mt-1 text-xs text-gray-500">
        この応募者と希望条件が近い登録者を最大 10 件まで提案します。
      </p>

      {open && (
        <div className="mt-3">
          {loading ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              候補を計算中...
            </div>
          ) : error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-gray-500">該当する候補が見つかりませんでした。</p>
          ) : (
            <ul className="divide-y border">
              {items.map((c) => (
                <li key={c.id} className="px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {c.name ?? "（氏名未設定）"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.prefecture}
                        {c.city ? ` ${c.city}` : ""}
                      </p>
                      <ul className="mt-1 flex flex-wrap gap-1">
                        {c.reasons.map((r) => (
                          <li
                            key={r}
                            className="inline-block bg-primary-50 text-primary-700 border border-primary-100 px-1.5 py-0.5 text-xs"
                          >
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <a
                      href={`/company/scouts/new?userId=${c.id}`}
                      className="press inline-flex shrink-0 items-center gap-1 bg-primary-600 hover:bg-primary-700 px-2.5 py-1 text-xs font-bold text-white"
                    >
                      スカウト
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
