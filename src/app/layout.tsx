import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/analytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://genbacareer.jp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ゲンバキャリア | ノンデスク産業特化の求人サイト",
    template: "%s | ゲンバキャリア",
  },
  description:
    "建築・土木・設備・解体に特化した求人サイト。ハローワーク求人も掲載。株式会社LET運営。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "ゲンバキャリア",
    title: "ゲンバキャリア | ノンデスク産業特化の求人サイト",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-warm-50">
        <GoogleAnalytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
