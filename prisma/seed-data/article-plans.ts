// 200記事の企画構成マスターリスト
// カテゴリ: career(転職), salary(年収), license(資格), job-type(職種), industry(業界), interview(体験談)
// 2026/1/1〜毎日1記事投稿

export interface ArticlePlan {
  slug: string
  title: string
  category: string
  tags: string[]
  excerpt: string
}

export const articlePlans: ArticlePlan[] = [
  // === 1月: 建設業界の基本と転職準備 ===
  { slug: "construction-industry-overview-2026", title: "建設業界の現状と将来性 — 2026年版", category: "industry", tags: ["業界動向","市場規模"], excerpt: "国内建設市場の規模推移と今後の見通しを解説。人手不足の実態とICT化の進展を踏まえた業界の将来性を分析します。" },
  { slug: "construction-job-types-guide", title: "建設業界の職種一覧 — 仕事内容・必要資格・年収まとめ", category: "job-type", tags: ["職種一覧","未経験"], excerpt: "建築・土木・設備・内装・解体など建設業界の主要職種を網羅。それぞれの仕事内容・必要資格・年収相場を紹介。" },
  { slug: "construction-career-change-first-step", title: "未経験から建設業界へ — 転職の最初の一歩", category: "career", tags: ["未経験","転職"], excerpt: "異業種から建設業界へ転職するためのステップを解説。求人の探し方から面接対策まで。" },
  { slug: "tobishoku-work-guide", title: "鳶職人の仕事内容 — 種類・1日の流れ・やりがい", category: "job-type", tags: ["鳶職","職種解説"], excerpt: "足場鳶・鉄骨鳶・重量鳶の違い、1日のスケジュール、仕事のやりがいと厳しさを現場目線で紹介。" },
  { slug: "construction-worker-salary-data", title: "建設作業員の平均年収は？職種別・年齢別データ", category: "salary", tags: ["年収","統計"], excerpt: "厚生労働省のデータをもとに建設作業員の平均年収を職種別・年齢別に分析。収入を上げるポイントも解説。" },
  { slug: "second-class-construction-management", title: "2級建築施工管理技士とは — 受験資格・試験内容・勉強法", category: "license", tags: ["施工管理技士","資格"], excerpt: "2級建築施工管理技士の受験資格、試験科目、合格率、おすすめの勉強方法を徹底解説。" },
  { slug: "type2-electrician-guide", title: "第二種電気工事士の取得ガイド — 筆記・実技の攻略法", category: "license", tags: ["電気工事士","国家資格"], excerpt: "第二種電気工事士の試験概要から効率的な勉強法、実技試験のコツまでを解説。" },
  { slug: "construction-resume-tips", title: "建設業界向け履歴書の書き方 — 採用担当が見るポイント", category: "career", tags: ["履歴書","面接対策"], excerpt: "建設会社の採用担当が重視する履歴書のポイント。職歴の書き方や資格欄の記載方法を具体例つきで解説。" },
  { slug: "civil-engineering-worker-guide", title: "土木作業員の仕事内容と1日の流れ", category: "job-type", tags: ["土木","職種解説"], excerpt: "道路・橋梁・トンネルなど土木工事の現場で働く作業員の仕事内容を詳しく紹介。" },
  { slug: "construction-interview-questions", title: "建設会社の面接でよく聞かれる質問と回答例", category: "career", tags: ["面接","転職"], excerpt: "建設業界特有の面接質問と好印象を与える回答例を紹介。体力面や安全意識に関する質問への対策も。" },
  { slug: "tamakake-license-guide", title: "玉掛け技能講習の取り方 — 費用・日数・試験内容", category: "license", tags: ["玉掛け","技能講習"], excerpt: "クレーン作業に必須の玉掛け技能講習。申込みから修了までの流れ、費用、試験内容を解説。" },
  { slug: "construction-work-clothes", title: "建設現場の作業着・装備ガイド — 必須アイテム一覧", category: "industry", tags: ["装備","安全"], excerpt: "ヘルメット・安全帯・作業靴など建設現場で必要な装備品を紹介。選び方のポイントと費用の目安。" },
  { slug: "sekokan-vs-genba-worker", title: "施工管理と現場作業員の違い — 仕事内容・年収・キャリア", category: "job-type", tags: ["施工管理","比較"], excerpt: "施工管理技士と現場作業員の役割の違い、年収差、キャリアパスを比較。どちらが自分に合うか判断する材料に。" },
  { slug: "construction-salary-up-methods", title: "建設業で年収を上げる5つの方法", category: "salary", tags: ["年収アップ","キャリア"], excerpt: "資格取得・転職・独立など、建設業界で収入を上げるための具体的な5つの方法を紹介。" },
  { slug: "ashiba-license-guide", title: "足場の組立て等作業主任者とは — 取得方法と役割", category: "license", tags: ["足場","資格"], excerpt: "足場の組立て等作業主任者の技能講習の概要、受講資格、現場での役割を解説。" },
  { slug: "construction-safety-basics", title: "建設現場の安全対策 — 新人が知っておくべき基本", category: "industry", tags: ["安全","新人向け"], excerpt: "KY活動・保護具の使い方・高所作業の注意点など、新人作業員が知っておくべき安全の基本。" },
  { slug: "interview-tobi-career", title: "飲食業から鳶職人へ — 転職3年目のリアル", category: "interview", tags: ["鳶職","転職体験"], excerpt: "飲食店から鳶職に転職した32歳男性のリアルな体験談。きっかけ、苦労した点、現在の年収を語ります。" },
  { slug: "heavy-equipment-operator-guide", title: "重機オペレーターの仕事内容 — 必要な免許と年収", category: "job-type", tags: ["重機","オペレーター"], excerpt: "バックホウ・ブルドーザーなど重機オペレーターの仕事内容、必要な免許、年収相場を解説。" },
  { slug: "construction-bonus-reality", title: "建設業界のボーナス事情 — 支給額と時期", category: "salary", tags: ["ボーナス","待遇"], excerpt: "建設会社のボーナスはいくら？大手ゼネコンから中小企業まで、支給額の実態と時期を調査。" },
  { slug: "first-class-construction-management", title: "1級建築施工管理技士の難易度と勉強法", category: "license", tags: ["施工管理技士","1級"], excerpt: "1級建築施工管理技士の合格率・難易度・必要な勉強時間、おすすめの参考書を紹介。" },
  { slug: "construction-women-guide", title: "建設業界で働く女性 — 職種・環境・キャリアパス", category: "industry", tags: ["女性","ダイバーシティ"], excerpt: "建設現場で活躍する女性が増加中。女性が活躍できる職種や職場環境の実態を紹介。" },
  { slug: "construction-overtime-reality", title: "建設業界の残業時間 — 2024年規制後の変化", category: "industry", tags: ["残業","働き方改革"], excerpt: "2024年の残業上限規制後、建設業界の働き方はどう変わったか。現場のリアルな声を紹介。" },
  { slug: "plumber-work-guide", title: "配管工の仕事内容と将来性 — 水道・ガス・空調", category: "job-type", tags: ["配管工","職種解説"], excerpt: "配管工の種類（水道・ガス・空調）ごとの仕事内容、必要な資格、年収、将来性を解説。" },
  { slug: "construction-age-limit", title: "建設業は何歳まで働ける？年齢別のキャリア設計", category: "career", tags: ["年齢","キャリア"], excerpt: "20代・30代・40代・50代それぞれの建設業界でのキャリア設計と、体力面での対策を解説。" },
  { slug: "vehicle-construction-machine-license", title: "車両系建設機械の運転資格 — 種類と取得方法", category: "license", tags: ["重機","資格"], excerpt: "車両系建設機械運転技能講習と特別教育の違い、対象機械、取得費用を解説。" },
  { slug: "construction-apprentice-salary", title: "建設業界の見習い期間 — 給与・期間・成長ステップ", category: "salary", tags: ["見習い","新人"], excerpt: "建設業界での見習い期間の長さ、その間の給与水準、一人前になるまでの成長ステップを紹介。" },
  { slug: "interview-factory-to-electrician", title: "工場勤務から電気工事士へ — 資格で切り開いた転職", category: "interview", tags: ["電気工事士","転職体験"], excerpt: "工場作業員から電気工事士に転職した28歳男性の体験談。資格取得の経緯と現在の仕事について。" },
  { slug: "demolition-work-guide", title: "解体工事の仕事内容 — 需要拡大中の注目職種", category: "job-type", tags: ["解体","職種解説"], excerpt: "老朽化建物の増加で需要が伸びる解体工事。仕事の流れ、必要な資格、年収を詳しく解説。" },
  { slug: "construction-health-check", title: "建設作業員の健康管理 — 体力維持と怪我の予防", category: "industry", tags: ["健康","安全"], excerpt: "建設現場で長く働くための体力づくり、腰痛予防、熱中症対策など健康管理のポイント。" },
  { slug: "sekokan-salary-data-2026", title: "施工管理技士の年収データ — 1級と2級の差は？", category: "salary", tags: ["施工管理","年収"], excerpt: "施工管理技士の年収を1級・2級、建築・土木別に比較。年収を上げるためのキャリアパスも紹介。" },
  { slug: "construction-career-path-map", title: "建設業界のキャリアパス全体像 — 10年後の自分を描く", category: "career", tags: ["キャリア","将来設計"], excerpt: "作業員→職長→施工管理→独立。建設業界でのキャリアパスの全体像と、各ステージで必要なスキル・資格。" },

  // === 2月: 資格特集月間 ===
  { slug: "crane-operator-license", title: "クレーン運転士の資格取得ガイド — 種類と費用", category: "license", tags: ["クレーン","資格"], excerpt: "移動式クレーン・小型移動式クレーンなど、クレーン関連の資格の種類と取得方法を解説。" },
  { slug: "first-class-civil-management", title: "1級土木施工管理技士の攻略法 — 合格者の勉強法", category: "license", tags: ["土木","施工管理技士"], excerpt: "1級土木施工管理技士の試験概要と合格した人の具体的な勉強スケジュール・使用教材を紹介。" },
  { slug: "architecture-license-comparison", title: "建築士と施工管理技士の違い — どちらを目指すべきか", category: "license", tags: ["建築士","比較"], excerpt: "建築士と施工管理技士の役割・受験資格・年収の違いを比較。自分に合ったキャリアの選び方。" },
  { slug: "interior-finishing-jobs", title: "内装仕上げ工事の職種 — クロス・床・塗装の仕事と年収", category: "job-type", tags: ["内装","職種解説"], excerpt: "クロス職人・床仕上げ・塗装工の仕事内容と年収を比較。未経験から始める方法も紹介。" },
  { slug: "construction-holidays-reality", title: "建設業界の休日事情 — 週休2日は本当に増えた？", category: "industry", tags: ["休日","働き方"], excerpt: "4週8休推進の現状。実際の現場ではどの程度休めるのか、企業規模別のデータを紹介。" },
  { slug: "welding-license-guide", title: "溶接の資格一覧 — アーク溶接からJIS資格まで", category: "license", tags: ["溶接","資格"], excerpt: "アーク溶接特別教育、ガス溶接技能講習、JIS溶接技能者など溶接関連の資格を網羅解説。" },
  { slug: "construction-job-search-tips", title: "建設業界の求人の探し方 — 専門サイトの活用法", category: "career", tags: ["求人","転職"], excerpt: "ハローワーク・専門求人サイト・知人紹介。建設業界での求人の探し方と各方法のメリット・デメリット。" },
  { slug: "rebar-worker-guide", title: "鉄筋工の仕事と年収 — 需要の高い専門職", category: "job-type", tags: ["鉄筋","職種解説"], excerpt: "鉄筋工の仕事内容、必要な資格（鉄筋施工技能士）、年収の推移を現場経験者の視点で解説。" },
  { slug: "construction-retirement-age", title: "建設業界の定年と退職金 — 老後の備え", category: "salary", tags: ["退職金","定年"], excerpt: "建設会社の定年年齢、退職金の相場、再雇用制度の実態を大手から中小まで調査。" },
  { slug: "oxygen-deficiency-license", title: "酸欠作業主任者の資格 — 取得方法と現場での重要性", category: "license", tags: ["酸欠","安全資格"], excerpt: "酸素欠乏・硫化水素危険作業主任者の技能講習。どんな現場で必要か、取得の流れを解説。" },
  { slug: "interview-sales-to-sekokan", title: "営業職から施工管理へ — コミュニケーション力が活きた転職", category: "interview", tags: ["施工管理","転職体験"], excerpt: "営業職から施工管理技士に転職した35歳の体験談。前職のスキルがどう活きたかを語る。" },
  { slug: "construction-company-size-comparison", title: "大手ゼネコンと中小建設会社の違い — 給与・環境・成長", category: "industry", tags: ["企業規模","比較"], excerpt: "大手と中小の建設会社を年収・福利厚生・仕事内容・成長速度で比較。自分に合う規模は？" },
  { slug: "forklift-license-guide", title: "フォークリフト運転技能講習 — 取得の流れと活用場面", category: "license", tags: ["フォークリフト","資格"], excerpt: "フォークリフト運転技能講習の受講資格、費用、日数。建設現場での活用場面を紹介。" },
  { slug: "painting-work-guide", title: "塗装工の仕事内容 — 建築塗装と土木塗装の違い", category: "job-type", tags: ["塗装","職種解説"], excerpt: "建築塗装と土木塗装（橋梁等）の違い、仕事の流れ、年収、独立の可能性を解説。" },
  { slug: "construction-social-insurance", title: "建設業界の社会保険 — 加入義務と確認ポイント", category: "industry", tags: ["社会保険","労働環境"], excerpt: "建設業界での社会保険加入の義務化。入社前に確認すべきポイントと一人親方の保険事情。" },
  { slug: "surveyor-license-guide", title: "測量士・測量士補の資格 — 取得方法と年収", category: "license", tags: ["測量","資格"], excerpt: "測量士と測量士補の違い、試験の概要、取得後のキャリアと年収の目安を解説。" },
  { slug: "construction-apprenticeship-reality", title: "建設業界の徒弟制度は今も残る？ — 教育体制の変化", category: "industry", tags: ["教育","人材育成"], excerpt: "かつての徒弟制度から現代の教育体制へ。建設業界の人材育成方法の変遷と現状。" },
  { slug: "construction-salary-by-region", title: "建設業界の年収 — 地域別ランキング", category: "salary", tags: ["年収","地域差"], excerpt: "東京・大阪・名古屋など主要都市と地方の建設作業員の年収差をデータで比較。" },

  // === 3月: 転職シーズン特集 ===
  { slug: "construction-spring-recruitment", title: "建設業界の春採用 — 4月入社に向けた転職活動の進め方", category: "career", tags: ["春採用","転職"], excerpt: "4月入社を目指す建設業界の転職スケジュール。3月からでも間に合う求人の探し方。" },
  { slug: "second-class-civil-management", title: "2級土木施工管理技士の受験対策まとめ", category: "license", tags: ["土木","施工管理技士"], excerpt: "2級土木施工管理技士の受験資格、試験内容、過去問の活用法をまとめて解説。" },
  { slug: "carpenter-work-guide", title: "大工の仕事内容 — 伝統技術とこれからの需要", category: "job-type", tags: ["大工","職種解説"], excerpt: "大工の種類（造作大工・型枠大工等）、仕事内容、年収、木造住宅の需要見通しを解説。" },
  { slug: "construction-vacation-tips", title: "建設業界で有給を取るコツ — 現場の暗黙ルール", category: "industry", tags: ["有給","働き方"], excerpt: "建設現場で有給休暇を取りやすくするためのポイント。閑散期の活用や事前調整の方法。" },
  { slug: "construction-night-work", title: "建設業の夜勤 — 手当・体調管理・対象工事", category: "salary", tags: ["夜勤","手当"], excerpt: "夜間工事の種類、夜勤手当の相場、体調管理のコツを現場経験者が解説。" },
  { slug: "scaffold-work-guide", title: "足場職人の仕事と資格 — 年収と将来性", category: "job-type", tags: ["足場","職種解説"], excerpt: "足場の組立て解体作業の仕事内容、必要な資格、年収相場、需要の見通しを紹介。" },
  { slug: "construction-mental-health", title: "建設現場のメンタルヘルス — ストレス対策と相談窓口", category: "industry", tags: ["メンタルヘルス","健康"], excerpt: "建設業界特有のストレス要因と、メンタルヘルスケアの方法、利用できる相談窓口を紹介。" },
  { slug: "type1-electrician-guide", title: "第一種電気工事士の難易度と年収アップ効果", category: "license", tags: ["電気工事士","1種"], excerpt: "第一種電気工事士の試験概要、合格率、取得後の年収変化。第二種との実務範囲の違いも解説。" },
  { slug: "interview-driver-to-dokata", title: "トラック運転手から土木作業員へ — 40代の転職記", category: "interview", tags: ["土木","転職体験"], excerpt: "長距離ドライバーから土木作業員に転職した42歳の体験談。体力面の不安と克服の過程。" },
  { slug: "construction-tool-basics", title: "建設現場の基本工具 — 新人が最初に覚えるべき道具", category: "industry", tags: ["工具","新人向け"], excerpt: "インパクトドライバー・水平器・差し金など、建設現場で最初に覚えるべき基本工具を写真付きで紹介。" },
  { slug: "left-hand-worker-guide", title: "左官工の仕事内容と年収 — 手に職をつける伝統技術", category: "job-type", tags: ["左官","職種解説"], excerpt: "左官工の仕事内容、技術の習得に必要な期間、年収相場、独立の可能性を解説。" },
  { slug: "construction-commute-tips", title: "建設現場への通勤事情 — 直行直帰と集合場所", category: "industry", tags: ["通勤","働き方"], excerpt: "建設現場への通勤方法。直行直帰のルール、車通勤の可否、集合場所からの移動について。" },
]
