import Link from "next/link"
import { ArrowRight, Banknote, Briefcase, MapPin } from "lucide-react"
import { listHwJobs } from "@/lib/jobs-api"
import { safeFetch } from "@/lib/jobs-api/safe-fetch"
import { formatSalaryRange } from "@/lib/jobs-api/format"

/**
 * トップページ向けのハローワーク最新求人ストリップ。
 * - connector 未設定 / 失敗時はセクション自体を非表示にしてトップを壊さない
 * - 表示は最大 limit 件、新着順
 */
export async function HwJobsLatest({ limit = 6 }: { limit?: number }) {
  const result = await safeFetch(() => listHwJobs({ limit }))
  if (!result.ok) return null
  const items = result.data.items
  if (items.length === 0) return null

  return (
    <section className="border-t bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
            <Briefcase className="h-5 w-5 text-blue-600" />
            ハローワーク 新着求人
          </h2>
          <Link
            href="/hw-jobs"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            一覧を見る
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((job) => {
            const salary = formatSalaryRange(job.salary)
            return (
              <Link
                key={job.kjno}
                href={`/hw-jobs/${encodeURIComponent(job.kjno)}`}
                className="group rounded-lg border bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-700">
                    HW
                  </span>
                  {job.jobType && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">
                      {job.jobType}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {job.title ?? job.occupation ?? "（タイトル無し）"}
                </p>
                {job.company.name && (
                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">{job.company.name}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                  {job.location.prefecture && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location.prefecture}
                    </span>
                  )}
                  {salary && (
                    <span className="flex items-center gap-1 font-medium text-blue-600">
                      <Banknote className="h-3 w-3" />
                      {salary}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
