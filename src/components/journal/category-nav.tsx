import Link from "next/link"
import { cn } from "@/lib/utils"

type Category = {
  slug: string
  name: string
}

export function CategoryNav({
  categories,
  currentSlug,
}: {
  categories: Category[]
  currentSlug?: string
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href="/journal"
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition",
          !currentSlug
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        すべて
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/journal/${cat.slug}`}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            currentSlug === cat.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {cat.name}
        </Link>
      ))}
    </nav>
  )
}
