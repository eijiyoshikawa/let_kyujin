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
  Smartphone,
  HeadphonesIcon,
  Newspaper,
  Bell,
  User,
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

  // Latest magazine articles from DB
  const magazineArticles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true, category: true, imageUrl: true },
  }).catch(() => [])

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: categoryCounts.find((c) => c.category === cat.key)?._count ?? 0,
  }))

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-blue-700">
        <Image
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=600&fit=crop"
          alt=""
          fill
          priority
          className="object-cover opacity-10"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-center text-sm text-blue-200">建築・土木・設備・解体に特化</p>
          <h1 className="mt-2 text-center text-3xl sm:text-4xl font-bold text-white">
            建設求人ポータル
          </h1>

          <form action="/jobs" method="GET" className="relative z-10 mx-auto mt-8 max-w-3xl rounded-lg bg-white p-3 shadow-lg -mb-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="sr-only" htmlFor="hero-category">職種</label>
                <select id="hero-category" name="category" className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">職種を選択</option>
                  {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="sr-only" htmlFor="hero-prefecture">勤務地</label>
                <select id="hero-prefecture" name="prefecture" className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">勤務地を選択</option>
                  {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                <Search className="h-4 w-4" />
                検索
              </button>
            </div>
          </form>
        </div>
      </section>

      <LogoSlider />

      {/* Categories */}
      <section className="bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-gray-900">職種から探す</h2>
          <AnimateOnScroll animation="stagger">
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {categoriesWithCounts.map((cat) => {
                const Icon = cat.icon
                return (
                  <Link key={cat.key} href={`/jobs?category=${cat.key}`} className="flex items-center gap-3 rounded-lg border px-4 py-3 hover:bg-gray-50 hover:border-blue-300 transition">
                    <Icon className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">{cat.label}</span>
                      <span className="ml-1.5 text-xs text-gray-400">({cat.count.toLocaleString()})</span>
                      <p className="text-xs text-gray-400">{cat.sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                  </Link>
                )
              })}
            </div>
          </AnimateOnScroll>
          <div className="mt-4 flex gap-2 justify-center">
            <Link href="/register" className="rounded bg-blue-600 px-6 py-2 text-xs font-medium text-white hover:bg-blue-700">
              会員登録（無料）
            </Link>
            <Link href="/login" className="rounded border border-gray-300 px-6 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100">
              ログイン
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Areas */}
      <section className="border-t bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            エリアから探す
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {popularAreas.map((area) => (
              <Link key={area.slug} href={`/jobs?prefecture=${area.pref}`} className="rounded-lg border bg-white px-3 py-2.5 text-center text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 transition">
                {area.pref}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Magazine */}
      {magazineArticles.length > 0 && (
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
              <Newspaper className="h-5 w-5 text-blue-600" />
              マガジン
            </h2>
            <Link href="/journal" className="text-sm text-blue-600 hover:underline">一覧を見る</Link>
          </div>
          <AnimateOnScroll animation="stagger">
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {magazineArticles.map((a) => (
                <Link key={a.slug} href={`/journal/${a.slug}`} className="group overflow-hidden rounded-lg border bg-white">
                  {a.imageUrl && (
                    <div className="aspect-video relative overflow-hidden">
                      <img src={a.imageUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-300" />
                    </div>
                  )}
                  <div className="p-3">
                    <span className="text-[10px] font-medium text-blue-600">{a.category}</span>
                    <p className="mt-0.5 text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">{a.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>
      )}

      {/* Service Features */}
      <section className="border-t bg-blue-50 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-lg font-bold text-gray-900">当サイトの特徴</h2>
          <div className="mt-6 space-y-4">
            <div className="flex gap-4 rounded-lg bg-white p-4 border">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-600 text-white text-sm font-bold">01</div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">建設業界に特化した求人のみ掲載</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">建築・土木・設備・解体の専門職に絞った求人を掲載しています。総合サイトでは見つけにくい現場の求人を効率的に探せます。</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-lg bg-white p-4 border">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-600 text-white text-sm font-bold">02</div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">希望条件に合った求人をお届け</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">会員登録で希望の職種・エリアを設定すると、条件に合った新着求人をお知らせします。</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-lg bg-white p-4 border">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-600 text-white text-sm font-bold">03</div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">転職相談に対応</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">建設業界の経験があるスタッフが、求人選びや面接対策のご相談に応じます。お気軽にお問い合わせください。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
            <Bell className="h-5 w-5 text-blue-600" />
            お知らせ
          </h2>
          <div className="mt-3 divide-y rounded-lg border">
            {newsItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="shrink-0 text-xs text-gray-400 tabular-nums">{item.date}</span>
                <span className="shrink-0 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">{item.tag}</span>
                <span className="text-gray-700">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {totalJobs > 0 && (
        <section className="border-t bg-blue-600 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-blue-200">現在の掲載求人数</p>
            <p className="mt-1 text-4xl font-bold text-white">{totalJobs.toLocaleString()}<span className="text-lg ml-1">件</span></p>
          </div>
        </section>
      )}

      {/* Employer CTA */}
      <section className="bg-gray-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">採用担当の方へ</h2>
              <p className="mt-1 text-sm text-gray-400">掲載無料・成果報酬型の求人掲載サービス</p>
            </div>
            <div className="flex gap-3">
              <Link href="/for-employers" className="flex items-center gap-1.5 rounded bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                詳細を見る <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/company/register" className="rounded border border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800">
                企業登録
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
