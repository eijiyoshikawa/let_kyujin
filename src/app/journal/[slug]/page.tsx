import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, User } from "lucide-react"
import type { Metadata } from "next"
import { generateArticleSchema } from "@/lib/article-structured-data"
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/lib/article-constants"
import { ArticleCard } from "@/components/articles/article-card"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, metaDescription: true, imageUrl: true },
  })
  if (!article) return { title: "記事が見つかりません" }
  return {
    title: article.title,
    description: article.metaDescription,
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      images: [{ url: article.imageUrl, width: 800, height: 450 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription,
      images: [article.imageUrl],
    },
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
    },
  })

  if (!article) notFound()

  // Increment view count (fire-and-forget)
  prisma.article
    .update({ where: { slug }, data: { viewCount: { increment: 1 } } })
    .catch(() => {})

  const cat = ARTICLE_CATEGORIES[article.category as ArticleCategory]

  const jsonLd = generateArticleSchema({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    imageUrl: article.imageUrl,
    author: { name: article.author.name },
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
  })

  // Related articles (same category, excluding current)
  const relatedArticles = await prisma.article.findMany({
    where: { category: article.category, slug: { not: article.slug } },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-900">
          ホーム
        </Link>
        <span>/</span>
        <Link href="/journal" className="hover:text-gray-900">
          ジャーナル
        </Link>
        <span>/</span>
        <span className="text-gray-900 line-clamp-1">{article.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <article>
          {/* Hero Image */}
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 700px"
              priority
            />
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {cat && (
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-medium ${cat.color}`}
              >
                {cat.label}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <time dateTime={article.publishedAt.toISOString()}>
                {article.publishedAt.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
            {article.title}
          </h1>

          {/* Author Info */}
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            {article.author.avatarUrl ? (
              <Image
                src={article.author.avatarUrl}
                alt={article.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {article.author.name}
              </p>
              {article.author.title && (
                <p className="text-xs text-gray-500">{article.author.title}</p>
              )}
            </div>
          </div>

          {/* Article Body */}
          <div
            className="article-body mt-8"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Tags */}
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

          {/* Back link */}
          <div className="mt-8">
            <Link
              href="/journal"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              記事一覧に戻る
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* CTA */}
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 p-5">
            <p className="text-sm font-bold text-blue-900">
              {cat ? `${cat.label}の求人を探す` : "求人を探す"}
            </p>
            <p className="mt-1 text-xs text-blue-700">
              あなたに合った求人が見つかります
            </p>
            <Link
              href={
                article.category === "career" || article.category === "general"
                  ? "/jobs"
                  : `/jobs?category=${article.category}`
              }
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              求人を見る
            </Link>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-900">関連記事</h2>
              <div className="mt-3 space-y-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/journal/${related.slug}`}
                    className="group block rounded-lg border bg-white p-3 transition hover:shadow-sm"
                  >
                    <div className="relative aspect-video overflow-hidden rounded">
                      <Image
                        src={related.imageUrl}
                        alt={related.title}
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                      {related.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
