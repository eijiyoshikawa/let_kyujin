/**
 * Company.schedulingUrls の型定義 + パース。
 *
 * 期待する形:
 *   [{ name: "Google Calendar", url: "https://...", primary?: true }, ...]
 */

export type SchedulingUrl = {
  name: string
  url: string
  primary?: boolean
}

const MAX_URLS = 10
const URL_RE = /^https?:\/\/[\w\-.]+/i

export function parseSchedulingUrls(raw: unknown): SchedulingUrl[] {
  if (!Array.isArray(raw)) return []
  const items: SchedulingUrl[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue
    const obj = entry as Record<string, unknown>
    const name = typeof obj.name === "string" ? obj.name.trim() : ""
    const url = typeof obj.url === "string" ? obj.url.trim() : ""
    if (!name || !url) continue
    if (!URL_RE.test(url)) continue
    items.push({
      name: name.slice(0, 60),
      url: url.slice(0, 500),
      primary: obj.primary === true,
    })
    if (items.length >= MAX_URLS) break
  }
  // 1 つだけ primary、最初に並ぶように整列
  // primary を先頭に、その後は登録順を維持
  const indexed = items.map((it, i) => ({ it, i }))
  indexed.sort((a, b) => {
    if (a.it.primary && !b.it.primary) return -1
    if (!a.it.primary && b.it.primary) return 1
    return a.i - b.i
  })
  return indexed.map((x) => x.it)
}
