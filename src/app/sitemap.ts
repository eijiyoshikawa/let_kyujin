import type { MetadataRoute } from "next"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://let-kyujin.vercel.app"

const journalSlugs = [
  "construction-career-guide",
  "tobi-salary",
  "electrician-license",
  "construction-manager-role",
  "civil-engineering-career",
  "construction-safety",
  "interior-finishing-guide",
  "demolition-work",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/hw-jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/for-employers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Journal articles
  const journalPages: MetadataRoute.Sitemap = journalSlugs.map((slug) => ({
    url: `${BASE_URL}/journal/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  // Active job detail pages
  const jobs = await prisma.job.findMany({
    where: { status: "active" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Prefecture x category SEO landing pages
  const seoPages = await prisma.seoPage.findMany({
    select: { prefecture: true, category: true, updatedAt: true },
  })

  const seoCombos: MetadataRoute.Sitemap = seoPages.map((page) => ({
    url: `${BASE_URL}/${page.prefecture}/${page.category}`,
    lastModified: page.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...journalPages, ...jobPages, ...seoCombos]
}
