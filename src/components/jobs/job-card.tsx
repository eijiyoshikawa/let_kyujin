import Link from "next/link"
import { MapPin, Banknote, Building2, Clock, HardHat, ChevronRight } from "lucide-react"
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
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex gap-4 rounded-lg border bg-white p-4 transition hover:border-primary-400"
    >
      <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100 group-hover:bg-primary-50 transition">
        <HardHat className="h-6 w-6 text-primary-500" />
      </div>

      {/* Center: content */}
      <div className="flex-1 min-w-0">
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

        <h3 className="mt-1.5 text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition">
          {job.title}
        </h3>

        {job.company && (
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {job.company.name}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            {job.prefecture}
            {job.city && ` ${job.city}`}
          </span>
          {job.salaryMin && (
            <span className="flex items-center gap-1 font-medium text-primary-600">
              <Banknote className="h-3.5 w-3.5" />
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
            </span>
          )}
        </div>

        {job.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {job.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right: chevron */}
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
