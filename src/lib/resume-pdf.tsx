import React from "react"
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// Noto Sans JP from Google Fonts CDN for Japanese support
Font.register({
  family: "NotoSansJP",
  fonts: [
    { src: "https://fonts.gstatic.com/s/notosansjp/v53/rpDpOq0I3MubRhqTCqN7gcmWDmFgcy2o.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/notosansjp/v53/rpDpOq0I3MubRhqTCqN7gcmWDg1icy2o.ttf", fontWeight: 700 },
  ],
})

const s = StyleSheet.create({
  page: { padding: 30, fontFamily: "NotoSansJP", fontSize: 9, color: "#1f2937" },
  title: { fontSize: 16, fontWeight: 700, textAlign: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 700, borderBottom: "1 solid #2563eb", paddingBottom: 3, marginBottom: 8, marginTop: 14, color: "#1e40af" },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 80, fontWeight: 700, color: "#6b7280" },
  value: { flex: 1 },
  historyRow: { flexDirection: "row", marginBottom: 2 },
  historyDate: { width: 60, color: "#6b7280" },
  historyContent: { flex: 1 },
  careerBlock: { marginBottom: 10, padding: 6, backgroundColor: "#f9fafb", borderRadius: 3 },
  careerCompany: { fontSize: 10, fontWeight: 700 },
  careerPeriod: { fontSize: 8, color: "#6b7280", marginBottom: 3 },
  careerDesc: { fontSize: 8, lineHeight: 1.5 },
  tag: { backgroundColor: "#dbeafe", color: "#1e40af", padding: "2 6", borderRadius: 2, fontSize: 7, marginRight: 4, marginBottom: 3 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  footer: { position: "absolute", bottom: 20, left: 30, right: 30, textAlign: "center", fontSize: 7, color: "#9ca3af" },
})

type HistoryEntry = { year: string; month: string; content: string }
type LicenseEntry = { year: string; month: string; name: string }
type CareerEntry = { company: string; period: string; position: string; description: string }

interface ResumeRecord {
  fullName: string | null
  furigana: string | null
  birthDate: Date | null
  gender: string | null
  postalCode: string | null
  address: string | null
  phone: string | null
  email: string | null
  educationHistory: unknown
  workHistory: unknown
  licenses: unknown
  motivation: string | null
  selfPr: string | null
  careerSummary: string | null
  careerDetails: unknown
  skills: string[]
  qualifications: string[]
}

export function ResumePdfDocument({ resume }: { resume: ResumeRecord }) {
  const edu = (resume.educationHistory as HistoryEntry[] | null) ?? []
  const work = (resume.workHistory as HistoryEntry[] | null) ?? []
  const licenses = (resume.licenses as LicenseEntry[] | null) ?? []
  const career = (resume.careerDetails as CareerEntry[] | null) ?? []

  return (
    <Document>
      {/* Page 1: 履歴書 */}
      <Page size="A4" style={s.page}>
        <Text style={s.title}>履 歴 書</Text>

        <View style={s.row}><Text style={s.label}>氏名</Text><Text style={s.value}>{resume.fullName ?? ""}</Text></View>
        <View style={s.row}><Text style={s.label}>ふりがな</Text><Text style={s.value}>{resume.furigana ?? ""}</Text></View>
        <View style={s.row}>
          <Text style={s.label}>生年月日</Text>
          <Text style={s.value}>{resume.birthDate ? new Date(resume.birthDate).toLocaleDateString("ja-JP") : ""}</Text>
        </View>
        <View style={s.row}><Text style={s.label}>性別</Text><Text style={s.value}>{genderLabel(resume.gender)}</Text></View>
        <View style={s.row}><Text style={s.label}>住所</Text><Text style={s.value}>{[resume.postalCode ? `〒${resume.postalCode}` : "", resume.address].filter(Boolean).join(" ")}</Text></View>
        <View style={s.row}><Text style={s.label}>電話</Text><Text style={s.value}>{resume.phone ?? ""}</Text></View>
        <View style={s.row}><Text style={s.label}>メール</Text><Text style={s.value}>{resume.email ?? ""}</Text></View>

        {edu.length > 0 && (
          <>
            <Text style={s.sectionTitle}>学歴</Text>
            {edu.map((e, i) => (
              <View key={i} style={s.historyRow}>
                <Text style={s.historyDate}>{e.year && e.month ? `${e.year}年${e.month}月` : ""}</Text>
                <Text style={s.historyContent}>{e.content}</Text>
              </View>
            ))}
          </>
        )}

        {work.length > 0 && (
          <>
            <Text style={s.sectionTitle}>職歴</Text>
            {work.map((w, i) => (
              <View key={i} style={s.historyRow}>
                <Text style={s.historyDate}>{w.year && w.month ? `${w.year}年${w.month}月` : ""}</Text>
                <Text style={s.historyContent}>{w.content}</Text>
              </View>
            ))}
          </>
        )}

        {licenses.length > 0 && (
          <>
            <Text style={s.sectionTitle}>免許・資格</Text>
            {licenses.map((l, i) => (
              <View key={i} style={s.historyRow}>
                <Text style={s.historyDate}>{l.year && l.month ? `${l.year}年${l.month}月` : ""}</Text>
                <Text style={s.historyContent}>{l.name}</Text>
              </View>
            ))}
          </>
        )}

        {resume.motivation && (
          <>
            <Text style={s.sectionTitle}>志望動機</Text>
            <Text style={{ lineHeight: 1.6 }}>{resume.motivation}</Text>
          </>
        )}

        {resume.selfPr && (
          <>
            <Text style={s.sectionTitle}>自己PR</Text>
            <Text style={{ lineHeight: 1.6 }}>{resume.selfPr}</Text>
          </>
        )}

        <Text style={s.footer}>建設求人ポータル — 履歴書</Text>
      </Page>

      {/* Page 2: 職務経歴書 (only if data exists) */}
      {(resume.careerSummary || career.length > 0 || resume.skills.length > 0) && (
        <Page size="A4" style={s.page}>
          <Text style={s.title}>職 務 経 歴 書</Text>

          {resume.careerSummary && (
            <>
              <Text style={s.sectionTitle}>職務要約</Text>
              <Text style={{ lineHeight: 1.6 }}>{resume.careerSummary}</Text>
            </>
          )}

          {career.length > 0 && (
            <>
              <Text style={s.sectionTitle}>職務経歴</Text>
              {career.map((c, i) => (
                <View key={i} style={s.careerBlock}>
                  <Text style={s.careerCompany}>{c.company}{c.position ? ` — ${c.position}` : ""}</Text>
                  <Text style={s.careerPeriod}>{c.period}</Text>
                  <Text style={s.careerDesc}>{c.description}</Text>
                </View>
              ))}
            </>
          )}

          {resume.skills.length > 0 && (
            <>
              <Text style={s.sectionTitle}>保有スキル</Text>
              <View style={s.tagRow}>
                {resume.skills.map((sk) => <Text key={sk} style={s.tag}>{sk}</Text>)}
              </View>
            </>
          )}

          {resume.qualifications.length > 0 && (
            <>
              <Text style={s.sectionTitle}>保有資格</Text>
              <View style={s.tagRow}>
                {resume.qualifications.map((q) => <Text key={q} style={s.tag}>{q}</Text>)}
              </View>
            </>
          )}

          <Text style={s.footer}>建設求人ポータル — 職務経歴書</Text>
        </Page>
      )}
    </Document>
  )
}

function genderLabel(gender: string | null): string {
  if (gender === "male") return "男性"
  if (gender === "female") return "女性"
  if (gender === "other") return "その他"
  return ""
}
