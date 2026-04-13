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
  Newspaper,
  Bell,
  User,
  SlidersHorizontal,
  BookOpen,
  MessageCircle,
  Sparkles,
  Clock,
  HeadphonesIcon,
} from "lucide-react"
import { PREFECTURES } from "@/lib/constants"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { LogoSlider } from "@/components/logo-slider"

const categories = [
  { key: "construction", label: "建築・躯体工事", icon: HardHat, sub: "鳶職・型枠・鉄筋・大工" },
  { key: "civil", label: "土木工事", icon: Shovel, sub: "土木作業員・重機オペ・舗装" },
  { key: "electrical", label: "電気・設備工事", icon: Wrench, sub: "電気工事士・配管・空調" },
  { key: "interior", label: "内装・仕上げ工事", icon: Hammer, sub: "クロス・床・塗装・左官" },
  { key: "demolition", label: "解体・産廃", icon: Building2, sub: "解体工・産業廃棄物処理" },
  { key: "driver", label: "ドライバー・重機", icon: Truck, sub: "ダンプ・トレーラー・重機運転" },
  { key: "management", label: "施工管理", icon: ClipboardCheck, sub: "現場監督・工程管理" },
  { key: "survey", label: "測量・設計", icon: Ruler, sub: "測量士・CADオペ" },
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

const newsItems = [
  { date: "2026.04.01", title: "サイトデザインをリニューアルしました", tag: "お知らせ" },
  { date: "2026.03.15", title: "求人掲載数が5,000件を突破しました", tag: "実績" },
  { date: "2026.03.01", title: "ハローワーク求人の掲載を開始しました", tag: "機能追加" },
]

export default async function HomePage() {
  const categoryCounts = await prisma.job.groupBy({
    by: ["category"],
    where: { status: "active" },
    _count: true,
  }).catch(() => [])

  const totalJobs = categoryCounts.reduce((sum, c) => sum + c._count, 0)

  const [magazineArticles, interviewArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: "published", category: { not: "interview" } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, category: true, imageUrl: true },
    }).catch(() => []),
    prisma.article.findMany({
      where: { status: "published", category: "interview" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, category: true, imageUrl: true },
    }).catch(() => []),
  ])

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: categoryCounts.find((c) => c.category === cat.key)?._count ?? 0,
  }))

  return (
    <div>
      {/* Hero + Search */}
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-700">
        <Image
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=600&fit=crop"
          alt=""
          fill
          priority
          className="object-cover opacity-15"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-center gap-2 text-primary-100 text-sm">
            <HardHat className="h-4 w-4" />
            <span>建築・土木・設備・解体に特化</span>
          </div>
          <h1 className="mt-2 text-center text-3xl sm:text-4xl font-bold text-white">
            建設求人ポータル
          </h1>

          <form action="/jobs" method="GET" className="relative z-10 mx-auto mt-8 max-w-3xl rounded-xl bg-white p-4 shadow-lg">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="sr-only" htmlFor="hero-category">職種</label>
                <select id="hero-category" name="category" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="">職種を選択</option>
                  {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <span className="hidden sm:block text-gray-300">×</span>
              <div className="flex-1">
                <label className="sr-only" htmlFor="hero-prefecture">勤務地</label>
                <select id="hero-prefecture" name="prefecture" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="">勤務地を選択</option>
                  {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition">
                <Search className="h-4 w-4" />
                求人検索
              </button>
            </div>
            <div className="mt-2 text-center">
              <Link href="/jobs" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition">
                <SlidersHorizontal className="h-3 w-3" />
                条件を指定して探す
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* Category List - vertical style like reference */}
      <section className="bg-white pt-8 pb-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="stagger">
            <div className="divide-y rounded-xl border overflow-hidden">
              {categoriesWithCounts.map((cat) => {
                const Icon = cat.icon
                return (
                  <Link
                    key={cat.key}
                    href={`/jobs?category=${cat.key}`}
                    className="flex items-center gap-4 px-4 py-3.5 hover:bg-primary-50 transition group"
                  >
                    <Icon className="h-5 w-5 text-primary-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{cat.label}</span>
                        <span className="text-xs font-medium text-primary-600">({cat.count.toLocaleString()})</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{cat.sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 shrink-0 transition" />
                  </Link>
                )
              })}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Popular Areas */}
      <section className="border-t bg-warm-50 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-1.5 text-base font-bold text-gray-900">
            <MapPin className="h-4 w-4 text-primary-500" />
            エリアから探す
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {popularAreas.map((area) => (
              <Link key={area.slug} href={`/jobs?prefecture=${area.pref}`} className="rounded-xl border bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-600 transition">
                {area.pref}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LogoSlider />

      {/* Magazine + Interview - 2 column layout like reference */}
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Magazine */}
            <div>
              <div className="flex items-center gap-2 border-b border-primary-500 pb-2">
                <BookOpen className="h-4 w-4 text-primary-500" />
                <h2 className="text-sm font-bold text-gray-900">建設求人ポータル・マガジン</h2>
              </div>
              <div className="mt-3 space-y-3">
                {magazineArticles.map((a) => (
                  <Link key={a.slug} href={`/journal/${a.slug}`} className="group flex gap-3 items-start">
                    {a.imageUrl && (
                      <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden">
                        <img src={a.imageUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition leading-snug">{a.title}</p>
                      <span className="mt-1 inline-block text-[10px] font-medium text-primary-600">{a.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Interview / 転職体験談 */}
            <div>
              <div className="flex items-center gap-2 border-b border-primary-500 pb-2">
                <MessageCircle className="h-4 w-4 text-primary-500" />
                <h2 className="text-sm font-bold text-gray-900">転職体験談</h2>
              </div>
              <div className="mt-3 space-y-3">
                {interviewArticles.length > 0 ? (
                  interviewArticles.map((a) => (
                    <Link key={a.slug} href={`/journal/${a.slug}`} className="group flex gap-3 items-start">
                      {a.imageUrl && (
                        <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden">
                          <img src={a.imageUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition leading-snug">{a.title}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  magazineArticles.slice(0, 3).map((a) => (
                    <Link key={`int-${a.slug}`} href={`/journal/${a.slug}`} className="group flex gap-3 items-start">
                      {a.imageUrl && (
                        <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden">
                          <img src={a.imageUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition leading-snug">{a.title}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* CTA buttons + Magazine link */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <Link href="/register" className="flex items-center gap-1.5 rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600 shadow-sm transition">
                <User className="h-4 w-4" />
                会員登録する
              </Link>
              <Link href="/login" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 transition">
                ログイン
              </Link>
            </div>
            <Link href="/journal" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition">
              マガジンをもっと見る <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Features - "メリットと3つの特徴" */}
      <section className="border-t bg-warm-100 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-lg font-bold text-gray-900">
            建設求人ポータルを活用する<span className="text-primary-600">メリット</span>と3つの特徴
          </h2>
          <p className="mt-2 text-center text-xs text-gray-500">
            建設業界に特化した求人サイトだからこそ、あなたにぴったりの仕事が見つかります。
          </p>
          <div className="mt-8 space-y-5">
            <AnimateOnScroll>
              <div className="rounded-xl bg-white p-5 border shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-primary-500">01</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      「建築・土木・設備・解体」特化の<span className="text-primary-600">求人サイト</span>
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                      建設業界の専門職に絞った求人を掲載しています。総合サイトでは見つけにくい現場の求人を効率的に探せます。ハローワーク求人も掲載中。
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll>
              <div className="rounded-xl bg-white p-5 border shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-primary-500">02</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      おすすめの求人が受け取れるため<span className="text-primary-600">スキマ時間</span>に求人を見つけられる
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                      会員登録で希望の職種・エリアを設定すると、条件に合った新着求人をお知らせします。忙しい方でも効率的に転職活動ができます。
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll>
              <div className="rounded-xl bg-white p-5 border shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-primary-500">03</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      登録すれば<span className="text-primary-600">転職サポート</span>も受けられる
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                      建設業界の経験があるスタッフが、求人選びや面接対策のご相談に応じます。お気軽にお問い合わせください。
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-1.5 text-base font-bold text-gray-900">
            <Bell className="h-4 w-4 text-primary-500" />
            お知らせ
          </h2>
          <div className="mt-3 divide-y">
            {newsItems.map((item, i) => (
              <div key={i} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs text-gray-400 tabular-nums">{item.date}</span>
                  <span className="shrink-0 rounded bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-600">{item.tag}</span>
                </div>
                <span className="text-gray-700">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {totalJobs > 0 && (
        <section className="border-t bg-gradient-to-r from-primary-500 to-primary-600 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-primary-100">現在の掲載求人数</p>
            <p className="mt-1 text-4xl font-bold text-white">{totalJobs.toLocaleString()}<span className="text-lg ml-1">件</span></p>
          </div>
        </section>
      )}

      {/* Employer CTA */}
      <section className="bg-stone-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">採用担当の方へ</h2>
              <p className="mt-1 text-sm text-gray-400">掲載無料・成果報酬型の求人掲載サービス</p>
            </div>
            <div className="flex gap-3">
              <Link href="/for-employers" className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition">
                詳細を見る <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/company/register" className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-stone-800 transition">
                企業登録
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
