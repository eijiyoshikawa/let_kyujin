import { describe, it, expect } from "vitest"
import { PREFECTURES } from "@/lib/constants"

describe("PREFECTURES", () => {
  it("contains 47 prefectures", () => {
    expect(PREFECTURES).toHaveLength(47)
  })

  it("starts with 北海道", () => {
    expect(PREFECTURES[0]).toBe("北海道")
  })

  it("ends with 沖縄県", () => {
    expect(PREFECTURES[46]).toBe("沖縄県")
  })

  it("includes 東京都", () => {
    expect(PREFECTURES).toContain("東京都")
  })
})
