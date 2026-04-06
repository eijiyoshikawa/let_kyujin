import Link from "next/link"
import { prisma } from "@/lib/db"
import {
  Search,
  HardHat,
  Hammer,
  Wrench,
  Truck,
  Building2,
  Shovel,
  ClipboardCheck,
  Ruler,
  ArrowRight,
  ChevronRight,
  MapPin,
  Users,
  Smartphone,
  HeadphonesIcon,
} from "lucide-react"
import { PREFECTURES } from "@/lib/constants"

const categories = [
  { key: "construction", label: "建築・躯体工事", icon: HardHat, count: null, sub: "鳶職・型枠・鉄筋・大工" },
  { key: "civil", label: "土木工事", icon: Shovel, count: null, sub: "土木作業員・重機オペ・舗装" },
  { key: "electrical", label: "電気・設備工事", icon: Wrench, count: null, sub: "電気工事士・配管・空調" },
  { key: "interior", label: "内装・仕上げ工事", icon: Hammer, count: null, sub: "クロス・床・塗装・左官" },
  { key: "demolition", label: "解体・産廃", icon: Building2, count: null, sub: "解体工・産業廃棄物処理" },
  { key: "driver", label: "ドライバー・重機", icon: Truck, count: null, sub: "ダンプ・トレーラー・重機運転" },
  { key: "management", label: "施工管理", icon: ClipboardCheck, count: null, sub: "現場監督・工程管理" },
  { key: "survey", label: "測量・設計", icon: Ruler, count: null, sub: "測量士・CADオペ" },
]

const popularAreas = [
  { pref: "東京都", slug: "tokyo" },
  { pref: "大阪府", slug: "osaka" },
  { pref: "愛知県", slug: "aichi" },
  { pref: "神奈川県", slug: "kanagawa" },
  { pref: "福岡県", slug: "fukuoka" },
  { pref: "埼玉県", slug: "saitama" },
  { pref: "千葉県", slug: "chiba" },
  { pref: "北海道", slug: "hokkaido" },
  { pref: "兵庫県", slug: "hyogo" },
  { pref: "広島県", slug: "hiroshima" },
  { pref: "宮城県", slug: "miyagi" },
  { pref: "静岡県", slug: "shizuoka" },
]

export default async function HomePage() {
  // Get category counts
  const categoryCounts = await prisma.job.groupBy({
    by: ["category"],
    where: { status: "active" },
    _count: true,
  }).catch(() => [])

  const totalJobs = categoryCounts.reduce((sum, c) => sum + c._count, 0)

  const categoriesWithCounts = categories.map((cat) => ({
    ...cat,
    count: categoryCounts.find((c) => c.category === cat.key)?._count ?? 0,
  }))

  return (
    <div>
      {/* Hero Section - Blue gradient like reference */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-600 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              建設業界特化の求人サイト
            </h1>
            <p className="mt-2 text-blue-100">
              建築・土木・設備・解体の求人を探す
            </p>
          </div>

          {/* Search Form - Like reference with dropdowns */}
          <form
            action="/jobs"
            method="GET"
            className="mx-auto mt-6 max-w-3xl rounded-lg bg-white p-3 shadow-lg"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <select
                  name="category"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700"
                >
                  <option value="">職種を選択</option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <select
                  name="prefecture"
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-700"
                >
                  <option value="">勤務地を選択</option>
                  {PREFECTURES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Search className="h-4 w-4" />
                求人検索
              </button>
            </div>
            <div className="mt-2 text-center">
              <Link
                href="/register"
                className="text-xs text-blue-600 hover:underline"
              >
                詳細条件を設定して探す →
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* Category List - Like reference with counts */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <HardHat className="h-5 w-5 text-blue-600" />
            人気の求人特集
          </h2>
          <div className="mt-4 divide-y divide-gray-100">
            {categoriesWithCounts.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.key}
                  href={`/jobs?category=${cat.key}`}
                  className="flex items-center gap-4 py-3.5 hover:bg-gray-50 transition rounded-md px-2 -mx-2"
                >
                  <Icon className="h-5 w-5 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-gray-900">
                        {cat.label}
                      </span>
                      <span className="text-sm text-blue-600">
                        ({cat.count.toLocaleString()})
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              会員登録する
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              ログイン
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Areas Grid - Like reference */}
      <section className="border-t bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            注目職種を人気エリアから探す
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {popularAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/jobs?prefecture=${area.pref}`}
                className="flex flex-col items-center rounded-lg border bg-white p-3 text-center hover:shadow-md transition"
              >
                <span className="text-sm font-medium text-gray-900">
                  {area.pref}
                </span>
                <span className="mt-0.5 text-xs text-blue-600">求人を見る</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Magazine Section - Like reference クロスワーク・マガジン */}
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              📰 建設求人マガジン
            </h2>
            <Link
              href="/journal"
              className="text-sm text-blue-600 hover:underline"
            >
              もっと見る →
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Link
              href="/journal"
              className="group rounded-lg border bg-white overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-video bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-lg font-bold">建設業界のキャリアガイド</span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  建設業界への転職を考える方へ — 職種・資格・年収ガイド
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  建設業界の職種別の仕事内容や必要な資格、年収相場をまとめました。
                </p>
              </div>
            </Link>
            <Link
              href="/journal"
              className="group rounded-lg border bg-white overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">転職体験談</span>
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  異業種から建設業界へ — 転職成功者インタビュー
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  未経験から建設業界で活躍している方々の体験談を紹介します。
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Merits Section - Like reference */}
      <section className="border-t bg-blue-50 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">
            建設求人ポータルを活用する<span className="text-blue-600">メリット</span>と<span className="text-blue-600">3つの特徴</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            建設求人ポータルは、建設業界で働く方を応援する求人サービスです。
          </p>

          <div className="mt-8 space-y-6">
            <MeritCard
              number="01"
              title="「建設業界」特化の求人サービス"
              description="建築・土木・設備・解体など建設業界に特化。他の総合求人サイトでは見つからない専門職の求人が豊富に掲載されています。"
              icon={<HardHat className="h-6 w-6" />}
            />
            <MeritCard
              number="02"
              title={<>おすすめ求人が受け取れるため<span className="text-blue-600">スキマ時間</span>に求人を見つけられる</>}
              description="会員登録すると、あなたの希望条件にマッチした求人情報をお届け。忙しい現場仕事の合間でも効率的に転職活動ができます。"
              icon={<Smartphone className="h-6 w-6" />}
            />
            <MeritCard
              number="03"
              title={<>登録すれば<span className="text-blue-600">転職相談サポート</span>も受けられる</>}
              description="建設業界に詳しい専任スタッフが、資格取得から面接対策までサポート。安心して転職活動を進められます。"
              icon={<HeadphonesIcon className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalJobs.toLocaleString()}+</p>
              <p className="text-xs text-gray-500 mt-1">掲載求人数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">47</p>
              <p className="text-xs text-gray-500 mt-1">都道府県対応</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">無料</p>
              <p className="text-xs text-gray-500 mt-1">会員登録</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Employers */}
      <section className="border-t bg-gray-900 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                建設会社の採用担当者の方へ
              </h2>
              <p className="mt-1 text-gray-400">
                掲載無料・成果報酬型。採用が決まるまで費用はかかりません。
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/for-employers"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                詳しく見る
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/company/register"
                className="flex items-center gap-2 rounded-lg border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                企業登録
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MeritCard({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: React.ReactNode
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex gap-4 rounded-lg bg-white p-5 text-left shadow-sm border">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center text-blue-600">
        {icon}
      </div>
    </div>
  )
}
