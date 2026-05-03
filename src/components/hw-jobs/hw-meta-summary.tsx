import Link from "next/link"
import { Database, MapPin } from "lucide-react"
import { getHwMeta } from "@/lib/jobs-api"
import { safeFetch } from "@/lib/jobs-api/safe-fetch"

const TOP_PREFECTURES_COUNT = 8

/**
 * HW 求人の総件数 + 都道府県別 Top N を表示。
 * 失敗時はセクション非表示。
 */
export async function HwMetaSummary() {
  const result = await safeFetch(() => getHwMeta())
  if (!result.ok) return null

  const top = Object.entries(result.data.byPrefecture)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_PREFECTURES_COUNT)

  if (result.data.total === 0 || top.length === 0) return null

  return (
    <section className="border-t bg-blue-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="flex items-center gap-1.5 text-base font-bold text-gray-900">
          <Database className="h-4 w-4 text-blue-600" />
          ハローワーク掲載中
          <span className="ml-2 text-blue-700">{result.data.total.toLocaleString()} 件</span>
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {top.map(([prefecture, count]) => (
            <Link
              key={prefecture}
              href={`/hw-jobs?prefecture=${encodeURIComponent(prefecture)}`}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
            >
              <MapPin className="h-3 w-3" />
              {prefecture}
              <span className="text-blue-400">{count.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
