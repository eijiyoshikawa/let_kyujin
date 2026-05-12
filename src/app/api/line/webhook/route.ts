/**
 * POST /api/line/webhook
 *
 * LINE Messaging API の Webhook 受信エンドポイント。
 *
 * - X-Line-Signature を検証（HMAC-SHA256 + base64）
 * - イベント種別ごとに最小限の処理:
 *   - follow: 友だち追加 → グリーティング送信 + プロフィール取得
 *   - message(text): 自動応答（FAQ パターンマッチ）
 *   - unfollow / etc: ログのみ
 *
 * 環境変数:
 *   LINE_CHANNEL_ACCESS_TOKEN
 *   LINE_CHANNEL_SECRET
 *
 * LINE 側からの想定 URL: https://genbacareer.jp/api/line/webhook
 *
 * 200 を必ず即時返却すること（リトライ抑制のため）。
 */

import { type NextRequest } from "next/server"
import {
  verifyWebhookSignature,
  replyMessage,
  getUserProfile,
  isMessagingConfigured,
} from "@/lib/line-messaging"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"
// 署名検証のため raw body を扱う必要がある
export const runtime = "nodejs"

interface LineEvent {
  type: string
  replyToken?: string
  source?: { userId?: string }
  timestamp?: number
  message?: { type?: string; text?: string }
}

const GREETING_TEXT = [
  "ご登録ありがとうございます🎉",
  "",
  "ゲンバキャリア公式 LINE です。",
  "気になる求人があればお気軽にメッセージください。担当者が 1 営業日以内にご返信します。",
  "",
  "▼ よくあるご質問",
  "・「求人」と送ると最新の求人をご案内",
  "・「料金」と送ると料金体系をご案内",
  "・「会社」と送ると運営会社情報をご案内",
].join("\n")

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"

function autoReplyText(input: string): string | null {
  const normalized = input.replace(/\s+/g, "").toLowerCase()
  if (/求人|もとめる|求める|探/.test(normalized)) {
    return `最新の建設業求人はこちらからご覧いただけます👷‍♂️\n${SITE_URL}/jobs\n\n気になる求人が見つかりましたら、URL を貼り付けてお送りください。`
  }
  if (/料金|費用|プラン/.test(normalized)) {
    return [
      "💴 ご利用料金（求職者の方）",
      "完全無料です。",
      "",
      "💴 ご利用料金（企業様）",
      "・掲載料: 無料キャンペーン中",
      "・成果報酬: 1 名 29.8 万円〜",
      "",
      `詳しくは: ${SITE_URL}/for-employers`,
    ].join("\n")
  }
  if (/会社|運営|company/.test(normalized)) {
    return [
      "運営会社: 株式会社LET",
      "所在地: 大阪府大阪市中央区南久宝寺町 4-4-12 IB CENTER ビル 8F",
      "TEL: 06-6786-8320",
      "",
      `詳しくは: ${SITE_URL}/about`,
    ].join("\n")
  }
  if (/ありがとう|thanks/.test(normalized)) {
    return "ご連絡ありがとうございます。担当者が改めてご返信いたします📝"
  }
  return null
}

export async function POST(request: NextRequest) {
  // Messaging API 未設定時は 200 で握りつぶす（LINE 側のリトライ防止）
  if (!isMessagingConfigured()) {
    console.warn("[line.webhook] LINE_CHANNEL_ACCESS_TOKEN / SECRET が未設定のため処理をスキップ")
    return new Response(null, { status: 200 })
  }

  const signature = request.headers.get("x-line-signature")
  const rawBody = await request.text()

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[line.webhook] 署名検証失敗")
    return new Response("invalid signature", { status: 401 })
  }

  let payload: { events?: LineEvent[] }
  try {
    payload = JSON.parse(rawBody) as { events?: LineEvent[] }
  } catch {
    return new Response("invalid json", { status: 400 })
  }

  const events = payload.events ?? []

  // 各イベントは独立して並列処理。1 件失敗しても 200 を返す。
  await Promise.allSettled(events.map((ev) => handleEvent(ev)))

  return new Response(null, { status: 200 })
}

async function handleEvent(ev: LineEvent): Promise<void> {
  try {
    if (ev.type === "follow") {
      const userId = ev.source?.userId
      // プロフィール取得（任意。失敗してもグリーティングは送る）
      const profile = userId ? await getUserProfile(userId).catch(() => null) : null

      // 直近 7 日以内に同じ電話 or メールで lead がある場合、line_user_id を後追いバインド
      // 入力情報が無いので名前一致は行わず、最も古い pending を取る。
      if (userId) {
        await prisma.lineLead
          .updateMany({
            where: {
              lineUserId: null,
              status: "pending",
              createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
            data: {
              // ここでは全件は更新しない。最新 1 件のみ別途処理する設計だが、
              // updateMany では LIMIT 不可。代替として、明示バインドは管理画面で運営が行う。
            },
          })
          .catch(() => {})

        // プロフィールが取得できた場合、display name を別途保存しておく（将来の手動バインドで参照）
        if (profile) {
          await prisma.lineLead
            .updateMany({
              where: { lineUserId: userId },
              data: { lineDisplayName: profile.displayName, status: "line_added" },
            })
            .catch(() => {})
        }
      }

      if (ev.replyToken) {
        await replyMessage(ev.replyToken, [{ type: "text", text: GREETING_TEXT }])
      }
      return
    }

    if (ev.type === "message" && ev.message?.type === "text" && ev.replyToken) {
      const text = ev.message.text ?? ""
      const reply = autoReplyText(text)
      if (reply) {
        await replyMessage(ev.replyToken, [{ type: "text", text: reply }])
      }
      // 自動応答に該当しない場合は無音（運営が個別対応）
      return
    }

    // 他のイベントタイプはログのみ
  } catch (e) {
    console.error(`[line.webhook] handleEvent failed: ${e instanceof Error ? e.message : e}`)
  }
}
