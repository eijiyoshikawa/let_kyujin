import { describe, it, expect } from "vitest"
import { generateJobPostingSchema } from "@/lib/structured-data"

describe("generateJobPostingSchema", () => {
  it("generates valid JSON-LD schema", () => {
    const schema = generateJobPostingSchema({
      id: "test-id",
      title: "施工管理",
      description: "建設現場の施工管理業務",
      category: "management",
      employmentType: "full_time",
      salaryMin: 300000,
      salaryMax: 500000,
      salaryType: "monthly",
      prefecture: "東京都",
      city: "渋谷区",
      address: "渋谷1-1-1",
      publishedAt: new Date("2026-01-01"),
      createdAt: new Date("2026-01-01"),
      company: {
        name: "テスト建設株式会社",
        logoUrl: null,
        websiteUrl: "https://example.com",
      },
    })

    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("JobPosting")
    expect(schema.title).toBe("施工管理")
    expect(schema.description).toBe("建設現場の施工管理業務")
    const hiringOrg = schema.hiringOrganization as { name: string }
    expect(hiringOrg.name).toBe("テスト建設株式会社")
  })

  it("handles null company", () => {
    const schema = generateJobPostingSchema({
      id: "test-id",
      title: "求人タイトル",
      description: null,
      category: "construction",
      employmentType: null,
      salaryMin: null,
      salaryMax: null,
      salaryType: null,
      prefecture: "大阪府",
      city: null,
      address: null,
      publishedAt: null,
      createdAt: new Date("2026-01-01"),
      company: null,
    })

    expect(schema.title).toBe("求人タイトル")
    const jobLocation = schema.jobLocation as {
      address: { addressRegion: string }
    }
    expect(jobLocation.address.addressRegion).toBe("大阪府")
  })
})
