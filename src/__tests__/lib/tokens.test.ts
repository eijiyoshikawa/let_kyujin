import { describe, it, expect } from "vitest"
import { generateToken, TOKEN_EXPIRY_MS } from "@/lib/tokens"

describe("generateToken", () => {
  it("generates a 64-character hex string", () => {
    const token = generateToken()
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it("generates unique tokens", () => {
    const token1 = generateToken()
    const token2 = generateToken()
    expect(token1).not.toBe(token2)
  })
})

describe("TOKEN_EXPIRY_MS", () => {
  it("is 1 hour in milliseconds", () => {
    expect(TOKEN_EXPIRY_MS).toBe(3600000)
  })
})
