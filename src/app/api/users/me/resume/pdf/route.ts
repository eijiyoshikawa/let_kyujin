import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { renderToBuffer } from "@react-pdf/renderer"
import { ResumePdfDocument } from "@/lib/resume-pdf"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const resume = await prisma.resume.findUnique({
    where: { userId: session.user.id },
  })

  if (!resume) {
    return Response.json({ error: "履歴書データがありません。先に保存してください。" }, { status: 404 })
  }

  const buffer = await renderToBuffer(
    ResumePdfDocument({ resume })
  )

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="resume_${Date.now()}.pdf"`,
    },
  })
}
