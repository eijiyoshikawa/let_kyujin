import Link from "next/link"
import { Calendar, Tag } from "lucide-react"

type ArticleCardProps = {
  slug: string
  title: string
  metaDescription: string | null
  publishedAt: Date | null
  categorySlug: string
  categoryName: string
  tags: string[]
}

export function ArticleCard({ article }: { article: ArticleCardProps }) {
  return (
    <Link
      href={`/journal/${article.categorySlug}/${article.slug}`}
      className="group block rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-300"
    >
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-medium text-blue-700">
          {article.categoryName}
        </span>
        {article.publishedAt && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(article.publishedAt)}
          </span>
        )}
      </div>
      <h3 className="mt-2 text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {article.title}
      </h3>
      {article.metaDescription && (
        <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">
          {article.metaDescription}
        </p>
      )}
      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
