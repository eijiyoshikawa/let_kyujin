"use client"

import { Building2 } from "lucide-react"

const COMPANIES = [
  "株式会社山田建設",
  "大和土木株式会社",
  "東京電気設備工業",
  "関西総合建設",
  "北陸舗装株式会社",
  "株式会社九州解体",
  "中部内装工業",
  "東北管工事株式会社",
  "株式会社太陽測量",
  "首都圏施工管理",
  "四国建機レンタル",
  "株式会社北海道建設",
]

export function LogoSlider() {
  // Duplicate the list for seamless infinite scroll
  const items = [...COMPANIES, ...COMPANIES]

  return (
    <div className="bg-white border-y py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-3">
          掲載企業
        </p>
      </div>
      <div className="logo-slider">
        <div className="logo-slider-track">
          {items.map((company, i) => (
            <div
              key={`${company}-${i}`}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-gray-50 px-5 py-2.5"
            >
              <Building2 className="h-5 w-5 text-blue-400" />
              <span className="whitespace-nowrap text-sm font-medium text-gray-600">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
