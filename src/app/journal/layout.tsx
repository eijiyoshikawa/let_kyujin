import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "マガジン",
    template: "%s | マガジン | 求人ポータル",
  },
  description:
    "ドライバー・建設・製造業で活躍する方に役立つ転職・キャリア情報をお届けするマガジンです。",
}

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
