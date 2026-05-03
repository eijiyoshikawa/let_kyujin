import type { HwJob } from "@/lib/jobs-api"

/**
 * Google for Jobs 用 JSON-LD（schema.org JobPosting）。
 * 値は connector から取得した原文をそのまま入れる（改変禁止）。
 */
export function HwJobStructuredData({ job }: { job: HwJob }) {
  const baseSalary = buildBaseSalary(job)
  const data = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title ?? job.occupation ?? "求人",
    description: job.description ?? "",
    datePosted: job.dates.receivedAt ?? undefined,
    validThrough: job.dates.applyBy ?? job.dates.validUntil ?? undefined,
    employmentType: job.employmentType ?? job.jobType ?? undefined,
    hiringOrganization: job.company.name
      ? {
          "@type": "Organization",
          name: job.company.name,
          ...(job.company.website ? { sameAs: job.company.website } : {}),
        }
      : undefined,
    jobLocation: buildJobLocation(job),
    ...(baseSalary ? { baseSalary } : {}),
    identifier: {
      "@type": "PropertyValue",
      name: "ハローワーク求人番号",
      value: job.kjno,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

function buildJobLocation(job: HwJob) {
  if (!job.location.prefecture && !job.location.address) return undefined
  return {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressCountry: "JP",
      ...(job.location.prefecture ? { addressRegion: job.location.prefecture } : {}),
      ...(job.location.address ? { streetAddress: job.location.address } : {}),
      ...(job.location.employerPostalCode
        ? { postalCode: job.location.employerPostalCode }
        : {}),
    },
  }
}

function buildBaseSalary(job: HwJob) {
  if (job.salary.min === null && job.salary.max === null) return null
  return {
    "@type": "MonetaryAmount",
    currency: "JPY",
    value: {
      "@type": "QuantitativeValue",
      ...(job.salary.min !== null ? { minValue: job.salary.min } : {}),
      ...(job.salary.max !== null ? { maxValue: job.salary.max } : {}),
      unitText: mapUnit(job.salary.type),
    },
  }
}

function mapUnit(type: string | null): string {
  if (!type) return "MONTH"
  if (type.includes("時給")) return "HOUR"
  if (type.includes("日給")) return "DAY"
  if (type.includes("年俸")) return "YEAR"
  return "MONTH"
}
