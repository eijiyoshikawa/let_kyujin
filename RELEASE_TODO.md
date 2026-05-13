# リリース前 手作業リマインダー

> **このファイルはあなたが手作業で進めるべき項目のリスト。**
> 上から順に着手することを推奨。完了したら ✅ を付けるか削除。

---

## 🔴 最優先（今すぐ着手 — リードタイムが長いもの）

### 1. GbizINFO API キー申請 ⏳ 3 営業日

- [ ] https://info.gbiz.go.jp/hojin/Api にアクセス
- [ ] 「API キーの取得」から申請（無料、商用利用可）
- [ ] 取得した API キーを Vercel 環境変数 `GBIZ_API_TOKEN` に追加
  - Production / Preview 両方に設定
- [ ] 取得後、私に「GbizINFO API キー取得完了」と教えてください
  - 完了次第、`/lib/gbizinfo.ts` を本実装に切り替えて、求人カード / 企業詳細に建設業許可・表彰歴を表示します（追加 2〜3 日）

**取得できる主なデータ**: 建設業許可 28 業種 / 表彰歴（健康経営優良法人など）/ 設立年月 / 資本金 / 従業員数 / 補助金獲得歴

---

## 🟠 高優先（リリース直前にやる）

### 2. Supabase DB バックアップの自動化

- [ ] Supabase Dashboard → Database → Backups
- [ ] Daily backup が有効か確認（Pro プランは自動で有効）
- [ ] PITR (Point-In-Time Recovery) を有効化（任意、Pro プラン）

### 3. Vercel 環境変数の Preview 環境への展開

`DATABASE_URL` / `NEXTAUTH_SECRET` 等を Production にしか設定してない場合、Preview デプロイが落ちる。
- [ ] Vercel → Settings → Environment Variables を開き、各変数の Environment に `Preview` チェックを追加
- 対象: `DATABASE_URL` / `DIRECT_URL` / `NEXTAUTH_*` / `LINE_*` / `STRIPE_*` / `RESEND_API_KEY` / `SENTRY_*` / `VAPID_*`

### 4. Supabase パスワードのローテーション（漏洩リスク対応）

過去のチャットで一度パスワードが平文で共有されたため、念のため:
- [ ] Supabase → Settings → Database → Reset database password
- [ ] 新パスワードで `.env` の `DATABASE_URL` / `DIRECT_URL` を更新
- [ ] Vercel 環境変数（Production / Preview）も更新
- [ ] Vercel で Redeploy

### 5. Cron Job の Vercel 登録（実装は済み）

`vercel.json` に追加するか、Vercel Dashboard → Cron Jobs から:
- [ ] `POST /api/cron/refresh-mv` — 10 分間隔
- [ ] `POST /api/cron/expire-jobs` — 日次（毎日 04:00 JST）
- [ ] `POST /api/cron/saved-search-alerts` — 日次（毎日 08:00 JST）
- [ ] `POST /api/cron/hellowork-import` — 2 時間ごと（既存）
- 各 Cron には `Authorization: Bearer ${CRON_SECRET}` を付与

### 6. Google Search Console 登録

- [ ] https://search.google.com/search-console から `genbacareer.jp` を追加
- [ ] DNS TXT レコードまたは HTML タグで所有権確認
- [ ] `https://genbacareer.jp/sitemap.xml` を Sitemap 送信
- [ ] `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` を Vercel 環境変数に追加（HTML タグ方式の場合）

---

## 🟡 中優先（リリース後 1 週間以内）

### 7. Google Analytics 4 / Vercel Analytics 接続確認

- [ ] `NEXT_PUBLIC_GA_ID` を Vercel に設定（既存の `<GoogleAnalytics />` が読む）
- [ ] Cookie 同意バナーで「すべて受け入れる」を選択 → GA リアルタイムレポートで自身を確認
- [ ] Vercel → Analytics タブで PV / Web Vitals が記録され始めているか確認

### 8. LINE 公式アカウント連携

- [ ] LINE Developers で Messaging API 設定
- [ ] Webhook URL を `https://genbacareer.jp/api/line/webhook` に設定
- [ ] チャネルアクセストークン / シークレットを `LINE_CHANNEL_*` に
- [ ] リッチメニュー登録: `pnpm tsx scripts/setup-line-rich-menu.ts`

### 9. Stripe / MoneyForward 請求書連携

- [ ] Stripe ダッシュボード → Webhooks: `https://genbacareer.jp/api/webhooks/stripe`
- [ ] イベント `customer.subscription.*` `invoice.payment_succeeded` をサブスクライブ
- [ ] Webhook secret を `STRIPE_WEBHOOK_SECRET` に

### 10. Sentry プロジェクト作成

- [ ] sentry.io でプロジェクト作成（Next.js）
- [ ] `SENTRY_DSN` `SENTRY_ORG` `SENTRY_PROJECT` `SENTRY_AUTH_TOKEN` を Vercel に
- [ ] アラートルール: error rate > 1% で Slack / メール通知

---

## 🟢 低優先（リリース後 1 ヶ月以内）

### 11. メール（Resend）テンプレート確認

- [ ] `RESEND_API_KEY` 設定
- [ ] テストモードで signup / 応募完了 / スカウト受信メールを送信してみる

### 12. PWA アイコン / OGP 画像の最終版

- [ ] `/icon` `/apple-icon` `/opengraph-image` が現在は動的生成
- [ ] 必要に応じてデザイナーから受け取った PNG を `public/` に置き、`src/app/icon.tsx` をシンプルにする

### 13. 法務テキストの最終チェック

- [ ] `/terms` `/privacy` `/legal` の文言を顧問弁護士確認
- [ ] 退会後のデータ保持期間を明文化

### 14. 求人 / 企業の本番データ投入

- [ ] 直接掲載企業の最初の数社分のデータ手動入力
- [ ] HelloWork API からの自動取り込み起動確認

---

## 📋 すでに完了済み

参考: 直近のセッションで完了した手作業:
- ✅ Supabase Pro プランへアップグレード
- ✅ `DIRECT_URL` を Session pooler URL に設定（pgbouncer 対応）
- ✅ `pnpm prisma db push` でスキーマ同期
- ✅ Materialized View 投入（`job_category_counts` / `job_pref_category_counts`）

---

## このファイルの更新

新しい手作業項目が発生したら、上記カテゴリに沿って追加してください。
私（Claude）への指示時には「RELEASE_TODO.md の N 番」と参照すると話が早いです。
