import { prisma } from "@/lib/db"
import { ArticleCard } from "@/components/journal/article-card"
import { CategoryNav } from "@/components/journal/category-nav"
import { Pagination } from "@/components/journal/pagination"
import { Breadcrumb } from "@/components/journal/breadcrumb"

const PER_PAGE = 20

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1)

  const [articles, totalCount, categories, popularArticles] = await Promise.all([
    prisma.journalArticle.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: true },
    }),
    prisma.journalArticle.count({ where: { status: "published" } }),
    prisma.journalCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.journalArticle.findMany({
      where: { status: "published" },
      orderBy: { viewCount: "desc" },
      take: 5,
      include: { category: true },
    }),
  ])

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb items={[{ label: "マガジン" }]} />
      <h1 className="text-2xl font-bold text-gray-900">マガジン</h1>
      <p className="mt-2 text-sm text-gray-600">
        ノンデスク産業で働く方に役立つ転職・キャリア情報をお届けします。
      </p>

      <div className="mt-6">
        <CategoryNav categories={categories} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={{
                  slug: article.slug,
                  title: article.title,
                  metaDescription: article.metaDescription,
                  publishedAt: article.publishedAt,
                  categorySlug: article.category.slug,
                  categoryName: article.category.name,
                  tags: article.tags,
                }}
              />
            ))}
          </div>
          {articles.length === 0 && (
            <p className="py-12 text-center text-gray-500">記事がありません。</p>
          )}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/journal"
          />
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-gray-900">人気記事</h2>
            <ul className="space-y-3">
              {popularArticles.map((article, i) => (
                <li key={article.id}>
                  <a
                    href={`/journal/${article.category.slug}/${article.slug}`}
                    className="group flex gap-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border bg-blue-50 p-5">
            <h2 className="mb-2 text-base font-bold text-gray-900">求人を探す</h2>
            <p className="text-sm text-gray-600">
              ドライバー・建設・製造業の求人を探してみませんか？
            </p>
            <a
              href="/jobs"
              className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              求人検索へ
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
