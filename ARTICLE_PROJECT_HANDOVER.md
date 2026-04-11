# 記事シード投入プロジェクト — 引き継ぎドキュメント

> 新セッションで次のステップ（DB シード投入・動作確認）を開始するためのサマリー

## 1. 現在の状態（TL;DR）

- **ブランチ**: `claude/debug-application-errors-gcG3u`（プッシュ済み）
- **記事ファイル**: 399 / 399 件すべて作成済み・コミット済み
- **最新コミット**: `266817b content: batch 5 of 200 new articles (plans 360-399)`
- **DB への投入**: **まだ未実施**（← これが次のステップ 1）
- **設計方針**: 建設業特化 / ですます調 / h2 5〜15本 / table・ul・ol構造
- **インタビュー記事**: バッチ1・2で作成済みのもののみ（以降は方針変更で作成しない）

## 2. 成果物の全体像

| 項目 | 件数 | 場所 |
|---|---|---|
| 記事プラン | 399 件 | `prisma/seed-data/article-plans.ts` |
| 記事本文（HTML） | 399 件 | `prisma/seed-data/articles/*.html` |
| シードスクリプト | 1 個 | `prisma/seed-data/seed-articles.ts` |

### カテゴリ内訳（399件合計）

- `industry` — 業界動向・新技術・労働環境・社会課題
- `job-type` — 職種解説（建築・土木・設備・内装・解体 等）
- `license` — 国家資格・技能士・特別教育・技能講習
- `career` — 転職・年代別戦略・独立・CCUS・面接対策
- `salary` — 年収・地域別賃金・手当・給与制度
- `interview` — バッチ1・2 の既存分のみ（以降は方針変更で廃止）

### コミット履歴

| コミット | 内容 |
|---|---|
| `266817b` | batch 5（plans 360-399）最終40件 |
| `4a4a331` | batch 4（plans 320-359）40件 |
| `fb7a667` | batch 3（plans 280-319）40件 |
| `9d3773e` | batch 2（plans 240-279）40件 |
| `870ba5d` | batch 1（plans 200-239）40件 |
| `f0f8bad` | 元の 199 件の HTML 本文完成 |

## 3. 主要ファイルの役割

### `prisma/seed-data/article-plans.ts`
- 全 399 件の記事メタ情報（slug / title / category / tags / excerpt）を配列で保持
- `interface ArticlePlan` でスキーマ定義
- バッチごとに `// === 追加200記事 第Nバッチ ===` コメントで区切られている

### `prisma/seed-data/seed-articles.ts`
- `articlePlans` をループして各記事を `prisma.article.upsert()` で投入
- 本文の取得ロジック:
  1. `articles/<slug>.html` が存在 → その HTML を使用（= 実コンテンツ）
  2. 存在しない → `generatePlaceholderBody()` のプレースホルダーに fallback
- **upsert** なので、複数回実行しても安全（HTML を後から追加すると本文だけ差し替わる）
- `publishedAt` は 2026-01-01 から 1日1記事ペースで自動採番
- `featured` は最初の3件のみ true
- `update` 時は `featured` / `publishedAt` を温存（既存値を壊さない）

### `prisma/seed-data/articles/<slug>.html`
- 各記事の本文（HTML スニペット、`<html>` や `<body>` タグなし）
- ですます調、h2 で小見出し、ul / ol / table で構造化
- ファイル名 = article-plans.ts の `slug` と完全一致

### `package.json`
- シード実行スクリプト: `"db:seed-articles": "tsx prisma/seed-data/seed-articles.ts"`

## 4. 次にやること（1から順に）

### ステップ 1: DB シード投入（最優先）

```bash
pnpm db:seed-articles
```

期待される出力:
```
Articles seed complete: 399 real content / 0 placeholder / 399 total
```

**注意点**:
- `.env` の `DATABASE_URL`（Supabase）が正しいことを事前確認
- `pnpm prisma generate` を最近実行していなければ先に実行
- upsert なので複数回実行しても安全（ただし 399件×upsert なので数十秒かかる）
- `placeholder` が 0 でなければ、HTML ファイル名と slug のミスマッチがある

### ステップ 2: 動作確認

