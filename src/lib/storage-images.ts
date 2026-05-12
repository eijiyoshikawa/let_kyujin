/**
 * 企業ロゴ・写真用の画像アップロードヘルパー。
 *
 * src/lib/storage.ts はドキュメント (PDF/DOCX) 用なので、画像専用に
 * 別バケット `company-media` を使う。public read 前提。
 */

import { createClient } from "@supabase/supabase-js"

const BUCKET_NAME = "company-media"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB（写真）
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"]

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "Supabase 環境変数が未設定です (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)"
    )
  }
  return createClient(url, key)
}

export type ImageKind = "logo" | "photo"

export async function uploadCompanyImage(
  companyId: string,
  kind: ImageKind,
  file: File
): Promise<{ url: string; path: string }> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("ファイルサイズは 5MB 以下にしてください")
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("JPEG / PNG / WebP のみアップロード可能です")
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase()
  const safeExt = ext.replace(/[^a-z0-9]/g, "") || "jpg"
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${safeExt}`
  const path = `${companyId}/${kind}/${filename}`

  const supabase = getClient()
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
  if (error) {
    throw new Error(`アップロード失敗: ${error.message}`)
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

export async function deleteCompanyImage(path: string): Promise<void> {
  try {
    await getClient().storage.from(BUCKET_NAME).remove([path])
  } catch (e) {
    console.warn(
      `[storage-images] delete failed: ${e instanceof Error ? e.message : e}`
    )
  }
}

/**
 * Supabase の公開 URL からストレージ内パスを抽出。
 * 取得失敗・別ホスト URL の場合は null。
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const m = url.match(/\/storage\/v1\/object\/public\/company-media\/(.+)$/)
    return m ? m[1] : null
  } catch {
    return null
  }
}
