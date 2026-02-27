import { NextRequest, NextResponse } from "next/server"

const PROTECTED_PREFIXES = ["/dashboard", "/appointments"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const session = req.cookies.get("session")?.value

  // sem sessão => manda para login
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/appointments/:path*"],
}