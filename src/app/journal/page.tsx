import Link from "next/link"
import type { Metadata } from "next"
import {
  Newspaper,
  Search,
  ChevronRight,
  CirclePlay,
  Camera,
  TrendingUp,
  ArrowRight,
  Star,
  Building2,
} from "lucide-react"
import { AnimateOnScroll } from "@/components/animate-on-scroll"

export const metadata: Metadata = {
  title: "建設求人マガジン",
  description: "建設業界で働く方に役立つ情報を発信。転職ガイド、資格情報、業界ニュースなど。",
}

const articles = [
  {
    slug: "construction-career-guide",
    title: "建設業界への転職ガイド — 未経験から始める建設キャリア",
    excerpt: "建設業界は未経験でも始められる職種が多数。必要な資格や年収相場、キャリアパスを解説します。",
    category: "転職ガイド",
    date: "2026-04-01",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  },
  {
    slug: "tobi-salary",
    title: "鳶職人の年収は？月収50万円以上も可能な高収入の理由",
    excerpt: "鳶職人は建設業界でも高い収入が期待できる職種です。経験年数別の年収データと稼ぐコツを紹介。",
    category: "年収・給与",
    date: "2026-03-28",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
  },
  {
    slug: "electrician-license",
    title: "電気工事士の資格取得ガイド — 1種と2種の違いと勉強法",
    excerpt: "電気工事士は建設業界で重宝される国家資格。試験の難易度や勉強方法、合格率を詳しく解説。",
    category: "資格",
    date: "2026-03-25",
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
  },
  {
    slug: "construction-manager-role",
    title: "施工管理とは？仕事内容・必要な資格・年収を徹底解説",
    excerpt: "施工管理は建設現場の要となる重要なポジション。1級・2級施工管理技士の資格取得から仕事内容まで。",
    category: "職種解説",
    date: "2026-03-20",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop",
  },
  {
    slug: "civil-engineering-career",
    title: "土木作業員から施工管理へ — キャリアアップの道筋",
    excerpt: "土木作業員として現場経験を積みながら、施工管理技士へキャリアアップする方法を紹介します。",
    category: "キャリア",
    date: "2026-03-15",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop",
  },
  {
    slug: "construction-safety",
    title: "建設現場の安全対策 — 知っておくべき基本と最新動向",
    excerpt: "建設現場での事故を防ぐための基本的な安全対策と、最新のICT安全技術について解説します。",
    category: "業界知識",
    date: "2026-03-10",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
  },
  {
    slug: "interior-finishing-guide",
    title: "内装工事の種類と仕事内容 — クロス・床・塗装・左官",
    excerpt: "内装仕上げ工事の各種職種について、仕事内容や必要なスキル、年収相場を紹介します。",
    category: "職種解説",
    date: "2026-03-05",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1636761358953-129e627e4301?w=400&h=300&fit=crop",
  },
  {
    slug: "demolition-work",
    title: "解体工事業の将来性 — 需要拡大と人材不足の現状",
    excerpt: "老朽化建物の増加で需要が拡大する解体工事業。業界の現状と将来性、必要な資格を解説。",
    category: "業界知識",
    date: "2026-03-01",
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=400&h=300&fit=crop",
  },
]

const categoryTabs = ["ホーム", "転職ガイド", "年収・給与", "資格", "職種解説", "キャリア", "業界知識"]

const categoryList = [
  { name: "転職ガイド", count: 1 },
  { name: "年収・給与", count: 1 },
  { name: "資格", count: 1 },
  { name: "職種解説", count: 2 },
  { name: "キャリア", count: 1 },
  { name: "業界知識", count: 2 },
]

const pickupCompanies = [
  { name: "株式会社山田建設", description: "東京・神奈川を中心に建築工事を手掛ける総合建設会社" },
  { name: "大和土木株式会社", description: "道路・橋梁・トンネルなど土木工事のスペシャリスト" },
]

