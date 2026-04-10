import { PrismaClient } from "@prisma/client"
import { articlePlans } from "./article-plans"

const prisma = new PrismaClient()

/**
 * 200記事をDBに投入するseedスクリプト。
 * 2026/1/1から1日1記事のペースで publishedAt を設定。
 * body は仮のプレースホルダー（後続バッチで本文を差し替え）。
 */
async function seedArticles() {
  const startDate = new Date("2026-01-01T09:00:00+09:00")

  let created = 0
  let skipped = 0

  for (let i = 0; i < articlePlans.length; i++) {
    const plan = articlePlans[i]
    const publishedAt = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)

    // Skip if already exists
    const existing = await prisma.article.findUnique({ where: { slug: plan.slug } })
    if (existing) {
      skipped++
      continue
    }

    const body = generatePlaceholderBody(plan.title, plan.excerpt, plan.tags)

    await prisma.article.create({
      data: {
        slug: plan.slug,
        title: plan.title,
        excerpt: plan.excerpt,
        body,
        category: plan.category,
        tags: plan.tags,
        metaDescription: plan.excerpt,
        authorName: "現場キャリア編集部",
        status: "published",
        featured: i < 3, // 最初の3記事をfeaturedに
        publishedAt,
      },
    })
    created++
  }

  console.log(`Articles seed complete: ${created} created, ${skipped} skipped (already exist)`)
}

function generatePlaceholderBody(title: string, excerpt: string, tags: string[]): string {
  return `
<p>${excerpt}</p>

<h2>${title.split("—")[0].trim()}について</h2>
<p>この記事では、${tags.join("・")}に関する情報を詳しく解説します。建設業界で働く方やこれから転職を検討している方に向けて、実践的な内容をまとめました。</p>

<h2>まとめ</h2>
<p>建設業界は人手不足が続いており、未経験者の方にもチャンスがある業界です。資格取得や経験を積むことで着実にキャリアアップが可能です。</p>
<p>現場キャリアでは、建築・土木・設備・解体に特化した求人情報を掲載しています。あなたに合った求人を探してみてください。</p>
`.trim()
}

seedArticles()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
