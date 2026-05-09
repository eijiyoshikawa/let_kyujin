import { describe, it, expect } from "vitest"
import { inferCategory } from "@/lib/crawler/import-batch"

describe("inferCategory", () => {
  it("classifies civil engineering keywords", () => {
    expect(inferCategory("土木作業員募集", null)).toBe("civil")
    expect(inferCategory("道路舗装工事スタッフ", null)).toBe("civil")
    expect(inferCategory("橋梁トンネル工事", null)).toBe("civil")
  })

  it("classifies electrical keywords", () => {
    expect(inferCategory("電気工事士", null)).toBe("electrical")
    expect(inferCategory("空調設備工事", null)).toBe("electrical")
    expect(inferCategory("配管工", null)).toBe("electrical")
  })

  it("classifies interior keywords", () => {
    expect(inferCategory("内装仕上げ職人", null)).toBe("interior")
    expect(inferCategory("クロス職人募集", null)).toBe("interior")
    expect(inferCategory("左官工事", null)).toBe("interior")
  })

  it("classifies demolition keywords", () => {
    expect(inferCategory("解体作業員", null)).toBe("demolition")
    expect(inferCategory("アスベスト除去作業", null)).toBe("demolition")
  })

  it("classifies driver/heavy equipment keywords", () => {
    expect(inferCategory("ダンプドライバー", null)).toBe("driver")
    expect(inferCategory("クレーンオペレーター", null)).toBe("driver")
    expect(inferCategory("重機オペレーター", null)).toBe("driver")
  })

  it("classifies management keywords", () => {
    expect(inferCategory("施工管理技士", null)).toBe("management")
    expect(inferCategory("現場監督募集", null)).toBe("management")
    expect(inferCategory("工事主任", null)).toBe("management")
  })

  it("classifies survey/design keywords", () => {
    expect(inferCategory("測量士", null)).toBe("survey")
    expect(inferCategory("建築CAD職員", null)).toBe("survey")
    expect(inferCategory("設計補助", null)).toBe("survey")
    expect(inferCategory("積算スタッフ", null)).toBe("survey")
  })

  it("classifies general construction keywords", () => {
    expect(inferCategory("建築躯体工事", null)).toBe("construction")
    expect(inferCategory("鳶職人募集", null)).toBe("construction")
    expect(inferCategory("鉄筋工", null)).toBe("construction")
    expect(inferCategory("型枠大工", null)).toBe("construction")
  })

  it("returns null for non-construction jobs (manufacturing, office, IT, etc.)", () => {
    expect(inferCategory("一般事務員", null)).toBe(null)
    expect(inferCategory("Web エンジニア募集", null)).toBe(null)
    expect(inferCategory("看護師", null)).toBe(null)
    expect(inferCategory("コンビニ店員", null)).toBe(null)
    expect(inferCategory("プログラマ", "Python での開発")).toBe(null)
  })

  it("uses description text as fallback", () => {
    expect(
      inferCategory("作業員募集", "東京都内の解体現場でのお仕事です")
    ).toBe("demolition")
  })

  it("prioritizes more specific categories before construction", () => {
    // 「建築躯体工事の解体作業」のような複合ケースで先に解体が拾われる
    expect(inferCategory("解体現場の躯体作業", null)).toBe("demolition")
    // 土木 + 建築 → civil が先（より具体的）
    expect(inferCategory("土木建築工事スタッフ", null)).toBe("civil")
  })

  it("handles missing description gracefully", () => {
    expect(inferCategory("土木作業員", null)).toBe("civil")
    expect(inferCategory("土木作業員", undefined)).toBe("civil")
    expect(inferCategory("土木作業員", "")).toBe("civil")
  })
})
