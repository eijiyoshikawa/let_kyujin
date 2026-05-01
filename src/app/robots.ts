import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/mypage/", "/company/", "/admin/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
