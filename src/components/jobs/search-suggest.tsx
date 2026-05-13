"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { Search, History, X, Briefcase, MapPin, Tag } from "lucide-react"

type Suggestion = {
  type: "job" | "prefecture" | "tag"
  label: string
  href: string
}

const HISTORY_KEY = "job_search_history"
const HISTORY_LIMIT = 8

function loadHistory(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr)
      ? arr.filter((s) => typeof s === "string").slice(0, HISTORY_LIMIT)
      : []
  } catch {
    return []
  }
}

function saveHistory(items: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT)))
    // 同一タブ内でも反映するため CustomEvent を発火
    window.dispatchEvent(new CustomEvent("search-history-changed"))
  } catch {
    // ignore
  }
}

export function pushSearchHistory(query: string) {
  const q = query.trim()
  if (!q) return
  const cur = loadHistory().filter((s) => s !== q)
  saveHistory([q, ...cur])
}

/**
 * 求人検索のオートコンプリート + 検索履歴。
 *
 * - 入力中は `/api/jobs/suggest?q=...` を 200ms debounce で叩く
 * - 空入力時は localStorage の検索履歴（最大 8 件）を表示
 * - Enter で `/jobs?q=...` へ遷移
 * - 候補クリックで履歴に保存 + 遷移
 */
export function SearchSuggest({
  defaultValue = "",
  className = "",
  placeholder = "職種・キーワードで検索",
}: {
  defaultValue?: string
  className?: string
  placeholder?: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const history = useSyncExternalStore<string[]>(
    (cb) => {
      window.addEventListener("storage", cb)
      window.addEventListener("search-history-changed", cb)
      return () => {
        window.removeEventListener("storage", cb)
        window.removeEventListener("search-history-changed", cb)
      }
    },
    () => loadHistory(),
    () => []
  )
  const wrapperRef = useRef<HTMLDivElement>(null)

  // debounce で API 取得
  useEffect(() => {
    if (!open) return
    const q = value.trim()
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/jobs/suggest?q=${encodeURIComponent(q)}`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data) => {
          setSuggestions(data.suggestions ?? [])
        })
        .catch(() => {
          // ignore
        })
    }, 200)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [value, open])

  // クリック外で閉じる
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function submit(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    pushSearchHistory(trimmed)
    setOpen(false)
    router.push(`/jobs?q=${encodeURIComponent(trimmed)}`)
  }

  function removeHistoryItem(item: string, e: React.MouseEvent) {
    e.stopPropagation()
    const next = history.filter((h) => h !== item)
    saveHistory(next)
  }

  function clearHistory(e: React.MouseEvent) {
    e.stopPropagation()
    saveHistory([])
  }

  const showSuggestions = open && value.trim().length > 0 && suggestions.length > 0
  const showHistory = open && value.trim().length === 0 && history.length > 0

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(value)
        }}
        className="flex items-center gap-2"
      >
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full border border-gray-300 bg-white px-9 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none"
          autoComplete="off"
        />
      </form>

      {(showSuggestions || showHistory) && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto border border-gray-200 bg-white shadow-lg">
          {showHistory && (
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <History className="h-3 w-3" />
                  最近の検索
                </span>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[10px] text-gray-400 hover:text-red-600"
                >
                  すべて削除
                </button>
              </div>
              <ul>
                {history.map((h) => (
                  <li key={h}>
                    <button
                      type="button"
                      onClick={() => submit(h)}
                      className="group flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <span className="inline-flex items-center gap-2 truncate text-gray-700">
                        <History className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {h}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => removeHistoryItem(h, e)}
                        className="shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showSuggestions && (
            <ul>
              {suggestions.map((s, i) => (
                <li key={`${s.type}-${s.label}-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      pushSearchHistory(s.label)
                      setOpen(false)
                      router.push(s.href)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {s.type === "job" && (
                      <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary-500" />
                    )}
                    {s.type === "prefecture" && (
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    )}
                    {s.type === "tag" && (
                      <Tag className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    )}
                    <span className="truncate text-gray-700">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
