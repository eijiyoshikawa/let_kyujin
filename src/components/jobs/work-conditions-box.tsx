import {
  Clock,
  CalendarDays,
  Train,
  ShieldCheck,
} from "lucide-react"
import { extractWorkConditions } from "@/lib/job-enrichment"

/**
 * description / requirements から勤務時間・休日・通勤・保険を抽出して
 * カード型ボックスで表示する。何も抽出できない場合は null を返す。
 */
export function WorkConditionsBox({
  description,
  requirements,
}: {
  description: string | null | undefined
  requirements: string | null | undefined
}) {
  const c = extractWorkConditions(description, requirements)
  const hasAny =
    c.workingHours || c.holidays || c.accessNote || c.insurance
  if (!hasAny) return null

  return (
    <div className="border bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3">
        勤務条件
      </h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {c.workingHours && (
          <Item icon={<Clock className="h-4 w-4 text-primary-500" />} label="勤務時間" value={c.workingHours} />
        )}
        {c.holidays && (
          <Item icon={<CalendarDays className="h-4 w-4 text-primary-500" />} label="休日" value={c.holidays} />
        )}
        {c.accessNote && (
          <Item icon={<Train className="h-4 w-4 text-primary-500" />} label="通勤" value={c.accessNote} />
        )}
        {c.insurance && (
          <Item icon={<ShieldCheck className="h-4 w-4 text-primary-500" />} label="保険" value={c.insurance} />
        )}
      </dl>
      <p className="mt-3 text-[11px] text-gray-400">
        ※ 求人本文から自動抽出した参考情報です。最終的な条件は応募先にご確認ください。
      </p>
    </div>
  )
}

function Item({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">{icon}</div>
      <div>
        <dt className="text-[11px] font-medium text-gray-400">{label}</dt>
        <dd className="text-sm font-medium text-gray-900">{value}</dd>
      </div>
    </div>
  )
}
