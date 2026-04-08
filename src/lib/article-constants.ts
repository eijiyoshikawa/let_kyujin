export const ARTICLE_CATEGORIES = {
  driver: { label: "ドライバー", color: "bg-blue-100 text-blue-700" },
  construction: { label: "建設・土木", color: "bg-orange-100 text-orange-700" },
  manufacturing: { label: "製造・工場", color: "bg-green-100 text-green-700" },
  career: { label: "キャリア", color: "bg-purple-100 text-purple-700" },
  general: { label: "お役立ち", color: "bg-gray-100 text-gray-700" },
} as const

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES
