import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  // Redirect unauthenticated users to login
  if ((isSeekerRoute || isCompanyRoute || isAdminRoute) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control via JWT payload
  // NextAuth v5 JWT is base64-encoded JSON with a "role" claim
  if (isLoggedIn && token) {
    const role = decodeRoleFromJwt(token)

    if (isCompanyRoute && role && role !== "company_admin" && role !== "company_member") {
      return NextResponse.redirect(new URL("/mypage", request.url))
    }

    if (isAdminRoute && role && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isSeekerRoute && role && (role === "company_admin" || role === "company_member")) {
      return NextResponse.redirect(new URL("/company/dashboard", request.url))
    }
  }

  return NextResponse.next()
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
  matcher: ["/mypage/:path*", "/company/:path*", "/admin/:path*"],
}
