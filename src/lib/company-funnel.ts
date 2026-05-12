/**
 * 企業ダッシュボードのファネル KPI 集計。
 *
 * ステージ:
 *   1. 求人閲覧 (JobView)
 *   2. LINE 応募ボタンクリック (ApplicationClick)
 *   3. リード捕捉 (LineLead)
 *   4. 応募成立 (Application)
 *   5. 選考中 (Application status in [reviewing, interview, offered, hired])
 *   6. 面接 (interview, offered, hired)
 *   7. 内定 (offered, hired)
 *   8. 採用 (hired)
 *
 * 期間は from/to で絞り込む。各テーブルは別カラム名なので個別にクエリする。
 */

import { prisma } from "@/lib/db"

export type FunnelStage = {
  key: string
  label: string
  count: number
  // 直前ステージからの変換率 (0-1)。最初のステージは null。
  conversionFromPrev: number | null
}

export type FunnelData = {
  range: { from: Date; to: Date; label: string }
  stages: FunnelStage[]
  hiredCount: number
  overallConversion: number | null // hired / view
}

export type RangeKey = "30d" | "90d" | "all"

const RANGE_LABEL: Record<RangeKey, string> = {
  "30d": "直近 30 日間",
  "90d": "直近 90 日間",
  all: "全期間",
}

function rangeFrom(key: RangeKey): Date {
  if (key === "30d") return new Date(Date.now() - 30 * 86_400_000)
  if (key === "90d") return new Date(Date.now() - 90 * 86_400_000)
  return new Date(0)
}

export async function computeCompanyFunnel(
  companyId: string,
  rangeKey: RangeKey
): Promise<FunnelData> {
  const from = rangeFrom(rangeKey)
  const to = new Date()

  // 集計対象の job 一覧（求人 id を where に使い回す）
  const jobIds = await prisma.job
    .findMany({ where: { companyId }, select: { id: true } })
    .then((rows) => rows.map((r) => r.id))
    .catch(() => [] as string[])

  if (jobIds.length === 0) {
    return {
      range: { from, to, label: RANGE_LABEL[rangeKey] },
      stages: [
        { key: "view", label: "求人閲覧", count: 0, conversionFromPrev: null },
        { key: "click", label: "応募クリック", count: 0, conversionFromPrev: null },
        { key: "lead", label: "リード捕捉", count: 0, conversionFromPrev: null },
        { key: "apply", label: "応募成立", count: 0, conversionFromPrev: null },
        { key: "screen", label: "選考中以降", count: 0, conversionFromPrev: null },
        { key: "interview", label: "面接以降", count: 0, conversionFromPrev: null },
        { key: "offer", label: "内定以降", count: 0, conversionFromPrev: null },
        { key: "hire", label: "採用", count: 0, conversionFromPrev: null },
      ],
      hiredCount: 0,
      overallConversion: null,
    }
  }

  const timeRange = rangeKey === "all" ? {} : { gte: from }

  const [
    viewCount,
    clickCount,
    leadCount,
    applyCount,
    screenCount,
    interviewCount,
    offerCount,
    hireCount,
  ] = await Promise.all([
    prisma.jobView
      .count({ where: { jobId: { in: jobIds }, viewedAt: timeRange } })
      .catch(() => 0),
    prisma.applicationClick
      .count({
        where: { jobId: { in: jobIds }, clickedAt: timeRange },
      })
      .catch(() => 0),
    prisma.lineLead
      .count({ where: { jobId: { in: jobIds }, createdAt: timeRange } })
      .catch(() => 0),
    prisma.application
      .count({ where: { companyId, createdAt: timeRange } })
      .catch(() => 0),
    prisma.application
      .count({
        where: {
          companyId,
          createdAt: timeRange,
          status: { in: ["reviewing", "interview", "offered", "hired"] },
        },
      })
      .catch(() => 0),
    prisma.application
      .count({
        where: {
          companyId,
          createdAt: timeRange,
          status: { in: ["interview", "offered", "hired"] },
        },
      })
      .catch(() => 0),
    prisma.application
      .count({
        where: {
          companyId,
          createdAt: timeRange,
          status: { in: ["offered", "hired"] },
        },
      })
      .catch(() => 0),
    prisma.application
      .count({ where: { companyId, createdAt: timeRange, status: "hired" } })
      .catch(() => 0),
  ])

  const counts = [
    viewCount,
    clickCount,
    leadCount,
    applyCount,
    screenCount,
    interviewCount,
    offerCount,
    hireCount,
  ]
  const labels = [
    "求人閲覧",
    "応募クリック",
    "リード捕捉",
    "応募成立",
    "選考中以降",
    "面接以降",
    "内定以降",
    "採用",
  ]
  const keys = [
    "view",
    "click",
    "lead",
    "apply",
    "screen",
    "interview",
    "offer",
    "hire",
  ]

  const stages: FunnelStage[] = counts.map((count, i) => {
    const prev = i === 0 ? null : counts[i - 1]
    const conv = prev !== null && prev > 0 ? count / prev : null
    return {
      key: keys[i],
      label: labels[i],
      count,
      conversionFromPrev: conv,
    }
  })

  return {
    range: { from, to, label: RANGE_LABEL[rangeKey] },
    stages,
    hiredCount: hireCount,
    overallConversion: viewCount > 0 ? hireCount / viewCount : null,
  }
}

export function isRangeKey(value: unknown): value is RangeKey {
  return value === "30d" || value === "90d" || value === "all"
}
