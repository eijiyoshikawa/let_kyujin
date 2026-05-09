import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { CompanyApprovalActions } from "./approval-actions"

export const metadata: Metadata = {
  title: "企業詳細",
}

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  pending: { text: "申請中", className: "bg-yellow-100 text-yellow-800" },
  approved: { text: "承認済", className: "bg-green-100 text-green-800" },
  rejected: { text: "却下", className: "bg-red-100 text-red-800" },
}

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      companyUsers: {
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      },
      _count: { select: { jobs: true, applications: true, scouts: true } },
    },
  })

  if (!company) notFound()

  const status = STATUS_LABEL[company.status] ?? STATUS_LABEL.pending

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/companies"
          className="text-sm text-primary-600 hover:underline"
        >
          ← 企業一覧へ
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              ID: {company.id}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${status.className}`}
          >
            {status.text}
          </span>
        </div>
      </div>

      {/* Approval actions */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="font-bold text-gray-900">承認操作</h2>
        <p className="mt-1 text-sm text-gray-500">
          現在のステータス: <strong>{status.text}</strong>
        </p>
        <CompanyApprovalActions
          companyId={company.id}
          status={company.status}
          rejectionReason={company.rejectionReason}
        />
      </div>

      {/* Company info */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="font-bold text-gray-900">基本情報</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-gray-500">業種</dt>
            <dd className="text-gray-900">{company.industry ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">都道府県</dt>
            <dd className="text-gray-900">{company.prefecture ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">担当メール</dt>
            <dd className="text-gray-900">{company.contactEmail ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">登録日</dt>
            <dd className="text-gray-900">
              {company.createdAt.toLocaleString("ja-JP")}
            </dd>
          </div>
          {company.approvedAt && (
            <div>
              <dt className="text-gray-500">承認日</dt>
              <dd className="text-gray-900">
                {company.approvedAt.toLocaleString("ja-JP")}
              </dd>
            </div>
          )}
          {company.rejectedAt && (
            <div>
              <dt className="text-gray-500">却下日</dt>
              <dd className="text-gray-900">
                {company.rejectedAt.toLocaleString("ja-JP")}
              </dd>
            </div>
          )}
          {company.rejectionReason && (
            <div className="sm:col-span-2">
              <dt className="text-gray-500">却下理由</dt>
              <dd className="text-gray-900">{company.rejectionReason}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">求人数</p>
          <p className="mt-1 text-2xl font-bold">{company._count.jobs}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">応募数</p>
          <p className="mt-1 text-2xl font-bold">
            {company._count.applications}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">スカウト数</p>
          <p className="mt-1 text-2xl font-bold">{company._count.scouts}</p>
        </div>
      </div>

      {/* Users */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="font-bold text-gray-900">担当者</h2>
        <ul className="mt-3 divide-y">
          {company.companyUsers.map((u) => (
            <li key={u.id} className="py-2 text-sm">
              <p className="text-gray-900">{u.name ?? "(名前未設定)"}</p>
              <p className="text-gray-500">
                {u.email} · {u.role} ·{" "}
                {u.createdAt.toLocaleDateString("ja-JP")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
