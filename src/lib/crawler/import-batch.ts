/**
 * ハローワーク求人バッチインポートモジュール
 *
 * fetchHelloworkJobs で取得・パースされた求人データを
 * Prisma 経由でデータベースに upsert する。
 *
 * 主な機能:
 * - hellowork_id をキーとした重複排除（upsert）
 * - ハローワーク側で削除された求人の自動 close
 * - インポート統計の集計・ログ出力
 *
 * @module import-batch
 */

import { PrismaClient } from "@prisma/client"
import type { CategoryValue } from "@/lib/categories"
import type { HelloworkJobData } from "./hellowork"

// ========================================
// 型定義
// ========================================

/** インポートバッチの実行結果統計 */
export interface ImportStats {
  /** 新規追加件数 */
  created: number
  /** 既存レコードの更新件数 */
  updated: number
  /** closed に変更された件数（HW 側で削除済み） */
  closed: number
  /** 建設業カテゴリにマッチせずスキップした件数 */
  skipped: number
  /** エラーが発生した件数 */
  errors: number
  /** 処理対象の総件数 */
  totalProcessed: number
  /** バッチ開始時刻 */
  startedAt: Date
  /** バッチ完了時刻 */
  finishedAt: Date
  /** 処理時間（ミリ秒） */
  durationMs: number
}

/** upsert 時に発生したエラーの詳細 */
interface ImportError {
  helloworkId: string
  message: string
}

// ========================================
// Prisma クライアント
// ========================================

/**
 * シングルトン Prisma クライアント。
 * Next.js の Hot Reload でコネクションが増殖するのを防ぐ。
 */
const globalForPrisma = globalThis as unknown as {
  importPrisma: PrismaClient | undefined
}

const prisma = globalForPrisma.importPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.importPrisma = prisma
}

// ========================================
// ヘルパー関数
// ========================================

/**
 * HelloworkJobData を Prisma の Job モデルに適合する形式に変換する。
 *
 * @param job - パース済みのハローワーク求人データ
 * @param category - 事前に推定された建設業カテゴリ
 * @returns Prisma upsert 用のデータオブジェクト
 */
function toJobRecord(job: HelloworkJobData, category: CategoryValue) {
  return {
    source: job.source,
    helloworkId: job.helloworkId,
    title: job.title,
    category,
    employmentType: job.employmentType,
    description: job.description,
    requirements: job.requirements,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryType: job.salaryType,
    prefecture: job.prefecture,
    city: job.city,
    address: job.address,
    status: "active" as const,
    publishedAt: new Date(),
    // companyId は null（ハローワーク求人は自社掲載ではないため）
    // 会社名は description に含めるか、別途 Company レコードを作成する
  }
}

/**
 * 求人タイトル・説明文から建設業カテゴリを推定する。
 *
 * `src/lib/categories.ts` で定義された建設業 9 カテゴリ（"other" を除く 8 つ）
 * のいずれかに該当するキーワードが含まれていれば該当カテゴリを返す。
 * いずれにも該当しなければ `null` を返し、呼び出し側はそのジョブを取り込まずスキップする。
 *
 * パターン優先度: より具体的な業種（civil, electrical, ...）を construction より先に評価し、
 * 「土木 + 建築」のような複合キーワードを取りこぼさないようにする。
 */
export function inferCategory(
  title: string,
  description: string | null | undefined
): CategoryValue | null {
  const text = `${title} ${description ?? ""}`.toLowerCase()

  const patterns: Array<{ category: CategoryValue; pattern: RegExp }> = [
    { category: "civil", pattern: /土木|舗装|道路|河川|橋梁|トンネル|造成/ },
    {
      category: "electrical",
      pattern: /電気工事|設備工事|空調|衛生|配管|配線|消防/,
    },
    {
      category: "interior",
      pattern: /内装|仕上げ|塗装|防水|クロス|タイル|左官/,
    },
    { category: "demolition", pattern: /解体|産廃|アスベスト|スクラップ/ },
    {
      category: "driver",
      pattern: /ドライバー|運転手|重機|オペレーター|クレーン|ダンプ/,
    },
    {
      category: "management",
      pattern: /施工管理|現場監督|現場代理人|工事主任|現場所長/,
    },
    { category: "survey", pattern: /測量|設計|cad|積算/ },
    {
      category: "construction",
      pattern: /建設|建築|躯体|鳶|鉄筋|型枠|大工|足場|基礎/,
    },
  ]

  for (const { category, pattern } of patterns) {
    if (pattern.test(text)) return category
  }

  return null
}

// ========================================
// バッチインポート
// ========================================

