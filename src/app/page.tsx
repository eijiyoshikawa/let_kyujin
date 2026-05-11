import Link from "next/link"
import { prisma } from "@/lib/db"
import { CONSTRUCTION_CATEGORY_VALUES } from "@/lib/categories"
import { publishedArticleFilter } from "@/lib/articles"
import {
  Search,
  HardHat,
  Hammer,
  Wrench,
  Truck,
  Building2,
  Shovel,
  ClipboardCheck,
  Ruler,
  ArrowRight,
  MapPin,
  Newspaper,
  Sparkles,
  MessageCircle,
  Banknote,
} from "lucide-react"
import { CATEGORY_LABELS } from "@/lib/article-categories"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ゲンバキャリア | 建築・土木・電気・内装の求人サイト",
  description:
    "20〜30 代の若手も活躍中。建築・土木・電気・内装・解体・ドライバー・施工管理・測量の求人を探せる建設業特化型求人サイト。LINE で気軽に応募。",
  alternates: { canonical: "/" },
}

// 競合に倣わない、若手向けの「直接職種から探す」グリッド。
// 8 カテゴリそれぞれの色とアイコンで視認性を担保。
const categories: Array<{
  key: string
  label: string
  sub: string
  icon: typeof HardHat
  bg: string
}> = [
  { key: "construction", label: "建築・躯体", sub: "鳶 / 型枠 / 鉄筋 / 大工", icon: HardHat, bg: "from-amber-400 to-amber-600" },
  { key: "civil", label: "土木", sub: "土工 / 重機オペ / 舗装", icon: Shovel, bg: "from-orange-400 to-orange-600" },
  { key: "electrical", label: "電気・設備", sub: "電工 / 配管 / 空調", icon: Wrench, bg: "from-blue-400 to-blue-600" },
  { key: "interior", label: "内装・仕上げ", sub: "クロス / 塗装 / 左官", icon: Hammer, bg: "from-emerald-400 to-emerald-600" },
  { key: "demolition", label: "解体・産廃", sub: "解体 / アスベスト", icon: Building2, bg: "from-stone-500 to-stone-700" },
  { key: "driver", label: "ドライバー・重機", sub: "ダンプ / トレーラー", icon: Truck, bg: "from-cyan-400 to-cyan-600" },
  { key: "management", label: "施工管理", sub: "現場監督 / 工程", icon: ClipboardCheck, bg: "from-indigo-400 to-indigo-600" },
  { key: "survey", label: "測量・設計", sub: "測量士 / CAD", icon: Ruler, bg: "from-purple-400 to-purple-600" },
]

const popularAreas = [
  { pref: "東京", slug: "tokyo" },
  { pref: "神奈川", slug: "kanagawa" },
  { pref: "埼玉", slug: "saitama" },
  { pref: "千葉", slug: "chiba" },
  { pref: "大阪", slug: "osaka" },
  { pref: "愛知", slug: "aichi" },
  { pref: "福岡", slug: "fukuoka" },
  { pref: "兵庫", slug: "hyogo" },
  { pref: "北海道", slug: "hokkaido" },
  { pref: "京都", slug: "kyoto" },
  { pref: "宮城", slug: "miyagi" },
  { pref: "広島", slug: "hiroshima" },
]

const benefitFeatures = [
  { icon: MessageCircle, label: "LINE で応募", desc: "履歴書なし、まずは気軽にメッセージ" },
  { icon: Sparkles, label: "未経験OK 多数", desc: "資格取得支援や寮完備の求人も豊富" },
  { icon: MapPin, label: "全国 47 都道府県", desc: "地元の現場で長く働ける求人を掲載" },
]

