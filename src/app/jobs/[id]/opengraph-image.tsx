import { ImageResponse } from "next/og"
import { prisma } from "@/lib/db"
import { getCategoryLabel } from "@/lib/categories"

export const runtime = "edge"
export const alt = "求人詳細"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let title = "求人情報"
  let company = ""
  let category = ""
  let location = ""
  let salary = ""

  try {
    const job = await prisma.job.findUnique({
      where: { id },
      select: {
        title: true,
        category: true,
        prefecture: true,
        city: true,
        salaryMin: true,
        salaryMax: true,
        salaryType: true,
        employmentType: true,
        company: { select: { name: true } },
      },
    })

    if (job) {
      title = job.title
      company = job.company?.name ?? ""
      category = getCategoryLabel(job.category)
      location = `${job.prefecture}${job.city ? ` ${job.city}` : ""}`
      if (job.salaryMin) {
        const unit = job.salaryType === "hourly" ? "時給" : job.salaryType === "annual" ? "年収" : "月給"
        const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(0)}万` : `${n.toLocaleString()}`
        salary = job.salaryMax
          ? `${unit} ${fmt(job.salaryMin)}〜${fmt(job.salaryMax)}円`
          : `${unit} ${fmt(job.salaryMin)}円〜`
      }
    }
  } catch {
    // fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          position: "relative",
          padding: 60,
        }}
      >
        {/* Top badge */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 16px", fontSize: 18, color: "white" }}>
            {category}
          </div>
          {salary && (
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 16px", fontSize: 18, color: "rgba(255,255,255,0.9)" }}>
              {salary}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.3, marginBottom: 20, maxWidth: 1000 }}>
          {title.length > 40 ? `${title.slice(0, 40)}...` : title}
        </div>

        {/* Company & Location */}
        <div style={{ display: "flex", gap: 24, fontSize: 24, color: "rgba(255,255,255,0.8)" }}>
          {company && <span>{company}</span>}
          {location && <span>{location}</span>}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 60,
            right: 60,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
            建設求人ポータル
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
            建築・土木・設備・解体の求人サイト
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
