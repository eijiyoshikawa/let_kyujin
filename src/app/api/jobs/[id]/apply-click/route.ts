/**
 * POST /api/jobs/[id]/apply-click
 *
 * 「LINE で応募」ボタンが押されたタイミングで呼び出されるトラッキング API。
 * - DB に `application_clicks` を 1 行 INSERT（jobId / userId / source / IP / UA）
 * - LINE 集約 URL を返す（クライアントはこの URL に navigate.replace する）
 *
 * 未ログインユーザーも記録対象。userId は null になる。
 */

import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { buildLineApplyUrl, isLineConfigured } from "@/lib/line"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"
import { getSessionIdIfExists } from "@/lib/session-id"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  source: z
    .enum(["job_card", "job_detail", "apply_page"])
    .default("apply_page"),
})

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const ip = getClientIp(request)

  // 1 求人あたり 10 click / 5min / IP（連打防止。実応募は希少なので妥当）
  const rl = checkRateLimit({
    key: `apply-click:${id}:${ip}`,
    limit: 10,
    windowMs: 5 * 60 * 1000,
  })
  if (!rl.allowed) return rateLimitResponse(rl)

  // 入力検証
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

  // 対象求人を取得（LINE メッセージの pre-fill に必要）
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      prefecture: true,
      city: true,
      helloworkId: true,
      status: true,
    },
  })
  if (!job || job.status !== "active") {
    return Response.json({ error: "job_not_found" }, { status: 404 })
  }

  // 現在のセッションから userId 取得（任意）
  const session = await auth().catch(() => null)
  const userId =
    typeof session?.user?.id === "string" && session.user.id.length > 0
      ? session.user.id
      : null

  const sessionId = await getSessionIdIfExists().catch(() => null)

  // クリック記録（fire-and-log: 失敗してもユーザー体験は阻害しない）
  prisma.applicationClick
    .create({
      data: {
        jobId: job.id,
        userId,
        sessionId,
        source: parsed.source,
        ipAddress: ip,
        userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
        referer: request.headers.get("referer")?.slice(0, 500) ?? null,
      },
    })
    .catch((e) => {
      console.error(
        `[apply-click] DB insert failed: ${e instanceof Error ? e.message : e}`
      )
    })

  // LINE 集約 URL を生成
  const lineUrl = buildLineApplyUrl({
    jobId: job.id,
    title: job.title,
    prefecture: job.prefecture,
    city: job.city,
    helloworkId: job.helloworkId,
  })

  return Response.json({
    success: true,
    lineUrl,
    configured: isLineConfigured(),
  })
}
