import { test, expect } from "@playwright/test"

test.describe("Error pages", () => {
  test("存在しない URL で 404 ページが表示される", async ({ page }) => {
    const res = await page.goto("/this-route-definitely-does-not-exist-12345")
    expect(res?.status()).toBe(404)

    // 404 表示
    await expect(page.getByText("404 NOT FOUND")).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "ページが見つかりません" })
    ).toBeVisible()

    // 人気カテゴリの導線が出る（建築 / 土木 / ドライバー 等）
    await expect(page.getByRole("link", { name: /建築/ })).toBeVisible()
    await expect(page.getByRole("link", { name: /ドライバー/ })).toBeVisible()
  })

  test("404 ページは noindex で配信される", async ({ page }) => {
    const res = await page.goto("/this-route-also-does-not-exist-99999")
    expect(res?.status()).toBe(404)
    const xRobots = res?.headers()["x-robots-tag"]
    if (xRobots) {
      expect(xRobots).toContain("noindex")
    }
  })
})
