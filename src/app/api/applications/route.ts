import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  sendApplicationConfirmEmail,
  sendApplicationNotificationEmail,
} from "@/lib/email"
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit"

const applicationSchema = z.object({
  jobId: z.string().uuid(),
  message: z.string().max(2000).optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  // レート制限: 同一ユーザーから 1 時間に 10 件まで（スパム応募抑止）
  // 認証済みなのでユーザー ID をキーに使う
  const rl = checkRateLimit({
    key: `applications:${session.user.id}:${getClientIp(request)}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  if (!rl.allowed) {
    return rateLimitResponse(
      rl,
      "応募リクエストが多すぎます。1時間あたり10件までに制限されています。"
    )
  }

  const role = (session.user as { role?: string }).role
  if (role && role !== "seeker") {
    return Response.json(
      { error: "求職者アカウントでログインしてください" },
      { status: 403 }
    )
  }

  // メール確認が完了していないアカウントは応募を拒否（スパム応募の抑止）
  const seeker = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, name: true, email: true },
  })

  if (!seeker?.emailVerified) {
    return Response.json(
      {
        error:
          "メールアドレスの確認が完了していません。登録時にお送りした確認メールのリンクをクリックしてください。",
        code: "email_not_verified",
      },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: "リクエストの形式が正しくありません" },
      { status: 400 }
    )
  }

  const parsed = applicationSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "入力内容に誤りがあります", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { jobId, message } = parsed.data

  // Check job exists and is active
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, status: true, companyId: true },
  })

  if (!job) {
    return Response.json(
      { error: "指定された求人が見つかりません" },
      { status: 404 }
    )
  }

  if (job.status !== "active") {
    return Response.json(
      { error: "この求人は現在募集を停止しています" },
      { status: 400 }
    )
  }

  // Check for duplicate application
  const existing = await prisma.application.findUnique({
    where: {
      jobId_userId: {
        jobId,
        userId: session.user.id,
      },
    },
  })

  if (existing) {
    return Response.json(
      { error: "この求人にはすでに応募済みです" },
      { status: 409 }
    )
  }

  // Fetch job + company detail for notification emails
  const jobDetail = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      title: true,
      company: {
        select: {
          name: true,
          contactEmail: true,
          companyUsers: {
            where: { role: "admin" },
            select: { email: true },
          },
        },
      },
    },
  })

  const application = await prisma.application.create({
    data: {
      jobId,
      userId: session.user.id,
      companyId: job.companyId,
      status: "applied",
      message: message ?? null,
    },
  })

  // 求職者向け：応募完了通知（non-blocking）
  if (session.user.email && jobDetail) {
    sendApplicationConfirmEmail(
      session.user.email,
      jobDetail.title,
      jobDetail.company?.name ?? "企業"
    ).catch((err) => console.error("[email] Application confirm failed:", err))
  }

  // 企業向け：新着応募通知（non-blocking）
  // 自社掲載求人 (companyId あり) のみ送信。HelloWork 求人は企業情報が無いためスキップ。
  if (jobDetail?.company) {
    const recipients = collectCompanyRecipients(jobDetail.company)
    const applicantName = seeker.name ?? seeker.email ?? "応募者"
    for (const to of recipients) {
      sendApplicationNotificationEmail(
        to,
        jobDetail.title,
        applicantName,
        application.id
      ).catch((err) =>
        console.error("[email] Application notification failed:", err)
      )
    }
  }

  return Response.json({ application }, { status: 201 })
}

/**
 * 企業向け通知メールの宛先を収集する。
 * - company.contactEmail があればそれを優先
 * - なければ admin role の CompanyUser 全員に送る
 * - 重複は除く
 */
function collectCompanyRecipients(company: {
  contactEmail: string | null
  companyUsers: { email: string }[]
}): string[] {
  const set = new Set<string>()
  if (company.contactEmail) set.add(company.contactEmail)
  if (set.size === 0) {
    for (const u of company.companyUsers) set.add(u.email)
  }
  return Array.from(set)
}
