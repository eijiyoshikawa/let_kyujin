import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE_NAME = "gc_sid"
const SESSION_MAX_AGE = 365 * 24 * 60 * 60

/** UUID v4 を crypto から生成（Edge Runtime 互換） */
function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  // フォールバック（Edge ランタイムでは到達しない想定）
  const bytes = new Uint8Array(16)
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ============================================================
  // 1) 匿名トラッキング: gc_sid cookie 発行（未発行ユーザーのみ）
  //    閲覧 / クリック / lead を sessionId で串刺し集計するため。
  //    Server Component 側からは Cookie set できないので middleware で発行。
  // ============================================================
  let trackingSetCookie: { name: string; value: string } | null = null
  const existingSid = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!existingSid || !/^[a-f0-9-]{36}$/i.test(existingSid)) {
    const fresh = generateSessionId()
    // 同一リクエスト内で server component から読めるよう request にもセット
    request.cookies.set(SESSION_COOKIE_NAME, fresh)
    trackingSetCookie = { name: SESSION_COOKIE_NAME, value: fresh }
  }

  // Check for session token (NextAuth stores JWT in this cookie)
  const token =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value

  const isLoggedIn = !!token

  // 保護されたルート
  const seekerRoutes = ["/mypage"]
  const companyRoutes = [
    "/company/dashboard",
    "/company/jobs",
    "/company/applications",
    "/company/scouts",
    "/company/billing",
    "/company/candidates",
  ]
  const adminRoutes = ["/admin"]

  const isSeekerRoute = seekerRoutes.some((r) => pathname.startsWith(r))
  const isCompanyRoute = companyRoutes.some((r) => pathname.startsWith(r))
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r))

  /** すべての応答に gc_sid Cookie + 必要なら noindex ヘッダを乗せるヘルパー。 */
  function withTrackingCookie(res: NextResponse): NextResponse {
    if (trackingSetCookie) {
      res.cookies.set({
        name: trackingSetCookie.name,
        value: trackingSetCookie.value,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      })
    }
    // 認証必須エリア / プレビュー / API は検索エンジンインデックス対象外。
    // <meta name="robots"> より速く確実なので CDN レベルで X-Robots-Tag を出す。
    if (
      pathname.startsWith("/mypage") ||
      pathname.startsWith("/company") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/liff") ||
      pathname.includes("/preview/")
    ) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow")
    }
    return res
  }

  // Redirect unauthenticated users to login
  if ((isSeekerRoute || isCompanyRoute || isAdminRoute) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return withTrackingCookie(NextResponse.redirect(loginUrl))
  }

  // Role-based access control via JWT payload
  // NextAuth v5 JWT is base64-encoded JSON with a "role" claim
  if (isLoggedIn && token) {
    const role = decodeRoleFromJwt(token)

    if (isCompanyRoute && role && role !== "company_admin" && role !== "company_member") {
      return withTrackingCookie(NextResponse.redirect(new URL("/mypage", request.url)))
    }

    if (isAdminRoute && role && role !== "admin") {
      return withTrackingCookie(NextResponse.redirect(new URL("/", request.url)))
    }

    if (isSeekerRoute && role && (role === "company_admin" || role === "company_member")) {
      return withTrackingCookie(NextResponse.redirect(new URL("/company/dashboard", request.url)))
    }
  }

  return withTrackingCookie(NextResponse.next())
}

/**
 * NextAuth v5 JWTからroleクレームを抽出する。
 * JWTは暗号化(JWE)されているため、Edge Runtimeでは完全にデコードできない場合がある。
 * その場合はnullを返し、ページ/APIレベルでの検証にフォールバックする。
 */
function decodeRoleFromJwt(token: string): string | null {
  try {
    // NextAuth v5 uses encrypted JWE tokens by default.
    // Try to extract payload from unencrypted JWT (3-part dot-separated).
    const parts = token.split(".")
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      return payload.role ?? null
    }
    // Encrypted JWE token — cannot decode in middleware without the secret.
    // Fall back to page/API-level role checks.
    return null
  } catch {
    return null
  }
}

export const config = {
  // 認証チェック対象に加え、トラッキング Cookie 発行のため公開ページもマッチ。
  // _next/* / favicon / icon / api/auth / 静的ファイルは除外（静的アセットには Cookie 不要）。
  matcher: [
    "/((?!_next/|favicon|icon|apple-icon|opengraph-image|robots|sitemap|api/auth|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
}
