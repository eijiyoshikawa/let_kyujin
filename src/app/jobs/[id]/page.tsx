import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Banknote,
  Building2,
  Clock,
  CheckCircle,
  ArrowLeft,
  HardHat,
  Share2,
  ChevronRight,
  Briefcase,
  Globe,
  Users,
} from "lucide-react"
import type { Metadata } from "next"
import { generateJobPostingSchema } from "@/lib/structured-data"
import { getCategoryLabel } from "@/lib/categories"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
    select: { title: true, prefecture: true, category: true },
  })
  if (!job) return { title: "求人が見つかりません" }
  return {
    title: job.title,
    description: `${job.prefecture}の${job.title}の求人詳細。建設業界特化の求人ポータル。`,
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
          prefecture: true,
          city: true,
          address: true,
          employeeCount: true,
          description: true,
          logoUrl: true,
          websiteUrl: true,
        },
      },
    },
  })

  if (!job) notFound()

  prisma.job
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {})

  const jsonLd = generateJobPostingSchema({
    id: job.id,
    title: job.title,
    description: job.description,
    category: job.category,
    employmentType: job.employmentType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryType: job.salaryType,
    prefecture: job.prefecture,
    city: job.city,
    address: job.address,
    publishedAt: job.publishedAt,
    createdAt: job.createdAt,
    company: job.company
      ? {
          name: job.company.name,
          logoUrl: job.company.logoUrl,
          websiteUrl: job.company.websiteUrl,
        }
      : null,
  })

  return (
    <div className="bg-warm-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1 text-xs text-gray-500">
            <Link href="/" className="hover:text-primary-600">トップ</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/jobs" className="hover:text-primary-600">求人検索</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/jobs?category=${job.category}`} className="hover:text-primary-600">
              {getCategoryLabel(job.category)}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 line-clamp-1">{job.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header card */}
            <div className=" border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1  bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-700">
                  <HardHat className="h-3 w-3" />
                  {getCategoryLabel(job.category)}
                </span>
                {job.employmentType && (
                  <span className=" bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {employmentTypeLabel(job.employmentType)}
                  </span>
                )}
                {job.source === "hellowork" && (
                  <span className=" bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                    ハローワーク転載
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {job.title}
              </h1>

              {job.company && (
                <p className="mt-2 flex items-center gap-1.5 text-gray-600">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {job.company.name}
                </p>
              )}

              {/* Key info grid */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3  bg-gray-50 p-3">
                  <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium text-gray-400 uppercase">勤務地</p>
                    <p className="text-sm font-medium text-gray-900">
                      {job.prefecture}{job.city ? ` ${job.city}` : ""}
                    </p>
                  </div>
                </div>
                {job.salaryMin && (
                  <div className="flex items-center gap-3  bg-primary-50 p-3">
                    <Banknote className="h-5 w-5 text-primary-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 uppercase">給与</p>
                      <p className="text-sm font-bold text-primary-700">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                      </p>
                    </div>
                  </div>
                )}
                {job.employmentType && (
                  <div className="flex items-center gap-3  bg-gray-50 p-3">
                    <Clock className="h-5 w-5 text-primary-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 uppercase">雇用形態</p>
                      <p className="text-sm font-medium text-gray-900">
                        {employmentTypeLabel(job.employmentType)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className=" border bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3">
                  <Briefcase className="h-5 w-5 text-primary-500" />
                  仕事内容
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {job.description}
                </p>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className=" border bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3">
                  <CheckCircle className="h-5 w-5 text-primary-500" />
                  応募条件
                </h2>
                <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <div className=" border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-3">
                  福利厚生
                </h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {job.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Company Info */}
            {job.company && (
              <div className=" border bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3">
                  <Building2 className="h-5 w-5 text-primary-500" />
                  企業情報
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DlItem label="企業名" value={job.company.name} />
                  {job.company.industry && (
                    <DlItem label="業種" value={job.company.industry} />
                  )}
                  {job.company.employeeCount && (
                    <DlItem label="従業員数" value={`${job.company.employeeCount}名`} icon={<Users className="h-3.5 w-3.5 text-gray-400" />} />
                  )}
                  {(job.company.prefecture || job.company.address) && (
                    <DlItem label="所在地" value={[job.company.prefecture, job.company.city, job.company.address].filter(Boolean).join(" ")} icon={<MapPin className="h-3.5 w-3.5 text-gray-400" />} />
                  )}
                  {job.company.websiteUrl && (
                    <DlItem label="Webサイト" value={job.company.websiteUrl} icon={<Globe className="h-3.5 w-3.5 text-gray-400" />} isLink />
                  )}
                </div>
                {job.company.description && (
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed border-t pt-4">
                    {job.company.description}
                  </p>
                )}
              </div>
            )}

            {/* HW notice */}
            {job.source === "hellowork" && (
              <p className="text-xs text-gray-400 leading-relaxed">
                この求人はハローワークインターネットサービスより転載しています。最新の情報はハローワークでご確認ください。
              </p>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-20 space-y-4">
              {/* Apply CTA card */}
              <div className=" border bg-white p-5 shadow-sm">
                <p className="text-center text-sm font-medium text-gray-600">
                  この求人に興味がありますか？
                </p>
                <Link
                  href={`/jobs/${job.id}/apply`}
                  className="mt-3 flex w-full items-center justify-center gap-2  bg-green-500 py-3 text-base font-bold text-white hover:bg-green-600 transition shadow-sm"
                >
                  応募する
                </Link>
                <p className="mt-2 text-center text-[10px] text-gray-400">
                  会員登録（無料）が必要です
                </p>
              </div>

              {/* Quick info */}
              <div className=" border bg-white p-4 shadow-sm text-sm">
                <h3 className="font-bold text-gray-900 border-b pb-2 mb-3">求人概要</h3>
                <dl className="space-y-2.5">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">カテゴリ</dt>
                    <dd className="font-medium text-gray-900">{getCategoryLabel(job.category)}</dd>
                  </div>
                  {job.employmentType && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">雇用形態</dt>
                      <dd className="font-medium text-gray-900">{employmentTypeLabel(job.employmentType)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">勤務地</dt>
                    <dd className="font-medium text-gray-900">{job.prefecture}</dd>
                  </div>
                  {job.salaryMin && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">給与</dt>
                      <dd className="font-medium text-primary-600">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</dd>
                    </div>
                  )}
                  {job.publishedAt && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">掲載日</dt>
                      <dd className="text-gray-900">{job.publishedAt.toLocaleDateString("ja-JP")}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Back to search */}
              <Link
                href="/jobs"
                className="flex items-center justify-center gap-1.5  border bg-white py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                求人一覧に戻る
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function DlItem({ label, value, icon, isLink }: { label: string; value: string; icon?: React.ReactNode; isLink?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-gray-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-gray-900">
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate block">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function formatSalary(min: number | null, max: number | null, type: string | null): string {
  const unit = type === "hourly" ? "時給" : type === "annual" ? "年収" : "月給"
  const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(0)}万` : `${n.toLocaleString()}`
  if (min && max) return `${unit} ${fmt(min)}〜${fmt(max)}円`
  if (min) return `${unit} ${fmt(min)}円〜`
  return ""
}

function employmentTypeLabel(type: string): string {
  const labels: Record<string, string> = { full_time: "正社員", part_time: "パート", contract: "契約社員" }
  return labels[type] ?? type
}
