/**
 * scripts/setup-line-rich-menu.ts
 *
 * LINE 公式アカウントの Rich Menu を作成 / 画像アップロード / デフォルト割当する一回実行スクリプト。
 *
 * 実行方法:
 *   pnpm tsx scripts/setup-line-rich-menu.ts
 *
 * 必要な環境変数（.env.local / Vercel 共通）:
 *   LINE_CHANNEL_ACCESS_TOKEN
 *
 * 必要なファイル:
 *   scripts/rich-menu.png  ... 2500x1686 px の PNG
 *     - 用意できない場合、scripts/rich-menu-template.svg を Canva / Figma 等で
 *       PNG エクスポートしてください。サイズ厳密。
 *
 * Rich Menu は 2 行 3 列の 6 ボタン構成:
 *
 *   ┌────────────┬────────────┬────────────┐
 *   │ 求人を探す │  マガジン  │ 料金       │
 *   ├────────────┼────────────┼────────────┤
 *   │ 運営会社   │お問い合わせ│ 公式 SNS   │
 *   └────────────┴────────────┴────────────┘
 *
 * 既存の Rich Menu は削除して作り直す。
 */

import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import {
  createRichMenu,
  uploadRichMenuImage,
  setDefaultRichMenu,
  listRichMenus,
  deleteRichMenu,
  isMessagingConfigured,
} from "../src/lib/line-messaging"

const SITE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"
const IMAGE_PATH = join(process.cwd(), "scripts", "rich-menu.png")

const WIDTH = 2500
const HEIGHT = 1686
const COL_W = Math.floor(WIDTH / 3)
const ROW_H = Math.floor(HEIGHT / 2)

const richMenuDef = {
  size: { width: WIDTH, height: HEIGHT },
  selected: true,
  name: "GenbaCareer Main Menu",
  chatBarText: "メニュー",
  areas: [
    {
      bounds: { x: 0, y: 0, width: COL_W, height: ROW_H },
      action: { type: "uri" as const, label: "求人を探す", uri: `${SITE}/jobs` },
    },
    {
      bounds: { x: COL_W, y: 0, width: COL_W, height: ROW_H },
      action: { type: "uri" as const, label: "マガジン", uri: `${SITE}/journal` },
    },
    {
      bounds: { x: COL_W * 2, y: 0, width: WIDTH - COL_W * 2, height: ROW_H },
      action: { type: "message" as const, label: "料金", text: "料金" },
    },
    {
      bounds: { x: 0, y: ROW_H, width: COL_W, height: HEIGHT - ROW_H },
      action: { type: "message" as const, label: "運営会社", text: "会社" },
    },
    {
      bounds: { x: COL_W, y: ROW_H, width: COL_W, height: HEIGHT - ROW_H },
      action: { type: "uri" as const, label: "お問い合わせ", uri: `${SITE}/contact` },
    },
    {
      bounds: { x: COL_W * 2, y: ROW_H, width: WIDTH - COL_W * 2, height: HEIGHT - ROW_H },
      action: {
        type: "uri" as const,
        label: "公式 SNS",
        uri: "https://www.instagram.com/let_kensetsu",
      },
    },
  ],
}

async function main() {
  if (!isMessagingConfigured()) {
    console.error("✖ LINE_CHANNEL_ACCESS_TOKEN / LINE_CHANNEL_SECRET が未設定です")
    console.error("  .env.local もしくは Vercel 環境変数を確認してください")
    process.exit(1)
  }

  if (!existsSync(IMAGE_PATH)) {
    console.error(`✖ Rich Menu 画像が見つかりません: ${IMAGE_PATH}`)
    console.error("  2500x1686 px の PNG を上記パスに配置してください")
    console.error("  （Canva / Figma などで 2 行 3 列のボタン画像を作成）")
    process.exit(1)
  }

  // 既存メニュー削除（重複定義を避ける）
  console.log("→ 既存 Rich Menu を確認…")
  const existing = await listRichMenus()
  for (const rm of existing) {
    console.log(`  - 削除: ${rm.richMenuId} (${rm.name})`)
    await deleteRichMenu(rm.richMenuId)
  }

  console.log("→ 新規 Rich Menu を作成…")
  const richMenuId = await createRichMenu(richMenuDef)
  if (!richMenuId) {
    console.error("✖ Rich Menu 作成に失敗")
    process.exit(1)
  }
  console.log(`  ✓ richMenuId = ${richMenuId}`)

  console.log("→ 画像をアップロード…")
  const imageBuffer = readFileSync(IMAGE_PATH)
  const uploaded = await uploadRichMenuImage(richMenuId, imageBuffer, "image/png")
  if (!uploaded) {
    console.error("✖ 画像アップロードに失敗")
    process.exit(1)
  }
  console.log("  ✓ アップロード完了")

  console.log("→ デフォルト Rich Menu に設定…")
  const setDefault = await setDefaultRichMenu(richMenuId)
  if (!setDefault) {
    console.error("✖ デフォルト割り当てに失敗")
    process.exit(1)
  }
  console.log("  ✓ 完了")

  console.log("")
  console.log("🎉 Rich Menu のセットアップが完了しました")
  console.log("   LINE 公式アカウントを友だち追加して動作確認してください")
}

main().catch((e) => {
  console.error("✖ 予期しないエラー:", e)
  process.exit(1)
})
