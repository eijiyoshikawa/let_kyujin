/**
 * 応募者と類似する求職者を「スカウト候補」として返すヘルパー。
 *
 * 元になる Application（応募者 + 求人）から:
 *   - その求人の category とマッチする desiredCategories を持つ
 *   - 求人と同じ prefecture に居住、または応募者と同 prefecture
 *   - 既にスカウト送信済 / 自社へ応募済の人は除外
 * を満たす User を最大 N 件返す。
 *
 * 候補スコア = カテゴリ一致 + 都道府県一致 + 希望給与レンジ重なり ＋ プロフィール公開
 */

import { prisma } from "@/lib/db"

export type ScoutCandidate = {
  id: string
  name: string | null
  prefecture: string | null
  city: string | null
  desiredCategories: string[]
  desiredSalaryMin: number | null
  score: number
  reasons: string[]
}

export async function findScoutCandidates(
  applicationId: string,
  limit = 10
): Promise<ScoutCandidate[]> {
  const app = await prisma.application
    .findUnique({
      where: { id: applicationId },
      select: {
        userId: true,
        companyId: true,
        job: {
          select: { id: true, category: true, prefecture: true, salaryMin: true, salaryMax: true },
        },
      },
    })
    .catch(() => null)
  if (!app || !app.companyId) return []

  // 既にスカウト送信済 / 自社の他の求人に応募中の userId を取得
  const [scoutedRows, otherApplicants] = await Promise.all([
    prisma.scout
      .findMany({
        where: { companyId: app.companyId },
        select: { userId: true },
      })
      .catch(() => []),
    prisma.application
      .findMany({
        where: { companyId: app.companyId },
        select: { userId: true },
      })
      .catch(() => []),
  ])
  const excluded = new Set<string>([
    app.userId,
    ...scoutedRows.map((s) => s.userId),
    ...otherApplicants.map((a) => a.userId),
  ])

  // 候補: 同じ category を希望、もしくは同じ prefecture
  const candidates = await prisma.user
    .findMany({
      where: {
        profilePublic: true,
        id: { notIn: [...excluded] },
        OR: [
          { desiredCategories: { has: app.job.category } },
          { prefecture: app.job.prefecture },
        ],
      },
      take: limit * 3, // スコアで絞り込むので多めに
      select: {
        id: true,
        name: true,
        prefecture: true,
        city: true,
        desiredCategories: true,
        desiredSalaryMin: true,
      },
    })
    .catch(() => [])

  const scored: ScoutCandidate[] = candidates.map((u) => {
    const reasons: string[] = []
    let score = 0
    if (u.desiredCategories.includes(app.job.category)) {
      score += 3
      reasons.push("希望職種が一致")
    }
    if (u.prefecture && app.job.prefecture && u.prefecture === app.job.prefecture) {
      score += 2
      reasons.push("勤務地（都道府県）が一致")
    }
    if (u.desiredSalaryMin && app.job.salaryMax) {
      // 求人の上限 ≧ 希望下限 ＝ レンジ重なり
      if (app.job.salaryMax >= u.desiredSalaryMin) {
        score += 1
        reasons.push("希望給与レンジが重なる")
      }
    }
    if (reasons.length === 0) {
      reasons.push("プロフィール公開中")
    }
    return {
      id: u.id,
      name: u.name,
      prefecture: u.prefecture,
      city: u.city,
      desiredCategories: u.desiredCategories,
      desiredSalaryMin: u.desiredSalaryMin,
      score,
      reasons,
    }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
