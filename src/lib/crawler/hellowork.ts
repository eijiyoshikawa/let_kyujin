/**
 * ハローワーク求人情報提供 API クライアント
 *
 * 厚生労働省「ハローワーク求人・求職情報提供サービス」の公式 API を呼び出し、
 * XML レスポンスをパースして構造化データに変換するモジュール。
 *
 * 公式 API ベース URL: https://teikyo.hellowork.mhlw.go.jp/teikyo/api/2.0/
 *
 * 利用フロー:
 *   1. getToken(id, pass) でトークン発行
 *   2. fetchKyujinIdList(token) でデータ ID リストを取得
 *   3. fetchKyujinByDataId(token, dataId, page) で求人 XML を取得（最大1,000件/ページ）
 *   4. delToken(token) でトークン破棄
 *
 * トークンは発行当日のみ有効。日跨ぎで再発行が必要。
 *
 * @module hellowork-api
 */

import { XMLParser } from "fast-xml-parser"

// ========================================
// 型定義（import-batch.ts と互換維持）
// ========================================

/** API 用の認証情報 */
export interface HelloworkCredentials {
  id: string
  pass: string
}

/** ハローワーク API からパースされた求人データ */
export interface HelloworkJobData {
  helloworkId: string
  title: string
  companyName: string
  salaryMin: number | null
  salaryMax: number | null
  salaryType: "monthly" | "hourly" | "annual" | null
  prefecture: string
  city: string | null
  address: string | null
  employmentType: "full_time" | "part_time" | "contract" | null
  description: string | null
  requirements: string | null
  source: "hellowork"
  attribution: string
}

/** クローラーの取得結果 */
export interface CrawlResult {
  jobs: HelloworkJobData[]
  totalCount: number
  currentPage: number
  totalPages: number
  crawledAt: Date
}

// ========================================
// 定数
// ========================================

const DEFAULT_API_BASE =
  "https://teikyo.hellowork.mhlw.go.jp/teikyo/api/2.0"

const ATTRIBUTION =
  "出典: ハローワーク求人・求職情報提供サービス (https://teikyo.hellowork.mhlw.go.jp)"

const REQUEST_INTERVAL_MS = 1000

function getApiBase(): string {
  return process.env.HELLOWORK_API_BASE ?? DEFAULT_API_BASE
}

// ========================================
// レート制限
// ========================================

let lastRequestTime = 0

async function enforceRateLimit(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < REQUEST_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, REQUEST_INTERVAL_MS - elapsed))
  }
  lastRequestTime = Date.now()
}

// ========================================
// HTTP ユーティリティ
// ========================================

async function postForm(
  url: string,
  params: Record<string, string>
): Promise<string> {
  await enforceRateLimit()

  const body = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) body.append(k, v)

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    throw new Error(
      `HelloWork API リクエスト失敗: ${res.status} ${res.statusText} (${url})`
    )
  }
  return await res.text()
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  parseTagValue: false,
})

function parseXml<T = unknown>(xml: string): T {
  return xmlParser.parse(xml) as T
}

// ========================================
// 認証
// ========================================

/**
 * トークン発行 (POST /auth/getToken)
 */
export async function getToken(creds: HelloworkCredentials): Promise<string> {
  const xml = await postForm(`${getApiBase()}/auth/getToken`, {
    id: creds.id,
    pass: creds.pass,
  })
  const parsed = parseXml<Record<string, unknown>>(xml)
  const token = extractToken(parsed)
  if (!token) {
    throw new Error(
      `トークン取得に失敗: レスポンスから token を抽出できません: ${xml.slice(0, 200)}`
    )
  }
  return token
}

/**
 * <root><token>...</token></root> 構造から token を抽出する。
 * フォールバックとして、十分な長さ (>=16) の文字列値を再帰探索する。
 */
function extractToken(parsed: unknown): string | null {
  const direct = (parsed as { root?: { token?: unknown } } | null)?.root?.token
  if (typeof direct === "string" && direct.trim()) return direct.trim()

  let best: string | null = null
  walk(parsed)
  return best
  function walk(n: unknown): void {
    if (!n || typeof n !== "object") return
    if (Array.isArray(n)) {
      n.forEach(walk)
      return
    }
    for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
      if (k.startsWith("?")) continue
      if (typeof v === "string") {
        const t = v.trim()
        if (t.length >= 16 && (!best || t.length > best.length)) best = t
      } else if (typeof v === "object") {
        walk(v)
      }
    }
  }
}

