import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { publishedArticleFilter } from "@/lib/articles"
import { ChevronRight } from "lucide-react"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findFirst({
    where: { slug, ...publishedArticleFilter() },
    select: { title: true, metaDescription: true, excerpt: true },
  })
  if (!article) return { title: "記事が見つかりません" }
  return {
    title: article.title,
    description: article.metaDescription ?? article.excerpt ?? undefined,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await prisma.article.findFirst({
    where: { slug, ...publishedArticleFilter() },
  })

  if (!article) notFound()

  // Increment view count (non-blocking)
  prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  // Fetch related articles (same category, excluding current)
  const related = await prisma.article.findMany({
    where: {
      ...publishedArticleFilter(),
      category: article.category,
      id: { not: article.id },
    },
    select: { slug: true, title: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 5,
  })

  const categoryLabels: Record<string, string> = {
    career: "転職・キャリア",
    salary: "年収・給与",
    license: "資格・免許",
    "job-type": "職種解説",
    industry: "業界知識",
    interview: "体験談",
  }

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1 text-xs text-gray-500">
            <Link href="/" className="hover:text-primary-600">トップ</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/journal" className="hover:text-primary-600">マガジン</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/journal?category=${article.category}`} className="hover:text-primary-600">
              {categoryLabels[article.category] ?? article.category}
            </Link>
          </nav>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
            {categoryLabels[article.category] ?? article.category}
          </span>
          {article.publishedAt && (
            <time className="text-xs text-gray-400" dateTime={article.publishedAt.toISOString()}>
              {article.publishedAt.toLocaleDateString("ja-JP")}
            </time>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-bold text-gray-900 leading-tight">
          {article.title}
        </h1>

        <p className="mt-2 text-xs text-gray-500">
          {article.authorName}
        </p>

        {/* Top CTA */}
        <div className="mt-6">
          <Link
            href="/jobs"
            className="flex w-full items-center justify-center gap-2 rounded bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition"
          >
            求人を探す
          </Link>
        </div>

        {/* Article body (HTML) */}
        <div
          className="article-body mt-8"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10  bg-primary-50 border border-primary-100 p-6 text-center">
          <p className="font-bold text-gray-900">建設業界の求人を探す</p>
          <p className="mt-1 text-sm text-gray-600">
            建設求人ポータルで、あなたに合った求人を見つけましょう。
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/jobs" className="rounded bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              求人を検索する
            </Link>
            <Link href="/register" className="rounded border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              無料会員登録
            </Link>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-bold text-gray-900 border-b pb-2">関連記事</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/journal/${r.slug}`} className="flex items-start gap-2 text-sm text-gray-700 hover:text-primary-600">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-gray-300" />
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/journal" className="text-sm text-primary-600 hover:underline">
            ← マガジン一覧に戻る
          </Link>
        </div>
      </article>
    </div>
  )
}
