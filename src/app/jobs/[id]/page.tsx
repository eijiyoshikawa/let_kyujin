import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { getOrCreateSessionId } from "@/lib/session-id"
import { recordJobView, extractUtmFromUrl } from "@/lib/tracking"
import {
  MapPin,
  Banknote,
  Building2,
  ArrowLeft,
  ChevronRight,
  Briefcase,
  Globe,
  Users,
  Megaphone,
  Sparkles,
  UserCheck,
  MessageSquareQuote,
  Camera,
  Share2,
} from "lucide-react"
import type { Metadata } from "next"
import {
  generateJobPostingSchema,
  generateBreadcrumbSchema,
} from "@/lib/structured-data"
import { getCategoryLabel } from "@/lib/categories"
import { groupTags } from "@/lib/job-enrichment"
import { JobDescription } from "@/components/jobs/job-description"
import { WorkConditionsBox } from "@/components/jobs/work-conditions-box"
import { TagChip } from "@/components/jobs/tag-chip"
import { SectionHeading } from "@/components/jobs/section-heading"
import { JobInfoTable } from "@/components/jobs/job-info-table"
import { RightTocNav } from "@/components/jobs/right-toc-nav"
import { StickyActionBar } from "@/components/jobs/sticky-action-bar"
import { HeroBanner } from "@/components/jobs/hero-banner"
import { SnsLinks } from "@/components/jobs/sns-links"
import { PhotoGallery } from "@/components/jobs/photo-gallery"
import { MapEmbed } from "@/components/jobs/map-embed"

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

  // 匿名トラッキング: SID 発行 + JobView 記録（fire-and-forget）
  // 失敗してもページ描画は妨げない。
  const sessionId = await getOrCreateSessionId().catch(() => null)
  const headerList = await headers()
  const ua = headerList.get("user-agent") ?? null
  const referer = headerList.get("referer") ?? null
  const fwd = headerList.get("x-forwarded-for")
  const ipAddress = fwd ? fwd.split(",")[0].trim() : null
  // UTM は referer に乗ってこないので、現在の URL を組み立てて取り出す
  const reqHost = headerList.get("host") ?? ""
  const proto = headerList.get("x-forwarded-proto") ?? "https"
  const fullUrl = referer && referer.includes(reqHost) ? referer : `${proto}://${reqHost}/jobs/${id}`
  const utm = extractUtmFromUrl(fullUrl)
  // ベストエフォート（失敗してもページ表示は阻害しない）
  await recordJobView({
    jobId: id,
    sessionId,
    userId: null,
    ipAddress,
    userAgent: ua,
    referer,
    utm,
  }).catch(() => {})

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
          tagline: true,
          pitchHighlights: true,
          idealCandidate: true,
          employeeVoice: true,
          photos: true,
          instagramUrl: true,
          tiktokUrl: true,
          facebookUrl: true,
          xUrl: true,
          youtubeUrl: true,
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

  const tagGroups = groupTags(job.tags)
  // tagline は企業がカスタム設定していればそれを優先、無ければ description から抽出
  const tagline = job.company?.tagline ?? extractTagline(job.description)

  const hasSns = !!(
    job.company?.instagramUrl ||
    job.company?.tiktokUrl ||
    job.company?.facebookUrl ||
    job.company?.xUrl ||
    job.company?.youtubeUrl
  )
  const photos = job.company?.photos ?? []

  const mapAddress = buildMapAddress(job.address, job.prefecture, job.city)

  const tocItems = buildTocItems({
    hasFeatures: job.tags.length > 0 || !!job.employmentType,
    hasDescription: !!job.description,
    hasPitch: !!job.company?.pitchHighlights,
    hasIdealCandidate: !!job.company?.idealCandidate,
    hasEmployeeVoice: !!job.company?.employeeVoice,
    hasPhotos: photos.length > 0,
    hasWorkConditions: !!job.description || !!job.requirements,
    hasMap: !!mapAddress,
    hasCompany: !!job.company,
  })

  const breadcrumb = generateBreadcrumbSchema([
    { name: "トップ", url: "/" },
    { name: "求人検索", url: "/jobs" },
    {
      name: getCategoryLabel(job.category),
      url: `/jobs?category=${job.category}`,
    },
    { name: job.title, url: `/jobs/${job.id}` },
  ])

  return (
    <div className="bg-gray-50 min-h-screen pb-24 sm:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-primary-600 shrink-0">
              トップ
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href="/jobs" className="hover:text-primary-600 shrink-0">
              求人検索
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link
              href={`/jobs?category=${job.category}`}
              className="hover:text-primary-600 shrink-0"
            >
              {getCategoryLabel(job.category)}
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-gray-700 line-clamp-1">{job.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse gap-6 lg:flex-row">
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Hero + title block */}
            <section id="features" className="space-y-4">
              <HeroBanner category={job.category} />

              <div className="space-y-3">
                {/* Category + HW badges */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <TagChip size="sm">{getCategoryLabel(job.category)}</TagChip>
                  {job.source === "hellowork" && (
                    <span className="inline-flex items-center border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      HW 転載
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {job.title}
                </h1>

                {tagline && (
                  <p className="flex items-start gap-1.5 text-sm sm:text-base text-primary-700 font-medium">
                    <Megaphone className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{tagline}</span>
                  </p>
                )}

                {job.company && (
                  <div className="flex items-center gap-3 p-3 border bg-white">
                    <div className="h-10 w-10 flex items-center justify-center bg-primary-50">
                      <Building2 className="h-5 w-5 text-primary-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {job.company.name}
                      </p>
                      {(job.company.prefecture || job.company.city) && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {[
                            job.company.prefecture,
                            job.company.city,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick info row */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 text-primary-500" />
                    <dt className="text-gray-500 mr-1">月給:</dt>
                    <dd className="font-bold text-primary-700">
                      {job.salaryMin
                        ? formatSalary(
                            job.salaryMin,
                            job.salaryMax,
                            job.salaryType
                          )
                        : "応相談"}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <dt className="text-gray-500 mr-1">勤務地:</dt>
                    <dd className="font-medium text-gray-900">
                      {job.prefecture}
                      {job.city ? ` ${job.city}` : ""}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Structured tag table */}
            <JobInfoTable
              employmentType={job.employmentType}
              tagGroups={tagGroups}
            />

            {/* Description */}
            {job.description && (
              <section
                id="description"
                className="border bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <SectionHeading>
                  <Briefcase className="h-4 w-4 text-primary-500" />
                  こんな仕事です
                </SectionHeading>
                <JobDescription text={job.description} />
              </section>
            )}

            {/* こんなトコロがすごい！ */}
            {job.company?.pitchHighlights && (
              <section
                id="pitch"
                className="border bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <SectionHeading>
                  <Sparkles className="h-4 w-4 text-primary-500" />
                  こんなトコロがすごい！
                </SectionHeading>
                <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {job.company.pitchHighlights}
                </p>
              </section>
            )}

            {/* こんな人が向いています！ */}
            {job.company?.idealCandidate && (
              <section
                id="ideal"
                className="border bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <SectionHeading>
                  <UserCheck className="h-4 w-4 text-primary-500" />
                  こんな人が向いています！
                </SectionHeading>
                <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {job.company.idealCandidate}
                </p>
              </section>
            )}

            {/* 働いている社員の声 */}
            {job.company?.employeeVoice && (
              <section
                id="voice"
                className="border bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <SectionHeading>
                  <MessageSquareQuote className="h-4 w-4 text-primary-500" />
                  働いている社員の声
                </SectionHeading>
                <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {job.company.employeeVoice}
                </p>
              </section>
            )}

            {/* 写真ギャラリー */}
            {photos.length > 0 && (
              <section
                id="photos"
                className="border bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <SectionHeading>
                  <Camera className="h-4 w-4 text-primary-500" />
                  写真ギャラリー
                </SectionHeading>
                <PhotoGallery
                  photos={photos}
                  alt={job.company?.name ?? "求人写真"}
                />
              </section>
            )}

            {/* Work conditions */}
            <section id="conditions">
              <WorkConditionsBox
                description={job.description}
                requirements={job.requirements}
              />
            </section>

            {/* 勤務地の地図 */}
            {mapAddress && (
              <section
                id="map"
                className="border bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <SectionHeading>
                  <MapPin className="h-4 w-4 text-primary-500" />
                  勤務地の地図
                </SectionHeading>
                <MapEmbed address={mapAddress} />
              </section>
            )}

            {/* Company info */}
            {job.company && (
              <section
                id="company"
                className="border bg-white p-5 sm:p-6 shadow-sm space-y-4"
              >
                <SectionHeading>
                  <Building2 className="h-4 w-4 text-primary-500" />
                  企業情報
                </SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DlItem label="企業名" value={job.company.name} />
                  {job.company.industry && (
                    <DlItem label="業種" value={job.company.industry} />
                  )}
                  {job.company.employeeCount && (
                    <DlItem
                      label="従業員数"
                      value={`${job.company.employeeCount}名`}
                      icon={<Users className="h-3.5 w-3.5 text-gray-400" />}
                    />
                  )}
                  {(job.company.prefecture || job.company.address) && (
                    <DlItem
                      label="所在地"
                      value={[
                        job.company.prefecture,
                        job.company.city,
                        job.company.address,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      icon={<MapPin className="h-3.5 w-3.5 text-gray-400" />}
                    />
                  )}
                  {job.company.websiteUrl && (
                    <DlItem
                      label="Web サイト"
                      value={job.company.websiteUrl}
                      icon={<Globe className="h-3.5 w-3.5 text-gray-400" />}
                      isLink
                    />
                  )}
                </div>
                {job.company.description && (
                  <p className="text-sm text-gray-600 leading-relaxed border-t pt-4">
                    {job.company.description}
                  </p>
                )}

                {/* 公式 HP リンクボタン（CTAとして目立たせる） */}
                {job.company.websiteUrl && (
                  <a
                    href={job.company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-primary-500 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 transition"
                  >
                    <Globe className="h-4 w-4" />
                    {job.company.name} 公式 HP を見る
                  </a>
                )}

                {hasSns && (
                  <div className="border-t pt-4">
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                      <Share2 className="h-3.5 w-3.5" />
                      公式 SNS
                    </p>
                    <SnsLinks
                      sns={{
                        instagramUrl: job.company.instagramUrl,
                        tiktokUrl: job.company.tiktokUrl,
                        facebookUrl: job.company.facebookUrl,
                        xUrl: job.company.xUrl,
                        youtubeUrl: job.company.youtubeUrl,
                      }}
                    />
                  </div>
                )}
              </section>
            )}

            {/* HW notice */}
            {job.source === "hellowork" && (
              <p className="text-xs text-gray-400 leading-relaxed">
                この求人はハローワークインターネットサービスより転載しています。最新の情報はハローワークでご確認ください。
              </p>
            )}

            {/* Back link */}
            <div>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600"
              >
                <ArrowLeft className="h-4 w-4" />
                求人一覧に戻る
              </Link>
            </div>
          </div>

          {/* Right TOC */}
          <RightTocNav items={tocItems} />
        </div>
      </div>

      {/* Bottom sticky action bar */}
      <StickyActionBar
        jobId={job.id}
        title={job.title}
        companyName={job.company?.name ?? null}
      />
    </div>
  )
}

function DlItem({
  label,
  value,
  icon,
  isLink,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  isLink?: boolean
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-gray-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-gray-900">
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function formatSalary(
  min: number | null,
  max: number | null,
  type: string | null
): string {
  const unit =
    type === "hourly" ? "時給" : type === "annual" ? "年収" : "月給"
  const fmt = (n: number) =>
    n >= 10000 ? `${(n / 10000).toFixed(0)}万` : `${n.toLocaleString()}`
  if (min && max) return `${unit} ${fmt(min)}〜${fmt(max)}円`
  if (min) return `${unit} ${fmt(min)}円〜`
  return ""
}

/**
 * description の冒頭 1〜2 文をハイライトに使う。
 * 「【】」「■」「◆」セクション見出しが直後に来る場合はそこまで、
 * なければ最初の句点 / 改行までを返す。
 */
function extractTagline(description: string | null): string | null {
  if (!description) return null
  const trimmed = description.trim()
  if (!trimmed) return null

  // 見出し系で始まる場合（【仕事内容】... のような）はその直後の本文から
  const afterHead = trimmed.match(
    /^(?:【[^】]{1,30}】|■\s*[^\n]{1,30}|◆\s*[^\n]{1,30})\s*([\s\S]+)$/
  )
  const body = afterHead ? afterHead[1] : trimmed

  // 最初の句点 or 改行で切る
  const m = body.match(/^([^。\n]{8,80})[。\n]/)
  if (m) return m[1].trim() + "。"

  // 短いテキストの場合はそのまま（最大 80 字）
  return body.slice(0, 80)
}

function buildTocItems(flags: {
  hasFeatures: boolean
  hasDescription: boolean
  hasPitch: boolean
  hasIdealCandidate: boolean
  hasEmployeeVoice: boolean
  hasPhotos: boolean
  hasWorkConditions: boolean
  hasMap: boolean
  hasCompany: boolean
}) {
  const items: Array<{ id: string; label: string }> = []
  if (flags.hasFeatures) items.push({ id: "features", label: "求人の特徴" })
  if (flags.hasDescription)
    items.push({ id: "description", label: "こんな仕事です" })
  if (flags.hasPitch)
    items.push({ id: "pitch", label: "こんなトコロがすごい" })
  if (flags.hasIdealCandidate)
    items.push({ id: "ideal", label: "こんな人が向いています" })
  if (flags.hasEmployeeVoice)
    items.push({ id: "voice", label: "働いている社員の声" })
  if (flags.hasPhotos) items.push({ id: "photos", label: "写真ギャラリー" })
  if (flags.hasWorkConditions)
    items.push({ id: "conditions", label: "勤務条件" })
  if (flags.hasMap) items.push({ id: "map", label: "勤務地の地図" })
  if (flags.hasCompany) items.push({ id: "company", label: "企業情報" })
  return items
}

/**
 * MapEmbed に渡す住所文字列を組み立てる。
 * address が入っていればそれを優先、無ければ prefecture + city。
 * Google Maps の検索クエリとして使えるよう正規化。
 */
function buildMapAddress(
  address: string | null,
  prefecture: string,
  city: string | null
): string | null {
  if (address && address.trim().length > 0) return address.trim()
  const parts = [prefecture, city].filter((s) => s && s.trim().length > 0)
  if (parts.length === 0) return null
  // 「不明」など意味のない値は除外
  if (parts.every((p) => p === "不明")) return null
  return parts.join(" ")
}
