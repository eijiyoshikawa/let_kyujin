import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const scouts = await prisma.scout.findMany({
    where: { userId: session.user.id },
    orderBy: { sentAt: "desc" },
    include: {
      company: { select: { name: true, industry: true, logoUrl: true } },
      job: { select: { id: true, title: true } },
    },
  })

  return Response.json({ scouts })
}
