"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"

export function ScoutSendButton({
  userId,
  userName,
  jobs,
}: {
  userId: string
  userName: string
  jobs: { id: string; title: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [jobId, setJobId] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSend() {
    if (!message.trim()) {
      setError("メッセージを入力してください")
      return
    }

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/company/scouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          jobId: jobId || null,
          message: message.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "送信に失敗しました")
        return
      }

      setOpen(false)
      setMessage("")
      setJobId("")
      router.refresh()
    } catch {
      setError("通信エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
      >
        <Send className="h-3 w-3" />
        スカウト
      </button>
    )
  }

  return (
    <div className="w-72 rounded-lg border bg-white p-4 shadow-lg">
      <p className="text-sm font-medium text-gray-900">
        {userName} にスカウトを送信
      </p>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}

      {jobs.length > 0 && (
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="mt-3 block w-full rounded-md border px-2 py-1.5 text-xs"
        >
          <option value="">求人を選択（任意）</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      )}

      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="スカウトメッセージを入力..."
        maxLength={2000}
        className="mt-3 block w-full rounded-md border px-2 py-1.5 text-xs"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSend}
          disabled={loading}
          className="rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "送信中..." : "送信"}
        </button>
        <button
          onClick={() => {
            setOpen(false)
            setError("")
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
