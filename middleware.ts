import { NextResponse, NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // In development, do not enforce waitlist redirects to avoid auth disruptions
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next()
  }
  const { pathname, searchParams } = req.nextUrl
  
  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/waitlist") ||
    pathname.includes(".") // files like .ico, .png, etc
  ) {
    return NextResponse.next()
  }

  // Check for tester bypass
  const bypassParam = searchParams.get("bypass")
  const bypassCookie = req.cookies.get("tester-bypass")
  
  // If bypass parameter is provided, set a cookie and allow access
  if (bypassParam === "speakwise-tester") {
    const response = NextResponse.next()
    response.cookies.set("tester-bypass", "true", {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    })
    return response
  }

  // If user has bypass cookie, allow access
  if (bypassCookie?.value === "true") {
    return NextResponse.next()
  }

  // Redirect everything else to waitlist (production only)
  return NextResponse.redirect(new URL("/waitlist", req.url))
}

export const config = {
  matcher: ["/((?!_next|api|waitlist|.*\\.).*)"]
}