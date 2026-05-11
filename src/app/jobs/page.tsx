import { prisma } from "@/lib/db"
import { JobCard } from "@/components/jobs/job-card"
import { Briefcase, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { Pagination } from "@/components/pagination"
import { PREFECTURES } from "@/lib/constants"
import { AREAS } from "@/lib/areas"
import {
  CATEGORIES,
  CONSTRUCTION_CATEGORY_VALUES,
  getCategoryLabel,
  isConstructionCategory,
} from "@/lib/categories"
import type { Metadata } from "next"

type Props = {
  searchParams: Promise<Record<string, string | undefined>>
}

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "正社員" },
  { value: "part_time", label: "パート" },
  { value: "contract", label: "契約社員" },
] as const

const SORT_OPTIONS = [
  { value: "recommended", label: "おすすめ順" },
  { value: "newest", label: "新着順" },
  { value: "salary_high", label: "給与が高い順" },
  { value: "salary_low", label: "給与が低い順" },
  { value: "popular", label: "閲覧数が多い順" },
] as const

const DATE_WITHIN_OPTIONS = [
  { value: "3", label: "3日以内" },
  { value: "7", label: "1週間以内" },
  { value: "14", label: "2週間以内" },
  { value: "30", label: "1ヶ月以内" },
] as const

