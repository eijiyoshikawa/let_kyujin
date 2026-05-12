/**
 * 求職者ユーザーが LINE 公式アカウントを友だち追加していて、optedOut でないなら、
 * 通知内容を LINE Push でリアルタイム配信する。
 *
 * 識別方法: User.email と LineLead.email を突き合わせる（最新の lineUserId を採用）。
 * これは「LINE 応募 → 後日サイト登録」「サイト登録 → LINE 友だち追加」両方のケースで動作する。
 *
 * 失敗・未配信は黙って無視（メール / inbox は別経路で配信済み）。
 */

import { prisma } from "@/lib/db"
import { pushMessage, isMessagingConfigured } from "@/lib/line-messaging"

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"

/**
 * userId に紐付く LINE 友だち ID を取得する。
 * 紐付き候補が複数ある場合は最新の lineUserId を返す。
 */
async function findLineUserId(userId: string): Promise<string | null> {
  // userId → email を取得し、email match で LineLead を探す
  const user = await prisma.user
    .findUnique({ where: { id: userId }, select: { email: true } })
    .catch(() => null)
  if (!user?.email) return null

  const lead = await prisma.lineLead
    .findFirst({
      where: {
        email: { equals: user.email, mode: "insensitive" },
        lineUserId: { not: null },
        optedOut: false,
      },
      orderBy: { createdAt: "desc" },
      select: { lineUserId: true },
    })
    .catch(() => null)

  return lead?.lineUserId ?? null
}

/**
 * テキスト通知 + 「マイページを開く」リンクを LINE で送信。
 * link は省略可。
 */
export async function pushUserNotification(input: {
  userId: string
  title: string
  body?: string | null
  linkLabel?: string
  linkUrl?: string | null
}): Promise<void> {
  if (!isMessagingConfigured()) return

  const lineUserId = await findLineUserId(input.userId)
  if (!lineUserId) return

  const url = input.linkUrl
    ? input.linkUrl.startsWith("http")
      ? input.linkUrl
      : `${SITE_URL}${input.linkUrl}`
    : `${SITE_URL}/mypage/notifications`

  const linkLabel = input.linkLabel ?? "詳細を見る"

  const body = input.body
    ? `${input.title}\n\n${input.body}\n\n${linkLabel}: ${url}`
    : `${input.title}\n\n${linkLabel}: ${url}`

  try {
    await pushMessage(lineUserId, [{ type: "text", text: body }])
  } catch (e) {
    console.warn(
      `[line-push-notifier] failed: ${e instanceof Error ? e.message : e}`
    )
  }
}
