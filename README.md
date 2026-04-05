# 求人ポータル (let-kyujin)

ノンデスク産業特化型の求人サイト。Next.js 15 + TypeScript + Prisma + PostgreSQL で構築。

## セットアップ

### 前提条件
- Node.js 20+
- pnpm 9+
- PostgreSQL (Supabase 推奨)

### インストール
```bash
pnpm install
```

### 環境変数
```bash
cp .env.example .env
# .env を編集して各種キーを設定
```

### データベース
```bash
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
```

### 開発サーバー
```bash
pnpm dev
```

### ビルド
```bash
pnpm build
pnpm start
```
