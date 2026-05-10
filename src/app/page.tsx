import Link from "next/link"
import Image from "next/image"
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
  ChevronRight,
  MapPin,
  Newspaper,
  Bell,
  BookOpen,
  MessageCircle,
  Sparkles,
  Star,
  Smartphone,
  CheckCircle2,
  Settings,
} from "lucide-react"
import { PREFECTURES } from "@/lib/constants"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { LogoSlider } from "@/components/logo-slider"
import { CATEGORY_LABELS } from "@/lib/article-categories"

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
  { pref: "東京", slug: "tokyo" },
  { pref: "神奈川", slug: "kanagawa" },
  { pref: "埼玉", slug: "saitama" },
  { pref: "千葉", slug: "chiba" },
  { pref: "大阪", slug: "osaka" },
  { pref: "関東", slug: "kanto" },
  { pref: "北信越", slug: "hokushinetsu" },
  { pref: "東海", slug: "tokai" },
  { pref: "関西", slug: "kansai" },
  { pref: "中国・四国", slug: "chugoku-shikoku" },
  { pref: "九州・沖縄", slug: "kyushu-okinawa" },
  { pref: "北海道・東北", slug: "hokkaido-tohoku" },
]

const popularCategories = [
  { label: "内装/塗装", key: "interior_paint" },
  { label: "内装/大工", key: "interior_carpenter" },
  { label: "内装/クロス", key: "interior_cross" },
  { label: "躯体/鳶（足場）", key: "frame_scaffold" },
  { label: "土木/土工", key: "civil_dirt" },
  { label: "土木/防水", key: "civil_waterproof" },
  { label: "電気/強電", key: "electrical_strong" },
  { label: "電気/弱電", key: "electrical_weak" },
  { label: "施工管理/建築", key: "management_arch" },
  { label: "施工管理/土木", key: "management_civil" },
]

const filterChips = [
  { label: "日払いOK", key: "daily_pay" },
  { label: "週払いOK", key: "weekly_pay" },
  { label: "未経験OK", key: "no_experience" },
  { label: "土日休み", key: "weekend_off" },
  { label: "2026年度 百名社受賞", key: "hyakumeisha" },
]