- [ ] 開発サーバー起動: `pnpm dev`
- [ ] 記事一覧ページで 399 件が表示されるか
- [ ] 記事詳細ページで本文（HTML）が正しくレンダリングされるか
- [ ] カテゴリフィルタが各カテゴリで動作するか
- [ ] 検索（タグ・タイトル）が機能するか
- [ ] `/admin` の記事管理画面で一覧・編集ができるか
- [ ] 公開日（`publishedAt`）順のソートが意図通りか
- [ ] `featured: true` の 3 件がトップに表示されるか

### ステップ 3: ビルド & 型チェック

```bash
pnpm build
pnpm lint
```

Next.js 16 の `params` / `searchParams` は Promise なので、記事詳細ページで await を忘れていないか注意。

### ステップ 4（任意）: 今後の拡張方針の決定

追加で 200〜400 件の記事投入を視野に入れる場合、以下のどちらかを検討:

- **A. 現在の HTML ファイル方式を継続** — スラグ重複チェックや context 消費が課題
- **B. 管理 UI / CMS から追加できる仕組みに移行** — 長期運用向き、初期開発コストあり

前回セッションでの推奨は「いったん 399 件完成 → 次の追加は管理 UI 経由」。

## 5. 重要な注意事項・ハマりどころ

### スラグ重複チェック

バッチ追加時に既存の 399 件と重複しないか必ず確認:

```bash
ls prisma/seed-data/articles/ | sort > /tmp/existing.txt
# 新規スラグリストを /tmp/new.txt に作成
sort /tmp/new.txt > /tmp/new_sorted.txt
comm -12 /tmp/existing.txt /tmp/new_sorted.txt  # 重複を表示
```

過去にリネームした slug の履歴:
- `construction-renovation-market` → `construction-renovation-craftsman`（batch 3）
- `construction-salary-negotiation` → `construction-salary-negotiation-tips`（batch 3）
- `building-equipment-inspector` → `building-equipment-inspector-cert`（batch 3）
- `construction-social-insurance` → `construction-social-insurance-guide`（batch 4）
- `construction-mental-health` → `construction-mental-care`（batch 5）

### HTML フォーマットの統一（バッチ2以降の標準）

- `<p>`で導入 → `<h2>` で小見出し10〜15本 → `<p>`でまとめ
- 最後は「建設求人ポータルでは〜掲載しています。ぜひチェックしてみてください。」で締める
- 表（`<table><thead><tr><th>...</th></tr></thead><tbody>...</tbody></table>`）を1〜2か所
- リスト（`<ul>` / `<ol>`）を複数
- 文字数: 4,000〜6,000字（HTMLタグ込）が目安

### インタビュー記事の方針

- バッチ1・2 で作成した以下はそのまま残す:
  - `interview-tobi-career`
  - `interview-factory-to-electrician`
  - `interview-returnee-japan`
  - `interview-female-dokata`
  - `interview-plumber-life`
  - `interview-glass-worker`
  - `interview-roofer-20years`
  - その他バッチ1・2 の interview カテゴリ
- **バッチ3以降は作成しない**（書きづらいため、ユーザー指示）

### Prisma / DB 関連

- DB は Supabase（PostgreSQL）
- スキーマは `prisma/schema.prisma` の `Article` モデル
- 既に `npx prisma db push` 済み（`Article` テーブル存在）
- `.env` の `DATABASE_URL` は直接接続文字列

## 6. プロジェクト設計ドキュメント参照先

- **CLAUDE.md**: 技術スタック・開発ルール・コマンド一覧
- **アーキテクチャ**: `eijiyoshikawa/agents/agents/tech_lead/architecture_xwork_clone.json`
- 技術スタック:
  - Next.js 15 (App Router) + TypeScript (strict mode)
  - Tailwind CSS v4
  - Prisma v6 + PostgreSQL (Supabase)
  - NextAuth.js v5 (beta)
  - Zod v4

## 7. 新セッション開始時の指示テンプレート

新しい Claude Code セッションで次のステップを開始する際は、以下を最初に伝えてください:

```
前回のセッションで建設業特化の記事 399 件を prisma/seed-data/articles/ に
HTML で用意し、article-plans.ts と seed-articles.ts の準備も完了しています。
詳細は ARTICLE_PROJECT_HANDOVER.md を参照してください。

次にやりたいのは:
1. `pnpm db:seed-articles` で 399 件を Supabase に投入
2. `pnpm dev` で記事一覧・詳細ページの表示確認
3. （問題なければ）管理画面での記事管理動作確認

ステップ 1 から順に進めてください。
```

---

*このドキュメントは前回セッション終了時点（2026-04-11）のスナップショットです。*
