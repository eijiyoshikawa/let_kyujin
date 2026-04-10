import Link from "next/link"
import {
  ArrowRight,
  Phone,
  Building2,
  Users,
  Award,
  Briefcase,
  TrendingUp,
  MessageSquareQuote,
  ClipboardList,
  Headphones,
  FileEdit,
  PlayCircle,
  ChevronRight,
  CheckCircle,
  CircleAlert,
  Search,
  HardHat,
} from "lucide-react"
import type { Metadata } from "next"
import { AnimateOnScroll } from "@/components/animate-on-scroll"
import { LogoSlider } from "@/components/logo-slider"

export const metadata: Metadata = {
  title: "建設会社の採用担当者の方へ",
  description:
    "掲載無料・成果報酬型の求人掲載。建設業界に特化した求人ポータルで、建築・土木・設備の人材を採用。",
}

const jobCategories = [
  "建築・躯体工事の求人をお探しの方",
  "施工管理技術者をお探しの方",
  "土木作業員をお探しの方",
  "電気設備管理人材をお探しの方",
]

const reasons = [
  {
    icon: Users,
    title: "建設業界の求職者が集まるサイト",
    description: "建築・土木・設備・解体の求人に特化しているため、現場経験のある求職者が中心です。",
  },
  {
    icon: Award,
    title: "有資格者が多い",
    description: "施工管理技士・電気工事士・クレーン免許など、業界に必要な資格を持つ求職者が登録しています。",
  },
  {
    icon: Briefcase,
    title: "掲載からスカウトまで対応",
    description: "求人の掲載だけでなく、条件に合う求職者への直接スカウトも可能です。",
  },
]

const trackRecordPoints = [
  {
    title: "建設業界に特化",
    description: "掲載求人のほぼ全てが建設・設備・解体関連。業界の求職者に確実に届きます。",
  },
  {
    title: "スカウト機能",
    description: "登録求職者のプロフィールを閲覧し、直接メッセージを送ることができます。",
  },
]

const testimonials = [
  {
    company: "千葉県の総合建設会社（従業員50名）",
    comment: "大手の求人媒体では応募が来なかった施工管理のポジションで、2名の採用に至りました。業界特化のサイトだからこそだと思います。",
  },
  {
    company: "大阪府の電気設備会社（従業員30名）",
    comment: "掲載費が無料なので試しに使い始めましたが、有資格者からの応募があり驚きました。今は継続して利用しています。",
  },
  {
    company: "埼玉県の解体工事会社（従業員15名）",
    comment: "若い人の応募が少なくて困っていましたが、20代からの応募がありました。スカウト機能も使いやすいです。",
  },
]

const steps = [
  { icon: Headphones, label: "問い合わせ" },
  { icon: ClipboardList, label: "採用条件\nヒアリング" },
  { icon: FileEdit, label: "広告作成" },
  { icon: PlayCircle, label: "掲載開始" },
]

const comparisonRows = [
  {
    label: "登録ユーザー",
    ours: "建設業界の求職者が中心",
    major: "人口動態に比例",
    niche: "40〜50代が多い",
  },
  {
    label: "費用",
    ours: "月額0円（1人あたり10万円〜）\n求人を増やしても掲載費用無料",
    major: "月額30万円〜\n1求人ごとに費用が発生",
    niche: "月額6万円〜\n1求人ごとに費用が発生",
  },
  {
    label: "プラン",
    ours: "求人掲載＆スカウト",
    major: "求人掲載のみ\n（求職者からの応募待ち）",
    niche: "求人掲載のみ\n（求職者からの応募待ち）",
  },
  {
    label: "掲載可能な職種",
    ours: "建設、設備、解体等に特化した\n専門職をカバー",
    major: "ホワイトカラーの\n求人に特化",
    niche: "特定の職種に特化",
  },
  {
    label: "掲載期間",
    ours: "無期限（無料）",
    major: "1〜3ヶ月",
    niche: "1〜6ヶ月",
  },
]

