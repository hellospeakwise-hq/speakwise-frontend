import { NextResponse, NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  // Middleware disabled for public launch - all routes accessible
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.).*)"]
}