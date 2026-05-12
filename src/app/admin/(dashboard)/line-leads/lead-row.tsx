"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Check, AlertCircle, ChevronRight } from "lucide-react"
import { LEAD_STATUSES, LEAD_STATUS_META, type LeadStatus } from "@/lib/line-lead-status"

export interface LeadRowData {
  id: string
  createdAt: string // ISO
  name: string
  phone: string
  email: string
  experienceYears: number | null
  notes: string | null
  status: LeadStatus
  lineDisplayName: string | null
  job: { id: string; title: string; prefecture: string; city: string | null } | null
}

export function LeadRow({ lead, expanded: initiallyExpanded }: { lead: LeadRowData; expanded?: boolean }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(initiallyExpanded ?? false)
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [notes, setNotes] = useState(lead.notes ?? "")
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<null | "ok" | string>(null)

  async function save(changes: { status?: LeadStatus; notes?: string }) {
    setSaving(true)
    setResult(null)
    try {
      const res = await fetch(`/api/admin/line-leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setResult(j?.error ?? `保存失敗 (${res.status})`)
      } else {
        setResult("ok")
        router.refresh()
      }
    } catch (e) {
      setResult(e instanceof Error ? e.message : "通信エラー")
    } finally {
      setSaving(false)
    }
  }

  const meta = LEAD_STATUS_META[status]
  const createdLocal = new Date(lead.createdAt).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="border border-gray-200 bg-white">
      {/* 行ヘッダ（クリックで展開） */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="press w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50"
      >
        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${meta.classes}`}>
          {meta.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">
            {lead.name}
            <span className="ml-2 text-xs font-normal text-gray-500">
              {createdLocal}
            </span>
          </p>
          <p className="text-xs text-gray-500 truncate">
            {lead.phone} / {lead.email}
            {lead.job && (
              <>
                {" · "}
                <span className="text-primary-700">{lead.job.title}</span>
              </>
            )}
          </p>
        </div>
        <ChevronRight
          className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* 詳細パネル */}
      {expanded && (
        <div className="border-t border-gray-100 bg-warm-50 p-4 space-y-4">
          {/* メタ情報 */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 text-xs">
            <DefLabel label="氏名" value={lead.name} />
            <DefLabel label="電話" value={lead.phone} link={`tel:${lead.phone}`} />
            <DefLabel label="メール" value={lead.email} link={`mailto:${lead.email}`} />
            <DefLabel
              label="経験年数"
              value={lead.experienceYears !== null ? `${lead.experienceYears} 年` : "未入力"}
            />
            <DefLabel label="LINE 表示名" value={lead.lineDisplayName ?? "未紐付け"} />
            <DefLabel label="作成日時" value={new Date(lead.createdAt).toLocaleString("ja-JP")} />
          </dl>

          {/* 応募先求人 */}
          {lead.job && (
            <div>
              <p className="text-xs font-bold text-gray-700 mb-1">応募先求人</p>
              <Link
                href={`/jobs/${lead.job.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex items-center gap-1.5 border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100"
              >
                {lead.job.title}
                <span className="text-[10px] font-normal text-primary-600">
                  ({lead.job.prefecture}
                  {lead.job.city ? ` ${lead.job.city}` : ""})
                </span>
              </Link>
            </div>
          )}

          {/* ステータス変更 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700">ステータス</label>
              <select
                value={status}
                onChange={(e) => {
                  const next = e.target.value as LeadStatus
                  setStatus(next)
                  save({ status: next })
                }}
                disabled={saving}
                className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS_META[s].label} — {LEAD_STATUS_META[s].description}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              {result === "ok" && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  保存しました
                </span>
              )}
              {typeof result === "string" && result !== "ok" && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {result}
                </span>
              )}
              {saving && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  保存中…
                </span>
              )}
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-bold text-gray-700">運用メモ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (lead.notes ?? "")) {
                  save({ notes: notes || undefined })
                }
              }}
              rows={3}
              placeholder="折り返し連絡 / ヒアリング内容 / 次回アクション …"
              className="mt-1 w-full border border-gray-300 px-3 py-2 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">入力欄から外れたタイミングで自動保存します</p>
          </div>
        </div>
      )}
    </div>
  )
}

function DefLabel({
  label,
  value,
  link,
}: {
  label: string
  value: string
  link?: string
}) {
  return (
    <div>
      <dt className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-xs text-gray-900">
        {link ? (
          <a href={link} className="text-primary-700 hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}
