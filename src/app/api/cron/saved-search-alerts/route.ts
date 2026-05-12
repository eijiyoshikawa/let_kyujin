/**
 * POST /api/cron/saved-search-alerts
 *
 * 保存検索の新着求人をユーザーへ通知する日次バッチ。
 * Vercel Cron か外部スケジューラから Bearer CRON_SECRET 付きで叩く。
 *
 * 各 SavedSearch で
 *   1. alertEnabled = true
 *   2. lastNotifiedAt より新しい publishedAt の active 求人を上位 5 件取得
 * を行い、見つかれば createNotification で inbox 通知（LINE Push も連動）を生成、
 * lastNotifiedAt を now に更新する。
 */

import { prisma } from "@/lib/db"
import { createNotification } from "@/lib/notifications"
import {
  findNewMatchingJobs,
  formatSearchLabel,
  toSearchQueryString,
} from "@/lib/saved-searches"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 300

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 1 回の起動で最大 500 件まで処理（負荷上限）
  const searches = await prisma.savedSearch.findMany({
    where: { alertEnabled: true },
    orderBy: { lastNotifiedAt: { sort: "asc", nulls: "first" } },
    take: 500,
  })

  const startedAt = new Date()
  let processed = 0
  let notified = 0
  const errors: string[] = []

  for (const s of searches) {
    processed++
    try {
      const matches = await findNewMatchingJobs(s, 5)
      if (matches.length === 0) {
        // 何もマッチしなかった場合も lastNotifiedAt を更新（次回スキャン量を削減）
        await prisma.savedSearch.update({
          where: { id: s.id },
          data: { lastNotifiedAt: startedAt },
        })
        continue
      }

      const sample = matches.slice(0, 3)
      const titleBody = sample.map((m) => `・${m.title}`).join("\n")
      const moreText = matches.length > 3 ? `\n... 他 ${matches.length - 3} 件` : ""

      const qs = toSearchQueryString(s)
      const link = qs ? `/jobs?${qs}` : "/jobs"

      await createNotification({
        userId: s.userId,
        type: "system",
        title: `🆕 「${s.name}」に新着求人 ${matches.length} 件`,
        body: `条件: ${formatSearchLabel(s)}\n\n${titleBody}${moreText}`,
        linkUrl: link,
        refId: s.id,
      })

      await prisma.savedSearch.update({
        where: { id: s.id },
        data: { lastNotifiedAt: startedAt },
      })
      notified++
    } catch (e) {
      errors.push(`${s.id}: ${e instanceof Error ? e.message : e}`)
    }
  }

  return Response.json({
    timestamp: startedAt.toISOString(),
    processed,
    notified,
    errors: errors.slice(0, 10),
  })
}
