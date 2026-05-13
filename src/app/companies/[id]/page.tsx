import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { JobCard } from "@/components/jobs/job-card"
import { CompanyFollowButton } from "@/components/companies/follow-button"
import { isValidUuid } from "@/lib/uuid"
import {
  MapPin,
  Buildings,
  Globe,
  UsersThree,
  Camera as InstagramIcon,
} from "@phosphor-icons/react/dist/ssr"

export const revalidate = 3600 // 1 hour ISR

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  if (!isValidUuid(id)) return { title: "企業が見つかりません" }
  const company = await prisma.company
    .findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        prefecture: true,
        industry: true,
        status: true,
        source: true,
        logoUrl: true,
      },
    })
    .catch(() => null)

  if (!company || company.status !== "approved" || company.source !== "direct") {
    return { title: "企業が見つかりません" }
  }

  const title = `${company.name} の企業情報・求人 | ゲンバキャリア`
  const description =
    company.description?.slice(0, 120) ??
    `${company.prefecture ?? ""}${
      company.industry ? ` / ${company.industry}` : ""
    }の${company.name}が募集中の求人一覧。`

  return {
    title,
    description,
    alternates: { canonical: `/companies/${id}` },
    openGraph: {
      title,
      description,
      images: company.logoUrl ? [{ url: company.logoUrl }] : undefined,
    },
  }
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params
  if (!isValidUuid(id)) notFound()

  const company = await prisma.company
    .findUnique({
      where: { id },
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
        status: true,
        source: true,
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
    })
    .catch(() => null)

  // hellowork 由来の参照企業はリッチコンテンツが無く公開対象外
  if (!company || company.status !== "approved" || company.source !== "direct") {
    notFound()
  }

  // ログイン中のユーザーがこの企業をフォローしているか
  const session = await auth().catch(() => null)
  const loggedIn = !!session?.user?.id
  const isFollowing = loggedIn
    ? !!(await prisma.companyFollow
        .findUnique({
          where: {
            userId_companyId: {
              userId: session!.user!.id!,
              companyId: company.id,
            },
          },
          select: { userId: true },
        })
        .catch(() => null))
    : false

  const jobs = await prisma.job
    .findMany({
      where: { companyId: company.id, status: "active" },
      select: {
        id: true,
        title: true,
        category: true,
        employmentType: true,
        salaryMin: true,
        salaryMax: true,
        salaryType: true,
        prefecture: true,
        city: true,
        source: true,
        tags: true,
        company: { select: { name: true, logoUrl: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 30,
    })
    .catch(() => [])

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "企業一覧",
        item: `${SITE_URL}/jobs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: company.name,
        item: `${SITE_URL}/companies/${company.id}`,
      },
    ],
  }

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    ...(company.description ? { description: company.description } : {}),
    ...(company.logoUrl ? { logo: company.logoUrl } : {}),
    ...(company.websiteUrl ? { url: company.websiteUrl } : {}),
    ...(company.address || company.prefecture
      ? {
          address: {
            "@type": "PostalAddress",
            addressCountry: "JP",
            ...(company.prefecture ? { addressRegion: company.prefecture } : {}),
            ...(company.city ? { addressLocality: company.city } : {}),
            ...(company.address ? { streetAddress: company.address } : {}),
          },
        }
      : {}),
    sameAs: [
      company.websiteUrl,
      company.instagramUrl,
      company.tiktokUrl,
      company.facebookUrl,
      company.xUrl,
      company.youtubeUrl,
    ].filter(Boolean),
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          トップ
        </Link>
        <span className="mx-1">/</span>
        <Link href="/jobs" className="hover:text-gray-700">
          求人一覧
        </Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">{company.name}</span>
      </nav>

      {/* Hero */}
      <section className="border bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {company.logoUrl ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden border bg-white">
              <Image
                src={company.logoUrl}
                alt={`${company.name} のロゴ`}
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center border bg-primary-50">
              <Buildings className="h-10 w-10 text-primary-400" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {company.name}
              </h1>
              <CompanyFollowButton
                companyId={company.id}
                initialFollowing={isFollowing}
                loggedIn={loggedIn}
              />
            </div>
            {company.tagline && (
              <p className="mt-1 text-base font-semibold text-primary-700">
                {company.tagline}
              </p>
            )}
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
              {company.industry && (
                <div className="flex items-center gap-1.5">
                  <Buildings className="h-4 w-4 text-gray-400" />
                  <span>{company.industry}</span>
                </div>
              )}
              {(company.prefecture || company.city) && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {[company.prefecture, company.city]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </div>
              )}
              {company.employeeCount && (
                <div className="flex items-center gap-1.5">
                  <UsersThree className="h-4 w-4 text-gray-400" />
                  <span>従業員数 {company.employeeCount}</span>
                </div>
              )}
              {company.websiteUrl && (
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary-700 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  <span>会社サイト</span>
                </a>
              )}
            </dl>
          </div>
        </div>

        {company.description && (
          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {company.description}
          </p>
        )}
      </section>

      {/* SNS */}
      {(company.instagramUrl ||
        company.tiktokUrl ||
        company.facebookUrl ||
        company.xUrl ||
        company.youtubeUrl) && (
        <section className="mt-6">
          <h2 className="text-sm font-bold text-gray-500">公式 SNS</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {company.instagramUrl && (
              <SnsLink href={company.instagramUrl} label="Instagram" />
            )}
            {company.tiktokUrl && (
              <SnsLink href={company.tiktokUrl} label="TikTok" />
            )}
            {company.facebookUrl && (
              <SnsLink href={company.facebookUrl} label="Facebook" />
            )}
            {company.xUrl && <SnsLink href={company.xUrl} label="X" />}
            {company.youtubeUrl && (
              <SnsLink href={company.youtubeUrl} label="YouTube" />
            )}
          </ul>
        </section>
      )}

      {/* Pitch */}
      {(company.pitchHighlights ||
        company.idealCandidate ||
        company.employeeVoice) && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {company.pitchHighlights && (
            <PitchCard title="こんなトコロがすごい！" body={company.pitchHighlights} />
          )}
          {company.idealCandidate && (
            <PitchCard title="こんな人が向いています！" body={company.idealCandidate} />
          )}
          {company.employeeVoice && (
            <PitchCard title="働いている社員の声" body={company.employeeVoice} />
          )}
        </section>
      )}

      {/* Photos */}
      {company.photos.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-1.5 text-lg font-semibold text-gray-900">
            <InstagramIcon className="h-5 w-5 text-gray-500" />
            職場の様子
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {company.photos.slice(0, 12).map((url, i) => (
              <div key={url + i} className="relative aspect-square overflow-hidden border bg-gray-50">
                <Image
                  src={url}
                  alt={`${company.name} の職場写真 ${i + 1}`}
                  fill
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Open jobs */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">
          {company.name} の募集中求人
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          現在募集中の求人は{" "}
          <span className="font-semibold text-primary-600">{jobs.length}</span>{" "}
          件です。
        </p>
        {jobs.length === 0 ? (
          <div className="mt-6 border bg-warm-50 p-6 text-center text-sm text-gray-600">
            現在、{company.name} の募集中求人はありません。
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function PitchCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="border bg-white p-5">
      <h3 className="text-sm font-bold text-primary-700">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        {body}
      </p>
    </div>
  )
}

function SnsLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        {label}
      </a>
    </li>
  )
}
