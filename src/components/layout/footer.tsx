import Link from "next/link"
import { HardHat, CirclePlay, Camera } from "lucide-react"

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <HardHat className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">現場キャリア</span>
            </Link>
            <p className="mt-2 text-xs text-gray-400 max-w-xs leading-relaxed">
              建築・土木・設備・解体に特化した建設業界専門の求人サイトです。
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Link
              href="/register"
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              会員登録（無料）
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-gray-500 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
            >
              ヘルプ・お問い合わせ
            </Link>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-white">求職者の方へ</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/jobs" className="text-xs text-gray-400 hover:text-white transition">求人検索</Link></li>
              <li><Link href="/register" className="text-xs text-gray-400 hover:text-white transition">会員登録</Link></li>
              <li><Link href="/login" className="text-xs text-gray-400 hover:text-white transition">ログイン</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">企業の方へ</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/for-employers" className="text-xs text-gray-400 hover:text-white transition">掲載について</Link></li>
              <li><Link href="/company/register" className="text-xs text-gray-400 hover:text-white transition">企業登録</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">コンテンツ</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/journal" className="text-xs text-gray-400 hover:text-white transition">マガジン</Link></li>
              <li><Link href="/about" className="text-xs text-gray-400 hover:text-white transition">サイトについて</Link></li>
              <li><Link href="/terms" className="text-xs text-gray-400 hover:text-white transition">利用規約</Link></li>
              <li><Link href="/privacy" className="text-xs text-gray-400 hover:text-white transition">プライバシーポリシー</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">運営会社</h3>
            <div className="mt-3 space-y-1 text-xs text-gray-400">
              <p>株式会社LET</p>
              <p>大阪府大阪市中央区南久宝寺町</p>
              <p>4-4-12 IB CENTERビル8F</p>
              <p>TEL: 06-6786-8320</p>
              <p className="mt-2 text-gray-500">有料職業紹介事業</p>
              <p>許可番号: 27-ユ-304693</p>
            </div>
          </div>
        </div>

        {/* SNS + Bottom */}
        <div className="mt-8 border-t border-gray-700 pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">公式SNS</span>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white transition" aria-label="YouTube">
                <CirclePlay className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-gray-300 hover:bg-pink-600 hover:text-white transition" aria-label="Instagram">
                <Camera className="h-4 w-4" />
              </a>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs text-gray-500">
                有料職業紹介事業許可番号 27-ユ-304693 | ハローワーク求人はハローワークインターネットサービスより転載
              </p>
              <p className="mt-1 text-xs text-gray-500">
                &copy; {new Date().getFullYear()} 株式会社LET. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
