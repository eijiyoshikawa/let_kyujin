import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("env validation", () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = {
      ...originalEnv,
      DATABASE_URL: "postgresql://test",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "test-secret",
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("exports required env vars when set", async () => {
    const { env } = await import("@/lib/env")
    expect(env.DATABASE_URL).toBe("postgresql://test")
    expect(env.NEXTAUTH_URL).toBe("http://localhost:3000")
    expect(env.NEXTAUTH_SECRET).toBe("test-secret")
  })

  it("provides fallback for optional env vars", async () => {
    const { env } = await import("@/lib/env")
    expect(env.SITE_URL).toBe("http://localhost:3000")
    expect(env.EMAIL_FROM).toBe("noreply@example.com")
  })

  it("throws when required var is missing", async () => {
    delete process.env.DATABASE_URL
    await expect(async () => {
      await import("@/lib/env")
    }).rejects.toThrow("Missing required environment variable: DATABASE_URL")
  })
})
