/**
 * POST   /api/users/me/web-push  サブスクリプション登録
 * DELETE                          解除（endpoint 指定）
 *
 * Body (POST):
 *   { endpoint, keys: { p256dh, auth }, userAgent? }
 */

import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const subscribeSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(255),
    auth: z.string().min(1).max(255),
  }),
  userAgent: z.string().max(500).nullable().optional(),
})

const unsubscribeSchema = z.object({
  endpoint: z.string().url().max(2000),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
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

  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "入力内容に誤りがあります", details: parsed.error.issues },
      { status: 400 }
    )
  }

  // endpoint は unique なので upsert
  await prisma.webPushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: {
      userId: session.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      authKey: parsed.data.keys.auth,
      userAgent: parsed.data.userAgent ?? null,
    },
    update: {
      userId: session.user.id,
      p256dh: parsed.data.keys.p256dh,
      authKey: parsed.data.keys.auth,
      userAgent: parsed.data.userAgent ?? null,
      failureCount: 0,
      lastFailedAt: null,
    },
  })

  return Response.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
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
  const parsed = unsubscribeSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "endpoint が不正です" }, { status: 400 })
  }

  await prisma.webPushSubscription
    .deleteMany({
      where: {
        endpoint: parsed.data.endpoint,
        userId: session.user.id,
      },
    })
    .catch(() => ({ count: 0 }))

  return Response.json({ ok: true })
}
