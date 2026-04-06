/**
 * 環境変数のランタイムバリデーション
 *
 * 必須変数が未設定の場合、サーバー起動時にエラーを投げる。
 * オプション変数は型安全に取得できるヘルパーを提供。
 */

function required(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function optional(key: string, fallback: string = ""): string {
  return process.env[key] ?? fallback
}

export const env = {
  // Database
  DATABASE_URL: required("DATABASE_URL"),

  // NextAuth
  NEXTAUTH_URL: required("NEXTAUTH_URL"),
  NEXTAUTH_SECRET: required("NEXTAUTH_SECRET"),

  // Site URL
  SITE_URL: optional("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: optional("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: optional("GOOGLE_CLIENT_SECRET"),

  // Stripe (optional)
  STRIPE_SECRET_KEY: optional("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: optional("STRIPE_WEBHOOK_SECRET"),

  // SendGrid (optional)
  SENDGRID_API_KEY: optional("SENDGRID_API_KEY"),
  EMAIL_FROM: optional("EMAIL_FROM", "noreply@example.com"),

  // Google Analytics (optional)
  GA_ID: optional("NEXT_PUBLIC_GA_ID"),
} as const