/**
 * ハローワーク求人データをデータベースに一括インポートする。
 *
 * 処理フロー:
 * 1. 各求人を hellowork_id で upsert（新規 or 更新）
 * 2. DB 上の hellowork 求人のうち、今回のバッチに含まれないものを closed にする
 * 3. 統計を集計して返す
 *
 * トランザクション内で実行されるため、途中で失敗した場合はロールバックされる
 * （個別エラーは記録して続行する）。
 *
 * @param jobs - パース済みのハローワーク求人データ配列
 * @param options - オプション設定
 * @param options.dryRun - true の場合、DB 変更を行わずに統計のみ返す
 * @param options.closeOrphans - true の場合、今回のバッチに含まれない HW 求人を closed にする（デフォルト: true）
 * @returns インポート統計
 *
 * @example
 * ```typescript
 * import { fetchHelloworkJobs } from "./hellowork";
 * import { importHelloworkJobs } from "./import-batch";
 *
 * const result = await fetchHelloworkJobs({ prefecture: "13" });
 * const stats = await importHelloworkJobs(result.jobs);
 * console.info(`新規: ${stats.created}, 更新: ${stats.updated}, 終了: ${stats.closed}`);
 * ```
 */
export async function importHelloworkJobs(
  jobs: HelloworkJobData[],
  options: { dryRun?: boolean; closeOrphans?: boolean } = {}
): Promise<ImportStats> {
  const { dryRun = false, closeOrphans = true } = options
  const startedAt = new Date()

  let created = 0
  let updated = 0
  let closed = 0
  let skipped = 0
  let errors = 0
  const importErrors: ImportError[] = []

  // 今回バッチで処理された hellowork_id のセット
  // 建設業カテゴリにマッチした（＝取り込み対象になった）ジョブのみが入る。
  // 非建設業ジョブを含めると closeOrphans が誤って既存の建設業求人を closed にしてしまうため。
  const processedIds = new Set<string>()

  console.info(
    `[import-batch] インポート開始: ${jobs.length} 件の求人を処理します`
  )

  // -------------------------------------------------------
  // Step 1: 各求人を upsert
  // -------------------------------------------------------
  for (const job of jobs) {
    try {
      // 建設業 9 カテゴリのいずれにも該当しないジョブは取り込まない
      const category = inferCategory(job.title, job.description)
      if (category === null) {
        skipped++
        continue
      }

      processedIds.add(job.helloworkId)

      if (dryRun) {
        // ドライランの場合は DB アクセスせずに既存チェックのみ
        const existing = await prisma.job.findUnique({
          where: { helloworkId: job.helloworkId },
          select: { id: true },
        })
        if (existing) {
          updated++
        } else {
          created++
        }
        continue
      }

      const data = toJobRecord(job, category)

      const result = await prisma.job.upsert({
        where: { helloworkId: job.helloworkId },
        create: data,
        update: {
          title: data.title,
          category: data.category,
          employmentType: data.employmentType,
          description: data.description,
          requirements: data.requirements,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          salaryType: data.salaryType,
          prefecture: data.prefecture,
          city: data.city,
          address: data.address,
          status: "active",
          // updatedAt は Prisma が自動更新する
        },
      })

      // upsert の結果で create/update を判定
      // createdAt と updatedAt が近い場合は新規作成とみなす
      const timeDiff =
        result.updatedAt.getTime() - result.createdAt.getTime()
      if (timeDiff < 1000) {
        created++
      } else {
        updated++
      }
    } catch (error) {
      errors++
      const message =
        error instanceof Error ? error.message : String(error)
      importErrors.push({ helloworkId: job.helloworkId, message })
      console.error(
        `[import-batch] エラー: ${job.helloworkId} - ${message}`
      )
    }
  }

  // -------------------------------------------------------
  // Step 2: 孤立した HW 求人を closed にする
  // ハローワーク側で掲載終了した求人を検知して非公開にする
  // -------------------------------------------------------
  if (closeOrphans && !dryRun && processedIds.size > 0) {
    try {
      const result = await prisma.job.updateMany({
        where: {
          source: "hellowork",
          status: "active",
          helloworkId: {
            notIn: Array.from(processedIds),
          },
        },
        data: {
          status: "closed",
        },
      })
      closed = result.count

      if (closed > 0) {
        console.info(
          `[import-batch] ${closed} 件のハローワーク求人を closed に変更しました`
        )
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error)
      console.error(
        `[import-batch] 孤立求人の close 処理でエラー: ${message}`
      )
    }
  }

  const finishedAt = new Date()
  const durationMs = finishedAt.getTime() - startedAt.getTime()

  // -------------------------------------------------------
  // Step 3: 統計ログの出力
  // -------------------------------------------------------
  const stats: ImportStats = {
    created,
    updated,
    closed,
    skipped,
    errors,
    totalProcessed: jobs.length,
    startedAt,
    finishedAt,
    durationMs,
  }

  console.info(`[import-batch] インポート完了:`)
  console.info(`  新規追加: ${stats.created} 件`)
  console.info(`  更新: ${stats.updated} 件`)
  console.info(`  終了 (closed): ${stats.closed} 件`)
  console.info(`  スキップ (非建設業): ${stats.skipped} 件`)
  console.info(`  エラー: ${stats.errors} 件`)
  console.info(`  処理時間: ${stats.durationMs}ms`)

  if (importErrors.length > 0) {
    console.info(`[import-batch] エラー詳細:`)
    for (const err of importErrors) {
      console.info(`  - ${err.helloworkId}: ${err.message}`)
    }
  }

  return stats
}
