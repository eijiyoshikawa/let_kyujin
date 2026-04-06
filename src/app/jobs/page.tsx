import { prisma } from "@/lib/db"
import { JobCard } from "@/components/jobs/job-card"
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react"
import Link from "next/link"
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
  const cities = params.prefecture ? (AREAS[params.prefecture] ?? []) : []
  const hasFilters = !!(params.prefecture || params.city || params.category || params.employment_type || params.salary_min || params.q)

  return (
    <div>
      {/* Blue search header */}
      <div className="bg-blue-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-bold text-white">求人検索</h1>
          <form action="/jobs" className="mt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="職種・キーワードで検索"
                  className="w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition"
              >
                <Search className="h-4 w-4" />
                検索
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar filters */}
          <aside className="w-full shrink-0 lg:w-64">
            <form action="/jobs">
              {/* Preserve keyword if set */}
              {params.q && <input type="hidden" name="q" value={params.q} />}

              <div className="rounded-lg border bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b px-4 py-3">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">絞り込み</h2>
                </div>

                <div className="divide-y p-4 space-y-0">
                  {/* Prefecture */}
                  <FilterSelect
                    id="prefecture"
                    label="都道府県"
                    name="prefecture"
                    defaultValue={params.prefecture ?? ""}
                    options={PREFECTURES.map((p) => ({ value: p, label: p }))}
                  />

                  {/* City */}
                  {params.prefecture && cities.length > 0 && (
                    <FilterSelect
                      id="city"
                      label="市区町村"
                      name="city"
                      defaultValue={params.city ?? ""}
                      options={cities.map((c) => ({ value: c, label: c }))}
                    />
                  )}

                  {/* Category */}
                  <FilterSelect
                    id="category"
                    label="職種カテゴリ"
                    name="category"
                    defaultValue={params.category ?? ""}
                    options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                  />

                  {/* Employment Type */}
                  <FilterSelect
                    id="employment_type"
                    label="雇用形態"
                    name="employment_type"
                    defaultValue={params.employment_type ?? ""}
                    options={EMPLOYMENT_TYPES.map((e) => ({ value: e.value, label: e.label }))}
                  />

                  {/* Salary */}
                  <div className="pt-3">
                    <label htmlFor="salary_min" className="block text-xs font-medium text-gray-600">
                      最低月給（万円）
                    </label>
                    <input
                      type="number"
                      id="salary_min"
                      name="salary_min"
                      defaultValue={params.salary_min ?? ""}
                      placeholder="例: 25"
                      min={0}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t p-4">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    この条件で検索
                  </button>
                  {hasFilters && (
                    <Link
                      href="/jobs"
                      className="mt-2 block text-center text-xs text-gray-500 hover:text-blue-600"
                    >
                      条件をリセット
                    </Link>
                  )}
                </div>
              </div>
            </form>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Active filters + result count */}
            <div className="flex flex-wrap items-center gap-2">
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
              <span className="ml-auto text-sm text-gray-500">
                <span className="font-bold text-blue-600">{total.toLocaleString()}</span> 件
              </span>
            </div>

            {/* Job list */}
            <div className="mt-4 space-y-3">
              {jobs.length === 0 ? (
                <div className="rounded-lg border bg-white p-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-gray-500">条件に合う求人が見つかりませんでした。</p>
                  <Link
                    href="/jobs"
                    className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    条件を変更して再検索 →
                  </Link>
                </div>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-1">
                {page > 1 && (
                  <PaginationLink page={page - 1} params={params} label="前へ" />
                )}
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 3, totalPages - 6)) + i
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
        </div>
      </div>
    </div>
  )
}

function FilterSelect({
  id, label, name, defaultValue, options,
}: {
  id: string; label: string; name: string; defaultValue: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="pt-3 first:pt-0">
      <label htmlFor={id} className="block text-xs font-medium text-gray-600">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">すべて</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function FilterBadge({
  label, paramName, params,
}: {
  label: string; paramName: string; params: Record<string, string | undefined>
}) {
  const newParams = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (k !== paramName && v) newParams.set(k, v)
  }
  if (paramName === "prefecture") newParams.delete("city")
  return (
    <a
      href={`/jobs?${newParams.toString()}`}
      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 transition"
    >
      {label}
      <span className="text-blue-400">&times;</span>
    </a>
  )
}

function PaginationLink({
  page, params, label, active = false,
}: {
  page: number; params: Record<string, string | undefined>; label: string; active?: boolean
}) {
  const newParams = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) newParams.set(k, v)
  }
  newParams.set("page", String(page))
  return (
    <a
      href={`/jobs?${newParams.toString()}`}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </a>
  )
}

function employmentTypeLabel(type: string): string {
  const labels: Record<string, string> = { full_time: "正社員", part_time: "パート", contract: "契約社員" }
  return labels[type] ?? type
}
