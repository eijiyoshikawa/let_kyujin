/**
 * HelloWork 求人取り込み Cron エンドポイント
 *
 * POST /api/cron/hellowork-import
 *
 * 認証: Bearer CRON_SECRET
 * Vercel Cron Jobs から定期実行される想定。
 *
 * クエリパラメータ:
 *   maxJobs       : 取得求人上限 (default: 1000 = 1ページ)
 *   closeOrphans  : 今回バッチに含まれない HW 求人を closed にするか (default: true)
 *
 * Vercel の関数実行時間制限内に収めるため、デフォルトでは 1 ページ (1000 件) のみ。
 */

import { fetchAllJobs } from "@/lib/crawler/hellowork"
import { importHelloworkJobs } from "@/lib/crawler/import-batch"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const maxJobs = parseInt(url.searchParams.get("maxJobs") ?? "1000", 10)
  // closeOrphans は安全側のためデフォルト false。
  // 明示的に ?closeOrphans=true を指定したときのみ、今回バッチに含まれない
  // 既存 HW 求人を closed にする（= 全件取り込みを意図したケースのみ）。
  const closeOrphans = url.searchParams.get("closeOrphans") === "true"

  const t0 = Date.now()

  try {
    const result = await fetchAllJobs(undefined, { maxJobs })
    const stats = await importHelloworkJobs(result.jobs, {
      dryRun: false,
      closeOrphans,
    })

    return Response.json({
      success: true,
      fetched: result.jobs.length,
      created: stats.created,
      updated: stats.updated,
      closed: stats.closed,
      errors: stats.errors,
      durationMs: Date.now() - t0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "unknown error"
    console.error(`[cron/hellowork-import] failed: ${message}`)
    return Response.json(
      { success: false, error: message, durationMs: Date.now() - t0 },
      { status: 500 }
    )
  }
}