const themeCards = [
  { label: "U・J・Iターン歓迎の会社", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" },
  { label: "寮・社宅完備の会社", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop" },
  { label: "移住支援を行っている会社", image: "https://images.unsplash.com/photo-1530538987395-032d1800fdd4?w=400&h=300&fit=crop" },
  { label: "土日休みの会社", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=300&fit=crop" },
  { label: "週休2日（平日＋週末など）の会社", image: "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?w=400&h=300&fit=crop" },
  { label: "年間休日120日以上の会社", image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=300&fit=crop" },
  { label: "大手企業の現場を持つ安定している会社", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop" },
  { label: "未経験でも安心！研修制度が整った会社", image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop" },
  { label: "ガッツリ稼げる会社", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop" },
  { label: "インセンティブ（報奨金）がある会社", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&h=300&fit=crop" },
  { label: "福利厚生が充実している会社", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop" },
  { label: "服装・髪型が自由な会社", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop" },
  { label: "オンライン面接可能な会社", image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400&h=300&fit=crop" },
  { label: "会社見学ができる会社", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop" },
  { label: "面接1回のみの会社", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop" },
  { label: "履歴書不要！の会社", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop" },
  { label: "定時で帰れる！残業がほとんどない会社", image: "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=400&h=300&fit=crop" },
  { label: "20代が多い！若い会社", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop" },
  { label: "経験者優遇", image: "https://images.unsplash.com/photo-1559523182-a284c3fb7cff?w=400&h=300&fit=crop" },
  { label: "出張・転勤がない会社", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop" },
  { label: "設立10年以上の歴史のある会社", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop" },
  { label: "資格取得の支援や補助が充実している会社", image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=300&fit=crop" },
  { label: "勤続年数が長い、安定して働ける会社", image: "https://images.unsplash.com/photo-1566751311-c3aaa7c4aef2?w=400&h=300&fit=crop" },
  { label: "ニッチな職種", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop" },
]

const newsItems = [
  { date: "2026.04.01", title: "サイトデザインをリニューアルしました", tag: "お知らせ" },
  { date: "2026.03.15", title: "求人掲載数が5,000件を突破しました", tag: "実績" },
  { date: "2026.03.01", title: "建設業特集の新コーナーを公開しました", tag: "機能追加" },
]

const featureBanners = [
  { title: "エアコンの効いた現場で腕を振るう。", subtitle: "安定して稼ぎ続けるための、技術者の選択。", color: "from-slate-900 to-slate-700" },
  { title: "日本製鉄グループの安定基盤で", subtitle: "産業インフラを支える", color: "from-blue-900 to-blue-700" },
  { title: "協力会社正社員募集特集", subtitle: "現場でキャリアを築きませんか？", color: "from-emerald-800 to-emerald-600" },
]

export default async function HomePage() {
  const categoryCounts = await prisma.job.groupBy({
    by: ["category"],
    where: {
      status: "active",
      category: { in: [...CONSTRUCTION_CATEGORY_VALUES] },
    },
    _count: true,
  }).catch(() => [])

  const totalJobs = categoryCounts.reduce((sum, c) => sum + c._count, 0)

  const [magazineArticles, interviewArticles] = await Promise.all([
    prisma.article.findMany({
      where: { ...publishedArticleFilter(), category: { not: "interview" } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, category: true, imageUrl: true },
    }).catch(() => []),
    prisma.article.findMany({
      where: { ...publishedArticleFilter(), category: "interview" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true, category: true, imageUrl: true },
    }).catch(() => []),
  ])

  const [popularJobs, recommendedArticles, latestJobs] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: "active",
        category: { in: [...CONSTRUCTION_CATEGORY_VALUES] },
      },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, title: true, prefecture: true, category: true, viewCount: true },
    }).catch(() => []),
    prisma.article.findMany({
      where: publishedArticleFilter(),
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { slug: true, title: true, category: true },
    }).catch(() => []),
    prisma.job.findMany({
      where: {
        status: "active",
        category: { in: [...CONSTRUCTION_CATEGORY_VALUES] },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true, title: true, prefecture: true, category: true,
        company: { select: { name: true } },
        salaryMin: true, salaryMax: true,
      },
    }).catch(() => []),
  ])

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: categoryCounts.find((c) => c.category === cat.key)?._count ?? 0,
  }))

  const today = new Date()
  const updateLabel = `${today.getMonth() + 1}/${today.getDate()}`

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "株式会社LET",
    url: "https://genbacareer.jp",
    logo: "https://genbacareer.jp/icon.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "大阪市中央区",
      addressRegion: "大阪府",
      addressCountry: "JP",
    },
    contactPoint: { "@type": "ContactPoint", telephone: "06-6786-8320", contactType: "customer service" },
  }

  const formatYen = (n: number | null) => {
    if (!n) return "—"
    return `${Math.round(n / 10000)}万円`
  }

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      {/* ===== Hero ===== */}
      <section className="relative bg-white">
        <div className="relative mx-auto max-w-7xl">
          <div className="relative h-[520px] sm:h-[500px] lg:h-[560px] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=900&fit=crop&q=85"
              alt="建設現場で働く作業員"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Mobile: full dark overlay for legibility */}
            <div className="absolute inset-0 bg-ink-900/70 sm:hidden" />
            {/* Desktop: soft diagonal gradient (replaces hard triangle clip) */}
            <div className="hidden sm:block hero-overlay" />
            {/* Yellow accent stripes */}
            <div className="hero-stripe-top" />
            <div className="hero-stripe-bottom" />

            {/* Update badge - mobile: top center; desktop: right tag */}
            <div className="absolute left-1/2 -translate-x-1/2 top-10 z-10 flex items-center gap-2 bg-brand-yellow-500 px-5 py-2 shadow-lg sm:left-auto sm:translate-x-0 sm:right-0 sm:top-16 sm:pl-4 sm:pr-6">
              <span className="block h-2 w-2 rounded-full bg-ink-900" />
              <p className="text-xs font-black text-ink-900 tracking-tight">毎週金曜更新！</p>
            </div>

            {/* Hero content - mobile: centered; desktop: right aligned */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center sm:items-end sm:text-right sm:px-12 lg:px-16">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 text-[11px] font-bold text-ink-900 shadow-sm">
                  <Sparkles className="h-3 w-3 text-primary-500" />
                  企業からスカウトが届く！
                </div>
                <p className="mt-3 text-sm font-medium text-white sm:text-base">建設業の求人を探すなら</p>
                <h1 className="mt-1 text-4xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  ゲンバキャリア
                </h1>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-full bg-primary-500 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-600 transition"
                  >
                    簡単！会員登録（無料）
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-ink-900 shadow-md hover:bg-gray-100 transition"
                  >
                    ログインはこちら
                  </Link>
                </div>

                <Link href="/for-employers" className="mt-4 inline-block text-xs text-white/80 underline hover:text-white">
                  ゲンバキャリアに掲載をお考えの企業様
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Search box (white card with yellow accent header) ===== */}
        <div className="relative -mt-10 sm:-mt-12 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-2xl ring-1 ring-warm-200">
            {/* Yellow header */}
            <div className="flex items-center gap-3 bg-brand-yellow-500 px-5 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900">
                <Search className="h-4 w-4 text-brand-yellow-500" />
              </span>
              <h2 className="text-base font-black text-ink-900 tracking-tight sm:text-lg">求人検索</h2>
              <p className="hidden sm:block text-xs text-ink-900/80">全国・87職種から条件を入力して探せます</p>
            </div>

            {/* Form body */}
            <form action="/jobs" method="GET" className="p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1 border-2 border-warm-200 px-3 py-3 hover:border-brand-yellow-500 transition">
                  <label className="flex items-center gap-2 text-sm text-ink-900" htmlFor="hero-category">
                    <HardHat className="h-4 w-4 shrink-0 text-primary-500" />
                    <select id="hero-category" name="category" className="flex-1 bg-transparent text-sm font-bold text-ink-900 focus:outline-none">
                      <option value="">職種を選択</option>
                      {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </label>
                </div>
                <div className="flex-1 border-2 border-warm-200 px-3 py-3 hover:border-brand-yellow-500 transition">
                  <label className="flex items-center gap-2 text-sm text-ink-900" htmlFor="hero-prefecture">
                    <MapPin className="h-4 w-4 shrink-0 text-primary-500" />
                    <select id="hero-prefecture" name="prefecture" className="flex-1 bg-transparent text-sm font-bold text-ink-900 focus:outline-none">
                      <option value="">エリアを選択</option>
                      {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </label>
                </div>
                <button type="submit" className="flex items-center justify-center gap-3 bg-primary-500 px-6 py-3.5 text-sm font-black text-white tracking-tight shadow-md hover:bg-primary-600 transition sm:min-w-[200px]">
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[10px] font-medium opacity-80">該当</span>
                    <span className="text-base tabular-nums">{totalJobs.toLocaleString()}</span>
                  </span>
                  <span className="h-8 w-px bg-white/30" />
                  <span className="flex items-center gap-1.5">
                    <Search className="h-4 w-4" />
                    検索する
                  </span>
                </button>
              </div>

              {/* Quick filter checkboxes */}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-900 border-t border-warm-100 pt-3">
                <span className="text-xs font-bold text-gray-500 mr-1">こだわり：</span>
                {filterChips.slice(0, 4).map((f) => (
                  <label key={f.key} className="flex items-center gap-1.5 cursor-pointer hover:text-primary-600 transition">
                    <input type="checkbox" name={f.key} className="h-4 w-4 border-ink-900 accent-primary-500" />
                    <span className="text-xs font-bold">{f.label}</span>
                  </label>
                ))}
              </div>
            </form>
          </div>

          {/* Easy search panel - black header */}
          <details className="mt-3 group overflow-hidden shadow-lg ring-1 ring-warm-200" open>
            <summary className="flex cursor-pointer items-center justify-between bg-ink-900 px-5 py-3.5 text-white">
              <span className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center bg-brand-yellow-500">
                  <Sparkles className="h-4 w-4 text-ink-900" />
                </span>
                <span className="text-base font-black tracking-tight">かんたん検索</span>
                <span className="hidden sm:inline text-xs text-white/70">人気のエリア・職種を1クリックで検索！</span>
              </span>
              <ChevronRight className="h-5 w-5 transition group-open:rotate-90" />
            </summary>
            <div className="bg-white p-5 sm:p-6 space-y-6">
              {/* Area pills */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-1 bg-primary-500" />
                  <h3 className="flex items-center gap-1.5 text-sm font-black text-ink-900 tracking-tight">
                    <MapPin className="h-4 w-4 text-primary-500" /> エリア
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularAreas.map((a) => (
                    <Link key={a.slug} href={`/jobs?prefecture=${a.pref}`} className="inline-flex items-center gap-1 rounded-full border border-primary-500 bg-white px-4 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-500 hover:text-white transition">
                      {a.pref}エリア <ChevronRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Popular categories */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-1 bg-primary-500" />
                  <h3 className="flex items-center gap-1.5 text-sm font-black text-ink-900 tracking-tight">
                    <HardHat className="h-4 w-4 text-primary-500" /> 人気の職種
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularCategories.map((c) => (
                    <Link key={c.key} href={`/jobs?category=${c.key}`} className="inline-flex items-center gap-1 rounded-full border border-primary-500 bg-white px-4 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-500 hover:text-white transition">
                      {c.label} <ChevronRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* こだわり条件 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-1 bg-primary-500" />
                  <h3 className="flex items-center gap-1.5 text-sm font-black text-ink-900 tracking-tight">
                    <Settings className="h-4 w-4 text-primary-500" /> こだわり条件
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterChips.map((f) => (
                    <Link key={f.key} href={`/jobs?${f.key}=1`} className="inline-flex items-center gap-1 rounded-full border border-primary-500 bg-white px-4 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-500 hover:text-white transition">
                      {f.label} <ChevronRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      <LogoSlider />

      {/* ===== Featured editorial cards ===== */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b-2 border-ink-900 pb-3">
            <div className="flex items-baseline gap-3">
              <span className="flex h-8 w-1.5 bg-primary-500" />
              <h2 className="text-2xl font-black text-ink-900 tracking-tight">特集</h2>
              <span className="text-xs font-medium text-gray-500">PICK UP</span>
            </div>
            <Link href="/jobs" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              すべて見る <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureBanners.map((b, i) => (
              <Link key={i} href="/jobs" className="group block overflow-hidden border border-warm-200 bg-white hover:border-ink-900 transition">
                <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${b.color}`}>
                  <div className="absolute inset-0 bg-ink-900/10 group-hover:bg-ink-900/0 transition" />
                  <span className="absolute left-3 top-3 bg-brand-yellow-500 px-2 py-0.5 text-[10px] font-black text-ink-900 tracking-tight">
                    SPECIAL #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-600 leading-relaxed line-clamp-1">{b.title}</p>
                  <p className="mt-1 text-base font-black text-ink-900 tracking-tight leading-tight line-clamp-2">{b.subtitle}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary-600 group-hover:text-primary-700">
                    詳しく見る <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Hyakumeisha banner ===== */}
      <section className="section-warm pb-10 pt-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link href="/jobs?hyakumeisha=1" className="group block bg-white p-5 ring-1 ring-warm-200 hover:ring-ink-900 transition shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center bg-ink-900">
                  <div className="absolute inset-1 border border-brand-yellow-500/40" />
                  <span className="text-center text-[11px] font-black tracking-tight text-brand-yellow-500 leading-tight">
                    百名社<br/>2026
                  </span>
                </div>
                <div>
                  <div className="inline-block bg-ink-900 px-2 py-0.5 text-[10px] font-black text-brand-yellow-500 tracking-tight mb-1">
                    AWARD 2026
                  </div>
                  <p className="text-base font-black text-ink-900 tracking-tight sm:text-lg leading-snug">
                    マッチング・採用の成果が生んだ、選ばれし100社。
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    人材確保で卓越した成果を収めた工事会社100社を「ゲンバキャリア 百名社 2026」として公開中
                  </p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 shrink-0 text-ink-900 hidden sm:block group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* ===== Latest jobs ===== */}
      <section className="bg-white pb-12 pt-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b-2 border-ink-900 pb-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="flex h-8 w-1.5 bg-primary-500" />
              <h2 className="text-2xl font-black text-ink-900 tracking-tight">今週の新着求人</h2>
              <span className="bg-brand-yellow-500 px-2 py-0.5 text-xs font-black text-ink-900 tracking-tight">{updateLabel} UP</span>
            </div>
            <Link href="/jobs?sort=newest" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              すべて見る <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestJobs.length > 0 ? latestJobs.map((j, i) => (
              <Link key={j.id} href={`/jobs/${j.id}`} className="group overflow-hidden border border-warm-200 bg-white hover:border-ink-900 hover:shadow-lg transition flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-ink-700 to-ink-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HardHat className="h-16 w-16 text-brand-yellow-500/80" />
                  </div>
                  {i === 0 && (
                    <span className="absolute left-0 top-3 bg-primary-500 px-2 py-0.5 text-[10px] font-black text-white tracking-tight">
                      NEW
                    </span>
                  )}
                  <span className="absolute right-2 bottom-2 bg-brand-yellow-500 px-2 py-0.5 text-[10px] font-black text-ink-900 tracking-tight">
                    {j.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-black text-ink-900 tracking-tight line-clamp-2 leading-snug group-hover:text-primary-600">
                    {j.title}
                  </h3>
                  <p className="mt-1.5 text-[11px] text-gray-500 line-clamp-1">{j.company?.name}</p>
                  <div className="mt-3 pt-3 border-t border-warm-100 space-y-1.5 text-xs text-gray-700">
                    <p className="flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold text-gray-500 shrink-0">月給</span>
                      <span className="font-black text-primary-600 tracking-tight">{formatYen(j.salaryMin)}〜{formatYen(j.salaryMax)}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
                      <span className="truncate">{j.prefecture}</span>
                    </p>
                  </div>
                </div>
              </Link>
            )) : (
              <p className="col-span-full py-8 text-center text-sm text-gray-400">求人データを準備中です</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== Theme grid (yellow band) ===== */}
      <section className="relative theme-band-yellow py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b-2 border-ink-900 pb-3">
            <div className="flex items-baseline gap-3">
              <span className="flex h-8 w-1.5 bg-ink-900" />
              <h2 className="text-2xl font-black text-ink-900 tracking-tight">テーマから探す</h2>
              <span className="text-xs font-medium text-ink-900/70">FROM THEMES</span>
            </div>
          </div>
          <AnimateOnScroll animation="stagger">
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {themeCards.map((c, i) => (
                <Link key={i} href={`/jobs?theme=${encodeURIComponent(c.label)}`} className="group relative aspect-[4/3] overflow-hidden bg-white shadow-sm hover:shadow-md transition">
                  <Image
                    src={c.image}
                    alt={c.label}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
                  <span className="absolute left-2 top-2 bg-brand-yellow-500 px-1.5 py-0.5 text-[9px] font-black text-ink-900 tracking-tight">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="absolute inset-x-2 bottom-2 text-[11px] font-black text-white leading-tight drop-shadow-md tracking-tight">
                    {c.label}
                  </p>
                </Link>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== Categories (occupations) ===== */}
      <section className="section-warm py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between border-b-2 border-ink-900 pb-3">
            <div className="flex items-baseline gap-3">
              <span className="flex h-8 w-1.5 bg-primary-500" />
              <h2 className="text-2xl font-black text-ink-900 tracking-tight">職種から探す</h2>
              <span className="text-xs font-medium text-gray-500">BY OCCUPATION</span>
            </div>
            <span className="text-xs font-bold text-gray-500">{categoriesWithCounts.length} 種</span>
          </div>
          <AnimateOnScroll animation="stagger">
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categoriesWithCounts.map((cat) => {
                const Icon = cat.icon
                return (
                  <Link
                    key={cat.key}
                    href={`/jobs?category=${cat.key}`}
                    className="group overflow-hidden border border-warm-200 bg-white hover:border-ink-900 hover:shadow-lg transition"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <Image
                        src={cat.image}
                        alt={cat.label}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />
                      {/* Category icon top-right */}
                      <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center bg-brand-yellow-500">
                        <Icon className="h-5 w-5 text-ink-900" />
                      </span>
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="block text-sm font-black text-white drop-shadow-md tracking-tight">{cat.label}</span>
                        <span className="block text-[10px] font-bold text-brand-yellow-300">{cat.count.toLocaleString()} 件</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2.5">
                      <p className="text-[11px] text-gray-500 flex-1 truncate">{cat.sub}</p>
                      <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary-500 shrink-0 transition" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ===== Magazine + Interview ===== */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Magazine */}
            <div className="border border-warm-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 bg-ink-900 px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center bg-brand-yellow-500">
                  <BookOpen className="h-4 w-4 text-ink-900" />
                </span>
                <h2 className="text-sm font-black text-white tracking-tight">マガジン</h2>
                <span className="text-[10px] font-medium text-white/60">MAGAZINE</span>
                <Link href="/journal" className="ml-auto text-xs font-bold text-brand-yellow-500 hover:text-brand-yellow-300 flex items-center gap-1">
                  すべて見る <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-warm-200">
                {magazineArticles.map((a, i) => (
                  <Link key={a.slug} href={`/journal/${a.slug}`} className="group flex gap-3 items-center px-4 py-3 hover:bg-warm-50 transition">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-warm-100 text-[10px] font-black text-ink-900 tracking-tight">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {a.imageUrl && (
                      <div className="relative w-20 h-14 shrink-0 overflow-hidden">
                        <Image
                          src={a.imageUrl}
                          alt={a.title}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink-900 line-clamp-2 group-hover:text-primary-600 transition leading-snug">{a.title}</p>
                      <span className="mt-1 inline-block text-[10px] font-bold text-primary-600">{CATEGORY_LABELS[a.category] ?? a.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Interview */}
            <div className="border border-warm-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 bg-ink-900 px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center bg-brand-yellow-500">
                  <MessageCircle className="h-4 w-4 text-ink-900" />
                </span>
                <h2 className="text-sm font-black text-white tracking-tight">転職体験談</h2>
                <span className="text-[10px] font-medium text-white/60">INTERVIEW</span>
                <Link href="/journal?category=interview" className="ml-auto text-xs font-bold text-brand-yellow-500 hover:text-brand-yellow-300 flex items-center gap-1">
                  すべて見る <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-warm-200">
                {(interviewArticles.length > 0 ? interviewArticles : magazineArticles).map((a, i) => (
                  <Link key={`interview-${a.slug}-${i}`} href={`/journal/${a.slug}`} className="group flex gap-3 items-center px-4 py-3 hover:bg-warm-50 transition">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-warm-100 text-[10px] font-black text-ink-900 tracking-tight">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {a.imageUrl && (
                      <div className="relative w-20 h-14 shrink-0 overflow-hidden">
                        <Image
                          src={a.imageUrl}
                          alt={a.title}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink-900 line-clamp-2 group-hover:text-primary-600 transition leading-snug">{a.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Trust section (yellow + 3 white cards) ===== */}
      <section className="relative theme-band-yellow py-14">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-ink-900 px-4 py-1.5 mb-4">
            <span className="block h-1.5 w-1.5 rounded-full bg-brand-yellow-500" />
            <p className="text-xs font-black tracking-tight text-brand-yellow-500">3 REASONS</p>
            <span className="block h-1.5 w-1.5 rounded-full bg-brand-yellow-500" />
          </div>
          <p className="text-sm font-bold text-ink-900">ゲンバキャリアなら</p>
          <h2 className="mt-1 text-2xl font-black text-ink-900 tracking-tight sm:text-4xl">希望の求人がきっと見つかる！</h2>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { icon: HardHat, num: "01", title: "建設業界に特化した正社員求人が満載", desc: "建築・土木・設備・解体の現場求人を中心に掲載しています。" },
              { icon: Smartphone, num: "02", title: "20万事業者ネットワークの安心感", desc: "「ゲンバキャリア」が運営する建設業界専門サイトです。" },
              { icon: Search, num: "03", title: "どこよりも探しやすく分かりやすく", desc: "条件・エリア・職種から1クリックで検索できます。" },
            ].map((f) => {
              const Icon = f.icon
              return (
                <div key={f.num} className="relative bg-white p-6 shadow-sm text-left">
                  <span className="absolute right-4 top-3 text-3xl font-black text-brand-yellow-300 tracking-tight leading-none">{f.num}</span>
                  <div className="flex h-14 w-14 items-center justify-center bg-ink-900">
                    <Icon className="h-7 w-7 text-brand-yellow-500" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-ink-900 tracking-tight leading-snug">{f.title}</h3>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>

          <Link
            href="/register"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-primary-500 px-14 py-4 text-base font-black tracking-tight text-white shadow-lg hover:bg-primary-600 transition"
          >
            会員登録（無料）
          </Link>
          <Link href="/for-employers" className="mt-3 block text-xs text-ink-900 underline hover:text-ink-700">
            ゲンバキャリアに掲載をお考えの企業様
          </Link>
        </div>
      </section>

      {/* ===== Sidebar content + News (compact) ===== */}
      <section className="section-warm py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Popular jobs */}
            <div className="border border-warm-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 border-b-2 border-primary-500 px-4 py-3">
                <Star className="h-4 w-4 text-primary-500 fill-primary-500" />
                <h3 className="text-sm font-black text-ink-900 tracking-tight">人気の求人</h3>
                <span className="ml-auto text-[10px] font-medium text-gray-400">RANKING</span>
              </div>
              <div className="divide-y divide-warm-200">
                {popularJobs.length > 0 ? popularJobs.slice(0, 4).map((job, i) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-warm-50 transition group">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center text-xs font-black tracking-tight ${i === 0 ? "bg-brand-yellow-500 text-ink-900" : i < 3 ? "bg-primary-500 text-white" : "bg-warm-100 text-gray-500"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink-900 line-clamp-2 group-hover:text-primary-600 transition leading-relaxed">{job.title}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400">{job.prefecture}</p>
                    </div>
                  </Link>
                )) : (
                  <p className="px-4 py-6 text-xs text-gray-400 text-center">求人データを準備中</p>
                )}
              </div>
            </div>

            {/* Recommended articles */}
            <div className="border border-warm-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 border-b-2 border-ink-900 px-4 py-3">
                <Newspaper className="h-4 w-4 text-ink-900" />
                <h3 className="text-sm font-black text-ink-900 tracking-tight">おすすめ記事</h3>
                <span className="ml-auto text-[10px] font-medium text-gray-400">RECOMMEND</span>
              </div>
              <div className="divide-y divide-warm-200">
                {recommendedArticles.slice(0, 4).map((a, i) => (
                  <Link key={`rec-${a.slug}-${i}`} href={`/journal/${a.slug}`} className="block px-4 py-3 hover:bg-warm-50 transition group">
                    <span className="inline-block bg-warm-100 px-2 py-0.5 text-[10px] font-black text-ink-900 tracking-tight mb-1.5">
                      {CATEGORY_LABELS[a.category] ?? a.category}
                    </span>
                    <p className="text-xs font-bold text-ink-900 line-clamp-2 group-hover:text-primary-600 transition leading-relaxed">{a.title}</p>
                  </Link>
                ))}
              </div>
              <div className="border-t border-warm-200 px-4 py-2.5">
                <Link href="/journal" className="flex items-center justify-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition">
                  記事をもっと見る <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* News */}
            <div className="border border-warm-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 border-b-2 border-brand-yellow-500 px-4 py-3">
                <Bell className="h-4 w-4 text-brand-yellow-600" />
                <h3 className="text-sm font-black text-ink-900 tracking-tight">お知らせ</h3>
                <span className="ml-auto text-[10px] font-medium text-gray-400">NEWS</span>
              </div>
              <div className="divide-y divide-warm-200">
                {newsItems.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-[10px] font-bold text-gray-500 tabular-nums">{item.date}</span>
                      <span className="shrink-0 bg-brand-yellow-500 px-2 py-0.5 text-[10px] font-black text-ink-900 tracking-tight">{item.tag}</span>
                    </div>
                    <span className="text-xs font-bold text-ink-900 leading-relaxed">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      {totalJobs > 0 && (
        <section className="relative bg-ink-900 py-10 overflow-hidden">
          <div className="hero-stripe-top" />
          <div className="hero-stripe-bottom" />
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(rgba(245, 180, 0, 0.08) 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }} />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="inline-block bg-brand-yellow-500 px-3 py-1 text-[10px] font-black text-ink-900 tracking-tight">CURRENT JOBS</p>
            <p className="mt-3 text-sm text-white/70">現在の掲載求人数</p>
            <p className="mt-2 text-5xl font-black text-brand-yellow-500 tracking-tight">
              {totalJobs.toLocaleString()}
              <span className="ml-2 text-xl text-white">件</span>
            </p>
          </div>
        </section>
      )}

      {/* ===== Black footer-style band: App + Employer CTAs ===== */}
      <section className="bg-ink-900 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2">
            {/* App download */}
            <div>
              <div className="flex items-start gap-5">
                <div className="hidden h-32 w-20 shrink-0  bg-brand-yellow-500 p-1 sm:block">
                  <div className="flex h-full w-full items-center justify-center  bg-white">
                    <Smartphone className="h-8 w-8 text-ink-900" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">ゲンバキャリアアプリをダウンロード！</h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/90">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow-500" />
                      アプリ内のメッセージで、<span className="text-brand-yellow-500">企業と簡単やりとり！</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow-500" />
                      企業からのメッセージも<span className="text-brand-yellow-500">プッシュ通知</span>で見逃し防止
                    </li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2  bg-white/10 px-4 py-2 text-xs text-white/70">
                      App Store / Google Play 準備中
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employer CTA */}
            <div>
              <div className="flex items-start gap-5">
                <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-yellow-500 sm:flex">
                  <Search className="h-10 w-10 text-ink-900" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">求人を掲載しませんか？</h3>
                  <ul className="mt-3 space-y-2 text-sm text-white/90">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow-500" />
                      87職種の中から幅広く人材を募集でき、<span className="text-brand-yellow-500">スカウト送信も可能！</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow-500" />
                      <span className="text-brand-yellow-500">アプリとウェブ</span>に同時掲載で、多くの人材にアピール！
                    </li>
                  </ul>
                  <Link href="/for-employers" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-ink-900 hover:bg-warm-100 transition">
                    詳しくはこちら <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
