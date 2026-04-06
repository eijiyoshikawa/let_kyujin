import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "建設求人マガジン",
  description: "建設業界で働く方に役立つ情報を発信。転職ガイド、資格情報、業界ニュースなど。",
}

// Static articles data (will be replaced with CMS/WordPress later)
const articles = [
  {
    slug: "construction-career-guide",
    title: "建設業界への転職ガイド — 未経験から始める建設キャリア",
    excerpt: "建設業界は未経験でも始められる職種が多数。必要な資格や年収相場、キャリアパスを解説します。",
    category: "転職ガイド",
    date: "2026-04-01",
    featured: true,
  },
  {
    slug: "tobi-salary",
    title: "鳶職人の年収は？月収50万円以上も可能な高収入の理由",
    excerpt: "鳶職人は建設業界でも高い収入が期待できる職種です。経験年数別の年収データと稼ぐコツを紹介。",
    category: "年収・給与",
    date: "2026-03-28",
    featured: true,
  },
  {
    slug: "electrician-license",
    title: "電気工事士の資格取得ガイド — 1種と2種の違いと勉強法",
    excerpt: "電気工事士は建設業界で重宝される国家資格。試験の難易度や勉強方法、合格率を詳しく解説。",
    category: "資格",
    date: "2026-03-25",
    featured: false,
  },
  {
    slug: "construction-manager-role",
    title: "施工管理とは？仕事内容・必要な資格・年収を徹底解説",
    excerpt: "施工管理は建設現場の要となる重要なポジション。1級・2級施工管理技士の資格取得から仕事内容まで。",
    category: "職種解説",
    date: "2026-03-20",
    featured: false,
  },
  {
    slug: "civil-engineering-career",
    title: "土木作業員から施工管理へ — キャリアアップの道筋",
    excerpt: "土木作業員として現場経験を積みながら、施工管理技士へキャリアアップする方法を紹介します。",
    category: "キャリア",
    date: "2026-03-15",
    featured: false,
  },
  {
    slug: "construction-safety",
    title: "建設現場の安全対策 — 知っておくべき基本と最新動向",
    excerpt: "建設現場での事故を防ぐための基本的な安全対策と、最新のICT安全技術について解説します。",
    category: "業界知識",
    date: "2026-03-10",
    featured: false,
  },
  {
    slug: "interior-finishing-guide",
    title: "内装工事の種類と仕事内容 — クロス・床・塗装・左官",
    excerpt: "内装仕上げ工事の各種職種について、仕事内容や必要なスキル、年収相場を紹介します。",
    category: "職種解説",
    date: "2026-03-05",
    featured: false,
  },
  {
    slug: "demolition-work",
    title: "解体工事業の将来性 — 需要拡大と人材不足の現状",
    excerpt: "老朽化建物の増加で需要が拡大する解体工事業。業界の現状と将来性、必要な資格を解説。",
    category: "業界知識",
    date: "2026-03-01",
    featured: false,
  },
]

const categoryList = [
  { name: "転職ガイド", count: 1 },
  { name: "年収・給与", count: 1 },
  { name: "資格", count: 1 },
  { name: "職種解説", count: 2 },
  { name: "キャリア", count: 1 },
  { name: "業界知識", count: 2 },
]

export default function JournalPage() {
  const featured = articles.filter((a) => a.featured)
  const recent = articles.filter((a) => !a.featured)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          📰 建設求人マガジン
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          建設業界で働く方に役立つ情報を発信。転職ガイド、資格情報、業界ニュースなど。
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Featured articles */}
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-2">
            ピックアップ
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {featured.map((article) => (
              <ArticleCard key={article.slug} article={article} size="large" />
            ))}
          </div>

          {/* Recent articles */}
          <h2 className="mt-8 flex items-center gap-2 text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-2">
            最新記事
          </h2>
          <div className="mt-4 space-y-4">
            {recent.map((article) => (
              <ArticleCard key={article.slug} article={article} size="small" />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          {/* Search CTA */}
          <div className="rounded-lg bg-blue-600 p-5 text-center text-white">
            <p className="font-bold">求人を探す</p>
            <p className="mt-1 text-xs text-blue-100">建設業界の求人を検索</p>
            <Link
              href="/jobs"
              className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              求人検索 →
            </Link>
          </div>

          {/* Categories */}
          <div className="mt-6 rounded-lg border bg-white p-4">
            <h3 className="font-bold text-gray-900 text-sm border-b pb-2">
              カテゴリー
            </h3>
            <ul className="mt-2 space-y-1">
              {categoryList.map((cat) => (
                <li key={cat.name}>
                  <span className="flex items-center justify-between py-1.5 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                    {cat.name}
                    <span className="text-xs text-gray-400">({cat.count})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular articles */}
          <div className="mt-6 rounded-lg border bg-white p-4">
            <h3 className="font-bold text-gray-900 text-sm border-b pb-2">
              人気の記事
            </h3>
            <ul className="mt-2 space-y-3">
              {articles.slice(0, 5).map((article, i) => (
                <li key={article.slug}>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="flex gap-3 group"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-600">
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-700 group-hover:text-blue-600 line-clamp-2">
                      {article.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ArticleCard({
  article,
  size,
}: {
  article: (typeof articles)[number]
  size: "large" | "small"
}) {
  if (size === "large") {
    return (
      <Link
        href={`/journal/${article.slug}`}
        className="group rounded-lg border bg-white overflow-hidden hover:shadow-md transition"
      >
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
          <span className="text-white text-sm font-bold text-center">
            {article.title}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {article.category}
            </span>
            <span className="text-xs text-gray-400">{article.date}</span>
          </div>
          <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {article.excerpt}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/journal/${article.slug}`}
      className="group flex gap-4 rounded-lg border bg-white p-4 hover:shadow-md transition"
    >
      <div className="hidden sm:flex h-20 w-32 shrink-0 rounded bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
        <span className="text-xs text-gray-400 text-center px-2">
          {article.category}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {article.category}
          </span>
          <span className="text-xs text-gray-400">{article.date}</span>
        </div>
        <h3 className="mt-1.5 font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-1">
          {article.excerpt}
        </p>
      </div>
    </Link>
  )
}
