#!/usr/bin/env node
/**
 * 管理者パスワード照合スクリプト（ローカル確認用）
 *
 * 使い方:
 *   node scripts/check-admin-password.cjs 'PW' '$2b$10$...'
 */
const { compareSync } = require("bcryptjs")

const [, , password, hash] = process.argv

if (!password || !hash) {
  console.error("Usage: node scripts/check-admin-password.cjs '<password>' '<hash>'")
  process.exit(1)
}

const ok = compareSync(password, hash)
console.log(ok ? "OK: password matches hash" : "NG: password does NOT match hash")
process.exit(ok ? 0 : 1)