export default async function HomePage() {
  const baseConstructionFilter = {
    status: "active" as const,
    category: { in: [...CONSTRUCTION_CATEGORY_VALUES] },
  }

  const [
    categoryCounts,
    recommendedJobs,
    magazineArticles,
    interviewArticles,
  ] = await Promise.all([
    prisma.job
      .groupBy({
        by: ["category"],
        where: baseConstructionFilter,
        _count: true,
      })
      .catch(() => []),
    prisma.job
      .findMany({
        where: baseConstructionFilter,
        orderBy: [{ rankScore: "desc" }, { publishedAt: "desc" }],
        take: 6,
        select: {
          id: true,
          title: true,
          category: true,
          prefecture: true,
          city: true,
          salaryMin: true,
          salaryMax: true,
          salaryType: true,
          tags: true,
          company: { select: { name: true } },
        },
      })
      .catch(() => []),
    prisma.article
      .findMany({
        where: { ...publishedArticleFilter(), category: { not: "interview" } },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { slug: true, title: true, category: true, publishedAt: true },
      })
      .catch(() => []),
    prisma.article
      .findMany({
        where: { ...publishedArticleFilter(), category: "interview" },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { slug: true, title: true, publishedAt: true },
      })
      .catch(() => []),
  ])

  const totalJobs = categoryCounts.reduce((sum, c) => sum + (c._count ?? 0), 0)
  const categoriesWithCounts = categories.map((c) => ({
    ...c,
    count: categoryCounts.find((cc) => cc.category === c.key)?._count ?? 0,
  }))

  return (
    <div className="bg-white">
      {/* === Hero ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-orange-700 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {/* 斜め safety stripe */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.3)_40%,rgba(255,255,255,0.3)_60%,transparent_60%)] bg-[length:24px_24px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-bold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              20〜30 代の若手も活躍中
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              建設業の求人を、
              <br className="hidden sm:block" />
              <span className="text-yellow-200">スマホで気軽に探せる</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
              {totalJobs > 0 ? `${totalJobs.toLocaleString()}件の求人を掲載中。` : "全国の建設業求人を掲載中。"}
              履歴書なし、LINE で気軽に応募できます。
            </p>

            {/* 検索フォーム */}
            <form action="/jobs" className="mt-6">
              <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-lg p-2 shadow-lg">
                <div className="flex items-center gap-2 flex-1 px-3 py-2">
                  <Search className="h-5 w-5 text-primary-500 shrink-0" />
                  <input
                    type="text"
                    name="q"
                    placeholder="職種・キーワード（例: 鳶、施工管理）"
                    className="flex-1 min-w-0 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary-600 px-6 py-3 text-base font-bold text-white shadow hover:bg-primary-700 transition active:scale-[0.98]"
                >
                  <Search className="h-5 w-5" />
                  求人を探す
                </button>
              </div>
            </form>

            {/* ヒーロー直下のミニ機能訴求 */}
            <ul className="mt-6 flex flex-wrap gap-3 sm:gap-6">
              {benefitFeatures.map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex items-start gap-2">
                  <Icon className="h-5 w-5 text-yellow-200 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="text-[11px] text-white/80">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* === 職種から探す ==================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900">
            <span className="inline-block h-6 w-1.5 rounded-full bg-primary-500" />
            職種から探す
          </h2>
          <p className="text-xs text-gray-500">8 カテゴリ</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categoriesWithCounts.map(({ key, label, sub, icon: Icon, bg, count }) => (
            <Link
              key={key}
              href={`/jobs?category=${key}`}
              className="group rounded-lg border border-gray-200 overflow-hidden bg-white hover:border-primary-400 hover:shadow-md transition"
            >
              <div className={`h-20 sm:h-24 flex items-end p-3 bg-gradient-to-br ${bg}`}>
                <Icon className="h-7 w-7 text-white drop-shadow" />
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600">
                  {label}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-1">{sub}</p>
                <p className="mt-2 text-xs font-medium text-primary-600">
                  {count.toLocaleString()} 件
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* === おすすめ求人（rankScore で並び替えた最新求人）======================= */}
      {recommendedJobs.length > 0 && (
        <section className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-end justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900">
                <span className="inline-block h-6 w-1.5 rounded-full bg-primary-500" />
                おすすめ求人
              </h2>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                すべて見る
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="group rounded-lg border bg-white p-4 hover:border-primary-400 hover:shadow-sm transition"
                >
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600">
                    {job.title}
                  </h3>
                  {job.company && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                      <Building2 className="inline h-3 w-3 mr-1 text-gray-400" />
                      {job.company.name}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1 text-primary-700 font-bold">
                      <Banknote className="h-3.5 w-3.5" />
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {job.prefecture}
                      {job.city ? ` ${job.city}` : ""}
                    </span>
                  </div>
                  {job.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded border border-primary-200 bg-white px-1.5 py-0.5 text-[10px] text-primary-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === 都道府県から探す =================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          <span className="inline-block h-6 w-1.5 rounded-full bg-primary-500" />
          都道府県から探す
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {popularAreas.map((a) => (
            <Link
              key={a.slug}
              href={`/${a.slug}`}
              className="flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 transition"
            >
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              {a.pref}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          全 47 都道府県の求人ページがあります。
          <Link href="/jobs" className="ml-1 text-primary-600 hover:underline">
            検索ページから他県も見る →
          </Link>
        </p>
      </section>

      {/* === マガジン + 体験談 =================================================== */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* マガジン */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Newspaper className="h-5 w-5 text-primary-500" />
                  マガジン
                </h2>
                <Link
                  href="/journal"
                  className="text-sm text-primary-600 hover:underline"
                >
                  すべて見る →
                </Link>
              </div>
              <ul className="space-y-2">
                {magazineArticles.length === 0 ? (
                  <li className="text-sm text-gray-400">準備中です。</li>
                ) : (
                  magazineArticles.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/journal/${a.slug}`}
                        className="block rounded border border-gray-100 bg-white p-3 hover:border-primary-300 transition"
                      >
                        <p className="text-[10px] font-medium text-primary-600 uppercase">
                          {CATEGORY_LABELS[a.category] ?? a.category}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-gray-900 line-clamp-2">
                          {a.title}
                        </p>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* 転職体験談 */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <MessageCircle className="h-5 w-5 text-primary-500" />
                  転職体験談
                </h2>
                <Link
                  href="/journal?category=interview"
                  className="text-sm text-primary-600 hover:underline"
                >
                  すべて見る →
                </Link>
              </div>
              <ul className="space-y-2">
                {interviewArticles.length === 0 ? (
                  <li className="text-sm text-gray-400">準備中です。</li>
                ) : (
                  interviewArticles.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/journal/${a.slug}`}
                        className="block rounded border border-gray-100 bg-white p-3 hover:border-primary-300 transition"
                      >
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {a.title}
                        </p>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* === CTA ============================================================== */}
      <section className="bg-gradient-to-r from-primary-600 to-orange-700 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            気になる求人があれば、まずは LINE で話を聞く。
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/90">
            履歴書も会員登録も不要。匿名でも質問できます。
          </p>
          <Link
            href="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-base font-bold text-primary-700 shadow-lg hover:bg-yellow-50 transition active:scale-[0.98]"
          >
            <Search className="h-5 w-5" />
            求人を探してみる
          </Link>
        </div>
      </section>
    </div>
  )
}

function formatSalary(
  min: number | null,
  max: number | null,
  type: string | null
): string {
  if (!min) return "応相談"
  const unit = type === "hourly" ? "時給" : type === "annual" ? "年収" : "月給"
  const fmt = (n: number) =>
    n >= 10000 ? `${(n / 10000).toFixed(0)}万` : `${n.toLocaleString()}`
  if (min && max) return `${unit} ${fmt(min)}〜${fmt(max)}円`
  return `${unit} ${fmt(min)}円〜`
}