export default function ForEmployersPage() {
  return (
    <div>
      {/* Hero Section - Blue gradient with form */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Left side - Text + Category links */}
            <div className="flex-1">
              <p className="text-sm text-blue-200">
                建設業・設備業など現場で働く人材の採用に特化
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                現場人材の採用なら
                <br />
                <span className="text-3xl sm:text-4xl lg:text-5xl">現場キャリア</span>
              </h1>

              {/* Stats row */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded bg-white/10 px-4 py-2">
                  <p className="text-xs text-blue-200">料金体系</p>
                  <p className="text-base font-bold text-white">掲載無料・成果報酬</p>
                </div>
                <div className="rounded bg-white/10 px-4 py-2">
                  <p className="text-xs text-blue-200">成果報酬</p>
                  <p className="text-base font-bold text-white">1人あたり10万円〜</p>
                </div>
                <div className="rounded bg-white/10 px-4 py-2">
                  <p className="text-xs text-blue-200">機能</p>
                  <p className="text-base font-bold text-white">スカウト対応</p>
                </div>
              </div>

              {/* Category links */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                {jobCategories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-sm font-medium text-blue-700"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Contact form card */}
            <div className="w-full shrink-0 rounded-xl bg-white p-6 shadow-xl lg:w-96">
              <h2 className="text-center text-lg font-bold text-gray-900">
                掲載をお考えの方はこちら
              </h2>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">電話番号</label>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>06-6786-8320</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="emp-email" className="block text-xs font-medium text-gray-600">メールアドレス</label>
                  <input
                    id="emp-email"
                    type="email"
                    placeholder="example@company.co.jp"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emp-company" className="block text-xs font-medium text-gray-600">会社名</label>
                  <input
                    id="emp-company"
                    type="text"
                    placeholder="株式会社○○建設"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <Link
                  href="/company/register"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
                >
                  資料請求する
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4 border-t pt-3 text-center">
                <p className="text-xs text-gray-500">電話でも受付中</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-lg font-bold text-gray-900">
                  <Phone className="h-4 w-4 text-blue-600" />
                  03-6845-3624
                </p>
                <p className="text-[10px] text-gray-400">平日 10:00〜19:00（土日祝除く）</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LogoSlider />

      {/* About Section */}
      <section className="bg-blue-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">現場キャリアとは</h2>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  建設業・設備業などの現場人材の採用に強みを持つ日本最大級の「現場人材採用サービス」です。
                  掲載無料・成果報酬型で、建築・土木・設備・解体など幅広い職種の人材採用をサポートします。
                </p>
              </div>
              <div className="flex h-36 w-52 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
                <HardHat className="h-14 w-14 text-blue-500" />
                <p className="mt-2 text-xs font-bold text-blue-600">建設業界特化</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 3 Reasons Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-2xl font-bold text-gray-900">
              現場キャリアが選ばれる<span className="text-blue-600">3つの理由</span>
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {reasons.map((r) => {
                const Icon = r.icon
                return (
                  <div key={r.title} className="text-center hover-lift rounded-xl">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                      <Icon className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-gray-900">{r.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{r.description}</p>
                  </div>
                )
              })}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Track Record Section */}
      <section className="border-t bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimateOnScroll animation="fade-up">
            <h2 className="text-2xl font-bold text-gray-900">
              サービスの特徴
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:justify-center">
              {trackRecordPoints.map((p) => (
                <div key={p.title} className="flex-1 rounded-xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">{p.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{p.description}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-2xl font-bold text-gray-900">
              お客様からの声
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="stagger">
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.company} className="rounded-xl border bg-white p-5 shadow-sm hover-lift">
                  <MessageSquareQuote className="h-6 w-6 text-blue-300" />
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{t.comment}</p>
                  <p className="mt-3 border-t pt-3 text-xs font-bold text-gray-900">{t.company}</p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Flow Section */}
      <section className="border-t bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-2xl font-bold text-gray-900">
              掲載までの流れ
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up">
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.label} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex flex-col items-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border-2 border-blue-600 bg-white shadow-sm">
                      <span className="absolute -top-2.5 -left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                        {i + 1}
                      </span>
                      <Icon className="h-7 w-7 text-blue-600" />
                    </div>
                    <span className="mt-2 text-center text-xs font-bold text-gray-900 whitespace-pre-line">
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-blue-400 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll>
            <h2 className="text-center text-2xl font-bold text-gray-900">
              他社との<span className="text-blue-600">料金・サービスの比較表</span>
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              現場キャリアは掲載無料、1人あたり10万円〜の成果報酬
              <br className="hidden sm:block" />
              採用のミスマッチが少ない人材を低コストで採用可能です
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up">
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-28 border border-gray-200 bg-gray-50 p-3"></th>
                  <th className="border-2 border-blue-600 bg-blue-600 p-3 text-white font-bold text-base">
                    現場キャリア
                  </th>
                  <th className="border border-gray-200 bg-blue-50 p-3 font-bold text-gray-700">
                    大手求人媒体
                  </th>
                  <th className="border border-gray-200 bg-blue-50 p-3 font-bold text-gray-700">
                    業界専門の<br />求人媒体
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <td className="border border-gray-200 bg-gray-50 p-3 text-center font-bold text-gray-700">
                      {row.label}
                    </td>
                    <td className="border-2 border-blue-600 bg-blue-50/30 p-3 text-center whitespace-pre-line">
                      <div className="flex items-start justify-center gap-1">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <span className="text-gray-900 font-medium">{row.ours}</span>
                      </div>
                    </td>
                    <td className="border border-gray-200 p-3 text-center text-gray-500 whitespace-pre-line">
                      <div className="flex items-start justify-center gap-1">
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                        <span>{row.major}</span>
                      </div>
                    </td>
                    <td className="border border-gray-200 p-3 text-center text-gray-500 whitespace-pre-line">
                      <div className="flex items-start justify-center gap-1">
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                        <span>{row.niche}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-blue-600 py-12">
        <AnimateOnScroll animation="fade-up">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white">
              まずは無料で掲載を始めましょう
            </h2>
            <p className="mt-2 text-blue-100">
              掲載料0円・成果報酬型。採用が決まるまで費用はかかりません。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/company/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-blue-600 shadow-lg hover:bg-blue-50 transition"
              >
                無料で企業登録する
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="tel:03-6845-3624"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white px-8 py-3.5 text-base font-bold text-white hover:bg-white/10 transition"
              >
                <Phone className="h-5 w-5" />
                03-6845-3624
              </a>
            </div>
          </div>
        </AnimateOnScroll>
      </section>
    </div>
  )
}
