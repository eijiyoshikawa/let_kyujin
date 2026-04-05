"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
} from "lucide-react"

const navItems = [
  { href: "/company/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/company/jobs", label: "求人管理", icon: Briefcase },
  { href: "/company/applications", label: "応募者管理", icon: Users },
]

export function CompanySidebar({
  userName,
  role,
}: {
  companyId: string
  userName: string
  role: string
}) {
  const pathname = usePathname()

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <div className="rounded-lg border bg-white shadow-sm">
        {/* Company user info */}
        <div className="border-b p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {userName}
              </p>
              <p className="text-xs text-gray-500">
                {role === "company_admin" ? "管理者" : "メンバー"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
