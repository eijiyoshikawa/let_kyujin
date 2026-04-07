import Link from "next/link"
import { Calendar } from "lucide-react"

type RelatedArticle = {
  slug: string
  title: string
  publishedAt: Date | null
  categorySlug: string
}

export function RelatedArticles({ articles }: { articles: RelatedArticle[] }) {
  if (articles.length === 0) return null

  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="mb-4 text-base font-bold text-gray-900">関連記事</h2>
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/journal/${article.categorySlug}/${article.slug}`}
              className="group block"
            >
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </p>
              {article.publishedAt && (
                <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
