/**
 * GET /api/company/applications/[id]/scout-recommendations
 *
 * 応募者と類似する求職者をスカウト推奨候補として返す。
 * 自社の応募のみアクセス可能。
 */

import { type NextRequest } from "next/server"
import { requireCompanyAuth, isCompanyAuthError } from "@/lib/company-auth"
import { prisma } from "@/lib/db"
import { findScoutCandidates } from "@/lib/scout-recommendations"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireCompanyAuth({ requireApproved: true })
  if (isCompanyAuthError(ctx)) {
    return Response.json({ error: ctx.error }, { status: ctx.status })
  }
  const { id } = await params

  const app = await prisma.application
    .findUnique({ where: { id }, select: { companyId: true } })
    .catch(() => null)
  if (!app || app.companyId !== ctx.companyId) {
    return Response.json({ error: "応募が見つかりません" }, { status: 404 })
  }

  const candidates = await findScoutCandidates(id, 10)
  return Response.json({ candidates })
}
