import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/db"
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
  ChevronRight,
  MapPin,
  Users,
  Smartphone,
  HeadphonesIcon,
  Newspaper,
  MessageSquareQuote,
  Bell,
  User,
} from "lucide-react"
import { PREFECTURES } from "@/lib/constants"

const categories = [
  { key: "construction", label: "建築・躯体工事", icon: HardHat, count: null, sub: "鳶職・型枠・鉄筋・大工" },
  { key: "civil", label: "土木工事", icon: Shovel, count: null, sub: "土木作業員・重機オペ・舗装" },
  { key: "electrical", label: "電気・設備工事", icon: Wrench, count: null, sub: "電気工事士・配管・空調" },
  { key: "interior", label: "内装・仕上げ工事", icon: Hammer, count: null, sub: "クロス・床・塗装・左官" },
  { key: "demolition", label: "解体・産廃", icon: Building2, count: null, sub: "解体工・産業廃棄物処理" },
  { key: "driver", label: "ドライバー・重機", icon: Truck, count: null, sub: "ダンプ・トレーラー・重機運転" },
  { key: "management", label: "施工管理", icon: ClipboardCheck, count: null, sub: "現場監督・工程管理" },
  { key: "survey", label: "測量・設計", icon: Ruler, count: null, sub: "測量士・CADオペ" },
]

const popularAreas = [
  { pref: "東京都", slug: "tokyo" },
  { pref: "大阪府", slug: "osaka" },
  { pref: "愛知県", slug: "aichi" },
  { pref: "神奈川県", slug: "kanagawa" },
  { pref: "福岡県", slug: "fukuoka" },
  { pref: "埼玉県", slug: "saitama" },
  { pref: "千葉県", slug: "chiba" },
  { pref: "北海道", slug: "hokkaido" },
  { pref: "兵庫県", slug: "hyogo" },
  { pref: "広島県", slug: "hiroshima" },
  { pref: "宮城県", slug: "miyagi" },
  { pref: "静岡県", slug: "shizuoka" },
]

const magazineArticles = [
  {
    slug: "construction-career-guide",
    title: "建設業界への転職ガイド — 職種・資格・年収を徹底解説",
    category: "転職ガイド",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  },
  {
    slug: "tobi-salary",
    title: "鳶職の年収はどれくらい？経験年数別の給与相場",
    category: "年収・給与",
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
  },
  {
    slug: "electrician-license",
    title: "電気工事士の資格取得ガイド — 試験内容と勉強法",
    category: "資格",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
  },
]

const testimonials = [
  {
    name: "田中 健太",
    age: 32,
    from: "飲食業",
    to: "鳶職人",
    comment: "未経験から始めましたが、先輩が丁寧に教えてくれて3年で一人前になれました。年収も前職より150万円アップしました。",
  },
  {
    name: "佐藤 雅之",
    age: 28,
    from: "工場作業員",
    to: "電気工事士",
    comment: "資格取得のサポートが手厚く、働きながら電気工事士の資格を取得できました。安定した職場環境に満足しています。",
  },
  {
    name: "鈴木 翔太",
    age: 35,
    from: "営業職",
    to: "施工管理",
    comment: "コミュニケーション能力が活かせる施工管理に転職。やりがいも給与も前職以上で、転職して正解でした。",
  },
]

const newsItems = [
  { date: "2026/04/01", title: "建設求人ポータル — サービスリニューアルのお知らせ" },
  { date: "2026/03/15", title: "2026年度 建設業界の採用動向レポートを公開しました" },
  { date: "2026/03/01", title: "ハローワーク求人連携機能をアップデートしました" },
  { date: "2026/02/20", title: "建設求人マガジンに新カテゴリ「業界知識」を追加" },
]

