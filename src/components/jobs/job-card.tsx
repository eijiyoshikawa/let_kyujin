import Link from "next/link"
import {
  MapPin,
  Banknote,
  Building2,
  HardHat,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { getCategoryLabel } from "@/lib/categories"

type JobCardProps = {
  id: string
  title: string
  category: string
  employmentType: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string | null
  prefecture: string
  city: string | null
  source: string
  tags: string[]
  company: { name: string; logoUrl: string | null } | null
}

export function JobCard({ job }: { job: JobCardProps }) {
  const tagsToShow = job.tags.slice(0, 5)

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex gap-4 rounded-lg border bg-white p-4 transition hover:border-primary-400 hover:shadow-sm"
    >
      <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100 group-hover:bg-primary-50 transition">
        <HardHat className="h-6 w-6 text-primary-500" />
      </div>

      <div className="flex-1 min-w-0">
        {/* メタ: カテゴリ + 雇用形態 + 出典 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
            {getCategoryLabel(job.category)}
          </span>
          {job.employmentType && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {employmentTypeLabel(job.employmentType)}
            </span>
          )}
          {job.source === "hellowork" && (
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              HW
            </span>
          )}
        </div>

        {/* タイトル */}
        <h3 className="mt-1.5 text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition">
          {job.title}
        </h3>

        {/* 給与・勤務地（重要情報を 1 行で目立たせる） */}
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {job.salaryMin ? (
            <span className="inline-flex items-center gap-1 text-base font-bold text-primary-600">
              <Banknote className="h-4 w-4" />
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm text-gray-400">
              <Banknote className="h-4 w-4" />
              給与応相談
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            {job.prefecture}
            {job.city && ` ${job.city}`}
          </span>
        </div>

        {/* 会社名（小さく） */}
        {job.company && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {job.company.name}
          </p>
        )}

        {/* 待遇チップ（自動抽出されたタグを 5 件まで） */}
        {tagsToShow.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tagsToShow.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                {tag}
              </span>
            ))}
            {job.tags.length > tagsToShow.length && (
              <span className="text-xs text-gray-400 self-center">
                +{job.tags.length - tagsToShow.length}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center">
        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 transition" />
      </div>
    </Link>
  )
}

function formatSalary(
  min: number | null,
  max: number | null,
  type: string | null
): string {
  const unit = type === "hourly" ? "時給" : type === "annual" ? "年収" : "月給"
  const fmt = (n: number) =>
    n >= 10000 ? `${(n / 10000).toFixed(0)}万` : `${n.toLocaleString()}`
  if (min && max) return `${unit} ${fmt(min)}〜${fmt(max)}円`
  if (min) return `${unit} ${fmt(min)}円〜`
  return ""
}

function employmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    full_time: "正社員",
    part_time: "パート",
    contract: "契約社員",
  }
  return labels[type] ?? type
}
