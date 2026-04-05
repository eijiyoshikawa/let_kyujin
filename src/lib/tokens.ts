import { randomBytes } from "crypto"

/** Generate a secure random token for password reset */
export function generateToken(): string {
  return randomBytes(32).toString("hex")
}

/** Token expiry duration: 1 hour */
export const TOKEN_EXPIRY_MS = 60 * 60 * 1000
