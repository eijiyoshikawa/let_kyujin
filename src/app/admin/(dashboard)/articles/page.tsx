import { prisma } from "@/lib/db"
import Link from "next/link"
import type { Metadata } from "next"
import { Pagination } from "@/components/pagination"
import { CATEGORY_LABELS, ARTICLE_CATEGORIES } from "@/lib/article-categories"

export const metadata: Metadata = {
  title: "記事管理",
}

type SP = {
  page?: string
  q?: string
  status?: string
  category?: string
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const query = params.q ?? ""
  const statusFilter = params.status ?? ""
  const categoryFilter = params.category ?? ""
  const perPage = 20

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { slug: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        status: true,
        featured: true,
        publishedAt: true,
        viewCount: true,
        updatedAt: true,
      },
    }),
    prisma.article.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">記事管理</h1>
          <p className="mt-1 text-sm text-gray-500">登録記事: {total} 件</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 記事を追加
        </Link>
      </div>

      {/* Filters */}
      <form className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="タイトル・slugで検索..."
          className="rounded-md border px-3 py-1.5 text-sm flex-1 min-w-[200px] max-w-sm"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="">すべての状態</option>
          <option value="published">公開中</option>
          <option value="draft">下書き</option>
        </select>
        <select
          name="category"
          defaultValue={categoryFilter}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="">すべてのカテゴリ</option>
          {ARTICLE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          絞り込み
        </button>
      </form>

      {articles.length === 0 ? (
        <div className="mt-6 rounded-lg border bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">記事が見つかりません。</p>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  タイトル
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  カテゴリ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  状態
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  PV
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  公開日
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {a.featured && (
                        <span className="mr-1 inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-800">
                          注目
                        </span>
                      )}
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-500">{a.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {CATEGORY_LABELS[a.category] ?? a.category}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {a.status === "published" ? (
                      <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        公開中
                      </span>
                    ) : (
                      <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        下書き
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {a.viewCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {a.publishedAt
                      ? a.publishedAt.toLocaleDateString("ja-JP")
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/admin/articles"
          searchParams={{
            q: query,
            status: statusFilter,
            category: categoryFilter,
          }}
        />
      </div>
    </div>
  )
}
