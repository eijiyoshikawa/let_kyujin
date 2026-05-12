"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  Save,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Trash2,
  Plus,
  Sparkles,
  Megaphone,
  HardHat,
  ClipboardCheck,
  MessageSquareQuote,
  CircleDashed,
  CircleCheck,
  Camera,
} from "lucide-react"
import { computeScoreBreakdown } from "@/lib/ranking"
import {
  templatesForField,
  type ProfileTemplate,
  type TemplateField,
} from "@/lib/profile-templates"

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

// テンプレート絞り込み用カテゴリ。Job カテゴリと同じ値を使用。
const TEMPLATE_CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "", label: "全業種共通" },
  { value: "construction", label: "建築・躯体" },
  { value: "civil", label: "土木" },
  { value: "electrical", label: "電気・設備" },
  { value: "interior", label: "内装・仕上げ" },
  { value: "demolition", label: "解体・産廃" },
  { value: "driver", label: "ドライバー" },
  { value: "management", label: "施工管理" },
  { value: "survey", label: "測量・設計" },
]

const PHOTO_MAX = 12

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
  const [templateCategory, setTemplateCategory] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<
    null | { ok: true } | { ok: false; message: string }
  >(null)

  // リアルタイム スコア計算
  const breakdown = useMemo(
    () =>
      computeScoreBreakdown(
        {
          ...data,
          tagline: data.tagline || null,
          pitchHighlights: data.pitchHighlights || null,
          idealCandidate: data.idealCandidate || null,
          employeeVoice: data.employeeVoice || null,
          instagramUrl: data.instagramUrl || null,
          tiktokUrl: data.tiktokUrl || null,
          facebookUrl: data.facebookUrl || null,
          xUrl: data.xUrl || null,
          youtubeUrl: data.youtubeUrl || null,
          lastContentUpdatedAt,
        },
        new Date()
      ),
    [data, lastContentUpdatedAt]
  )

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((d) => ({ ...d, [key]: value }))
    setResult(null)
  }

  function applyTemplate(field: TemplateField, text: string) {
    setData((d) => ({ ...d, [field]: text }))
    setResult(null)
  }

  function addPhoto() {
    if (data.photos.length >= PHOTO_MAX) return
    setData((d) => ({ ...d, photos: [...d.photos, ""] }))
  }

  function updatePhoto(idx: number, value: string) {
    setData((d) => ({
      ...d,
      photos: d.photos.map((p, i) => (i === idx ? value : p)),
    }))
    setResult(null)
  }

  function removePhoto(idx: number) {
    setData((d) => ({ ...d, photos: d.photos.filter((_, i) => i !== idx) }))
    setResult(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setResult(null)
    try {
      const photos = data.photos
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, PHOTO_MAX)
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
      {/* ヘッダ: 会社名 + スコア可視化 ====================================== */}
      <section className="accent-t border bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold text-primary-600 tracking-wide">企業プロフィール</p>
            <h2 className="mt-1 text-xl font-extrabold text-gray-900">{companyName}</h2>
            {lastContentUpdatedAt && (
              <p className="mt-1 text-xs text-gray-400">
                最終更新: {lastContentUpdatedAt.toLocaleString("ja-JP")}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-bold text-gray-500 tracking-wide">入力スコア</p>
            <p className="text-2xl font-black text-primary-600 tabular-nums leading-tight">
              {breakdown.totalScore}
              <span className="text-sm text-gray-400 font-normal"> / {breakdown.maxScore}</span>
            </p>
          </div>
        </div>

        {/* スコアバー */}
        <div className="mt-4 h-3 bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-yellow-500 via-primary-500 to-primary-700 transition-all duration-300"
            style={{ width: `${Math.round(breakdown.ratio * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          {Math.round(breakdown.ratio * 100)}% 充実 / 求人一覧の表示順位に直接影響します
        </p>

        {/* チェックリスト */}
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {breakdown.items.map((item) => (
            <li
              key={item.id}
              className={`flex items-start gap-2 border p-2.5 ${
                item.done
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {item.done ? (
                <CircleCheck className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
              ) : (
                <CircleDashed className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-xs leading-tight">{item.label}</p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{item.hint}</p>
              </div>
              <span className="text-[10px] font-bold text-primary-600 tabular-nums shrink-0">
                {item.current}/{item.max}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* テンプレートの業種選択 ============================================= */}
      <section className="border bg-warm-100 p-4">
        <label className="block text-xs font-bold text-gray-700">
          <Sparkles className="inline h-3.5 w-3.5 mr-1 text-primary-500" />
          テンプレートの業種を選ぶ
        </label>
        <p className="text-[11px] text-gray-500 mt-0.5">
          各項目右上の「テンプレ」ボタンから業種に合った文面を 1 クリックで挿入できます。
        </p>
        <select
          value={templateCategory}
          onChange={(e) => setTemplateCategory(e.target.value)}
          className="mt-2 w-full sm:w-64 border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {TEMPLATE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </section>

      {/* キャッチコピー ===================================================== */}
      <FieldSection
        icon={<Megaphone className="h-5 w-5 text-primary-500" />}
        title="キャッチコピー"
        hint="求人詳細ページのタイトル下に表示される 1 行コピー。最大 200 文字。"
        templateField="tagline"
        templateCategory={templateCategory}
        onApplyTemplate={(t) => applyTemplate("tagline", t)}
      >
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => update("tagline", e.target.value)}
          maxLength={200}
          placeholder="技術も、家族の笑顔も。どちらも諦めないのが、弊社のスタイル。"
          className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <CharCount value={data.tagline} max={200} />
      </FieldSection>

      {/* こんなトコロがすごい！ ============================================= */}
      <FieldSection
        icon={<HardHat className="h-5 w-5 text-primary-500" />}
        title="こんなトコロがすごい！"
        hint="自社の魅力ポイント。技術力 / 福利厚生 / 社風 など、箇条書きでもOK。"
        templateField="pitchHighlights"
        templateCategory={templateCategory}
        onApplyTemplate={(t) => applyTemplate("pitchHighlights", t)}
      >
        <textarea
          value={data.pitchHighlights}
          onChange={(e) => update("pitchHighlights", e.target.value)}
          rows={7}
          className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <CharCount value={data.pitchHighlights} />
      </FieldSection>

      {/* こんな人が向いています！ =========================================== */}
      <FieldSection
        icon={<ClipboardCheck className="h-5 w-5 text-primary-500" />}
        title="こんな人が向いています！"
        hint="求める人物像。経験 / 性格 / キャリア志向 など。"
        templateField="idealCandidate"
        templateCategory={templateCategory}
        onApplyTemplate={(t) => applyTemplate("idealCandidate", t)}
      >
        <textarea
          value={data.idealCandidate}
          onChange={(e) => update("idealCandidate", e.target.value)}
          rows={6}
          className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <CharCount value={data.idealCandidate} />
      </FieldSection>

      {/* 働いている社員の声 ================================================= */}
      <FieldSection
        icon={<MessageSquareQuote className="h-5 w-5 text-primary-500" />}
        title="働いている社員の声"
        hint="実際の社員のリアルな声。複数まとめてOK。「（30 代男性 / 入社 3 年）」のような属性付記推奨。"
        templateField="employeeVoice"
        templateCategory={templateCategory}
        onApplyTemplate={(t) => applyTemplate("employeeVoice", t)}
      >
        <textarea
          value={data.employeeVoice}
          onChange={(e) => update("employeeVoice", e.target.value)}
          rows={7}
          className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <CharCount value={data.employeeVoice} />
      </FieldSection>

      {/* 写真ギャラリー ===================================================== */}
      <section className="accent-l border bg-white p-5 pl-6 shadow-sm space-y-4">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
              <Camera className="h-5 w-5 text-primary-500" />
              写真ギャラリー
              <span className="text-xs font-normal text-gray-500">
                {data.photos.length} / {PHOTO_MAX} 枚
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              現場写真や社内の様子を URL で登録。最大 {PHOTO_MAX} 枚。
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 mt-2 inline-block">
              <ImageIcon className="inline h-3 w-3 mr-1" />
              次回アップデートで「素材ライブラリから選ぶ」ボタンを追加予定（Unsplash 連携）
            </p>
          </div>
          <button
            type="button"
            onClick={addPhoto}
            disabled={data.photos.length >= PHOTO_MAX}
            className="press inline-flex items-center gap-1.5 border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" />
            URL を追加
          </button>
        </div>

        {data.photos.length === 0 ? (
          <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
            まだ写真が登録されていません。「URL を追加」から登録してください。
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.photos.map((url, idx) => (
              <li key={idx} className="border border-gray-200 bg-warm-50 p-2 flex gap-2">
                <div className="relative h-20 w-20 shrink-0 bg-gray-100 overflow-hidden border border-gray-200">
                  {url && /^https?:\/\//i.test(url) ? (
                    // 任意 URL を載せるためここでは next/image ではなく素 <img>
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updatePhoto(idx, e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-300 px-2 py-1 text-xs font-mono focus:border-primary-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="press inline-flex items-center gap-1 self-start text-[11px] text-red-600 hover:text-red-700"
                    aria-label={`写真 ${idx + 1} を削除`}
                  >
                    <Trash2 className="h-3 w-3" />
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* SNS ============================================================== */}
      <section className="accent-l border bg-white p-5 pl-6 shadow-sm space-y-3">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
          公式 SNS リンク
        </h3>
        <p className="text-xs text-gray-500">
          求人詳細ページ末尾にアイコンで表示されます。登録数が多いほど求人一覧で上位表示されます。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>
      </section>

      {/* 結果 + 保存ボタン =================================================== */}
      {result?.ok === true && (
        <div className="flex items-center gap-2 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <Check className="h-4 w-4" />
          保存しました
        </div>
      )}
      {result?.ok === false && (
        <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {result.message}
        </div>
      )}

      {/* sticky 保存ボタン */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-600">
            <span className="font-bold text-primary-600">
              {Math.round(breakdown.ratio * 100)}%
            </span>{" "}
            充実 / スコア{" "}
            <span className="font-bold text-primary-600">{breakdown.totalScore}</span> 点
          </p>
          <button
            type="submit"
            disabled={saving}
            className="press inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 px-6 py-2.5 text-sm font-extrabold text-white shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存する
          </button>
        </div>
      </div>

      {/* iOS Safari 用に下部余白 */}
      <div className="h-4" aria-hidden />
    </form>
  )
}

// ============================================================
// 下位コンポーネント
// ============================================================

function FieldSection({
  icon,
  title,
  hint,
  templateField,
  templateCategory,
  onApplyTemplate,
  children,
}: {
  icon: React.ReactNode
  title: string
  hint: string
  templateField: TemplateField
  templateCategory: string
  onApplyTemplate: (text: string) => void
  children: React.ReactNode
}) {
  const templates = useMemo(
    () => templatesForField(templateField, templateCategory || null),
    [templateField, templateCategory]
  )
  return (
    <section className="accent-l border bg-white p-5 pl-6 shadow-sm space-y-3">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
            {icon}
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{hint}</p>
        </div>
        <TemplatePicker
          templates={templates}
          onPick={onApplyTemplate}
          disabled={templates.length === 0}
        />
      </div>
      {children}
    </section>
  )
}

function TemplatePicker({
  templates,
  onPick,
  disabled,
}: {
  templates: ProfileTemplate[]
  onPick: (text: string) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  if (disabled) return null
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="press inline-flex items-center gap-1.5 border border-primary-300 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100"
      >
        <Sparkles className="h-3.5 w-3.5" />
        テンプレ ({templates.length})
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 w-72 border border-gray-200 bg-white shadow-xl">
          <p className="px-3 py-2 text-[10px] font-bold text-gray-500 border-b bg-warm-50 tracking-wider uppercase">
            テンプレートを選択（クリックで挿入 / 上書き）
          </p>
          <ul className="max-h-80 overflow-y-auto">
            {templates.map((t, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(t.text)
                    setOpen(false)
                  }}
                  className="press w-full text-left px-3 py-2 hover:bg-primary-50 border-b border-gray-100 last:border-0"
                >
                  <p className="text-xs font-bold text-gray-900">{t.label}</p>
                  <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">
                    {t.text.slice(0, 60)}
                    {t.text.length > 60 ? "…" : ""}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="press w-full px-3 py-1.5 text-xs text-gray-500 border-t hover:bg-gray-50"
          >
            閉じる
          </button>
        </div>
      )}
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
      <label className="block text-xs font-bold text-gray-700">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  )
}

function CharCount({ value, max }: { value: string; max?: number }) {
  return (
    <p className="text-[11px] text-gray-400 mt-1 text-right tabular-nums">
      {value.length.toLocaleString()}
      {max ? ` / ${max}` : ""} 文字
    </p>
  )
}