const MAN_YEN = 10_000

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams
  const parts: string[] = []
  if (params.prefecture) parts.push(params.prefecture)
  if (params.city) parts.push(params.city)
  if (params.category) parts.push(getCategoryLabel(params.category))
  const title =
    parts.length > 0
      ? `${parts.join(" ")}の建設業求人 | ゲンバキャリア`
      : "建設業の求人を探す | ゲンバキャリア"
  const description = parts.length
    ? `${parts.join(" ")}で募集中の建設業求人を掲載中。20〜30 代の若手も活躍中、LINE で気軽に応募できます。`
    : "建築・土木・電気・内装の求人を探せる建設業特化型求人サイト。20〜30 代の若手も活躍中、履歴書なし LINE で気軽に応募。"

  // canonical はクエリ無しの /jobs に固定（カテゴリ別ページが個別 URL を持っているため）
  return {
    title,
    description,
    alternates: { canonical: "/jobs" },
    openGraph: { title, description },
  }
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? "1"))
  const limit = 20

  const salaryMinYen = parseManYenToYen(params.salary_min)
  const salaryMaxYen = parseManYenToYen(params.salary_max)
  const dateWithinDays = parseDateWithin(params.date_within)
  const dateWithinThreshold = computeDateWithinThreshold(dateWithinDays)
  const sort =
    (params.sort && SORT_OPTIONS.find((s) => s.value === params.sort)?.value) ??
    "recommended"

  // 建設業特化サイトのため、非建設業カテゴリは常に除外する。
  // ユーザー指定が建設業カテゴリならその値、そうでなければ建設業全体に絞る。
  const categoryFilter =
    params.category && isConstructionCategory(params.category)
      ? { category: params.category }
      : { category: { in: [...CONSTRUCTION_CATEGORY_VALUES] } }

  const where = {
    status: "active" as const,
    ...(params.prefecture && { prefecture: params.prefecture }),
    ...(params.city && { city: params.city }),
    ...categoryFilter,
    ...(params.employment_type && { employmentType: params.employment_type }),
    ...(salaryMinYen !== null && { salaryMin: { gte: salaryMinYen } }),
    ...(salaryMaxYen !== null && { salaryMax: { lte: salaryMaxYen } }),
    ...(dateWithinThreshold && { publishedAt: { gte: dateWithinThreshold } }),
    ...(params.q && {
      OR: [
        { title: { contains: params.q, mode: "insensitive" as const } },
        { description: { contains: params.q, mode: "insensitive" as const } },
      ],
    }),
  }

  const orderBy = buildOrderBy(sort)

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
      },
    }),
    prisma.job.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)
  const cities = params.prefecture ? AREAS[params.prefecture] ?? [] : []
  const hasFilters = !!(
    params.prefecture ||
    params.city ||
    params.category ||
    params.employment_type ||
    params.salary_min ||
    params.salary_max ||
    params.date_within ||
    params.q
  )

  return (
    <div>
      {/* Search header */}
      <div className="relative bg-ink-900">
        <div className="hero-stripe-top" />
        <div className="hero-stripe-bottom" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">求人検索</h1>
            <Link
              href="/hw-jobs"
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90 hover:bg-white/20 transition"
            >
              <Briefcase className="h-3.5 w-3.5" />
              ハローワーク求人を見る
            </Link>
          </div>
          <form action="/jobs" className="mt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="職種・キーワードで検索"
                  className="w-full  border-0 py-2.5 pl-10 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-600 transition"
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
              {params.sort && params.sort !== "newest" && (
                <input type="hidden" name="sort" value={params.sort} />
              )}

              <div className=" border bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b px-4 py-3">
                  <SlidersHorizontal className="h-4 w-4 text-primary-500" />
                  <h2 className="text-sm font-bold text-gray-900">絞り込み</h2>
                </div>

                <div className="divide-y p-4 space-y-0">
                  <FilterSelect
                    id="prefecture"
                    label="都道府県"
                    name="prefecture"
                    defaultValue={params.prefecture ?? ""}
                    options={PREFECTURES.map((p) => ({ value: p, label: p }))}
                  />

                  {params.prefecture && cities.length > 0 && (
                    <FilterSelect
                      id="city"
                      label="市区町村"
                      name="city"
                      defaultValue={params.city ?? ""}
                      options={cities.map((c) => ({ value: c, label: c }))}
                    />
                  )}

                  <FilterSelect
                    id="category"
                    label="職種カテゴリ"
                    name="category"
                    defaultValue={params.category ?? ""}
                    options={CATEGORIES.filter((c) => c.value !== "other").map(
                      (c) => ({ value: c.value, label: c.label })
                    )}
                  />

                  <FilterSelect
                    id="employment_type"
                    label="雇用形態"
                    name="employment_type"
                    defaultValue={params.employment_type ?? ""}
                    options={EMPLOYMENT_TYPES.map((e) => ({ value: e.value, label: e.label }))}
                  />

                  <FilterSelect
                    id="date_within"
                    label="掲載期間"
                    name="date_within"
                    defaultValue={params.date_within ?? ""}
                    options={DATE_WITHIN_OPTIONS as readonly { value: string; label: string }[]}
                  />

                  <div className="pt-3">
                    <span className="block text-xs font-medium text-gray-600">月給（万円）</span>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="number"
                        id="salary_min"
                        name="salary_min"
                        defaultValue={params.salary_min ?? ""}
                        placeholder="下限"
                        min={0}
                        className="w-full  border border-gray-300 px-2.5 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <span className="text-xs text-gray-400">〜</span>
                      <input
                        type="number"
                        id="salary_max"
                        name="salary_max"
                        defaultValue={params.salary_max ?? ""}
                        placeholder="上限"
                        min={0}
                        className="w-full  border border-gray-300 px-2.5 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t p-4">
                  <button
                    type="submit"
                    className="w-full  bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
                  >
                    この条件で検索
                  </button>
                  {hasFilters && (
                    <Link
                      href="/jobs"
                      className="mt-2 block text-center text-xs text-gray-500 hover:text-primary-600"
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
            {/* Active filters + result count + sort */}
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
                <FilterBadge
                  label={employmentTypeLabel(params.employment_type)}
                  paramName="employment_type"
                  params={params}
                />
              )}
              {params.date_within && (
                <FilterBadge
                  label={dateWithinLabel(params.date_within)}
                  paramName="date_within"
                  params={params}
                />
              )}
              {(params.salary_min || params.salary_max) && (
                <FilterBadge
                  label={salaryRangeLabel(params.salary_min, params.salary_max)}
                  paramName="salary_min,salary_max"
                  params={params}
                />
              )}
              <span className="ml-auto text-sm text-gray-500">
                <span className="font-bold text-primary-600">{total.toLocaleString()}</span> 件
              </span>
              <SortLink params={params} sort={sort} />
            </div>

            {/* Job list */}
            <div className="mt-4 space-y-3">
              {jobs.length === 0 ? (
                <div className=" border bg-white p-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-gray-500">条件に合う求人が見つかりませんでした。</p>
                  <Link
                    href="/jobs"
                    className="mt-3 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    条件を変更して再検索 →
                  </Link>
                  <p className="mt-4 text-xs text-gray-400">
                    ハローワーク求人もあわせて{" "}
                    <Link href="/hw-jobs" className="text-primary-600 hover:underline">
                      こちら
                    </Link>{" "}
                    から検索できます。
                  </p>
                </div>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/jobs"
                searchParams={params}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------- helpers ----------------

function buildOrderBy(sort: string) {
  switch (sort) {
    case "salary_high":
      return [{ salaryMin: "desc" as const }, { publishedAt: "desc" as const }]
    case "salary_low":
      return [{ salaryMin: "asc" as const }, { publishedAt: "desc" as const }]
    case "popular":
      return [{ viewCount: "desc" as const }, { publishedAt: "desc" as const }]
    case "newest":
      return { publishedAt: "desc" as const }
    case "recommended":
    default:
      // SNS 登録数 / 文字量 / 写真数 / 3 ヶ月以内更新 を加点した rankScore で並べ替え。
      // 同点の場合は新しい求人を上位に。
      return [
        { rankScore: "desc" as const },
        { publishedAt: "desc" as const },
      ]
  }
}

function parseManYenToYen(raw: string | undefined): number | null {
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.floor(n * MAN_YEN)
}

function computeDateWithinThreshold(days: number | null): Date | null {
  if (days === null) return null
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  return new Date(now - days * 86_400_000)
}

function parseDateWithin(raw: string | undefined): number | null {
  if (!raw) return null
  const allowed: string[] = DATE_WITHIN_OPTIONS.map((o) => o.value)
  if (!allowed.includes(raw)) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

function FilterSelect({
  id, label, name, defaultValue, options,
}: {
  id: string
  label: string
  name: string
  defaultValue: string
  options: readonly { value: string; label: string }[]
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
        className="mt-1 w-full  border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
  label: string
  paramName: string
  params: Record<string, string | undefined>
}) {
  const removeKeys = paramName.split(",")
  const newParams = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (!v) continue
    if (removeKeys.includes(k)) continue
    newParams.set(k, v)
  }
  if (removeKeys.includes("prefecture")) newParams.delete("city")
  newParams.delete("page")
  const href = newParams.toString() ? `/jobs?${newParams.toString()}` : "/jobs"
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-200 transition"
    >
      {label}
      <span className="text-primary-400">&times;</span>
    </a>
  )
}

function SortLink({
  params, sort,
}: {
  params: Record<string, string | undefined>
  sort: string
}) {
  const buildHref = (next: string) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (k === "sort" || k === "page") continue
      if (v) sp.set(k, v)
    }
    if (next !== "newest") sp.set("sort", next)
    return sp.toString() ? `/jobs?${sp.toString()}` : "/jobs"
  }
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-400">並び順:</span>
      {SORT_OPTIONS.map((opt) => (
        <a
          key={opt.value}
          href={buildHref(opt.value)}
          className={` px-2 py-0.5 ${
            opt.value === sort
              ? "bg-primary-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {opt.label}
        </a>
      ))}
    </div>
  )
}

function employmentTypeLabel(type: string): string {
  const labels: Record<string, string> = { full_time: "正社員", part_time: "パート", contract: "契約社員" }
  return labels[type] ?? type
}

function dateWithinLabel(value: string): string {
  return DATE_WITHIN_OPTIONS.find((o) => o.value === value)?.label ?? `${value}日以内`
}

function salaryRangeLabel(min: string | undefined, max: string | undefined): string {
  if (min && max) return `月給 ${min}〜${max}万円`
  if (min) return `月給 ${min}万円〜`
  if (max) return `月給 〜${max}万円`
  return "月給"
}
