import { describe, it, expect } from "vitest"
import {
  parseSalary,
  normalizePrefecture,
  categoryToHelloworkCode,
} from "@/lib/crawler/hellowork"

describe("parseSalary", () => {
  it("parses monthly salary range", () => {
    const result = parseSalary("月額 200,000円 〜 300,000円")
    expect(result.min).toBe(200000)
    expect(result.max).toBe(300000)
    expect(result.type).toBe("monthly")
  })

  it("parses hourly salary", () => {
    const result = parseSalary("時給 1,200円 〜 1,500円")
    expect(result.min).toBe(1200)
    expect(result.max).toBe(1500)
    expect(result.type).toBe("hourly")
  })

  it("parses annual salary", () => {
    const result = parseSalary("年俸 4,000,000円")
    expect(result.min).toBe(4000000)
    expect(result.max).toBeNull()
    expect(result.type).toBe("annual")
  })

  it("parses daily salary and converts to monthly", () => {
    const result = parseSalary("日給 10,000円 〜 12,000円")
    expect(result.min).toBe(220000) // 10000 * 22
    expect(result.max).toBe(264000) // 12000 * 22
    expect(result.type).toBe("monthly")
  })

  it("returns null for empty string", () => {
    const result = parseSalary("")
    expect(result.min).toBeNull()
    expect(result.max).toBeNull()
    expect(result.type).toBeNull()
  })
})

describe("normalizePrefecture", () => {
  it("converts code to prefecture name", () => {
    expect(normalizePrefecture("13")).toBe("東京都")
    expect(normalizePrefecture("27")).toBe("大阪府")
    expect(normalizePrefecture("01")).toBe("北海道")
  })

  it("returns code as-is for unknown codes", () => {
    expect(normalizePrefecture("99")).toBe("99")
  })
})

describe("categoryToHelloworkCode", () => {
  it("maps known categories", () => {
    expect(categoryToHelloworkCode("driver")).toBe("65")
    expect(categoryToHelloworkCode("construction")).toBe("D")
    expect(categoryToHelloworkCode("it")).toBe("B2")
  })

  it("returns empty string for unknown categories", () => {
    expect(categoryToHelloworkCode("unknown")).toBe("")
  })
})
