import Link from "next/link"
import { HardHat, Search, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <HardHat className="mx-auto h-16 w-16 text-primary-300" />
      <h1 className="mt-6 text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-lg text-gray-600">
        ページが見つかりませんでした
      </p>
      <p className="mt-1 text-sm text-gray-500">
        お探しのページは削除されたか、URLが間違っている可能性があります。
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center gap-2 bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Search className="h-4 w-4" />
          求人を検索する
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Home className="h-4 w-4" />
          トップページへ
        </Link>
      </div>
    </div>
  )
}
