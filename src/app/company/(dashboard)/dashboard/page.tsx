import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Briefcase, Users, Eye, Plus, TrendingUp, Target } from "lucide-react"
import type { Metadata } from "next"
import {
  computeCompanyFunnel,
  isRangeKey,
  type RangeKey,
} from "@/lib/company-funnel"
import { FunnelChart } from "@/components/company/funnel-chart"

export const metadata: Metadata = {
  title: "企業ダッシュボード",
}

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "30d", label: "30 日" },
  { value: "90d", label: "90 日" },
  { value: "all", label: "全期間" },
]

export default async function CompanyDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const companyId = (session.user as { companyId?: string }).companyId
  if (!companyId) redirect("/login")

  const params = await searchParams
  const range: RangeKey = isRangeKey(params.range) ? params.range : "30d"

  const [company, jobStats, recentApplications, totalApplications, totalViews, funnel] =
    await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true },
      }),
      prisma.job.groupBy({
        by: ["status"],
        where: { companyId },
        _count: true,
      }),
      prisma.application.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          job: { select: { title: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.application.count({ where: { companyId } }),
      prisma.job.aggregate({
        where: { companyId },
        _sum: { viewCount: true },
      }),
      computeCompanyFunnel(companyId, range),
    ])

  const activeJobs = jobStats.find((s) => s.status === "active")?._count ?? 0
  const totalJobs = jobStats.reduce((sum, s) => sum + s._count, 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {company?.name ?? "企業"} ダッシュボード
        </h1>
        <Link
          href="/company/jobs/new"
          className="inline-flex items-center gap-2 bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          新規求人作成
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-primary-100">
              <Briefcase className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">掲載中の求人</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeJobs}
                <span className="ml-1 text-sm font-normal text-gray-400">
                  / {totalJobs} 件
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">応募者数（累計）</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalApplications} 件
              </p>
            </div>
          </div>
        </div>

        <div className="border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-purple-100">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">合計閲覧数</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalViews._sum.viewCount ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <section className="mt-8 border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              選考ファネル
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {funnel.range.label} ・ 求人閲覧から採用までの各ステージ件数と前段比
            </p>
          </div>
          <div className="flex items-center gap-1 border bg-warm-50 p-1">
            {RANGE_OPTIONS.map((r) => (
              <Link
                key={r.value}
                href={`/company/dashboard?range=${r.value}`}
                className={`px-3 py-1 text-xs font-bold ${
                  range === r.value
                    ? "bg-primary-600 text-white"
                    : "text-gray-700 hover:bg-white"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <FunnelChart stages={funnel.stages} />
        </div>

        {/* Overall conversion */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 p-4">
            <Target className="h-5 w-5 text-emerald-700" />
            <div>
              <p className="text-xs text-emerald-700 font-bold">
                総合コンバージョン
              </p>
              <p className="mt-0.5 text-xl font-bold text-emerald-900 tabular-nums">
                {funnel.overallConversion === null
                  ? "—"
                  : `${(funnel.overallConversion * 100).toFixed(2)}%`}
                <span className="ml-2 text-xs font-normal text-emerald-700">
                  閲覧 → 採用
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-primary-200 bg-primary-50 p-4">
            <Users className="h-5 w-5 text-primary-700" />
            <div>
              <p className="text-xs text-primary-700 font-bold">採用件数</p>
              <p className="mt-0.5 text-xl font-bold text-primary-900 tabular-nums">
                {funnel.hiredCount.toLocaleString()} 名
                <span className="ml-2 text-xs font-normal text-primary-700">
                  {funnel.range.label}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent applications */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近の応募</h2>
          <Link
            href="/company/applications"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            すべて見る →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">まだ応募はありません。</p>
        ) : (
          <div className="mt-4 overflow-hidden border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    応募者
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    求人
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    応募日
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {app.user.name ?? app.user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {app.job.title}
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {app.createdAt.toLocaleDateString("ja-JP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    applied: { label: "応募済み", className: "bg-primary-100 text-primary-700" },
    reviewing: { label: "選考中", className: "bg-yellow-100 text-yellow-700" },
    interview: { label: "面接", className: "bg-purple-100 text-purple-700" },
    offered: { label: "内定", className: "bg-green-100 text-green-700" },
    hired: { label: "採用", className: "bg-green-200 text-green-800" },
    rejected: { label: "不採用", className: "bg-gray-100 text-gray-600" },
  }

  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  }

  return (
    <span
      className={`inline-flex px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
