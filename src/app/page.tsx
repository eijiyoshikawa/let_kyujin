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
  { key: "construction", label: "建築・躯体工事", icon: HardHat, sub: "鳶職・型枠・鉄筋・大工", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop" },
  { key: "civil", label: "土木工事", icon: Shovel, sub: "土木作業員・重機オペ・舗装", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop" },
  { key: "electrical", label: "電気・設備工事", icon: Wrench, sub: "電気工事士・配管・空調", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop" },
  { key: "interior", label: "内装・仕上げ工事", icon: Hammer, sub: "クロス・床・塗装・左官", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop" },
  { key: "demolition", label: "解体・産廃", icon: Building2, sub: "解体工・産業廃棄物処理", image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop" },
  { key: "driver", label: "ドライバー・重機", icon: Truck, sub: "ダンプ・トレーラー・重機運転", image: "https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=400&h=300&fit=crop" },
  { key: "management", label: "施工管理", icon: ClipboardCheck, sub: "現場監督・工程管理", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop" },
  { key: "survey", label: "測量・設計", icon: Ruler, sub: "測量士・CADオペ", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop" },
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

  // Sidebar data
  const [popularJobs, recommendedArticles] = await Promise.all([
    prisma.job.findMany({
      where: { status: "active" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, title: true, prefecture: true, category: true, viewCount: true },
    }).catch(() => []),
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { slug: true, title: true, category: true },
    }).catch(() => []),
  ])

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: categoryCounts.find((c) => c.category === cat.key)?._count ?? 0,
  }))

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "株式会社LET",
    url: "https://let-kyujin.vercel.app",
    logo: "https://let-kyujin.vercel.app/icon.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "大阪市中央区",
      addressRegion: "大阪府",
      addressCountry: "JP",
    },
    contactPoint: { "@type": "ContactPoint", telephone: "06-6786-8320", contactType: "customer service" },
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=800&fit=crop&q=80"
            alt="建設現場"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <p className="text-center text-sm text-white/80">建築・土木・設備・解体に特化した求人サイト</p>
          <h1 className="mt-2 text-center text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            建設求人ポータル
          </h1>
          <p className="mt-3 text-center text-sm text-white/70 max-w-lg mx-auto">
            あなたにぴったりの建設業界の仕事が見つかる
          </p>

          <form action="/jobs" method="GET" className="relative z-10 mx-auto mt-8 max-w-3xl rounded-lg bg-white p-4 shadow-xl">
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

      <LogoSlider />

      {/* === Main + Sidebar 2-column layout === */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">

            {/* ===== Main column ===== */}
            <div className="flex-1 min-w-0 space-y-10">

              {/* Category Cards - 4x2 grid on PC (3 cols in main) */}
              <div>
                <h2 className="text-lg font-bold text-gray-900">職種から探す</h2>
                <AnimateOnScroll animation="stagger">
                  <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {categoriesWithCounts.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <Link
                          key={cat.key}
                          href={`/jobs?category=${cat.key}`}
                          className="group overflow-hidden rounded-lg border bg-white hover:border-primary-400 transition"
                        >
                          <div className="aspect-[4/3] relative overflow-hidden">
                            <img
                              src={cat.image}
                              alt={cat.label}
                              loading="lazy"
                              className="h-full w-full object-cover group-hover:brightness-110 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <span className="text-xs font-bold text-white drop-shadow-sm">{cat.label}</span>
                              <span className="ml-1 text-[10px] font-medium text-primary-200">({cat.count.toLocaleString()})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2.5">
                            <Icon className="h-4 w-4 text-primary-500 shrink-0" />
                            <p className="text-[11px] text-gray-500 flex-1 truncate">{cat.sub}</p>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary-500 shrink-0 transition" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </AnimateOnScroll>
              </div>

              {/* Popular Areas */}
              <div>
                <h2 className="flex items-center gap-1.5 text-base font-bold text-gray-900">
                  <MapPin className="h-4 w-4 text-primary-500" />
                  エリアから探す
                </h2>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {popularAreas.map((area) => (
                    <Link key={area.slug} href={`/jobs?prefecture=${area.pref}`} className="rounded border bg-white px-3 py-2 text-center text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition">
                      {area.pref}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Magazine + Interview */}
              <div className="grid gap-8 md:grid-cols-2">
                {/* Magazine */}
                <div className="rounded-lg border bg-white overflow-hidden">
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <BookOpen className="h-4 w-4 text-primary-600" />
                    <h2 className="text-sm font-bold text-gray-900">マガジン</h2>
                    <Link href="/journal" className="ml-auto text-xs text-primary-600 hover:text-primary-700">一覧 →</Link>
                  </div>
                  <div className="divide-y">
                    {magazineArticles.map((a) => (
                      <Link key={a.slug} href={`/journal/${a.slug}`} className="group flex gap-3 items-center px-4 py-3 hover:bg-gray-50 transition">
                        {a.imageUrl && (
                          <div className="w-20 h-14 shrink-0 rounded overflow-hidden">
                            <img src={a.imageUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-primary-600 transition">{a.title}</p>
                          <span className="mt-1 inline-block text-[10px] text-gray-400">{a.category}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Interview / 転職体験談 */}
                <div className="rounded-lg border bg-white overflow-hidden">
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <MessageCircle className="h-4 w-4 text-stone-600" />
                    <h2 className="text-sm font-bold text-gray-900">転職体験談</h2>
                  </div>
                  <div className="divide-y">
                    {(interviewArticles.length > 0 ? interviewArticles : magazineArticles).map((a, i) => (
                      <Link key={`interview-${a.slug}-${i}`} href={`/journal/${a.slug}`} className="group flex gap-3 items-center px-4 py-3 hover:bg-gray-50 transition">
                        {a.imageUrl && (
                          <div className="w-20 h-14 shrink-0 rounded overflow-hidden">
                            <img src={a.imageUrl} alt={a.title} loading="lazy" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-primary-600 transition">{a.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-center gap-3">
                <Link href="/register" className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition">
                  会員登録（無料）
                </Link>
                <Link href="/login" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  ログイン
                </Link>
              </div>

              {/* Service Features */}
              <div>
                <h2 className="text-lg font-bold text-gray-900">当サイトの3つの特徴</h2>
                <div className="mt-4 space-y-3">
                  {[
                    { num: "01", title: "建設業界に特化した求人のみ掲載", desc: "建築・土木・設備・解体の専門職に絞った求人を掲載。総合サイトでは見つけにくい現場の求人を効率的に探せます。" },
                    { num: "02", title: "希望に合った求人をスキマ時間でチェック", desc: "会員登録で希望の職種・エリアを設定すると、条件に合った新着求人をお知らせします。" },
                    { num: "03", title: "転職サポートも無料で利用可能", desc: "建設業界経験のあるスタッフが、求人選びや面接対策のご相談に応じます。" },
                  ].map((f) => (
                    <div key={f.num} className="flex items-start gap-4 rounded-lg border bg-white p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white">{f.num}</span>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{f.title}</h3>
                        <p className="mt-1 text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* News */}
              <div>
                <h2 className="flex items-center gap-1.5 text-base font-bold text-gray-900">
                  <Bell className="h-4 w-4 text-primary-500" />
                  お知らせ
                </h2>
                <div className="mt-3 divide-y rounded-lg border bg-white">
                  {newsItems.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-xs text-gray-400 tabular-nums">{item.date}</span>
                        <span className="shrink-0 rounded border border-primary-200 bg-white px-2 py-0.5 text-[10px] font-medium text-primary-600">{item.tag}</span>
                      </div>
                      <span className="text-gray-700">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>{/* /Main column */}

            {/* ===== Sidebar (PC only) ===== */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20 space-y-6">

                {/* 人気求人ランキング */}
                <div className="rounded-lg border bg-white overflow-hidden">
                  <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
                    <Sparkles className="h-4 w-4 text-primary-600" />
                    <h3 className="text-sm font-bold text-gray-900">人気の求人</h3>
                  </div>
                  <div className="divide-y">
                    {popularJobs.length > 0 ? popularJobs.map((job, i) => (
                      <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition group">
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${i < 3 ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition leading-relaxed">{job.title}</p>
                          <p className="mt-0.5 text-[10px] text-gray-400">{job.prefecture}</p>
                        </div>
                      </Link>
                    )) : (
                      <p className="px-4 py-6 text-xs text-gray-400 text-center">求人データを準備中です</p>
                    )}
                  </div>
                </div>

                {/* おすすめ記事 */}
                <div className="rounded-lg border bg-white overflow-hidden">
                  <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
                    <Newspaper className="h-4 w-4 text-gray-600" />
                    <h3 className="text-sm font-bold text-gray-900">おすすめ記事</h3>
                  </div>
                  <div className="divide-y">
                    {recommendedArticles.map((a, i) => (
                      <Link key={`rec-${a.slug}-${i}`} href={`/journal/${a.slug}`} className="block px-4 py-3 hover:bg-gray-50 transition group">
                        <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition leading-relaxed">{a.title}</p>
                        <span className="mt-1 inline-block text-[10px] text-primary-600">{a.category}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t px-4 py-2.5">
                    <Link href="/journal" className="flex items-center justify-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition">
                      記事をもっと見る <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* 公式SNS */}
                <div className="rounded-lg border bg-white overflow-hidden">
                  <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
                    <h3 className="text-sm font-bold text-gray-900">公式SNS</h3>
                  </div>
                  <div className="p-3 space-y-2">
                    <a href="https://youtube.com/@let-kensetsu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded border px-3 py-2.5 hover:bg-gray-50 transition">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-600 text-white">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">YouTube</p>
                        <p className="text-[10px] text-gray-400">現場の仕事紹介</p>
                      </div>
                    </a>
                    <a href="https://instagram.com/let_kensetsu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded border px-3 py-2.5 hover:bg-gray-50 transition">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gradient-to-br from-purple-600 to-pink-500 text-white">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Instagram</p>
                        <p className="text-[10px] text-gray-400">施工事例・日常</p>
                      </div>
                    </a>
                    <a href="https://x.com/let_kensetsu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded border px-3 py-2.5 hover:bg-gray-50 transition">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-black text-white">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">X (Twitter)</p>
                        <p className="text-[10px] text-gray-400">最新情報</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* 会員登録 */}
                <div className="rounded-lg border bg-primary-600 p-4 text-center">
                  <p className="text-sm font-bold text-white">会員登録（無料）</p>
                  <p className="mt-1 text-[10px] text-primary-200">希望に合った求人をお届け</p>
                  <Link href="/register" className="mt-3 inline-block rounded bg-white px-5 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition">
                    登録する
                  </Link>
                </div>

              </div>
            </aside>{/* /Sidebar */}

          </div>
        </div>
      </section>

      {/* Stats */}
      {totalJobs > 0 && (
        <section className="border-t bg-primary-700 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-white/70">現在の掲載求人数</p>
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
