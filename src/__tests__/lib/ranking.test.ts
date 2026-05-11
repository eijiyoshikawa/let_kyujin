import { describe, it, expect } from "vitest"
import {
  computeRankScore,
  type CompanyForRank,
  type JobForRank,
} from "@/lib/ranking"

const emptyCompany: CompanyForRank = {
  tagline: null,
  pitchHighlights: null,
  idealCandidate: null,
  employeeVoice: null,
  photos: [],
  instagramUrl: null,
  tiktokUrl: null,
  facebookUrl: null,
  xUrl: null,
  youtubeUrl: null,
  lastContentUpdatedAt: null,
}

const emptyJob: JobForRank = { description: null, requirements: null }

describe("computeRankScore", () => {
  it("returns 0 when company and job have no data", () => {
    expect(computeRankScore(emptyJob, emptyCompany)).toBe(0)
  })

  it("returns 0 when company is null and job is empty", () => {
    expect(computeRankScore(emptyJob, null)).toBe(0)
  })

  it("adds 5 points per SNS link (max 25)", () => {
    const s1 = computeRankScore(emptyJob, {
      ...emptyCompany,
      instagramUrl: "https://example.com",
    })
    expect(s1).toBe(5)

    const s5 = computeRankScore(emptyJob, {
      ...emptyCompany,
      instagramUrl: "https://x",
      tiktokUrl: "https://x",
      facebookUrl: "https://x",
      xUrl: "https://x",
      youtubeUrl: "https://x",
    })
    expect(s5).toBe(25)
  })

  it("adds 2 points per photo, capped at 12 photos", () => {
    expect(
      computeRankScore(emptyJob, {
        ...emptyCompany,
        photos: Array.from({ length: 5 }, (_, i) => `url-${i}`),
      })
    ).toBe(10)

    expect(
      computeRankScore(emptyJob, {
        ...emptyCompany,
        photos: Array.from({ length: 50 }, (_, i) => `url-${i}`),
      })
    ).toBe(24) // 12 * 2 = 24 (cap)
  })

  it("adds points for text length (capped at 60)", () => {
    expect(
      computeRankScore(emptyJob, {
        ...emptyCompany,
        tagline: "x".repeat(50),
      })
    ).toBe(1) // 50/50 = 1

    expect(
      computeRankScore(emptyJob, {
        ...emptyCompany,
        tagline: "x".repeat(100),
        pitchHighlights: "y".repeat(200),
      })
    ).toBe(6) // 300/50 = 6
  })

  it("adds 20 points for content updated within 90 days", () => {
    const now = new Date("2026-05-11")
    const recent = new Date("2026-04-11") // 30 days ago
    expect(
      computeRankScore(
        emptyJob,
        { ...emptyCompany, lastContentUpdatedAt: recent },
        now
      )
    ).toBe(20)
  })

  it("adds 10 points for content updated 90-180 days ago", () => {
    const now = new Date("2026-05-11")
    const older = new Date("2026-01-11") // ~120 days ago
    expect(
      computeRankScore(
        emptyJob,
        { ...emptyCompany, lastContentUpdatedAt: older },
        now
      )
    ).toBe(10)
  })

  it("adds 0 points for content updated 180+ days ago", () => {
    const now = new Date("2026-05-11")
    const veryOld = new Date("2025-05-11") // 365 days ago
    expect(
      computeRankScore(
        emptyJob,
        { ...emptyCompany, lastContentUpdatedAt: veryOld },
        now
      )
    ).toBe(0)
  })

  it("adds job description text points (capped at 15)", () => {
    expect(computeRankScore({ description: "x".repeat(100), requirements: null }, null)).toBe(1)
    expect(computeRankScore({ description: "x".repeat(2000), requirements: null }, null)).toBe(15)
  })

  it("computes composite score from all factors", () => {
    const now = new Date("2026-05-11")
    const recent = new Date("2026-04-11")
    const score = computeRankScore(
      { description: "x".repeat(500), requirements: null },
      {
        ...emptyCompany,
        instagramUrl: "https://x",
        tiktokUrl: "https://x",
        photos: ["a", "b", "c"],
        tagline: "y".repeat(100),
        lastContentUpdatedAt: recent,
      },
      now
    )
    // SNS: 2 * 5 = 10
    // Photos: 3 * 2 = 6
    // Text: 100 / 50 = 2
    // Fresh: 20
    // Description: 500 / 100 = 5
    expect(score).toBe(43)
  })

  it("ignores whitespace-only SNS URLs", () => {
    expect(
      computeRankScore(emptyJob, {
        ...emptyCompany,
        instagramUrl: "   ",
        tiktokUrl: "",
      })
    ).toBe(0)
  })
})
