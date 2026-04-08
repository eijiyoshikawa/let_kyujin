import { PrismaClient } from "@prisma/client"
import { hashSync } from "bcryptjs"
import { seedArticles } from "./seed-articles"

const prisma = new PrismaClient()

async function main() {
  // サンプル企業
  const company1 = await prisma.company.create({
    data: {
      name: "東京運送株式会社",
      industry: "運送・物流",
      prefecture: "東京都",
      city: "江東区",
      address: "東京都江東区有明1-1-1",
      employeeCount: "51-100",
      description: "創業30年の安定企業。大型トラックドライバーを募集中。",
      contactEmail: "recruit@tokyo-unsou.example.com",
    },
  })

  const company2 = await prisma.company.create({
    data: {
      name: "関西建設工業株式会社",
      industry: "建設",
      prefecture: "大阪府",
      city: "大阪市北区",
      address: "大阪府大阪市北区梅田2-2-2",
      employeeCount: "101-300",
      description: "関西エリアを中心に道路・橋梁の施工管理を行っています。",
      contactEmail: "hr@kansai-kensetsu.example.com",
    },
  })

  // 企業担当者
  await prisma.companyUser.create({
    data: {
      companyId: company1.id,
      email: "admin@tokyo-unsou.example.com",
      passwordHash: hashSync("password123", 10),
      name: "田中太郎",
      role: "admin",
    },
  })

  // サンプル求職者
  await prisma.user.create({
    data: {
      email: "yamada@example.com",
      passwordHash: hashSync("password123", 10),
      name: "山田花子",
      prefecture: "東京都",
      city: "墨田区",
      desiredCategories: ["driver"],
      desiredSalaryMin: 300000,
      profilePublic: true,
    },
  })

  // サンプル求人（直接掲載）
  const jobTitles = [
    { title: "大型トラックドライバー【月給35万〜】", category: "driver", subcategory: "truck", prefecture: "東京都", city: "江東区", salaryMin: 350000, salaryMax: 450000, salaryType: "monthly", employmentType: "full_time", companyId: company1.id },
    { title: "4tドライバー 日勤のみ 土日休み", category: "driver", subcategory: "truck", prefecture: "東京都", city: "品川区", salaryMin: 280000, salaryMax: 350000, salaryType: "monthly", employmentType: "full_time", companyId: company1.id },
    { title: "タクシードライバー【未経験歓迎】", category: "driver", subcategory: "taxi", prefecture: "東京都", city: "新宿区", salaryMin: 300000, salaryMax: 500000, salaryType: "monthly", employmentType: "full_time", companyId: company1.id },
    { title: "施工管理（土木）経験者優遇", category: "construction", subcategory: "civil", prefecture: "大阪府", city: "大阪市北区", salaryMin: 400000, salaryMax: 600000, salaryType: "monthly", employmentType: "full_time", companyId: company2.id },
    { title: "建築現場監督【年収600万〜】", category: "construction", subcategory: "building", prefecture: "大阪府", city: "大阪市中央区", salaryMin: 500000, salaryMax: 700000, salaryType: "monthly", employmentType: "full_time", companyId: company2.id },
  ]

  for (const job of jobTitles) {
    await prisma.job.create({
      data: {
        ...job,
        source: "direct",
        description: `${job.title}の求人です。詳細はお問い合わせください。`,
        benefits: ["社会保険完備", "交通費支給", "退職金制度"],
        tags: ["未経験歓迎", "学歴不問"],
        status: "active",
        publishedAt: new Date(),
      },
    })
  }

  // サンプルHW求人
  for (let i = 1; i <= 5; i++) {
    await prisma.job.create({
      data: {
        source: "hellowork",
        helloworkId: `13010-${String(i).padStart(8, "0")}`,
        title: `配送ドライバー（ハローワーク転載）#${i}`,
        category: "driver",
        subcategory: "delivery",
        employmentType: "full_time",
        description: "ハローワークインターネットサービスより転載。",
        salaryMin: 250000,
        salaryMax: 320000,
        salaryType: "monthly",
        prefecture: "東京都",
        city: "足立区",
        benefits: ["社会保険完備"],
        tags: [],
        status: "active",
        publishedAt: new Date(),
      },
    })
  }

  // ========================================
  // 著者
  // ========================================
  const author1 = await prisma.author.create({
    data: {
      slug: "editorial-team",
      name: "現場キャリア編集部",
      title: null,
      bio: "現場キャリア編集部は、ドライバー・建設・製造業界の転職に精通した編集チームです。",
      avatarUrl: null,
    },
  })

  const author2 = await prisma.author.create({
    data: {
      slug: "tanaka-koji",
      name: "田中浩司",
      title: "元トラックドライバー・ライター",
      bio: "大型トラックドライバーとして15年勤務した後、物流業界専門ライターに転身。現場のリアルな声を届けます。",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  })

  const author3 = await prisma.author.create({
    data: {
      slug: "suzuki-yumi",
      name: "鈴木裕美",
      title: "キャリアアドバイザー",
      bio: "国家資格キャリアコンサルタント。ノンデスク産業への転職支援実績500名以上。",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  })

  // ========================================
  // ジャーナル記事
  // ========================================
  const allArticles = seedArticles

  // Assign authors by category
  const authorMap: Record<string, string> = {
    driver: author2.id,
    construction: author1.id,
    manufacturing: author1.id,
    career: author3.id,
    general: author1.id,
  }

  for (const article of allArticles) {
    await prisma.article.create({
      data: {
        ...article,
        authorId: authorMap[article.category] ?? author1.id,
      },
    })
  }

  console.log(`Seed completed: 2 companies, 1 company user, 1 seeker, 10 jobs, 3 authors, ${allArticles.length} articles`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
