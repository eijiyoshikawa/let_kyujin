/**
 * POST /api/admin/segments/broadcast
 *
 * セグメント条件 + 求人 jobIds を渡し、該当 lead 全員に LINE Push する。
 * - lineUserId が bind 済みの lead のみ送信対象
 * - LINE Messaging API のレート制限を考慮し、直列 100 件ずつ並列処理
 * - 結果を broadcast_logs に保存
 *
 * Body:
 *   {
 *     segment: { utmSource?, status?, jobCategory?, jobPrefecture?, viewedCategory?, viewedPrefecture?, lineBound?, createdSinceDays? },
 *     jobIds: string[1..5],
 *     freeText?: string
 *   }
 */

import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isMessagingConfigured, pushMessage } from "@/lib/line-messaging"
import { resolveSegment, type Segment } from "@/lib/segment"
import { LEAD_STATUSES } from "@/lib/line-lead-status"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"

const segmentSchema = z
  .object({
    utmSource: z.string().max(100).optional(),
    status: z.enum(LEAD_STATUSES).optional(),
    jobCategory: z.string().max(40).optional(),
    jobPrefecture: z.string().max(40).optional(),
    viewedCategory: z.string().max(40).optional(),
    viewedPrefecture: z.string().max(40).optional(),
    lineBound: z.boolean().optional(),
    createdSinceDays: z.number().int().positive().max(365).optional(),
  })
  .strict()

const bodySchema = z.object({
  segment: segmentSchema,
  jobIds: z.array(z.string().uuid()).min(1).max(5),
  freeText: z.string().max(500).optional(),
})

async function requireAdmin() {
  const session = await auth().catch(() => null)
  if (!session?.user) return null
  const role = (session.user as { role?: string }).role
  if (role !== "admin") return null
  return session
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 })

  if (!isMessagingConfigured()) {
    return Response.json(
      { error: "line_not_configured" },
      { status: 503 }
    )
  }

  let body: z.infer<typeof bodySchema>
  try {
    const json = await request.json().catch(() => ({}))
    body = bodySchema.parse(json)
  } catch (err) {
    return Response.json(
      { error: "invalid_body", issues: err instanceof z.ZodError ? err.issues : [] },
      { status: 400 }
    )
  }

  // セグメント絞り込み（lineBound=true で必須化）
  const segment: Segment = { ...body.segment, lineBound: true }
  const leads = await resolveSegment(segment, 1000)
  // 対象 lead 取得
  const jobs = await prisma.job
    .findMany({
      where: { id: { in: body.jobIds }, status: "active" },
      select: {
        id: true,
        title: true,
        prefecture: true,
        city: true,
        salaryMin: true,
        salaryMax: true,
        salaryType: true,
      },
    })
    .catch(() => [])
  if (jobs.length === 0) {
    return Response.json({ error: "no_active_jobs" }, { status: 404 })
  }

  // 並列度を 10 件に絞って push（LINE API は短期 burst に弱い）
  const CONCURRENCY = 10
  let success = 0
  let failure = 0
  let skipped = 0

  for (let i = 0; i < leads.length; i += CONCURRENCY) {
    const batch = leads.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async (lead) => {
        if (!lead.lineUserId) {
          skipped++
          return
        }
        const message = buildMessage({ name: lead.name, jobs, freeText: body.freeText })
        try {
          await pushMessage(lead.lineUserId, [{ type: "text", text: message }])
          success++
        } catch (e) {
          failure++
          console.warn(
            `[broadcast] push failed lead=${lead.id} err=${
              e instanceof Error ? e.message : e
            }`
          )
        }
      })
    )
  }

  // ログ保存
  const userId = (session.user as { id?: string } | undefined)?.id ?? null
  await prisma.broadcastLog
    .create({
      data: {
        segment: JSON.parse(JSON.stringify(body.segment)),
        jobIds: body.jobIds,
        freeText: body.freeText ?? null,
        targetCount: leads.length,
        successCount: success,
        failureCount: failure,
        skippedCount: skipped,
        triggeredBy: userId,
      },
    })
    .catch((e) =>
      console.warn(`[broadcast] log insert failed: ${e instanceof Error ? e.message : e}`)
    )

  return Response.json({
    success: true,
    targetCount: leads.length,
    successCount: success,
    failureCount: failure,
    skippedCount: skipped,
  })
}

interface JobForMessage {
  id: string
  title: string
  prefecture: string
  city: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string | null
}

function buildMessage({
  name,
  jobs,
  freeText,
}: {
  name: string
  jobs: JobForMessage[]
  freeText?: string
}): string {
  const lines: string[] = []
  lines.push(`${name} さんへ`)
  lines.push("")
  if (freeText) {
    lines.push(freeText)
    lines.push("")
  }
  lines.push("条件に合いそうな求人をピックアップしました👷‍♂️")
  lines.push("")
  for (const job of jobs) {
    lines.push(`▼ ${job.title}`)
    lines.push(`📍 ${job.prefecture}${job.city ? ` ${job.city}` : ""}`)
    lines.push(`💰 ${formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}`)
    lines.push(`🔗 ${SITE_URL}/jobs/${job.id}`)
    lines.push("")
  }
  lines.push("気になる求人があれば、URL を貼って一言ください！")
  return lines.join("\n")
}

function formatSalary(
  min: number | null,
  max: number | null,
  type: string | null
): string {
  if (!min) return "応相談"
  const unit = type === "hourly" ? "時給" : type === "annual" ? "年収" : "月給"
  const fmt = (n: number) =>
    n >= 10000 ? `${(n / 10000).toFixed(0)}万` : `${n.toLocaleString()}`
  if (min && max) return `${unit} ${fmt(min)}〜${fmt(max)}円`
  return `${unit} ${fmt(min)}円〜`
}
