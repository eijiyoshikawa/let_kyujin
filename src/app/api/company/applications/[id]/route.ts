import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  applied: ["reviewing", "rejected"],
  reviewing: ["interview", "rejected"],
  interview: ["offered", "rejected"],
  offered: ["hired", "rejected"],
  // hired and rejected are terminal states
}

const updateStatusSchema = z.object({
  status: z.enum([
    "applied",
    "reviewing",
    "interview",
    "offered",
    "hired",
    "rejected",
  ]),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const role = (session.user as { role?: string }).role
  if (role !== "company_admin" && role !== "company_member") {
    return Response.json({ error: "企業アカウントでログインしてください" }, { status: 403 })
  }

  const companyId = (session.user as { companyId?: string }).companyId
  if (!companyId) {
    return Response.json({ error: "企業情報が見つかりません" }, { status: 403 })
  }

  const { id } = await params

  const application = await prisma.application.findUnique({
    where: { id },
    select: { companyId: true, status: true },
  })

  if (!application || application.companyId !== companyId) {
    return Response.json({ error: "応募が見つかりません" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "リクエストの形式が正しくありません" }, { status: 400 })
  }

  const parsed = updateStatusSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "無効なステータスです", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const newStatus = parsed.data.status
  const currentStatus = application.status

  // Validate status transition
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus]
  if (!allowed || !allowed.includes(newStatus)) {
    return Response.json(
      { error: `「${currentStatus}」から「${newStatus}」への変更はできません` },
      { status: 400 }
    )
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status: newStatus },
  })

  // Trigger billing when status changes to "hired"
  if (newStatus === "hired") {
    try {
      // Idempotency check: ensure no existing billing event for this application
      const existingBilling = await prisma.billingEvent.findFirst({
        where: { applicationId: id, eventType: "hired" },
      })

      if (!existingBilling) {
        const { createHiringInvoice } = await import("@/lib/billing")
        await createHiringInvoice(id)
      } else {
        console.log(`[billing] Skipped duplicate invoice for application ${id}`)
      }
    } catch (error) {
      console.error(`[billing] Failed to create invoice for application ${id}:`, error)
    }
  }

  return Response.json({ application: updated })
}
