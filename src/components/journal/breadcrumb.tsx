import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="パンくずリスト" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <li>
          <Link href="/" className="flex items-center hover:text-gray-700">
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {item.href ? (
              <Link href={item.href} className="hover:text-gray-700">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
