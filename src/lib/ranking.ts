/**
 * 求人一覧の「おすすめ順」用ランキングスコア計算。
 *
 * スコアリングの方針（ユーザーの方針より）:
 * - SNS 登録の有無（5 種、1 個ごとに +5）
 * - 文字量（タグライン / pitch / ideal / employee voice / description の合計）
 * - 写真の数（最大 12、1 枚 +2）
 * - 3 ヶ月以内に更新されているか（lastContentUpdatedAt）
 *
 * 結果は integer。求人一覧は ORDER BY rankScore DESC, publishedAt DESC で並ぶ。
 *
 * @module ranking
 */

export interface CompanyForRank {
  tagline: string | null
  pitchHighlights: string | null
  idealCandidate: string | null
  employeeVoice: string | null
  photos: string[]
  instagramUrl: string | null
  tiktokUrl: string | null
  facebookUrl: string | null
  xUrl: string | null
  youtubeUrl: string | null
  lastContentUpdatedAt: Date | null
}

export interface JobForRank {
  description: string | null
  requirements: string | null
}

/**
 * 求人 × 企業情報からランキングスコアを計算する。
 * 各要素を独立に加点し合計。最大はざっくり 150 前後を想定。
 */
export function computeRankScore(
  job: JobForRank,
  company: CompanyForRank | null,
  now: Date = new Date()
): number {
  let score = 0

  if (company) {
    // SNS: 1 つに付き +5、最大 25
    const snsCount = [
      company.instagramUrl,
      company.tiktokUrl,
      company.facebookUrl,
      company.xUrl,
      company.youtubeUrl,
    ].filter(isNonEmpty).length
    score += snsCount * 5

    // 写真: 1 枚 +2、最大 24（12 枚）
    score += Math.min(12, company.photos?.length ?? 0) * 2

    // テキスト量: タグライン + pitch + ideal + employeeVoice の合計文字数を 50 で割って整数化、最大 +60
    const text =
      (company.tagline ?? "").length +
      (company.pitchHighlights ?? "").length +
      (company.idealCandidate ?? "").length +
      (company.employeeVoice ?? "").length
    score += Math.min(60, Math.floor(text / 50))

    // 3 ヶ月以内更新: +20、6 ヶ月以内: +10
    if (company.lastContentUpdatedAt) {
      const days =
        (now.getTime() - company.lastContentUpdatedAt.getTime()) /
        (1000 * 60 * 60 * 24)
      if (days <= 90) score += 20
      else if (days <= 180) score += 10
    }
  }

  // 求人本文の文字量: description / requirements の合計 / 100 を最大 15 で加点
  const jobText =
    (job.description ?? "").length + (job.requirements ?? "").length
  score += Math.min(15, Math.floor(jobText / 100))

  return score
}

function isNonEmpty(v: string | null | undefined): v is string {
  return typeof v === "string" && v.trim().length > 0
}
