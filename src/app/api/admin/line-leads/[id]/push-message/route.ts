/**
 * POST /api/admin/line-leads/[id]/push-message
 *
 * 管理者が lead に紐付いた LINE ユーザーへ Push メッセージを送る。
 * - lead.lineUserId が必須（友だち追加 + bind 済みの lead のみ送信可）
 * - body: { jobIds: string[] }     → 推薦する求人を 1〜5 件指定
 *         { freeText?: string }    → 任意の追記テキスト
 * - 求人カード形式（タイトル + 給与 + URL）をテキストにまとめて送信
 *
 * LINE Messaging API の Channel Access Token が必要（既設定済み）。
 */

import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { pushMessage, isMessagingConfigured } from "@/lib/line-messaging"

export const dynamic = "force-dynamic"

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"

const bodySchema = z.object({
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

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  if (!isMessagingConfigured()) {
    return Response.json(
      { error: "line_not_configured", message: "LINE_CHANNEL_ACCESS_TOKEN が未設定です" },
      { status: 503 }
    )
  }

  const { id } = await ctx.params

  let parsed: z.infer<typeof bodySchema>
  try {
    const body = await request.json().catch(() => ({}))
    parsed = bodySchema.parse(body)
  } catch (err) {
    return Response.json(
      { error: "invalid_body", issues: err instanceof z.ZodError ? err.issues : [] },
      { status: 400 }
    )
  }

  // lead と求人を並列取得
  const [lead, jobs] = await Promise.all([
    prisma.lineLead
      .findUnique({
        where: { id },
        select: { id: true, lineUserId: true, name: true },
      })
      .catch(() => null),
    prisma.job
      .findMany({
        where: { id: { in: parsed.jobIds }, status: "active" },
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
      .catch(() => []),
  ])

  if (!lead) return Response.json({ error: "lead_not_found" }, { status: 404 })
  if (!lead.lineUserId) {
    return Response.json(
      {
        error: "line_not_bound",
        message: "この lead はまだ LINE ユーザーと紐付いていません。LINE 表示名で手動 bind してから再送してください。",
      },
      { status: 400 }
    )
  }
  if (jobs.length === 0) {
    return Response.json({ error: "no_active_jobs" }, { status: 404 })
  }

  const message = buildJobRecommendationText({
    name: lead.name,
    jobs,
    freeText: parsed.freeText,
  })

  try {
    await pushMessage(lead.lineUserId, [{ type: "text", text: message }])
  } catch (e) {
    console.error(`[admin.push] ${e instanceof Error ? e.message : e}`)
    return Response.json({ error: "push_failed" }, { status: 502 })
  }

  return Response.json({ success: true, sentJobCount: jobs.length })
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

function buildJobRecommendationText({
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
  lines.push("ご希望に近いと思われる求人を以下にお送りします👷‍♂️")
  lines.push("")
  for (const job of jobs) {
    lines.push(`▼ ${job.title}`)
    lines.push(`📍 ${job.prefecture}${job.city ? ` ${job.city}` : ""}`)
    lines.push(`💰 ${formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}`)
    lines.push(`🔗 ${SITE_URL}/jobs/${job.id}`)
    lines.push("")
  }
  lines.push("気になる求人があれば、URL を貼って一言メッセージください！")
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
