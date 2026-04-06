import Link from "next/link"
import { Search, HardHat, Hammer, Wrench, Truck, Building2, Shovel, ArrowRight } from "lucide-react"

const categories = [
  { key: "construction", label: "建築・躯体工事", icon: HardHat, color: "bg-orange-50 text-orange-700", desc: "鳶職・型枠・鉄筋・大工" },
  { key: "civil", label: "土木工事", icon: Shovel, color: "bg-amber-50 text-amber-700", desc: "土木作業員・重機オペ・舗装" },
  { key: "electrical", label: "電気・設備工事", icon: Wrench, color: "bg-blue-50 text-blue-700", desc: "電気工事士・配管・空調" },
  { key: "interior", label: "内装・仕上げ工事", icon: Hammer, color: "bg-green-50 text-green-700", desc: "クロス・床・塗装・左官" },
  { key: "demolition", label: "解体・産廃", icon: Building2, color: "bg-red-50 text-red-700", desc: "解体工・産業廃棄物処理" },
  { key: "driver", label: "ドライバー・重機", icon: Truck, color: "bg-purple-50 text-purple-700", desc: "ダンプ・トレーラー・重機運転" },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-amber-700 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            建設業界の
            <br className="sm:hidden" />
            求人を探す
          </h1>
          <p className="mt-4 text-lg text-orange-100">
            建築・土木・設備・解体に特化した求人サイト。ハローワーク求人も掲載中。
          </p>

          {/* Search Form */}
          <form
            action="/jobs"
            method="GET"
            className="mx-auto mt-8 flex max-w-2xl gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                placeholder="職種・キーワードで検索"
                className="w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-orange-600 shadow-sm hover:bg-orange-50"
            >
              検索
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900">職種から探す</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={`/jobs?category=${cat.key}`}
                className={`flex items-center gap-4 rounded-lg border p-5 transition hover:shadow-md ${cat.color}`}
              >
                <cat.icon className="h-8 w-8 shrink-0" />
                <div>
                  <p className="font-semibold">{cat.label}</p>
                  <p className="text-sm opacity-75">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                建設会社の採用担当者の方へ
              </h2>
              <p className="mt-1 text-gray-600">
                掲載無料・成果報酬型。採用が決まるまで費用はかかりません。
              </p>
            </div>
            <Link
              href="/for-employers"
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700"
            >
              詳しく見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
