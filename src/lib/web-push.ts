/**
 * Web Push (VAPID) 配信ヘルパー。
 *
 * 環境変数:
 *   VAPID_PUBLIC_KEY            （クライアント公開用、NEXT_PUBLIC_VAPID_PUBLIC_KEY と同じ値）
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY（ブラウザ側の applicationServerKey に渡す）
 *   VAPID_PRIVATE_KEY           （サーバ専用、秘匿）
 *   VAPID_SUBJECT               （mailto:contact@example.com 等）
 *
 * 鍵生成:
 *   npx web-push generate-vapid-keys
 *
 * 配信失敗時:
 *   - 410 / 404 を返した endpoint は無効なので自動削除
 *   - 他のエラーは failureCount を +1、3 回連続で失敗したら削除
 */

import webpush from "web-push"
import { prisma } from "@/lib/db"

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:contact@genbacareer.jp"

let configured = false
function ensureConfigured(): boolean {
  if (configured) return true
  if (!PUBLIC_KEY || !PRIVATE_KEY) return false
  try {
    webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY)
    configured = true
    return true
  } catch (e) {
    console.warn(
      `[web-push] VAPID 設定エラー: ${e instanceof Error ? e.message : e}`
    )
    return false
  }
}

export function isWebPushConfigured(): boolean {
  return !!(PUBLIC_KEY && PRIVATE_KEY)
}

export type WebPushPayload = {
  title: string
  body?: string
  url?: string
  tag?: string
  icon?: string
  badge?: string
}

/**
 * userId に紐付く全 endpoint へ送信。
 * 失敗 endpoint は自動的に failureCount を更新 / 必要に応じて削除。
 */
export async function sendWebPushToUser(
  userId: string,
  payload: WebPushPayload
): Promise<{ delivered: number; removed: number }> {
  if (!ensureConfigured()) return { delivered: 0, removed: 0 }

  const subs = await prisma.webPushSubscription
    .findMany({
      where: { userId },
      select: { id: true, endpoint: true, p256dh: true, authKey: true },
    })
    .catch(() => [])

  if (subs.length === 0) return { delivered: 0, removed: 0 }

  const json = JSON.stringify({
    title: payload.title,
    body: payload.body ?? "",
    url: payload.url ?? "/mypage/notifications",
    tag: payload.tag,
    icon: payload.icon,
    badge: payload.badge,
  })

  let delivered = 0
  let removed = 0

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.authKey },
        },
        json,
        { TTL: 60 * 60 } // 1 時間
      )
      delivered++
      // 成功したら failureCount をリセット
      await prisma.webPushSubscription
        .update({
          where: { id: sub.id },
          data: { failureCount: 0, lastFailedAt: null },
        })
        .catch(() => {})
    } catch (e) {
      const status =
        typeof e === "object" && e !== null && "statusCode" in e
          ? (e as { statusCode?: number }).statusCode
          : undefined
      // 410 Gone / 404: endpoint 無効 → 即削除
      if (status === 410 || status === 404) {
        await prisma.webPushSubscription
          .delete({ where: { id: sub.id } })
          .catch(() => {})
        removed++
        continue
      }
      // その他: failureCount を +1。3 回連続で削除候補
      const next = await prisma.webPushSubscription
        .update({
          where: { id: sub.id },
          data: {
            failureCount: { increment: 1 },
            lastFailedAt: new Date(),
          },
          select: { failureCount: true },
        })
        .catch(() => null)
      if (next && next.failureCount >= 3) {
        await prisma.webPushSubscription
          .delete({ where: { id: sub.id } })
          .catch(() => {})
        removed++
      }
      console.warn(
        `[web-push] send failed (status=${status}): ${e instanceof Error ? e.message : e}`
      )
    }
  }

  return { delivered, removed }
}
