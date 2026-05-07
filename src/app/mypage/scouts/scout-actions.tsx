"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle } from "lucide-react"

export function ScoutActions({ scoutId }: { scoutId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleAction = async (status: "replied" | "declined") => {
    setLoading(status)
    try {
      const res = await fetch(`/api/users/me/scouts/${scoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mt-3 flex gap-2 border-t pt-3">
      <button
        onClick={() => handleAction("replied")}
        disabled={loading !== null}
        className="flex items-center gap-1.5  bg-primary-600 px-4 py-2 text-xs font-medium text-white hover:bg-primary-700 transition disabled:opacity-50"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        {loading === "replied" ? "送信中..." : "興味あり"}
      </button>
      <button
        onClick={() => handleAction("declined")}
        disabled={loading !== null}
        className="flex items-center gap-1.5  border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <XCircle className="h-3.5 w-3.5" />
        {loading === "declined" ? "送信中..." : "辞退する"}
      </button>
    </div>
  )
}
