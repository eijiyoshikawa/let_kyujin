/**
 * HelloWork API の生レスポンスを表示するデバッグスクリプト
 *
 * 使い方:
 *   pnpm tsx --env-file=.env.local scripts/dump-hellowork-raw.ts
 *
 * 1. getToken を叩いて生 XML をそのまま表示
 * 2. （成功した場合）抽出を試みず、ユーザーが手動で構造を確認できるようにする
 *
 * トークン発行レスポンスには通常トークン文字列のみが含まれます。
 * 出力をチャットに貼っても致命的ではありませんが、念のため
 * 「もし長い英数字列が含まれていたらマスクして貼ってください」と
 * 注意してください。
 */

const BASE =
  process.env.HELLOWORK_API_BASE ??
  "https://teikyo.hellowork.mhlw.go.jp/teikyo/api/2.0"

async function main() {
  const id = process.env.HELLOWORK_API_USER
  const pass = process.env.HELLOWORK_API_PASS
  if (!id || !pass) {
    console.error("ERROR: HELLOWORK_API_USER / HELLOWORK_API_PASS 未設定")
    process.exit(1)
  }

  const body = new URLSearchParams()
  body.append("id", id)
  body.append("pass", pass)

  console.log(`POST ${BASE}/auth/getToken`)
  const res = await fetch(`${BASE}/auth/getToken`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  console.log(`HTTP ${res.status} ${res.statusText}`)
  console.log("--- response headers ---")
  res.headers.forEach((v, k) => console.log(`  ${k}: ${v}`))
  console.log("--- response body (raw) ---")
  const text = await res.text()
  console.log(text)
  console.log("--- end ---")
  console.log(`(body length: ${text.length} bytes)`)
}

main().catch((e) => {
  console.error("Unhandled error:", e)
  process.exit(1)
})
