import { prisma } from "./db"

// 本番 DB にスキーマ追加カラムが未反映の場合でもアプリが落ちないよう、
// 起動時に冪等な ALTER TABLE / CREATE INDEX を発行する。
// 通常運用では `prisma db push` 後すべて適用済みなので、
// IF NOT EXISTS によりほぼ no-op で完了する。
const STATEMENTS: ReadonlyArray<string> = [
 // Company リッチコンテンツ + SNS
 `ALTER TABLE "companies"
 ADD COLUMN IF NOT EXISTS "tagline" VARCHAR(200),
 ADD COLUMN IF NOT EXISTS "pitch_highlights" TEXT,
 ADD COLUMN IF NOT EXISTS "ideal_candidate" TEXT,
 ADD COLUMN IF NOT EXISTS "employee_voice" TEXT,
 ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 ADD COLUMN IF NOT EXISTS "instagram_url" VARCHAR(500),
 ADD COLUMN IF NOT EXISTS "tiktok_url" VARCHAR(500),
 ADD COLUMN IF NOT EXISTS "facebook_url" VARCHAR(500),
 ADD COLUMN IF NOT EXISTS "x_url" VARCHAR(500),
 ADD COLUMN IF NOT EXISTS "youtube_url" VARCHAR(500),
 ADD COLUMN IF NOT EXISTS "last_content_updated_at" TIMESTAMPTZ`,
 // Job 並び順スコア
 `ALTER TABLE "jobs"
 ADD COLUMN IF NOT EXISTS "rank_score" INTEGER NOT NULL DEFAULT 0`,
 `CREATE INDEX IF NOT EXISTS "idx_jobs_status_rank"
 ON "jobs" ("status", "rank_score" DESC, "published_at" DESC)`,
]

let inflight: Promise<boolean> | null = null

// 一度だけ実行され、結果を Promise でキャッシュ。成功/失敗いずれも以後 await が即解決する。
// 戻り値: 全 ALTER が成功したかどうか（失敗時は防御クエリへフォールバック判断に使う）。
export function ensureSchema(): Promise<boolean> {
 if (!inflight) {
 inflight = (async () => {
 try {
 for (const sql of STATEMENTS) {
 await prisma.$executeRawUnsafe(sql)
 }
 return true
 } catch (e) {
 console.warn("[ensureSchema] auto-migration skipped:", e instanceof Error ? e.message : e)
 return false
 }
 })()
 }
 return inflight
}
