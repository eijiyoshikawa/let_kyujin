import Link from "next/link"
import { HardHat, Search, User, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-blue-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-8 items-center justify-between text-xs text-blue-100">
            <span>建築・土木・設備・解体の求人サイト</span>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/about" className="hover:text-white">
                サイトについて
              </Link>
              <Link href="/for-employers" className="hover:text-white">
                企業の方はこちら
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <HardHat className="h-7 w-7 text-blue-600" />
            <div>
              <span className="text-lg font-bold text-gray-900">建設求人ポータル</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Search className="h-4 w-4" />
              求人検索
            </Link>
            <Link
              href="/journal"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              📰 マガジン
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              会員登録
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <User className="h-4 w-4" />
              ログイン
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-gray-600"
            >
              <User className="h-4 w-4" />
            </Link>
            <Link
              href="/jobs"
              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
            >
              <Search className="h-3.5 w-3.5" />
              検索
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
