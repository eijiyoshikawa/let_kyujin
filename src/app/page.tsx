import Link from "next/link"
import Image from "next/image"
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
  Smartphone,
  HeadphonesIcon,
  Newspaper,
  MessageSquareQuote,
  Bell,
  User,
  Star,
} from "lucide-react"
import { PREFECTURES } from "@/lib/constants"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { LogoSlider } from "@/components/logo-slider"

const categories = [
  { key: "construction", label: "建築・躯体工事", icon: HardHat, sub: "鳶職・型枠・鉄筋・大工" },
  { key: "civil", label: "土木工事", icon: Shovel, sub: "土木作業員・重機オペ・舗装" },
  { key: "electrical", label: "電気・設備工事", icon: Wrench, sub: "電気工事士・配管・空調" },
  { key: "interior", label: "内装・仕上げ工事", icon: Hammer, sub: "クロス・床・塗装・左官" },
  { key: "demolition", label: "解体・産廃", icon: Building2, sub: "解体工・産業廃棄物処理" },
  { key: "driver", label: "ドライバー・重機", icon: Truck, sub: "ダンプ・トレーラー・重機運転" },
  { key: "management", label: "施工管理", icon: ClipboardCheck, sub: "現場監督・工程管理" },
  { key: "survey", label: "測量・設計", icon: Ruler, sub: "測量士・CADオペ" },
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

const areaCategoryLinks = [
  { key: "construction", label: "建築" },
  { key: "civil", label: "土木" },
  { key: "electrical", label: "電気" },
  { key: "management", label: "施工管理" },
]

const magazineArticles = [
  { slug: "construction-career-guide", title: "建設業界への転職ガイド — 職種・資格・年収を徹底解説", category: "転職ガイド", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop" },
  { slug: "tobi-salary", title: "鳶職の年収はどれくらい？経験年数別の給与相場", category: "年収・給与", imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop" },
  { slug: "electrician-license", title: "電気工事士の資格取得ガイド — 試験内容と勉強法", category: "資格", imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop" },
]

const testimonials = [
  { name: "田中 健太", age: 32, from: "飲食業", to: "鳶職人", comment: "未経験から始めましたが、先輩が丁寧に教えてくれて3年で一人前になれました。年収も前職より150万円アップしました。" },
  { name: "佐藤 雅之", age: 28, from: "工場作業員", to: "電気工事士", comment: "資格取得のサポートが手厚く、働きながら電気工事士の資格を取得できました。安定した職場環境に満足しています。" },
  { name: "鈴木 翔太", age: 35, from: "営業職", to: "施工管理", comment: "コミュニケーション能力が活かせる施工管理に転職。やりがいも給与も前職以上で、転職して正解でした。" },
]

const newsItems = [
  { date: "2026/04/01", title: "建設求人ポータル — サービスリニューアルのお知らせ" },
  { date: "2026/03/15", title: "2026年度 建設業界の採用動向レポートを公開しました" },
  { date: "2026/03/01", title: "ハローワーク求人連携機能をアップデートしました" },
  { date: "2026/02/20", title: "建設求人マガジンに新カテゴリ「業界知識」を追加" },
]

export default async function HomePage() {
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600">
        <Image
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=600&fit=crop"
          alt=""
          fill
          priority
          className="object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.3),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center">
            <p className="text-sm font-medium tracking-widest text-blue-300 uppercase">
              建築・土木・設備・解体に特化
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              <span className="block">建設求人ポータル</span>
            </h1>
            <p className="mt-4 text-lg text-blue-200">
              建設業界で働く、すべての人のための求人サイト
            </p>
          </div>

          <form
            action="/jobs"
            method="GET"
            className="relative z-10 mx-auto mt-10 max-w-3xl rounded-2xl bg-white/95 backdrop-blur-sm p-4 shadow-2xl -mb-8"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="sr-only" htmlFor="hero-category">職種</label>
                <select id="hero-category" name="category" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">職種を選択</option>
                  {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="sr-only" htmlFor="hero-prefecture">勤務地</label>
                <select id="hero-prefecture" name="prefecture" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="">勤務地を選択</option>
                  {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/25">
                <Search className="h-4 w-4" />
                求人検索
              </button>
            </div>
          </form>
        </div>
      </section>

      <LogoSlider />

      {/* Category List */}
      <section className="bg-white pt-10 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Star className="h-5 w-5 text-amber-500" />
              人気の求人特集
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="mt-4 divide-y divide-gray-100 rounded-xl border">
              {categoriesWithCounts.map((cat, i) => {
                const Icon = cat.icon
                return (
                  <div key={cat.key}>
                    <Link href={`/jobs?category=${cat.key}`} className="flex items-center gap-4 py-3.5 hover:bg-blue-50/50 transition px-4 hover-lift">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                        <Icon className="h-4.5 w-4.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-gray-900">{cat.label}</span>
                          <span className="text-sm font-medium text-blue-600">({cat.count.toLocaleString()})</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{cat.sub}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                    </Link>
                    {i === 2 && (
                      <div className="flex gap-3 justify-center py-4 bg-gray-50/50 border-y border-gray-100">
                        <Link href="/register" className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                          <User className="h-4 w-4" />
                          会員登録する
                        </Link>
                        <Link href="/login" className="flex items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition">
                          ログイン
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Popular Areas */}
      <section className="border-t bg-gradient-to-b from-gray-50 to-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <MapPin className="h-5 w-5 text-blue-600" />
              注目職種を人気エリアから探す
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {popularAreas.map((area) => (
                <div key={area.slug} className="rounded-xl border bg-white p-3 hover-lift">
                  <Link href={`/jobs?prefecture=${area.pref}`} className="text-sm font-bold text-gray-900 hover:text-blue-600">{area.pref}</Link>
                  <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                    {areaCategoryLinks.map((cat) => (
                      <Link key={cat.key} href={`/${area.pref}/${cat.key}`} className="text-xs text-blue-600 hover:underline">{cat.label}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Magazine Section */}
      <section className="border-t bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-white font-bold">
                <Newspaper className="h-5 w-5" />
                建設求人マガジン
              </h2>
              <Link href="/journal" className="flex items-center gap-1 text-sm text-blue-200 hover:text-white transition">
                もっと見る <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="rounded-b-xl border border-t-0 p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                {magazineArticles.map((article) => (
                  <Link key={article.slug} href={`/journal/${article.slug}`} className="group rounded-xl border bg-white overflow-hidden hover-lift">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={article.imageUrl} alt={article.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
                      <span className="absolute top-2 left-2 rounded-lg bg-blue-600/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">{article.category}</span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">{article.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-gradient-to-b from-gray-50 to-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <MessageSquareQuote className="h-5 w-5 text-blue-600" />
              転職体験談
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="relative rounded-xl border bg-white p-5 shadow-sm hover-lift">
                  <div className="absolute -top-3 left-5">
                    <MessageSquareQuote className="h-6 w-6 text-blue-200" />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}（{t.age}歳）</p>
                      <p className="text-xs text-gray-500">
                        <span className="text-gray-400">{t.from}</span>
                        <span className="mx-1 text-blue-500">→</span>
                        <span className="font-medium text-blue-600">{t.to}</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">「{t.comment}」</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 3 Merits Section */}
      <section className="border-t bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnScroll>
            <h2 className="text-xl font-bold text-gray-900">
              建設求人ポータルを活用する<span className="gradient-text">メリット</span>と<span className="gradient-text">3つの特徴</span>
            </h2>
            <p className="mt-2 text-sm text-gray-600">建設求人ポータルは、建設業界で働く方を応援する求人サービスです。</p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="mt-8 space-y-5">
              <MeritCard number="01" title="「建設業界」特化の求人サービス" description="建築・土木・設備・解体など建設業界に特化。他の総合求人サイトでは見つからない専門職の求人が豊富に掲載されています。" icon={<HardHat className="h-6 w-6" />} />
              <MeritCard number="02" title={<>おすすめ求人が受け取れるため<span className="gradient-text">スキマ時間</span>に求人を見つけられる</>} description="会員登録すると、あなたの希望条件にマッチした求人情報をお届け。忙しい現場仕事の合間でも効率的に転職活動ができます。" icon={<Smartphone className="h-6 w-6" />} />
              <MeritCard number="03" title={<>登録すれば<span className="gradient-text">転職相談サポート</span>も受けられる</>} description="建設業界に詳しい専任スタッフが、資格取得から面接対策までサポート。安心して転職活動を進められます。" icon={<HeadphonesIcon className="h-6 w-6" />} />
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* News */}
      <section className="border-t bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Bell className="h-5 w-5 text-blue-600" />
              お知らせ
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="mt-4 divide-y divide-gray-100 rounded-xl border">
              {newsItems.map((item, i) => (
                <div key={i} className="flex gap-4 px-4 py-3.5 text-sm hover:bg-gray-50 transition cursor-pointer">
                  <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 tabular-nums">{item.date}</span>
                  <span className="text-gray-700 hover:text-blue-600 transition">{item.title}</span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 py-12">
        <AnimateOnScroll animation="scale">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl sm:text-5xl font-extrabold text-white">{totalJobs.toLocaleString()}+</p>
                <p className="text-sm text-blue-200 mt-2">掲載求人数</p>
              </div>
              <div>
                <p className="text-3xl sm:text-5xl font-extrabold text-white">47</p>
                <p className="text-sm text-blue-200 mt-2">都道府県対応</p>
              </div>
              <div>
                <p className="text-3xl sm:text-5xl font-extrabold text-white">無料</p>
                <p className="text-sm text-blue-200 mt-2">会員登録</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* CTA for Employers */}
      <section className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll animation="slide-left">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">建設会社の採用担当者の方へ</h2>
                <p className="mt-1 text-gray-400">掲載無料・成果報酬型。採用が決まるまで費用はかかりません。</p>
              </div>
              <div className="flex gap-3">
                <Link href="/for-employers" className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/25">
                  詳しく見る <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/company/register" className="flex items-center gap-2 rounded-xl border border-gray-500 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
                  企業登録
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  )
}

function MeritCard({ number, title, description, icon }: { number: string; title: React.ReactNode; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white p-5 text-left shadow-sm border hover-lift">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-lg shadow-md">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>
    </div>
  )
}
