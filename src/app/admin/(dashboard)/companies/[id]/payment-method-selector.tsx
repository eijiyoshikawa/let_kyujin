"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Method = "stripe" | "moneyforward"

const LABELS: Record<Method, { title: string; desc: string }> = {
  stripe: {
    title: "Stripe（カード決済）",
    desc: "Stripe Invoice を発行し、メールでカード支払いリンクを送付。",
  },
  moneyforward: {
    title: "マネーフォワード クラウド請求書（銀行振込）",
    desc: "請求書 PDF を発行・送付。インボイス制度対応・銀行振込で支払い。",
  },
}

export function PaymentMethodSelector({
  companyId,
  currentMethod,
}: {
  companyId: string
  currentMethod: string
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Method>(
    currentMethod === "moneyforward" ? "moneyforward" : "stripe"
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  async function save() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/companies/${companyId}/payment-method`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod: selected }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "保存に失敗しました")
        return
      }
      setSavedAt(new Date())
      router.refresh()
    } catch {
      setError("通信エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const dirty = selected !== currentMethod

  return (
    <div className="mt-4 space-y-3">
      {error && (
        <div className="bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {(["stripe", "moneyforward"] as const).map((m) => (
          <label
            key={m}
            className={`flex cursor-pointer gap-3  border p-3 text-sm ${
              selected === m
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={m}
              checked={selected === m}
              onChange={() => setSelected(m)}
              className="mt-0.5"
            />
            <div>
              <p className="font-medium text-gray-900">{LABELS[m].title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{LABELS[m].desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={!dirty || loading}
          onClick={save}
          className="bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "保存中..." : "支払方法を保存"}
        </button>
        {savedAt && !dirty && (
          <span className="text-xs text-green-600">保存しました</span>
        )}
      </div>
    </div>
  )
}
