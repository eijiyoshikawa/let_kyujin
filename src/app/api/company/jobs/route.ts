import { type NextRequest } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

const jobSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  subcategory: z.string().max(50).nullable().optional(),
  employmentType: z.enum(["full_time", "part_time", "contract"]).nullable().optional(),
  description: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  salaryMin: z.number().int().min(0).nullable().optional(),
  salaryMax: z.number().int().min(0).nullable().optional(),
  salaryType: z.enum(["monthly", "hourly", "annual"]).nullable().optional(),
  prefecture: z.string().min(1).max(10),
  city: z.string().max(50).nullable().optional(),
  address: z.string().nullable().optional(),
  benefits: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "active", "closed"]).optional(),
})

async function getCompanySession() {
  const session = await auth()
  if (!session?.user) return null

  const role = (session.user as { role?: string }).role
  if (role !== "company_admin" && role !== "company_member") return null

  const companyId = (session.user as { companyId?: string }).companyId
  if (!companyId) return null

  return { session, companyId, role }
}

export async function GET(request: NextRequest) {
  const ctx = await getCompanySession()
  if (!ctx) {
    return Response.json({ error: "企業アカウントでログインしてください" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const perPage = 20
  const status = searchParams.get("status")

  const where = {
    companyId: ctx.companyId,
    ...(status && status !== "all" ? { status } : {}),
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.job.count({ where }),
  ])

  return Response.json({ jobs, total, page, perPage })
}

export async function POST(request: NextRequest) {
  const ctx = await getCompanySession()
  if (!ctx) {
    return Response.json({ error: "企業アカウントでログインしてください" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "リクエストの形式が正しくありません" }, { status: 400 })
  }

  const parsed = jobSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "入力内容に誤りがあります", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const data = parsed.data

  const job = await prisma.job.create({
    data: {
      companyId: ctx.companyId,
      source: "direct",
      title: data.title,
      category: data.category,
      subcategory: data.subcategory ?? null,
      employmentType: data.employmentType ?? null,
      description: data.description ?? null,
      requirements: data.requirements ?? null,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      salaryType: data.salaryType ?? null,
      prefecture: data.prefecture,
      city: data.city ?? null,
      address: data.address ?? null,
      benefits: data.benefits ?? [],
      tags: data.tags ?? [],
      status: data.status ?? "draft",
      publishedAt: data.status === "active" ? new Date() : null,
    },
  })

  return Response.json({ job }, { status: 201 })
}