/**
 * トークン破棄 (POST /auth/delToken)
 */
export async function delToken(token: string): Promise<void> {
  await postForm(`${getApiBase()}/auth/delToken`, { token })
}

// ========================================
// 求人データ取得
// ========================================

/**
 * 求人一覧データID取得 (POST /kyujin)
 * 求人情報データの取得が可能なデータ ID のリストを返す。
 */
export async function fetchKyujinIdList(token: string): Promise<string[]> {
  const xml = await postForm(`${getApiBase()}/kyujin`, { token })
  const parsed = parseXml<Record<string, unknown>>(xml)
  return collectStrings(parsed, /^(dataId|id)$/i)
}

/**
 * 指定求人データ取得 (POST /kyujin/{dataId}/{page})
 * 指定したデータ ID に紐づく求人情報（最大1,000件/ページ）を取得する。
 */
export async function fetchKyujinByDataId(
  token: string,
  dataId: string,
  page = 1
): Promise<HelloworkJobData[]> {
  const xml = await postForm(
    `${getApiBase()}/kyujin/${encodeURIComponent(dataId)}/${page}`,
    { token }
  )
  const parsed = parseXml<Record<string, unknown>>(xml)
  return parseJobsFromKyujinXml(parsed)
}

// ========================================
// XML パース
// ========================================

function collectStrings(node: unknown, keyPattern: RegExp): string[] {
  const out: string[] = []
  walk(node)
  return out
  function walk(n: unknown): void {
    if (!n || typeof n !== "object") return
    if (Array.isArray(n)) {
      n.forEach(walk)
      return
    }
    for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
      if (keyPattern.test(k)) {
        if (typeof v === "string" && v.trim()) out.push(v.trim())
        else if (Array.isArray(v)) {
          for (const item of v) {
            if (typeof item === "string" && item.trim()) out.push(item.trim())
          }
        }
      }
      walk(v)
    }
  }
}

function parseJobsFromKyujinXml(parsed: unknown): HelloworkJobData[] {
  const records = findKyujinRecords(parsed)
  return records
    .map(toHelloworkJobData)
    .filter((j): j is HelloworkJobData => j !== null)
}

function findKyujinRecords(node: unknown): Record<string, unknown>[] {
  const acc: Record<string, unknown>[] = []
  walk(node)
  return acc
  function walk(n: unknown): void {
    if (!n || typeof n !== "object") return
    if (Array.isArray(n)) {
      n.forEach(walk)
      return
    }
    const obj = n as Record<string, unknown>
    if (looksLikeKyujinRecord(obj)) {
      acc.push(obj)
      return
    }
    for (const v of Object.values(obj)) walk(v)
  }
}

function looksLikeKyujinRecord(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj).map((k) => k.toLowerCase())
  const hasId = keys.some((k) => /(kyujinno|kyujinbango|jobno|jobnumber)/.test(k))
  const hasTitleish = keys.some((k) =>
    /(shokushuname|shokushu|jobtitle|title|shigotonaiyou)/.test(k)
  )
  return hasId && hasTitleish
}

function toHelloworkJobData(
  record: Record<string, unknown>
): HelloworkJobData | null {
  const get = (patterns: RegExp[]): string | null => {
    for (const [k, v] of Object.entries(record)) {
      const lk = k.toLowerCase()
      if (patterns.some((p) => p.test(lk))) {
        if (typeof v === "string") return v.trim() || null
        if (typeof v === "number") return String(v)
      }
    }
    return null
  }

  const helloworkId = get([/^(kyujinno|kyujinbango|jobno|jobnumber)$/])
  if (!helloworkId) return null

  const title = get([/(shokushuname|jobtitle|^title$)/]) ?? "不明"
  const companyName =
    get([/(jigyoshoname|companyname|jigyousho|company)/]) ?? "不明"
  const description = get([/(shigotonaiyou|description|naiyou)/])
  const requirements = get([/(hitsuyounakeiken|requirements|shikaku)/])
  const prefecture = get([/(prefecture|todoufuken|shozaichi.*ken|kinmuti.*ken)/]) ?? ""
  const city = get([/(city|shichouson)/])
  const address = get([/(address|shozaichi|kinmuchi|kinmuti)/])

  const salaryText = [
    get([/(chinginkeitai|salaryform)/]),
    get([/(chinginmin|salarymin|^chingin$)/]),
    get([/(chinginmax|salarymax)/]),
  ]
    .filter(Boolean)
    .join(" ")
  const salary = parseSalary(salaryText)

  const employmentText = get([/(koyoukeitai|employmenttype|koyou)/]) ?? ""
  const employmentType = parseEmploymentType(employmentText)

  return {
    helloworkId,
    title,
    companyName,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryType: salary.type,
    prefecture,
    city,
    address,
    employmentType,
    description,
    requirements,
    source: "hellowork",
    attribution: ATTRIBUTION,
  }
}

