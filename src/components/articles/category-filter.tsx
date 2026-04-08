"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ARTICLE_CATEGORIES,
  CONSTRUCTION_SUBCATEGORIES,
} from "@/lib/article-constants"

export function CategoryFilter() {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") ?? ""
  const currentSubcategory = searchParams.get("subcategory") ?? ""

  const mainCategories = [
    { key: "", label: "すべて" },
    ...Object.entries(ARTICLE_CATEGORIES).map(([key, val]) => ({
      key,
      label: val.label,
    })),
  ]

  const subcategories = Object.entries(CONSTRUCTION_SUBCATEGORIES).map(
    ([key, val]) => ({ key, label: val.label })
  )

  return (
    <div className="space-y-3">
      {/* Main categories */}
      <div className="flex flex-wrap gap-2">
        {mainCategories.map((cat) => {
          const isActive = cat.key === currentCategory && !currentSubcategory
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

      {/* Construction subcategories (shown when construction is selected) */}
      {currentCategory === "construction" && (
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/journal?category=construction"
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              !currentSubcategory
                ? "bg-orange-600 text-white"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
            }`}
          >
            すべて
          </Link>
          {subcategories.map((sub) => {
            const isActive = currentSubcategory === sub.key
            return (
              <Link
                key={sub.key}
                href={`/journal?category=construction&subcategory=${sub.key}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? "bg-orange-600 text-white"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                }`}
              >
                {sub.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
