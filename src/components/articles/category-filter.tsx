"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ARTICLE_CATEGORIES } from "@/lib/article-constants"

export function CategoryFilter() {
  const searchParams = useSearchParams()
  const current = searchParams.get("category") ?? ""

  const allCategories = [
    { key: "", label: "すべて" },
    ...Object.entries(ARTICLE_CATEGORIES).map(([key, val]) => ({
      key,
      label: val.label,
    })),
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => {
        const isActive = cat.key === current
        return (
          <Link
            key={cat.key}
            href={cat.key ? `/journal?category=${cat.key}` : "/journal"}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </Link>
        )
      })}
    </div>
  )
}
