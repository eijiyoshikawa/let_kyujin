import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Breadcrumb } from "@/components/journal/breadcrumb"
import { TableOfContents } from "@/components/journal/table-of-contents"
import { RelatedArticles } from "@/components/journal/related-articles"
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/structured-data"
import { Calendar, User } from "lucide-react"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ categorySlug: string; articleSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleSlug } = await params
  const article = await prisma.journalArticle.findUnique({
    where: { slug: articleSlug },
  })
  if (!article) return {}
  return {
    title: article.title,
    description: article.metaDescription ?? undefined,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { categorySlug, articleSlug } = await params

  const article = await prisma.journalArticle.findUnique({
    where: { slug: articleSlug },
    include: { category: true, author: true },
  })

  if (!article || article.category.slug !== categorySlug) notFound()

  // Increment view count (fire and forget)
  prisma.journalArticle
    .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {})

  const relatedArticles = await prisma.journalArticle.findMany({
    where: {
      categoryId: article.categoryId,
      status: "published",
      id: { not: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: { category: true },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArticleSchema(article)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "トップ", url: process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.example.com" },
              { name: "マガジン", url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.example.com"}/journal` },
              { name: article.category.name, url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.example.com"}/journal/${article.category.slug}` },
              { name: article.title },
            ])
          ),
        }}
      />
      <Breadcrumb
        items={[
          { label: "マガジン", href: "/journal" },
          { label: article.category.name, href: `/journal/${article.category.slug}` },
          { label: article.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <header className="mb-6">
            <Link
              href={`/journal/${article.category.slug}`}
              className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
            >
              {article.category.name}
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              {article.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {article.publishedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.publishedAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              <Link
                href={`/journal/editor/${article.author.slug}`}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <User className="h-4 w-4" />
                {article.author.name}
              </Link>
            </div>
          </header>

          <div className="mb-6 lg:hidden">
            <TableOfContents html={article.content} />
          </div>

          <div
            className="prose prose-gray max-w-none prose-headings:scroll-mt-20 prose-h2:text-xl prose-h2:border-l-4 prose-h2:border-blue-600 prose-h2:pl-3 prose-h3:text-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 rounded-lg bg-blue-50 p-6 text-center">
            <h2 className="text-lg font-bold text-gray-900">
              求人をお探しですか？
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ノンデスク産業に特化した求人を多数掲載しています。
            </p>
            <a
              href="/jobs"
              className="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              求人を探す
            </a>
          </div>
        </article>

        <aside className="hidden space-y-6 lg:block">
          <TableOfContents html={article.content} />
          <RelatedArticles
            articles={relatedArticles.map((a) => ({
              slug: a.slug,
              title: a.title,
              publishedAt: a.publishedAt,
              categorySlug: a.category.slug,
            }))}
          />
        </aside>
      </div>
    </div>
  )
}
