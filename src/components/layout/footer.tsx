import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">求職者の方へ</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900">
                  求人検索
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                  会員登録
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">企業の方へ</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/for-employers" className="text-sm text-gray-600 hover:text-gray-900">
                  掲載について
                </Link>
              </li>
              <li>
                <Link href="/company/register" className="text-sm text-gray-600 hover:text-gray-900">
                  企業登録
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">サイト情報</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  サイトについて
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">運営会社</h3>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>株式会社LET</p>
              <p className="text-xs">大阪府大阪市中央区南久宝寺町4-4-12</p>
              <p className="text-xs">IB CENTERビル8F</p>
              <p className="text-xs">TEL: 06-6786-8320</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-gray-500">
          <p>ハローワーク求人はハローワークインターネットサービスより転載しています。</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} 株式会社LET. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
