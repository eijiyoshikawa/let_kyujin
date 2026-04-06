import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

// Static articles (will be replaced with WordPress/CMS later)
const articles: Record<
  string,
  { title: string; category: string; date: string; content: string[] }
> = {
  "construction-career-guide": {
    title: "建設業界への転職ガイド — 未経験から始める建設キャリア",
    category: "転職ガイド",
    date: "2026-04-01",
    content: [
      "建設業界は日本経済を支える基幹産業のひとつです。高齢化による人材不足が深刻化する中、未経験者の採用に積極的な企業が増えています。",
      "## 建設業界の主な職種",
      "建設業界には多様な職種があります。大きく分けると、建築工事（鳶職、大工、型枠、鉄筋）、土木工事（土木作業員、重機オペレーター）、設備工事（電気工事士、配管工）、内装工事（クロス、塗装、左官）、施工管理（現場監督）などがあります。",
      "## 未経験でも始められる？",
      "多くの建設会社では未経験者を歓迎しています。入社後にOJTで技術を学びながら、各種資格の取得支援制度を利用してキャリアアップすることが可能です。",
      "## 年収はどれくらい？",
      "建設業界の年収は職種や経験によって大きく異なります。未経験の場合は月給20万円〜25万円程度からスタートし、経験を積むと月給30万円〜50万円以上も十分に狙えます。施工管理技士の資格を持つと年収600万円〜800万円も珍しくありません。",
      "## おすすめの資格",
      "建設業界でキャリアアップを目指すなら、以下の資格取得がおすすめです：",
      "- **玉掛け技能講習**: クレーンで荷物を吊り上げる作業に必要\n- **足場の組立て等特別教育**: 足場作業の基本資格\n- **車両系建設機械運転技能講習**: 重機オペレーターに必須\n- **電気工事士（第二種）**: 電気工事の入門資格\n- **施工管理技士（2級）**: 現場監督を目指すなら必須",
      "## まとめ",
      "建設業界は未経験からでもチャレンジでき、技術と資格を身につけることで着実に収入アップが見込める業界です。まずは求人を探して、気になる企業に応募してみましょう。",
    ],
  },
  "tobi-salary": {
    title: "鳶職人の年収は？月収50万円以上も可能な高収入の理由",
    category: "年収・給与",
    date: "2026-03-28",
    content: [
      "鳶職人は建設業界でも特に高い収入が期待できる職種のひとつです。その理由と、実際の年収データを紹介します。",
      "## 鳶職人の平均年収",
      "鳶職人の平均年収は約450万円〜550万円程度です。ただし、経験年数や地域、雇用形態によって大きく異なります。",
      "## 経験年数別の月収目安",
      "- **1〜3年目**: 月給22万円〜28万円\n- **3〜5年目**: 月給28万円〜35万円\n- **5〜10年目**: 月給35万円〜45万円\n- **10年以上（親方クラス）**: 月給45万円〜60万円以上",
      "## 高収入の理由",
      "鳶職人の収入が高い理由は主に3つあります。第一に、高所作業という危険を伴う作業であること。第二に、高度な技術と経験が必要であること。第三に、深刻な人手不足により需要が高まっていることです。",
      "## 収入を上げるポイント",
      "鳶職人として収入を上げるためには、とび技能士（国家資格）の取得が有効です。また、一人親方として独立すれば、さらに高い収入を得ることも可能です。",
    ],
  },
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articles[slug]
  if (!article) return { title: "記事が見つかりません" }
  return {
    title: article.title,
    description: article.content[0],
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles[slug]

  if (!article) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">トップ</Link>
        <span className="mx-1">/</span>
        <Link href="/journal" className="hover:text-gray-700">マガジン</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-900">{article.category}</span>
      </nav>

      <div className="flex items-center gap-2">
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          {article.category}
        </span>
        <span className="text-xs text-gray-400">{article.date}</span>
      </div>

      <h1 className="mt-3 text-2xl font-bold text-gray-900">{article.title}</h1>

      <div className="mt-8 prose prose-gray max-w-none">
        {article.content.map((block, i) => {
          if (block.startsWith("## ")) {
            return (
              <h2 key={i} className="mt-8 mb-3 text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
                {block.slice(3)}
              </h2>
            )
          }
          if (block.startsWith("- ")) {
            const items = block.split("\n").filter((l) => l.startsWith("- "))
            return (
              <ul key={i} className="mt-2 space-y-2 pl-4">
                {items.map((item, j) => (
                  <li key={j} className="text-gray-700 text-sm leading-relaxed list-disc"
                    dangerouslySetInnerHTML={{
                      __html: item.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                    }}
                  />
                ))}
              </ul>
            )
          }
          return (
            <p key={i} className="mt-3 text-gray-700 text-sm leading-relaxed">
              {block}
            </p>
          )
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-lg bg-blue-50 p-6 text-center">
        <p className="font-bold text-gray-900">建設業界の求人を探す</p>
        <p className="mt-1 text-sm text-gray-600">
          建設求人ポータルで、あなたに合った求人を見つけましょう。
        </p>
        <Link
          href="/jobs"
          className="mt-4 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          求人を検索する →
        </Link>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/journal"
          className="text-sm text-blue-600 hover:underline"
        >
          ← マガジン一覧に戻る
        </Link>
      </div>
    </div>
  )
}
