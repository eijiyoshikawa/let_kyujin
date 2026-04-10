import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GoogleAnalytics } from "@/components/analytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://let-kyujin.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "現場キャリア | 建設業界特化の求人サイト",
    template: "%s | 現場キャリア",
  },
  description:
    "建築・土木・設備・解体に特化した求人サイト。ハローワーク求人も掲載。株式会社LET運営。",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "現場キャリア",
    title: "現場キャリア | 建設業界特化の求人サイト",
    description: "建築・土木・設備・解体に特化した求人サイト。ハローワーク求人も掲載。",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "現場キャリア",
    description: "建築・土木・設備・解体に特化した求人サイト",
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
      <body className="min-h-full flex flex-col font-sans bg-gray-50">
        <GoogleAnalytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
