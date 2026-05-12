import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/structured-data";
import { ensureSchema } from "@/lib/ensure-schema";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-noto-jp",
});

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ゲンバキャリア | 建設業界特化型求人サイト",
    template: "%s | ゲンバキャリア",
  },
  description:
    "建築・土木・設備・解体に特化した求人サイト。ハローワーク求人も掲載。株式会社LET運営。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ゲンバキャリア",
    title: "ゲンバキャリア | 建設業界特化型求人サイト",
    description: "建築・土木・設備・解体に特化した求人サイト。ハローワーク求人も掲載。",
    url: siteUrl,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ゲンバキャリア",
    description: "建築・土木・設備・解体に特化した求人サイト",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? undefined,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 起動時に追加カラム（rank_score / Company SNS など）を冪等に追加。
  // 本番 DB が `prisma db push` 未反映でも 500 を防ぐためのセルフヒーリング。
  await ensureSchema()

  // サイト全体に効く Organization + WebSite の構造化データ。
  // Google 検索結果のサイトリンクや「サイト内検索」表示の元となる。
  const orgSchema = generateOrganizationSchema()
  const siteSchema = generateWebSiteSchema()

  return (
    <html lang="ja" className={`h-full antialiased ${notoSansJP.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-white">
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