export default async function HomePage() {
  const categoryCounts = await prisma.job.groupBy({
    by: ["category"],
    where: { status: "active" },
    _count: true,
  }).catch(() => [])

  const totalJobs = categoryCounts.reduce((sum, c) => sum + c._count, 0)

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: categoryCounts.find((c) => c.category === cat.key)?._count ?? 0,
  }))

  return (
    <div>
      {/* Hero Section - Photo background with blue overlay */}
      <section className="relative overflow-hidden bg-blue-700">
        <Image
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=600&fit=crop"
          alt=""
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                建設求人ポータル
              </h1>
              <p className="mt-2 text-lg text-blue-100">
                建築・土木・設備・解体の求人サイト
              </p>
            </div>
            <div className="hidden lg:block w-64 h-48 relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop"
                alt="建設作業員"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Search Form */}
          <form
            action="/jobs"
            method="GET"
            className="relative z-10 mx-auto mt-8 max-w-3xl rounded-lg bg-white p-3 shadow-lg -mb-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <select
                  name="category"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700"
                >
                  <option value="">職種を選択</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  name="prefecture"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700"
                >
                  <option value="">勤務地を選択</option>
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Search className="h-4 w-4" />
                求人検索
              </button>
            </div>
            <div className="mt-2 text-center">
              <Link
                href="/register"
                className="text-xs text-blue-600 hover:underline"
              >
                詳細条件を設定して探す →
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* Category List - Vertical list style like x-work.jp */}
      <section className="bg-white pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <HardHat className="h-5 w-5 text-blue-600" />
            人気の求人特集
          </h2>
          <div className="mt-4 divide-y divide-gray-100">
            {categoriesWithCounts.map((cat, i) => {
              const Icon = cat.icon
              return (
                <div key={cat.key}>
                  <Link
                    href={`/jobs?category=${cat.key}`}
                    className="flex items-center gap-4 py-3.5 hover:bg-gray-50 transition rounded-md px-2 -mx-2"
                  >
                    <Icon className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-gray-900">
                          {cat.label}
                        </span>
                        <span className="text-sm text-blue-600">
                          ({cat.count.toLocaleString()})
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                  </Link>
                  {/* Insert CTA after 3rd item */}
                  {i === 2 && (
                    <div className="flex gap-3 justify-center py-4">
                      <Link
                        href="/register"
                        className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <User className="h-4 w-4" />
                        会員登録する
                      </Link>
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        ログイン
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Areas - Prefecture × Category cross links */}
      <section className="border-t bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            注目職種を人気エリアから探す
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {popularAreas.map((area) => (
              <div
                key={area.slug}
                className="rounded-lg border bg-white p-3 hover:shadow-md transition"
              >
                <Link
                  href={`/jobs?prefecture=${area.pref}`}
                  className="text-sm font-bold text-gray-900 hover:text-blue-600"
                >
                  {area.pref}
                </Link>
                <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  {[
                    { key: "construction", label: "建築" },
                    { key: "civil", label: "土木" },
                    { key: "electrical", label: "電気" },
                    { key: "management", label: "施工管理" },
                  ].map((cat) => (
                    <Link
                      key={cat.key}
                      href={`/${area.pref}/${cat.key}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Magazine Section - Blue header bar + image cards */}
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-t-lg bg-blue-600 px-4 py-2.5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-white font-bold">
              <Newspaper className="h-5 w-5" />
              建設求人マガジン
            </h2>
            <Link
              href="/journal"
              className="flex items-center gap-1 text-sm text-blue-100 hover:text-white"
            >
              もっと見る
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-b-lg border border-t-0 p-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {magazineArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/journal/${article.slug}`}
                  className="group rounded-lg border bg-white overflow-hidden hover:shadow-md transition"
                >
                  <div className="aspect-video relative">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-2 left-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                      {article.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - 転職体験談 */}
      <section className="border-t bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <MessageSquareQuote className="h-5 w-5 text-blue-600" />
            転職体験談
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {t.name}（{t.age}歳）
                    </p>
                    <p className="text-xs text-gray-500">
                      {t.from} → {t.to}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {t.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Merits Section */}
      <section className="border-t bg-blue-50 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            建設求人ポータルを活用する<span className="text-blue-600">メリット</span>と<span className="text-blue-600">3つの特徴</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            建設求人ポータルは、建設業界で働く方を応援する求人サービスです。
          </p>

          <div className="mt-8 space-y-6">
            <MeritCard
              number="01"
              title="「建設業界」特化の求人サービス"
              description="建築・土木・設備・解体など建設業界に特化。他の総合求人サイトでは見つからない専門職の求人が豊富に掲載されています。"
              icon={<HardHat className="h-6 w-6" />}
            />
            <MeritCard
              number="02"
              title={<>おすすめ求人が受け取れるため<span className="text-blue-600">スキマ時間</span>に求人を見つけられる</>}
              description="会員登録すると、あなたの希望条件にマッチした求人情報をお届け。忙しい現場仕事の合間でも効率的に転職活動ができます。"
              icon={<Smartphone className="h-6 w-6" />}
            />
            <MeritCard
              number="03"
              title={<>登録すれば<span className="text-blue-600">転職相談サポート</span>も受けられる</>}
              description="建設業界に詳しい専任スタッフが、資格取得から面接対策までサポート。安心して転職活動を進められます。"
              icon={<HeadphonesIcon className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* News / Announcements */}
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Bell className="h-5 w-5 text-blue-600" />
            お知らせ
          </h2>
          <div className="mt-4 divide-y divide-gray-100">
            {newsItems.map((item, i) => (
              <div key={i} className="flex gap-4 py-3 text-sm">
                <span className="shrink-0 text-gray-400 tabular-nums">{item.date}</span>
                <span className="text-gray-700">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalJobs.toLocaleString()}+</p>
              <p className="text-xs text-gray-500 mt-1">掲載求人数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">47</p>
              <p className="text-xs text-gray-500 mt-1">都道府県対応</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">無料</p>
              <p className="text-xs text-gray-500 mt-1">会員登録</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Employers */}
      <section className="border-t bg-gray-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                建設会社の採用担当者の方へ
              </h2>
              <p className="mt-1 text-gray-400">
                掲載無料・成果報酬型。採用が決まるまで費用はかかりません。
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/for-employers"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                詳しく見る
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/company/register"
                className="flex items-center gap-2 rounded-lg border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                企業登録
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MeritCard({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: React.ReactNode
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex gap-4 rounded-lg bg-white p-5 text-left shadow-sm border">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-blue-600">
        {icon}
      </div>
    </div>
  )
}
