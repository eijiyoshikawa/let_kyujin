#!/usr/bin/env tsx
/**
 * リリース用シークレット生成 CLI。
 *
 *   pnpm gen:secret              # CRON_SECRET / NEXTAUTH_SECRET を 1 セット生成
 *   pnpm gen:secret --bytes=64   # 長さ指定 (default 32 bytes = 64 hex chars)
 *   pnpm gen:secret --vercel     # Vercel CLI で使うコマンド文字列も出力
 *
 * Vercel Dashboard → Settings → Environment Variables に貼り付ける用。
 */
import { randomBytes } from "node:crypto"

function generate(bytes: number): string {
  return randomBytes(bytes).toString("hex")
}

function main() {
  const args = process.argv.slice(2)
  const bytesArg = args.find((a) => a.startsWith("--bytes="))
  const bytes = bytesArg ? Number(bytesArg.split("=")[1]) : 32
  const showVercelCli = args.includes("--vercel")

  if (!Number.isFinite(bytes) || bytes < 16 || bytes > 256) {
    console.error("❌ --bytes は 16〜256 の範囲で指定してください")
    process.exit(1)
  }

  const cronSecret = generate(bytes)
  const nextAuthSecret = generate(bytes)

  console.log("\n🔐 生成済みシークレット（コピーして Vercel に貼り付け）\n")
  console.log(`CRON_SECRET=${cronSecret}`)
  console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`)

  if (showVercelCli) {
    console.log("\n--- Vercel CLI コマンド ---")
    console.log(
      `vercel env add CRON_SECRET production <<< '${cronSecret}'`
    )
    console.log(
      `vercel env add NEXTAUTH_SECRET production <<< '${nextAuthSecret}'`
    )
  }

  console.log("\n💡 これらを安全に保管してください。再生成するとすべて無効になります。")
}

main()
