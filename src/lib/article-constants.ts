// ========================================
// 記事カテゴリ（大分類）
// ========================================
export const ARTICLE_CATEGORIES = {
  driver: { label: "ドライバー", color: "bg-blue-100 text-blue-700" },
  construction: { label: "建設・土木", color: "bg-orange-100 text-orange-700" },
  manufacturing: { label: "製造・工場", color: "bg-green-100 text-green-700" },
  career: { label: "キャリア", color: "bg-purple-100 text-purple-700" },
  general: { label: "お役立ち", color: "bg-gray-100 text-gray-700" },
} as const

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES

// ========================================
// 建設業サブカテゴリ
// ========================================
export const CONSTRUCTION_SUBCATEGORIES = {
  civil: { label: "土木", color: "bg-amber-100 text-amber-700" },
  building: { label: "建築", color: "bg-orange-100 text-orange-700" },
  equipment: { label: "設備", color: "bg-cyan-100 text-cyan-700" },
  electrical: { label: "電気", color: "bg-yellow-100 text-yellow-700" },
  plumbing: { label: "管工事", color: "bg-teal-100 text-teal-700" },
  demolition: { label: "解体", color: "bg-red-100 text-red-700" },
  interior: { label: "内装", color: "bg-pink-100 text-pink-700" },
  exterior: { label: "外構・エクステリア", color: "bg-lime-100 text-lime-700" },
  reinforcing: { label: "鉄筋・鳶", color: "bg-stone-100 text-stone-700" },
  heavy_equipment: { label: "重機オペレーター", color: "bg-zinc-100 text-zinc-700" },
  surveying: { label: "測量", color: "bg-indigo-100 text-indigo-700" },
  safety: { label: "安全管理", color: "bg-rose-100 text-rose-700" },
  tips: { label: "転職・キャリアのコツ", color: "bg-violet-100 text-violet-700" },
} as const

export type ConstructionSubcategory = keyof typeof CONSTRUCTION_SUBCATEGORIES

// ========================================
// 建設業界タグ体系
// ========================================
export const CONSTRUCTION_TAGS = {
  // 資格・免許
  qualifications: [
    "1級土木施工管理技士",
    "2級土木施工管理技士",
    "1級建築施工管理技士",
    "2級建築施工管理技士",
    "1級電気工事施工管理技士",
    "2級電気工事施工管理技士",
    "1級管工事施工管理技士",
    "2級管工事施工管理技士",
    "1級建設機械施工管理技士",
    "2級建設機械施工管理技士",
    "建築士（一級）",
    "建築士（二級）",
    "宅地建物取引士",
    "測量士",
    "測量士補",
    "電気工事士（第一種）",
    "電気工事士（第二種）",
    "危険物取扱者",
    "玉掛け技能講習",
    "足場組立等作業主任者",
    "酸素欠乏危険作業主任者",
    "車両系建設機械運転技能講習",
    "フォークリフト運転技能講習",
    "解体工事施工技士",
  ],
  // 職種
  occupations: [
    "施工管理",
    "現場監督",
    "土木作業員",
    "建築作業員",
    "鳶職",
    "鉄筋工",
    "型枠大工",
    "左官",
    "塗装工",
    "電気工事士",
    "配管工",
    "溶接工",
    "重機オペレーター",
    "クレーンオペレーター",
    "測量士",
    "解体作業員",
    "内装工",
    "防水工",
    "外構工事",
    "CADオペレーター",
    "積算",
    "安全管理者",
  ],
  // トピック
  topics: [
    "年収・給料",
    "資格取得",
    "未経験",
    "転職",
    "面接対策",
    "履歴書・職務経歴書",
    "キャリアアップ",
    "独立・開業",
    "働き方改革",
    "安全衛生",
    "DX・ICT",
    "i-Construction",
    "人手不足",
    "労働環境",
    "福利厚生",
    "残業・休日",
    "将来性",
    "業界動向",
    "インボイス制度",
    "一人親方",
  ],
  // 地域
  regions: [
    "東京都",
    "神奈川県",
    "大阪府",
    "愛知県",
    "福岡県",
    "北海道",
    "関東",
    "関西",
    "東海",
    "九州",
    "全国",
  ],
} as const
