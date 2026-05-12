const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"

/** サイト全体の Organization 構造化データ。root layout で 1 回だけ埋め込む。 */
export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "ゲンバキャリア",
    alternateName: "Genba Career",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    sameAs: [
      "https://youtube.com/@let-kensetsu",
      "https://instagram.com/let_kensetsu",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "info@let-inc.net",
      areaServed: "JP",
      availableLanguage: ["Japanese"],
    },
    parentOrganization: {
      "@type": "Organization",
      name: "株式会社LET",
    },
  }
}

/** サイトの WebSite 構造化データ。検索ボックスを Google 検索結果に表示するため SearchAction 付き。 */
export function generateWebSiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "ゲンバキャリア",
    description:
      "建築・土木・電気・内装・解体・ドライバー・施工管理・測量の求人を掲載する建設業特化型求人サイト。",
    publisher: { "@id": `${BASE_URL}/#organization` },
    inLanguage: "ja",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/jobs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/** パンくずリストの構造化データを生成する。 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  }
}

type JobInput = {
  id: string
  title: string
  description: string | null
  category: string
  employmentType: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string | null
  prefecture: string
  city: string | null
  address: string | null
  publishedAt: Date | null
  createdAt: Date
  company: {
    name: string
    logoUrl: string | null
    websiteUrl: string | null
  } | null
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
}

const SALARY_UNIT_MAP: Record<string, string> = {
  hourly: "HOUR",
  monthly: "MONTH",
  annual: "YEAR",
}

/** 求人の有効期限を datePosted から 90 日後とする（Google 推奨）。 */
function computeValidThrough(posted: Date): string {
  const validThrough = new Date(posted.getTime() + 90 * 24 * 60 * 60 * 1000)
  return validThrough.toISOString()
}

const CATEGORY_TO_INDUSTRY: Record<string, string> = {
  construction: "建築工事業",
  civil: "土木工事業",
  electrical: "電気・設備工事業",
  interior: "内装仕上工事業",
  demolition: "解体工事業",
  driver: "運送・物流",
  management: "施工管理・建設マネジメント",
  survey: "測量・建築設計",
}

export function generateJobPostingSchema(job: JobInput): Record<string, unknown> {
  const datePosted = job.publishedAt ?? job.createdAt
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? job.title,
    datePosted: datePosted.toISOString(),
    // Google Search Console / Rich Result が強く推奨する有効期限
    validThrough: computeValidThrough(datePosted),
    url: `${BASE_URL}/jobs/${job.id}`,
    // 候補者が当サイト経由で直接応募できる
    directApply: true,
    // 求人形態
    industry: CATEGORY_TO_INDUSTRY[job.category] ?? "建設業",
  }

  if (job.employmentType && EMPLOYMENT_TYPE_MAP[job.employmentType]) {
    schema.employmentType = EMPLOYMENT_TYPE_MAP[job.employmentType]
  }

  // Hiring organization
  if (job.company) {
    schema.hiringOrganization = {
      "@type": "Organization",
      name: job.company.name,
      ...(job.company.logoUrl && { logo: job.company.logoUrl }),
      ...(job.company.websiteUrl && { sameAs: job.company.websiteUrl }),
    }
  } else {
    schema.hiringOrganization = {
      "@type": "Organization",
      name: "非公開",
    }
  }

  // Job location
  schema.jobLocation = {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressRegion: job.prefecture,
      addressCountry: "JP",
      ...(job.city && { addressLocality: job.city }),
      ...(job.address && { streetAddress: job.address }),
    },
  }

  // Base salary
  if (job.salaryMin != null) {
    const unitText = SALARY_UNIT_MAP[job.salaryType ?? "monthly"] ?? "MONTH"
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "JPY",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        ...(job.salaryMax != null && { maxValue: job.salaryMax }),
        unitText,
      },
    }
  }

  return schema
}
