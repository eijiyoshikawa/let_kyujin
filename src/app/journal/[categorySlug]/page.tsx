import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ArticleCard } from "@/components/journal/article-card"
import { CategoryNav } from "@/components/journal/category-nav"
import { Pagination } from "@/components/journal/pagination"
import { Breadcrumb } from "@/components/journal/breadcrumb"
import type { Metadata } from "next"

const PER_PAGE = 20

type Props = {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await prisma.journalCategory.findUnique({
    where: { slug: categorySlug },
  })
  if (!category) return {}
  return {
    title: `${category.name}の記事一覧`,
    description: category.description ?? `${category.name}に関する転職・キャリア情報の記事一覧です。`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1)

  const category = await prisma.journalCategory.findUnique({
    where: { slug: categorySlug },
  })
  if (!category) notFound()

  const [articles, totalCount, categories] = await Promise.all([
    prisma.journalArticle.findMany({
      where: { categoryId: category.id, status: "published" },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: true },
    }),
    prisma.journalArticle.count({
      where: { categoryId: category.id, status: "published" },
    }),
    prisma.journalCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ])

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "マガジン", href: "/journal" },
          { label: category.name },
        ]}
      />
      <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-sm text-gray-600">{category.description}</p>
      )}

      <div className="mt-6">
        <CategoryNav categories={categories} currentSlug={categorySlug} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <p className="py-12 text-center text-gray-500">
          このカテゴリにはまだ記事がありません。
        </p>
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/journal/${categorySlug}`}
      />
    </div>
  )
}
