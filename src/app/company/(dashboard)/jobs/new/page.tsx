import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { JobForm } from "@/components/company/job-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "新規求人作成",
}

export default async function NewJobPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const companyId = (session.user as { companyId?: string }).companyId
  if (!companyId) redirect("/login")

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">新規求人作成</h1>
      <div className="mt-6">
        <JobForm companyId={companyId} />
      </div>
    </div>
  )
}
