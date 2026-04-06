import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const VALID_TRANSITIONS: Record<string, string[]> = {
  sent: ["read", "replied", "declined"],
  read: ["replied", "declined"],
}

const updateSchema = z.object({
  status: z.enum(["replied", "declined"]),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const { id } = await params

  const scout = await prisma.scout.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true },
  })

  if (!scout) {
    return Response.json({ error: "スカウトが見つかりません" }, { status: 404 })
  }

  if (scout.userId !== session.user.id) {
    return Response.json({ error: "権限がありません" }, { status: 403 })
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

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "入力内容に誤りがあります", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { status: newStatus } = parsed.data

  const allowedNext = VALID_TRANSITIONS[scout.status]
  if (!allowedNext || !allowedNext.includes(newStatus)) {
    return Response.json(
      { error: `「${scout.status}」から「${newStatus}」への変更はできません` },
      { status: 400 }
    )
  }

  const updated = await prisma.scout.update({
    where: { id },
    data: { status: newStatus },
  })

  return Response.json({ scout: updated })
}
