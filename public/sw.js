/* ゲンバキャリア Web Push サービスワーカー
 * - push: 受信した payload (JSON) を Notification として表示
 * - notificationclick: data.url を開く
 *
 * payload 形式: { title, body, url, tag?, icon?, badge? }
 */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  let data = {}
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch {
    try {
      data = { title: event.data ? event.data.text() : "通知" }
    } catch {
      data = { title: "ゲンバキャリア", body: "新しい通知があります" }
    }
  }

  const title = data.title || "ゲンバキャリア"
  const body = data.body || ""
  const url = data.url || "/mypage/notifications"
  const tag = data.tag || undefined
  const icon = data.icon || "/icon.png"
  const badge = data.badge || "/icon.png"

  const options = {
    body,
    icon,
    badge,
    tag,
    renotify: !!tag,
    data: { url },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || "/"
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 既に開いているタブがあれば focus
        for (const client of clientList) {
          try {
            if ("focus" in client) {
              const u = new URL(client.url)
              if (u.pathname === url || client.url.endsWith(url)) {
                return client.focus()
              }
            }
          } catch {
            // ignore parse errors
          }
        }
        // 無ければ新規タブで開く
        if (self.clients.openWindow) {
          return self.clients.openWindow(url)
        }
      })
  )
})
