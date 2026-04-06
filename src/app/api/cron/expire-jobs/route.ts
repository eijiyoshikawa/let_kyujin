import { prisma } from "@/lib/db"

/**
 * 有効期限切れ求人の自動クローズ
 *
 * Vercel Cron Jobs や外部スケジューラから定期的に呼び出す。
 * Authorization ヘッダーで CRON_SECRET を検証。
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await prisma.job.updateMany({
    where: {
      status: "active",
      expiresAt: { lte: new Date() },
    },
    data: { status: "closed" },
  })

  console.log(`[cron/expire-jobs] Closed ${result.count} expired jobs`)

  return Response.json({
    closed: result.count,
    timestamp: new Date().toISOString(),
  })
}
