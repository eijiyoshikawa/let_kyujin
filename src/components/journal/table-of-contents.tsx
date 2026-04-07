"use client"

type TocItem = {
  id: string
  text: string
  level: number
}

export function TableOfContents({ html }: { html: string }) {
  const items = extractHeadings(html)
  if (items.length === 0) return null

  return (
    <div className="rounded-lg border bg-gray-50 p-5">
      <h2 className="mb-3 text-sm font-bold text-gray-900">目次</h2>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className={item.level === 3 ? "ml-4" : ""}
          >
            <a
              href={`#${item.id}`}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function extractHeadings(html: string): TocItem[] {
  const items: TocItem[] = []
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/g
  let match
  while ((match = regex.exec(html)) !== null) {
    items.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ""),
    })
  }
  return items
}
