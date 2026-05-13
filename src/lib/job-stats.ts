/**
 * カテゴリ件数集計の読み取りヘルパー。
 *
 * 本番では materialized view `job_category_counts` から SELECT して即時応答。
 * MV が未作成の DB（初回 / dev 環境）では Prisma の groupBy にフォールバック。
 *
 * MV のリフレッシュは `/api/cron/refresh-mv` が CONCURRENTLY で行う。
 */

import { prisma } from "@/lib/db"

export type CategoryCount = { category: string; count: number }

export async function getCategoryCounts(): Promise<CategoryCount[]> {
  // 1) まず MV から読む
  try {
    const rows = await prisma.$queryRawUnsafe<
      { category: string; count: bigint }[]
    >(`SELECT category, count FROM job_category_counts`)
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        category: r.category,
        count: Number(r.count),
      }))
    }
  } catch {
    // MV 未作成 → フォールバック
  }

  // 2) フォールバック: 直接 groupBy
  try {
    const grouped = await prisma.job.groupBy({
      by: ["category"],
      where: { status: "active" },
      _count: true,
    })
    return grouped.map((g) => ({
      category: g.category,
      count: g._count ?? 0,
    }))
  } catch {
    return []
  }
}

/** prefecture × category の集計（カテゴリページ用）。MV → groupBy フォールバック。 */
export async function getPrefCategoryCounts(): Promise<
  Array<{ prefecture: string; category: string; count: number }>
> {
  try {
    const rows = await prisma.$queryRawUnsafe<
      { prefecture: string; category: string; count: bigint }[]
    >(`SELECT prefecture, category, count FROM job_pref_category_counts`)
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        prefecture: r.prefecture,
        category: r.category,
        count: Number(r.count),
      }))
    }
  } catch {
    // フォールバック
  }

  try {
    const grouped = await prisma.job.groupBy({
      by: ["prefecture", "category"],
      where: { status: "active" },
      _count: true,
    })
    return grouped.map((g) => ({
      prefecture: g.prefecture,
      category: g.category,
      count: g._count ?? 0,
    }))
  } catch {
    return []
  }
}
