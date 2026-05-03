import Link from "next/link"
import { SearchX } from "lucide-react"

export function HwEmptyState() {
  return (
    <div className="rounded-lg border bg-white py-12 text-center shadow-sm">
      <SearchX className="mx-auto h-10 w-10 text-gray-300" />
      <p className="mt-3 text-sm font-semibold text-gray-700">該当する求人が見つかりませんでした</p>
      <p className="mt-1 text-xs text-gray-500">条件を変えて再度検索してください。</p>
      <Link
        href="/hw-jobs"
        className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        条件をリセット
      </Link>
    </div>
  )
}
