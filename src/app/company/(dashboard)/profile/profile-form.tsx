"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, Check, AlertCircle } from "lucide-react"

type ProfileData = {
  tagline: string
  pitchHighlights: string
  idealCandidate: string
  employeeVoice: string
  photos: string[]
  instagramUrl: string
  tiktokUrl: string
  facebookUrl: string
  xUrl: string
  youtubeUrl: string
}

export function ProfileForm({
  initial,
  companyName,
  lastContentUpdatedAt,
}: {
  initial: ProfileData
  companyName: string
  lastContentUpdatedAt: Date | null
}) {
  const router = useRouter()
  const [data, setData] = useState<ProfileData>(initial)
  // 写真の URL を改行区切りで編集できるよう join したテキスト表現
  const [photosText, setPhotosText] = useState(initial.photos.join("\n"))
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<
    null | { ok: true } | { ok: false; message: string }
  >(null)

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((d) => ({ ...d, [key]: value }))
    setResult(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setResult(null)

    const photos = photosText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 12)

    try {
      const res = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, photos }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setResult({
          ok: false,
          message: j?.error ?? `保存に失敗しました（${res.status}）`,
        })
      } else {
        setResult({ ok: true })
        router.refresh()
      }
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "通信エラー",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 会社名（read-only） */}
      <div className="rounded border bg-white p-5 shadow-sm">
        <label className="block text-xs font-medium text-gray-500">
          企業名
        </label>
        <p className="mt-1 text-base font-semibold text-gray-900">
          {companyName}
        </p>
        {lastContentUpdatedAt && (
          <p className="mt-2 text-xs text-gray-400">
            最終更新: {lastContentUpdatedAt.toLocaleString("ja-JP")}
          </p>
        )}
      </div>

      {/* キャッチコピー */}
      <section className="rounded border bg-white p-5 shadow-sm space-y-3">
        <h2 className="font-bold text-gray-900">キャッチコピー</h2>
        <p className="text-xs text-gray-500">
          求人詳細ページのタイトル下に表示される 1 行コピー。最大 200 文字。
        </p>
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          maxLength={200}
          placeholder="技術も、家族の笑顔も。どちらも諦めないのが、弊社のスタイルです。"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </section>

      {/* リッチコンテンツ */}
      <section className="rounded border bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900">求人ページの本文</h2>

        <TextAreaField
          label="こんなトコロがすごい！"
          hint="自社の魅力ポイント。技術力 / 福利厚生 / 社風 など。"
          value={data.pitchHighlights}
          onChange={(v) => update("pitchHighlights", v)}
        />
        <TextAreaField
          label="こんな人が向いています！"
          hint="求める人物像。経験 / 性格 / キャリア志向 など。"
          value={data.idealCandidate}
          onChange={(v) => update("idealCandidate", v)}
        />
        <TextAreaField
          label="働いている社員の声"
          hint="実際に働いている社員のリアルな声。複数の声をまとめて OK。"
          value={data.employeeVoice}
          onChange={(v) => update("employeeVoice", v)}
        />
      </section>

      {/* 写真ギャラリー */}
      <section className="rounded border bg-white p-5 shadow-sm space-y-3">
        <h2 className="font-bold text-gray-900">写真ギャラリー</h2>
        <p className="text-xs text-gray-500">
          写真の URL を 1 行 1 つで入力。最大 12 枚。Supabase Storage や
          外部公開 URL を貼ってください。
        </p>
        <textarea
          value={photosText}
          onChange={(e) => setPhotosText(e.target.value)}
          rows={6}
          placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </section>

      {/* SNS */}
      <section className="rounded border bg-white p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-900">公式 SNS</h2>
        <p className="text-xs text-gray-500">
          登録すると求人詳細ページ末尾にアイコンで表示されます。求人一覧のソート評価にも影響します。
        </p>
        <UrlField
          label="Instagram"
          placeholder="https://www.instagram.com/yourcompany"
          value={data.instagramUrl}
          onChange={(v) => update("instagramUrl", v)}
        />
        <UrlField
          label="TikTok"
          placeholder="https://www.tiktok.com/@yourcompany"
          value={data.tiktokUrl}
          onChange={(v) => update("tiktokUrl", v)}
        />
        <UrlField
          label="Facebook"
          placeholder="https://www.facebook.com/yourcompany"
          value={data.facebookUrl}
          onChange={(v) => update("facebookUrl", v)}
        />
        <UrlField
          label="X (Twitter)"
          placeholder="https://x.com/yourcompany"
          value={data.xUrl}
          onChange={(v) => update("xUrl", v)}
        />
        <UrlField
          label="YouTube"
          placeholder="https://www.youtube.com/@yourcompany"
          value={data.youtubeUrl}
          onChange={(v) => update("youtubeUrl", v)}
        />
      </section>

      {/* 結果メッセージ */}
      {result?.ok === true && (
        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <Check className="h-4 w-4" />
          保存しました
        </div>
      )}
      {result?.ok === false && (
        <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {result.message}
        </div>
      )}

      {/* 保存ボタン（sticky） */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-white sm:bg-transparent border-t sm:border-0 p-3 sm:p-0">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          保存する
        </button>
      </div>
    </form>
  )
}

function TextAreaField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="mt-1.5 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
      <p className="text-xs text-gray-400 mt-1 text-right">
        {value.length} 文字
      </p>
    </div>
  )
}

function UrlField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  )
}
