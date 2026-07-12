import { NextResponse, NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true"
  const isMaintenance = req.nextUrl.pathname === "/maintenance"

  if (maintenanceMode && !isMaintenance) {
    return NextResponse.redirect(new URL("/maintenance", req.url))
  }
  if (!maintenanceMode && isMaintenance) {
    return NextResponse.redirect(new URL("/", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|api|.*\\.).*)"  ]
}