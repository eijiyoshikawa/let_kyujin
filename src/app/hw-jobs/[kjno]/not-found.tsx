import Link from "next/link"
import { ArrowLeft, CalendarX } from "lucide-react"

export default function HwJobNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CalendarX className="mx-auto h-12 w-12 text-gray-300" />
      <h1 className="mt-4 text-xl font-bold text-gray-900">この求人は終了しました</h1>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
        紹介期限を過ぎた、または採用が決まったため、ハローワーク側で公開が終了している可能性があります。
        最新の求人は一覧からお探しください。
      </p>
      <Link
        href="/hw-jobs"
        className="mt-6 inline-flex items-center gap-1 rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        求人一覧へ戻る
      </Link>
    </div>
  )
}
