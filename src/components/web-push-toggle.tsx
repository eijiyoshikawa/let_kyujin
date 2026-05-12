"use client"

import { useEffect, useState } from "react"
import { Bell, BellOff, Loader2, AlertTriangle } from "lucide-react"

/**
 * Web Push 通知の許可 / 解除トグル。
 *
 * - サービスワーカー (/sw.js) を登録
 * - applicationServerKey に NEXT_PUBLIC_VAPID_PUBLIC_KEY を渡す
 * - 購読情報を /api/users/me/web-push に送る
 *
 * 設定キーが無い / Notification API 不在 / iOS Safari のように対応していない
 * 環境では「対応していません」と表示する。
 */
export function WebPushToggle() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  useEffect(() => {
    let cancelled = false
    async function check() {
      if (typeof window === "undefined") return
      const ok =
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        !!vapidPublicKey
      if (!ok) {
        if (!cancelled) setSupported(false)
        return
      }
      try {
        const reg =
          (await navigator.serviceWorker.getRegistration("/sw.js")) ??
          (await navigator.serviceWorker.register("/sw.js"))
        const sub = await reg.pushManager.getSubscription()
        if (!cancelled) {
          setSupported(true)
          setPermission(Notification.permission)
          setSubscribed(!!sub)
        }
      } catch (e) {
        if (!cancelled) {
          setSupported(false)
          setError(e instanceof Error ? e.message : "サービスワーカー登録失敗")
        }
      }
    }
    void check()
    return () => {
      cancelled = true
    }
  }, [vapidPublicKey])

  async function enable() {
    if (!vapidPublicKey) {
      setError("VAPID 公開鍵が未設定です。")
      return
    }
    setBusy(true)
    setError("")
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== "granted") {
        setError(
          perm === "denied"
            ? "通知がブロックされています。ブラウザ設定から許可してください。"
            : "通知の許可が必要です。"
        )
        return
      }
      const reg = await navigator.serviceWorker.register("/sw.js")
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
      const json = sub.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }
      const res = await fetch("/api/users/me/web-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      })
      if (!res.ok) {
        setError("購読情報の登録に失敗しました。")
        return
      }
      setSubscribed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "購読に失敗しました")
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    setError("")
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js")
      if (!reg) {
        setSubscribed(false)
        return
      }
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch("/api/users/me/web-push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "解除に失敗しました")
    } finally {
      setBusy(false)
    }
  }

  if (supported === null) {
    return null // 判定中
  }

  if (!supported) {
    return (
      <div className="flex items-start gap-2 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          このブラウザは Web Push 通知に対応していません。
          別の通知手段（LINE / メール / inbox）はそのままご利用いただけます。
        </p>
      </div>
    )
  }

  return (
    <div className="border bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
            <Bell className="h-4 w-4 text-primary-600" />
            ブラウザ通知（Web Push）
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            応募ステータス変更や新着求人をブラウザの通知で即座にお知らせします。
            タブが閉じていても届きます。
          </p>
        </div>
        <div className="shrink-0">
          {subscribed ? (
            <button
              type="button"
              onClick={disable}
              disabled={busy}
              className="inline-flex items-center gap-1 border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <BellOff className="h-3 w-3" />
              )}
              通知 OFF
            </button>
          ) : (
            <button
              type="button"
              onClick={enable}
              disabled={busy || permission === "denied"}
              className="inline-flex items-center gap-1 bg-primary-600 hover:bg-primary-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Bell className="h-3 w-3" />
              )}
              通知 ON
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-2 text-[11px] text-red-600">{error}</p>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  // PushSubscriptionOptionsInit.applicationServerKey は ArrayBuffer ベースを期待。
  // SharedArrayBuffer と区別するため明示的に ArrayBuffer を allocate する。
  const buffer = new ArrayBuffer(raw.length)
  const out = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}
