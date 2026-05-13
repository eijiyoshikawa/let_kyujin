"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X, Newspaper, Building2, MessageCircle } from "lucide-react"
import { BrandLogo } from "./brand-logo"
import { LinkButton } from "@/components/ui/button"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" aria-label="ゲンバキャリア トップへ">
            <BrandLogo />
          </Link>

          {/* Desktop nav — シンプル化 */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
            >
              <Search className="h-4 w-4" />
              求人を探す
            </Link>
            <Link
              href="/journal"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
            >
              <Newspaper className="h-4 w-4" />
              マガジン
            </Link>
            <Link
              href="/for-employers"
              className="px-3 py-2 text-xs text-gray-500 hover:text-primary-600 transition"
            >
              企業の方
            </Link>
            <LinkButton
              href="/login"
              variant="secondary"
              size="md"
              className="ml-1 border-primary-600 text-primary-600 hover:bg-primary-50"
            >
              ログイン
            </LinkButton>
            <LinkButton
              href="/register"
              variant="primary"
              size="md"
              className="bg-primary-500 hover:bg-primary-600 shadow-sm"
            >
              <MessageCircle className="h-4 w-4" />
              無料で始める
            </LinkButton>
          </nav>

          {/* Mobile menu button — 44px タップ領域 */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden h-11 w-11 items-center justify-center text-gray-700 hover:bg-gray-100"
            aria-label="メニューを開く"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            <Link
              href="/jobs"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Search className="h-4 w-4 text-primary-500" />
              求人を探す
            </Link>
            <Link
              href="/journal"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Newspaper className="h-4 w-4 text-primary-500" />
              マガジン
            </Link>
            <Link
              href="/for-employers"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Building2 className="h-4 w-4 text-primary-500" />
              企業の方
            </Link>
            <div className="border-t pt-3 mt-2 grid grid-cols-2 gap-2">
              <LinkButton
                href="/login"
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => setMenuOpen(false)}
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                ログイン
              </LinkButton>
              <LinkButton
                href="/register"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setMenuOpen(false)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                無料で始める
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
