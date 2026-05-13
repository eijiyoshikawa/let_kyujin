import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("Hero と検索フォームが表示される", async ({ page }) => {
    await page.goto("/")

    // ブランド名
    await expect(page).toHaveTitle(/ゲンバキャリア/)

    // Hero 見出し
    const h1 = page.getByRole("heading", { level: 1 })
    await expect(h1).toContainText("建設業の求人を")

    // 検索インプット
    const searchInput = page.getByPlaceholder(/職種・キーワード/)
    await expect(searchInput).toBeVisible()

    // 検索ボタン
    const searchButton = page.getByRole("button", { name: /求人を探す/ })
    await expect(searchButton).toBeVisible()
  })

  test("クイックチップから検索画面に遷移できる", async ({ page }) => {
    await page.goto("/")
    const chip = page.getByRole("link", { name: /未経験OK/ })
    await chip.click()
    await expect(page).toHaveURL(/\/jobs\?q=/)
  })

  test("ヘッダーから求人ページに遷移できる", async ({ page }) => {
    await page.goto("/")
    // デスクトップサイズなら直リンク、モバイルサイズならメニュー経由
    const viewport = page.viewportSize()
    if (viewport && viewport.width >= 768) {
      await page.getByRole("link", { name: /求人を探す/ }).first().click()
    } else {
      await page.getByRole("button", { name: /メニューを開く/ }).click()
      await page.getByRole("link", { name: /求人を探す/ }).click()
    }
    await expect(page).toHaveURL(/\/jobs/)
  })
})
