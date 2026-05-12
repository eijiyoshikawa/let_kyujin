import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bookmark, Search } from "lucide-react"
import type { Metadata } from "next"
import { JobCard } from "@/components/jobs/job-card"

export const metadata: Metadata = {
  title: "お気に入り",
  robots: { index: false, follow: false },
}

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/mypage/favorites")

  const favorites = await prisma.jobFavorite
    .findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, logoUrl: true } },
          },
        },
      },
    })
    .catch(() => [])

  // active な求人のみ表示（closed は閉鎖済バッジ付きで残す）
  const items = favorites.filter((f) => f.job)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Bookmark className="h-6 w-6 text-amber-500" />
            お気に入り
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            気になる求人を保存して、後でじっくり比較できます。
          </p>
        </div>
        <Link
          href="/jobs"
          className="press inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 px-3 py-2 text-sm font-bold text-white"
        >
          <Search className="h-4 w-4" />
          求人を探す
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 border bg-white p-10 text-center text-sm text-gray-600 space-y-3">
          <p>まだお気に入りはありません。</p>
          <p className="text-xs text-gray-500">
            求人カードの 🔖 アイコンをタップすると、ここに保存されます。
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((f) => (
            <JobCard key={f.jobId} job={f.job} />
          ))}
        </div>
      )}
    </div>
  )
}
