/**
 * メール送信ヘルパー
 *
 * 本番環境では SendGrid API を使用。
 * 開発環境では console.log にフォールバック。
 */

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.SENDGRID_API_KEY

  if (!apiKey) {
    // Development fallback
    console.log(`[email] To: ${to}`)
    console.log(`[email] Subject: ${subject}`)
    console.log(`[email] Body: ${html}`)
    return { success: true, dev: true }
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: {
        email: process.env.EMAIL_FROM ?? "noreply@genbacareer.jp",
        name: "ゲンバキャリア",
      },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`[email] SendGrid error: ${error}`)
    throw new Error(`Failed to send email: ${response.status}`)
  }

  return { success: true }
}

/** メール確認メール送信（求職者サインアップ時） */
export async function sendEmailVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`

  await sendEmail({
    to: email,
    subject: "メールアドレスのご確認 — ゲンバキャリア",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ゲンバキャリアへのご登録ありがとうございます</h2>
        <p>以下のリンクからメールアドレスの確認を完了してください。</p>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            メールアドレスを確認する
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          このリンクは24時間有効です。<br>
          確認が完了するまで、求人への応募ができませんのでご注意ください。<br>
          心当たりがない場合はこのメールを無視してください。
        </p>
      </div>
    `,
  })
}

/** 応募通知メール送信（企業向け） */
export async function sendApplicationNotificationEmail(
  toEmail: string,
  jobTitle: string,
  applicantName: string,
  applicationId: string
) {
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const detailUrl = `${baseUrl}/company/applications/${applicationId}`

  await sendEmail({
    to: toEmail,
    subject: `新着応募: ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>新しい応募が届きました</h2>
        <p><strong>${jobTitle}</strong> に <strong>${applicantName}</strong> さんから応募がありました。</p>
        <p>
          <a href="${detailUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            応募内容を確認する
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">ゲンバキャリア</p>
      </div>
    `,
  })
}

/** パスワードリセットメール送信 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: "パスワードリセットのご案内 — ゲンバキャリア",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>パスワードリセット</h2>
        <p>以下のリンクからパスワードをリセットしてください。</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            パスワードをリセットする
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          このリンクは1時間有効です。心当たりがない場合はこのメールを無視してください。
        </p>
      </div>
    `,
  })
}

/** 応募完了通知メール送信（求職者向け） */
export async function sendApplicationConfirmEmail(
  email: string,
  jobTitle: string,
  companyName: string
) {
  await sendEmail({
    to: email,
    subject: `応募が完了しました — ${jobTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>応募が完了しました</h2>
        <p><strong>${companyName}</strong> の <strong>${jobTitle}</strong> に応募が完了しました。</p>
        <p>企業からの返信をお待ちください。</p>
        <p style="color: #6b7280; font-size: 14px;">ゲンバキャリア</p>
      </div>
    `,
  })
}

/** スカウト通知メール送信（求職者向け） */
export async function sendScoutNotificationEmail(
  email: string,
  companyName: string
) {
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  await sendEmail({
    to: email,
    subject: `${companyName} からスカウトが届きました`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>スカウトが届きました</h2>
        <p><strong>${companyName}</strong> からスカウトメッセージが届いています。</p>
        <p>
          <a href="${baseUrl}/mypage/scouts" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            スカウトを確認する
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">ゲンバキャリア</p>
      </div>
    `,
  })
}

const ADMIN_NOTIFY_EMAIL = "info@let-inc.net"

/** 企業登録時の welcome メール（企業担当者宛・status=pending の旨を案内） */
export async function sendCompanyRegistrationEmail(
  email: string,
  companyName: string
) {
  await sendEmail({
    to: email,
    subject: "ご登録ありがとうございます — ゲンバキャリア",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${escapeHtml(companyName)} 様</h2>
        <p>ゲンバキャリアへのご登録ありがとうございます。</p>
        <p>
          現在、運営による登録内容の確認を行っております。<br>
          通常 <strong>1〜2 営業日</strong> 以内に承認が完了し、求人投稿・スカウト送信がご利用いただけるようになります。
        </p>
        <p>承認が完了した時点で、別途通知メールをお送りいたします。</p>
        <p style="color: #6b7280; font-size: 14px;">
          ご不明点がございましたら <a href="mailto:info@let-inc.net">info@let-inc.net</a> までご連絡ください。<br>
          ゲンバキャリア
        </p>
      </div>
    `,
  })
}

/** 企業登録時の管理者通知メール（info@let-inc.net 宛） */
export async function sendCompanyRegistrationAdminNotification(args: {
  companyId: string
  companyName: string
  industry: string
  prefecture: string
  contactEmail: string
}) {
  const baseUrl =
    process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const reviewUrl = `${baseUrl}/admin/companies/${args.companyId}`

  await sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `[ゲンバキャリア] 新規企業登録: ${args.companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>新規企業登録</h2>
        <p>承認待ちの企業登録が届きました。</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb; width: 120px;">会社名</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(args.companyName)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;">業種</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(args.industry)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;">都道府県</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(args.prefecture)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb;">担当メール</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(args.contactEmail)}</td></tr>
        </table>
        <p style="margin-top: 16px;">
          <a href="${reviewUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            管理画面で確認する
          </a>
        </p>
      </div>
    `,
  })
}

/** 企業承認完了の通知メール（企業担当者宛） */
export async function sendCompanyApprovalEmail(
  email: string,
  companyName: string
) {
  const baseUrl =
    process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  await sendEmail({
    to: email,
    subject: "ご登録が承認されました — ゲンバキャリア",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${escapeHtml(companyName)} 様</h2>
        <p>ゲンバキャリアへのご登録が承認されました。</p>
        <p>求人投稿・スカウト送信などのすべての機能をご利用いただけます。</p>
        <p>
          <a href="${baseUrl}/company/jobs/new" style="display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px;">
            求人を投稿する
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">ゲンバキャリア</p>
      </div>
    `,
  })
}

/** 企業承認却下の通知メール（企業担当者宛） */
export async function sendCompanyRejectionEmail(
  email: string,
  companyName: string,
  reason?: string | null
) {
  await sendEmail({
    to: email,
    subject: "ご登録についてのお知らせ — ゲンバキャリア",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${escapeHtml(companyName)} 様</h2>
        <p>恐れ入りますが、頂戴したご登録内容では本サービスをご利用いただくことができませんでした。</p>
        ${reason ? `<p><strong>理由:</strong> ${escapeHtml(reason)}</p>` : ""}
        <p>詳細につきましては <a href="mailto:info@let-inc.net">info@let-inc.net</a> までお問い合わせください。</p>
        <p style="color: #6b7280; font-size: 14px;">ゲンバキャリア</p>
      </div>
    `,
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
