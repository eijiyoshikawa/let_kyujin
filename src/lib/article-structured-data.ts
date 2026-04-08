const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"

type ArticleInput = {
  slug: string
  title: string
  excerpt: string
  imageUrl: string
  author: {
    name: string
  }
  publishedAt: Date
  updatedAt: Date
}

export function generateArticleSchema(
  article: ArticleInput
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "現場キャリア",
      url: BASE_URL,
    },
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    url: `${BASE_URL}/journal/${article.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/journal/${article.slug}`,
    },
  }
}
