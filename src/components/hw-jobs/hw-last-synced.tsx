import { Clock } from "lucide-react"
import { formatLastSynced } from "@/lib/jobs-api/format"

export function HwLastSynced({ isoDatetime }: { isoDatetime: string | null | undefined }) {
  const formatted = formatLastSynced(isoDatetime)
  if (!formatted) return null
  return (
    <p className="mt-6 flex items-center gap-1 text-xs text-gray-500">
      <Clock className="h-3 w-3" />
      ハローワーク求人の最終同期: {formatted}
      <span className="text-gray-400">
        （ハローワークインターネットサービスより転載・原文ママ）
      </span>
    </p>
  )
}