export default function JournalPage() {
  const featured = articles.filter((a) => a.featured)
  const recent = articles.filter((a) => !a.featured)

  return (
    <div>
      {/* Blue header bar */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="flex items-center gap-2.5 text-xl font-bold">
            <Newspaper className="h-6 w-6" />
            建設求人マガジン
          </h1>
          <p className="mt-1.5 text-sm text-blue-100">
            建設業界で働く方に役立つ情報を発信するメディアです。
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 py-2.5 min-w-max">
            {categoryTabs.map((tab, i) => (
              <span
                key={tab}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition ${
                  i === 0
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured articles */}
        <AnimateOnScroll animation="stagger">
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
          {featured.map((article) => (
            <Link
              key={article.slug}
              href={`/journal/${article.slug}`}
              className="hover-lift group shrink-0 w-72 snap-start rounded-xl overflow-hidden border bg-white hover:shadow-lg transition sm:w-auto"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8">
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                    {article.category}
                  </span>
                  <p className="mt-1.5 text-sm font-bold text-white line-clamp-2 drop-shadow-sm">
                    {article.title}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </AnimateOnScroll>

        {/* Dual CTA buttons */}
        <AnimateOnScroll>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/jobs"
            className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
          >
            <Search className="h-4 w-4" />
            求人を探す
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-sm font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition shadow-sm"
          >
            転職サポートを受ける
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        </AnimateOnScroll>

        {/* Main content + Sidebar */}
        <div className="mt-10 flex flex-col gap-8 lg:flex-row">
          {/* Article list */}
          <div className="flex-1 min-w-0">
            <AnimateOnScroll>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              ピックアップ記事
            </h2>
            </AnimateOnScroll>
            <div className="mt-4 space-y-4">
              {recent.map((article) => (
                <Link
                  key={article.slug}
                  href={`/journal/${article.slug}`}
                  className="hover-lift group flex gap-4 rounded-xl border bg-white p-3 hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="h-24 w-40 shrink-0 rounded-md overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-400">{article.date}</span>
                    </div>
                    <h3 className="mt-1.5 font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2 hidden sm:block">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-72 space-y-6">
            {/* Social links */}
            <AnimateOnScroll>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="font-bold text-sm text-gray-900 border-b pb-2">公式SNS</h3>
              <div className="mt-3 flex gap-3 justify-center">
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                  aria-label="YouTube"
                >
                  <CirclePlay className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition"
                  aria-label="Instagram"
                >
                  <Camera className="h-5 w-5" />
                </a>
              </div>
            </div>
            </AnimateOnScroll>

            {/* Search CTA */}
            <AnimateOnScroll>
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-center text-white shadow-sm">
              <Search className="mx-auto h-8 w-8 text-blue-200" />
              <p className="mt-2 font-bold">求人を探す</p>
              <p className="mt-1 text-xs text-blue-200">建設業界の求人を検索</p>
              <Link
                href="/jobs"
                className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition shadow-sm"
              >
                <Search className="h-3.5 w-3.5" />
                求人検索
              </Link>
            </div>
            </AnimateOnScroll>

            {/* Recommend articles with thumbnails */}
            <AnimateOnScroll>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="flex items-center gap-1.5 font-bold text-sm text-gray-900 border-b pb-2">
                <Star className="h-4 w-4 text-amber-500" />
                おすすめ記事
              </h3>
              <ul className="mt-3 space-y-3">
                {articles.slice(0, 5).map((article, i) => (
                  <li key={article.slug}>
                    <Link
                      href={`/journal/${article.slug}`}
                      className="flex gap-3 group"
                    >
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-md overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-0 left-0 flex h-5 w-5 items-center justify-center bg-blue-600 text-[10px] font-bold text-white rounded-br">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-xs text-gray-700 group-hover:text-blue-600 transition line-clamp-2 pt-0.5 leading-relaxed">
                        {article.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            </AnimateOnScroll>

            {/* Categories with chevrons */}
            <AnimateOnScroll>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="font-bold text-gray-900 text-sm border-b pb-2">
                カテゴリー
              </h3>
              <ul className="mt-1 divide-y divide-gray-100">
                {categoryList.map((cat) => (
                  <li key={cat.name}>
                    <span className="flex items-center justify-between py-2.5 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition">
                      <span>{cat.name}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        ({cat.count})
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            </AnimateOnScroll>

            {/* Pickup companies */}
            <AnimateOnScroll>
            <div className="rounded-xl border bg-white p-4">
              <h3 className="flex items-center gap-1.5 font-bold text-sm text-gray-900 border-b pb-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                ピックアップ企業
              </h3>
              <div className="mt-3 space-y-3">
                {pickupCompanies.map((company) => (
                  <div
                    key={company.name}
                    className="hover-lift rounded-md border p-3 hover:bg-blue-50/50 hover:border-blue-200 transition cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{company.description}</p>
                  </div>
                ))}
              </div>
            </div>
            </AnimateOnScroll>
          </aside>
        </div>
      </div>
    </div>
  )
}
