import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CompanySidebar } from "@/components/company/sidebar"

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as { role?: string }).role
  if (role !== "company_admin" && role !== "company_member") {
    redirect("/login")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <CompanySidebar
          companyId={(session.user as { companyId?: string }).companyId ?? ""}
          userName={session.user.name ?? "担当者"}
          role={role}
        />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
