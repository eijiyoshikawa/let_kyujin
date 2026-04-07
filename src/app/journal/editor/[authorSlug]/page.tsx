import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ArticleCard } from "@/components/journal/article-card"
import { Breadcrumb } from "@/components/journal/breadcrumb"
import { Pagination } from "@/components/journal/pagination"
import { User } from "lucide-react"
import type { Metadata } from "next"

const PER_PAGE = 20

type Props = {
  params: Promise<{ authorSlug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { authorSlug } = await params
  const author = await prisma.journalAuthor.findUnique({
    where: { slug: authorSlug },
  })
  if (!author) return {}
  return {
    title: `${author.name}の記事一覧`,
    description: author.bio ?? `${author.name}が執筆した記事の一覧です。`,
  }
}

export default async function EditorPage({ params, searchParams }: Props) {
  const { authorSlug } = await params
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1)

  const author = await prisma.journalAuthor.findUnique({
    where: { slug: authorSlug },
  })
  if (!author) notFound()

  const [articles, totalCount] = await Promise.all([
    prisma.journalArticle.findMany({
      where: { authorId: author.id, status: "published" },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: true },
    }),
    prisma.journalArticle.count({
      where: { authorId: author.id, status: "published" },
    }),
  ])

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "マガジン", href: "/journal" },
          { label: author.name },
        ]}
      />

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{author.name}</h1>
          {author.bio && (
            <p className="mt-1 text-sm text-gray-600">{author.bio}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">{totalCount}件の記事</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/journal/editor/${authorSlug}`}
      />
    </div>
  )
}
