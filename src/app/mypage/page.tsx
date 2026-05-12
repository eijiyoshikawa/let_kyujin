import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, User, Pencil, Mail, Bell, Bookmark } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "マイページ",
}

export default async function MyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [user, applicationCount, scoutCount, unreadNotifications, savedSearchCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          prefecture: true,
          createdAt: true,
        },
      }),
      prisma.application.count({
        where: { userId: session.user.id },
      }),
      prisma.scout.count({
        where: { userId: session.user.id },
      }),
      prisma.notification
        .count({ where: { userId: session.user.id, readAt: null } })
        .catch(() => 0),
      prisma.savedSearch
        .count({ where: { userId: session.user.id } })
        .catch(() => 0),
    ])

  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>

      {/* User Info */}
      <div className="mt-6  border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center bg-primary-100">
            <User className="h-7 w-7 text-primary-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user.name ?? "名前未設定"}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">お住まいの地域</dt>
            <dd className="text-sm text-gray-900">
              {user.prefecture ?? "未設定"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">登録日</dt>
            <dd className="text-sm text-gray-900">
              {user.createdAt.toLocaleDateString("ja-JP")}
            </dd>
          </div>
        </dl>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/mypage/notifications"
          className="flex items-center gap-4 border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="relative flex h-10 w-10 items-center justify-center bg-amber-100">
            <Bell className="h-5 w-5 text-amber-700" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-bold text-white bg-red-500">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">通知</p>
            <p className="text-sm text-gray-500">
              {unreadNotifications > 0
                ? `未読 ${unreadNotifications} 件`
                : "未読はありません"}
            </p>
          </div>
        </Link>

        <Link
          href="/mypage/applications"
          className="flex items-center gap-4  border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center  bg-primary-100">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">応募一覧</p>
            <p className="text-sm text-gray-500">
              {applicationCount} 件の応募
            </p>
          </div>
        </Link>

        <Link
          href="/mypage/saved-searches"
          className="flex items-center gap-4 border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center bg-sky-100">
            <Bookmark className="h-5 w-5 text-sky-700" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">保存した検索</p>
            <p className="text-sm text-gray-500">
              {savedSearchCount > 0
                ? `${savedSearchCount} 件 — 新着があれば通知`
                : "条件を保存して新着通知を受け取る"}
            </p>
          </div>
        </Link>

        <Link
          href="/mypage/scouts"
          className="flex items-center gap-4  border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center  bg-purple-100">
            <Mail className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">スカウト</p>
            <p className="text-sm text-gray-500">
              {scoutCount} 件のスカウト
            </p>
          </div>
        </Link>

        <Link
          href="/mypage/profile"
          className="flex items-center gap-4  border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center  bg-green-100">
            <Pencil className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">プロフィール編集</p>
            <p className="text-sm text-gray-500">情報を更新する</p>
          </div>
        </Link>

        <Link
          href="/mypage/resume"
          className="flex items-center gap-4  border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center  bg-amber-100">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">履歴書・職務経歴書</p>
            <p className="text-sm text-gray-500">作成・アップロード</p>
          </div>
        </Link>

        <Link
          href="/jobs"
          className="flex items-center gap-4  border bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center  bg-primary-100">
            <svg
              className="h-5 w-5 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">求人検索</p>
            <p className="text-sm text-gray-500">新しい求人を探す</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
