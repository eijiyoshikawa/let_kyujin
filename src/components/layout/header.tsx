"use client"

import { useState } from "react"
import Link from "next/link"
import { HardHat, Search, User, Menu, X, Newspaper, Building2, Info } from "lucide-react"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white sticky top-0 z-50 border-b">

      {/* Main header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <HardHat className="h-7 w-7 text-primary-500" />
            <span className="text-lg font-bold text-gray-900">現場キャリア</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/about"
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-primary-600 transition"
            >
              サイトについて
            </Link>
            <Link
              href="/for-employers"
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-primary-600 transition"
            >
              企業の方はこちら
            </Link>
            <span className="mx-1 h-4 w-px bg-gray-200" />
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 transition"
            >
              <Search className="h-4 w-4" />
              求人検索
            </Link>
            <Link
              href="/journal"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 transition"
            >
              <Newspaper className="h-4 w-4" /> マガジン
            </Link>
            <Link
              href="/register"
              className="rounded bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
            >
              会員登録
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <User className="h-4 w-4" />
              ログイン
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden items-center justify-center rounded-md p-2 text-gray-600 hover:bg-primary-50"
            aria-label="メニューを開く"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            <Link
              href="/jobs"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Search className="h-4 w-4 text-primary-500" />
              求人検索
            </Link>
            <Link
              href="/journal"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Newspaper className="h-4 w-4 text-primary-500" /> マガジン
            </Link>
            <Link
              href="/for-employers"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Building2 className="h-4 w-4 text-primary-500" /> 企業の方へ
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Info className="h-4 w-4 text-primary-500" /> サイトについて
            </Link>
            <div className="border-t pt-2 mt-2 flex gap-2">
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded bg-primary-600 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-700"
              >
                会員登録
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                ログイン
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
