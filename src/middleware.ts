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
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based checks are handled at page/API level (server components)
  // since we can't decode JWT without the full NextAuth library
  return NextResponse.next()
}

export const config = {
  matcher: ["/mypage/:path*", "/company/:path*", "/admin/:path*"],
}
