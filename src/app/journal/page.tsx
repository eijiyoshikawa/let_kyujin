import { prisma } from "@/lib/db"
import { Suspense } from "react"
import { ArticleCard } from "@/components/articles/article-card"
import { CategoryFilter } from "@/components/articles/category-filter"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ジャーナル",
  description:
    "ドライバー・建設・製造業の転職に役立つコラム・ノウハウ記事。年収ガイド、資格情報、面接対策など。",
}

type Props = {
  searchParams: Promise<{ category?: string; subcategory?: string; page?: string }>
}

const PER_PAGE = 12

export default async function JournalPage({ searchParams }: Props) {
  const { category, subcategory, page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  const where: Record<string, string> = {}
  if (category) where.category = category
  if (subcategory) where.subcategory = subcategory

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
      take: PER_PAGE,
      skip: (currentPage - 1) * PER_PAGE,
    }),
    prisma.article.count({ where }),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">ジャーナル</h1>
      <p className="mt-2 text-gray-600">
        現場職の転職・キャリアに役立つ情報をお届けします
      </p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <CategoryFilter />
        </Suspense>
      </div>

      {articles.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">
          該当する記事がありません。
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams()
            if (category) params.set("category", category)
            if (subcategory) params.set("subcategory", subcategory)
            if (p > 1) params.set("page", String(p))
            const href = `/journal${params.toString() ? `?${params.toString()}` : ""}`
            return (
              <a
                key={p}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  p === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p}
              </a>
            )
          })}
        </nav>
      )}
    </div>
  )
}
