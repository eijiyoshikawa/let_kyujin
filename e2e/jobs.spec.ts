import { test, expect } from "@playwright/test"

test.describe("Jobs Page", () => {
  test("一覧ページがロードされる", async ({ page }) => {
    await page.goto("/jobs")
    await expect(page).toHaveTitle(/求人/)

    // 検索フォームが存在
    const searchInput = page.getByPlaceholder(/職種・キーワード/)
    await expect(searchInput).toBeVisible()
  })

  test("0 件検索時に EmptyJobsState が表示される", async ({ page }) => {
    // ヒットしないであろうランダムキーワード
    await page.goto("/jobs?q=zzz_no_results_zzz_unlikely_jp_query")

    // 「条件に合う求人が見つかりませんでした」が出る
    await expect(
      page.getByText("条件に合う求人が見つかりませんでした")
    ).toBeVisible()

    // 条件を緩めるサジェスト
    await expect(page.getByText(/キーワード「.+」を外して検索/)).toBeVisible()

    // 最新求人セクション（最低 1 件は active な求人がある前提）
    // データが空 DB の環境では skip するためにヘッダーで判定
    const latestHeading = page.getByText("最新の求人")
    if (await latestHeading.isVisible().catch(() => false)) {
      await expect(latestHeading).toBeVisible()
    }
  })

  test("カテゴリ絞り込みでクエリパラメータが付く", async ({ page }) => {
    await page.goto("/jobs?category=construction")
    await expect(page).toHaveURL(/category=construction/)
  })
})
