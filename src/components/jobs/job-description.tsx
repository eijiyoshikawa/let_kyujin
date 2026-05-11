import { formatDescriptionSections } from "@/lib/job-enrichment"

/**
 * HelloWork の長文 description を見出し付きセクションに分解して描画する。
 *
 * 取り込み時には保存テキストを変更しないので、抽出ロジックは将来調整可能。
 */
export function JobDescription({
  text,
}: {
  text: string | null | undefined
}) {
  const sections = formatDescriptionSections(text)
  if (sections.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        詳細な仕事内容はハローワークの掲載ページでご確認ください。
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {sections.map((section, i) => (
        <section key={i}>
          {section.heading && (
            <h3 className="mb-2 inline-block bg-primary-50 px-2.5 py-1 text-sm font-bold text-primary-700">
              {section.heading}
            </h3>
          )}
          <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
            {section.body}
          </p>
        </section>
      ))}
    </div>
  )
}
