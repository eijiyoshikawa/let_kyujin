import Link from "next/link"
import Image from "next/image"
import {
  ARTICLE_CATEGORIES,
  CONSTRUCTION_SUBCATEGORIES,
  type ArticleCategory,
  type ConstructionSubcategory,
} from "@/lib/article-constants"

type ArticleCardProps = {
  slug: string
  title: string
  category: string
  subcategory?: string | null
  imageUrl: string
  excerpt: string
  publishedAt: Date
  author: { name: string }
}

export function ArticleCard({ article }: { article: ArticleCardProps }) {
  const cat = ARTICLE_CATEGORIES[article.category as ArticleCategory]
  const sub = article.subcategory
    ? CONSTRUCTION_SUBCATEGORIES[article.subcategory as ConstructionSubcategory]
    : null

  return (
    <Link
      href={`/journal/${article.slug}`}
      className="group block overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md hover:border-blue-300"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5">
          {cat && (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}
            >
              {cat.label}
            </span>
          )}
          {sub && (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${sub.color}`}
            >
              {sub.label}
            </span>
          )}
        </div>
        <h3 className="mt-2 text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
          {article.title}
        </h3>
        <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{article.author.name}</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {article.publishedAt.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </div>
    </Link>
  )
}