// ========================================
// 値パース
// ========================================

export function parseSalary(salaryText: string): {
  min: number | null
  max: number | null
  type: "monthly" | "hourly" | "annual" | null
} {
  if (!salaryText) return { min: null, max: null, type: null }
  const normalized = salaryText.replace(/,/g, "").replace(/，/g, "")

  let type: "monthly" | "hourly" | "annual" | null = null
  if (/月額|月給/.test(normalized)) type = "monthly"
  else if (/時給|時間額/.test(normalized)) type = "hourly"
  else if (/年俸|年額|年収/.test(normalized)) type = "annual"
  else if (/日給/.test(normalized)) {
    type = "monthly"
    const dailyNumbers = normalized.match(/(\d+)/g)
    if (dailyNumbers) {
      const min = parseInt(dailyNumbers[0], 10) * 22
      const max =
        dailyNumbers.length > 1 ? parseInt(dailyNumbers[1], 10) * 22 : null
      return { min, max, type }
    }
  }

  const numbers = normalized.match(/(\d+)/g)
  if (!numbers || numbers.length === 0) return { min: null, max: null, type }
  const min = parseInt(numbers[0], 10)
  const max = numbers.length > 1 ? parseInt(numbers[1], 10) : null
  return { min, max, type }
}

function parseEmploymentType(
  text: string
): "full_time" | "part_time" | "contract" | null {
  if (!text) return null
  if (/正社員|正規/.test(text)) return "full_time"
  if (/パート|アルバイト|短時間/.test(text)) return "part_time"
  if (/契約|有期|派遣|臨時|嘱託/.test(text)) return "contract"
  return null
}

// ========================================
// オーケストレーション
// ========================================

/**
 * ID/パスから全求人を取得する高レベル関数。
 *   1. getToken
 *   2. fetchKyujinIdList
 *   3. 各 dataId について fetchKyujinByDataId をページングしながら取得
 *   4. delToken
 *
 * @param creds - API 認証情報。省略時は環境変数から取得
 * @param options.maxPagesPerDataId - 各 dataId あたりの最大ページ数（デフォルト: 50）
 * @param options.maxJobs - 取得する求人の上限（デフォルト: 無制限）
 */
export async function fetchAllJobs(
  creds?: HelloworkCredentials,
  options: { maxPagesPerDataId?: number; maxJobs?: number } = {}
): Promise<CrawlResult> {
  const { maxPagesPerDataId = 50, maxJobs = Infinity } = options
  const credentials = creds ?? readCredentialsFromEnv()
  const token = await getToken(credentials)

  try {
    const dataIds = await fetchKyujinIdList(token)
    const allJobs: HelloworkJobData[] = []

    outer: for (const dataId of dataIds) {
      for (let page = 1; page <= maxPagesPerDataId; page++) {
        const jobs = await fetchKyujinByDataId(token, dataId, page)
        if (jobs.length === 0) break
        allJobs.push(...jobs)
        if (allJobs.length >= maxJobs) {
          allJobs.length = maxJobs
          break outer
        }
      }
    }

    return {
      jobs: allJobs,
      totalCount: allJobs.length,
      currentPage: 1,
      totalPages: 1,
      crawledAt: new Date(),
    }
  } finally {
    try {
      await delToken(token)
    } catch (e) {
      console.error(
        `[hellowork] トークン破棄に失敗: ${e instanceof Error ? e.message : e}`
      )
    }
  }
}

function readCredentialsFromEnv(): HelloworkCredentials {
  const id = process.env.HELLOWORK_API_USER
  const pass = process.env.HELLOWORK_API_PASS
  if (!id || !pass) {
    throw new Error(
      "HelloWork API 認証情報が未設定: HELLOWORK_API_USER / HELLOWORK_API_PASS を環境変数に設定してください"
    )
  }
  return { id, pass }
}
