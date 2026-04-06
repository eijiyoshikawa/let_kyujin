import { prisma } from "@/lib/db"
import { JobCard } from "@/components/jobs/job-card"
import { Search } from "lucide-react"
import { PREFECTURES } from "@/lib/constants"
import { AREAS } from "@/lib/areas"
import { CATEGORIES, getCategoryLabel } from "@/lib/categories"
import type { Metadata } from "next"

type Props = {
  searchParams: Promise<Record<string, string | undefined>>
}

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "正社員" },
  { value: "part_time", label: "パート" },
  { value: "contract", label: "契約社員" },
] as const

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const parts = []
  if (params.prefecture) parts.push(params.prefecture)
  if (params.city) parts.push(params.city)
  if (params.category) parts.push(getCategoryLabel(params.category))
  const title = parts.length > 0 ? `${parts.join(" ")}の求人一覧` : "求人検索"
  return { title }
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? "1"))
  const limit = 20

  const where = {
    status: "active" as const,
    ...(params.prefecture && { prefecture: params.prefecture }),
    ...(params.city && { city: params.city }),
    ...(params.category && { category: params.category }),
    ...(params.employment_type && { employmentType: params.employment_type }),
    ...(params.salary_min && { salaryMin: { gte: Number(params.salary_min) } }),
    ...(params.q && {
      OR: [
        { title: { contains: params.q, mode: "insensitive" as const } },
        { description: { contains: params.q, mode: "insensitive" as const } },
      ],
    }),
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
      },
    }),
    prisma.job.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  // Determine cities to show based on selected prefecture
  const cities = params.prefecture ? (AREAS[params.prefecture] ?? []) : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Bar */}
      <form action="/jobs" className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="職種・キーワードで検索"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Prefecture Dropdown */}
            <div>
              <label htmlFor="prefecture" className="mb-1 block text-xs font-medium text-gray-700">
                都道府県
              </label>
              <select
                id="prefecture"
                name="prefecture"
                defaultValue={params.prefecture ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">すべて</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown (only shown when prefecture is selected) */}
            {params.prefecture && cities.length > 0 && (
              <div>
                <label htmlFor="city" className="mb-1 block text-xs font-medium text-gray-700">
                  市区町村
                </label>
                <select
                  id="city"
                  name="city"
                  defaultValue={params.city ?? ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">すべて</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="mb-1 block text-xs font-medium text-gray-700">
                職種カテゴリ
              </label>
              <select
                id="category"
                name="category"
                defaultValue={params.category ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">すべて</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type Dropdown */}
            <div>
              <label htmlFor="employment_type" className="mb-1 block text-xs font-medium text-gray-700">
                雇用形態
              </label>
              <select
                id="employment_type"
                name="employment_type"
                defaultValue={params.employment_type ?? ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="">すべて</option>
                {EMPLOYMENT_TYPES.map((et) => (
                  <option key={et.value} value={et.value}>
                    {et.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Salary Input */}
            <div>
              <label htmlFor="salary_min" className="mb-1 block text-xs font-medium text-gray-700">
                最低月給（万円）
              </label>
              <input
                type="number"
                id="salary_min"
                name="salary_min"
                defaultValue={params.salary_min ?? ""}
                placeholder="例: 25"
                min={0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <button
              type="submit"
              className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
            >
              検索
            </button>
          </div>
        </div>
      </form>

      {/* Active Filter Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        {params.prefecture && (
          <FilterBadge label={params.prefecture} paramName="prefecture" params={params} />
        )}
        {params.city && (
          <FilterBadge label={params.city} paramName="city" params={params} />
        )}
        {params.category && (
          <FilterBadge label={getCategoryLabel(params.category)} paramName="category" params={params} />
        )}
        {params.employment_type && (
          <FilterBadge label={employmentTypeLabel(params.employment_type)} paramName="employment_type" params={params} />
        )}
      </div>

      {/* Results Header */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{total.toLocaleString()}</span> 件の求人
        </p>
      </div>

      {/* Job List */}
      <div className="mt-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center">
            <p className="text-gray-500">条件に合う求人が見つかりませんでした。</p>
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <PaginationLink page={page - 1} params={params} label="前へ" />
          )}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            if (p > totalPages) return null
            return (
              <PaginationLink
                key={p}
                page={p}
                params={params}
                label={String(p)}
                active={p === page}
              />
            )
          })}
          {page < totalPages && (
            <PaginationLink page={page + 1} params={params} label="次へ" />
          )}
        </nav>
      )}
    </div>
  )
}

function FilterBadge({
  label,
  paramName,
  params,
}: {
  label: string
  paramName: string
  params: Record<string, string | undefined>
}) {
  const newParams = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (k !== paramName && v) newParams.set(k, v)
  }
  // If removing prefecture, also remove city
  if (paramName === "prefecture") {
    newParams.delete("city")
  }
  return (
    <a
      href={`/jobs?${newParams.toString()}`}
      className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200"
    >
      {label}
      <span className="text-orange-400">&times;</span>
    </a>
  )
}

function PaginationLink({
  page,
  params,
  label,
  active = false,
}: {
  page: number
  params: Record<string, string | undefined>
  label: string
  active?: boolean
}) {
  const newParams = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) newParams.set(k, v)
  }
  newParams.set("page", String(page))
  return (
    <a
      href={`/jobs?${newParams.toString()}`}
      className={`rounded-lg border px-3 py-2 text-sm ${
        active
          ? "border-orange-600 bg-orange-600 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </a>
  )
}

function employmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    full_time: "正社員",
    part_time: "パート",
    contract: "契約社員",
  }
  return labels[type] ?? type
}
