import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProfileForm } from "./profile-form"
import { Settings } from "lucide-react"

export default async function CompanyProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as { role?: string }).role
  if (role !== "company_admin" && role !== "company_member") {
    redirect("/login")
  }

  const companyId = (session.user as { companyId?: string }).companyId
  if (!companyId) {
    return (
      <div className="rounded border bg-red-50 border-red-200 p-4 text-sm text-red-800">
        企業情報が見つかりません。サポートにお問い合わせください。
      </div>
    )
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true,
      tagline: true,
      pitchHighlights: true,
      idealCandidate: true,
      employeeVoice: true,
      photos: true,
      instagramUrl: true,
      tiktokUrl: true,
      facebookUrl: true,
      xUrl: true,
      youtubeUrl: true,
      lastContentUpdatedAt: true,
    },
  })

  if (!company) {
    return (
      <div className="rounded border bg-red-50 border-red-200 p-4 text-sm text-red-800">
        企業情報が見つかりません。
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Settings className="h-6 w-6 text-primary-500" />
          企業情報・SNS
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          求人詳細ページに表示される自社の魅力 / 写真 / SNS リンクを編集できます。
          求人一覧の並び順にも影響します（コンテンツが充実 + SNS 登録 + 3 ヶ月以内更新 で上位表示）。
        </p>
      </div>

      <ProfileForm
        initial={{
          tagline: company.tagline ?? "",
          pitchHighlights: company.pitchHighlights ?? "",
          idealCandidate: company.idealCandidate ?? "",
          employeeVoice: company.employeeVoice ?? "",
          photos: company.photos ?? [],
          instagramUrl: company.instagramUrl ?? "",
          tiktokUrl: company.tiktokUrl ?? "",
          facebookUrl: company.facebookUrl ?? "",
          xUrl: company.xUrl ?? "",
          youtubeUrl: company.youtubeUrl ?? "",
        }}
        companyName={company.name}
        lastContentUpdatedAt={company.lastContentUpdatedAt}
      />
    </div>
  )
}
