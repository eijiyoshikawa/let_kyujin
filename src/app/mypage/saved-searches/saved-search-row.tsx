"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, BellOff, Trash2, Loader2, ExternalLink } from "lucide-react"

export function SavedSearchRow({
  id,
  name,
  alertEnabled: initialAlert,
  label,
  href,
  createdAt,
}: {
  id: string
  name: string
  alertEnabled: boolean
  label: string
  href: string
  createdAt: string
}) {
  const router = useRouter()
  const [alert, setAlert] = useState(initialAlert)
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null)

  async function toggleAlert() {
    setBusy("toggle")
    try {
      const res = await fetch(`/api/users/me/saved-searches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertEnabled: !alert }),
      })
      if (res.ok) {
        setAlert(!alert)
      }
    } catch {
      // noop — UI に戻すまでもない
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    if (!confirm(`「${name}」を削除しますか？`)) return
    setBusy("delete")
    try {
      const res = await fetch(`/api/users/me/saved-searches/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        startTransition(() => router.refresh())
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Link
        href={href}
        className="group min-w-0 flex-1"
      >
        <p className="text-sm font-bold text-gray-900 group-hover:text-primary-700 flex items-center gap-1">
          {name}
          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
        </p>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{label}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">
          保存日: {new Date(createdAt).toLocaleDateString("ja-JP")}
        </p>
      </Link>

      <button
        type="button"
        onClick={toggleAlert}
        disabled={busy !== null || pending}
        className={`press inline-flex items-center gap-1 px-2 py-1 text-xs font-bold border ${
          alert
            ? "border-primary-200 bg-primary-50 text-primary-700"
            : "border-gray-300 bg-white text-gray-500"
        } disabled:opacity-60`}
        aria-pressed={alert}
      >
        {busy === "toggle" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : alert ? (
          <Bell className="h-3 w-3" />
        ) : (
          <BellOff className="h-3 w-3" />
        )}
        {alert ? "通知 ON" : "通知 OFF"}
      </button>

      <button
        type="button"
        onClick={remove}
        disabled={busy !== null || pending}
        className="press inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-60"
        aria-label="削除"
      >
        {busy === "delete" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </li>
  )
}
