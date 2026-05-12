import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Supabase Storage（記事サムネ等）
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // AVIF を優先（同等の見た目で WebP より 30% 程度小さい）。
    // 古いブラウザは WebP に自動フォールバックする。q や w は変更しないので
    // ロスレス改善 — 視覚品質はそのままにファイルサイズだけ縮む。
    formats: ["image/avif", "image/webp"],
    // 最適化後の画像を 7 日キャッシュ（Vercel エッジ）。
    // ソース URL に q/w が含まれているため再 fetch リスクは低い。
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

// SENTRY_DSN が未設定なら sentry config は完全に no-op で動作する
// authToken 未設定時は source maps アップロードがスキップされ警告のみ
export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
})
