"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, Newspaper, Building2 } from "lucide-react"
import { LinkButton } from "@/components/ui/button"

/**
 * モバイルメニュー専用の Client Component。
 *
 * Header 本体を Server Component に保ち、開閉状態だけをこの薄い
 * Client コンポーネントに閉じ込めることで、全画面に乗る Hydration
 * コストを最小化する。
 */
export function HeaderMobileMenu() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex md:hidden h-11 w-11 items-center justify-center text-gray-700 hover:bg-gray-100"
        aria-label="メニューを開く"
        aria-expanded={open}
        aria-controls="header-mobile-drawer"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div
          id="header-mobile-drawer"
          className="md:hidden border-t border-gray-100 bg-white absolute inset-x-0 top-16 z-40"
        >
          <nav className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            <Link
              href="/jobs"
              onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Search className="h-4 w-4 text-primary-500" />
              求人を探す
            </Link>
            <Link
              href="/journal"
              onClick={close}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-primary-50"
            >
              <Newspaper className="h-4 w-4 text-primary-500" />
              マガジン
            </Link>
            <Link
              href="/for-employers"
              onClick={close}
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
                onClick={close}
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                ログイン
              </LinkButton>
              <LinkButton
                href="/register"
                variant="primary"
                size="lg"
                fullWidth
                onClick={close}
                className="bg-primary-500 hover:bg-primary-600"
              >
                無料で始める
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
