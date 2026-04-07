import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number
  totalPages: number
  basePath: string
}) {
  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)
  const sep = basePath.includes("?") ? "&" : "?"

  return (
    <nav aria-label="ページネーション" className="mt-8 flex justify-center">
      <ul className="flex items-center gap-1">
        <li>
          <PaginationLink
            href={currentPage > 1 ? `${basePath}${sep}page=${currentPage - 1}` : undefined}
            disabled={currentPage <= 1}
            aria-label="前のページ"
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationLink>
        </li>
        {pages.map((page, i) =>
          page === "..." ? (
            <li key={`ellipsis-${i}`}>
              <span className="px-2 text-gray-400">...</span>
            </li>
          ) : (
            <li key={page}>
              <PaginationLink
                href={`${basePath}${sep}page=${page}`}
                active={page === currentPage}
              >
                {page}
              </PaginationLink>
            </li>
          )
        )}
        <li>
          <PaginationLink
            href={currentPage < totalPages ? `${basePath}${sep}page=${currentPage + 1}` : undefined}
            disabled={currentPage >= totalPages}
            aria-label="次のページ"
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </li>
      </ul>
    </nav>
  )
}

function PaginationLink({
  href,
  active,
  disabled,
  children,
  ...props
}: {
  href?: string
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  "aria-label"?: string
}) {
  const className = cn(
    "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition",
    active
      ? "bg-blue-600 text-white"
      : disabled
        ? "text-gray-300 cursor-not-allowed"
        : "text-gray-700 hover:bg-gray-100"
  )

  if (!href || disabled) {
    return <span className={className} {...props}>{children}</span>
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  )
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = [1]
  if (current > 3) pages.push("...")
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push("...")
  pages.push(total)
  return pages
}
